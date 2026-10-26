/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService - UC18 Quản lý tài khoản và tài khoản nhân viên', () => {
  let usersService: UsersService;
  let mockUserRepo: any;
  let mockEmployeeRepo: any;
  let mockRoleRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve({ userId: 99, ...x })),
    };
    mockEmployeeRepo = {
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve({ employeeId: 50, ...x })),
    };
    mockRoleRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockDataSource = {
      transaction: jest.fn(async (cb) => {
        const manager = {
          getRepository: (entity: any) => {
            if (entity.name === 'Employee') return mockEmployeeRepo;
            return mockUserRepo;
          },
        };
        return cb(manager);
      }),
    };

    usersService = new UsersService(
      mockUserRepo,
      mockEmployeeRepo,
      mockRoleRepo,
      mockDataSource,
    );
  });

  it('Nên ném ConflictException khi username đã tồn tại (TrungUser)', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce({
      userId: 1,
      username: 'admin',
    });

    await expect(
      usersService.create({
        username: 'admin',
        password: 'password123',
        fullName: 'Test Admin',
        roleId: 1,
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
      ),
    );
  });

  it('Nên ném BadRequestException khi Role không tồn tại (SaiRole)', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);
    mockRoleRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      usersService.create({
        username: 'newuser',
        password: 'password123',
        fullName: 'New User',
        roleId: 999,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
      ),
    );
  });

  it('Nên ném ConflictException khi Nhân viên đã có tài khoản (DaCoTK)', async () => {
    mockUserRepo.findOne
      .mockResolvedValueOnce(null) // check username
      .mockResolvedValueOnce({ userId: 2, employeeId: 10 }); // check employeeId has account
    mockRoleRepo.findOne.mockResolvedValueOnce({ roleId: 1, name: 'USER' });
    mockEmployeeRepo.findOne.mockResolvedValueOnce({
      employeeId: 10,
      fullName: 'Existing Emp',
    });

    await expect(
      usersService.create({
        username: 'newuser',
        password: 'password123',
        fullName: 'Existing Emp',
        roleId: 1,
        employeeId: 10,
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Username trùng, Role không tồn tại hoặc Nhân viên đã có tài khoản',
      ),
    );
  });

  it('Nên tạo đồng bộ Employee và UserAccount trong Transaction khi dữ liệu hợp lệ', async () => {
    mockUserRepo.findOne
      .mockResolvedValueOnce(null) // check username
      .mockResolvedValueOnce({
        userId: 99,
        username: 'newstaff',
        employeeId: 50,
        roleId: 2,
      }); // final reload inside transaction
    mockRoleRepo.findOne.mockResolvedValueOnce({ roleId: 2, name: 'USER' });

    const result = await usersService.create({
      username: 'newstaff',
      password: 'password123',
      fullName: 'Nhân Viên Mới',
      roleId: 2,
    });

    expect(mockDataSource.transaction).toHaveBeenCalled();
    expect(mockEmployeeRepo.save).toHaveBeenCalled();
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(result.username).toBe('newstaff');
  });

  it('Nên rollback transaction và ném InternalServerErrorException khi lưu CSDL thất bại', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);
    mockRoleRepo.findOne.mockResolvedValueOnce({ roleId: 2, name: 'USER' });
    mockDataSource.transaction.mockRejectedValueOnce(
      new Error('DB write error'),
    );

    await expect(
      usersService.create({
        username: 'newstaff',
        password: 'password123',
        fullName: 'Nhân Viên Mới',
        roleId: 2,
      }),
    ).rejects.toThrow(
      new InternalServerErrorException(
        'Lưu tài khoản thất bại, đã hoàn tác dữ liệu',
      ),
    );
  });
});
