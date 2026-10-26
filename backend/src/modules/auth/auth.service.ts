import {
  Injectable,
  Optional,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserAccount } from '../../entities/user-account.entity';
import { UserSession } from '../../entities/user-session.entity';

export interface LoginResult {
  accessToken: string;
  user: {
    userId: number;
    username: string;
    fullName?: string;
    role?: string;
    position?: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Optional()
    @InjectRepository(UserSession)
    private readonly userSessionRepository?: Repository<UserSession>,
  ) {}

  /**
   * UC13 - Đăng nhập
   * Sequence diagram: guiYeuCauDangNhap(username, password) / kiemTraThongTinXacThuc()
   * Bao gồm các bước:
   * 1. DB : truyVanTaiKhoan(username) / xacDinhTaiKhoan() -> Kiểm tra tài khoản & mật khẩu
   *    -> Nếu sai: Thao tác thông báo sai thông tin ("Không xác thực được")
   * 2. kiemTraTrangThaiTaiKhoan() & xacDinhVaiTro() -> Kiểm tra quyền hạn/trạng thái tài khoản
   *    -> Nếu không có quyền: Từ chối truy cập ("Từ chối đăng nhập")
   * 3. TokenService : taoPhienVaCapQuyen(taiKhoan, vaiTro) -> Tạo JWT token
   * 4. TokenService -> DB : luuPhienLamViec() -> Lưu phiên vào bảng user_sessions
   * 5. Trả về kết quả phiên đăng nhập
   * 6. Ngoại lệ không kiểm soát -> Lỗi hệ thống ("Không thể hoàn tất thao tác")
   */
  async login(loginDto: LoginDto): Promise<LoginResult> {
    try {
      const { username, password } = loginDto;

      // Bước 1: truyVanTaiKhoan(username)
      const account: UserAccount | null =
        await this.usersService.findByUsername(username);

      if (!account) {
        this.logger.warn(
          `Đăng nhập thất bại: Tài khoản '${username}' không tồn tại`,
        );
        throw new UnauthorizedException('Không xác thực được');
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        account.passwordHash,
      );
      if (!isPasswordMatch) {
        this.logger.warn(
          `Đăng nhập thất bại: Sai mật khẩu cho tài khoản '${username}'`,
        );
        throw new UnauthorizedException('Không xác thực được');
      }

      // Bước 2: kiemTraTrangThaiTaiKhoan() & xacDinhVaiTro(taiKhoan)
      if (!account.role || !account.role.name || account.status !== 'ACTIVE') {
        this.logger.warn(
          `Từ chối truy cập: Tài khoản '${username}' trạng thái=${account.status}, vai trò=${account.role?.name ?? 'NULL'}`,
        );
        throw new ForbiddenException('Từ chối đăng nhập');
      }

      const thongTinVaiTro = account.role.name;

      // Bước 3: taoPhienVaCapQuyen(taiKhoan, vaiTro)
      const payload = {
        sub: account.userId,
        username: account.username,
        role: thongTinVaiTro,
        employeeId: account.employeeId,
      };

      const accessToken = this.jwtService.sign(payload);

      // Bước 4: TokenService -> DB : luuPhienLamViec()
      if (this.userSessionRepository) {
        const session = this.userSessionRepository.create({
          userId: account.userId,
          token: accessToken,
          isActive: true,
          expiresAt: new Date(Date.now() + 86400 * 1000),
        });
        await this.userSessionRepository.save(session);
      }

      // Cập nhật thời điểm đăng nhập gần nhất
      await this.usersService.updateLastLogin(account.userId);

      // Bước 5: Trả về kết quả thành công
      return {
        accessToken,
        user: {
          userId: account.userId,
          username: account.username,
          fullName: account.employee?.fullName,
          role: thongTinVaiTro,
          position: account.employee?.position,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Lỗi hệ thống khi đăng nhập: ', error);
      throw new InternalServerErrorException('Không thể hoàn tất thao tác');
    }
  }

  /**
   * UC14 - Đăng xuất
   * Sequence diagram:
   * 1. UI -> HT : guiYeuCauDangXuat()
   * 2. HT -> Token : invalidateSession()
   * 3. Token -> DB : xoaHoacVoHieuHoaPhien()
   *    - Nhánh lỗi CSDL / mất kết nối -> "Không thể kết thúc phiên làm việc, vui lòng thử lại"
   *    - Nhánh thành công -> daVoHieuHoa -> ketQuaThanhCong()
   */
  async logout(
    userId: number,
    rawToken?: string,
  ): Promise<{ revoked: boolean }> {
    try {
      if (this.userSessionRepository) {
        if (rawToken) {
          await this.userSessionRepository.update(
            { userId, token: rawToken, isActive: true },
            { isActive: false, revokedAt: new Date() },
          );
        } else {
          await this.userSessionRepository.update(
            { userId, isActive: true },
            { isActive: false, revokedAt: new Date() },
          );
        }
      }
      return { revoked: true };
    } catch (error) {
      this.logger.error('Lỗi hệ thống khi đăng xuất (kết thúc phiên): ', error);
      throw new InternalServerErrorException(
        'Không thể kết thúc phiên làm việc, vui lòng thử lại',
      );
    }
  }

  /**
   * Kiểm tra token có bị thu hồi (revoked) hay chưa
   */
  async isTokenRevoked(token: string): Promise<boolean> {
    if (!this.userSessionRepository) {
      return false;
    }
    const revokedSession = await this.userSessionRepository.findOne({
      where: { token, isActive: false },
    });
    return Boolean(revokedSession);
  }
}
