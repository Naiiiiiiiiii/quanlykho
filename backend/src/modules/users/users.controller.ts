import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('sub') userId: number) {
    const user = await this.usersService.findById(userId);
    return {
      message: 'Lấy thông tin tài khoản thành công',
      data: user,
    };
  }

  /**
   * UC18 - Xem danh sách tài khoản
   * UI -> HT : layDanhSachTaiKhoan() -> truyVanDanhSachEmployeeVaUser()
   */
  @Get()
  @Roles('ADMIN')
  @ForbiddenMessage('Không có quyền thực hiện')
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: 'Lấy danh sách người dùng thành công',
      data: users,
    };
  }

  /**
   * UC18 - Tạo mới tài khoản
   * UI -> HT : guiYeuCauLuuTaiKhoan(thongTinTaiKhoan)
   */
  @Post()
  @Roles('ADMIN')
  @ForbiddenMessage('Không có quyền thực hiện')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'Lưu tài khoản thành công',
      data: user,
    };
  }

  /**
   * UC18 - Cập nhật tài khoản
   * UI -> HT : guiYeuCauLuuTaiKhoan(thongTinTaiKhoan)
   */
  @Put(':id')
  @Roles('ADMIN')
  @ForbiddenMessage('Không có quyền thực hiện')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'Lưu tài khoản thành công',
      data: user,
    };
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ForbiddenMessage('Không có quyền thực hiện')
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'Lưu tài khoản thành công',
      data: user,
    };
  }
}
