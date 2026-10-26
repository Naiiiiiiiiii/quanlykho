import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '../../entities/warehouse.entity';
import { WarehouseZone } from '../../entities/warehouse-zone.entity';
import { Rack } from '../../entities/rack.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { ExportReceipt } from '../../entities/export-receipt.entity';
import { ExportDetail } from '../../entities/export-detail.entity';
import { FacilityIncident } from '../../entities/facility-incident.entity';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      WarehouseZone,
      Rack,
      StorageLocation,
      ExportReceipt,
      ExportDetail,
      FacilityIncident,
    ]),
  ],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService],
})
export class WarehousesModule {}
