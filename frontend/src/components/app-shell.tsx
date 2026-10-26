'use client';

import React, { useState } from 'react';
import { Icon, IconName, Badge, Button, inputBaseClasses } from './ui';

export type TabKey =
  | 'OVERVIEW'
  | 'WAREHOUSES'
  | 'PRODUCTS'
  | 'RECEIPTS'
  | 'REPORTS'
  | 'INCIDENTS'
  | 'CONTRACTS'
  | 'CHAT'
  | 'HR'
  | 'USERS'
  | 'SYSTEM';

export interface AuthUser {
  userId: number;
  username: string;
  fullName?: string;
  role?: string;
  position?: string;
}

export interface NavItemConfig {
  key: TabKey;
  label: string;
  shortDesc: string;
  group: string;
  icon: IconName;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    key: 'OVERVIEW',
    label: 'Tổng quan vận hành',
    shortDesc: 'Chỉ số thời gian thực, cảnh báo vận hành và điều hướng phân hệ',
    group: 'Điều hành trung tâm',
    icon: 'overview',
  },
  {
    key: 'WAREHOUSES',
    label: 'Kho bãi và vị trí kệ',
    shortDesc: 'Giám sát sức chứa kho, cấu trúc khu vực, kệ và ô lưu trữ',
    group: 'Lưu trữ và xuất nhập tồn',
    icon: 'warehouse',
  },
  {
    key: 'PRODUCTS',
    label: 'Hàng hóa và lô tồn',
    shortDesc: 'Tra cứu danh mục quần áo, biến thể SKU, kích cỡ và lô hàng',
    group: 'Lưu trữ và xuất nhập tồn',
    icon: 'product',
  },
  {
    key: 'RECEIPTS',
    label: 'Nhập xuất kho',
    shortDesc: 'Lập phiếu nhập xuất, duyệt phiếu nháp và tra cứu lịch sử',
    group: 'Lưu trữ và xuất nhập tồn',
    icon: 'receipt',
  },
  {
    key: 'REPORTS',
    label: 'Báo cáo và thống kê',
    shortDesc: 'Phân tích doanh thu, dự báo 3 tháng, hiệu suất và tồn kho',
    group: 'Lưu trữ và xuất nhập tồn',
    icon: 'report',
  },
  {
    key: 'INCIDENTS',
    label: 'Cơ sở vật chất',
    shortDesc: 'Theo dõi thiết bị kho, khai báo hư hỏng và nghiệm thu sửa chữa',
    group: 'Hạ tầng và hợp đồng',
    icon: 'incident',
  },
  {
    key: 'CONTRACTS',
    label: 'Hợp đồng thuê kho',
    shortDesc: 'Quản lý hợp đồng thuê, gia hạn, thanh lý và cảnh báo hết hạn',
    group: 'Hạ tầng và hợp đồng',
    icon: 'contract',
  },
  {
    key: 'HR',
    label: 'Nhân sự và công việc',
    shortDesc: 'Tra cứu bảng lương thưởng theo kỳ và phân công nhiệm vụ kho',
    group: 'Nhân sự và nội bộ',
    icon: 'hr',
  },
  {
    key: 'CHAT',
    label: 'Tin nhắn nội bộ',
    shortDesc: 'Kênh trao đổi điều phối công việc trực tiếp giữa các bộ phận',
    group: 'Nhân sự và nội bộ',
    icon: 'chat',
  },
  {
    key: 'USERS',
    label: 'Tài khoản và phân quyền',
    shortDesc: 'Cấp phát tài khoản nhân sự, gán vai trò và quản lý trạng thái',
    group: 'Quản trị hệ thống',
    icon: 'users',
    adminOnly: true,
  },
  {
    key: 'SYSTEM',
    label: 'Hệ thống và nhật ký lỗi',
    shortDesc: 'Sao lưu cơ sở dữ liệu và giám sát nhật ký lỗi vận hành',
    group: 'Quản trị hệ thống',
    icon: 'system',
  },
];

export function LoginScreen({
  username,
  password,
  loading,
  message,
  messageType,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: {
  username: string;
  password: string;
  loading: boolean;
  message: string | null;
  messageType: 'success' | 'error' | 'info';
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[var(--color-sheet)] text-[var(--color-ink)] rounded-none border border-[var(--color-rule-2)] shadow-none overflow-hidden">
        {/* Top operational header bar */}
        <div className="bg-[var(--color-sidebar-bg)] px-6 py-5 border-b border-[var(--color-sidebar-border)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-none bg-[var(--color-accent)] text-[var(--color-accent-ink)] flex items-center justify-center shrink-0">
            <Icon name="warehouse" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[var(--color-accent-2)] font-medium">
              Bàn điều hành WMS
            </div>
            <h1 className="text-base font-bold text-white font-display">
              Hệ thống quản lý kho quần áo
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)] font-display">
              Đăng nhập ca làm việc
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Sử dụng tài khoản nhân viên kho hoặc quản trị viên để truy cập bàn
              điều hành.
            </p>
          </div>

          {message && (
            <div
              role="alert"
              className={`p-3 rounded-none text-xs font-medium border flex items-start gap-2.5 ${
                messageType === 'error'
                  ? 'bg-[var(--color-paper)] border-[var(--color-error)] text-[var(--color-error)]'
                  : messageType === 'success'
                    ? 'bg-[var(--color-paper)] border-[var(--color-success)] text-[var(--color-success)]'
                    : 'bg-[var(--color-paper-2)] border-[var(--color-rule)] text-[var(--color-ink)]'
              }`}
            >
              <Icon
                name={
                  messageType === 'error'
                    ? 'error'
                    : messageType === 'success'
                      ? 'check'
                      : 'info'
                }
                className="w-4 h-4 shrink-0 mt-0.5"
              />
              <span className="flex-1">{message}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
              >
                Tên đăng nhập <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                id="login-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="Nhập tên tài khoản…"
                className={`${inputBaseClasses} py-2`}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
              >
                Mật khẩu <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu…"
                className={`${inputBaseClasses} py-2`}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full py-2.5 font-bold"
            >
              {loading ? 'Đang xác thực phiên…' : 'Đăng nhập hệ thống'}
            </Button>
          </form>
        </div>

        <div className="px-6 py-3 bg-[var(--color-paper)] border-t border-[var(--color-rule)] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
          <span>Hệ thống quản lý kho vận</span>
          <span className="font-mono text-[var(--color-accent)]">v3.0</span>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  loading,
  message,
  messageType,
  onDismissMessage,
  children,
}: {
  currentUser: AuthUser;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onLogout: () => void;
  loading: boolean;
  message: string | null;
  messageType: 'success' | 'error' | 'info';
  onDismissMessage: () => void;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAdmin = currentUser.role === 'ADMIN';
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  const groups = Array.from(
    new Set(visibleNavItems.map((item) => item.group)),
  );
  const currentNav =
    visibleNavItems.find((item) => item.key === activeTab) ||
    visibleNavItems[0];

  const handleNavClick = (key: TabKey) => {
    onSelectTab(key);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Operational Sidebar */}
      <aside
        aria-label="Điều hướng phân hệ"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)] flex flex-col border-r border-[var(--color-sidebar-border)] transition-transform duration-200 motion-reduce:transition-none lg:static lg:translate-x-0 shrink-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Identity */}
        <div className="h-14 px-4 border-b border-[var(--color-sidebar-border)] flex items-center justify-between gap-2 bg-[var(--color-sidebar-surface)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-none bg-[var(--color-accent)] text-[var(--color-accent-ink)] flex items-center justify-center shrink-0">
              <Icon name="warehouse" className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white font-display leading-tight">
                WMS Kho quần áo
              </div>
              <div className="text-[11px] text-[var(--color-accent)] leading-tight">
                Bàn điều hành vận hành
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden p-1 text-[var(--color-sidebar-muted)] hover:text-white rounded-none cursor-pointer"
            aria-label="Đóng menu"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {groups.map((groupName) => {
            const items = visibleNavItems.filter((i) => i.group === groupName);
            return (
              <div key={groupName}>
                <div className="px-2.5 mb-1.5 text-[11px] font-medium text-[var(--color-sidebar-muted)]">
                  {groupName}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        title={item.label}
                        onClick={() => handleNavClick(item.key)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-none text-xs font-medium transition-colors cursor-pointer text-left ${
                          isActive
                            ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-bold shadow-none'
                            : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Icon
                            name={item.icon}
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[var(--color-accent-ink)]' : 'text-[var(--color-sidebar-muted)]'
                            }`}
                          />
                          <span className="leading-snug">{item.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Operator Session Footer */}
        <div className="p-3 border-t border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-surface)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white font-display leading-tight">
                {currentUser.fullName || currentUser.username}
              </div>
              <div className="text-[11px] text-[var(--color-sidebar-muted)] leading-tight">
                {isAdmin
                  ? 'Quản trị viên hệ thống'
                  : currentUser.position || 'Nhân viên vận hành kho'}
              </div>
            </div>
            <Badge variant={isAdmin ? 'accent' : 'info'} mono>
              {currentUser.role || 'USER'}
            </Badge>
          </div>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Header & Page Toolbar */}
        <header className="h-14 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)] px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-none">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 rounded-none border border-[var(--color-rule-2)] text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <Icon name="menu" className="w-4 h-4" />
            </button>

            {/* Breadcrumb & Active View Context */}
            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
                <span>Điều hành kho</span>
                <Icon name="chevronRight" className="w-3 h-3 text-[var(--color-muted)]" />
                <span>{currentNav.group}</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-[var(--color-ink)] font-display leading-tight">
                  {currentNav.label}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {loading && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[var(--color-paper)] border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-medium"
                aria-live="polite"
              >
                <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Đang xử lý…</span>
              </div>
            )}

            <div className="hidden md:flex items-center gap-2 text-xs text-[var(--color-muted)] border-r border-[var(--color-rule)] pr-3 font-mono">
              <span className="font-medium text-[var(--color-ink)]">
                {currentUser.fullName || currentUser.username}
              </span>
              <span className="text-[var(--color-muted)]">,</span>
              <span className="font-mono text-[11px] text-[var(--color-accent)]">
                @{currentUser.username}
              </span>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={onLogout}
              className="text-[var(--color-error)] hover:bg-[var(--color-paper-3)] hover:border-[var(--color-error)]"
            >
              <Icon name="logout" className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </header>

        {/* System Feedback Banner */}
        {message && (
          <div className="px-4 lg:px-6 pt-3">
            <div
              role="status"
              aria-live="polite"
              className={`px-3.5 py-2.5 rounded-none text-xs border flex items-center justify-between gap-3 ${
                messageType === 'error'
                  ? 'bg-[var(--color-paper)] border-[var(--color-error)] text-[var(--color-error)]'
                  : messageType === 'success'
                    ? 'bg-[var(--color-paper)] border-[var(--color-success)] text-[var(--color-success)]'
                    : 'bg-[var(--color-paper-2)] border-[var(--color-rule)] text-[var(--color-ink)]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon
                  name={
                    messageType === 'error'
                      ? 'error'
                      : messageType === 'success'
                        ? 'check'
                        : 'info'
                  }
                  className="w-4 h-4 shrink-0"
                />
                <span className="font-medium truncate">{message}</span>
              </div>
              <button
                type="button"
                onClick={onDismissMessage}
                className="text-xs font-semibold underline opacity-80 hover:opacity-100 shrink-0 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Main Operational Content Area */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
