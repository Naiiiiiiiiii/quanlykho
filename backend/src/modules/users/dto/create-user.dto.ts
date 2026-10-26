import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsInt,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  username!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsInt({ message: 'Mã vai trò phải là số nguyên' })
  roleId?: number;

  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsInt({ message: 'Mã nhân viên phải là số nguyên' })
  employeeId?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
