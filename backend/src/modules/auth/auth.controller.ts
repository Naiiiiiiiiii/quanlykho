import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * UC13 - Đăng nhập
   * UI -> System : guiYeuCauDangNhap(username, password)
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
   * UC14 - Đăng xuất
   * UI -> HT : guiYeuCauDangXuat()
   * HT -> TokenService : invalidateSession() -> xoaHoacVoHieuHoaPhien()
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

    const result = await this.authService.logout(user.sub, token);
    return {
      message: 'Đã đăng xuất khỏi hệ thống',
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
