import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportReceipt } from '../../entities/import-receipt.entity';
import { ImportDetail } from '../../entities/import-detail.entity';
import { ExportReceipt } from '../../entities/export-receipt.entity';
import { ExportDetail } from '../../entities/export-detail.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Lot } from '../../entities/lot.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { InventoryLocation } from '../../entities/inventory-location.entity';
import { QualityCheck } from '../../entities/quality-check.entity';
import { QualityStatus } from '../../entities/quality-status.entity';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportReceipt,
      ImportDetail,
      ExportReceipt,
      ExportDetail,
      Warehouse,
      ProductVariant,
      Lot,
      StorageLocation,
      InventoryLocation,
      QualityCheck,
      QualityStatus,
    ]),
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
