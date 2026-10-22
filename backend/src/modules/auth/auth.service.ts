import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserAccount } from '../../entities/user-account.entity';

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
  ) {}

  /**
   * Sequence diagram: kiemTraThongTinXacThuc()
   * Bao gồm các bước:
   * 1. Account : xacDinhTaiKhoan() -> Kiểm tra tài khoản & mật khẩu
   *    -> Nếu sai: Thao tác thông báo sai thông tin ("Không xác thực được")
   * 2. Account : kiemTraVaiTro() -> Kiểm tra quyền hạn/trạng thái tài khoản
   *    -> Nếu không có quyền: Từ chối truy cập ("Từ chối đăng nhập")
   * 3. Account : layVaiTro() -> Lấy vai trò hợp lệ
   * 4. System : capQuyenTruyCap(thongTinVaiTro) -> Tạo JWT token
   * 5. System : xacNhanDangNhapThanhCong() -> Trả về kết quả
   * 6. Ngoại lệ không kiểm soát -> Lỗi hệ thống ("Không thể hoàn tất thao tác")
   */
  async login(loginDto: LoginDto): Promise<LoginResult> {
    try {
      const { username, password } = loginDto;

      // Bước 1: System -> Account : xacDinhTaiKhoan()
      const account: UserAccount | null =
        await this.usersService.findByUsername(username);

      // Nếu tài khoản không tồn tại hoặc sai mật khẩu:
      // Account --> System : khongTonTaiHoacSaiPass
      // System --> UI : thongBaoSaiThongTin() -> UI: "Không xác thực được"
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

      // Bước 2: System -> Account : kiemTraVaiTro()
      // Kiểm tra trạng thái tài khoản có bị khóa không và vai trò có hợp lệ không
      if (!account.role || !account.role.name || account.status !== 'ACTIVE') {
        this.logger.warn(
          `Từ chối truy cập: Tài khoản '${username}' trạng thái=${account.status}, vai trò=${account.role?.name ?? 'NULL'}`,
        );
        // Account --> System : khongCoQuyenTruyCap
        // System --> UI : tuChoiTruyCap() -> UI: "Từ chối đăng nhập"
        throw new ForbiddenException('Từ chối đăng nhập');
      }

      // Bước 3: Account : layVaiTro()
      // Account --> System : thongTinVaiTro
      const thongTinVaiTro = account.role.name;

      // Bước 4: System -> System : capQuyenTruyCap(thongTinVaiTro)
      const payload = {
        sub: account.userId,
        username: account.username,
        role: thongTinVaiTro,
        employeeId: account.employeeId,
      };

      const accessToken = this.jwtService.sign(payload);

      // Cập nhật thời điểm đăng nhập gần nhất
      await this.usersService.updateLastLogin(account.userId);

      // Bước 5: System --> UI : xacNhanDangNhapThanhCong()
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
      // Nếu là lỗi nghiệp vụ (UnauthorizedException hoặc ForbiddenException) thì rethrow để Filter xử lý
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // Trường hợp: Lỗi hệ thống
      // System --> UI : thongBaoLoiHeThong() -> UI: "Không thể hoàn tất thao tác"
      this.logger.error('Lỗi hệ thống khi đăng nhập: ', error);
      throw new InternalServerErrorException('Không thể hoàn tất thao tác');
    }
  }
}
