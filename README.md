# Hệ Thống Quản Lý Kho Quần Áo (Warehouse Management System)

Dự án phát triển Hệ thống Quản lý kho phục vụ môn học **Phân tích và Thiết kế Hướng đối tượng (OOAD)**.

---

## 📌 1. Giới thiệu dự án

Hệ thống Quản lý kho quần áo (**quanlykho**) hỗ trợ doanh nghiệp tự động hóa và chuẩn hóa các quy trình nghiệp vụ lưu trữ, luân chuyển và kiểm soát hàng hóa trong kho bãi theo mô hình hướng đối tượng.

### Mục tiêu chính:
- **Quản lý danh mục & vị trí:** Quản lý thông tin hàng hóa, biến thể SKU, kích cỡ, màu sắc, phân khu và ô vị trí lưu trữ trên kệ.
- **Quản lý nhập kho (Inbound):** Tiếp nhận hàng từ nhà cung cấp, kiểm tra chất lượng, tạo phiếu nhập kho và cập nhật số lượng tồn theo lô.
- **Quản lý xuất kho (Outbound):** Xử lý yêu cầu xuất hàng, lập phiếu xuất kho, trừ tồn kho và xác nhận giao vận.
- **Kiểm định chất lượng & CSVC:** Theo dõi sự cố trang thiết bị kho bãi, lập biên bản hư hỏng và nghiệm thu sửa chữa.
- **Hợp đồng & Nhân sự:** Quản lý hợp đồng thuê kho bãi, tính lương thưởng theo kỳ và phân công nhiệm vụ công việc.
- **Tin nhắn nội bộ:** Kênh trao đổi công việc trực tiếp giữa các nhân sự điều hành kho.
- **Báo cáo & Thống kê:** Phân tích doanh thu xuất nhập, dự báo nhu cầu 3 tháng, hiệu suất nhân viên và báo cáo tồn kho.
- **Quản trị & An toàn hệ thống:** Phân quyền vai trò (RBAC), sao lưu dữ liệu và giám sát nhật ký lỗi vận hành.

---

## 🛠️ 2. Công nghệ sử dụng

- **Backend:** [NestJS](https://nestjs.com/) (TypeScript, TypeORM, PostgreSQL, Passport JWT, bcryptjs)
  - Cổng mặc định: `5000` (đã kích hoạt CORS)
- **Frontend:** [Next.js](https://nextjs.org/) (React 19, Next.js App Router, Tailwind CSS v4, Turbopack)
  - Cổng mặc định: `3000`
- **Database:** PostgreSQL (Hỗ trợ cấu hình qua `.env`, TypeORM synchronize hoặc script SQL độc lập)
- **Thiết kế giao diện:** Hallmark **Terminal** Design System (Thẩm mỹ bàn điều hành phốt pho xanh công nghiệp, phông chữ kỹ thuật đơn cách Martian Mono, cạnh phẳng sắc nét `rounded-none`, tương phản cao).

---

## 📋 3. Danh sách 23 Use Cases (Đã hoàn thiện đầy đủ Frontend & Backend)

| Mã UC | Tên chức năng | Phân hệ Backend | Tab hiển thị trên Frontend | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **UC01** | Tạo và xử lý phiếu nhập kho / xuất kho | `receipts` | Nhập xuất kho | USER / ADMIN |
| **UC02** | Theo dõi và tra cứu phiếu nhập xuất | `receipts` | Nhập xuất kho | USER / ADMIN |
| **UC03** | Xem danh sách kho lưu trữ | `warehouses` | Kho bãi và vị trí kệ | USER / ADMIN |
| **UC04** | Xem chi tiết kho và vị trí ô kệ | `warehouses` | Kho bãi và vị trí kệ | USER / ADMIN |
| **UC05** | Quản lý hàng hóa, biến thể SKU và lô tồn | `products` | Hàng hóa và lô tồn | USER / ADMIN |
| **UC06** | Theo dõi thiết bị và cơ sở vật chất kho | `incidents` | Cơ sở vật chất | USER / ADMIN |
| **UC07** | Khai báo và ghi nhận sự cố kho bãi | `incidents` | Cơ sở vật chất | USER / ADMIN |
| **UC08** | Quản lý hợp đồng thuê kho | `contracts` | Hợp đồng thuê kho | USER / ADMIN |
| **UC09** | Cảnh báo thời hạn hợp đồng & gửi email | `contracts` | Hợp đồng thuê kho | USER / ADMIN |
| **UC10** | Xác nhận nghiệm thu sửa chữa cơ sở vật chất | `incidents` | Cơ sở vật chất | USER / ADMIN |
| **UC11** | Xem danh sách hội thoại nội bộ | `chat` | Tin nhắn nội bộ | USER / ADMIN |
| **UC12** | Gửi và nhận tin nhắn điều phối công việc | `chat` | Tin nhắn nội bộ | USER / ADMIN |
| **UC13** | Đăng nhập hệ thống (JWT & RBAC) | `auth` | Màn hình đăng nhập | Mọi người |
| **UC14** | Đăng xuất và thu hồi phiên làm việc | `auth` | Toàn hệ thống | Đã đăng nhập |
| **UC15** | Báo cáo doanh thu và chi phí kho | `reports` | Báo cáo và thống kê | USER / ADMIN |
| **UC16** | Dự báo nhu cầu nhập xuất 3 tháng | `reports` | Báo cáo và thống kê | USER / ADMIN |
| **UC17** | Báo cáo hiệu suất vận hành nhân sự | `reports` | Báo cáo và thống kê | USER / ADMIN |
| **UC18** | Quản lý tài khoản và phân quyền người dùng | `users` | Tài khoản và phân quyền | **Chỉ ADMIN** |
| **UC19** | Sao lưu cơ sở dữ liệu hệ thống | `system` | Hệ thống & nhật ký lỗi | USER / ADMIN |
| **UC20** | Thống kê số lượng hàng tồn kho | `reports` | Báo cáo và thống kê | USER / ADMIN |
| **UC21** | Tra cứu bảng lương thưởng nhân viên | `hr` | Nhân sự và công việc | USER / ADMIN |
| **UC22** | Xem danh sách phân công nhiệm vụ kho | `hr` | Nhân sự và công việc | USER / ADMIN |
| **UC23** | Giám sát nhật ký lỗi hệ thống (System Error Log) | `system` | Hệ thống & nhật ký lỗi | USER / ADMIN |

---

## 🔑 4. Tài khoản mẫu thử nghiệm (Seed Accounts)

Mật khẩu mặc định cho tất cả các tài khoản thử nghiệm là: **`123456`**

| Username | Password | Vai trò (Role) | Trạng thái | Kịch bản Sequence Diagram kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `admin` | `123456` | **ADMIN** | `ACTIVE` | Xác thực hợp lệ (Quản trị viên) | Cấp Token, mở toàn quyền kể cả UC18 |
| `thukho` | `123456` | **USER** | `ACTIVE` | Xác thực hợp lệ (Nhân viên vận hành) | Cấp Token, ẩn tab UC18 |
| `khoa_taikhoan` | `123456` | **USER** | `LOCKED` | Tài khoản bị khóa | Báo lỗi: `"Từ chối đăng nhập"` |
| `chua_phan_quyen` | `123456` | *(Không có)* | `ACTIVE` | Tài khoản chưa cấp vai trò | Báo lỗi: `"Từ chối đăng nhập"` |
| `thukho` | `sai_password` | — | — | Nhập sai mật khẩu | Báo lỗi: `"Không xác thực được"` |
| *(Tên bất kỳ)* | `123456` | — | — | Tài khoản không tồn tại | Báo lỗi: `"Không xác thực được"` |

---

## 💾 5. Dữ liệu mẫu độc lập (Seed Data Files)

Toàn bộ dữ liệu mẫu khởi tạo hệ thống được xuất độc lập tại thư mục [`database/`](database/):

- [`database/seed-data.sql`](database/seed-data.sql): Tệp SQL chuẩn chứa toàn bộ câu lệnh `INSERT INTO` đã sắp xếp đúng thứ tự ràng buộc khóa ngoại (Foreign Keys) và đồng bộ lại các sequence tự tăng.
- [`database/seed-data.json`](database/seed-data.json): Tệp JSON chứa toàn bộ dữ liệu có cấu trúc của tất cả các thực thể bảng.

### Các lệnh quản lý dữ liệu mẫu:
Trong thư mục `backend`, bạn có thể xuất hoặc nạp lại dữ liệu bất kỳ lúc nào:
```bash
cd backend

# Xuất dữ liệu mới nhất từ CSDL ra file seed-data.sql và seed-data.json
npm run seed:export

# Nạp dữ liệu từ file seed-data.sql vào PostgreSQL
npm run seed:import
```

---

## 📁 6. Cấu trúc thư mục dự án

```text
OOAD_project/
├── backend/                      # NestJS API Server
│   ├── scripts/
│   │   ├── export-seed-data.js   # Script xuất dữ liệu CSDL ra file độc lập
│   │   └── import-seed-data.js   # Script nạp dữ liệu từ file SQL vào CSDL
│   ├── src/
│   │   ├── common/               # Middleware, Guards (JWT + Roles RBAC), Interceptors, Filters
│   │   ├── entities/             # 34 Entities TypeORM chuẩn CSDL quanlykho
│   │   ├── modules/              # Đầy đủ các module nghiệp vụ UC01 -> UC23
│   │   └── main.ts               # Khởi động máy chủ cổng 5000
│   ├── test/                     # E2E Integration Tests (20 kịch bản kiểm thử UC01 -> UC23)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Next.js Dashboard Client
│   ├── src/
│   │   ├── app/
│   │   │   ├── base.css          # Quy chuẩn typography & layout Hallmark
│   │   │   ├── tokens.css        # Hệ thống token màu Terminal (phosphor green, dark paper)
│   │   │   ├── globals.css       # Tailwind CSS v4 inline theme & custom scrollbar
│   │   │   ├── layout.tsx        # Root Layout tích hợp font Martian Mono
│   │   │   └── page.tsx          # Bàn làm việc điều hành kho & tương tác 23 Use Cases
│   │   └── components/
│   │       ├── app-shell.tsx     # Sidebar điều hướng (w-72), Header và Màn hình đăng nhập
│   │       └── ui.tsx            # Button, Badge, StatusBadge, SectionPanel, StatMetric, ConfirmDialog
│   ├── package.json
│   └── next.config.ts
│
├── database/                     # Thư mục lưu trữ dữ liệu mẫu độc lập
│   ├── seed-data.sql             # Tập lệnh SQL nạp dữ liệu độc lập
│   └── seed-data.json            # Dữ liệu JSON cấu trúc
│
├── .gitignore
└── README.md
```

---

## 🚀 7. Hướng dẫn cài đặt và khởi chạy

### Yêu cầu tiên quyết:
- **Node.js**: Phiên bản 18 trở lên.
- **PostgreSQL**: Phiên bản 14 trở lên đang chạy tại `localhost:5432`.
- Cấu hình file `.env` trong thư mục `backend/` (nếu có thay đổi mật khẩu PostgreSQL).

### Bước 1: Khởi chạy Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
Backend sẽ khởi chạy tại: **`http://localhost:5000`**

### Bước 2: Khởi chạy Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ khởi chạy tại: **`http://localhost:3000`**

---

## 🧪 8. Kiểm thử và Kiểm định chất lượng

### Backend:
```bash
cd backend

# Chạy toàn bộ 45 Unit Tests
npm test

# Chạy bộ 20 E2E Integration Tests (kiểm thử chuỗi Use Cases UC01 -> UC23)
npm run test:e2e

# Kiểm tra quy chuẩn mã nguồn ESLint
npm run lint
```

### Frontend:
```bash
cd frontend

# Kiểm tra lỗi kiểu TypeScript
npx tsc --noEmit

# Kiểm tra quy chuẩn mã nguồn ESLint
npm run lint

# Biên dịch sản phẩm Next.js
npm run build
```

### Hallmark Design Lint:
Kiểm tra độ tuân thủ quy chuẩn thiết kế Terminal:
```bash
node .agent/skills/hallmark/skills/hallmark/scripts/sloplint.mjs frontend/src --genre atmospheric --scope app
# Kết quả: sloplint: clean. 0 FAIL, 0 REFLEX, 0 WARN across 7 file(s).
```
