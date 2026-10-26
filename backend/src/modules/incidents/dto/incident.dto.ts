import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncidentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Yêu cầu chỉnh sửa' })
  warehouseId?: number;

  @IsNotEmpty({ message: 'Yêu cầu chỉnh sửa' })
  @IsString({ message: 'Yêu cầu chỉnh sửa' })
  locationDescription!: string;

  @IsOptional()
  @IsString()
  facilityName?: string;

  @IsNotEmpty({ message: 'Yêu cầu chỉnh sửa' })
  @IsString({ message: 'Yêu cầu chỉnh sửa' })
  description!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ConfirmIncidentRepairDto {
  @IsNotEmpty({ message: 'Vui lòng chọn kết quả xác nhận sửa chữa' })
  @IsString()
  result!: string; // 'DAT' | 'CHUA_DAT' | 'Đạt' | 'Chưa đạt' | 'PASSED' | 'FAILED'

  @IsOptional()
  @IsString()
  note?: string;
}
