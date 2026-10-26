import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportReceipt } from '../../entities/export-receipt.entity';
import { ExportDetail } from '../../entities/export-detail.entity';
import { ImportReceipt } from '../../entities/import-receipt.entity';
import { ImportDetail } from '../../entities/import-detail.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { InventoryLocation } from '../../entities/inventory-location.entity';
import { QualityCheck } from '../../entities/quality-check.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Lot } from '../../entities/lot.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExportReceipt,
      ExportDetail,
      ImportReceipt,
      ImportDetail,
      Warehouse,
      StorageLocation,
      InventoryLocation,
      QualityCheck,
      ProductVariant,
      Lot,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
