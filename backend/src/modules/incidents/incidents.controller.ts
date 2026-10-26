import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import {
  CreateIncidentDto,
  ConfirmIncidentRepairDto,
} from './dto/incident.dto';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  /**
   * UC06 - Theo dõi cơ sở vật chất & sự cố
   * UI -> System : yeuCauLayDanhSach()
   */
  @Get()
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Từ chối thao tác')
  async findAll() {
    return this.incidentsService.getFacilitiesAndIncidents();
  }

  /**
   * UC10 - Xem chi tiết sự cố
   * UI -> System : yeuCauLayChiTietSuCo()
   */
  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Từ chối thao tác / Không tìm thấy')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidentsService.getIncidentDetail(id);
  }

  /**
   * UC07 - Ghi nhận sự cố
   * UI -> System : yeuCauTaoSuCo(thongTin)
   */
  @Post()
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Từ chối thao tác')
  async create(
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    return this.incidentsService.createIncident(dto, user?.employeeId);
  }

  /**
   * UC10 - Xác nhận sửa chữa
   * UI -> System : yeuCauCapNhatKetQua(ketQua)
   */
  @Patch(':id/confirm')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Từ chối thao tác / Không tìm thấy')
  async confirmRepair(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmIncidentRepairDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    return this.incidentsService.confirmRepair(id, dto, user?.employeeId);
  }
}
