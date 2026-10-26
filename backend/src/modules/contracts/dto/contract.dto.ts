import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @Type(() => Number)
  @IsInt({ message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' })
  @Min(1, { message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' })
  warehouseId!: number;

  @IsNotEmpty({
    message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa',
  })
  @IsString({ message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' })
  lessorName!: string;

  @IsNotEmpty({
    message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa',
  })
  @IsString()
  startDate!: string;

  @IsNotEmpty({
    message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa',
  })
  @IsString()
  endDate!: string;

  @Type(() => Number)
  @IsNumber(
    {},
    { message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' },
  )
  @Min(0, { message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' })
  rentalPrice!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateContractDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' })
  warehouseId?: number;

  @IsOptional()
  @IsString({ message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' })
  lessorName?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    { message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' },
  )
  @Min(0, { message: 'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa' })
  rentalPrice?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class RenewContractDto {
  @IsNotEmpty({
    message:
      'Không thể gia hạn: hợp đồng đã chấm dứt hoặc ngày kết thúc mới phải sau ngày kết thúc hiện tại',
  })
  @IsString()
  newEndDate!: string;
}
