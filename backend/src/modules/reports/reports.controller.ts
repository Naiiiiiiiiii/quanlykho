import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * UC15 - Tính toán doanh thu
   * UI -> HT : yeuCauTinhDoanhThu(maKho, tuNgay, denNgay)
   */
  @Get('revenue')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền xem báo cáo')
  async calculateRevenue(
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportsService.calculateRevenue({
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      fromDate,
      toDate,
    });
  }

  /**
   * UC16 - Dự báo doanh thu
   * UI -> HT : yeuCauDuBaoDoanhThu(maKho)
   */
  @Get('revenue-forecast')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền xem báo cáo')
  async forecastRevenue(
    @Query('warehouseId') warehouseId?: string,
    @Query('referenceDate') referenceDate?: string,
  ) {
    return this.reportsService.forecastRevenue(
      warehouseId ? Number(warehouseId) : undefined,
      referenceDate,
    );
  }

  /**
   * UC17 - Đánh giá hiệu suất hoạt động
   * UI -> System : yeuCauDanhGiaHieuSuat(maKho, kyDanhGia, loaiChiSo, userId)
   */
  @Get('performance')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền xem báo cáo')
  async evaluatePerformance(
    @Query('warehouseId') warehouseId?: string,
    @Query('period') period?: string,
    @Query('metricType') metricType?: string,
  ) {
    return this.reportsService.evaluatePerformance({
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      period,
      metricType,
    });
  }

  /**
   * UC20 - Thống kê hàng hóa
   * UI -> HT : yeuCauThongKeHangHoa(maKho, tuNgay, denNgay, boLoc)
   */
  @Get('inventory-statistics')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền xem thống kê')
  async getInventoryStatistics(
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('variantId') variantId?: string,
    @Query('lotId') lotId?: string,
  ) {
    return this.reportsService.getInventoryStatistics({
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      fromDate,
      toDate,
      categoryId: categoryId ? Number(categoryId) : undefined,
      variantId: variantId ? Number(variantId) : undefined,
      lotId: lotId ? Number(lotId) : undefined,
    });
  }
}
