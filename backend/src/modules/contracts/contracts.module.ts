import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalContract } from '../../entities/rental-contract.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Employee } from '../../entities/employee.entity';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [TypeOrmModule.forFeature([RentalContract, Warehouse, Employee])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
