import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacilityIncident } from '../../entities/facility-incident.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Rack } from '../../entities/rack.entity';
import {
  CreateIncidentDto,
  ConfirmIncidentRepairDto,
} from './dto/incident.dto';

@Injectable()
export class IncidentsService implements OnModuleInit {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    @InjectRepository(FacilityIncident)
    private readonly incidentRepo: Repository<FacilityIncident>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
  ) {}

  async onModuleInit() {
    await this.seedIncidentData();
  }

  /**
   * UC06 - Theo dõi cơ sở vật chất
   * Sequence diagram:
   * - System -> DB : truyVanDanhSachCSVCVaSuCo()
   * - Nhánh 1: Lỗi truy vấn -> "Không thể tải dữ liệu"
   * - Nhánh 2: Chưa có dữ liệu -> "Hiển thị trạng thái chưa có dữ liệu"
   * - Nhánh 3: Tải dữ liệu thành công -> danhSachCSVC_SuCo
   */
  async getFacilitiesAndIncidents() {
    try {
      const incidents = await this.incidentRepo.find({
        relations: { warehouse: true, reporter: true },
        order: { createdAt: 'DESC' },
      });
      const racks = await this.rackRepo.find({
        relations: { zone: { warehouse: true }, storageLocations: true },
      });

      if (incidents.length === 0 && racks.length === 0) {
        return {
          message: 'Hiển thị trạng thái chưa có dữ liệu',
          data: {
            facilities: [],
            incidents: [],
          },
        };
      }

      return {
        message: 'Tải danh sách cơ sở vật chất và sự cố thành công',
        data: {
          facilities: racks,
          incidents,
        },
      };
    } catch (error) {
      this.logger.error('Lỗi truy vấn danh sách CSVC và sự cố: ', error);
      throw new InternalServerErrorException('Không thể tải dữ liệu');
    }
  }

  /**
   * UC07 - Ghi nhận và theo dõi sự cố
   * Sequence diagram:
   * - kiemTraTruongBatBuocVaQuyen()
   * - Thiếu hoặc sai thông tin -> "Yêu cầu chỉnh sửa"
   * - Không có quyền -> "Từ chối thao tác"
   * - Lưu thất bại -> "Thông báo lỗi, không xác nhận thành công"
   * - Lưu thành công (TrangThai: Moi) -> "Lưu sự cố thành công"
   */
  async createIncident(dto: CreateIncidentDto, employeeId?: number) {
    if (!dto || !dto.locationDescription?.trim() || !dto.description?.trim()) {
      throw new BadRequestException('Yêu cầu chỉnh sửa');
    }

    try {
      const incident = this.incidentRepo.create({
        warehouseId: dto.warehouseId,
        locationDescription: dto.locationDescription.trim(),
        facilityName: dto.facilityName || 'Thiết bị / Kệ kho',
        description: dto.description.trim(),
        imageUrl: dto.imageUrl,
        status: 'Mới',
        reportedBy: employeeId,
      });

      const saved = await this.incidentRepo.save(incident);
      return {
        message: 'Lưu sự cố thành công',
        data: saved,
      };
    } catch (error) {
      this.logger.error('Lỗi lưu sự cố: ', error);
      throw new InternalServerErrorException(
        'Thông báo lỗi, không xác nhận thành công',
      );
    }
  }

  /**
   * UC10 - Xem chi tiết sự cố chờ xác nhận sửa chữa
   * UI -> System : yeuCauLayChiTietSuCo() -> truyVanSuCo()
   */
  async getIncidentDetail(incidentId: number) {
    try {
      const incident = await this.incidentRepo.findOne({
        where: { incidentId },
        relations: { warehouse: true, reporter: true },
      });

      if (!incident) {
        throw new ForbiddenException('Từ chối thao tác / Không tìm thấy');
      }

      return {
        message: 'Lấy chi tiết sự cố thành công',
        data: incident,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error('Lỗi truy vấn sự cố: ', error);
      throw new InternalServerErrorException('Thông báo lỗi hệ thống');
    }
  }

  /**
   * UC10 - Xác nhận sửa chữa
   * Sequence diagram:
   * - kiemTraQuyenVaDieuKien()
   * - Nhánh 1: Không đủ quyền / Sự cố không hợp lệ (ví dụ không tìm thấy hoặc đã đóng) -> "Từ chối thao tác / Không tìm thấy"
   * - Nhánh 2: Lưu thất bại -> "Thông báo lỗi hệ thống"
   * - Nhánh 3: Chưa đạt yêu cầu -> capNhatTrangThai("Đang xử lý") -> "Chuyển lại trạng thái Đang xử lý"
   * - Nhánh 4: Đạt yêu cầu -> capNhatTrangThai("Đã đóng") -> "Đóng sự cố thành công"
   */
  async confirmRepair(
    incidentId: number,
    dto: ConfirmIncidentRepairDto,
    employeeId?: number,
  ) {
    const incident = await this.incidentRepo.findOne({
      where: { incidentId },
    });

    if (!incident || incident.status === 'Đã đóng') {
      throw new ForbiddenException('Từ chối thao tác / Không tìm thấy');
    }

    const normalizedResult = (dto.result || '').trim().toUpperCase();
    const isPassed =
      normalizedResult === 'DAT' ||
      normalizedResult === 'ĐẠT' ||
      normalizedResult === 'PASSED' ||
      normalizedResult === 'TRUE';

    try {
      if (isPassed) {
        incident.status = 'Đã đóng';
        incident.repairNote = dto.note ?? incident.repairNote;
        incident.confirmedBy = employeeId;
        const saved = await this.incidentRepo.save(incident);
        return {
          message: 'Đóng sự cố thành công',
          data: saved,
        };
      } else {
        incident.status = 'Đang xử lý';
        incident.repairNote = dto.note ?? incident.repairNote;
        incident.confirmedBy = employeeId;
        const saved = await this.incidentRepo.save(incident);
        return {
          message: 'Chuyển lại trạng thái Đang xử lý',
          data: saved,
        };
      }
    } catch (error) {
      this.logger.error('Lỗi cập nhật trạng thái sửa chữa sự cố: ', error);
      throw new InternalServerErrorException('Thông báo lỗi hệ thống');
    }
  }

  async seedIncidentData(): Promise<void> {
    try {
      const count = await this.incidentRepo.count();
      if (count > 0) return;

      const wh = await this.warehouseRepo.findOne({
        where: {},
        order: { warehouseId: 'ASC' },
      });

      await this.incidentRepo.save([
        {
          warehouseId: wh?.warehouseId,
          locationDescription: 'Khu A - Kệ A1 - Tầng 2',
          facilityName: 'Thanh đỡ kệ sắt A1',
          description:
            'Thanh đỡ kệ tầng 2 có dấu hiệu cong nhẹ do quá tải cục bộ',
          status: 'Mới',
        },
        {
          warehouseId: wh?.warehouseId,
          locationDescription: 'Cửa xuất hàng số 2',
          facilityName: 'Hệ thống đèn chiếu sáng LED',
          description:
            'Đèn chiếu sáng khu vực đóng gói nhấp nháy, đã thay bóng mới chờ nghiệm thu',
          status: 'Chờ xác nhận',
          repairNote: 'Đội kỹ thuật đã thay chấn lưu và bóng LED 50W',
        },
      ]);
      this.logger.log(
        'Đã khởi tạo dữ liệu mẫu Sự cố cơ sở vật chất (UC06, UC07, UC10)',
      );
    } catch (err) {
      this.logger.warn('Seed incident data check: ' + (err as Error).message);
    }
  }
}
