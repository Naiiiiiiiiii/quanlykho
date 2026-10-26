import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportReceipt } from '../../entities/export-receipt.entity';
import { ExportDetail } from '../../entities/export-detail.entity';
import { ImportReceipt } from '../../entities/import-receipt.entity';
import { ImportDetail } from '../../entities/import-detail.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { StorageLocation } from '../../entities/storage-location.entity';
import { InventoryLocation } from '../../entities/inventory-location.entity';
import { QualityCheck } from '../../entities/quality-check.entity';

const SUPPORTED_CRITERIA = [
  'TURNOVER',
  'CAPACITY_UTILIZATION',
  'FULFILLMENT',
  'OVERALL',
  'VONG_QUAY',
  'SUC_CHUA',
  'TONG_HOP',
];

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(ExportReceipt)
    private readonly exportReceiptRepo: Repository<ExportReceipt>,
    @InjectRepository(ExportDetail)
    private readonly exportDetailRepo: Repository<ExportDetail>,
    @InjectRepository(ImportReceipt)
    private readonly importReceiptRepo: Repository<ImportReceipt>,
    @InjectRepository(ImportDetail)
    private readonly importDetailRepo: Repository<ImportDetail>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(StorageLocation)
    private readonly locationRepo: Repository<StorageLocation>,
    @InjectRepository(InventoryLocation)
    private readonly inventoryLocationRepo: Repository<InventoryLocation>,
    @InjectRepository(QualityCheck)
    private readonly qualityCheckRepo: Repository<QualityCheck>,
  ) {}

  /**
   * UC15 - Tính toán doanh thu
   * Sequence diagram:
   * - kiemTraKhoangThoiGian()
   * - layPhieuXuatBan(maKho, tuNgay, denNgay): loại = Xuất, trạng thái = Hoàn tất, mục đích = Xuất bán
   * - layChiTietXuatBan(dsPhieuXuatBan) -> dsChiTiet(soLuong, donGiaBan, giamGia)
   * - kiemTraDuDonGiaBan(dsChiTiet)
   * - tinhDoanhThu(dsChiTiet) = Σ(soLuong × donGiaBan) − giamGia
   */
  async calculateRevenue(params: {
    warehouseId?: number;
    fromDate?: string;
    toDate?: string;
  }) {
    const { warehouseId, fromDate, toDate } = params;

    if (!fromDate || !toDate) {
      throw new BadRequestException(
        'Khoảng thời gian không hợp lệ, vui lòng chọn lại',
      );
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (toDate.length <= 10) {
      end.setHours(23, 59, 59, 999);
    }

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      start.getTime() > end.getTime()
    ) {
      throw new BadRequestException(
        'Khoảng thời gian không hợp lệ, vui lòng chọn lại',
      );
    }

    try {
      const exports = await this.exportReceiptRepo.find({
        where: warehouseId
          ? { warehouseId, status: 'COMPLETED' }
          : { status: 'COMPLETED' },
        relations: {
          exportDetails: true,
          warehouse: true,
        },
      });

      // Chỉ lấy phiếu Xuất bán thuộc kỳ (loại trừ điều chuyển, hủy hàng)
      const saleReceipts = exports.filter((r) => {
        const dt = new Date(r.exportDate);
        const inPeriod = dt >= start && dt <= end;
        const reasonUpper = (r.reason || 'XUẤT BÁN').toUpperCase();
        const isSale =
          reasonUpper.includes('XUẤT BÁN') ||
          reasonUpper.includes('XUAT BAN') ||
          reasonUpper === 'SALE';
        return inPeriod && isSale;
      });

      if (saleReceipts.length === 0) {
        return {
          message: 'Không đủ dữ liệu để tính doanh thu',
          data: null,
        };
      }

      const allDetails: ExportDetail[] = [];
      for (const r of saleReceipts) {
        allDetails.push(...(r.exportDetails || []));
      }

      if (allDetails.length === 0) {
        return {
          message: 'Không đủ dữ liệu để tính doanh thu',
          data: null,
        };
      }

      // Bước 13: kiemTraDuDonGiaBan(dsChiTiet)
      const missingPrice = allDetails.some(
        (d) =>
          d.unitPrice === undefined ||
          d.unitPrice === null ||
          Number(d.unitPrice) <= 0,
      );
      if (missingPrice) {
        return {
          message: 'Không đủ dữ liệu để tính doanh thu',
          data: null,
        };
      }

      // Bước 14: tinhDoanhThu(dsChiTiet)
      let totalRevenue = 0;
      let totalQuantity = 0;
      let totalDiscount = 0;

      for (const d of allDetails) {
        const qty = Number(d.quantity);
        const price = Number(d.unitPrice);
        const disc = Number(d.discount || 0);
        totalQuantity += qty;
        totalDiscount += disc;
        totalRevenue += qty * price - disc;
      }

      return {
        message: 'Tính doanh thu thành công',
        data: {
          revenue: totalRevenue,
          totalQuantity,
          totalDiscount,
          receiptCount: saleReceipts.length,
          warehouseId: warehouseId ?? 'ALL',
          fromDate,
          toDate,
          dataScope:
            'Chỉ tính trên phiếu Xuất đã Hoàn tất với mục đích Xuất bán (không tính lợi nhuận khi chưa có giá vốn)',
        },
      };
    } catch (error) {
      this.logger.error('Lỗi khi tính toán doanh thu: ', error);
      throw new InternalServerErrorException('Không thể tính doanh thu');
    }
  }

  /**
   * UC16 - Dự báo doanh thu
   * Sequence diagram:
   * - kiemTraThamSo(maKho)
   * - xacDinhBaThangHoanChinhGanNhat()
   * - loop tinhDoanhThuThang(maKho, thang) (dùng logic UC15)
   * - Nếu thiếu dữ liệu ở ít nhất 1 trong 3 tháng -> "Chưa đủ dữ liệu để dự báo"
   * - Nếu đủ cả 3 tháng -> duBao = (T1 + T2 + T3) / 3
   */
  async forecastRevenue(warehouseId?: number, referenceDateStr?: string) {
    if (warehouseId !== undefined && (isNaN(warehouseId) || warehouseId <= 0)) {
      throw new BadRequestException(
        'Tham số không hợp lệ, vui lòng điều chỉnh',
      );
    }

    if (warehouseId) {
      const wh = await this.warehouseRepo.findOne({ where: { warehouseId } });
      if (!wh) {
        throw new BadRequestException(
          'Tham số không hợp lệ, vui lòng điều chỉnh',
        );
      }
    }

    try {
      const refDate = referenceDateStr
        ? new Date(referenceDateStr)
        : new Date();
      if (isNaN(refDate.getTime())) {
        throw new BadRequestException(
          'Tham số không hợp lệ, vui lòng điều chỉnh',
        );
      }

      // Xác định 3 tháng hoàn chỉnh gần nhất trước tháng của refDate
      const monthsInfo: Array<{
        label: string;
        fromDate: string;
        toDate: string;
        revenue?: number;
      }> = [];

      for (let i = 3; i >= 1; i--) {
        const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const label = `${year}-${String(month + 1).padStart(2, '0')}`;
        monthsInfo.push({
          label,
          fromDate: firstDay.toISOString(),
          toDate: lastDay.toISOString(),
        });
      }

      const monthlyRevenues: number[] = [];

      for (const m of monthsInfo) {
        const res = await this.calculateRevenue({
          warehouseId,
          fromDate: m.fromDate,
          toDate: m.toDate,
        });
        if (!res.data || res.data.revenue === undefined) {
          return {
            message: 'Chưa đủ dữ liệu để dự báo',
            data: {
              warehouseId: warehouseId ?? 'ALL',
              monthsChecked: monthsInfo.map((x) => x.label),
              missingMonth: m.label,
            },
          };
        }
        m.revenue = res.data.revenue;
        monthlyRevenues.push(res.data.revenue);
      }

      const forecastNextMonth = Math.round(
        (monthlyRevenues[0] + monthlyRevenues[1] + monthlyRevenues[2]) / 3,
      );

      return {
        message: 'Dự báo doanh thu thành công',
        data: {
          forecastNextMonth,
          method:
            'Trung bình cộng doanh thu của 3 tháng hoàn chỉnh gần nhất: (T1 + T2 + T3) / 3',
          warehouseId: warehouseId ?? 'ALL',
          monthsUsed: monthsInfo,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Lỗi khi dự báo doanh thu: ', error);
      throw new InternalServerErrorException('Không thể tạo dự báo');
    }
  }

  /**
   * UC17 - Đánh giá hiệu suất hoạt động
   * Sequence diagram:
   * - kiemTraTieuChi(loaiChiSo) -> nếu chưa định nghĩa -> "Chưa định nghĩa tiêu chí, không thực hiện tính toán"
   * - truyVanDuLieu(maKho, kyDanhGia)
   * - Nếu thiếu dữ liệu vận hành -> tinhToanMotPhan() -> "Không đủ dữ liệu hoàn chỉnh"
   * - Nếu đủ dữ liệu -> tinhChiSoHieuSuat(tieuChi, duLieu)
   */
  async evaluatePerformance(params: {
    warehouseId?: number;
    period?: string;
    metricType?: string;
  }) {
    const { warehouseId, period, metricType } = params;

    // Bước 5: kiemTraTieuChi(loaiChiSo)
    if (
      !metricType ||
      !SUPPORTED_CRITERIA.includes(metricType.trim().toUpperCase())
    ) {
      throw new BadRequestException(
        'Chưa định nghĩa tiêu chí, không thực hiện tính toán',
      );
    }

    try {
      const locations = await this.locationRepo.find({
        relations: { rack: { zone: true } },
      });
      const filteredLocations = warehouseId
        ? locations.filter((l) => l.rack?.zone?.warehouseId === warehouseId)
        : locations;

      const imports = await this.importReceiptRepo.find({
        where: warehouseId
          ? { warehouseId, status: 'COMPLETED' }
          : { status: 'COMPLETED' },
      });
      const exports = await this.exportReceiptRepo.find({
        where: warehouseId
          ? { warehouseId, status: 'COMPLETED' }
          : { status: 'COMPLETED' },
        relations: { exportDetails: true },
      });

      const maxCapacity = filteredLocations.reduce(
        (sum, l) => sum + Number(l.capacity || 0),
        0,
      );
      const currentStored = filteredLocations.reduce(
        (sum, l) => sum + Number(l.currentQuantity || 0),
        0,
      );

      const totalImportQty = imports.reduce(
        (s, r) => s + Number(r.totalQuantity || 0),
        0,
      );
      const totalExportQty = exports.reduce(
        (s, r) =>
          s +
          (r.exportDetails || []).reduce(
            (acc, d) => acc + Number(d.quantity || 0),
            0,
          ),
        0,
      );

      const utilizationRate =
        maxCapacity > 0
          ? Number(((currentStored / maxCapacity) * 100).toFixed(2))
          : 0;
      const turnoverRate =
        currentStored > 0
          ? Number((totalExportQty / currentStored).toFixed(2))
          : 0;

      const isPartial =
        filteredLocations.length === 0 ||
        imports.length === 0 ||
        exports.length === 0;

      if (isPartial) {
        return {
          message: 'Không đủ dữ liệu hoàn chỉnh',
          data: {
            warehouseId: warehouseId ?? 'ALL',
            period: period ?? 'ALL',
            metricType: metricType.toUpperCase(),
            isPartial: true,
            warning: 'Không đủ dữ liệu hoàn chỉnh',
            metrics: {
              utilizationRate,
              turnoverRate,
              totalImportQty,
              totalExportQty,
            },
          },
        };
      }

      return {
        message: 'Đánh giá hiệu suất hoạt động thành công',
        data: {
          warehouseId: warehouseId ?? 'ALL',
          period: period ?? 'ALL',
          metricType: metricType.toUpperCase(),
          isPartial: false,
          metrics: {
            utilizationRate,
            turnoverRate,
            maxCapacity,
            currentStored,
            totalImportQty,
            totalExportQty,
          },
        },
      };
    } catch (error) {
      this.logger.error('Lỗi khi đánh giá hiệu suất: ', error);
      throw new InternalServerErrorException('Lỗi xử lý, không thể hoàn tất');
    }
  }

  /**
   * UC20 - Thống kê hàng hóa
   * Sequence diagram:
   * - kiemTraBoLoc() (tuNgay > denNgay)
   * - tinhTonHienTai(maKho, boLoc) từ InventoryLocation
   * - tongHopNhapXuatTrongKy(maKho, tuNgay, denNgay, boLoc) (chỉ phiếu Hoàn tất)
   * - tongHopTheoTrangThaiChatLuong(maKho, boLoc)
   * - laySucChuaToiDa(maKho) từ StorageLocation -> sucChuaConLai = sucChuaToiDa - luongDangLuu
   */
  async getInventoryStatistics(params: {
    warehouseId?: number;
    fromDate?: string;
    toDate?: string;
    categoryId?: number;
    variantId?: number;
    lotId?: number;
  }) {
    const { warehouseId, fromDate, toDate, categoryId, variantId, lotId } =
      params;

    let start: Date | undefined;
    let end: Date | undefined;
    if (fromDate) {
      start = new Date(fromDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException(
          'Bộ lọc không hợp lệ, vui lòng điều chỉnh',
        );
      }
    }
    if (toDate) {
      end = new Date(toDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException(
          'Bộ lọc không hợp lệ, vui lòng điều chỉnh',
        );
      }
      if (toDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
    }
    if (start && end && start.getTime() > end.getTime()) {
      throw new BadRequestException('Bộ lọc không hợp lệ, vui lòng điều chỉnh');
    }

    try {
      // 1. tinhTonHienTai(maKho, boLoc) từ InventoryLocation
      const invLocations = await this.inventoryLocationRepo.find({
        relations: {
          variant: {
            product: { category: true },
            size: true,
            color: true,
          },
          lot: true,
          location: {
            rack: {
              zone: {
                warehouse: true,
              },
            },
          },
        },
      });

      const filteredInv = invLocations.filter((inv) => {
        const whId = inv.location?.rack?.zone?.warehouseId;
        if (warehouseId && whId !== warehouseId) return false;
        if (variantId && inv.variantId !== variantId) return false;
        if (lotId && inv.lotId !== lotId) return false;
        if (categoryId && inv.variant?.product?.categoryId !== categoryId)
          return false;
        return true;
      });

      const currentStock = filteredInv.reduce(
        (sum, inv) => sum + Number(inv.quantity || 0),
        0,
      );

      // 2. tongHopNhapXuatTrongKy(maKho, tuNgay, denNgay, boLoc)
      const completedImports = await this.importReceiptRepo.find({
        where: warehouseId
          ? { warehouseId, status: 'COMPLETED' }
          : { status: 'COMPLETED' },
        relations: { importDetails: { variant: { product: true } } },
      });

      let totalImported = 0;
      for (const imp of completedImports) {
        const dt = new Date(imp.importDate);
        if (start && dt < start) continue;
        if (end && dt > end) continue;
        for (const d of imp.importDetails || []) {
          if (variantId && d.variantId !== variantId) continue;
          if (lotId && d.lotId !== lotId) continue;
          if (categoryId && d.variant?.product?.categoryId !== categoryId)
            continue;
          totalImported += Number(d.quantity || 0);
        }
      }

      const completedExports = await this.exportReceiptRepo.find({
        where: warehouseId
          ? { warehouseId, status: 'COMPLETED' }
          : { status: 'COMPLETED' },
        relations: { exportDetails: { variant: { product: true } } },
      });

      let totalExported = 0;
      for (const exp of completedExports) {
        const dt = new Date(exp.exportDate);
        if (start && dt < start) continue;
        if (end && dt > end) continue;
        for (const d of exp.exportDetails || []) {
          if (variantId && d.variantId !== variantId) continue;
          if (lotId && d.lotId !== lotId) continue;
          if (categoryId && d.variant?.product?.categoryId !== categoryId)
            continue;
          totalExported += Number(d.quantity || 0);
        }
      }

      // 3. opt: tongHopTheoTrangThaiChatLuong(maKho, boLoc)
      const qualityChecks = await this.qualityCheckRepo.find({
        relations: {
          status: true,
          lot: { variant: { product: true } },
        },
      });
      const qualitySummary: Record<string, number> = {};
      for (const qc of qualityChecks) {
        if (lotId && qc.lotId !== lotId) continue;
        if (variantId && qc.lot?.variantId !== variantId) continue;
        if (categoryId && qc.lot?.variant?.product?.categoryId !== categoryId)
          continue;
        const statusName = qc.status?.name || 'UNKNOWN';
        qualitySummary[statusName] =
          (qualitySummary[statusName] || 0) + Number(qc.quantity || 0);
      }

      // 4. laySucChuaToiDa(maKho) từ StorageLocation -> sucChuaConLai = sucChuaToiDa - luongDangLuu
      const allLocations = await this.locationRepo.find({
        relations: { rack: { zone: true } },
      });
      const targetLocations = warehouseId
        ? allLocations.filter((l) => l.rack?.zone?.warehouseId === warehouseId)
        : allLocations;

      const maxCapacity = targetLocations.reduce(
        (sum, l) => sum + Number(l.capacity || 0),
        0,
      );
      const currentlyStoredInLocations = targetLocations.reduce(
        (sum, l) => sum + Number(l.currentQuantity || 0),
        0,
      );
      const remainingCapacity = Math.max(
        0,
        maxCapacity - currentlyStoredInLocations,
      );

      if (
        filteredInv.length === 0 &&
        totalImported === 0 &&
        totalExported === 0
      ) {
        return {
          message: 'Không có dữ liệu phù hợp',
          data: {
            currentStock: 0,
            totalImported: 0,
            totalExported: 0,
            maxCapacity,
            remainingCapacity,
            items: [],
          },
        };
      }

      return {
        message: 'Thống kê hàng hóa thành công',
        data: {
          queriedAt: new Date().toISOString(),
          appliedFilters: params,
          currentStock,
          totalImported,
          totalExported,
          maxCapacity,
          currentlyStoredInLocations,
          remainingCapacity,
          qualitySummary,
          stockDetails: filteredInv.map((inv) => ({
            inventoryLocationId: inv.inventoryLocationId,
            productName: inv.variant?.product?.name,
            sku: inv.variant?.sku,
            size: inv.variant?.size?.name,
            color: inv.variant?.color?.name,
            lotCode: inv.lot?.lotCode,
            locationCode: inv.location?.code,
            warehouseName: inv.location?.rack?.zone?.warehouse?.name,
            quantity: inv.quantity,
          })),
        },
      };
    } catch (error) {
      this.logger.error('Lỗi khi thống kê hàng hóa: ', error);
      throw new InternalServerErrorException('Không thể tạo báo cáo thống kê');
    }
  }
}
