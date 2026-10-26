import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../entities/warehouse.entity';
import { WarehouseZone } from '../../entities/warehouse-zone.entity';
import { Rack } from '../../entities/rack.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { ExportReceipt } from '../../entities/export-receipt.entity';
import { ExportDetail } from '../../entities/export-detail.entity';
import { FacilityIncident } from '../../entities/facility-incident.entity';

export interface WarehouseDetailResult {
  warehouseId: number;
  name: string;
  address: string | null;
  area: number | null;
  capacity: number | null;
  currentQuantity: number;
  remainingCapacity: number | null;
  revenue: number | null;
  profit: number | null;
  facilityStatus: string | null;
  status: string;
  description: string | null;
  isPartialData: boolean;
  zones: WarehouseZone[];
}

@Injectable()
export class WarehousesService implements OnModuleInit {
  private readonly logger = new Logger(WarehousesService.name);

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(WarehouseZone)
    private readonly zoneRepository: Repository<WarehouseZone>,
    @InjectRepository(Rack)
    private readonly rackRepository: Repository<Rack>,
    @InjectRepository(StorageLocation)
    private readonly locationRepository: Repository<StorageLocation>,
    @InjectRepository(ExportReceipt)
    private readonly exportReceiptRepository: Repository<ExportReceipt>,
    @InjectRepository(ExportDetail)
    private readonly exportDetailRepository: Repository<ExportDetail>,
    @InjectRepository(FacilityIncident)
    private readonly incidentRepository: Repository<FacilityIncident>,
  ) {}

  async onModuleInit() {
    await this.seedWarehouseData();
  }

  /**
   * UC03 - Xem danh sách kho
   * Sequence diagram:
   * - HT -> DB : truyVanDanhSachKho()
   * - Nhánh lỗi truy xuất dữ liệu -> "Không thể tải danh sách kho"
   * - Nhánh danh sách trống -> "Chưa có dữ liệu kho"
   * - Nhánh có dữ liệu -> traVeDanhSachKho(dsKho)
   */
  async findAll(): Promise<{ message: string; data: Warehouse[] }> {
    try {
      const warehouses = await this.warehouseRepository.find({
        relations: {
          zones: {
            racks: {
              storageLocations: true,
            },
          },
        },
        order: {
          warehouseId: 'ASC',
        },
      });

      if (!warehouses || warehouses.length === 0) {
        return {
          message: 'Chưa có dữ liệu kho',
          data: [],
        };
      }

      return {
        message: 'Lấy danh sách kho thành công',
        data: warehouses,
      };
    } catch (error) {
      this.logger.error('Lỗi truy xuất danh sách kho: ', error);
      throw new InternalServerErrorException('Không thể tải danh sách kho');
    }
  }

  /**
   * UC04 - Xem chi tiết kho
   * Sequence diagram:
   * - HT -> HT : xacDinhKhoDuocChon(maKho)
   * - HT -> DB : truyVanThongTinKho(maKho)
   * - Nhánh lỗi truy xuất -> "Không thể tải thông tin kho"
   * - Nhánh không tồn tại hoặc không khả dụng -> "Không tìm thấy kho"
   * - Nhánh dữ liệu không đầy đủ -> traVeThongTinHienCo(thongTinKho)
   * - Nhánh dữ liệu đầy đủ -> traVeChiTietKho(ten, diaChi, loiNhuan, doanhThu, sucChua, tinhTrangCoSoVatChat)
   */
  async findOne(
    warehouseId: number,
  ): Promise<{ message: string; data: WarehouseDetailResult }> {
    if (!warehouseId || warehouseId <= 0) {
      throw new BadRequestException('Mã kho không hợp lệ');
    }

    let warehouse: Warehouse | null;
    try {
      warehouse = await this.warehouseRepository.findOne({
        where: { warehouseId },
        relations: {
          zones: {
            racks: {
              storageLocations: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Lỗi truy vấn thông tin kho: ', error);
      throw new InternalServerErrorException('Không thể tải thông tin kho');
    }

    if (!warehouse || warehouse.status === 'INACTIVE') {
      throw new NotFoundException('Không tìm thấy kho');
    }

    try {
      // Tính tổng sức chứa và lượng lưu hiện tại từ các StorageLocation của kho
      let totalLocationCapacity = 0;
      let currentQuantity = 0;
      for (const zone of warehouse.zones || []) {
        for (const rack of zone.racks || []) {
          for (const loc of rack.storageLocations || []) {
            totalLocationCapacity += Number(loc.capacity || 0);
            currentQuantity += Number(loc.currentQuantity || 0);
          }
        }
      }

      const effectiveCapacity =
        warehouse.capacity ??
        (totalLocationCapacity > 0 ? totalLocationCapacity : null);

      // Tính doanh thu từ các phiếu xuất hoàn tất của kho
      const completedExports = await this.exportReceiptRepository.find({
        where: { warehouseId, status: 'COMPLETED' },
        relations: { exportDetails: true },
      });

      let revenue: number | null = null;
      if (completedExports.length > 0) {
        let sumRevenue = 0;
        let hasPrice = false;
        for (const receipt of completedExports) {
          for (const d of receipt.exportDetails || []) {
            if (d.unitPrice !== undefined && d.unitPrice !== null) {
              hasPrice = true;
              const gross = Number(d.quantity) * Number(d.unitPrice);
              const disc = Number(d.discount || 0);
              sumRevenue += gross - disc;
            }
          }
        }
        if (hasPrice) {
          revenue = sumRevenue;
        }
      }

      // Kiểm tra tình trạng cơ sở vật chất (từ Rack/StorageLocation và sự cố mở)
      const openIncidents = await this.incidentRepository.count({
        where: { warehouseId },
      });

      const facilityStatus =
        openIncidents > 0
          ? `Có ${openIncidents} bản ghi sự cố CSVC`
          : 'Hoạt động tốt';

      const isPartialData =
        !warehouse.address ||
        effectiveCapacity === null ||
        revenue === null ||
        !warehouse.description;

      const detail: WarehouseDetailResult = {
        warehouseId: warehouse.warehouseId,
        name: warehouse.name,
        address: warehouse.address ?? null,
        area:
          warehouse.area !== undefined && warehouse.area !== null
            ? Number(warehouse.area)
            : null,
        capacity: effectiveCapacity,
        currentQuantity,
        remainingCapacity:
          effectiveCapacity !== null
            ? Math.max(0, effectiveCapacity - currentQuantity)
            : null,
        revenue,
        profit: null, // Theo quy tắc nghiệp vụ UC15: không tính lợi nhuận khi chưa có giá vốn tin cậy
        facilityStatus,
        status: warehouse.status,
        description: warehouse.description ?? null,
        isPartialData,
        zones: warehouse.zones || [],
      };

      return {
        message: isPartialData
          ? 'Chỉ hiển thị các thông tin hiện có, các trường thiếu để trống'
          : 'Lấy thông tin chi tiết kho thành công',
        data: detail,
      };
    } catch (error) {
      this.logger.error('Lỗi tổng hợp thông tin chi tiết kho: ', error);
      throw new InternalServerErrorException('Không thể tải thông tin kho');
    }
  }

  /**
   * Khởi tạo dữ liệu mẫu cho Kho, Khu vực, Kệ, Vị trí lưu trữ
   */
  async seedWarehouseData(): Promise<void> {
    try {
      const count = await this.warehouseRepository.count();
      if (count > 0) return;

      const wh1 = await this.warehouseRepository.save({
        name: 'Kho Trung Tâm Quận 7',
        address: '120 Nguyễn Văn Linh, Quận 7, TP.HCM',
        area: 1500,
        capacity: 5000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2027-12-31'),
        status: 'ACTIVE',
        description: 'Kho tổng lưu trữ quần áo thời trang nam nữ',
      });

      const wh2 = await this.warehouseRepository.save({
        name: 'Kho Chi Nhánh Thủ Đức',
        address: '45 Võ Văn Ngân, TP. Thủ Đức, TP.HCM',
        area: 800,
        capacity: 2500,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-11-05'),
        status: 'ACTIVE',
        description: 'Kho trung chuyển hàng xuất bán khu vực phía Đông',
      });

      const zoneA = await this.zoneRepository.save({
        warehouseId: wh1.warehouseId,
        name: 'Khu A - Hàng Áo Thun & Sơ Mi',
        description: 'Khu vực lưu trữ áo thời trang',
      });

      const zoneB = await this.zoneRepository.save({
        warehouseId: wh2.warehouseId,
        name: 'Khu B - Hàng Quần Jeans & Kaki',
        description: 'Khu vực lưu trữ quần dài',
      });

      const rackA1 = await this.rackRepository.save({
        zoneId: zoneA.zoneId,
        name: 'Kệ A1',
        numberOfLevels: 3,
        capacity: 1000,
        status: 'AVAILABLE',
      });

      const rackB1 = await this.rackRepository.save({
        zoneId: zoneB.zoneId,
        name: 'Kệ B1',
        numberOfLevels: 2,
        capacity: 800,
        status: 'AVAILABLE',
      });

      await this.locationRepository.save([
        {
          rackId: rackA1.rackId,
          level: 1,
          code: 'LOC-A1-L1',
          capacity: 500,
          currentQuantity: 120,
          status: 'AVAILABLE',
        },
        {
          rackId: rackA1.rackId,
          level: 2,
          code: 'LOC-A1-L2',
          capacity: 500,
          currentQuantity: 80,
          status: 'AVAILABLE',
        },
        {
          rackId: rackB1.rackId,
          level: 1,
          code: 'LOC-B1-L1',
          capacity: 800,
          currentQuantity: 50,
          status: 'AVAILABLE',
        },
      ]);

      this.logger.log(
        'Đã khởi tạo dữ liệu mẫu Kho, Khu vực, Kệ và Vị trí lưu trữ',
      );
    } catch (err) {
      this.logger.warn('Seed warehouse data check: ' + (err as Error).message);
    }
  }
}
