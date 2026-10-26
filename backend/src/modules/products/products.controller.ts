import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * UC05 - Tìm kiếm hoặc chọn hàng hóa
   * User -> UI : timKiemHoacChonHangHoa()
   */
  @Get()
  async findAll(@Query('keyword') keyword?: string) {
    return this.productsService.findAll(keyword);
  }

  /**
   * UC05 - Xem chi tiết hàng hóa
   * UI -> System : yeuCauXemChiTiet(idHangHoa)
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
