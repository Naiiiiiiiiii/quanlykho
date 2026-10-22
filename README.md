# Hệ Thống Quản Lý Kho (Warehouse Management System)

Dự án phát triển Hệ thống Quản lý kho phục vụ môn học **Phân tích và Thiết kế Hướng đối tượng (OOAD)**.

---

## 📌 Giới thiệu dự án

Hệ thống Quản lý kho (**quanlykho**) hỗ trợ doanh nghiệp tự động hóa và chuẩn hóa các quy trình nghiệp vụ lưu trữ, luân chuyển và kiểm soát hàng hóa trong kho bãi theo mô hình hướng đối tượng.

### Mục tiêu chính:
- **Quản lý danh mục & vị trí:** Quản lý thông tin hàng hóa, chủng loại, đơn vị tính, phân khu/kệ lưu trữ.
- **Quản lý nhập kho (Inbound):** Tiếp nhận hàng từ nhà cung cấp, kiểm tra chất lượng, tạo phiếu nhập kho và cập nhật số lượng tồn.
- **Quản lý xuất kho (Outbound):** Xử lý yêu cầu xuất hàng, tạo phiếu xuất kho, trừ tồn kho và xác nhận giao vận.
- **Kiểm kê & điều chỉnh:** Kiểm kê định kỳ, đối soát số liệu thực tế với hệ thống, xử lý hao hụt hoặc hư hỏng.
- **Cảnh báo mức tồn:** Tự động cảnh báo khi tồn kho chạm ngưỡng tối thiểu (safety stock) hoặc quá hạn sử dụng.
- **Báo cáo & thống kê:** Thống kê doanh thu xuất nhập, báo cáo vòng quay tồn kho, thẻ kho.

---

## 🛠️ Công nghệ sử dụng

- **Backend:** [NestJS](https://nestjs.com/) (TypeScript, TypeORM, PostgreSQL, Passport JWT)
  - Port mặc định: `5000` (đã bật CORS)
- **Frontend:** [Next.js](https://nextjs.org/) (React 19, Next.js App Router, Tailwind CSS, Turbopack)
  - Port mặc định: `3000`
- **Database:** PostgreSQL

---

## 🔑 Tài khoản mẫu thử nghiệm (Seed Accounts)

Các tài khoản này được khởi tạo tự động khi khởi động backend tại [`src/modules/users/users.service.ts`](backend/src/modules/users/users.service.ts) để kiểm thử đầy đủ 4 nhánh của **Sequence Diagram Đăng nhập**:

| Username | Password | Vai trò (Role) | Trạng thái | Kịch bản Sequence Diagram kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | **ADMIN** | `ACTIVE` | **Nhánh 4:** Thông tin xác thực hợp lệ (Quản trị viên) | Cấp JWT Token, mở giao diện chức năng |
| `thukho` | `Staff@123` | **USER** | `ACTIVE` | **Nhánh 4:** Thông tin xác thực hợp lệ (Thủ kho) | Cấp JWT Token, mở giao diện chức năng |
| `khoa_taikhoan` | `123456` | **USER** | `LOCKED` | **Nhánh 3:** Tài khoản không được phép truy cập (Bị khóa) | Báo lỗi: `"Từ chối đăng nhập"` |
| `chua_phan_quyen` | `123456` | *(Không có)* | `ACTIVE` | **Nhánh 3:** Tài khoản chưa cấp quyền hạn | Báo lỗi: `"Từ chối đăng nhập"` |
| `thukho` | `sai_password` | — | — | **Nhánh 2:** Thông tin đăng nhập sai mật khẩu | Báo lỗi: `"Không xác thực được"` |
| *(Tên bất kỳ)* | `123456` | — | — | **Nhánh 2:** Tài khoản không tồn tại | Báo lỗi: `"Không xác thực được"` |

> 💡 **Mẹo:** Trên giao diện frontend (`http://localhost:3000`), có sẵn **4 nút bấm thử nghiệm nhanh** để tự động điền và kiểm tra ngay từng trường hợp!

---

## 📁 Cấu trúc dự án

```text
OOAD_project/
├── backend/                  # NestJS API & Business Logic
│   ├── src/
│   │   ├── common/           # Middleware, Guards, Interceptors, Filters, Decorators
│   │   ├── entities/         # 24 Entities TypeORM chuẩn CSDL Quản lý kho
│   │   ├── modules/
│   │   │   ├── auth/         # Module Xác thực (Login, JWT)
│   │   │   └── users/        # Module Tài khoản & Nhân sự (Seed data)
│   │   └── main.ts           # Chạy tại port 5000 (CORS & ValidationPipe)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js Web Application
│   ├── src/
│   │   └── app/              # Giao diện Đăng nhập & Dashboard chức năng
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── .gitignore
└── README.md
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Khởi chạy Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
Backend sẽ chạy tại: `http://localhost:5000`

### 2. Khởi chạy Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:3000`
