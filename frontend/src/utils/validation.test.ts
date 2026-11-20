import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLogin,
  validateReceipt,
  validateIncident,
  validateConfirmRepair,
  validateContract,
  validateRenewContract,
  validateUser,
  validateChatMessage,
} from './validation.ts';

describe('Frontend Validation Unit Tests (Kiểm thử xác thực giao diện)', () => {
  // --------------------------------------------------------------------------
  // 1. Kiểm thử Form Đăng nhập (Login Validation - MH-01)
  // --------------------------------------------------------------------------
  describe('1. validateLogin', () => {
    test('Từ chối khi username hoặc password rỗng/chỉ chứa khoảng trắng', () => {
      const res = validateLogin({ username: '   ', password: '' });
      assert.equal(res.isValid, false);
      assert.equal(res.errors.username, 'Tên đăng nhập không được để trống');
      assert.equal(res.errors.password, 'Mật khẩu không được để trống');
    });

    test('Từ chối khi username < 3 ký tự hoặc password < 6 ký tự', () => {
      const res = validateLogin({ username: 'ab', password: '123' });
      assert.equal(res.isValid, false);
      assert.equal(res.errors.username, 'Tên đăng nhập phải có ít nhất 3 ký tự');
      assert.equal(res.errors.password, 'Mật khẩu phải có ít nhất 6 ký tự');
    });

    test('Chấp nhận khi username và password hợp lệ', () => {
      const res = validateLogin({ username: 'admin', password: 'password123' });
      assert.equal(res.isValid, true);
      assert.equal(Object.keys(res.errors).length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Kiểm thử Form Phiếu Nhập / Xuất Kho (Receipt Validation - MH-05)
  // --------------------------------------------------------------------------
  describe('2. validateReceipt', () => {
    test('Từ chối phiếu Nhập kho khi thiếu nhà cung cấp hoặc số lượng <= 0', () => {
      const res = validateReceipt({
        receiptType: 'IMPORT',
        warehouseId: 1,
        saveMode: 'DRAFT',
        variantId: 1,
        quantity: 0,
        supplierName: '',
      });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.supplierName);
      assert.ok(res.errors.quantity);
    });

    test('Từ chối khi số lượng là NaN, số âm hoặc số thực không nguyên', () => {
      const res = validateReceipt({
        receiptType: 'IMPORT',
        warehouseId: 1,
        saveMode: 'DRAFT',
        variantId: 1,
        quantity: -5,
        supplierName: 'Công ty May Việt Tiến',
      });
      assert.equal(res.isValid, false);
      assert.equal(res.errors.quantity, 'Số lượng phải là số nguyên dương lớn hơn 0');
    });

    test('Từ chối phiếu Xuất kho khi thiếu người nhận hoặc đơn giá âm', () => {
      const res = validateReceipt({
        receiptType: 'EXPORT',
        warehouseId: 1,
        saveMode: 'COMPLETED',
        variantId: 1,
        quantity: 10,
        receiver: '',
        unitPrice: -50000,
      });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.receiver);
      assert.ok(res.errors.unitPrice);
    });

    test('Cross-field Validation: Từ chối phiếu Xuất khi số lượng vượt tồn khả dụng', () => {
      const res = validateReceipt(
        {
          receiptType: 'EXPORT',
          warehouseId: 1,
          saveMode: 'COMPLETED',
          variantId: 1,
          quantity: 50,
          receiver: 'Cửa hàng Chi nhánh 1',
          unitPrice: 150000,
        },
        30, // Tồn khả dụng = 30
      );
      assert.equal(res.isValid, false);
      assert.ok(res.errors.quantity?.includes('vượt quá tồn kho khả dụng'));
    });

    test('Chấp nhận phiếu Nhập kho hợp lệ đầy đủ', () => {
      const res = validateReceipt({
        receiptType: 'IMPORT',
        warehouseId: 1,
        saveMode: 'COMPLETED',
        variantId: 2,
        quantity: 100,
        supplierName: 'Tổng công ty Dệt May',
      });
      assert.equal(res.isValid, true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Kiểm thử Form Hợp đồng Thuê Kho (Contract Validation - MH-08)
  // --------------------------------------------------------------------------
  describe('3. validateContract & validateRenewContract', () => {
    test('Cross-field: Từ chối hợp đồng khi ngày bắt đầu sau ngày kết thúc', () => {
      const res = validateContract({
        warehouseId: 1,
        lessorName: 'Công ty Bất Động Sản Kho Bãi',
        startDate: '2026-12-31',
        endDate: '2026-01-01',
        rentalPrice: 50000000,
      });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.startDate);
      assert.ok(res.errors.endDate);
    });

    test('Từ chối hợp đồng khi giá thuê <= 0', () => {
      const res = validateContract({
        warehouseId: 1,
        lessorName: 'Công ty Bất Động Sản Kho Bãi',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        rentalPrice: 0,
      });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.rentalPrice);
    });

    test('Chấp nhận hợp đồng hợp lệ', () => {
      const res = validateContract({
        warehouseId: 1,
        lessorName: 'Công ty Bất Động Sản Kho Bãi',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        rentalPrice: 50000000,
      });
      assert.equal(res.isValid, true);
    });

    test('Cross-field: Từ chối gia hạn hợp đồng khi ngày kết thúc mới <= ngày kết thúc cũ', () => {
      const res = validateRenewContract('2026-10-01', '2026-12-31');
      assert.equal(res.isValid, false);
      assert.ok(res.errors.newEndDate?.includes('phải sau ngày hết hạn hiện tại'));
    });

    test('Chấp nhận gia hạn hợp đồng hợp lệ', () => {
      const res = validateRenewContract('2027-06-30', '2026-12-31');
      assert.equal(res.isValid, true);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Kiểm thử Form Quản lý Tài khoản (User Validation - MH-11)
  // --------------------------------------------------------------------------
  describe('4. validateUser', () => {
    test('Từ chối khi tạo tài khoản mới mà thiếu mật khẩu hoặc mật khẩu < 6 ký tự', () => {
      const res = validateUser(
        {
          username: 'thukho01',
          fullName: 'Nguyễn Văn A',
          password: '123',
          position: 'Thủ kho',
        },
        false, // Tạo mới
      );
      assert.equal(res.isValid, false);
      assert.ok(res.errors.password);
    });

    test('Format Validation: Từ chối email hoặc số điện thoại sai định dạng', () => {
      const res = validateUser(
        {
          username: 'thukho01',
          fullName: 'Nguyễn Văn A',
          password: 'password123',
          email: 'sai-dinh-dang-email',
          phone: '12345',
          position: 'Thủ kho',
        },
        false,
      );
      assert.equal(res.isValid, false);
      assert.ok(res.errors.email);
      assert.ok(res.errors.phone);
    });

    test('Khi chỉnh sửa, cho phép để trống mật khẩu nếu không muốn đổi', () => {
      const res = validateUser(
        {
          username: 'thukho01',
          fullName: 'Nguyễn Văn A',
          password: '', // Để trống khi chỉnh sửa
          email: 'thukho@warehouse.vn',
          phone: '0987654321',
          position: 'Thủ kho trưởng',
        },
        true, // Chế độ sửa
      );
      assert.equal(res.isValid, true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Kiểm thử Sự cố và Tin nhắn (Incident & Chat Validation - MH-07 & MH-09)
  // --------------------------------------------------------------------------
  describe('5. validateIncident & validateChatMessage', () => {
    test('Từ chối sự cố khi mô tả quá ngắn (< 5 ký tự)', () => {
      const res = validateIncident({
        locationDescription: 'Khu A',
        facilityName: 'Kệ A1',
        description: 'hỏng',
      });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.description);
    });

    test('Từ chối tin nhắn rỗng hoặc chỉ có khoảng trắng', () => {
      const res = validateChatMessage('   ');
      assert.equal(res.isValid, false);
      assert.ok(res.errors.content);
    });

    test('Chấp nhận tin nhắn hợp lệ', () => {
      const res = validateChatMessage('Hàng lô L01 đã nhập kho hoàn tất.');
      assert.equal(res.isValid, true);
    });
  });
});
