jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

import {
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserAccount } from '../../entities/user-account.entity';
import { Role } from '../../entities/role.entity';

describe('AuthService - Chức năng Đăng nhập theo Sequence Diagram', () => {
  let authService: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUsersService = {
      findByUsername: jest.fn(),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    };

    authService = new AuthService(
      mockUsersService as unknown as UsersService,
      mockJwtService,
    );
  });

  // Nhánh 2: Thông tin đăng nhập sai (không tồn tại user hoặc sai pass)
  describe('Nhánh: Thông tin đăng nhập sai', () => {
    it('Nên ném UnauthorizedException("Không xác thực được") khi tài khoản không tồn tại', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(
        authService.login({ username: 'nonexistent', password: '123' }),
      ).rejects.toThrow(new UnauthorizedException('Không xác thực được'));
    });

    it('Nên ném UnauthorizedException("Không xác thực được") khi sai mật khẩu', async () => {
      const hashed = await bcrypt.hash('correct_password', 10);
      const mockAccount = {
        userId: 1,
        username: 'testuser',
        passwordHash: hashed,
        status: 'ACTIVE',
        role: { roleId: 1, name: 'USER' } as Role,
      } as UserAccount;

      mockUsersService.findByUsername.mockResolvedValue(mockAccount);

      await expect(
        authService.login({ username: 'testuser', password: 'wrong_password' }),
      ).rejects.toThrow(new UnauthorizedException('Không xác thực được'));
    });
  });

  // Nhánh 3: Tài khoản không được phép truy cập (bị khóa hoặc không có vai trò hợp lệ)
  describe('Nhánh: Tài khoản không được phép truy cập', () => {
    it('Nên ném ForbiddenException("Từ chối đăng nhập") khi tài khoản bị khóa (LOCKED)', async () => {
      const hashed = await bcrypt.hash('123456', 10);
      const lockedAccount = {
        userId: 2,
        username: 'locked_user',
        passwordHash: hashed,
        status: 'LOCKED',
        role: { roleId: 2, name: 'USER' } as Role,
      } as UserAccount;

      mockUsersService.findByUsername.mockResolvedValue(lockedAccount);

      await expect(
        authService.login({ username: 'locked_user', password: '123456' }),
      ).rejects.toThrow(new ForbiddenException('Từ chối đăng nhập'));
    });

    it('Nên ném ForbiddenException("Từ chối đăng nhập") khi tài khoản chưa có vai trò', async () => {
      const hashed = await bcrypt.hash('123456', 10);
      const noRoleAccount = {
        userId: 3,
        username: 'norole_user',
        passwordHash: hashed,
        status: 'ACTIVE',
        role: undefined,
      } as unknown as UserAccount;

      mockUsersService.findByUsername.mockResolvedValue(noRoleAccount);

      await expect(
        authService.login({ username: 'norole_user', password: '123456' }),
      ).rejects.toThrow(new ForbiddenException('Từ chối đăng nhập'));
    });
  });

  // Nhánh 4: Thông tin xác thực hợp lệ -> Đăng nhập thành công
  describe('Nhánh: Thông tin xác thực hợp lệ', () => {
    it('Nên cấp quyền truy cập và trả về token cùng thông tin vai trò', async () => {
      const password = 'SecretPassword@123';
      const hashed = await bcrypt.hash(password, 10);
      const validAccount = {
        userId: 10,
        username: 'valid_user',
        passwordHash: hashed,
        status: 'ACTIVE',
        employeeId: 5,
        employee: {
          employeeId: 5,
          fullName: 'Nguyễn Văn Hợp Lệ',
          position: 'Thủ kho',
        },
        role: {
          roleId: 1,
          name: 'ADMIN',
        } as Role,
      } as unknown as UserAccount;

      mockUsersService.findByUsername.mockResolvedValue(validAccount);

      const result = await authService.login({
        username: 'valid_user',
        password,
      });

      expect(result).toHaveProperty('accessToken', 'mocked.jwt.token');
      expect(result.user).toEqual({
        userId: 10,
        username: 'valid_user',
        fullName: 'Nguyễn Văn Hợp Lệ',
        role: 'ADMIN',
        position: 'Thủ kho',
      });
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith(10);
    });
  });

  // Nhánh 1: Lỗi hệ thống
  describe('Nhánh: Lỗi hệ thống', () => {
    it('Nên ném InternalServerErrorException("Không thể hoàn tất thao tác") khi cơ sở dữ liệu gặp lỗi ngoại lệ', async () => {
      mockUsersService.findByUsername.mockRejectedValue(
        new Error('Mất kết nối Database'),
      );

      await expect(
        authService.login({ username: 'any', password: 'any' }),
      ).rejects.toThrow(
        new InternalServerErrorException('Không thể hoàn tất thao tác'),
      );
    });
  });
});
