import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * UI -> System : kiemTraThongTinXacThuc()
   * Route công khai, bỏ qua JWT Guard nhờ @Public()
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  /**
   * Route yêu cầu xác thực JWT Guard
   */
  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser | null) {
    return {
      message: 'Lấy thông tin phiên đăng nhập thành công',
      data: user,
    };
  }
}
