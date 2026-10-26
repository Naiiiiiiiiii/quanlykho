import {
  Injectable,
  OnModuleInit,
  Logger,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BackupLog } from '../../entities/backup-log.entity';
import { SystemErrorLog } from '../../entities/system-error-log.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Product } from '../../entities/product.entity';
import { ImportReceipt } from '../../entities/import-receipt.entity';
import { ExportReceipt } from '../../entities/export-receipt.entity';

@Injectable()
export class SystemService implements OnModuleInit {
  private readonly logger = new Logger(SystemService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(BackupLog)
    private readonly backupLogRepo: Repository<BackupLog>,
    @InjectRepository(SystemErrorLog)
    private readonly errorLogRepo: Repository<SystemErrorLog>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ImportReceipt)
    private readonly importReceiptRepo: Repository<ImportReceipt>,
    @InjectRepository(ExportReceipt)
    private readonly exportReceiptRepo: Repository<ExportReceipt>,
  ) {}

  async onModuleInit() {
    await this.seedSystemLogs();
  }

  /**
   * UC19 - Bước: kiemTraQuyenVaCauHinh()
   */
  async checkBackupConfig(userRole?: string) {
    if (userRole !== 'ADMIN' || !this.backupDir) {
      throw new ForbiddenException(
        'Không đủ quyền hoặc thiếu cấu hình sao lưu',
      );
    }

    const recentBackups = await this.backupLogRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      message: 'Cấu hình sao lưu hợp lệ, sẵn sàng thực hiện',
      data: {
        backupDestination: this.backupDir,
        isReady: true,
        recentBackups,
      },
    };
  }

  /**
   * UC19 - Thực hiện sao lưu dữ liệu hệ thống
   * Sequence diagram:
   * - kiemTraQuyenVaCauHinh()
   * - thucHienSaoLuuHeThong() -> kiemTraDungLuongODiaDich()
   * - Nhánh 1: Không đủ dung lượng hoặc lỗi tiến trình sao lưu:
   *   + ghiNhatKyBackup(FAILED, timestamp)
   *   + "Sao lưu thất bại do không đủ dung lượng hoặc lỗi hệ thống"
   * - Nhánh 2: Sao lưu thành công (filePath, fileSize):
   *   + ghiNhatKyBackup(SUCCESS, timestamp, filePath)
   *   + Nếu lỗi không thể ghi nhật ký vào CSDL -> "Sao lưu thành công nhưng cảnh báo: Không thể ghi nhật ký hệ thống"
   *   + Nếu ghi log thành công -> "Sao lưu dữ liệu thành công"
   */
  async runBackup(params: {
    userRole?: string;
    userId?: number;
    simulateDiskError?: boolean;
    simulateLogError?: boolean;
  }) {
    const { userRole, userId, simulateDiskError, simulateLogError } = params;

    if (userRole !== 'ADMIN' || !this.backupDir) {
      throw new ForbiddenException(
        'Không đủ quyền hoặc thiếu cấu hình sao lưu',
      );
    }

    let filePath = '';
    let fileSize = 0;

    try {
      if (simulateDiskError) {
        throw new Error('Insufficient disk space on target destination');
      }

      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const [warehouses, products, imports, exports] = await Promise.all([
        this.warehouseRepo.find(),
        this.productRepo.find({ relations: { variants: { lots: true } } }),
        this.importReceiptRepo.find({ relations: { importDetails: true } }),
        this.exportReceiptRepo.find({ relations: { exportDetails: true } }),
      ]);

      const snapshot = {
        timestamp: new Date().toISOString(),
        database: 'quanlykho',
        counts: {
          warehouses: warehouses.length,
          products: products.length,
          imports: imports.length,
          exports: exports.length,
        },
        data: {
          warehouses,
          products,
          imports,
          exports,
        },
      };

      const fileName = `backup_quanlykho_${Date.now()}.json`;
      filePath = path.join(this.backupDir, fileName);
      const content = JSON.stringify(snapshot, null, 2);
      fs.writeFileSync(filePath, content, 'utf-8');
      fileSize = Buffer.byteLength(content, 'utf-8');
    } catch (backupErr) {
      // Nhánh lỗi tiến trình sao lưu -> Ghi nhận nhật ký thất bại (FAILED)
      try {
        await this.backupLogRepo.save({
          status: 'FAILED',
          performedBy: userId,
          note: (backupErr as Error).message,
        });
      } catch {
        // Bỏ qua nếu DB cũng lỗi
      }

      throw new InternalServerErrorException(
        'Sao lưu thất bại do không đủ dung lượng hoặc lỗi hệ thống',
      );
    }

    // Nhánh sao lưu thành công -> Ghi nhận nhật ký thành công (Bảng BackupLog)
    try {
      if (simulateLogError) {
        throw new Error('Simulated DB log failure');
      }

      const logRecord = await this.backupLogRepo.save({
        status: 'SUCCESS',
        filePath,
        fileSize,
        performedBy: userId,
        note: 'Sao lưu toàn bộ dữ liệu kho thành công',
      });

      return {
        message: 'Sao lưu dữ liệu thành công',
        data: logRecord,
      };
    } catch (logErr) {
      this.logger.warn(
        'Sao lưu file thành công nhưng không thể ghi bảng BackupLog: ',
        logErr,
      );
      return {
        message:
          'Sao lưu thành công nhưng cảnh báo: Không thể ghi nhật ký hệ thống',
        data: {
          status: 'SUCCESS_WITH_LOG_WARNING',
          filePath,
          fileSize,
          warning: 'Không thể ghi nhật ký hệ thống',
        },
      };
    }
  }

  /**
   * UC23 - Xem lỗi hệ thống
   * Sequence diagram:
   * - kiemTraQuyenXemLoi() -> nếu không có quyền -> "Từ chối truy cập"
   * - truyVanDanhSachLoi()
   *   + Nhánh lỗi truy vấn -> "Thông báo lỗi truy vấn"
   *   + Nhánh không có lỗi -> "Hiển thị danh sách trống"
   *   + Nhánh thành công -> traVeDanhSachLoi(danhSachLoi)
   */
  async getErrorLogs() {
    try {
      const logs = await this.errorLogRepo.find({
        order: { createdAt: 'DESC' },
      });

      if (!logs || logs.length === 0) {
        return {
          message: 'Hiển thị danh sách trống',
          data: [],
        };
      }

      return {
        message: 'Lấy danh sách lỗi hệ thống thành công',
        data: logs,
      };
    } catch (error) {
      this.logger.error('Lỗi khi truy vấn danh sách lỗi hệ thống: ', error);
      throw new InternalServerErrorException('Thông báo lỗi truy vấn');
    }
  }

  /**
   * UC23 - Xem chi tiết một lỗi hệ thống (chonLoiXemChiTiet)
   */
  async getErrorLogDetail(errorId: number) {
    try {
      const log = await this.errorLogRepo.findOne({ where: { errorId } });
      if (!log) {
        throw new NotFoundException('Không tìm thấy bản ghi lỗi hệ thống');
      }
      return {
        message: 'Lấy chi tiết lỗi hệ thống thành công',
        data: log,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Thông báo lỗi truy vấn');
    }
  }

  async seedSystemLogs(): Promise<void> {
    try {
      const count = await this.errorLogRepo.count();
      if (count > 0) return;

      await this.errorLogRepo.save([
        {
          errorCode: 'ERR_STOCK_EXCEEDED',
          moduleName: 'ReceiptsModule',
          path: '/receipts',
          method: 'POST',
          message: 'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
          detail:
            'Yêu cầu xuất 500 chiếc SKU POLO-CM-NAVY-M vượt quá lượng tồn khả dụng tại lô LOT-2026-001 (120 chiếc)',
          severity: 'WARNING',
          requestId: 'req-seed-001',
        },
        {
          errorCode: 'ERR_AUTH_LOCKED',
          moduleName: 'AuthModule',
          path: '/auth/login',
          method: 'POST',
          message: 'Từ chối đăng nhập',
          detail:
            'Tài khoản khoa_taikhoan đang ở trạng thái LOCKED cố gắng đăng nhập',
          severity: 'WARN',
          requestId: 'req-seed-002',
        },
        {
          errorCode: 'ERR_SMTP_TIMEOUT',
          moduleName: 'ContractsModule',
          path: '/contracts/check-expiry',
          method: 'POST',
          message: 'Kết nối máy chủ gửi email cảnh báo thời hạn hợp đồng chậm',
          detail:
            'Timeout 5000ms khi gửi thông báo gia hạn hợp đồng thuê kho Thủ Đức',
          severity: 'ERROR',
          requestId: 'req-seed-003',
        },
      ]);

      this.logger.log('Đã khởi tạo dữ liệu mẫu Lỗi hệ thống (UC23)');
    } catch (err) {
      this.logger.warn('Seed system logs check: ' + (err as Error).message);
    }
  }
}
