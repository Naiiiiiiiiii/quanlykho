import {
  Injectable,
  OnModuleInit,
  Logger,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryRecord } from '../../entities/salary-record.entity';
import { WorkTask } from '../../entities/work-task.entity';
import { Employee } from '../../entities/employee.entity';
import { Warehouse } from '../../entities/warehouse.entity';

@Injectable()
export class HrService implements OnModuleInit {
  private readonly logger = new Logger(HrService.name);

  constructor(
    @InjectRepository(SalaryRecord)
    private readonly salaryRepo: Repository<SalaryRecord>,
    @InjectRepository(WorkTask)
    private readonly taskRepo: Repository<WorkTask>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async onModuleInit() {
    await this.seedHrData();
  }

  /**
   * UC21 - Xem lương thưởng
   * Sequence diagram:
   * - HT -> SS : xacDinhPhamViQuyen(userId, userRole)
   *   + Không đủ quyền -> "Bạn không có quyền xem thông tin lương thưởng"
   *   + Quyền hợp lệ -> phamViHopLe (nhanVien: xem ca nhan / admin: xem toan bo)
   * - HT -> DB : truyVanDuLieuLuong(phamVi)
   *   + Lỗi CSDL -> "Lỗi hệ thống khi truy vấn dữ liệu lương"
   *   + Không có dữ liệu -> "Chưa có thông tin lương thưởng cho kỳ này"
   *   + Có dữ liệu -> traVeDuLieuLuong(ketQuaTruyVan)
   */
  async getSalaries(params: {
    userRole?: string;
    employeeId?: number;
    period?: string;
  }) {
    const { userRole, employeeId, period } = params;

    if (!userRole || !['ADMIN', 'USER'].includes(userRole)) {
      throw new ForbiddenException(
        'Bạn không có quyền xem thông tin lương thưởng',
      );
    }

    try {
      const isAdmin = userRole === 'ADMIN';
      const whereClause: Record<string, unknown> = {};

      if (!isAdmin) {
        if (!employeeId) {
          throw new ForbiddenException(
            'Bạn không có quyền xem thông tin lương thưởng',
          );
        }
        whereClause.employeeId = employeeId;
      }

      if (period) {
        whereClause.period = period;
      }

      const records = await this.salaryRepo.find({
        where: whereClause,
        relations: { employee: true },
        order: { period: 'DESC', salaryId: 'ASC' },
      });

      if (!records || records.length === 0) {
        return {
          message: 'Chưa có thông tin lương thưởng cho kỳ này',
          data: [],
        };
      }

      return {
        message: 'Lấy thông tin lương thưởng thành công',
        data: {
          scope: isAdmin ? 'ALL_EMPLOYEES' : 'PERSONAL_ONLY',
          records,
        },
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error('Lỗi truy vấn dữ liệu lương thưởng: ', error);
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi truy vấn dữ liệu lương',
      );
    }
  }

  /**
   * UC22 - Xem thông tin công việc
   * Sequence diagram:
   * - System -> Auth : kiemTraQuyen(staffId, "XEM_CONG_VIEC")
   *   + Không đủ quyền -> "Từ chối truy cập: Không đủ quyền"
   * - System -> Task : truyVanCongViecTheoNhanVien(staffId, loaiCongViec)
   *   + Lỗi truy vấn -> "Lỗi truy vấn dữ liệu"
   *   + Không có dữ liệu -> "Không có dữ liệu công việc"
   *   + Thành công -> traVeDanhSachCongViec(danhSachCongViec)
   */
  async getWorkTasks(params: {
    userRole?: string;
    employeeId?: number;
    taskType?: string;
  }) {
    const { userRole, employeeId, taskType } = params;

    if (!userRole || !['ADMIN', 'USER'].includes(userRole)) {
      throw new ForbiddenException('Từ chối truy cập: Không đủ quyền');
    }

    try {
      const whereClause: Record<string, unknown> = {};
      if (userRole !== 'ADMIN' && employeeId) {
        whereClause.employeeId = employeeId;
      }
      if (taskType && taskType.trim() !== '' && taskType !== 'ALL') {
        whereClause.taskType = taskType.trim().toUpperCase();
      }

      const tasks = await this.taskRepo.find({
        where: whereClause,
        relations: { employee: true, warehouse: true },
        order: { createdAt: 'DESC' },
      });

      if (!tasks || tasks.length === 0) {
        return {
          message: 'Không có dữ liệu công việc',
          data: [],
        };
      }

      return {
        message: 'Lấy danh sách công việc thành công',
        data: tasks,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error('Lỗi truy vấn thông tin công việc: ', error);
      throw new InternalServerErrorException('Lỗi truy vấn dữ liệu');
    }
  }

  async seedHrData(): Promise<void> {
    try {
      const salCount = await this.salaryRepo.count();
      if (salCount > 0) return;

      const employees = await this.employeeRepo.find({
        order: { employeeId: 'ASC' },
      });
      const wh = await this.warehouseRepo.findOne({
        where: {},
        order: { warehouseId: 'ASC' },
      });

      if (employees.length === 0) return;

      for (const emp of employees) {
        if (emp.status !== 'ACTIVE') continue;
        const isManager = emp.position?.includes('Quản trị');
        const base = isManager ? 18000000 : 11000000;
        const bonus = isManager ? 3500000 : 2000000;
        await this.salaryRepo.save({
          employeeId: emp.employeeId,
          period: '2026-10',
          baseSalary: base,
          bonus,
          deduction: 0,
          totalSalary: base + bonus,
          status: 'PAID',
          note: 'Lương và thưởng năng suất vận hành kho tháng 10/2026',
        });

        await this.taskRepo.save([
          {
            employeeId: emp.employeeId,
            warehouseId: wh?.warehouseId,
            taskType: 'NHAP_KHO',
            title: 'Tiếp nhận và xếp kệ lô Áo Polo LOT-2026-001',
            description: 'Kiểm đếm số lượng và cập nhật vị trí LOC-A1-L1',
            status: 'COMPLETED',
            dueDate: new Date('2026-10-20T17:00:00Z'),
          },
          {
            employeeId: emp.employeeId,
            warehouseId: wh?.warehouseId,
            taskType: 'KIEM_DINH',
            title: 'Kiểm tra chất lượng định kỳ lô Quần Jeans LOT-2026-003',
            description: 'Đối soát tỷ lệ lỗi đường may và phân loại kệ cách ly',
            status: 'IN_PROGRESS',
            dueDate: new Date('2026-10-28T17:00:00Z'),
          },
        ]);
      }

      this.logger.log(
        'Đã khởi tạo dữ liệu mẫu Lương thưởng (UC21) & Công việc (UC22)',
      );
    } catch (err) {
      this.logger.warn('Seed HR data check: ' + (err as Error).message);
    }
  }
}
