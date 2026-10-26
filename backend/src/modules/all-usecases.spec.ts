/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WarehousesService } from './warehouses/warehouses.service';
import { ProductsService } from './products/products.service';
import { ReceiptsService } from './receipts/receipts.service';
import { ReportsService } from './reports/reports.service';
import { IncidentsService } from './incidents/incidents.service';
import { ContractsService } from './contracts/contracts.service';
import { ChatService } from './chat/chat.service';
import { HrService } from './hr/hr.service';
import { SystemService } from './system/system.service';

describe('Kiểm thử toàn diện các Use Case theo Sequence Diagram (UC01 -> UC23)', () => {
  // =========================================================================
  // UC03 & UC04: WarehousesService
  // =========================================================================
  describe('UC03 & UC04 - Quản lý & Xem chi tiết Kho', () => {
    let service: WarehousesService;
    let mockWhRepo: any;
    let mockExpRepo: any;
    let mockIncidentRepo: any;

    beforeEach(() => {
      mockWhRepo = { find: jest.fn(), findOne: jest.fn(), count: jest.fn() };
      mockExpRepo = { find: jest.fn().mockResolvedValue([]) };
      mockIncidentRepo = { count: jest.fn().mockResolvedValue(0) };

      service = new WarehousesService(
        mockWhRepo,
        {} as any,
        {} as any,
        {} as any,
        mockExpRepo,
        {} as any,
        mockIncidentRepo,
      );
    });

    it('UC03: Trả về "Chưa có dữ liệu kho" khi danh sách kho trống', async () => {
      mockWhRepo.find.mockResolvedValue([]);
      const res = await service.findAll();
      expect(res.message).toBe('Chưa có dữ liệu kho');
      expect(res.data).toEqual([]);
    });

    it('UC03: Ném InternalServerErrorException("Không thể tải danh sách kho") khi lỗi truy vấn', async () => {
      mockWhRepo.find.mockRejectedValue(new Error('DB Error'));
      await expect(service.findAll()).rejects.toThrow(
        new InternalServerErrorException('Không thể tải danh sách kho'),
      );
    });

    it('UC04: Ném NotFoundException("Không tìm thấy kho") khi kho không tồn tại hoặc INACTIVE', async () => {
      mockWhRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Không tìm thấy kho'),
      );
    });

    it('UC04: Trả về thông tin hiện có khi kho thiếu một số trường (isPartialData = true)', async () => {
      mockWhRepo.findOne.mockResolvedValue({
        warehouseId: 1,
        name: 'Kho A',
        status: 'ACTIVE',
        zones: [],
      });
      const res = await service.findOne(1);
      expect(res.data.isPartialData).toBe(true);
      expect(res.message).toContain('Chỉ hiển thị các thông tin hiện có');
    });
  });

  // =========================================================================
  // UC05: ProductsService
  // =========================================================================
  describe('UC05 - Xem chi tiết hàng hóa', () => {
    let service: ProductsService;
    let mockProdRepo: any;

    beforeEach(() => {
      mockProdRepo = { find: jest.fn(), findOne: jest.fn(), count: jest.fn() };
      service = new ProductsService(
        mockProdRepo,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );
    });

    it('UC05: Trả về "Hiển thị kết quả rỗng" khi không tìm thấy hàng hóa', async () => {
      mockProdRepo.findOne.mockResolvedValue(null);
      const res = await service.findOne(999);
      expect(res.message).toBe('Hiển thị kết quả rỗng');
      expect(res.data).toBeNull();
    });

    it('UC05: Trả về "Hiển thị các trường hiện có" khi thiếu phần ghi chú/mô tả', async () => {
      mockProdRepo.findOne.mockResolvedValue({
        productId: 2,
        name: 'Quần Jeans',
        unit: 'Chiếc',
        status: 'ACTIVE',
        description: null,
        variants: [],
      });
      const res = await service.findOne(2);
      expect(res.message).toBe('Hiển thị các trường hiện có');
      expect(res.data?.isPartialData).toBe(true);
    });
  });

  // =========================================================================
  // UC01 & UC02: ReceiptsService
  // =========================================================================
  describe('UC01 & UC02 - Tạo và Theo dõi Phiếu Xuất/Nhập', () => {
    let service: ReceiptsService;
    let mockImpRepo: any;
    let mockImpDetailRepo: any;
    let mockExpRepo: any;
    let mockExpDetailRepo: any;
    let mockWhRepo: any;
    let mockVarRepo: any;
    let mockLotRepo: any;
    let mockLocRepo: any;
    let mockInvLocRepo: any;
    let mockDataSource: any;

    beforeEach(() => {
      mockImpRepo = {
        save: jest.fn((x) => Promise.resolve({ importId: 10, ...x })),
        findOne: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
      };
      mockImpDetailRepo = {
        create: jest.fn((x) => x),
        save: jest.fn((x) => Promise.resolve(x)),
      };
      mockExpRepo = {
        save: jest.fn((x) => Promise.resolve({ exportId: 20, ...x })),
        findOne: jest.fn(),
        find: jest.fn().mockResolvedValue([]),
      };
      mockExpDetailRepo = {
        create: jest.fn((x) => x),
        save: jest.fn((x) => Promise.resolve(x)),
      };
      mockWhRepo = { findOne: jest.fn() };
      mockVarRepo = { findOne: jest.fn() };
      mockLotRepo = { findOne: jest.fn(), save: jest.fn() };
      mockLocRepo = { findOne: jest.fn(), save: jest.fn() };
      mockInvLocRepo = {
        findOne: jest.fn(),
        create: jest.fn((x) => x),
        save: jest.fn(),
      };
      mockDataSource = {
        transaction: jest.fn(async (cb) => {
          const manager = {
            getRepository: (ent: any) => {
              switch (ent.name) {
                case 'ImportReceipt':
                  return mockImpRepo;
                case 'ImportDetail':
                  return mockImpDetailRepo;
                case 'ExportReceipt':
                  return mockExpRepo;
                case 'ExportDetail':
                  return mockExpDetailRepo;
                case 'Lot':
                  return mockLotRepo;
                case 'InventoryLocation':
                  return mockInvLocRepo;
                case 'StorageLocation':
                  return mockLocRepo;
                default:
                  return {};
              }
            },
          };
          return cb(manager);
        }),
      };

      service = new ReceiptsService(
        mockImpRepo,
        mockImpDetailRepo,
        mockExpRepo,
        mockExpDetailRepo,
        mockWhRepo,
        mockVarRepo,
        mockLotRepo,
        mockLocRepo,
        mockInvLocRepo,
        {} as any,
        mockDataSource,
      );
    });

    it('UC01: Ném BadRequestException khi số lượng <= 0 hoặc thiếu dữ liệu', async () => {
      await expect(
        service.createAndProcessReceipt({
          receiptType: 'IMPORT',
          warehouseId: 1,
          saveMode: 'DRAFT',
          items: [{ variantId: 1, quantity: 0 }],
        }),
      ).rejects.toThrow(
        new BadRequestException('Dữ liệu không hợp lệ, vui lòng chỉnh sửa'),
      );
    });

    it('UC01: Ném BadRequestException khi kho/biến thể không tồn tại hoặc không khả dụng', async () => {
      mockWhRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createAndProcessReceipt({
          receiptType: 'IMPORT',
          warehouseId: 99,
          saveMode: 'DRAFT',
          items: [{ variantId: 1, quantity: 10 }],
        }),
      ).rejects.toThrow(
        new BadRequestException('Vui lòng chọn lại kho/biến thể/lô/vị trí'),
      );
    });

    it('UC01: Ném BadRequestException khi phiếu Xuất vượt tồn khả dụng', async () => {
      mockWhRepo.findOne.mockResolvedValue({
        warehouseId: 1,
        status: 'ACTIVE',
      });
      mockVarRepo.findOne.mockResolvedValue({ variantId: 1, status: 'ACTIVE' });
      mockLotRepo.findOne.mockResolvedValue({
        lotId: 5,
        variantId: 1,
        status: 'AVAILABLE',
        remainingQuantity: 10,
        qualityChecks: [],
      });

      await expect(
        service.createAndProcessReceipt({
          receiptType: 'EXPORT',
          warehouseId: 1,
          saveMode: 'COMPLETED',
          items: [{ variantId: 1, lotId: 5, quantity: 50 }],
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Không đủ tồn khả dụng hoặc hàng không được phép xuất',
        ),
      );
    });

    it('UC01: Lưu phiếu ở trạng thái Nháp thành công mà KHÔNG tác động tồn kho', async () => {
      mockWhRepo.findOne.mockResolvedValue({
        warehouseId: 1,
        status: 'ACTIVE',
      });
      mockVarRepo.findOne.mockResolvedValue({ variantId: 1, status: 'ACTIVE' });

      const res = await service.createAndProcessReceipt({
        receiptType: 'IMPORT',
        warehouseId: 1,
        saveMode: 'DRAFT',
        items: [{ variantId: 1, quantity: 25 }],
      });

      expect(res.message).toBe('Đã lưu nháp phiếu');
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('UC01: Hoàn tất phiếu Nhập trong Transaction và cộng tồn kho', async () => {
      mockWhRepo.findOne.mockResolvedValue({
        warehouseId: 1,
        status: 'ACTIVE',
      });
      mockVarRepo.findOne.mockResolvedValue({ variantId: 1, status: 'ACTIVE' });
      mockLotRepo.findOne.mockResolvedValue({
        lotId: 5,
        variantId: 1,
        status: 'AVAILABLE',
        remainingQuantity: 100,
      });
      mockImpRepo.findOne.mockResolvedValue({
        importId: 10,
        status: 'DRAFT',
      });

      const res = await service.createAndProcessReceipt({
        receiptType: 'IMPORT',
        warehouseId: 1,
        saveMode: 'COMPLETED',
        items: [{ variantId: 1, lotId: 5, quantity: 30 }],
      });

      expect(res.message).toBe('Hoàn tất phiếu');
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockLotRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ remainingQuantity: 130 }),
      );
    });

    it('UC01: Hoàn tất một phiếu Nháp có sẵn (completeDraftReceipt) và từ chối nếu đã COMPLETED', async () => {
      mockImpRepo.findOne.mockResolvedValueOnce({
        importId: 10,
        status: 'COMPLETED',
      });
      await expect(service.completeDraftReceipt('IMPORT', 10)).rejects.toThrow(
        new ConflictException('Phiếu đã được xử lý, không thể hoàn tất lại'),
      );
    });

    it('UC01: Rollback và báo ConflictException khi phiếu không còn ở trạng thái Nháp', async () => {
      mockWhRepo.findOne.mockResolvedValue({
        warehouseId: 1,
        status: 'ACTIVE',
      });
      mockVarRepo.findOne.mockResolvedValue({ variantId: 1, status: 'ACTIVE' });
      mockImpRepo.findOne.mockResolvedValue({
        importId: 10,
        status: 'COMPLETED', // Đã xử lý trước đó
      });

      await expect(
        service.createAndProcessReceipt({
          receiptType: 'IMPORT',
          warehouseId: 1,
          saveMode: 'COMPLETED',
          items: [{ variantId: 1, quantity: 30 }],
        }),
      ).rejects.toThrow(
        new ConflictException('Phiếu đã được xử lý, không thể hoàn tất lại'),
      );
    });

    it('UC02: Ném BadRequestException khi lọc tuNgay > denNgay', async () => {
      await expect(
        service.findAll({
          fromDate: '2026-10-20',
          toDate: '2026-10-01',
        }),
      ).rejects.toThrow(
        new BadRequestException('Bộ lọc không hợp lệ, vui lòng nhập lại'),
      );
    });
  });

  // =========================================================================
  // UC15, UC16, UC17, UC20: ReportsService
  // =========================================================================
  describe('UC15, UC16, UC17, UC20 - Báo cáo Doanh thu, Dự báo, Hiệu suất & Thống kê', () => {
    let service: ReportsService;
    let mockExpRepo: any;
    let mockImpRepo: any;
    let mockWhRepo: any;
    let mockLocRepo: any;
    let mockInvLocRepo: any;
    let mockQcRepo: any;

    beforeEach(() => {
      mockExpRepo = { find: jest.fn() };
      mockImpRepo = { find: jest.fn() };
      mockWhRepo = { findOne: jest.fn() };
      mockLocRepo = { find: jest.fn() };
      mockInvLocRepo = { find: jest.fn() };
      mockQcRepo = { find: jest.fn() };

      service = new ReportsService(
        mockExpRepo,
        {} as any,
        mockImpRepo,
        {} as any,
        mockWhRepo,
        mockLocRepo,
        mockInvLocRepo,
        mockQcRepo,
      );
    });

    it('UC15: Tính toán doanh thu chính xác = Σ(soLuong * donGiaBan) - giamGia', async () => {
      mockExpRepo.find.mockResolvedValue([
        {
          exportId: 1,
          status: 'COMPLETED',
          reason: 'Xuất bán',
          exportDate: new Date('2026-08-15T10:00:00Z'),
          exportDetails: [
            { quantity: 10, unitPrice: 200000, discount: 100000 },
            { quantity: 5, unitPrice: 300000, discount: 0 },
          ],
        },
      ]);

      const res = await service.calculateRevenue({
        fromDate: '2026-08-01',
        toDate: '2026-08-31',
      });

      expect(res.data?.revenue).toBe(3400000); // (10*200k - 100k) + (5*300k) = 1.9M + 1.5M = 3.4M
    });

    it('UC16: Dự báo doanh thu trung bình cộng 3 tháng hoàn chỉnh gần nhất (T1+T2+T3)/3', async () => {
      mockWhRepo.findOne.mockResolvedValue({ warehouseId: 1 });
      mockExpRepo.find.mockResolvedValue([
        {
          exportId: 1,
          warehouseId: 1,
          status: 'COMPLETED',
          reason: 'Xuất bán',
          exportDate: new Date('2026-07-15T10:00:00Z'),
          exportDetails: [{ quantity: 10, unitPrice: 100000, discount: 0 }], // 1,000,000
        },
        {
          exportId: 2,
          warehouseId: 1,
          status: 'COMPLETED',
          reason: 'Xuất bán',
          exportDate: new Date('2026-08-15T10:00:00Z'),
          exportDetails: [{ quantity: 20, unitPrice: 100000, discount: 0 }], // 2,000,000
        },
        {
          exportId: 3,
          warehouseId: 1,
          status: 'COMPLETED',
          reason: 'Xuất bán',
          exportDate: new Date('2026-09-15T10:00:00Z'),
          exportDetails: [{ quantity: 30, unitPrice: 100000, discount: 0 }], // 3,000,000
        },
      ]);

      const res = await service.forecastRevenue(1, '2026-10-26');
      expect(res.message).toBe('Dự báo doanh thu thành công');
      expect(res.data.forecastNextMonth).toBe(2000000);
    });

    it('UC17: Ném BadRequestException khi tiêu chí đánh giá chưa được định nghĩa', async () => {
      await expect(
        service.evaluatePerformance({ metricType: 'UNKNOWN_METRIC' }),
      ).rejects.toThrow(
        new BadRequestException(
          'Chưa định nghĩa tiêu chí, không thực hiện tính toán',
        ),
      );
    });

    it('UC20: Tính đúng sức chứa còn lại = sucChuaToiDa - luongDangLuu', async () => {
      mockInvLocRepo.find.mockResolvedValue([
        {
          inventoryLocationId: 1,
          variantId: 1,
          lotId: 1,
          quantity: 120,
          location: { code: 'LOC-A1', rack: { zone: { warehouseId: 1 } } },
        },
      ]);
      mockImpRepo.find.mockResolvedValue([]);
      mockExpRepo.find.mockResolvedValue([]);
      mockQcRepo.find.mockResolvedValue([]);
      mockLocRepo.find.mockResolvedValue([
        {
          capacity: 500,
          currentQuantity: 120,
          rack: { zone: { warehouseId: 1 } },
        },
      ]);

      const res = await service.getInventoryStatistics({ warehouseId: 1 });
      expect(res.data.maxCapacity).toBe(500);
      expect(res.data.remainingCapacity).toBe(380);
    });
  });

  // =========================================================================
  // UC06, UC07, UC10: IncidentsService
  // =========================================================================
  describe('UC06, UC07, UC10 - Cơ sở vật chất, Sự cố & Xác nhận sửa chữa', () => {
    let service: IncidentsService;
    let mockIncidentRepo: any;

    beforeEach(() => {
      mockIncidentRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn((x) => x),
        save: jest.fn((x) => Promise.resolve({ incidentId: 1, ...x })),
      };
      service = new IncidentsService(mockIncidentRepo, {} as any, {} as any);
    });

    it('UC07: Lưu sự cố mới ở trạng thái "Mới"', async () => {
      const res = await service.createIncident({
        locationDescription: 'Kệ A1',
        description: 'Gãy thanh ngang',
      });
      expect(res.message).toBe('Lưu sự cố thành công');
      expect(res.data.status).toBe('Mới');
    });

    it('UC10: Chuyển trạng thái sang "Đã đóng" khi xác nhận sửa chữa Đạt yêu cầu', async () => {
      mockIncidentRepo.findOne.mockResolvedValue({
        incidentId: 1,
        status: 'Chờ xác nhận',
      });
      const res = await service.confirmRepair(1, {
        result: 'DAT',
        note: 'Đã hàn gia cố',
      });
      expect(res.message).toBe('Đóng sự cố thành công');
      expect(res.data.status).toBe('Đã đóng');
    });

    it('UC10: Chuyển lại trạng thái "Đang xử lý" khi xác nhận Chưa đạt yêu cầu', async () => {
      mockIncidentRepo.findOne.mockResolvedValue({
        incidentId: 1,
        status: 'Chờ xác nhận',
      });
      const res = await service.confirmRepair(1, {
        result: 'CHUA_DAT',
        note: 'Vẫn còn rung lắc',
      });
      expect(res.message).toBe('Chuyển lại trạng thái Đang xử lý');
      expect(res.data.status).toBe('Đang xử lý');
    });
  });

  // =========================================================================
  // UC08 & UC09: ContractsService
  // =========================================================================
  describe('UC08 & UC09 - Quản lý Hợp đồng thuê & Theo dõi thời hạn', () => {
    let service: ContractsService;
    let mockContractRepo: any;
    let mockWhRepo: any;
    let mockEmpRepo: any;

    beforeEach(() => {
      mockContractRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn((x) => x),
        save: jest.fn((x) => Promise.resolve({ contractId: 1, ...x })),
        remove: jest.fn().mockResolvedValue(undefined),
      };
      mockWhRepo = { findOne: jest.fn().mockResolvedValue({ warehouseId: 1 }) };
      mockEmpRepo = {
        findOne: jest.fn().mockResolvedValue({ email: 'qlkho@test.vn' }),
      };

      service = new ContractsService(mockContractRepo, mockWhRepo, mockEmpRepo);
    });

    it('UC08: Từ chối xóa hợp đồng đang hiệu lực ("DangHieuLuc")', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        contractId: 1,
        status: 'DangHieuLuc',
      });
      await expect(service.remove(1)).rejects.toThrow(
        new BadRequestException(
          'Không thể xóa hợp đồng đang hiệu lực, vui lòng chấm dứt trước',
        ),
      );
    });

    it('UC08: Từ chối gia hạn khi hợp đồng đã chấm dứt hoặc ngày kết thúc mới không hợp lệ', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        contractId: 1,
        status: 'DaChamDut',
        endDate: new Date('2026-12-31'),
      });
      await expect(
        service.renew(1, { newEndDate: '2027-12-31' }),
      ).rejects.toThrow(
        new BadRequestException(
          'Không thể gia hạn: hợp đồng đã chấm dứt hoặc ngày kết thúc mới phải sau ngày kết thúc hiện tại',
        ),
      );
    });

    it('UC09: Phân loại đúng trạng thái "Sắp hết hạn" (còn từ 0 đến 14 ngày)', () => {
      const target = new Date();
      target.setDate(target.getDate() + 7);
      const info = service.computeTermInfo(new Date('2025-01-01'), target);
      expect(info?.termStatus).toBe('Sắp hết hạn');
      expect(info?.warningMessage).toBe('Hợp đồng sắp hết hạn / đã hết hạn');
    });
  });

  // =========================================================================
  // UC11 & UC12: ChatService
  // =========================================================================
  describe('UC11 & UC12 - Xem cuộc trò chuyện & Gửi/nhận tin nhắn', () => {
    let service: ChatService;
    let mockParticipantRepo: any;
    let mockMsgRepo: any;

    beforeEach(() => {
      mockParticipantRepo = { find: jest.fn(), findOne: jest.fn() };
      mockMsgRepo = {
        find: jest.fn(),
        create: jest.fn((x) => x),
        save: jest.fn((x) => Promise.resolve({ messageId: 1, ...x })),
        findOne: jest.fn(),
      };
      service = new ChatService(
        {} as any,
        mockParticipantRepo,
        mockMsgRepo,
        {} as any,
      );
    });

    it('UC11: Từ chối hiển thị tin nhắn nếu user không thuộc cuộc trò chuyện', async () => {
      mockParticipantRepo.findOne.mockResolvedValue(null);
      await expect(service.getMessages(1, 99)).rejects.toThrow(
        new ForbiddenException('Từ chối hiển thị: Không có quyền truy cập'),
      );
    });

    it('UC12: Từ chối gửi tin nhắn nếu không phải thành viên cuộc trò chuyện', async () => {
      mockParticipantRepo.findOne.mockResolvedValue(null);
      await expect(
        service.sendMessage(1, 99, { content: 'Xin chào' }),
      ).rejects.toThrow(
        new ForbiddenException(
          'Từ chối: Bạn không tham gia cuộc trò chuyện này',
        ),
      );
    });
  });

  // =========================================================================
  // UC21 & UC22: HrService
  // =========================================================================
  describe('UC21 & UC22 - Xem lương thưởng & Xem thông tin công việc', () => {
    let service: HrService;
    let mockSalaryRepo: any;
    let mockTaskRepo: any;

    beforeEach(() => {
      mockSalaryRepo = { find: jest.fn() };
      mockTaskRepo = { find: jest.fn() };
      service = new HrService(
        mockSalaryRepo,
        mockTaskRepo,
        {} as any,
        {} as any,
      );
    });

    it('UC21: Nhân viên chỉ được truy vấn bảng lương cá nhân (PERSONAL_ONLY)', async () => {
      mockSalaryRepo.find.mockResolvedValue([{ salaryId: 1, employeeId: 5 }]);
      const res = await service.getSalaries({
        userRole: 'USER',
        employeeId: 5,
      });
      expect(mockSalaryRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { employeeId: 5 },
        }),
      );
      expect((res.data as any).scope).toBe('PERSONAL_ONLY');
    });

    it('UC22: Trả về "Không có dữ liệu công việc" khi danh sách trống', async () => {
      mockTaskRepo.find.mockResolvedValue([]);
      const res = await service.getWorkTasks({
        userRole: 'USER',
        employeeId: 5,
      });
      expect(res.message).toBe('Không có dữ liệu công việc');
    });
  });

  // =========================================================================
  // UC19 & UC23: SystemService
  // =========================================================================
  describe('UC19 & UC23 - Sao lưu dữ liệu & Xem lỗi hệ thống', () => {
    let service: SystemService;
    let mockBackupRepo: any;
    let mockErrRepo: any;
    let mockWhRepo: any;

    beforeEach(() => {
      mockBackupRepo = {
        save: jest.fn((x) => Promise.resolve({ backupId: 1, ...x })),
        find: jest.fn().mockResolvedValue([]),
      };
      mockErrRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
      };
      mockWhRepo = { find: jest.fn().mockResolvedValue([]) };
      service = new SystemService(
        mockBackupRepo,
        mockErrRepo,
        mockWhRepo,
        { find: jest.fn().mockResolvedValue([]) } as any,
        { find: jest.fn().mockResolvedValue([]) } as any,
        { find: jest.fn().mockResolvedValue([]) } as any,
      );
    });

    it('UC19: Ghi nhận nhật ký FAILED và báo lỗi khi không đủ dung lượng hoặc lỗi tiến trình sao lưu', async () => {
      await expect(
        service.runBackup({
          userRole: 'ADMIN',
          userId: 1,
          simulateDiskError: true,
        }),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'Sao lưu thất bại do không đủ dung lượng hoặc lỗi hệ thống',
        ),
      );
      expect(mockBackupRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'FAILED' }),
      );
    });

    it('UC19: Trả về cảnh báo khi sao lưu file thành công nhưng lỗi ghi nhật ký vào CSDL', async () => {
      const res = await service.runBackup({
        userRole: 'ADMIN',
        userId: 1,
        simulateLogError: true,
      });
      expect(res.message).toBe(
        'Sao lưu thành công nhưng cảnh báo: Không thể ghi nhật ký hệ thống',
      );
    });

    it('UC23: Trả về "Hiển thị danh sách trống" khi không có lỗi hệ thống', async () => {
      mockErrRepo.find.mockResolvedValue([]);
      const res = await service.getErrorLogs();
      expect(res.message).toBe('Hiển thị danh sách trống');
    });
  });
});
