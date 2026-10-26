-- =============================================================================
-- HỆ THỐNG QUẢN LÝ KHO QUẦN ÁO - TẬP LỆNH DỮ LIỆU MẪU ĐỘC LẬP (SEED DATA)
-- Mô tả: File SQL độc lập chứa toàn bộ dữ liệu mẫu phục vụ kiểm thử và vận hành
-- Hỗ trợ đầy đủ: 23 Use Cases (UC01 -> UC23)
-- Thời gian xuất: 17:08:41 26/10/2026
-- Cách dùng: psql -U postgres -d quanlykho -f seed-data.sql
-- =============================================================================

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- -----------------------------------------------------------------------------
-- Bang: "roles" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "roles" ("role_id", "name", "description") VALUES (1, 'ADMIN', 'Quản trị viên toàn quyền hệ thống') ON CONFLICT DO NOTHING;
INSERT INTO "roles" ("role_id", "name", "description") VALUES (2, 'USER', 'Nhân viên thủ kho / vận hành') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "employees" (4 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "employees" ("employee_id", "full_name", "phone", "email", "address", "position", "hire_date", "status") VALUES (1, 'Nguyễn Quản Trị', NULL, 'admin@quanlykho.vn', NULL, 'Quản trị hệ thống', NULL, 'ACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO "employees" ("employee_id", "full_name", "phone", "email", "address", "position", "hire_date", "status") VALUES (2, 'Trần Thủ Kho', NULL, 'thukho@quanlykho.vn', NULL, 'Thủ kho chính', NULL, 'ACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO "employees" ("employee_id", "full_name", "phone", "email", "address", "position", "hire_date", "status") VALUES (3, 'Lê Tài Khoản Khóa', NULL, 'khoa@quanlykho.vn', NULL, 'Nhân viên tạm ngưng', NULL, 'INACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO "employees" ("employee_id", "full_name", "phone", "email", "address", "position", "hire_date", "status") VALUES (4, 'Vũ Chưa Phân Quyền', NULL, 'chuaphanquyen@quanlykho.vn', NULL, 'Nhân viên mới', NULL, 'ACTIVE') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "user_accounts" (4 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "user_accounts" ("user_id", "employee_id", "username", "password_hash", "role_id", "status", "last_login", "created_at") VALUES (1, 1, 'admin', '$2b$10$3uPVmhJriKuGozVxUsgeOuxxO.BomSJt8j/.yePRpUCz/pXAfv1zq', 1, 'ACTIVE', '2026-10-26T09:53:54.785Z', '2026-10-22T02:29:20.535Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_accounts" ("user_id", "employee_id", "username", "password_hash", "role_id", "status", "last_login", "created_at") VALUES (2, 2, 'thukho', '$2b$10$3uPVmhJriKuGozVxUsgeOuxxO.BomSJt8j/.yePRpUCz/pXAfv1zq', 2, 'ACTIVE', '2026-10-26T09:53:54.922Z', '2026-10-22T02:29:20.606Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_accounts" ("user_id", "employee_id", "username", "password_hash", "role_id", "status", "last_login", "created_at") VALUES (3, 3, 'khoa_taikhoan', '$2b$10$3uPVmhJriKuGozVxUsgeOuxxO.BomSJt8j/.yePRpUCz/pXAfv1zq', 2, 'LOCKED', NULL, '2026-10-22T02:29:20.678Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_accounts" ("user_id", "employee_id", "username", "password_hash", "role_id", "status", "last_login", "created_at") VALUES (4, 4, 'chua_phan_quyen', '$2b$10$3uPVmhJriKuGozVxUsgeOuxxO.BomSJt8j/.yePRpUCz/pXAfv1zq', NULL, 'ACTIVE', NULL, '2026-10-22T02:29:20.754Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "user_sessions" (32 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTI5OTkyMjEsImV4cCI6MTc5MzA4NTYyMX0.b3BLJ5K13PekBfHqaFWt6tl9_GIYiTn79dtASYYK0Zs', FALSE, '2026-10-27T07:20:21.680Z', '2026-10-26T07:20:21.684Z', '2026-10-26T07:21:40.937Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTI5OTkzMDcsImV4cCI6MTc5MzA4NTcwN30.idEyyZHWZYXegh33H3BTxChuN4A3yNcvvV_agfJNaX4', FALSE, '2026-10-27T07:21:47.759Z', '2026-10-26T07:21:47.760Z', '2026-10-26T07:23:55.513Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (3, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTI5OTk0NDAsImV4cCI6MTc5MzA4NTg0MH0.U5g_rHbfeGhTm7bTHi45Uwm_JMDWDxEdrprL0NSATdU', FALSE, '2026-10-27T07:24:00.025Z', '2026-10-26T07:24:00.027Z', '2026-10-26T07:24:07.810Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (4, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTI5OTk0NTQsImV4cCI6MTc5MzA4NTg1NH0.krP4a1wr0vn96JR2UqVEVa5p4IjUv_SeHplrBeQaWhU', FALSE, '2026-10-27T07:24:14.600Z', '2026-10-26T07:24:14.602Z', '2026-10-26T07:49:27.923Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (5, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTI5OTk1MDcsImV4cCI6MTc5MzA4NTkwN30.k2QwveC5berfzceAAhFBvVNEKxxQSTBZ2EA90lKdH9E', TRUE, '2026-10-27T07:25:07.417Z', '2026-10-26T07:25:07.422Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (6, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTI5OTk4NDUsImV4cCI6MTc5MzA4NjI0NX0.UarcmMjkECWMmz9nMHZcuBTJYwBCnPVD3Ao7-fSIFHY', TRUE, '2026-10-27T07:30:45.867Z', '2026-10-26T07:30:45.868Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (7, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTI5OTk4NDUsImV4cCI6MTc5MzA4NjI0NX0.EjMIOdyTAhsCo2tJ-EjBFDbaTuADWgV2DmpHZgLt3QA', FALSE, '2026-10-27T07:30:45.946Z', '2026-10-26T07:30:45.946Z', '2026-10-26T07:30:46.183Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (8, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTI5OTk5ODAsImV4cCI6MTc5MzA4NjM4MH0.5ulJPaP2Ak8BUxoRvVfiW7G5looiDu1wynt5KKpxAv4', TRUE, '2026-10-27T07:33:00.242Z', '2026-10-26T07:33:00.243Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (9, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTI5OTk5ODAsImV4cCI6MTc5MzA4NjM4MH0.nkpUw3pXBdW0uH1pmOGbhtl_8mIBd6y0GIqp3FO0mMk', FALSE, '2026-10-27T07:33:00.320Z', '2026-10-26T07:33:00.321Z', '2026-10-26T07:33:00.610Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (10, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDAwMTYsImV4cCI6MTc5MzA4NjQxNn0.M3NlcIZ5LNWJJv_SCg-nPrcMZamZj4ckFAXwdcBU5bs', TRUE, '2026-10-27T07:33:36.810Z', '2026-10-26T07:33:36.811Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (11, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTMwMDAwMTYsImV4cCI6MTc5MzA4NjQxNn0.pwG4NiuXlhEbMqLTqKAk4xjbsO2lYxojWSYSSzIZFOg', FALSE, '2026-10-27T07:33:36.884Z', '2026-10-26T07:33:36.885Z', '2026-10-26T07:33:37.167Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (12, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDAwNTMsImV4cCI6MTc5MzA4NjQ1M30.iqXVt0txB_eqxhap03-u4f-DaUvyMLv904DDJmUwxo4', TRUE, '2026-10-27T07:34:13.787Z', '2026-10-26T07:34:13.788Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (13, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTMwMDAwNTMsImV4cCI6MTc5MzA4NjQ1M30.vSewfm4mdT5Y4_yxHKnqjLEfTF4XqDeb4XU44E5mkq8', FALSE, '2026-10-27T07:34:13.863Z', '2026-10-26T07:34:13.864Z', '2026-10-26T07:34:14.142Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (14, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDA5NzIsImV4cCI6MTc5MzA4NzM3Mn0.yfwH2bdyfEdFxyxntkAtyUBJyZLtZjBZaw1Z0ojK9ms', FALSE, '2026-10-27T07:49:32.275Z', '2026-10-26T07:49:32.277Z', '2026-10-26T09:14:08.690Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (15, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDQ1MDQsImV4cCI6MTc5MzA5MDkwNH0.MStkkjIbO2aDP3adP3Uca2oscFErfX5iwTMAY02TFGo', TRUE, '2026-10-27T08:48:24.335Z', '2026-10-26T08:48:24.336Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (16, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTMwMDQ1MDQsImV4cCI6MTc5MzA5MDkwNH0.EZ4HbgFziRzLk-DD8lxz5Dy_2w1ldE7mvC1ZP8yuS_k', FALSE, '2026-10-27T08:48:24.412Z', '2026-10-26T08:48:24.413Z', '2026-10-26T08:48:24.712Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (17, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDU4MzYsImV4cCI6MTc5MzA5MjIzNn0.PXwk4SsT2bVKA_YDjtJEzsM4IAa1D5okvkiaIJw2DB0', TRUE, '2026-10-27T09:10:36.280Z', '2026-10-26T09:10:36.281Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (18, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTMwMDU4MzYsImV4cCI6MTc5MzA5MjIzNn0.R06jj1vgqFa3kErCLU69nEfwAuVABH8UPjy186kkqKo', FALSE, '2026-10-27T09:10:36.354Z', '2026-10-26T09:10:36.355Z', '2026-10-26T09:10:36.642Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (19, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDYwNTcsImV4cCI6MTc5MzA5MjQ1N30.oAD9LekY8dn5udzNpEBLnOW5tb_F2gfZx847wXDZv1A', TRUE, '2026-10-27T09:14:17.722Z', '2026-10-26T09:14:17.725Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (20, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDY4MTgsImV4cCI6MTc5MzA5MzIxOH0.IaHU167BlmrHgrl7ZrzYIAwHGGnAHMHJl5yTp-bMNxY', TRUE, '2026-10-27T09:26:58.557Z', '2026-10-26T09:26:58.563Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (21, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTMwMDY4MTgsImV4cCI6MTc5MzA5MzIxOH0.xy-ZBpCSG9vYZnCnZ2ejYTl79_UtvGIcgEod75Z52xQ', FALSE, '2026-10-27T09:26:58.742Z', '2026-10-26T09:26:58.748Z', '2026-10-26T09:26:59.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (22, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDcxNzksImV4cCI6MTc5MzA5MzU3OX0.YiNvJbkH3p1c-TB_DeBN0-i9jK9BtMk46u1rZ5fyGR0', TRUE, '2026-10-27T09:32:59.123Z', '2026-10-26T09:32:59.125Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (23, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDcxOTIsImV4cCI6MTc5MzA5MzU5Mn0.pxA4F84dSf_4d8LOum_nLaJxPlU5sR71Fvc1yVbj0UM', TRUE, '2026-10-27T09:33:12.817Z', '2026-10-26T09:33:12.819Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (24, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDcyMDAsImV4cCI6MTc5MzA5MzYwMH0.4CvponjrRO5ht8gAebkbRr8arZkku2y1ykVbxy1bUY0', TRUE, '2026-10-27T09:33:20.142Z', '2026-10-26T09:33:20.143Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (25, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDcyMjAsImV4cCI6MTc5MzA5MzYyMH0.IDZ-CXuVZnFA2BIhrtSYUhKLRVgJ1Qgzgypez0VUk_I', TRUE, '2026-10-27T09:33:40.476Z', '2026-10-26T09:33:40.478Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (26, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDcyMzYsImV4cCI6MTc5MzA5MzYzNn0.P4vV-J-uQODjRF1aQSXC0PhPsSUqZk5fZvocATkkiew', TRUE, '2026-10-27T09:33:56.025Z', '2026-10-26T09:33:56.027Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (27, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDcyNDYsImV4cCI6MTc5MzA5MzY0Nn0.sSJ4oGiF60z4vFwTqCHuL06e1WGXlLw3wpMv1LVp-UA', TRUE, '2026-10-27T09:34:06.434Z', '2026-10-26T09:34:06.435Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (28, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDcyODMsImV4cCI6MTc5MzA5MzY4M30.-a5vXgpePwh7Q-0rjefdIDLATuPgQlqvKDdQqSPFxbQ', TRUE, '2026-10-27T09:34:43.120Z', '2026-10-26T09:34:43.126Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (29, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDc3MTAsImV4cCI6MTc5MzA5NDExMH0.nUG-OdUCfRpHDzZ7d0EcFZffz4tjR0mtOlkx0k7053s', TRUE, '2026-10-27T09:41:50.856Z', '2026-10-26T09:41:50.857Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (30, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTMwMDc3MTAsImV4cCI6MTc5MzA5NDExMH0.1uSxpSCboe6hYGqelHxoYmZgINI1_SN6VEY1GpzQwao', FALSE, '2026-10-27T09:41:50.945Z', '2026-10-26T09:41:50.945Z', '2026-10-26T09:41:51.342Z') ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (31, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJlbXBsb3llZUlkIjoxLCJpYXQiOjE3OTMwMDg0MzQsImV4cCI6MTc5MzA5NDgzNH0.L06pKtBwew9nwrylRxbNvfLzaPdgkSrKSb3pMHtkgN0', TRUE, '2026-10-27T09:53:54.765Z', '2026-10-26T09:53:54.770Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "user_sessions" ("session_id", "user_id", "token", "is_active", "expires_at", "created_at", "revoked_at") VALUES (32, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJuYW1lIjoidGh1a2hvIiwicm9sZSI6IlVTRVIiLCJlbXBsb3llZUlkIjoyLCJpYXQiOjE3OTMwMDg0MzQsImV4cCI6MTc5MzA5NDgzNH0.MRm_ujRHOUzRcmPYKO08h1DFkyONdKRfhAMrxLtETf4', FALSE, '2026-10-27T09:53:54.917Z', '2026-10-26T09:53:54.921Z', '2026-10-26T09:53:55.654Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "warehouses" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "warehouses" ("warehouse_id", "name", "address", "area", "capacity", "start_date", "end_date", "status", "description", "created_at", "updated_at") VALUES (1, 'Kho Trung Tâm Quận 7', '120 Nguyễn Văn Linh, Quận 7, TP.HCM', '1500.00', 5000, '2024-12-31T17:00:00.000Z', '2027-12-30T17:00:00.000Z', 'ACTIVE', 'Kho tổng lưu trữ quần áo thời trang nam nữ', '2026-10-26T07:19:18.347Z', '2026-10-26T07:19:18.347Z') ON CONFLICT DO NOTHING;
INSERT INTO "warehouses" ("warehouse_id", "name", "address", "area", "capacity", "start_date", "end_date", "status", "description", "created_at", "updated_at") VALUES (2, 'Kho Chi Nhánh Thủ Đức', '45 Võ Văn Ngân, TP. Thủ Đức, TP.HCM', '800.00', 2500, '2025-05-31T17:00:00.000Z', '2026-11-04T17:00:00.000Z', 'ACTIVE', 'Kho trung chuyển hàng xuất bán khu vực phía Đông', '2026-10-26T07:19:18.352Z', '2026-10-26T07:19:18.352Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "warehouse_zones" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "warehouse_zones" ("zone_id", "warehouse_id", "name", "description") VALUES (1, 1, 'Khu A - Hàng Áo Thun & Sơ Mi', 'Khu vực lưu trữ áo thời trang') ON CONFLICT DO NOTHING;
INSERT INTO "warehouse_zones" ("zone_id", "warehouse_id", "name", "description") VALUES (2, 2, 'Khu B - Hàng Quần Jeans & Kaki', 'Khu vực lưu trữ quần dài') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "racks" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "racks" ("rack_id", "zone_id", "name", "number_of_levels", "capacity", "status") VALUES (1, 1, 'Kệ A1', 3, 1000, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "racks" ("rack_id", "zone_id", "name", "number_of_levels", "capacity", "status") VALUES (2, 2, 'Kệ B1', 2, 800, 'AVAILABLE') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "storage_locations" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "storage_locations" ("location_id", "rack_id", "level", "code", "capacity", "current_quantity", "status") VALUES (1, 1, 1, 'LOC-A1-L1', 500, 120, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "storage_locations" ("location_id", "rack_id", "level", "code", "capacity", "current_quantity", "status") VALUES (2, 1, 2, 'LOC-A1-L2', 500, 80, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "storage_locations" ("location_id", "rack_id", "level", "code", "capacity", "current_quantity", "status") VALUES (3, 2, 1, 'LOC-B1-L1', 800, 50, 'AVAILABLE') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "categories" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "categories" ("category_id", "name", "description") VALUES (1, 'Áo thời trang', 'Áo thun Polo, T-Shirt, Áo sơ mi công sở') ON CONFLICT DO NOTHING;
INSERT INTO "categories" ("category_id", "name", "description") VALUES (2, 'Quần thời trang', 'Quần Jeans, Kaki, Quần Tây') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "products" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "products" ("product_id", "category_id", "name", "description", "brand", "unit", "status", "created_at", "updated_at") VALUES (1, 1, 'Áo Polo Nam Coolmax Cao Cấp', 'Áo Polo chất liệu thoáng khí, co giãn 4 chiều', 'CoolMate', 'Chiếc', 'ACTIVE', '2026-10-26T07:19:18.387Z', '2026-10-26T07:19:18.387Z') ON CONFLICT DO NOTHING;
INSERT INTO "products" ("product_id", "category_id", "name", "description", "brand", "unit", "status", "created_at", "updated_at") VALUES (2, 2, 'Quần Jeans Slimfit Co Giãn', NULL, 'Routine', 'Chiếc', 'ACTIVE', '2026-10-26T07:19:18.390Z', '2026-10-26T07:19:18.390Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "colors" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "colors" ("color_id", "name", "hex_code") VALUES (1, 'Xanh Navy', '#1E3A8A') ON CONFLICT DO NOTHING;
INSERT INTO "colors" ("color_id", "name", "hex_code") VALUES (2, 'Trắng', '#FFFFFF') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "sizes" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "sizes" ("size_id", "name", "description") VALUES (1, 'M', 'Size M (55-65kg)') ON CONFLICT DO NOTHING;
INSERT INTO "sizes" ("size_id", "name", "description") VALUES (2, 'L', 'Size L (65-75kg)') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "product_variants" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "product_variants" ("variant_id", "product_id", "size_id", "color_id", "sku", "barcode", "weight", "status") VALUES (1, 1, 1, 1, 'POLO-CM-NAVY-M', '8930001112223', '0.25', 'ACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO "product_variants" ("variant_id", "product_id", "size_id", "color_id", "sku", "barcode", "weight", "status") VALUES (2, 1, 2, 2, 'POLO-CM-WHT-L', '8930001112224', '0.27', 'ACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO "product_variants" ("variant_id", "product_id", "size_id", "color_id", "sku", "barcode", "weight", "status") VALUES (3, 2, 2, 1, 'JEAN-RT-NAVY-L', '8930001112225', '0.55', 'ACTIVE') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "quality_statuses" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "quality_statuses" ("quality_status_id", "name", "description") VALUES (1, 'GOOD', 'Đạt chuẩn chất lượng - Cho phép xuất kho') ON CONFLICT DO NOTHING;
INSERT INTO "quality_statuses" ("quality_status_id", "name", "description") VALUES (2, 'DAMAGED', 'Hàng lỗi/hỏng - Không được phép xuất bán') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "lots" (12 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (1, 1, 'LOT-2026-001', '2026-01-14T17:00:00.000Z', '2026-01-31T17:00:00.000Z', '2029-01-14T17:00:00.000Z', 200, 120, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (2, 2, 'LOT-2026-002', '2026-02-09T17:00:00.000Z', '2026-02-19T17:00:00.000Z', '2029-02-09T17:00:00.000Z', 150, 80, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (3, 3, 'LOT-2026-003', '2026-02-28T17:00:00.000Z', '2026-03-09T17:00:00.000Z', '2029-02-28T17:00:00.000Z', 100, 50, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (4, 1, 'LOT-1792999846072-54', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (5, 1, 'LOT-1792999980445-606', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (6, 1, 'LOT-1793000017009-278', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (7, 1, 'LOT-1793000053986-222', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (8, 1, 'LOT-1793004504539-775', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (9, 1, 'LOT-1793005836487-299', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (10, 1, 'LOT-1793006819031-343', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (11, 1, 'LOT-1793007711123-869', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;
INSERT INTO "lots" ("lot_id", "variant_id", "lot_code", "manufacture_date", "received_date", "expiry_date", "initial_quantity", "remaining_quantity", "status") VALUES (12, 1, 'LOT-1793008435194-602', NULL, '2026-10-25T17:00:00.000Z', NULL, 5, 5, 'AVAILABLE') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "inventory_locations" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "inventory_locations" ("inventory_location_id", "variant_id", "lot_id", "location_id", "quantity", "updated_at") VALUES (1, 1, 1, 1, 120, '2026-10-26T07:19:18.414Z') ON CONFLICT DO NOTHING;
INSERT INTO "inventory_locations" ("inventory_location_id", "variant_id", "lot_id", "location_id", "quantity", "updated_at") VALUES (2, 2, 2, 2, 80, '2026-10-26T07:19:18.414Z') ON CONFLICT DO NOTHING;
INSERT INTO "inventory_locations" ("inventory_location_id", "variant_id", "lot_id", "location_id", "quantity", "updated_at") VALUES (3, 3, 3, 3, 50, '2026-10-26T07:19:18.418Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "quality_checks" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "quality_checks" ("quality_check_id", "lot_id", "employee_id", "check_date", "status_id", "quantity", "description") VALUES (1, 1, NULL, '2026-10-26T07:19:18.409Z', 1, 120, 'Lô hàng đạt tiêu chuẩn xuất kho') ON CONFLICT DO NOTHING;
INSERT INTO "quality_checks" ("quality_check_id", "lot_id", "employee_id", "check_date", "status_id", "quantity", "description") VALUES (2, 2, NULL, '2026-10-26T07:19:18.409Z', 1, 80, 'Lô hàng đạt tiêu chuẩn xuất kho') ON CONFLICT DO NOTHING;
INSERT INTO "quality_checks" ("quality_check_id", "lot_id", "employee_id", "check_date", "status_id", "quantity", "description") VALUES (3, 3, NULL, '2026-10-26T07:19:18.409Z', 2, 10, 'Phát hiện 10 sản phẩm lỗi đường may') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "import_receipts" (10 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (1, 1, NULL, '2026-07-10T09:00:00.000Z', 'Công ty May Mặc Việt Tiến', 200, 'COMPLETED', 'Nhập lô hàng Áo Polo đợt 1') ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (2, 1, 1, '2026-10-26T07:30:46.076Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (3, 1, 1, '2026-10-26T07:33:00.449Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (4, 1, 1, '2026-10-26T07:33:37.012Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (5, 1, 1, '2026-10-26T07:34:13.990Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (6, 1, 1, '2026-10-26T08:48:24.543Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (7, 1, 1, '2026-10-26T09:10:36.491Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (8, 1, 1, '2026-10-26T09:26:59.037Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (9, 1, 1, '2026-10-26T09:41:51.128Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_receipts" ("import_id", "warehouse_id", "employee_id", "import_date", "supplier_name", "total_quantity", "status", "note") VALUES (10, 1, 1, '2026-10-26T09:53:55.201Z', 'NCC Kiểm Thử E2E', 5, 'COMPLETED', NULL) ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "import_details" (10 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (1, 1, 1, 1, 200, 'Chiếc', 1) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (2, 2, 1, 4, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (3, 3, 1, 5, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (4, 4, 1, 6, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (5, 5, 1, 7, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (6, 6, 1, 8, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (7, 7, 1, 9, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (8, 8, 1, 10, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (9, 9, 1, 11, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "import_details" ("import_detail_id", "import_id", "variant_id", "lot_id", "quantity", "unit", "location_id") VALUES (10, 10, 1, 12, 5, 'Chiếc', NULL) ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "export_receipts" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "export_receipts" ("export_id", "warehouse_id", "employee_id", "export_date", "reason", "receiver", "status", "note") VALUES (1, 1, NULL, '2026-07-20T14:00:00.000Z', 'Xuất bán', 'Hệ thống Cửa hàng Thời trang TP.HCM', 'COMPLETED', 'Phiếu xuất bán sỉ định kỳ') ON CONFLICT DO NOTHING;
INSERT INTO "export_receipts" ("export_id", "warehouse_id", "employee_id", "export_date", "reason", "receiver", "status", "note") VALUES (2, 1, NULL, '2026-08-18T10:30:00.000Z', 'Xuất bán', 'Hệ thống Cửa hàng Thời trang TP.HCM', 'COMPLETED', 'Phiếu xuất bán sỉ định kỳ') ON CONFLICT DO NOTHING;
INSERT INTO "export_receipts" ("export_id", "warehouse_id", "employee_id", "export_date", "reason", "receiver", "status", "note") VALUES (3, 1, NULL, '2026-09-22T16:15:00.000Z', 'Xuất bán', 'Hệ thống Cửa hàng Thời trang TP.HCM', 'COMPLETED', 'Phiếu xuất bán sỉ định kỳ') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "export_details" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "export_details" ("export_detail_id", "export_id", "variant_id", "lot_id", "quantity", "location_id", "unit_price", "discount") VALUES (1, 1, 1, 1, 30, 1, '250000.00', '500000.00') ON CONFLICT DO NOTHING;
INSERT INTO "export_details" ("export_detail_id", "export_id", "variant_id", "lot_id", "quantity", "location_id", "unit_price", "discount") VALUES (2, 2, 1, 1, 40, 1, '250000.00', '0.00') ON CONFLICT DO NOTHING;
INSERT INTO "export_details" ("export_detail_id", "export_id", "variant_id", "lot_id", "quantity", "location_id", "unit_price", "discount") VALUES (3, 3, 1, 1, 50, 1, '250000.00', '500000.00') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "facility_incidents" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "facility_incidents" ("incident_id", "warehouse_id", "location_description", "facility_name", "description", "image_url", "status", "repair_note", "reported_by", "confirmed_by", "created_at", "updated_at") VALUES (1, 1, 'Khu A - Kệ A1 - Tầng 2', 'Thanh đỡ kệ sắt A1', 'Thanh đỡ kệ tầng 2 có dấu hiệu cong nhẹ do quá tải cục bộ', NULL, 'Mới', NULL, NULL, NULL, '2026-10-26T07:19:18.454Z', '2026-10-26T07:19:18.454Z') ON CONFLICT DO NOTHING;
INSERT INTO "facility_incidents" ("incident_id", "warehouse_id", "location_description", "facility_name", "description", "image_url", "status", "repair_note", "reported_by", "confirmed_by", "created_at", "updated_at") VALUES (2, 1, 'Cửa xuất hàng số 2', 'Hệ thống đèn chiếu sáng LED', 'Đèn chiếu sáng khu vực đóng gói nhấp nháy, đã thay bóng mới chờ nghiệm thu', NULL, 'Chờ xác nhận', 'Đội kỹ thuật đã thay chấn lưu và bóng LED 50W', NULL, NULL, '2026-10-26T07:19:18.454Z', '2026-10-26T07:19:18.454Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "rental_contracts" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "rental_contracts" ("contract_id", "warehouse_id", "lessor_name", "start_date", "end_date", "rental_price", "status", "warning_email_sent", "email_error_log", "note", "created_at", "updated_at") VALUES (1, 1, 'Công ty BĐS Công Nghiệp Nam Sài Gòn', '2024-12-31T17:00:00.000Z', '2027-12-30T17:00:00.000Z', '45000000.00', 'DangHieuLuc', FALSE, NULL, 'Hợp đồng thuê dài hạn Kho Trung Tâm Quận 7', '2026-10-26T07:19:18.459Z', '2026-10-26T07:19:18.459Z') ON CONFLICT DO NOTHING;
INSERT INTO "rental_contracts" ("contract_id", "warehouse_id", "lessor_name", "start_date", "end_date", "rental_price", "status", "warning_email_sent", "email_error_log", "note", "created_at", "updated_at") VALUES (2, 2, 'Tổng Công ty Kho Vận Đông Nam Bộ', '2025-10-31T17:00:00.000Z', '2026-11-04T17:00:00.000Z', '28000000.00', 'DangHieuLuc', FALSE, NULL, 'Hợp đồng sắp đến hạn cần gia hạn (test UC09)', '2026-10-26T07:19:18.459Z', '2026-10-26T07:19:18.459Z') ON CONFLICT DO NOTHING;
INSERT INTO "rental_contracts" ("contract_id", "warehouse_id", "lessor_name", "start_date", "end_date", "rental_price", "status", "warning_email_sent", "email_error_log", "note", "created_at", "updated_at") VALUES (3, 1, 'Đơn vị Cho thuê Kho Phụ Cũ', '2023-12-31T17:00:00.000Z', '2024-12-30T17:00:00.000Z', '15000000.00', 'DaChamDut', TRUE, NULL, 'Hợp đồng đã chấm dứt (có thể xóa trong UC08)', '2026-10-26T07:19:18.459Z', '2026-10-26T07:19:18.459Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "conversations" (1 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "conversations" ("conversation_id", "title", "type", "created_at", "updated_at") VALUES (1, 'Kênh Điều Phối Vận Hành Kho Trung Tâm', 'GROUP', '2026-10-26T07:19:18.465Z', '2026-10-26T07:19:18.465Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "conversation_participants" (2 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "conversation_participants" ("participant_id", "conversation_id", "user_id", "joined_at") VALUES (1, 1, 1, '2026-10-26T07:19:18.466Z') ON CONFLICT DO NOTHING;
INSERT INTO "conversation_participants" ("participant_id", "conversation_id", "user_id", "joined_at") VALUES (2, 1, 2, '2026-10-26T07:19:18.466Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "messages" (6 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "messages" ("message_id", "conversation_id", "sender_id", "content", "created_at") VALUES (1, 1, 1, 'Chào Thủ kho, hôm nay lô hàng Áo Polo LOT-2026-001 đã kiểm định xong chưa?', '2026-10-26T07:19:18.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("message_id", "conversation_id", "sender_id", "content", "created_at") VALUES (2, 1, 2, 'Báo cáo Admin, lô LOT-2026-001 đã đạt chuẩn 100% và xếp lên kệ LOC-A1-L1 rồi ạ.', '2026-10-26T07:19:18.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("message_id", "conversation_id", "sender_id", "content", "created_at") VALUES (3, 1, 2, 'admin đẹp trai', '2026-10-26T07:23:51.911Z') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("message_id", "conversation_id", "sender_id", "content", "created_at") VALUES (4, 1, 2, 'ok anh đẹp mà em', '2026-10-26T07:24:30.748Z') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("message_id", "conversation_id", "sender_id", "content", "created_at") VALUES (5, 1, 1, 'ok em', '2026-10-26T07:25:14.793Z') ON CONFLICT DO NOTHING;
INSERT INTO "messages" ("message_id", "conversation_id", "sender_id", "content", "created_at") VALUES (6, 1, 2, 'ok anh', '2026-10-26T07:25:32.675Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "salary_records" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "salary_records" ("salary_id", "employee_id", "period", "base_salary", "bonus", "deduction", "total_salary", "status", "note", "created_at") VALUES (1, 1, '2026-10', '18000000.00', '3500000.00', '0.00', '21500000.00', 'PAID', 'Lương và thưởng năng suất vận hành kho tháng 10/2026', '2026-10-26T07:19:18.480Z') ON CONFLICT DO NOTHING;
INSERT INTO "salary_records" ("salary_id", "employee_id", "period", "base_salary", "bonus", "deduction", "total_salary", "status", "note", "created_at") VALUES (2, 2, '2026-10', '11000000.00', '2000000.00', '0.00', '13000000.00', 'PAID', 'Lương và thưởng năng suất vận hành kho tháng 10/2026', '2026-10-26T07:19:18.484Z') ON CONFLICT DO NOTHING;
INSERT INTO "salary_records" ("salary_id", "employee_id", "period", "base_salary", "bonus", "deduction", "total_salary", "status", "note", "created_at") VALUES (3, 4, '2026-10', '11000000.00', '2000000.00', '0.00', '13000000.00', 'PAID', 'Lương và thưởng năng suất vận hành kho tháng 10/2026', '2026-10-26T07:19:18.487Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "work_tasks" (6 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "work_tasks" ("task_id", "employee_id", "warehouse_id", "task_type", "title", "description", "status", "due_date", "created_at", "updated_at") VALUES (1, 1, 1, 'NHAP_KHO', 'Tiếp nhận và xếp kệ lô Áo Polo LOT-2026-001', 'Kiểm đếm số lượng và cập nhật vị trí LOC-A1-L1', 'COMPLETED', '2026-10-20T17:00:00.000Z', '2026-10-26T07:19:18.481Z', '2026-10-26T07:19:18.481Z') ON CONFLICT DO NOTHING;
INSERT INTO "work_tasks" ("task_id", "employee_id", "warehouse_id", "task_type", "title", "description", "status", "due_date", "created_at", "updated_at") VALUES (2, 1, 1, 'KIEM_DINH', 'Kiểm tra chất lượng định kỳ lô Quần Jeans LOT-2026-003', 'Đối soát tỷ lệ lỗi đường may và phân loại kệ cách ly', 'IN_PROGRESS', '2026-10-28T17:00:00.000Z', '2026-10-26T07:19:18.481Z', '2026-10-26T07:19:18.481Z') ON CONFLICT DO NOTHING;
INSERT INTO "work_tasks" ("task_id", "employee_id", "warehouse_id", "task_type", "title", "description", "status", "due_date", "created_at", "updated_at") VALUES (3, 2, 1, 'NHAP_KHO', 'Tiếp nhận và xếp kệ lô Áo Polo LOT-2026-001', 'Kiểm đếm số lượng và cập nhật vị trí LOC-A1-L1', 'COMPLETED', '2026-10-20T17:00:00.000Z', '2026-10-26T07:19:18.485Z', '2026-10-26T07:19:18.485Z') ON CONFLICT DO NOTHING;
INSERT INTO "work_tasks" ("task_id", "employee_id", "warehouse_id", "task_type", "title", "description", "status", "due_date", "created_at", "updated_at") VALUES (4, 2, 1, 'KIEM_DINH', 'Kiểm tra chất lượng định kỳ lô Quần Jeans LOT-2026-003', 'Đối soát tỷ lệ lỗi đường may và phân loại kệ cách ly', 'IN_PROGRESS', '2026-10-28T17:00:00.000Z', '2026-10-26T07:19:18.485Z', '2026-10-26T07:19:18.485Z') ON CONFLICT DO NOTHING;
INSERT INTO "work_tasks" ("task_id", "employee_id", "warehouse_id", "task_type", "title", "description", "status", "due_date", "created_at", "updated_at") VALUES (5, 4, 1, 'NHAP_KHO', 'Tiếp nhận và xếp kệ lô Áo Polo LOT-2026-001', 'Kiểm đếm số lượng và cập nhật vị trí LOC-A1-L1', 'COMPLETED', '2026-10-20T17:00:00.000Z', '2026-10-26T07:19:18.488Z', '2026-10-26T07:19:18.488Z') ON CONFLICT DO NOTHING;
INSERT INTO "work_tasks" ("task_id", "employee_id", "warehouse_id", "task_type", "title", "description", "status", "due_date", "created_at", "updated_at") VALUES (6, 4, 1, 'KIEM_DINH', 'Kiểm tra chất lượng định kỳ lô Quần Jeans LOT-2026-003', 'Đối soát tỷ lệ lỗi đường may và phân loại kệ cách ly', 'IN_PROGRESS', '2026-10-28T17:00:00.000Z', '2026-10-26T07:19:18.488Z', '2026-10-26T07:19:18.488Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "backup_logs" (9 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (1, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T07:30:46.158Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (2, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T07:33:00.580Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (3, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T07:33:37.141Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (4, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T07:34:14.115Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (5, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T08:48:24.686Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (6, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T09:10:36.615Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (7, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T09:26:59.385Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (8, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T09:41:51.307Z') ON CONFLICT DO NOTHING;
INSERT INTO "backup_logs" ("backup_id", "status", "file_path", "file_size", "performed_by", "note", "created_at") VALUES (9, 'FAILED', NULL, NULL, 1, 'Insufficient disk space on target destination', '2026-10-26T09:53:55.596Z') ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Bang: "system_error_logs" (3 ban ghi)
-- -----------------------------------------------------------------------------
INSERT INTO "system_error_logs" ("error_id", "error_code", "module_name", "path", "method", "message", "detail", "severity", "request_id", "created_at") VALUES (1, 'ERR_STOCK_EXCEEDED', 'ReceiptsModule', '/receipts', 'POST', 'Không đủ tồn khả dụng hoặc hàng không được phép xuất', 'Yêu cầu xuất 500 chiếc SKU POLO-CM-NAVY-M vượt quá lượng tồn khả dụng tại lô LOT-2026-001 (120 chiếc)', 'WARNING', 'req-seed-001', '2026-10-26T07:19:18.492Z') ON CONFLICT DO NOTHING;
INSERT INTO "system_error_logs" ("error_id", "error_code", "module_name", "path", "method", "message", "detail", "severity", "request_id", "created_at") VALUES (2, 'ERR_AUTH_LOCKED', 'AuthModule', '/auth/login', 'POST', 'Từ chối đăng nhập', 'Tài khoản khoa_taikhoan đang ở trạng thái LOCKED cố gắng đăng nhập', 'WARN', 'req-seed-002', '2026-10-26T07:19:18.492Z') ON CONFLICT DO NOTHING;
INSERT INTO "system_error_logs" ("error_id", "error_code", "module_name", "path", "method", "message", "detail", "severity", "request_id", "created_at") VALUES (3, 'ERR_SMTP_TIMEOUT', 'ContractsModule', '/contracts/check-expiry', 'POST', 'Kết nối máy chủ gửi email cảnh báo thời hạn hợp đồng chậm', 'Timeout 5000ms khi gửi thông báo gia hạn hợp đồng thuê kho Thủ Đức', 'ERROR', 'req-seed-003', '2026-10-26T07:19:18.492Z') ON CONFLICT DO NOTHING;

-- =============================================================================
-- DONG BO LAI CAC SEQUENCE TU DONG TANG CUA POSTGRESQL
-- =============================================================================
SELECT setval('public.categories_category_id_seq', COALESCE((SELECT MAX("category_id") FROM "categories"), 1));
SELECT setval('public.products_product_id_seq', COALESCE((SELECT MAX("product_id") FROM "products"), 1));
SELECT setval('public.sizes_size_id_seq', COALESCE((SELECT MAX("size_id") FROM "sizes"), 1));
SELECT setval('public.colors_color_id_seq', COALESCE((SELECT MAX("color_id") FROM "colors"), 1));
SELECT setval('public.storage_specifications_specification_id_seq', COALESCE((SELECT MAX("specification_id") FROM "storage_specifications"), 1));
SELECT setval('public.variant_storage_specifications_id_seq', COALESCE((SELECT MAX("id") FROM "variant_storage_specifications"), 1));
SELECT setval('public.roles_role_id_seq', COALESCE((SELECT MAX("role_id") FROM "roles"), 1));
SELECT setval('public.user_accounts_user_id_seq', COALESCE((SELECT MAX("user_id") FROM "user_accounts"), 1));
SELECT setval('public.export_details_export_detail_id_seq', COALESCE((SELECT MAX("export_detail_id") FROM "export_details"), 1));
SELECT setval('public.delivery_details_delivery_detail_id_seq', COALESCE((SELECT MAX("delivery_detail_id") FROM "delivery_details"), 1));
SELECT setval('public.deliveries_delivery_id_seq', COALESCE((SELECT MAX("delivery_id") FROM "deliveries"), 1));
SELECT setval('public.export_receipts_export_id_seq', COALESCE((SELECT MAX("export_id") FROM "export_receipts"), 1));
SELECT setval('public.quality_statuses_quality_status_id_seq', COALESCE((SELECT MAX("quality_status_id") FROM "quality_statuses"), 1));
SELECT setval('public.quality_checks_quality_check_id_seq', COALESCE((SELECT MAX("quality_check_id") FROM "quality_checks"), 1));
SELECT setval('public.employees_employee_id_seq', COALESCE((SELECT MAX("employee_id") FROM "employees"), 1));
SELECT setval('public.import_receipts_import_id_seq', COALESCE((SELECT MAX("import_id") FROM "import_receipts"), 1));
SELECT setval('public.import_details_import_detail_id_seq', COALESCE((SELECT MAX("import_detail_id") FROM "import_details"), 1));
SELECT setval('public.lots_lot_id_seq', COALESCE((SELECT MAX("lot_id") FROM "lots"), 1));
SELECT setval('public.product_variants_variant_id_seq', COALESCE((SELECT MAX("variant_id") FROM "product_variants"), 1));
SELECT setval('public.inventory_locations_inventory_location_id_seq', COALESCE((SELECT MAX("inventory_location_id") FROM "inventory_locations"), 1));
SELECT setval('public.storage_locations_location_id_seq', COALESCE((SELECT MAX("location_id") FROM "storage_locations"), 1));
SELECT setval('public.racks_rack_id_seq', COALESCE((SELECT MAX("rack_id") FROM "racks"), 1));
SELECT setval('public.warehouse_zones_zone_id_seq', COALESCE((SELECT MAX("zone_id") FROM "warehouse_zones"), 1));
SELECT setval('public.warehouses_warehouse_id_seq', COALESCE((SELECT MAX("warehouse_id") FROM "warehouses"), 1));
SELECT setval('public.user_sessions_session_id_seq', COALESCE((SELECT MAX("session_id") FROM "user_sessions"), 1));
SELECT setval('public.facility_incidents_incident_id_seq', COALESCE((SELECT MAX("incident_id") FROM "facility_incidents"), 1));
SELECT setval('public.rental_contracts_contract_id_seq', COALESCE((SELECT MAX("contract_id") FROM "rental_contracts"), 1));
SELECT setval('public.conversation_participants_participant_id_seq', COALESCE((SELECT MAX("participant_id") FROM "conversation_participants"), 1));
SELECT setval('public.messages_message_id_seq', COALESCE((SELECT MAX("message_id") FROM "messages"), 1));
SELECT setval('public.conversations_conversation_id_seq', COALESCE((SELECT MAX("conversation_id") FROM "conversations"), 1));
SELECT setval('public.backup_logs_backup_id_seq', COALESCE((SELECT MAX("backup_id") FROM "backup_logs"), 1));
SELECT setval('public.salary_records_salary_id_seq', COALESCE((SELECT MAX("salary_id") FROM "salary_records"), 1));
SELECT setval('public.work_tasks_task_id_seq', COALESCE((SELECT MAX("task_id") FROM "work_tasks"), 1));
SELECT setval('public.system_error_logs_error_id_seq', COALESCE((SELECT MAX("error_id") FROM "system_error_logs"), 1));
