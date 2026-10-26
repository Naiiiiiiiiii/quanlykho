import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterReceiptDto {
  @IsOptional()
  @IsString()
  type?: string; // 'IMPORT' | 'EXPORT' | 'Nhập' | 'Xuất'

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  status?: string; // 'DRAFT' | 'COMPLETED' | 'Nháp' | 'Hoàn tất'

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  warehouseId?: number;

  @IsOptional()
  @IsString()
  receiptCode?: string;
}
