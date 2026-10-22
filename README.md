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

- **Backend:** [NestJS](https://nestjs.com/) (Node.js framework với kiến trúc mô-đun hóa, TypeScript, OOP chuẩn mực)
- **Frontend:** [Next.js](https://nextjs.org/) (React Framework, App Router, SSR/SSG, Tailwind CSS)
- **Database:** PostgreSQL / MySQL (kết hợp Prisma ORM hoặc TypeORM)
- **Kiến trúc thiết kế:**
  - Object-Oriented Analysis and Design (OOAD)
  - Mô hình Layered Architecture / Clean Architecture (Controller - Service - Repository)
  - Thiết kế theo các Design Patterns (Factory, Strategy, Observer, Repository...)

---

## 📁 Cấu trúc dự án dự kiến

```text
quanlykho/
├── backend/          # Ứng dụng NestJS (API & Business Logic)
│   ├── src/
│   │   ├── modules/  # Auth, Products, Inventory, Inbound, Outbound, Users...
│   │   └── main.ts
├── frontend/         # Ứng dụng Next.js (Giao diện người dùng)
│   ├── app/          # App router pages & layouts
│   └── components/   # UI components
├── docs/             # Tài liệu phân tích thiết kế OOAD (Use Case, Sequence, Class Diagram)
├── .gitignore
└── README.md
```

---

## 🚀 Bắt đầu phát triển

### Yêu cầu môi trường:
- Node.js (>= 18.x)
- Package manager: `npm` hoặc `pnpm` / `yarn`
- Git

### Khởi tạo các thành phần:
*(Chi tiết các bước cài đặt cụ thể sẽ được cập nhật khi triển khai mã nguồn backend và frontend)*
