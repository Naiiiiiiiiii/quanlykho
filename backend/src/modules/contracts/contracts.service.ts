import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RentalContract } from '../../entities/rental-contract.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Employee } from '../../entities/employee.entity';
import {
  CreateContractDto,
  UpdateContractDto,
  RenewContractDto,
} from './dto/contract.dto';

export interface ContractTermInfo {
  startDate: Date | string;
  endDate: Date | string;
  remainingDays: number;
  termStatus: 'Còn hạn' | 'Sắp hết hạn' | 'Đã hết hạn';
  warningMessage?: string;
}

@Injectable()
export class ContractsService implements OnModuleInit {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    @InjectRepository(RentalContract)
    private readonly contractRepo: Repository<RentalContract>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async onModuleInit() {
    await this.seedContractData();
  }

  /**
   * UC09 - Tính số ngày còn lại và trạng thái thời hạn hợp đồng
   * - Còn hạn: còn lại hơn 14 ngày
   * - Sắp hết hạn: còn lại từ 0 đến 14 ngày
   * - Đã hết hạn: quá ngày kết thúc (< 0)
   */
  public computeTermInfo(
    startDate?: Date | string,
    endDate?: Date | string,
  ): ContractTermInfo | null {
    if (!startDate || !endDate) {
      return null;
    }
    const end = new Date(endDate);
    const now = new Date();
    // Đưa về đầu ngày để tính chính xác số ngày
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = endDay.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let termStatus: 'Còn hạn' | 'Sắp hết hạn' | 'Đã hết hạn';
    let warningMessage: string | undefined;

    if (remainingDays > 14) {
      termStatus = 'Còn hạn';
    } else if (remainingDays >= 0) {
      termStatus = 'Sắp hết hạn';
      warningMessage = 'Hợp đồng sắp hết hạn / đã hết hạn';
    } else {
      termStatus = 'Đã hết hạn';
      warningMessage = 'Hợp đồng sắp hết hạn / đã hết hạn';
    }

    return {
      startDate,
      endDate,
      remainingDays,
      termStatus,
      warningMessage,
    };
  }

  /**
   * UC08 - Xem danh sách hợp đồng
   */
  async findAll() {
    try {
      const contracts = await this.contractRepo.find({
        relations: { warehouse: true },
        order: { contractId: 'ASC' },
      });

      if (!contracts || contracts.length === 0) {
        return {
          message: 'Không tìm thấy hợp đồng',
          data: [],
        };
      }

      const enriched = contracts.map((c) => ({
        ...c,
        termInfo: this.computeTermInfo(c.startDate, c.endDate),
      }));

      return {
        message: 'Lấy danh sách hợp đồng thành công',
        data: enriched,
      };
    } catch (error) {
      this.logger.error('Lỗi truy xuất danh sách hợp đồng: ', error);
      throw new InternalServerErrorException(
        'Không thể tải danh sách hợp đồng',
      );
    }
  }

  /**
   * UC08 - Xem chi tiết hợp đồng (<<include>> UC09 - Theo dõi thời hạn hợp đồng)
   */
  async findOne(contractId: number) {
    const contract = await this.contractRepo.findOne({
      where: { contractId },
      relations: { warehouse: true },
    });

    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    const termInfo = this.computeTermInfo(contract.startDate, contract.endDate);

    return {
      message: 'Lấy chi tiết hợp đồng thành công',
      data: {
        ...contract,
        termInfo,
      },
    };
  }

  /**
   * UC09 - Hiển thị thời hạn hợp đồng độc lập (yeuCauXemThoiHan)
   */
  async getContractTerm(contractId: number) {
    const contract = await this.contractRepo.findOne({
      where: { contractId },
    });

    if (!contract) {
      throw new NotFoundException('Không có dữ liệu phù hợp');
    }

    if (!contract.startDate || !contract.endDate) {
      return {
        message: 'Dữ liệu thời hạn chưa đầy đủ',
        data: null,
      };
    }

    const termInfo = this.computeTermInfo(contract.startDate, contract.endDate);

    return {
      message: termInfo?.warningMessage || 'Lấy thời hạn hợp đồng thành công',
      data: termInfo,
    };
  }

  /**
   * UC08 - Thêm hợp đồng
   * kiemTraTinhHopLe: thiếu trường bắt buộc, ngày kết thúc không sau ngày bắt đầu
   */
  async create(dto: CreateContractDto) {
    if (
      !dto.warehouseId ||
      !dto.lessorName?.trim() ||
      !dto.startDate ||
      !dto.endDate ||
      dto.rentalPrice === undefined ||
      dto.rentalPrice < 0
    ) {
      throw new BadRequestException(
        'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa',
      );
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      end.getTime() <= start.getTime()
    ) {
      throw new BadRequestException(
        'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa',
      );
    }

    const warehouse = await this.warehouseRepo.findOne({
      where: { warehouseId: dto.warehouseId },
    });
    if (!warehouse) {
      throw new BadRequestException(
        'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa',
      );
    }

    try {
      const contract = this.contractRepo.create({
        warehouseId: dto.warehouseId,
        lessorName: dto.lessorName.trim(),
        startDate: start,
        endDate: end,
        rentalPrice: dto.rentalPrice,
        status: 'DangHieuLuc',
        note: dto.note,
      });

      const saved = await this.contractRepo.save(contract);
      return {
        message: 'Thêm hợp đồng thành công',
        data: saved,
      };
    } catch (error) {
      this.logger.error('Lỗi ghi CSDL khi thêm hợp đồng: ', error);
      throw new InternalServerErrorException('Lưu hợp đồng thất bại');
    }
  }

  /**
   * UC08 - Sửa hợp đồng
   */
  async update(contractId: number, dto: UpdateContractDto) {
    const contract = await this.contractRepo.findOne({
      where: { contractId },
    });
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    const newStart = dto.startDate
      ? new Date(dto.startDate)
      : new Date(contract.startDate);
    const newEnd = dto.endDate
      ? new Date(dto.endDate)
      : new Date(contract.endDate);

    if (
      isNaN(newStart.getTime()) ||
      isNaN(newEnd.getTime()) ||
      newEnd.getTime() <= newStart.getTime() ||
      (dto.rentalPrice !== undefined && dto.rentalPrice < 0)
    ) {
      throw new BadRequestException(
        'Thông tin hợp đồng không hợp lệ, vui lòng chỉnh sửa',
      );
    }

    try {
      if (dto.warehouseId !== undefined) contract.warehouseId = dto.warehouseId;
      if (dto.lessorName !== undefined)
        contract.lessorName = dto.lessorName.trim();
      if (dto.startDate !== undefined) contract.startDate = newStart;
      if (dto.endDate !== undefined) contract.endDate = newEnd;
      if (dto.rentalPrice !== undefined) contract.rentalPrice = dto.rentalPrice;
      if (dto.note !== undefined) contract.note = dto.note;

      const saved = await this.contractRepo.save(contract);
      return {
        message: 'Cập nhật hợp đồng thành công',
        data: saved,
      };
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật hợp đồng: ', error);
      throw new InternalServerErrorException('Cập nhật hợp đồng thất bại');
    }
  }

  /**
   * UC08 - Gia hạn hợp đồng
   * kiemTraDieuKienGiaHan(thongTinHopDong, ngayKetThucMoi):
   * - Hợp đồng đã chấm dứt hoặc ngày kết thúc mới không sau ngày kết thúc hiện tại -> tuChoiGiaHan()
   */
  async renew(contractId: number, dto: RenewContractDto) {
    const contract = await this.contractRepo.findOne({
      where: { contractId },
    });
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    const currentEnd = new Date(contract.endDate);
    const newEnd = new Date(dto.newEndDate);

    if (
      contract.status === 'DaChamDut' ||
      isNaN(newEnd.getTime()) ||
      newEnd.getTime() <= currentEnd.getTime()
    ) {
      throw new BadRequestException(
        'Không thể gia hạn: hợp đồng đã chấm dứt hoặc ngày kết thúc mới phải sau ngày kết thúc hiện tại',
      );
    }

    try {
      contract.endDate = newEnd;
      contract.warningEmailSent = false; // Reset cờ cảnh báo hết hạn
      const saved = await this.contractRepo.save(contract);
      return {
        message: 'Gia hạn hợp đồng thành công',
        data: saved,
      };
    } catch (error) {
      this.logger.error('Lỗi khi gia hạn hợp đồng: ', error);
      throw new InternalServerErrorException('Gia hạn hợp đồng thất bại');
    }
  }

  /**
   * UC08 - Chấm dứt hợp đồng
   * - Nếu đã chấm dứt trước đó -> "Hợp đồng đã được chấm dứt"
   * - Nếu đang hiệu lực -> capNhatTrangThai(maHopDong, "DaChamDut") -> "Chấm dứt hợp đồng thành công"
   */
  async terminate(contractId: number) {
    const contract = await this.contractRepo.findOne({
      where: { contractId },
    });
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    if (contract.status === 'DaChamDut') {
      throw new BadRequestException('Hợp đồng đã được chấm dứt');
    }

    try {
      contract.status = 'DaChamDut';
      const saved = await this.contractRepo.save(contract);
      return {
        message: 'Chấm dứt hợp đồng thành công',
        data: saved,
      };
    } catch (error) {
      this.logger.error('Lỗi khi chấm dứt hợp đồng: ', error);
      throw new InternalServerErrorException('Chấm dứt hợp đồng thất bại');
    }
  }

  /**
   * UC08 - Xóa hợp đồng
   * - Nếu hợp đồng đang hiệu lực -> "Không thể xóa hợp đồng đang hiệu lực, vui lòng chấm dứt trước"
   * - Nếu đã chấm dứt hoặc chưa hiệu lực -> xoaHopDong(maHopDong) -> "Xóa hợp đồng thành công"
   */
  async remove(contractId: number) {
    const contract = await this.contractRepo.findOne({
      where: { contractId },
    });
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    if (contract.status === 'DangHieuLuc') {
      throw new BadRequestException(
        'Không thể xóa hợp đồng đang hiệu lực, vui lòng chấm dứt trước',
      );
    }

    try {
      await this.contractRepo.remove(contract);
      return {
        message: 'Xóa hợp đồng thành công',
        data: { deletedContractId: contractId },
      };
    } catch (error) {
      this.logger.error('Lỗi khi xóa hợp đồng: ', error);
      throw new InternalServerErrorException('Xóa hợp đồng thất bại');
    }
  }

  /**
   * UC09 - Cảnh báo hết hạn tự động qua email (báo trước 2 tuần / 14 ngày)
   * Sequence diagram:
   * - SCH -> HT : kichHoatKiemTraHetHan()
   * - HT -> DB : truyVanHopDongSapHetHan(ngayHienTai + 14 ngay, chuaGuiCanhBao)
   * - loop guiEmailCanhBao(emailQuanLyKho, maHopDong, ngayKetThuc, soNgayConLai)
   *   + Nếu gửi thất bại -> ghiNhanLoiGuiEmail(maHopDong) (giữ trạng thái chưa gửi cảnh báo)
   *   + Nếu gửi thành công -> capNhatDaGuiCanhBao(maHopDong)
   */
  async checkAndSendExpiryWarnings() {
    try {
      const activeContracts = await this.contractRepo.find({
        where: {
          status: 'DangHieuLuc',
          warningEmailSent: false,
        },
        relations: { warehouse: true },
      });

      const expiringContracts = activeContracts.filter((c) => {
        const info = this.computeTermInfo(c.startDate, c.endDate);
        return (
          info !== null && info.remainingDays >= 0 && info.remainingDays <= 14
        );
      });

      if (expiringContracts.length === 0) {
        return {
          message: 'Không có hợp đồng cần cảnh báo',
          data: { checkedCount: activeContracts.length, notifiedCount: 0 },
        };
      }

      const managerEmp = await this.employeeRepo.findOne({
        where: { status: 'ACTIVE' },
        order: { employeeId: 'ASC' },
      });
      const targetEmail = managerEmp?.email || 'admin@quanlykho.vn';

      const results: Array<Record<string, unknown>> = [];

      for (const contract of expiringContracts) {
        const term = this.computeTermInfo(contract.startDate, contract.endDate);
        try {
          // Mô phỏng gửi email qua EmailService
          this.logger.log(
            `[EmailService] Gửi cảnh báo hết hạn HĐ #${contract.contractId} tới ${targetEmail} (còn ${term?.remainingDays} ngày)`,
          );
          contract.warningEmailSent = true;
          contract.emailErrorLog = undefined;
          await this.contractRepo.save(contract);
          results.push({
            contractId: contract.contractId,
            email: targetEmail,
            remainingDays: term?.remainingDays,
            status: 'SENT',
          });
        } catch (mailErr) {
          contract.emailErrorLog = (mailErr as Error).message;
          await this.contractRepo.save(contract);
          results.push({
            contractId: contract.contractId,
            status: 'FAILED',
          });
        }
      }

      return {
        message: 'Đã kiểm tra và gửi cảnh báo hợp đồng sắp hết hạn',
        data: {
          notifiedCount: results.length,
          details: results,
        },
      };
    } catch (error) {
      this.logger.error(
        'Lỗi truy xuất dữ liệu khi kiểm tra hợp đồng hết hạn (bỏ qua lần chạy này): ',
        error,
      );
      throw new InternalServerErrorException(
        'Lỗi khi kiểm tra hợp đồng sắp hết hạn',
      );
    }
  }

  async seedContractData(): Promise<void> {
    try {
      const count = await this.contractRepo.count();
      if (count > 0) return;

      const warehouses = await this.warehouseRepo.find({
        order: { warehouseId: 'ASC' },
      });
      if (warehouses.length === 0) return;

      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 10); // Còn 10 ngày -> thuộc nhánh "Sắp hết hạn" (0..14 ngày)

      await this.contractRepo.save([
        {
          warehouseId: warehouses[0].warehouseId,
          lessorName: 'Công ty BĐS Công Nghiệp Nam Sài Gòn',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2027-12-31'),
          rentalPrice: 45000000,
          status: 'DangHieuLuc',
          warningEmailSent: false,
          note: 'Hợp đồng thuê dài hạn Kho Trung Tâm Quận 7',
        },
        {
          warehouseId: (warehouses[1] || warehouses[0]).warehouseId,
          lessorName: 'Tổng Công ty Kho Vận Đông Nam Bộ',
          startDate: new Date('2025-11-01'),
          endDate: soonDate,
          rentalPrice: 28000000,
          status: 'DangHieuLuc',
          warningEmailSent: false,
          note: 'Hợp đồng sắp đến hạn cần gia hạn (test UC09)',
        },
        {
          warehouseId: warehouses[0].warehouseId,
          lessorName: 'Đơn vị Cho thuê Kho Phụ Cũ',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          rentalPrice: 15000000,
          status: 'DaChamDut',
          warningEmailSent: true,
          note: 'Hợp đồng đã chấm dứt (có thể xóa trong UC08)',
        },
      ]);

      this.logger.log('Đã khởi tạo dữ liệu mẫu Hợp đồng thuê kho (UC08, UC09)');
    } catch (err) {
      this.logger.warn('Seed contract data check: ' + (err as Error).message);
    }
  }
}
