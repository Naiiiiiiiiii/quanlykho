import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityIncident } from '../../entities/facility-incident.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Rack } from '../../entities/rack.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityIncident,
      Warehouse,
      Rack,
      StorageLocation,
    ]),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
