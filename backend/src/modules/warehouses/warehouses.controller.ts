import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  /**
   * UC03 - Xem danh sách kho
   * UI -> HT : yeuCauXemDanhSachKho()
   * HT -> HT : kiemTraQuyenXemDanhSachKho()
   */
  @Get()
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền xem danh sách kho')
  async findAll() {
    return this.warehousesService.findAll();
  }

  /**
   * UC04 - Xem chi tiết kho
   * UI -> HT : yeuCauXemChiTietKho(maKho)
   * HT -> HT : kiemTraQuyenXemThongTinKho()
   */
  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền xem thông tin kho')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findOne(id);
  }
}
