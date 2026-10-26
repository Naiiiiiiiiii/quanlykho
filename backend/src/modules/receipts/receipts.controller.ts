import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { FilterReceiptDto } from './dto/filter-receipt.dto';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  /**
   * UC01 - Tạo và xử lý phiếu nhập/xuất
   * UI -> HT : guiYeuCauLapPhieu(loaiPhieu, thongTinChung, dsChiTiet, cheDoLuu)
   */
  @Post()
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền thực hiện thao tác')
  async create(
    @Body() createReceiptDto: CreateReceiptDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    return this.receiptsService.createAndProcessReceipt(
      createReceiptDto,
      user?.employeeId,
    );
  }

  /**
   * UC02 - Theo dõi phiếu nhập/xuất (Danh sách mặc định & Lọc danh sách)
   * UI -> HT : layDanhSachPhieu() / locDanhSachPhieu(boLoc)
   */
  @Get()
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền xem phiếu nhập/xuất')
  async findAll(@Query() filterDto: FilterReceiptDto) {
    return this.receiptsService.findAll(filterDto);
  }

  /**
   * UC02 - Xem chi tiết phiếu
   * UI -> HT : layChiTietPhieu(maPhieu)
   */
  @Get(':type/:id')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền xem phiếu nhập/xuất')
  async findOne(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.receiptsService.findOne(type, id);
  }

  /**
   * UC01 - Xác nhận hoàn tất một phiếu đang ở trạng thái Nháp (DRAFT -> COMPLETED)
   * UI -> HT : xacNhanHoanTatPhieu(maPhieu)
   */
  @Patch(':type/:id/complete')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Không có quyền thực hiện thao tác')
  async completeDraft(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.receiptsService.completeDraftReceipt(type, id);
  }
}
