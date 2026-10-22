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
  - Port mặc định: `5000` (đã bật CORS)
- **Frontend:** [Next.js](https://nextjs.org/) (React 19, Next.js App Router, Tailwind CSS, Turbopack)
  - Port mặc định: `3000`
- **Database dự kiến:** PostgreSQL / MySQL (kết hợp Prisma ORM hoặc TypeORM)

---

## 📁 Cấu trúc dự án

```text
OOAD_project/
├── backend/                  # NestJS API & Business Logic
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts           # Chạy tại port 5000 (app.enableCors())
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js Web Application
│   ├── src/
│   │   └── app/              # Next.js App Router pages & layout
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
