import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import {
  CreateContractDto,
  UpdateContractDto,
  RenewContractDto,
} from './dto/contract.dto';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * UC08 - Xem danh sách hợp đồng
   */
  @Get()
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền quản lý hợp đồng')
  async findAll() {
    return this.contractsService.findAll();
  }

  /**
   * UC09 - Kích hoạt kiểm tra hợp đồng sắp hết hạn và gửi email cảnh báo
   */
  @Post('check-expiry')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền thực hiện thao tác này')
  async checkExpiry() {
    return this.contractsService.checkAndSendExpiryWarnings();
  }

  /**
   * UC08 - Xem chi tiết hợp đồng (<<include>> UC09)
   */
  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền quản lý hợp đồng')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  /**
   * UC09 - Xem thời hạn hợp đồng
   */
  @Get(':id/term')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền quản lý hợp đồng')
  async getTerm(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.getContractTerm(id);
  }

  /**
   * UC08 - Thêm hợp đồng
   */
  @Post()
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền thực hiện thao tác này')
  async create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  /**
   * UC08 - Sửa hợp đồng
   */
  @Put(':id')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền thực hiện thao tác này')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, dto);
  }

  /**
   * UC08 - Gia hạn hợp đồng
   */
  @Patch(':id/renew')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền thực hiện thao tác này')
  async renew(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RenewContractDto,
  ) {
    return this.contractsService.renew(id, dto);
  }

  /**
   * UC08 - Chấm dứt hợp đồng
   */
  @Patch(':id/terminate')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền thực hiện thao tác này')
  async terminate(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.terminate(id);
  }

  /**
   * UC08 - Xóa hợp đồng
   */
  @Delete(':id')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền thực hiện thao tác này')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.remove(id);
  }
}
