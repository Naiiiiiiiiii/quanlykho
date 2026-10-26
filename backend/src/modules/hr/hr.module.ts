import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryRecord } from '../../entities/salary-record.entity';
import { WorkTask } from '../../entities/work-task.entity';
import { Employee } from '../../entities/employee.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalaryRecord, WorkTask, Employee, Warehouse]),
  ],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
