/**
 * Thư viện kiểm tra tính hợp lệ dữ liệu nhập liệu (Frontend Validation)
 * Đồng bộ với Backend DTOs, Business Rules và Đặc tả xử lý biến cố Chương 6
 */

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T | string, string>>;
}

/**
 * Regex kiểm tra định dạng email chuẩn
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Regex kiểm tra số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 0 hoặc +84)
 */
export const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;

/**
 * Regex kiểm tra tên đăng nhập (chỉ gồm chữ cái, số, dấu gạch dưới, gạch ngang, chấm; không chứa khoảng trắng)
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

/**
 * Kiểm tra chuỗi rỗng hoặc chỉ chứa khoảng trắng
 */
export function isBlank(val: unknown): boolean {
  return typeof val !== 'string' || val.trim().length === 0;
}

/**
 * Kiểm tra số nguyên dương (> 0)
 */
export function isPositiveInteger(val: unknown): boolean {
  const num = Number(val);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}

/**
 * Kiểm tra số không âm (>= 0)
 */
export function isNonNegativeNumber(val: unknown): boolean {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
}

// ============================================================================
// 1. Kiểm tra Đăng nhập (Login Validation - MH-01 / UC13)
// ============================================================================
export interface LoginFormData {
  username: string;
  password: string;
}

export function validateLogin(data: LoginFormData): ValidationResult<LoginFormData> {
  const errors: Record<string, string> = {};

  if (isBlank(data.username)) {
    errors.username = 'Tên đăng nhập không được để trống';
  } else if (data.username.trim().length < 3) {
    errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
  }

  if (isBlank(data.password)) {
    errors.password = 'Mật khẩu không được để trống';
  } else if (data.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// 2. Kiểm tra Lập Phiếu Nhập / Xuất (Receipt Validation - MH-05 / UC01)
// ============================================================================
export interface ReceiptFormData {
  receiptType: string;
  warehouseId: number | string;
  supplierName?: string;
  reason?: string;
  receiver?: string;
  saveMode: string;
  variantId: number | string;
  lotId?: number | string;
  locationId?: number | string;
  quantity: number | string;
  unitPrice?: number | string;
  discount?: number | string;
  note?: string;
}

export function validateReceipt(
  data: ReceiptFormData,
  availableStock?: number,
): ValidationResult<ReceiptFormData> {
  const errors: Record<string, string> = {};

  // Kho thực hiện
  if (!data.warehouseId || Number(data.warehouseId) <= 0) {
    errors.warehouseId = 'Vui lòng chọn kho hàng thực hiện';
  }

  // Biến thể sản phẩm
  if (!data.variantId || Number(data.variantId) <= 0) {
    errors.variantId = 'Vui lòng chọn biến thể sản phẩm cần giao dịch';
  }

  // Số lượng
  const qty = Number(data.quantity);
  if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
    errors.quantity = 'Số lượng phải là số nguyên dương lớn hơn 0';
  }

  // Loại phiếu: Nhập kho
  if (data.receiptType === 'IMPORT') {
    if (isBlank(data.supplierName)) {
      errors.supplierName = 'Vui lòng nhập tên nhà cung cấp hàng hóa';
    } else if (data.supplierName!.trim().length < 2) {
      errors.supplierName = 'Tên nhà cung cấp phải có ít nhất 2 ký tự';
    }
  }

  // Loại phiếu: Xuất kho
  if (data.receiptType === 'EXPORT') {
    if (isBlank(data.receiver)) {
      errors.receiver = 'Vui lòng nhập đơn vị hoặc người nhận hàng';
    }

    if (data.unitPrice !== undefined && data.unitPrice !== '') {
      const price = Number(data.unitPrice);
      if (isNaN(price) || price < 0) {
        errors.unitPrice = 'Đơn giá xuất không được là số âm';
      }
    }

    if (data.discount !== undefined && data.discount !== '') {
      const disc = Number(data.discount);
      if (isNaN(disc) || disc < 0) {
        errors.discount = 'Chiết khấu không được là số âm';
      } else if (
        data.unitPrice !== undefined &&
        !isNaN(Number(data.unitPrice)) &&
        !isNaN(qty) &&
        qty > 0 &&
        disc > Number(data.unitPrice) * qty
      ) {
        errors.discount = 'Chiết khấu không được vượt quá tổng thành tiền xuất';
      }
    }

    // Cross-field: Kiểm tra tồn kho khả dụng nếu có thông tin
    if (availableStock !== undefined && availableStock >= 0 && !isNaN(qty) && qty > availableStock) {
      errors.quantity = `Số lượng xuất (${qty}) vượt quá tồn kho khả dụng hiện có (${availableStock})`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// 3. Kiểm tra Sự cố Kho bãi (Incident Validation - MH-07 / UC07)
// ============================================================================
export interface IncidentFormData {
  warehouseId?: number | string;
  locationDescription: string;
  facilityName: string;
  description: string;
  imageUrl?: string;
}

export function validateIncident(data: IncidentFormData): ValidationResult<IncidentFormData> {
  const errors: Record<string, string> = {};

  if (isBlank(data.locationDescription)) {
    errors.locationDescription = 'Vui lòng nhập vị trí cụ thể xảy ra sự cố';
  } else if (data.locationDescription.trim().length < 2) {
    errors.locationDescription = 'Mô tả vị trí phải có ít nhất 2 ký tự';
  }

  if (isBlank(data.facilityName)) {
    errors.facilityName = 'Vui lòng nhập tên thiết bị hoặc cơ sở vật chất bị sự cố';
  } else if (data.facilityName.trim().length < 2) {
    errors.facilityName = 'Tên thiết bị cơ sở vật chất phải có ít nhất 2 ký tự';
  }

  if (isBlank(data.description)) {
    errors.description = 'Vui lòng mô tả chi tiết tình trạng sự cố';
  } else if (data.description.trim().length < 5) {
    errors.description = 'Mô tả chi tiết sự cố phải có ít nhất 5 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// 4. Kiểm tra Xác nhận Sửa chữa Sự cố (Confirm Repair - MH-07 / UC10)
// ============================================================================
export interface ConfirmRepairFormData {
  result: string;
  note?: string;
}

export function validateConfirmRepair(data: ConfirmRepairFormData): ValidationResult<ConfirmRepairFormData> {
  const errors: Record<string, string> = {};

  if (isBlank(data.result)) {
    errors.result = 'Vui lòng chọn kết quả xác nhận sửa chữa';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// 5. Kiểm tra Hợp đồng Thuê Kho (Contract Validation - MH-08 / UC08)
// ============================================================================
export interface ContractFormData {
  warehouseId: number | string;
  lessorName: string;
  startDate: string;
  endDate: string;
  rentalPrice: number | string;
  note?: string;
}

export function validateContract(data: ContractFormData): ValidationResult<ContractFormData> {
  const errors: Record<string, string> = {};

  if (!data.warehouseId || Number(data.warehouseId) <= 0) {
    errors.warehouseId = 'Vui lòng chọn kho thuê';
  }

  if (isBlank(data.lessorName)) {
    errors.lessorName = 'Vui lòng nhập tên đơn vị cho thuê kho';
  } else if (data.lessorName.trim().length < 2) {
    errors.lessorName = 'Tên đơn vị cho thuê phải có ít nhất 2 ký tự';
  }

  if (isBlank(data.startDate)) {
    errors.startDate = 'Vui lòng chọn ngày bắt đầu hợp đồng';
  }

  if (isBlank(data.endDate)) {
    errors.endDate = 'Vui lòng chọn ngày kết thúc hợp đồng';
  }

  // Cross-field Validation: Ngày bắt đầu không sau ngày kết thúc
  if (!isBlank(data.startDate) && !isBlank(data.endDate)) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (isNaN(start.getTime())) {
      errors.startDate = 'Ngày bắt đầu không đúng định dạng ngày tháng';
    }
    if (isNaN(end.getTime())) {
      errors.endDate = 'Ngày kết thúc không đúng định dạng ngày tháng';
    }
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
      errors.startDate = 'Ngày bắt đầu không được sau ngày kết thúc hợp đồng';
      errors.endDate = 'Ngày kết thúc phải diễn ra sau ngày bắt đầu';
    }
  }

  // Giá thuê
  const price = Number(data.rentalPrice);
  if (isNaN(price) || price <= 0) {
    errors.rentalPrice = 'Giá thuê kho phải là số dương lớn hơn 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// 6. Kiểm tra Gia hạn Hợp đồng (Renew Contract - MH-08 / UC08)
// ============================================================================
export function validateRenewContract(
  newEndDate: string,
  currentEndDate?: string,
): ValidationResult<{ newEndDate: string }> {
  const errors: Record<string, string> = {};

  if (isBlank(newEndDate)) {
    errors.newEndDate = 'Vui lòng chọn ngày kết thúc mới cho hợp đồng gia hạn';
  } else {
    const newEnd = new Date(newEndDate);
    if (isNaN(newEnd.getTime())) {
      errors.newEndDate = 'Ngày kết thúc mới không đúng định dạng ngày';
    } else if (currentEndDate) {
      const curEnd = new Date(currentEndDate);
      if (!isNaN(curEnd.getTime()) && newEnd <= curEnd) {
        errors.newEndDate = `Ngày gia hạn mới phải sau ngày hết hạn hiện tại (${currentEndDate})`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// 7. Kiểm tra Quản lý Tài khoản (User Validation - MH-11 / UC18)
// ============================================================================
export interface UserFormData {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  phone?: string;
  position?: string;
  roleName?: string;
  status?: string;
}

export function validateUser(data: UserFormData, isEditing = false): ValidationResult<UserFormData> {
  const errors: Record<string, string> = {};

  if (isBlank(data.username)) {
    errors.username = 'Tên đăng nhập không được để trống';
  } else if (data.username.trim().length < 3) {
    errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
  } else if (!USERNAME_REGEX.test(data.username.trim())) {
    errors.username = 'Tên đăng nhập chỉ gồm chữ cái, chữ số và không chứa khoảng trắng';
  }

  if (isBlank(data.fullName)) {
    errors.fullName = 'Họ và tên nhân viên không được để trống';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Họ và tên nhân viên phải có ít nhất 2 ký tự';
  }

  // Mật khẩu bắt buộc khi tạo mới; khi sửa chỉ kiểm tra nếu có nhập
  if (!isEditing) {
    if (isBlank(data.password)) {
      errors.password = 'Mật khẩu khởi tạo không được để trống';
    } else if (data.password!.length < 6) {
      errors.password = 'Mật khẩu phải có độ dài tối thiểu 6 ký tự';
    }
  } else if (data.password && data.password.length > 0 && data.password.length < 6) {
    errors.password = 'Mật khẩu mới phải có ít nhất 6 ký tự nếu muốn thay đổi';
  }

  // Kiểm tra email nếu người dùng có nhập
  if (data.email && data.email.trim().length > 0) {
    if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = 'Định dạng email không hợp lệ (VD: user@warehouse.vn)';
    }
  }

  // Kiểm tra số điện thoại nếu người dùng có nhập
  if (data.phone && data.phone.trim().length > 0) {
    if (!PHONE_REGEX.test(data.phone.trim())) {
      errors.phone = 'Số điện thoại phải từ 10 chữ số hợp lệ (VD: 0912345678)';
    }
  }

  if (isBlank(data.position)) {
    errors.position = 'Vui lòng nhập chức vụ hoặc vị trí công tác';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// 8. Kiểm tra Tin nhắn Nội bộ (Chat Validation - MH-09 / UC12)
// ============================================================================
export function validateChatMessage(content: string): ValidationResult<{ content: string }> {
  const errors: Record<string, string> = {};

  if (isBlank(content)) {
    errors.content = 'Nội dung tin nhắn điều phối không được để trống';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
