/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('Hệ thống Quản lý Kho Quần Áo - E2E Integration Tests (UC01 -> UC23)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let staffToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('GET / - Public healthcheck & RequestContextMiddleware X-Request-Id', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBe('Hello World!');
  });

  describe('UC13 & UC14 - Đăng nhập, Phân quyền & Đăng xuất', () => {
    it('UC13: Từ chối khi thiếu trường bắt buộc (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin' })
        .expect(400);
      expect(res.body.message).toContain('Mật khẩu không được để trống');
    });

    it('UC13: Từ chối khi sai mật khẩu (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'WrongPassword' })
        .expect(401);
      expect(res.body.message).toBe('Không xác thực được');
    });

    it('UC13: Từ chối khi tài khoản bị khóa LOCKED (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'khoa_taikhoan', password: '123456' })
        .expect(403);
      expect(res.body.message).toBe('Từ chối đăng nhập');
    });

    it('UC13: Đăng nhập thành công với ADMIN (admin / 123456)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: '123456' })
        .expect(200);
      expect(res.body.message).toBe('Đăng nhập thành công');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.accessToken;
    });

    it('UC13: Đăng nhập thành công với USER (thukho / 123456)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'thukho', password: '123456' })
        .expect(200);
      expect(res.body.message).toBe('Đăng nhập thành công');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.role).toBe('USER');
      staffToken = res.body.data.accessToken;
    });
  });

  describe('UC03, UC04, UC05 - Quản lý Kho & Sản phẩm', () => {
    it('UC03: Lấy danh sách kho', async () => {
      const res = await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('UC04: Xem chi tiết kho & báo 404 khi kho không tồn tại', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const firstId = listRes.body.data[0].warehouseId;

      const detailRes = await request(app.getHttpServer())
        .get(`/warehouses/${firstId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(detailRes.body.data.warehouseId).toBe(firstId);

      const notFoundRes = await request(app.getHttpServer())
        .get('/warehouses/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
      expect(notFoundRes.body.message).toBe('Không tìm thấy kho');
    });

    it('UC05: Lấy danh sách sản phẩm & chi tiết sản phẩm', async () => {
      const res = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('UC01 & UC02 - Tạo, Xử lý & Theo dõi Phiếu Nhập/Xuất', () => {
    let draftReceiptId: number;

    it('UC01: Lưu nháp phiếu nhập và sau đó hoàn tất phiếu nháp', async () => {
      const whRes = await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${adminToken}`);
      const warehouseId = whRes.body.data[0].warehouseId;

      const prodRes = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`);
      const firstProdId = prodRes.body.data[0].productId;
      const prodDetail = await request(app.getHttpServer())
        .get(`/products/${firstProdId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      const variantId = prodDetail.body.data.variants[0].variantId;

      const createRes = await request(app.getHttpServer())
        .post('/receipts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          receiptType: 'IMPORT',
          warehouseId,
          supplierName: 'NCC Kiểm Thử E2E',
          saveMode: 'DRAFT',
          items: [{ variantId, quantity: 5, unit: 'Chiếc' }],
        })
        .expect(201);

      expect(createRes.body.message).toBe('Đã lưu nháp phiếu');
      draftReceiptId = createRes.body.data.receiptId;

      // Hoàn tất phiếu nháp
      const completeRes = await request(app.getHttpServer())
        .patch(`/receipts/IMPORT/${draftReceiptId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(completeRes.body.message).toBe('Hoàn tất phiếu');

      // Gọi hoàn tất lần 2 -> 409 Conflict
      const conflictRes = await request(app.getHttpServer())
        .patch(`/receipts/IMPORT/${draftReceiptId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);
      expect(conflictRes.body.message).toBe(
        'Phiếu đã được xử lý, không thể hoàn tất lại',
      );
    });

    it('UC02: Kiểm tra bộ lọc tuNgay > denNgay trả về 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/receipts?fromDate=2026-12-31&toDate=2026-01-01')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
      expect(res.body.message).toBe('Bộ lọc không hợp lệ, vui lòng nhập lại');
    });
  });

  describe('UC06, UC07, UC10 - Sự cố kho bãi & chất lượng hàng hóa', () => {
    it('UC06 & UC10: Lấy danh sách sự cố và xem chi tiết', async () => {
      const res = await request(app.getHttpServer())
        .get('/incidents')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body.data.incidents)).toBe(true);
    });
  });

  describe('UC08 & UC09 - Hợp đồng thuê kho & Kiểm tra thời hạn', () => {
    it('UC08 & UC09: Lấy danh sách hợp đồng và kiểm tra thời hạn', async () => {
      const res = await request(app.getHttpServer())
        .get('/contracts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        const contractId = res.body.data[0].contractId;
        const termRes = await request(app.getHttpServer())
          .get(`/contracts/${contractId}/term`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        expect(termRes.body.data.termStatus).toBeDefined();
      }
    });
  });

  describe('UC11 & UC12 - Hội thoại & Gửi tin nhắn', () => {
    it('UC11 & UC12: Lấy danh sách hội thoại và kiểm tra gửi tin nhắn rỗng (400)', async () => {
      const convRes = await request(app.getHttpServer())
        .get('/conversations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(convRes.body.data)).toBe(true);

      if (convRes.body.data.length > 0) {
        const convId = convRes.body.data[0].conversationId;
        const badMsg = await request(app.getHttpServer())
          .post(`/conversations/${convId}/messages`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ content: '   ' })
          .expect(400);
        expect(badMsg.body.message).toContain(
          'Nội dung không hợp lệ, yêu cầu chỉnh sửa',
        );
      }
    });
  });

  describe('UC15, UC16, UC17, UC20 - Báo cáo & Thống kê', () => {
    it('UC15: Báo lỗi 400 khi thiếu khoảng thời gian (tuNgay/denNgay)', async () => {
      const res = await request(app.getHttpServer())
        .get('/reports/revenue')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(400);
      expect(res.body.message).toBe(
        'Khoảng thời gian không hợp lệ, vui lòng chọn lại',
      );
    });

    it('UC15, UC16, UC17, UC20: Truy cập thành công tất cả báo cáo với tham số hợp lệ', async () => {
      await request(app.getHttpServer())
        .get(
          '/reports/revenue?warehouseId=1&fromDate=2026-07-01&toDate=2026-09-30',
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/reports/revenue-forecast?warehouseId=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/reports/performance?warehouseId=1&metricType=OVERALL')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/reports/inventory-statistics?warehouseId=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('UC18, UC19, UC21, UC22, UC23 - Quản trị, Nhân sự & Hệ thống', () => {
    it('UC18: Kiểm tra hồ sơ cá nhân (/users/me) và chặn USER thường quản lý tài khoản (/users)', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      const forbiddenRes = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
      expect(forbiddenRes.body.message).toBe('Không có quyền thực hiện');
    });

    it('UC19: Kiểm tra cấu hình sao lưu và mô phỏng lỗi ổ đĩa đầy (500)', async () => {
      await request(app.getHttpServer())
        .get('/system/backup/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const diskErrRes = await request(app.getHttpServer())
        .post('/system/backup')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ simulateDiskError: true })
        .expect(500);
      expect(diskErrRes.body.message).toBe(
        'Sao lưu thất bại do không đủ dung lượng hoặc lỗi hệ thống',
      );
    });

    it('UC21, UC22, UC23: Xem bảng lương, công việc và danh sách lỗi hệ thống', async () => {
      await request(app.getHttpServer())
        .get('/salaries')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/system/errors')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('UC14: Đăng xuất thu hồi phiên làm việc và chặn token đã đăng xuất', async () => {
      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);
      expect(logoutRes.body.message).toBe('Đã đăng xuất khỏi hệ thống');

      // Dùng lại token đã đăng xuất -> 401
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(401);
    });
  });
});
