import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsIn,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiptItemDto {
  @IsInt({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  @Min(1, { message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  variantId!: number;

  @IsOptional()
  @IsInt({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  lotId?: number;

  @IsOptional()
  @IsString()
  lotCode?: string;

  @IsOptional()
  @IsInt({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  locationId?: number;

  @IsInt({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  @Min(1, { message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  quantity!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  discount?: number;
}

export class CreateReceiptDto {
  @IsNotEmpty({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  @IsIn(['IMPORT', 'EXPORT', 'Nhập', 'Xuất'], {
    message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa',
  })
  receiptType!: 'IMPORT' | 'EXPORT' | 'Nhập' | 'Xuất';

  @IsInt({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  @Min(1, { message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  warehouseId!: number;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  receiver?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  @IsIn(['DRAFT', 'COMPLETED', 'Nháp', 'Hoàn tất'], {
    message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa',
  })
  saveMode!: 'DRAFT' | 'COMPLETED' | 'Nháp' | 'Hoàn tất';

  @IsArray({ message: 'Dữ liệu không hợp lệ, vui lòng chỉnh sửa' })
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items!: ReceiptItemDto[];
}
