'use client';

import React, { useEffect } from 'react';

export type IconName =
  | 'overview'
  | 'warehouse'
  | 'product'
  | 'receipt'
  | 'report'
  | 'incident'
  | 'contract'
  | 'chat'
  | 'hr'
  | 'users'
  | 'system'
  | 'search'
  | 'refresh'
  | 'plus'
  | 'check'
  | 'warning'
  | 'error'
  | 'info'
  | 'close'
  | 'logout'
  | 'chevronRight'
  | 'filter'
  | 'database'
  | 'send'
  | 'edit'
  | 'trash'
  | 'menu'
  | 'clock';

export function Icon({
  name,
  className = 'w-4 h-4',
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    strokeWidth: 1.75,
    stroke: 'currentColor',
  };

  switch (name) {
    case 'overview':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
          />
        </svg>
      );
    case 'warehouse':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      );
    case 'product':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
      );
    case 'receipt':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      );
    case 'report':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      );
    case 'incident':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
          />
        </svg>
      );
    case 'contract':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      );
    case 'chat':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      );
    case 'hr':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
          />
        </svg>
      );
    case 'users':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      );
    case 'system':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      );
    case 'search':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      );
    case 'refresh':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      );
    case 'plus':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      );
    case 'check':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      );
    case 'error':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      );
    case 'info':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      );
    case 'close':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      );
    case 'logout':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
          />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      );
    case 'filter':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
      );
    case 'database':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
          />
        </svg>
      );
    case 'send':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      );
    case 'edit':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
      );
    case 'trash':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      );
    case 'menu':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      );
    case 'clock':
      return (
        <svg aria-hidden="true" {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
  }
}

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'accent';

export function getStatusVariant(status?: string | null): BadgeVariant {
  if (!status) return 'neutral';
  const normalized = status.toUpperCase().trim();
  if (
    [
      'ACTIVE',
      'COMPLETED',
      'HOẠT ĐỘNG',
      'ĐÃ ĐÓNG',
      'CLOSED',
      'RESOLVED',
      'CÒN HẠN',
      'SUCCESS',
      'DAT',
      'AVAILABLE',
      'IN_STOCK',
    ].includes(normalized)
  ) {
    return 'success';
  }
  if (
    [
      'DRAFT',
      'PENDING',
      'IN_PROGRESS',
      'ĐANG XỬ LÝ',
      'SẮP HẾT HẠN',
      'WARNING',
      'CHỜ XỬ LÝ',
    ].includes(normalized)
  ) {
    return 'warning';
  }
  if (
    [
      'LOCKED',
      'OPEN',
      'MỚI GHI NHẬN',
      'CHƯA XỬ LÝ',
      'HẾT HẠN',
      'EXPIRED',
      'TERMINATED',
      'ĐÃ CHẤM DỨT',
      'ERROR',
      'CRITICAL',
      'HIGH',
      'CHUA_DAT',
    ].includes(normalized)
  ) {
    return 'danger';
  }
  if (['IMPORT', 'NHAP_KHO', 'ADMIN'].includes(normalized)) {
    return 'accent';
  }
  if (['EXPORT', 'XUAT_KHO', 'KIEM_DINH', 'USER'].includes(normalized)) {
    return 'info';
  }
  return 'neutral';
}

export function Badge({
  children,
  variant = 'neutral',
  className = '',
  mono = false,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  mono?: boolean;
}) {
  const styles: Record<BadgeVariant, string> = {
    success: 'bg-[var(--color-paper-2)] text-[var(--color-success)] border-[var(--color-rule-2)]',
    warning: 'bg-[var(--color-paper-2)] text-[var(--color-warning)] border-[var(--color-rule-2)]',
    danger: 'bg-[var(--color-paper-2)] text-[var(--color-error)] border-[var(--color-rule-2)]',
    info: 'bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border-[var(--color-rule)]',
    accent:
      'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-rule-2)]',
    neutral:
      'bg-[var(--color-paper-2)] text-[var(--color-muted)] border-[var(--color-rule)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-none text-[11px] font-medium border leading-tight ${
        mono ? 'font-mono' : ''
      } ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  label,
  mono = false,
}: {
  status?: string | null;
  label?: string;
  mono?: boolean;
}) {
  return (
    <Badge variant={getStatusVariant(status)} mono={mono}>
      {label ?? status ?? 'N/A'}
    </Badge>
  );
}

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'warning'
  | 'success';

export function Button({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  title,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
}) {
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[var(--color-accent)] hover:opacity-90 active:opacity-100 text-[var(--color-accent-ink)] font-bold border border-[var(--color-accent)]',
    secondary:
      'bg-[var(--color-paper-3)] hover:bg-[var(--color-rule-2)] text-[var(--color-ink)] border border-[var(--color-rule-2)]',
    outline:
      'bg-[var(--color-paper)] hover:bg-[var(--color-paper-2)] active:bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-[var(--color-rule-2)]',
    ghost:
      'bg-transparent hover:bg-[var(--color-paper-2)] active:bg-[var(--color-paper-3)] text-[var(--color-ink)] border border-transparent',
    danger:
      'bg-[var(--color-error)] hover:opacity-90 active:opacity-100 text-[var(--color-paper)] font-bold border border-[var(--color-error)]',
    warning:
      'bg-[var(--color-warning)] hover:opacity-90 active:opacity-100 text-[var(--color-paper)] font-bold border border-[var(--color-warning)]',
    success:
      'bg-[var(--color-success)] hover:opacity-90 active:opacity-100 text-[var(--color-paper)] font-bold border border-[var(--color-success)]',
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-xs rounded-none',
    sm: 'px-3 py-1.5 text-xs rounded-none',
    md: 'px-4 py-2 text-sm rounded-none',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center gap-1.5 font-mono font-medium transition-colors cursor-pointer active:translate-y-px focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function FormField({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
        {label}
        {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--color-muted)] mt-1">{hint}</p>}
    </div>
  );
}

export const inputBaseClasses =
  'w-full px-3 py-1.5 text-xs text-[var(--color-ink)] bg-[var(--color-paper)] border border-[var(--color-rule-2)] rounded-none transition-colors placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] disabled:bg-[var(--color-paper-2)] disabled:text-[var(--color-muted)] font-mono';

export function SectionPanel({
  title,
  subtitle,
  count,
  actions,
  children,
  className = '',
  noPadding = false,
}: {
  title: string;
  subtitle?: string;
  count?: number | string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={`bg-[var(--color-sheet)] border border-[var(--color-rule)] rounded-none flex flex-col ${className}`}
    >
      <div className="px-4 py-3 border-b border-[var(--color-rule)] flex flex-wrap items-center justify-between gap-2 bg-[var(--color-paper)] rounded-none">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-[var(--color-ink)] font-display leading-tight">
            {title}
          </h2>
          {count !== undefined && (
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-[var(--color-paper-2)] text-[var(--color-accent)] border border-[var(--color-rule-2)] rounded-none">
              {count}
            </span>
          )}
          {subtitle && (
            <span className="hidden sm:inline text-xs text-[var(--color-muted)]">
              : {subtitle}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className={noPadding ? 'flex-1' : 'p-4 flex-1'}>{children}</div>
    </section>
  );
}

export function StatMetric({
  label,
  value,
  subtext,
  icon,
  tone = 'default',
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  icon: IconName;
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}) {
  const toneStyles = {
    default: 'text-[var(--color-ink)]',
    accent: 'text-[var(--color-accent)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    danger: 'text-[var(--color-error)]',
  };

  const iconBgStyles = {
    default:
      'bg-[var(--color-paper)] text-[var(--color-ink-2)] border border-[var(--color-rule)]',
    accent:
      'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-rule-2)]',
    success:
      'bg-[var(--color-paper)] text-[var(--color-success)] border border-[var(--color-rule-2)]',
    warning:
      'bg-[var(--color-paper)] text-[var(--color-warning)] border border-[var(--color-rule-2)]',
    danger:
      'bg-[var(--color-paper)] text-[var(--color-error)] border border-[var(--color-rule-2)]',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`bg-[var(--color-sheet)] border border-[var(--color-rule)] rounded-none p-4 flex items-start justify-between gap-3 ${
        onClick
          ? 'hover:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] cursor-pointer transition-colors active:translate-y-px'
          : ''
      }`}
    >
      <div className="min-w-0">
        <div className="text-xs font-medium text-[var(--color-muted)]">{label}</div>
        <div
          className={`text-2xl font-bold tracking-tight tabular-nums mt-1 font-display ${toneStyles[tone]}`}
        >
          {value}
        </div>
        {subtext && (
          <div className="text-[11px] text-[var(--color-muted)] mt-1 leading-snug">
            {subtext}
          </div>
        )}
      </div>
      <div
        className={`w-9 h-9 rounded-none flex items-center justify-center shrink-0 ${iconBgStyles[tone]}`}
      >
        <Icon name={icon} className="w-5 h-5" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon = 'info',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-8 px-4 text-center flex flex-col items-center justify-center text-[var(--color-muted)] font-mono">
      <div className="w-10 h-10 rounded-none bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink-2)] flex items-center justify-center mb-2.5">
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <h3 className="text-xs font-semibold text-[var(--color-ink)] font-display">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--color-muted)] mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy thao tác',
  variant = 'danger',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 font-mono"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-[var(--color-sheet)] border border-[var(--color-rule-2)] rounded-none max-w-md w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-none flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-[var(--color-paper)] text-[var(--color-error)] border border-[var(--color-error)]'
                : variant === 'warning'
                  ? 'bg-[var(--color-paper)] text-[var(--color-warning)] border border-[var(--color-warning)]'
                  : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-rule-2)]'
            }`}
          >
            <Icon
              name={variant === 'primary' ? 'info' : 'warning'}
              className="w-5 h-5"
            />
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-sm font-bold text-[var(--color-ink)] font-display"
            >
              {title}
            </h3>
            <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-rule)]">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={
              variant === 'danger'
                ? 'danger'
                : variant === 'warning'
                  ? 'warning'
                  : 'primary'
            }
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
