import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupLog } from '../../entities/backup-log.entity';
import { SystemErrorLog } from '../../entities/system-error-log.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Product } from '../../entities/product.entity';
import { ImportReceipt } from '../../entities/import-receipt.entity';
import { ExportReceipt } from '../../entities/export-receipt.entity';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BackupLog,
      SystemErrorLog,
      Warehouse,
      Product,
      ImportReceipt,
      ExportReceipt,
    ]),
  ],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
