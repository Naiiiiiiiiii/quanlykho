'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Icon,
  Badge,
  StatusBadge,
  Button,
  FormField,
  SectionPanel,
  StatMetric,
  EmptyState,
  ConfirmDialog,
  inputBaseClasses,
  inputErrorClasses,
} from '../components/ui';
import {
  validateLogin,
  validateReceipt,
  validateIncident,
  validateConfirmRepair,
  validateContract,
  validateRenewContract,
  validateUser,
  validateChatMessage,
} from '../utils/validation';
import {
  AppShell,
  LoginScreen,
  NAV_ITEMS,
  TabKey,
  AuthUser,
} from '../components/app-shell';

const API_BASE = 'http://localhost:5000';

interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  requestId?: string;
  duration?: string;
  timestamp?: string;
}

export default function WarehouseManagementApp() {
  // =========================================================================
  // Xác thực & Trạng thái dùng chung
  // =========================================================================
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>(
    'info',
  );
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('OVERVIEW');

  // Hộp thoại xác nhận thao tác quan trọng (thay thế window.confirm)
  // Validation errors
  const [loginErrors, setLoginErrors] = useState<{ username?: string; password?: string }>({});
  const [receiptErrors, setReceiptErrors] = useState<Record<string, string | undefined>>({});
  const [incidentErrors, setIncidentErrors] = useState<Record<string, string | undefined>>({});
  const [confirmRepairErrors, setConfirmRepairErrors] = useState<Record<string, string | undefined>>({});
  const [contractErrors, setContractErrors] = useState<Record<string, string | undefined>>({});
  const [renewContractError, setRenewContractError] = useState<string>('');
  const [userErrors, setUserErrors] = useState<Record<string, string | undefined>>({});
  const [chatError, setChatError] = useState<string>('');

const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'warning';
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const callApi = useCallback(
    async <T = any,>(
      endpoint: string,
      options?: RequestInit,
      silent = false,
    ): Promise<ApiResponse<T> | null> => {
      if (!silent) setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const reqId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Request-Id': reqId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...((options?.headers as Record<string, string>) || {}),
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });

        const result: ApiResponse<T> = await response.json();

        if (response.status === 401 && endpoint !== '/auth/login') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_info');
          setCurrentUser(null);
          setMessageType('error');
          setMessage(
            result.message || 'Phiên đăng nhập đã kết thúc hoặc không hợp lệ',
          );
          return result;
        }

        if (!silent) {
          if (response.ok && result.success) {
            setMessageType('success');
            setMessage(result.message || 'Thao tác thành công');
          } else {
            setMessageType('error');
            setMessage(result.message || 'Không thể hoàn tất thao tác');
          }
        }
        return result;
      } catch {
        if (!silent) {
          setMessageType('error');
          setMessage('Không thể kết nối tới máy chủ, vui lòng thử lại');
        }
        return null;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_info');
    if (savedToken && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
      }
    }
  }, []);

  // =========================================================================
  // Đăng nhập & Đăng xuất
  // =========================================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    const val = validateLogin({ username, password });
    if (!val.isValid) {
      setLoginErrors(val.errors);
      setMessageType('error');
      setMessage('Vui lòng kiểm tra và sửa thông tin đăng nhập chưa hợp lệ.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': `req-${Date.now()}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const result: ApiResponse<{ accessToken: string; user: AuthUser }> =
        await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('access_token', result.data.accessToken);
        localStorage.setItem('user_info', JSON.stringify(result.data.user));
        setCurrentUser(result.data.user);
        setMessageType('success');
        setMessage(result.message || 'Đăng nhập thành công');
      } else {
        setMessageType('error');
        setMessage(result.message || 'Không thể hoàn tất thao tác');
      }
    } catch {
      setMessageType('error');
      setMessage('Không thể kết nối tới máy chủ, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const res = await callApi('/auth/logout', { method: 'POST' });
    if (res && res.success) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      setCurrentUser(null);
      setMessage('Đã đăng xuất khỏi hệ thống');
      setMessageType('info');
      setUsername('');
      setPassword('');
    }
  };

  // =========================================================================
  // States cho các phân hệ nghiệp vụ
  // =========================================================================
  // Kho bãi
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any | null>(null);

  // Hàng hóa
  const [products, setProducts] = useState<any[]>([]);
  const [productKeyword, setProductKeyword] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Phiếu nhập/xuất
  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [receiptFilter, setReceiptFilter] = useState({
    type: '',
    status: '',
    fromDate: '',
    toDate: '',
    warehouseId: '',
    receiptCode: '',
  });
  const [newReceipt, setNewReceipt] = useState({
    receiptType: 'IMPORT',
    warehouseId: 1,
    supplierName: '',
    reason: 'Xuất bán',
    receiver: '',
    saveMode: 'DRAFT',
    note: '',
    variantId: 1,
    lotId: 1,
    locationId: 1,
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  });

  // Danh mục hiển thị tên trực quan cho Nhập / Xuất kho
  const availableVariants = useMemo(() => {
    const list: Array<{
      variantId: number;
      productName: string;
      sku: string;
      price: number;
      label: string;
      lots: any[];
    }> = [];
    for (const p of products) {
      for (const v of p.variants || []) {
        const color = v.color?.name ? ` · Màu ${v.color.name}` : '';
        const size = v.size?.name ? ` · Size ${v.size.name}` : '';
        list.push({
          variantId: v.variantId,
          productName: p.name,
          sku: v.sku,
          price: Number(v.price || p.price || 0),
          label: `${p.name} (${v.sku}${color}${size})`,
          lots: v.lots || [],
        });
      }
    }
    return list;
  }, [products]);

  const availableLocations = useMemo(() => {
    const targetWh = warehouses.find(
      (w) => Number(w.warehouseId) === Number(newReceipt.warehouseId),
    );
    if (!targetWh) {
      const fallback: Array<{ locationId: number; label: string }> = [];
      for (const w of warehouses) {
        for (const z of w.zones || []) {
          for (const r of z.racks || []) {
            for (const loc of r.storageLocations || []) {
              fallback.push({
                locationId: loc.locationId,
                label: `${loc.code} · ${r.name} (${z.name} - ${w.name})`,
              });
            }
          }
        }
      }
      return fallback;
    }
    const list: Array<{ locationId: number; label: string }> = [];
    for (const z of targetWh.zones || []) {
      for (const r of z.racks || []) {
        for (const loc of r.storageLocations || []) {
          list.push({
            locationId: loc.locationId,
            label: `${loc.code} · ${r.name} (${z.name} - Tầng ${loc.level})`,
          });
        }
      }
    }
    return list;
  }, [warehouses, newReceipt.warehouseId]);

  const availableLots = useMemo(() => {
    const targetVar = availableVariants.find(
      (v) => Number(v.variantId) === Number(newReceipt.variantId),
    );
    if (!targetVar || !targetVar.lots || targetVar.lots.length === 0) {
      const all: Array<{ lotId: number; label: string }> = [];
      for (const v of availableVariants) {
        for (const l of v.lots || []) {
          all.push({
            lotId: l.lotId,
            label: `${l.lotCode} · Tồn: ${l.remainingQuantity ?? l.initialQuantity ?? 0} (${v.productName})`,
          });
        }
      }
      return all;
    }
    return targetVar.lots.map((l: any) => ({
      lotId: l.lotId,
      label: `${l.lotCode} · Tồn khả dụng: ${l.remainingQuantity ?? l.initialQuantity ?? 0}`,
    }));
  }, [availableVariants, newReceipt.variantId]);

  // Đồng bộ lựa chọn mặc định hợp lệ khi tải danh sách kho và sản phẩm
  useEffect(() => {
    if (
      warehouses.length > 0 &&
      !warehouses.some((w) => w.warehouseId === newReceipt.warehouseId)
    ) {
      setNewReceipt((prev) => ({
        ...prev,
        warehouseId: warehouses[0].warehouseId,
      }));
    }
  }, [warehouses, newReceipt.warehouseId]);

  useEffect(() => {
    if (
      availableVariants.length > 0 &&
      !availableVariants.some((v) => v.variantId === newReceipt.variantId)
    ) {
      const firstVar = availableVariants[0];
      setNewReceipt((prev) => ({
        ...prev,
        variantId: firstVar.variantId,
        unitPrice:
          prev.receiptType === 'EXPORT' && firstVar.price
            ? Number(firstVar.price)
            : prev.unitPrice,
      }));
    }
  }, [availableVariants, newReceipt.variantId]);

  useEffect(() => {
    if (
      availableLots.length > 0 &&
      !availableLots.some((l) => l.lotId === newReceipt.lotId)
    ) {
      setNewReceipt((prev) => ({ ...prev, lotId: availableLots[0].lotId }));
    }
  }, [availableLots, newReceipt.lotId]);

  useEffect(() => {
    if (
      availableLocations.length > 0 &&
      !availableLocations.some(
        (loc) => loc.locationId === newReceipt.locationId,
      )
    ) {
      setNewReceipt((prev) => ({
        ...prev,
        locationId: availableLocations[0].locationId,
      }));
    }
  }, [availableLocations, newReceipt.locationId]);

  // Báo cáo & Thống kê
  const [revenueFilter, setRevenueFilter] = useState({
    warehouseId: '1',
    fromDate: '2026-07-01',
    toDate: '2026-09-30',
  });
  const [revenueResult, setRevenueResult] = useState<any | null>(null);
  const [forecastResult, setForecastResult] = useState<any | null>(null);
  const [performanceMetric, setPerformanceMetric] = useState('OVERALL');
  const [performanceResult, setPerformanceResult] = useState<any | null>(null);
  const [inventoryStats, setInventoryStats] = useState<any | null>(null);
  const [invStatsFilter, setInvStatsFilter] = useState({
    warehouseId: '1',
    fromDate: '',
    toDate: '',
  });

  // Cơ sở vật chất & Sự cố
  const [facilitiesData, setFacilitiesData] = useState<{
    facilities: any[];
    incidents: any[];
  }>({ facilities: [], incidents: [] });
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [newIncident, setNewIncident] = useState({
    warehouseId: 1,
    locationDescription: '',
    facilityName: '',
    description: '',
    imageUrl: '',
  });
  const [confirmRepairForm, setConfirmRepairForm] = useState({
    result: 'DAT',
    note: '',
  });

  // Hợp đồng thuê & Thời hạn
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [editingContractId, setEditingContractId] = useState<number | null>(
    null,
  );
  const [newContract, setNewContract] = useState({
    warehouseId: 1,
    lessorName: '',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    rentalPrice: 0,
    note: '',
  });
  const [renewEndDate, setRenewEndDate] = useState('2028-12-31');
  const [expiryCheckResult, setExpiryCheckResult] = useState<any | null>(null);

  // Trò chuyện & Tin nhắn
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');

  // Nhân sự (Lương thưởng & Công việc)
  const [salariesData, setSalariesData] = useState<any | null>(null);
  const [salaryPeriod, setSalaryPeriod] = useState('2026-10');
  const [tasksData, setTasksData] = useState<any[]>([]);
  const [taskTypeFilter, setTaskTypeFilter] = useState('');

  // Quản lý tài khoản
  const [usersList, setUsersList] = useState<any[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    position: 'Nhân viên kho',
    roleName: 'USER',
    status: 'ACTIVE',
  });

  // Sao lưu & Lỗi hệ thống
  const [backupConfig, setBackupConfig] = useState<any | null>(null);
  const [backupResult, setBackupResult] = useState<any | null>(null);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [selectedErrorLog, setSelectedErrorLog] = useState<any | null>(null);

  // =========================================================================
  // Các hàm tải dữ liệu và xử lý sự kiện
  // =========================================================================
  const loadWarehouses = useCallback(async () => {
    const res = await callApi<any[]>('/warehouses', undefined, true);
    if (res && Array.isArray(res.data)) {
      setWarehouses(res.data);
    }
  }, [callApi]);

  const loadWarehouseDetail = async (id: number) => {
    const res = await callApi(`/warehouses/${id}`);
    if (res?.data) {
      setSelectedWarehouse(res.data);
    }
  };

  const loadProducts = useCallback(
    async (kw = '') => {
      const q = kw ? `?keyword=${encodeURIComponent(kw)}` : '';
      const res = await callApi<any[]>(`/products${q}`, undefined, !kw);
      if (res && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    },
    [callApi],
  );

  const loadProductDetail = async (id: number) => {
    const res = await callApi(`/products/${id}`);
    if (res) {
      setSelectedProduct(res.data);
    }
  };

  const loadReceipts = useCallback(
    async (silent = false) => {
      const params = new URLSearchParams();
      if (receiptFilter.type) params.set('type', receiptFilter.type);
      if (receiptFilter.status) params.set('status', receiptFilter.status);
      if (receiptFilter.fromDate)
        params.set('fromDate', receiptFilter.fromDate);
      if (receiptFilter.toDate) params.set('toDate', receiptFilter.toDate);
      if (receiptFilter.warehouseId)
        params.set('warehouseId', receiptFilter.warehouseId);
      if (receiptFilter.receiptCode)
        params.set('receiptCode', receiptFilter.receiptCode);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await callApi<any[]>(`/receipts${qs}`, undefined, silent);
      if (res && Array.isArray(res.data)) {
        setReceipts(res.data);
      }
    },
    [callApi, receiptFilter],
  );

  const loadReceiptDetail = async (type: string, id: number) => {
    const res = await callApi(`/receipts/${type}/${id}`);
    if (res?.data) {
      setSelectedReceipt(res.data);
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptErrors({});

    let availableStock: number | undefined = undefined;
    if (newReceipt.receiptType === 'EXPORT' && newReceipt.variantId) {
      const v = availableVariants.find((it) => it.variantId === Number(newReceipt.variantId));
      if (v?.lots && newReceipt.lotId) {
        const l = v.lots.find((lot: any) => lot.lotId === Number(newReceipt.lotId));
        if (l && typeof l.quantityRemaining === 'number') {
          availableStock = l.quantityRemaining;
        }
      }
    }

    const val = validateReceipt(newReceipt, availableStock);
    if (!val.isValid) {
      setReceiptErrors(val.errors as Record<string, string>);
      setMessageType('error');
      setMessage('Vui lòng kiểm tra và sửa các thông tin chưa hợp lệ trên phiếu.');
      return;
    }

    const payload = {
      receiptType: newReceipt.receiptType,
      warehouseId: Number(newReceipt.warehouseId),
      supplierName: newReceipt.supplierName?.trim() || undefined,
      reason: newReceipt.reason?.trim() || undefined,
      receiver: newReceipt.receiver?.trim() || undefined,
      saveMode: newReceipt.saveMode,
      note: newReceipt.note?.trim() || undefined,
      items: [
        {
          variantId: Number(newReceipt.variantId),
          lotId: newReceipt.lotId ? Number(newReceipt.lotId) : undefined,
          locationId: newReceipt.locationId
            ? Number(newReceipt.locationId)
            : undefined,
          quantity: Number(newReceipt.quantity),
          unitPrice: Number(newReceipt.unitPrice || 0),
          discount: Number(newReceipt.discount || 0),
        },
      ],
    };

    const res = await callApi('/receipts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res?.success) {
      setReceiptErrors({});
      void loadReceipts(true);
    }
  };

  const handleCompleteDraftReceipt = async (type: string, id: number) => {
    const res = await callApi(`/receipts/${type}/${id}/complete`, {
      method: 'PATCH',
    });
    if (res?.success) {
      void loadReceipts(true);
      void loadReceiptDetail(type, id);
    }
  };

  const loadFacilitiesAndIncidents = useCallback(async () => {
    const res = await callApi<{ facilities: any[]; incidents: any[] }>(
      '/incidents',
      undefined,
      true,
    );
    if (res?.data) {
      setFacilitiesData(res.data);
    }
  }, [callApi]);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentErrors({});
    const val = validateIncident(newIncident);
    if (!val.isValid) {
      setIncidentErrors(val.errors as Record<string, string>);
      setMessageType('error');
      setMessage('Vui lòng nhập đầy đủ và chính xác thông tin sự cố.');
      return;
    }

    const res = await callApi('/incidents', {
      method: 'POST',
      body: JSON.stringify({
        warehouseId: Number(newIncident.warehouseId),
        locationDescription: newIncident.locationDescription.trim(),
        facilityName: newIncident.facilityName.trim(),
        description: newIncident.description.trim(),
        imageUrl: newIncident.imageUrl?.trim() || undefined,
      }),
    });
    if (res?.success) {
      setIncidentErrors({});
      setNewIncident((prev) => ({
        ...prev,
        locationDescription: '',
        facilityName: '',
        description: '',
      }));
      void loadFacilitiesAndIncidents();
    }
  };

  const handleConfirmRepair = async (incidentId: number) => {
    setConfirmRepairErrors({});
    const val = validateConfirmRepair(confirmRepairForm);
    if (!val.isValid) {
      setConfirmRepairErrors(val.errors as Record<string, string>);
      setMessageType('error');
      setMessage('Vui lòng chọn kết quả xác nhận sửa chữa sự cố.');
      return;
    }

    const res = await callApi(`/incidents/${incidentId}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify({
        result: confirmRepairForm.result,
        note: confirmRepairForm.note?.trim() || undefined,
      }),
    });
    if (res?.success) {
      setConfirmRepairErrors({});
      setSelectedIncident(res.data);
      void loadFacilitiesAndIncidents();
    }
  };

  const loadContracts = useCallback(async () => {
    const res = await callApi<any[]>('/contracts', undefined, true);
    if (res && Array.isArray(res.data)) {
      setContracts(res.data);
    }
  }, [callApi]);

  const loadContractDetail = async (id: number) => {
    const res = await callApi(`/contracts/${id}`);
    if (res?.data) {
      setSelectedContract(res.data);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setContractErrors({});
    const val = validateContract(newContract);
    if (!val.isValid) {
      setContractErrors(val.errors as Record<string, string>);
      setMessageType('error');
      setMessage('Vui lòng kiểm tra và sửa các thông tin chưa hợp lệ của hợp đồng.');
      return;
    }

    const endpoint = editingContractId
      ? `/contracts/${editingContractId}`
      : '/contracts';
    const method = editingContractId ? 'PUT' : 'POST';
    const res = await callApi(endpoint, {
      method,
      body: JSON.stringify({
        warehouseId: Number(newContract.warehouseId),
        lessorName: newContract.lessorName.trim(),
        startDate: newContract.startDate,
        endDate: newContract.endDate,
        rentalPrice: Number(newContract.rentalPrice),
        note: newContract.note?.trim() || undefined,
      }),
    });
    if (res?.success) {
      setContractErrors({});
      setEditingContractId(null);
      setNewContract({
        warehouseId: 1,
        lessorName: '',
        startDate: '2026-01-01',
        endDate: '2027-12-31',
        rentalPrice: 0,
        note: '',
      });
      void loadContracts();
      if (editingContractId) {
        void loadContractDetail(editingContractId);
      }
    }
  };

  const handleRenewContract = async (id: number) => {
    setRenewContractError('');
    const val = validateRenewContract(renewEndDate, selectedContract?.endDate);
    if (!val.isValid) {
      setRenewContractError(val.errors.newEndDate || 'Ngày kết thúc mới không hợp lệ');
      setMessageType('error');
      setMessage(val.errors.newEndDate || 'Ngày kết thúc mới không hợp lệ');
      return;
    }

    const res = await callApi(`/contracts/${id}/renew`, {
      method: 'PATCH',
      body: JSON.stringify({ newEndDate: renewEndDate }),
    });
    if (res?.success) {
      setRenewContractError('');
      void loadContracts();
      void loadContractDetail(id);
    }
  };

  const requestTerminateContract = (id: number) => {
    setConfirmModal({
      open: true,
      title: `Chấm dứt Hợp đồng #${id}`,
      description:
        'Bạn có chắc chắn muốn chấm dứt hiệu lực của hợp đồng thuê kho này trước thời hạn?',
      variant: 'warning',
      confirmLabel: 'Xác nhận chấm dứt',
      onConfirm: async () => {
        setConfirmModal(null);
        const res = await callApi(`/contracts/${id}/terminate`, {
          method: 'PATCH',
        });
        if (res?.success) {
          void loadContracts();
          void loadContractDetail(id);
        }
      },
      onCancel: () => {
        setConfirmModal(null);
        setMessageType('info');
        setMessage('Đã hủy thao tác chấm dứt, giữ nguyên trạng thái hiện tại');
      },
    });
  };

  const requestDeleteContract = (id: number) => {
    setConfirmModal({
      open: true,
      title: `Xóa Hợp đồng #${id}`,
      description:
        'Hành động này sẽ xóa bản ghi hợp đồng khỏi danh sách quản lý. Bạn có chắc chắn muốn tiếp tục?',
      variant: 'danger',
      confirmLabel: 'Xóa hợp đồng',
      onConfirm: async () => {
        setConfirmModal(null);
        const res = await callApi(`/contracts/${id}`, {
          method: 'DELETE',
        });
        if (res?.success) {
          setSelectedContract(null);
          void loadContracts();
        }
      },
      onCancel: () => {
        setConfirmModal(null);
        setMessageType('info');
        setMessage('Đã hủy thao tác xóa, không thực hiện xóa');
      },
    });
  };

  const handleCheckContractExpiry = async () => {
    const res = await callApi('/contracts/check-expiry', {
      method: 'POST',
    });
    if (res?.data) {
      setExpiryCheckResult(res.data);
      void loadContracts();
    }
  };

  const loadConversations = useCallback(async () => {
    const res = await callApi<any[]>('/conversations', undefined, true);
    if (res && Array.isArray(res.data)) {
      setConversations(res.data);
      if (res.data.length > 0 && !selectedConvId) {
        const firstId = res.data[0].conversationId;
        setSelectedConvId(firstId);
        const msgRes = await callApi<any[]>(
          `/conversations/${firstId}/messages`,
          undefined,
          true,
        );
        if (msgRes && Array.isArray(msgRes.data)) {
          setMessages(msgRes.data);
        }
      }
    }
  }, [callApi, selectedConvId]);

  const loadMessages = async (convId: number) => {
    setSelectedConvId(convId);
    const res = await callApi<any[]>(`/conversations/${convId}/messages`);
    if (res && Array.isArray(res.data)) {
      setMessages(res.data);
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId) return;
    setChatError('');
    const val = validateChatMessage(messageText);
    if (!val.isValid) {
      setChatError(val.errors.content || 'Nội dung tin nhắn không được để trống');
      setMessageType('error');
      setMessage(val.errors.content || 'Nội dung tin nhắn không được để trống');
      return;
    }

    const res = await callApi(`/conversations/${selectedConvId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: messageText.trim() }),
    });
    if (res?.success) {
      setChatError('');
      setMessageText('');
      void loadMessages(selectedConvId);
    }
  };

  const loadHrData = useCallback(async () => {
    const salRes = await callApi(
      `/salaries${salaryPeriod ? `?period=${salaryPeriod}` : ''}`,
      undefined,
      true,
    );
    if (salRes) setSalariesData(salRes.data);

    const taskRes = await callApi<any[]>(
      `/tasks${taskTypeFilter ? `?taskType=${taskTypeFilter}` : ''}`,
      undefined,
      true,
    );
    if (taskRes && Array.isArray(taskRes.data)) {
      setTasksData(taskRes.data);
    }
  }, [callApi, salaryPeriod, taskTypeFilter]);

  const loadUsers = useCallback(async () => {
    const res = await callApi<any[]>('/users', undefined, true);
    if (res && Array.isArray(res.data)) {
      setUsersList(res.data);
    }
  }, [callApi]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserErrors({});
    const val = validateUser(newUserForm, Boolean(editingUserId));
    if (!val.isValid) {
      setUserErrors(val.errors as Record<string, string>);
      setMessageType('error');
      setMessage('Vui lòng kiểm tra và sửa thông tin tài khoản nhân sự.');
      return;
    }

    const endpoint = editingUserId ? `/users/${editingUserId}` : '/users';
    const method = editingUserId ? 'PUT' : 'POST';
    const payload: Record<string, any> = {
      username: newUserForm.username.trim(),
      fullName: newUserForm.fullName.trim(),
      email: newUserForm.email?.trim() || undefined,
      phone: newUserForm.phone?.trim() || undefined,
      position: newUserForm.position.trim(),
      roleName: newUserForm.roleName,
      status: newUserForm.status,
    };
    if (!editingUserId || (newUserForm.password && newUserForm.password.trim())) {
      payload.password = newUserForm.password;
    }

    const res = await callApi(endpoint, {
      method,
      body: JSON.stringify(payload),
    });
    if (res?.success) {
      setUserErrors({});
      setEditingUserId(null);
      setNewUserForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        position: 'Nhân viên kho',
        roleName: 'USER',
        status: 'ACTIVE',
      });
      void loadUsers();
    }
  };

  const loadSystemData = useCallback(async () => {
    const errRes = await callApi<any[]>('/system/errors', undefined, true);
    if (errRes && Array.isArray(errRes.data)) {
      setErrorLogs(errRes.data);
    }
    if (currentUser?.role === 'ADMIN') {
      const cfgRes = await callApi('/system/backup/config', undefined, true);
      if (cfgRes?.success) {
        setBackupConfig(cfgRes.data);
      } else {
        setBackupConfig(null);
      }
    }
  }, [callApi, currentUser?.role]);

  useEffect(() => {
    if (!currentUser) return;
    if (activeTab === 'OVERVIEW') {
      void loadWarehouses();
      void loadProducts();
      void loadReceipts(true);
      void loadFacilitiesAndIncidents();
      void loadContracts();
    }
    if (activeTab === 'WAREHOUSES') void loadWarehouses();
    if (activeTab === 'PRODUCTS') void loadProducts();
    if (activeTab === 'RECEIPTS') {
      void loadReceipts(true);
      void loadWarehouses();
      void loadProducts();
    }
    if (activeTab === 'INCIDENTS') void loadFacilitiesAndIncidents();
    if (activeTab === 'CONTRACTS') {
      void loadContracts();
      void loadWarehouses();
    }
    if (activeTab === 'REPORTS') {
      void loadWarehouses();
    }
    if (activeTab === 'CHAT') void loadConversations();
    if (activeTab === 'HR') void loadHrData();
    if (activeTab === 'USERS' && currentUser.role === 'ADMIN') void loadUsers();
    if (activeTab === 'SYSTEM') void loadSystemData();
  }, [
    activeTab,
    currentUser,
    loadWarehouses,
    loadProducts,
    loadReceipts,
    loadFacilitiesAndIncidents,
    loadContracts,
    loadConversations,
    loadHrData,
    loadUsers,
    loadSystemData,
  ]);

  // =========================================================================
  // MÀN HÌNH ĐĂNG NHẬP
  // =========================================================================
  if (!currentUser) {
    return (
      <LoginScreen
        username={username}
        password={password}
        usernameError={loginErrors.username}
        passwordError={loginErrors.password}
        loading={loading}
        message={message}
        messageType={messageType}
        onUsernameChange={(val) => {
          setUsername(val);
          if (loginErrors.username) setLoginErrors((prev) => ({ ...prev, username: undefined }));
        }}
        onPasswordChange={(val) => {
          setPassword(val);
          if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
        }}
        onSubmit={handleLogin}
      />
    );
  }

  // =========================================================================
  // CHỈ SỐ TỔNG HỢP THỜI GIAN THỰC TRÊN DASHBOARD
  // =========================================================================
  const totalWarehouseCapacity = warehouses.reduce(
    (acc, w) => acc + (Number(w.capacity) || 0),
    0,
  );
  const totalWarehouseArea = warehouses.reduce(
    (acc, w) => acc + (Number(w.area) || 0),
    0,
  );
  const completedReceiptsCount = receipts.filter(
    (r) => r.status === 'COMPLETED',
  ).length;
  const draftReceiptsCount = receipts.filter(
    (r) => r.status === 'DRAFT',
  ).length;
  const openIncidentsCount = (facilitiesData.incidents || []).filter(
    (i: any) => i.status !== 'Đã đóng' && i.status !== 'CLOSED',
  ).length;
  const expiringContractsCount = contracts.filter(
    (c: any) =>
      c.termInfo?.termStatus === 'Sắp hết hạn' ||
      c.termInfo?.termStatus === 'Hết hạn',
  ).length;

  const isAdmin = currentUser.role === 'ADMIN';
  const accessibleModules = NAV_ITEMS.filter(
    (item) => item.key !== 'OVERVIEW' && (!item.adminOnly || isAdmin),
  );

  return (
    <AppShell
      currentUser={currentUser}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onLogout={() => void handleLogout()}
      loading={loading}
      message={message}
      messageType={messageType}
      onDismissMessage={() => setMessage(null)}
    >
      {/* Hộp thoại xác nhận thao tác */}
      {confirmModal && (
        <ConfirmDialog
          open={confirmModal.open}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}

      {/* ================================================================= */}
      {/* TAB 0: TỔNG QUAN VẬN HÀNH (OPERATIONS DASHBOARD)                  */}
      {/* ================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-5">
          {/* Dải chỉ số vận hành thực tế */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatMetric
              label="Kho lưu trữ vận hành"
              value={warehouses.length}
              subtext={`Tổng sức chứa: ${totalWarehouseCapacity.toLocaleString('vi-VN')} chiếc (${totalWarehouseArea.toLocaleString('vi-VN')} m²)`}
              icon="warehouse"
              tone="accent"
              onClick={() => setActiveTab('WAREHOUSES')}
            />
            <StatMetric
              label="Danh mục hàng hóa"
              value={products.length}
              subtext="Mặt hàng quần áo đang quản lý"
              icon="product"
              tone="default"
              onClick={() => setActiveTab('PRODUCTS')}
            />
            <StatMetric
              label="Phiếu Nhập / Xuất kho"
              value={receipts.length}
              subtext={`${completedReceiptsCount} hoàn tất · ${draftReceiptsCount} bản nháp`}
              icon="receipt"
              tone="success"
              onClick={() => setActiveTab('RECEIPTS')}
            />
            <StatMetric
              label="Sự cố & Cảnh báo hạ tầng"
              value={openIncidentsCount}
              subtext={`${expiringContractsCount} hợp đồng cần lưu ý thời hạn`}
              icon="incident"
              tone={openIncidentsCount > 0 ? 'warning' : 'default'}
              onClick={() => setActiveTab('INCIDENTS')}
            />
          </div>

          {/* Bảng theo dõi giao dịch & Cảnh báo trực tiếp */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <SectionPanel
              title="Giao dịch Nhập / Xuất kho gần đây"
              count={receipts.length}
              className="lg:col-span-7"
              noPadding
              actions={
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setActiveTab('RECEIPTS')}
                >
                  <span>Quản lý phiếu</span>
                  <Icon name="chevronRight" className="w-3 h-3" />
                </Button>
              }
            >
              {receipts.length === 0 ? (
                <EmptyState
                  icon="receipt"
                  title="Chưa có giao dịch nhập xuất"
                  description="Các phiếu nhập kho và xuất kho mới lập sẽ hiển thị tại đây."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[11px] font-medium text-[var(--color-muted)]">
                        <th className="py-2.5 px-4 font-medium">Số phiếu</th>
                        <th className="py-2.5 px-3 font-medium">Loại</th>
                        <th className="py-2.5 px-3 font-medium">Kho lưu trữ</th>
                        <th className="py-2.5 px-3 font-medium">Ngày lập</th>
                        <th className="py-2.5 px-3 text-right font-medium">Tổng SL</th>
                        <th className="py-2.5 px-4 text-right font-medium">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-rule)]">
                      {receipts.slice(0, 5).map((r, idx) => (
                        <tr
                          key={`ov-rcpt-${r.receiptType || ''}-${r.receiptId || idx}-${idx}`}
                          onClick={() => {
                            setActiveTab('RECEIPTS');
                            void loadReceiptDetail(r.receiptType, r.receiptId);
                          }}
                          className="hover:bg-[var(--color-paper-2)] cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono font-semibold text-[var(--color-ink)]">
                            {r.receiptCode}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusBadge
                              status={r.receiptType}
                              label={
                                r.receiptType === 'IMPORT' ? 'Nhập' : 'Xuất'
                              }
                            />
                          </td>
                          <td className="py-2.5 px-3 text-[var(--color-ink)]">
                            {r.warehouseName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[var(--color-muted)]">
                            {new Date(r.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-[var(--color-ink)]">
                            {r.totalQuantity}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <StatusBadge status={r.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionPanel>

            <SectionPanel
              title="Giám sát Sự cố & Thời hạn hợp đồng"
              className="lg:col-span-5"
              actions={
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    void loadFacilitiesAndIncidents();
                    void loadContracts();
                  }}
                >
                  <Icon name="refresh" className="w-3.5 h-3.5" />
                  <span>Làm mới</span>
                </Button>
              }
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-ink)] mb-2">
                    <span>Sự cố thiết bị kho gần nhất</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('INCIDENTS')}
                      className="text-[var(--color-accent)] hover:underline cursor-pointer"
                    >
                      Xem tất cả ({facilitiesData.incidents.length})
                    </button>
                  </div>
                  {facilitiesData.incidents.length === 0 ? (
                    <p className="text-xs text-[var(--color-muted)] py-2">
                      Không có sự cố cơ sở vật chất nào.
                    </p>
                  ) : (
                    <div className="divide-y divide-[var(--color-rule)] border border-[var(--color-rule)] rounded-none bg-[var(--color-paper-2)]">
                      {facilitiesData.incidents.slice(0, 3).map((inc: any, idx: number) => (
                        <div
                          key={`ov-inc-${inc.incidentId || idx}-${idx}`}
                          onClick={() => {
                            setSelectedIncident(inc);
                            setActiveTab('INCIDENTS');
                          }}
                          className="p-2.5 flex items-center justify-between gap-2 text-xs hover:bg-[var(--color-paper-2)] cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--color-ink)] leading-snug">
                              #{inc.incidentId} · {inc.facilityName}
                            </div>
                            <div className="text-[11px] text-[var(--color-muted)] leading-snug">
                              {inc.locationDescription}: {inc.description}
                            </div>
                          </div>
                          <StatusBadge status={inc.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-ink)] mb-2">
                    <span>Hợp đồng thuê kho & Hiệu lực</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('CONTRACTS')}
                      className="text-[var(--color-accent)] hover:underline cursor-pointer"
                    >
                      Quản lý ({contracts.length})
                    </button>
                  </div>
                  {contracts.length === 0 ? (
                    <p className="text-xs text-[var(--color-muted)] py-2">
                      Chưa có dữ liệu hợp đồng thuê kho.
                    </p>
                  ) : (
                    <div className="divide-y divide-[var(--color-rule)] border border-[var(--color-rule)] rounded-none bg-[var(--color-paper-2)]">
                      {contracts.slice(0, 3).map((c: any, idx: number) => (
                        <div
                          key={`ov-ctr-${c.contractId || idx}-${idx}`}
                          onClick={() => {
                            setActiveTab('CONTRACTS');
                            void loadContractDetail(c.contractId);
                          }}
                          className="p-2.5 flex items-center justify-between gap-2 text-xs hover:bg-[var(--color-paper-2)] cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--color-ink)] leading-snug">
                              HĐ #{c.contractId} · {c.lessorName}
                            </div>
                            <div className="text-[11px] text-[var(--color-muted)]">
                              Đến ngày: <span className="font-mono">{String(c.endDate).slice(0, 10)}</span>
                            </div>
                          </div>
                          {c.termInfo ? (
                            <StatusBadge
                              status={c.termInfo.termStatus}
                              label={`${c.termInfo.termStatus} (${c.termInfo.remainingDays}n)`}
                            />
                          ) : (
                            <StatusBadge status={c.status} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SectionPanel>
          </div>

          {/* Danh mục điều phối toàn bộ phân hệ chức năng */}
          <SectionPanel
            title="Danh mục phân hệ nghiệp vụ"
            subtitle="Truy cập nhanh toàn bộ chức năng điều hành kho"
            count={accessibleModules.length}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {accessibleModules.map((mod, idx) => (
                <button
                  key={mod.key || `mod-${idx}`}
                  type="button"
                  onClick={() => setActiveTab(mod.key)}
                  className="group text-left p-3.5 rounded-none border border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors cursor-pointer flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-none bg-[var(--color-paper-2)] group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-accent-ink)] text-[var(--color-ink)] flex items-center justify-center shrink-0 transition-colors mt-0.5">
                    <Icon name={mod.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] leading-snug">
                        {mod.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted)] mt-1 line-clamp-2 leading-relaxed">
                      {mod.shortDesc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 1: KHO BÃI & VỊ TRÍ KỆ (UC03, UC04)                           */}
      {/* ================================================================= */}
      {activeTab === 'WAREHOUSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SectionPanel
            title="Danh sách kho lưu trữ"
            count={warehouses.length}
            className="lg:col-span-5"
            noPadding
            actions={
              <Button
                variant="outline"
                size="xs"
                onClick={() => void loadWarehouses()}
              >
                <Icon name="refresh" className="w-3.5 h-3.5" />
                <span>Tải lại</span>
              </Button>
            }
          >
            {warehouses.length === 0 ? (
              <EmptyState
                icon="warehouse"
                title="Chưa có dữ liệu kho bãi"
                description="Danh sách các kho lưu trữ sẽ hiển thị tại đây."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[11px] font-medium text-[var(--color-muted)]">
                      <th className="py-2.5 px-4 font-medium">Kho lưu trữ</th>
                      <th className="py-2.5 px-3 text-right font-medium">Diện tích</th>
                      <th className="py-2.5 px-3 text-right font-medium">Sức chứa</th>
                      <th className="py-2.5 px-4 text-right font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {warehouses.map((wh, idx) => {
                      const isSelected =
                        selectedWarehouse?.warehouseId === wh.warehouseId;
                      return (
                        <tr
                          key={`wh-${wh.warehouseId || idx}-${idx}`}
                          onClick={() =>
                            void loadWarehouseDetail(wh.warehouseId)
                          }
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-accent-soft)] font-medium'
                              : 'hover:bg-[var(--color-paper-2)]'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-[var(--color-ink)]">
                              {wh.name}
                            </div>
                            <div className="text-[11px] text-[var(--color-muted)] mt-0.5">
                              {wh.address}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums text-[var(--color-ink)]">
                            <span className="font-mono">{Number(wh.area).toLocaleString('vi-VN')}</span> m²
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-semibold text-[var(--color-ink)]">
                            <span className="font-mono">{Number(wh.capacity).toLocaleString('vi-VN')}</span> chiếc
                          </td>
                          <td className="py-3 px-4 text-right">
                            <StatusBadge status={wh.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>

          <SectionPanel
            title="Hồ sơ vận hành & Sơ đồ kệ lưu trữ"
            subtitle={selectedWarehouse ? selectedWarehouse.name : undefined}
            className="lg:col-span-7"
          >
            {!selectedWarehouse ? (
              <EmptyState
                icon="warehouse"
                title="Chưa chọn kho lưu trữ"
                description="Chọn một kho từ bảng bên trái để kiểm tra sức chứa, doanh thu xuất bán và cấu trúc khu vực, kệ, ô lưu trữ."
              />
            ) : (
              <div className="space-y-5">
                {/* Chỉ số sức chứa & vận hành của kho */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-none border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                    <div className="text-[11px] text-[var(--color-muted)]">
                      Đang lưu trữ / Sức chứa
                    </div>
                    <div className="text-sm font-bold text-[var(--color-accent)] mt-1">
                      <span className="font-mono tabular-nums">
                        {Number(
                          selectedWarehouse.currentQuantity || 0,
                        ).toLocaleString('vi-VN')}{' '}
                        /{' '}
                        {selectedWarehouse.capacity
                          ? Number(selectedWarehouse.capacity).toLocaleString(
                              'vi-VN',
                            )
                          : 'N/A'}
                      </span>{' '}
                      chiếc
                    </div>
                  </div>
                  <div className="p-3 rounded-none border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                    <div className="text-[11px] text-[var(--color-muted)]">
                      Sức chứa khả dụng
                    </div>
                    <div className="text-sm font-bold font-mono tabular-nums text-[var(--color-success)] mt-1">
                      {selectedWarehouse.remainingCapacity !== null &&
                      selectedWarehouse.remainingCapacity !== undefined
                        ? `${Number(selectedWarehouse.remainingCapacity).toLocaleString('vi-VN')} chiếc`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 rounded-none border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                    <div className="text-[11px] text-[var(--color-muted)]">
                      Tình trạng hạ tầng
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={selectedWarehouse.facilityStatus} />
                    </div>
                  </div>
                  <div className="p-3 rounded-none border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                    <div className="text-[11px] text-[var(--color-muted)]">
                      Doanh thu xuất bán
                    </div>
                    <div className="text-sm font-bold font-mono tabular-nums text-[var(--color-ink)] mt-1">
                      {selectedWarehouse.revenue !== null
                        ? `${Number(selectedWarehouse.revenue).toLocaleString('vi-VN')} đ`
                        : 'Chưa phát sinh'}
                    </div>
                  </div>
                  <div className="p-3 rounded-none border border-[var(--color-rule)] bg-[var(--color-paper-2)] sm:col-span-2">
                    <div className="text-[11px] text-[var(--color-muted)]">
                      Chỉ số lợi nhuận
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-ink)] mt-1">
                      {selectedWarehouse.profit ?? 'Chưa có dữ liệu giá vốn'}
                    </div>
                  </div>
                </div>

                {/* Cấu trúc Khu vực -> Kệ -> Ô vị trí */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2">
                    <h3 className="text-xs font-semibold text-[var(--color-ink)]">
                      Cấu trúc Khu vực, Kệ và Vị trí lưu trữ
                    </h3>
                    <span className="text-[11px] text-[var(--color-muted)]">
                      {(selectedWarehouse.zones || []).length} khu vực
                    </span>
                  </div>

                  {(selectedWarehouse.zones || []).map((z: any, zIdx: number) => (
                    <div
                      key={`zone-${z.zoneId || zIdx}-${zIdx}`}
                      className="rounded-none border border-[var(--color-rule)] overflow-hidden"
                    >
                      <div className="bg-[var(--color-paper-2)] px-3.5 py-2 border-b border-[var(--color-rule)] flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--color-ink)]">
                          {z.name}
                        </span>
                        {z.description && (
                          <span className="text-[var(--color-muted)] text-[11px]">
                            {z.description}
                          </span>
                        )}
                      </div>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[var(--color-paper-2)]">
                        {(z.racks || []).map((r: any, rIdx: number) => (
                          <div
                            key={`rack-${r.rackId || rIdx}-${rIdx}`}
                            className="border border-[var(--color-rule)] rounded-none p-2.5 bg-[var(--color-paper-2)]"
                          >
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-rule)] text-xs">
                              <span className="font-bold text-[var(--color-ink)]">
                                {r.name}{' '}
                                <span className="font-normal text-[var(--color-muted)]">
                                  ({r.numberOfLevels} tầng)
                                </span>
                              </span>
                              <StatusBadge status={r.status} />
                            </div>
                            <table className="w-full text-[11px]">
                              <thead>
                                <tr className="text-[var(--color-muted)] border-b border-[var(--color-rule)]">
                                  <th className="text-left py-1 font-medium">
                                    Mã vị trí
                                  </th>
                                  <th className="text-right py-1 font-medium">
                                    Đang lưu / Sức chứa
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--color-rule)]/50">
                                {(r.storageLocations || []).map((loc: any, locIdx: number) => (
                                  <tr key={`loc-${loc.locationId || locIdx}-${locIdx}`}>
                                    <td className="py-1 font-mono font-semibold text-[var(--color-ink)]">
                                      #{loc.locationId} · {loc.code}
                                    </td>
                                    <td className="py-1 text-right font-mono tabular-nums text-[var(--color-ink)]">
                                      <b>{loc.currentQuantity}</b> /{' '}
                                      {loc.capacity}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: HÀNG HÓA & LÔ TỒN KHO (UC05)                               */}
      {/* ================================================================= */}
      {activeTab === 'PRODUCTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SectionPanel
            title="Danh mục mặt hàng quần áo"
            count={products.length}
            className="lg:col-span-5"
            noPadding
          >
            <div className="p-3 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] flex gap-2">
              <input
                type="text"
                value={productKeyword}
                onChange={(e) => setProductKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void loadProducts(productKeyword);
                }}
                placeholder="Tìm kiếm theo tên sản phẩm..."
                aria-label="Tìm kiếm theo tên sản phẩm"
                className={inputBaseClasses}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => void loadProducts(productKeyword)}
              >
                <Icon name="search" className="w-3.5 h-3.5" />
                <span>Tìm</span>
              </Button>
            </div>

            {products.length === 0 ? (
              <EmptyState
                icon="product"
                title="Không tìm thấy mặt hàng"
                description="Thử thay đổi từ khóa tìm kiếm hoặc tải lại danh mục."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[11px] font-medium text-[var(--color-muted)]">
                      <th className="py-2.5 px-4 font-medium">Mã</th>
                      <th className="py-2.5 px-3 font-medium">Tên mặt hàng</th>
                      <th className="py-2.5 px-3 font-medium">Thương hiệu</th>
                      <th className="py-2.5 px-4 text-right font-medium">ĐVT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {products.map((p, idx) => {
                      const isSelected =
                        selectedProduct?.productId === p.productId;
                      return (
                        <tr
                          key={`prod-${p.productId || idx}-${idx}`}
                          onClick={() => void loadProductDetail(p.productId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-accent-soft)] font-medium'
                              : 'hover:bg-[var(--color-paper-2)]'
                          }`}
                        >
                          <td className="py-2.5 px-4 font-mono text-[var(--color-muted)]">
                            #{p.productId}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[var(--color-ink)]">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--color-muted)]">
                            {p.brand || 'N/A'}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-[var(--color-muted)]">
                            {p.unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>

          <SectionPanel
            title="Chi tiết biến thể SKU & Lô hàng tồn kho"
            subtitle={selectedProduct ? selectedProduct.name : undefined}
            className="lg:col-span-7"
          >
            {!selectedProduct ? (
              <EmptyState
                icon="product"
                title="Chưa chọn mặt hàng"
                description="Chọn một mặt hàng từ danh mục bên trái để tra cứu biến thể SKU, kích cỡ, màu sắc và lượng tồn theo từng lô."
              />
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-none border border-[var(--color-rule)] bg-[var(--color-paper-2)] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[var(--color-ink)]">
                      {selectedProduct.name}
                    </div>
                    <div className="text-xs text-[var(--color-muted)] mt-0.5">
                      {selectedProduct.description || 'Chưa cập nhật mô tả'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[var(--color-muted)]">
                      Tổng tồn khả dụng
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-accent)]">
                      {selectedProduct.totalStock} {selectedProduct.unit}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(selectedProduct.variants || []).map((v: any, vIdx: number) => (
                    <div
                      key={`var-${v.variantId || vIdx}-${vIdx}`}
                      className="border border-[var(--color-rule)] rounded-none overflow-hidden"
                    >
                      <div className="bg-[var(--color-paper-2)] px-3.5 py-2.5 border-b border-[var(--color-rule)] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--color-ink)]">
                            Biến thể <span className="font-mono">#{v.variantId}</span> · SKU: <span className="font-mono">{v.sku}</span>
                          </span>
                          <Badge variant="neutral">Size {v.size}</Badge>
                          <Badge variant="neutral">Màu {v.color}</Badge>
                          <span className="text-[11px] text-[var(--color-muted)]">
                            Barcode: <span className="font-mono">{v.barcode}</span>
                          </span>
                        </div>
                        <Badge variant="accent" mono>
                          Tồn SKU: {v.totalVariantStock}
                        </Badge>
                      </div>

                      <div className="p-3 bg-[var(--color-paper-2)]">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[var(--color-rule)] text-[11px] text-[var(--color-muted)]">
                              <th className="py-1.5 px-2">Mã lô</th>
                              <th className="py-1.5 px-2">Ký hiệu lô</th>
                              <th className="py-1.5 px-2">Trạng thái</th>
                              <th className="py-1.5 px-2 text-right">
                                Tồn còn lại / Ban đầu
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(v.lots || []).map((lot: any, lIdx: number) => (
                              <tr key={`lot-${lot.lotId || lIdx}-${lIdx}`}>
                                <td className="py-1.5 px-2 font-mono text-[var(--color-muted)]">
                                  #{lot.lotId}
                                </td>
                                <td className="py-1.5 px-2 font-mono font-semibold text-[var(--color-ink)]">
                                  {lot.lotCode}
                                </td>
                                <td className="py-1.5 px-2">
                                  <StatusBadge status={lot.status} />
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                                  <b className="text-[var(--color-ink)]">
                                    {lot.remainingQuantity}
                                  </b>{' '}
                                  / {lot.initialQuantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: NHẬP / XUẤT KHO (UC01, UC02)                               */}
      {/* ================================================================= */}
      {activeTab === 'RECEIPTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Biểu mẫu lập phiếu */}
          <SectionPanel
            title="Lập phiếu Nhập / Xuất kho"
            className="lg:col-span-5"
          >
            <form onSubmit={handleCreateReceipt} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Loại phiếu" required>
                  <select
                    value={newReceipt.receiptType}
                    onChange={(e) =>
                      setNewReceipt({
                        ...newReceipt,
                        receiptType: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  >
                    <option value="IMPORT">Phiếu nhập kho</option>
                    <option value="EXPORT">Phiếu xuất kho</option>
                  </select>
                </FormField>

                <FormField label="Chế độ lưu" required>
                  <select
                    value={newReceipt.saveMode}
                    onChange={(e) =>
                      setNewReceipt({
                        ...newReceipt,
                        saveMode: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  >
                    <option value="DRAFT">Lưu bản nháp</option>
                    <option value="COMPLETED">
                      Xác nhận hoàn tất ngay
                    </option>
                  </select>
                </FormField>
              </div>

              {newReceipt.receiptType === 'IMPORT' ? (
                <FormField label="Nhà cung cấp" error={receiptErrors.supplierName}>
                  <input
                    type="text"
                    value={newReceipt.supplierName}
                    onChange={(e) =>
                      setNewReceipt({
                        ...newReceipt,
                        supplierName: e.target.value,
                      })
                    }
                    placeholder="Nhập tên nhà cung cấp..."
                    className={inputBaseClasses}
                  />
                </FormField>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Đơn vị nhận hàng" error={receiptErrors.receiver}>
                    <input
                      type="text"
                      value={newReceipt.receiver}
                      onChange={(e) =>
                        setNewReceipt({
                          ...newReceipt,
                          receiver: e.target.value,
                        })
                      }
                      placeholder="Người/đơn vị nhận..."
                      className={inputBaseClasses}
                    />
                  </FormField>
                  <FormField label="Mục đích xuất">
                    <input
                      type="text"
                      value={newReceipt.reason}
                      onChange={(e) =>
                        setNewReceipt({
                          ...newReceipt,
                          reason: e.target.value,
                        })
                      }
                      className={inputBaseClasses}
                    />
                  </FormField>
                </div>
              )}

              <div className="pt-2 border-t border-[var(--color-rule)]">
                <div className="text-[11px] font-medium text-[var(--color-muted)] mb-2.5">
                  Định vị kho & Chi tiết mặt hàng
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Kho thực hiện" required error={receiptErrors.warehouseId}>
                    <select
                      value={newReceipt.warehouseId}
                      onChange={(e) =>
                        setNewReceipt({
                          ...newReceipt,
                          warehouseId: Number(e.target.value),
                        })
                      }
                      className={inputBaseClasses}
                    >
                      {warehouses.length === 0 ? (
                        <option value={newReceipt.warehouseId}>
                          Đang tải danh sách kho…
                        </option>
                      ) : (
                        warehouses.map((w) => (
                          <option key={w.warehouseId} value={w.warehouseId}>
                            {w.name}
                          </option>
                        ))
                      )}
                    </select>
                  </FormField>
                  <FormField label="Sản phẩm & Biến thể" required error={receiptErrors.variantId}>
                    <select
                      value={newReceipt.variantId}
                      onChange={(e) => {
                        const vid = Number(e.target.value);
                        const v = availableVariants.find((it) => it.variantId === vid);
                        setNewReceipt({
                          ...newReceipt,
                          variantId: vid,
                          unitPrice:
                            newReceipt.receiptType === 'EXPORT' && v?.price
                              ? Number(v.price)
                              : newReceipt.unitPrice,
                        });
                      }}
                      className={inputBaseClasses}
                    >
                      {availableVariants.length === 0 ? (
                        <option value={newReceipt.variantId}>
                          Đang tải danh sách sản phẩm…
                        </option>
                      ) : (
                        availableVariants.map((v) => (
                          <option key={v.variantId} value={v.variantId}>
                            {v.label}
                          </option>
                        ))
                      )}
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <FormField label="Lô hàng">
                    <select
                      value={newReceipt.lotId || ''}
                      onChange={(e) =>
                        setNewReceipt({
                          ...newReceipt,
                          lotId: e.target.value ? Number(e.target.value) : 0,
                        })
                      }
                      className={inputBaseClasses}
                    >
                      <option value="">-- Chọn lô hàng --</option>
                      {availableLots.map((l) => (
                        <option key={l.lotId} value={l.lotId}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Vị trí kệ chứa">
                    <select
                      value={newReceipt.locationId || ''}
                      onChange={(e) =>
                        setNewReceipt({
                          ...newReceipt,
                          locationId: e.target.value ? Number(e.target.value) : 0,
                        })
                      }
                      className={inputBaseClasses}
                    >
                      <option value="">-- Chọn vị trí kệ --</option>
                      {availableLocations.map((loc) => (
                        <option key={loc.locationId} value={loc.locationId}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Số lượng" required error={receiptErrors.quantity}>
                    <input
                      type="number"
                      min={1}
                      value={newReceipt.quantity}
                      onChange={(e) =>
                        setNewReceipt({
                          ...newReceipt,
                          quantity: Number(e.target.value),
                        })
                      }
                      className={inputBaseClasses}
                    />
                  </FormField>
                </div>

                {newReceipt.receiptType === 'EXPORT' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <FormField label="Đơn giá bán (VNĐ)" error={receiptErrors.unitPrice}>
                      <input
                        type="number"
                        min={0}
                        value={newReceipt.unitPrice}
                        onChange={(e) =>
                          setNewReceipt({
                            ...newReceipt,
                            unitPrice: Number(e.target.value),
                          })
                        }
                        className={inputBaseClasses}
                      />
                    </FormField>
                    <FormField label="Chiết khấu / Giảm giá (VNĐ)" error={receiptErrors.discount}>
                      <input
                        type="number"
                        min={0}
                        value={newReceipt.discount}
                        onChange={(e) =>
                          setNewReceipt({
                            ...newReceipt,
                            discount: Number(e.target.value),
                          })
                        }
                        className={inputBaseClasses}
                      />
                    </FormField>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full"
              >
                <Icon name="plus" className="w-4 h-4" />
                <span>{loading ? 'Đang ghi nhận phiếu...' : 'Lưu phiếu giao dịch'}</span>
              </Button>
            </form>
          </SectionPanel>

          {/* Danh sách & Bộ lọc phiếu */}
          <SectionPanel
            title="Sổ theo dõi phiếu Nhập / Xuất"
            count={receipts.length}
            className="lg:col-span-7"
            actions={
              <Button
                variant="primary"
                size="xs"
                onClick={() => void loadReceipts(false)}
              >
                <Icon name="filter" className="w-3.5 h-3.5" />
                <span>Lọc danh sách</span>
              </Button>
            }
          >
            <div className="space-y-4">
              {/* Bộ lọc */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 bg-[var(--color-paper-2)] rounded-none border border-[var(--color-rule)]">
                <select
                  value={receiptFilter.type}
                  onChange={(e) =>
                    setReceiptFilter({ ...receiptFilter, type: e.target.value })
                  }
                  aria-label="Lọc theo loại phiếu"
                  className={inputBaseClasses}
                >
                  <option value="">Tất cả loại phiếu</option>
                  <option value="IMPORT">Phiếu nhập kho</option>
                  <option value="EXPORT">Phiếu xuất kho</option>
                </select>
                <select
                  value={receiptFilter.status}
                  onChange={(e) =>
                    setReceiptFilter({
                      ...receiptFilter,
                      status: e.target.value,
                    })
                  }
                  aria-label="Lọc theo trạng thái"
                  className={inputBaseClasses}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="COMPLETED">Đã hoàn tất</option>
                </select>
                <select
                  value={receiptFilter.warehouseId}
                  onChange={(e) =>
                    setReceiptFilter({
                      ...receiptFilter,
                      warehouseId: e.target.value,
                    })
                  }
                  aria-label="Lọc theo kho thực hiện"
                  className={inputBaseClasses}
                >
                  <option value="">Tất cả kho thực hiện</option>
                  {warehouses.map((w) => (
                    <option key={w.warehouseId} value={String(w.warehouseId)}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={receiptFilter.fromDate}
                  onChange={(e) =>
                    setReceiptFilter({
                      ...receiptFilter,
                      fromDate: e.target.value,
                    })
                  }
                  aria-label="Từ ngày"
                  className={inputBaseClasses}
                />
                <input
                  type="date"
                  value={receiptFilter.toDate}
                  onChange={(e) =>
                    setReceiptFilter({
                      ...receiptFilter,
                      toDate: e.target.value,
                    })
                  }
                  aria-label="Đến ngày"
                  className={inputBaseClasses}
                />
              </div>

              {/* Bảng danh sách phiếu */}
              <div className="border border-[var(--color-rule)] rounded-none overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)] text-[11px] font-medium text-[var(--color-muted)]">
                      <tr>
                        <th className="py-2 px-3 font-medium">Số phiếu</th>
                        <th className="py-2 px-2.5 font-medium">Loại phiếu</th>
                        <th className="py-2 px-2.5 font-medium">Kho thực hiện</th>
                        <th className="py-2 px-2.5 font-medium">Ngày lập</th>
                        <th className="py-2 px-2.5 text-right font-medium">Tổng SL</th>
                        <th className="py-2 px-3 text-right font-medium">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-rule)] bg-[var(--color-paper-2)]">
                      {receipts.map((r, idx) => {
                        const isSelected =
                          selectedReceipt?.receiptId === r.receiptId &&
                          selectedReceipt?.receiptType === r.receiptType;
                        return (
                          <tr
                            key={`rcpt-list-${r.receiptType || ''}-${r.receiptId || idx}-${idx}`}
                            onClick={() =>
                              void loadReceiptDetail(r.receiptType, r.receiptId)
                            }
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[var(--color-accent-soft)] font-medium'
                                : 'hover:bg-[var(--color-paper-2)]'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-[var(--color-ink)]">
                              {r.receiptCode}
                            </td>
                            <td className="py-2.5 px-2.5">
                              <StatusBadge
                                status={r.receiptType}
                                label={
                                  r.receiptType === 'IMPORT' ? 'Phiếu nhập' : 'Phiếu xuất'
                                }
                              />
                            </td>
                            <td className="py-2.5 px-2.5 text-[var(--color-ink)]">
                              {r.warehouseName}
                            </td>
                            <td className="py-2.5 px-2.5 font-mono text-[var(--color-muted)]">
                              {new Date(r.date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-semibold">
                              {r.totalQuantity}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <StatusBadge status={r.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chi tiết phiếu được chọn */}
              {selectedReceipt && (
                <div className="p-4 bg-[var(--color-paper-2)] rounded-none border border-[var(--color-rule)] text-xs space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-[var(--color-rule)]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--color-ink)]">
                        Chi tiết phiếu: <span className="font-mono">{selectedReceipt.receiptCode}</span>
                      </span>
                      <StatusBadge status={selectedReceipt.status} />
                    </div>
                    {selectedReceipt.status === 'DRAFT' && (
                      <Button
                        variant="success"
                        size="xs"
                        onClick={() =>
                          void handleCompleteDraftReceipt(
                            selectedReceipt.receiptType,
                            selectedReceipt.receiptId,
                          )
                        }
                      >
                        <Icon name="check" className="w-3.5 h-3.5" />
                        <span>Xác nhận hoàn tất phiếu</span>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[var(--color-muted)]">
                    <div>
                      Kho thực hiện:{' '}
                      <b className="text-[var(--color-ink)]">
                        {selectedReceipt.warehouse?.name}
                      </b>
                    </div>
                    <div>
                      Đối tác / Đơn vị:{' '}
                      <b className="text-[var(--color-ink)]">
                        {selectedReceipt.supplierName ||
                          selectedReceipt.receiver ||
                          'N/A'}
                      </b>
                    </div>
                  </div>

                  <div className="border border-[var(--color-rule)] rounded bg-[var(--color-paper-2)] overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[var(--color-paper-2)] border-b border-[var(--color-rule)] text-[11px] text-[var(--color-muted)]">
                          <th className="py-1.5 px-3">Sản phẩm & Biến thể</th>
                          <th className="py-1.5 px-2">Lô hàng</th>
                          <th className="py-1.5 px-2 text-right">Số lượng</th>
                          <th className="py-1.5 px-3 text-right">Đơn giá</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-rule)]">
                        {(selectedReceipt.items || []).map(
                          (it: any, idx: number) => {
                            const pName = it.variant?.product?.name || 'Sản phẩm';
                            const sku = it.variant?.sku;
                            const color = it.variant?.color?.name ? `Màu ${it.variant.color.name}` : '';
                            const size = it.variant?.size?.name ? `Size ${it.variant.size.name}` : '';
                            const detailStr = [sku, color, size].filter(Boolean).join(' · ');

                            return (
                              <tr key={`rcpt-it-${it.itemId || it.variantId || idx}-${idx}`}>
                                <td className="py-2 px-3">
                                  <div className="font-medium text-[var(--color-ink)]">{pName}</div>
                                  {detailStr && (
                                    <div className="text-[11px] text-[var(--color-muted)] font-mono">{detailStr}</div>
                                  )}
                                </td>
                                <td className="py-2 px-2 font-mono text-[var(--color-muted)]">
                                  {it.lot?.lotCode || 'Lô mặc định'}
                                </td>
                                <td className="py-2 px-2 text-right font-mono font-bold tabular-nums">
                                  {it.quantity}
                                </td>
                                <td className="py-2 px-3 text-right font-mono tabular-nums text-[var(--color-ink)]">
                                  {it.unitPrice
                                    ? `${Number(it.unitPrice).toLocaleString('vi-VN')} đ`
                                    : 'N/A'}
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: BÁO CÁO & THỐNG KÊ (UC15, UC16, UC17, UC20)                */}
      {/* ================================================================= */}
      {activeTab === 'REPORTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* UC15: Tính toán doanh thu */}
          <SectionPanel
            title="Tính toán doanh thu xuất bán"
            actions={
              <Button
                variant="primary"
                size="xs"
                onClick={async () => {
                  const res = await callApi(
                    `/reports/revenue?warehouseId=${revenueFilter.warehouseId}&fromDate=${revenueFilter.fromDate}&toDate=${revenueFilter.toDate}`,
                  );
                  if (res) setRevenueResult(res.data);
                }}
              >
                <Icon name="report" className="w-3.5 h-3.5" />
                <span>Tính doanh thu</span>
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <FormField label="Kho báo cáo">
                  <select
                    value={revenueFilter.warehouseId}
                    onChange={(e) =>
                      setRevenueFilter({
                        ...revenueFilter,
                        warehouseId: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  >
                    {warehouses.map((w) => (
                      <option key={w.warehouseId} value={String(w.warehouseId)}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Từ ngày">
                  <input
                    type="date"
                    value={revenueFilter.fromDate}
                    onChange={(e) =>
                      setRevenueFilter({
                        ...revenueFilter,
                        fromDate: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  />
                </FormField>
                <FormField label="Đến ngày">
                  <input
                    type="date"
                    value={revenueFilter.toDate}
                    onChange={(e) =>
                      setRevenueFilter({
                        ...revenueFilter,
                        toDate: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  />
                </FormField>
              </div>

              {revenueResult && (
                <div className="p-3.5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-none space-y-2 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[var(--color-success)] font-semibold">
                      Tổng doanh thu kỳ:
                    </span>
                    <span className="text-base font-extrabold font-mono tabular-nums text-[var(--color-success)]">
                      {Number(revenueResult.revenue).toLocaleString('vi-VN')}{' '}
                      VNĐ
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-rule-2)] text-[var(--color-ink)]">
                    <div>
                      SL xuất bán:{' '}
                      <b className="font-mono">{revenueResult.totalQuantity}</b>
                    </div>
                    <div>
                      Số phiếu:{' '}
                      <b className="font-mono">{revenueResult.receiptCount}</b>
                    </div>
                    <div>
                      Chiết khấu:{' '}
                      <b className="font-mono">
                        {Number(revenueResult.totalDiscount).toLocaleString(
                          'vi-VN',
                        )}{' '}
                        đ
                      </b>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>

          {/* UC16: Dự báo doanh thu */}
          <SectionPanel
            title="Dự báo doanh thu tháng tiếp theo"
            subtitle="Ước tính theo chu kỳ 3 tháng gần nhất"
            actions={
              <Button
                variant="primary"
                size="xs"
                onClick={async () => {
                  const res = await callApi(
                    `/reports/revenue-forecast?warehouseId=1&referenceDate=2026-10-26`,
                  );
                  if (res) setForecastResult(res.data);
                }}
              >
                <Icon name="clock" className="w-3.5 h-3.5" />
                <span>Dự báo doanh thu</span>
              </Button>
            }
          >
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-muted)]">
                Phương pháp tính: Trung bình cộng doanh thu thực tế của 3 tháng
                hoàn chỉnh gần nhất tại kho.
              </p>
              {forecastResult && (
                <div className="p-3.5 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-none text-xs space-y-2.5">
                  <div className="flex items-baseline justify-between pb-2 border-b border-[var(--color-rule)]">
                    <span className="font-semibold text-[var(--color-ink)]">
                      Dự báo tháng tới:
                    </span>
                    <span className="text-base font-extrabold font-mono tabular-nums text-[var(--color-accent)]">
                      {forecastResult.forecastNextMonth
                        ? `${Number(forecastResult.forecastNextMonth).toLocaleString('vi-VN')} VNĐ`
                        : 'Chưa đủ dữ liệu 3 tháng'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {(forecastResult.monthsUsed || []).map((m: any, mIdx: number) => (
                      <div
                        key={`fc-${m.label || mIdx}-${mIdx}`}
                        className="flex justify-between text-[var(--color-ink)]"
                      >
                        <span>Tháng <span className="font-mono">{m.label}</span></span>
                        <b className="tabular-nums font-semibold">
                          <span className="font-mono">{Number(m.revenue || 0).toLocaleString('vi-VN')}</span> VNĐ
                        </b>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>

          {/* UC17: Đánh giá hiệu suất */}
          <SectionPanel title="Đánh giá hiệu suất vận hành kho">
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={performanceMetric}
                  onChange={(e) => setPerformanceMetric(e.target.value)}
                  aria-label="Chọn chỉ số hiệu suất"
                  className={`flex-1 ${inputBaseClasses}`}
                >
                  <option value="OVERALL">Tổng hợp hiệu suất (OVERALL)</option>
                  <option value="CAPACITY_UTILIZATION">
                    Tỷ lệ lấp đầy sức chứa (CAPACITY_UTILIZATION)
                  </option>
                  <option value="TURNOVER">
                    Hệ số luân chuyển hàng hóa (TURNOVER)
                  </option>
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    const res = await callApi(
                      `/reports/performance?warehouseId=1&metricType=${performanceMetric}`,
                    );
                    if (res?.success) setPerformanceResult(res.data);
                  }}
                >
                  Đánh giá
                </Button>
              </div>

              {performanceResult && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-none">
                    <div className="text-[var(--color-muted)]">Tỷ lệ sử dụng sức chứa</div>
                    <div className="text-base font-bold font-mono tabular-nums text-[var(--color-accent)] mt-0.5">
                      {performanceResult.metrics?.utilizationRate}%
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-none">
                    <div className="text-[var(--color-muted)]">Hệ số luân chuyển</div>
                    <div className="text-base font-bold font-mono tabular-nums text-[var(--color-ink)] mt-0.5">
                      {performanceResult.metrics?.turnoverRate}
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-none col-span-2 flex justify-between">
                    <span>
                      Tổng nhập hoàn tất:{' '}
                      <b className="font-mono">
                        {performanceResult.metrics?.totalImportQty}
                      </b>
                    </span>
                    <span>
                      Tổng xuất hoàn tất:{' '}
                      <b className="font-mono">
                        {performanceResult.metrics?.totalExportQty}
                      </b>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>

          {/* UC20: Thống kê hàng hóa */}
          <SectionPanel
            title="Thống kê hàng hóa & Sức chứa còn lại"
            actions={
              <Button
                variant="primary"
                size="xs"
                onClick={async () => {
                  const qs = new URLSearchParams();
                  if (invStatsFilter.warehouseId)
                    qs.set('warehouseId', invStatsFilter.warehouseId);
                  if (invStatsFilter.fromDate)
                    qs.set('fromDate', invStatsFilter.fromDate);
                  if (invStatsFilter.toDate)
                    qs.set('toDate', invStatsFilter.toDate);
                  const res = await callApi(
                    `/reports/inventory-statistics?${qs.toString()}`,
                  );
                  if (res?.success) setInventoryStats(res.data);
                }}
              >
                Tổng hợp thống kê
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <FormField label="Kho thống kê">
                  <select
                    value={invStatsFilter.warehouseId}
                    onChange={(e) =>
                      setInvStatsFilter({
                        ...invStatsFilter,
                        warehouseId: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  >
                    {warehouses.map((w) => (
                      <option key={w.warehouseId} value={String(w.warehouseId)}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Từ ngày">
                  <input
                    type="date"
                    value={invStatsFilter.fromDate}
                    onChange={(e) =>
                      setInvStatsFilter({
                        ...invStatsFilter,
                        fromDate: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  />
                </FormField>
                <FormField label="Đến ngày">
                  <input
                    type="date"
                    value={invStatsFilter.toDate}
                    onChange={(e) =>
                      setInvStatsFilter({
                        ...invStatsFilter,
                        toDate: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  />
                </FormField>
              </div>

              {inventoryStats && (
                <div className="grid grid-cols-2 gap-2.5 p-3 bg-[var(--color-accent-soft)] border border-[var(--color-rule)] rounded-none text-xs">
                  <div>
                    Tồn hiện tại:{' '}
                    <b className="font-semibold">
                      <span className="font-mono tabular-nums">{inventoryStats.currentStock}</span> chiếc
                    </b>
                  </div>
                  <div>
                    Sức chứa tối đa:{' '}
                    <b className="font-semibold">
                      <span className="font-mono tabular-nums">{inventoryStats.maxCapacity}</span> chiếc
                    </b>
                  </div>
                  <div>
                    Sức chứa còn lại:{' '}
                    <b className="font-semibold text-[var(--color-accent)]">
                      <span className="font-mono tabular-nums">{inventoryStats.remainingCapacity}</span> chiếc
                    </b>
                  </div>
                  <div>
                    Nhập / Xuất kỳ:{' '}
                    <b className="font-mono tabular-nums">
                      +{inventoryStats.totalImported} / -
                      {inventoryStats.totalExported}
                    </b>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 5: CƠ SỞ VẬT CHẤT & SỰ CỐ (UC06, UC07, UC10)                  */}
      {/* ================================================================= */}
      {activeTab === 'INCIDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-5">
            <SectionPanel
              title="Ghi nhận sự cố cơ sở vật chất"
            >
              <form onSubmit={handleCreateIncident} className="space-y-3.5">
                <FormField label="Kho / Vị trí xảy ra sự cố" required error={incidentErrors.locationDescription}>
                  <input
                    type="text"
                    required
                    value={newIncident.locationDescription}
                    onChange={(e) =>
                      setNewIncident({
                        ...newIncident,
                        locationDescription: e.target.value,
                      })
                    }
                    placeholder="VD: Khu A - Kệ A1 - Tầng 1"
                    className={inputBaseClasses}
                  />
                </FormField>

                <FormField label="Tên thiết bị / Cơ sở vật chất" error={incidentErrors.facilityName}>
                  <input
                    type="text"
                    value={newIncident.facilityName}
                    onChange={(e) =>
                      setNewIncident({
                        ...newIncident,
                        facilityName: e.target.value,
                      })
                    }
                    placeholder="VD: Khung kệ sắt chịu lực A1"
                    className={inputBaseClasses}
                  />
                </FormField>

                <FormField label="Mô tả chi tiết sự cố" required error={incidentErrors.description}>
                  <textarea
                    rows={3}
                    required
                    value={newIncident.description}
                    onChange={(e) =>
                      setNewIncident({
                        ...newIncident,
                        description: e.target.value,
                      })
                    }
                    placeholder="Nhập mô tả tình trạng hư hỏng..."
                    className={inputBaseClasses}
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Đang lưu báo cáo...' : 'Lưu báo cáo sự cố'}
                </Button>
              </form>
            </SectionPanel>

            {/* Danh mục trang thiết bị kho (UC06) */}
            {(facilitiesData.facilities || []).length > 0 && (
              <SectionPanel
                title="Thiết bị & Hạ tầng đang theo dõi"
                count={facilitiesData.facilities.length}
                noPadding
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[11px] text-[var(--color-muted)]">
                        <th className="py-2 px-3">Thiết bị</th>
                        <th className="py-2 px-2">Số lượng</th>
                        <th className="py-2 px-3 text-right">Tình trạng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-rule)]">
                      {facilitiesData.facilities.map((f: any, fIdx: number) => (
                        <tr key={`fac-${f.facilityId || f.rackId || f.id || fIdx}-${fIdx}`}>
                          <td className="py-2 px-3 font-medium text-[var(--color-ink)]">
                            {f.name}
                          </td>
                          <td className="py-2 px-2 font-mono">{f.quantity}</td>
                          <td className="py-2 px-3 text-right">
                            <StatusBadge status={f.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionPanel>
            )}
          </div>

          <SectionPanel
            title="Danh sách sự cố & Nghiệm thu sửa chữa"
            count={(facilitiesData.incidents || []).length}
            className="lg:col-span-7"
            actions={
              <Button
                variant="outline"
                size="xs"
                onClick={() => void loadFacilitiesAndIncidents()}
              >
                <Icon name="refresh" className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="border border-[var(--color-rule)] rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-semibold text-[var(--color-muted)]">
                      <th className="py-2.5 px-3">Mã</th>
                      <th className="py-2.5 px-3">Thiết bị & Vị trí</th>
                      <th className="py-2.5 px-3">Mô tả sự cố</th>
                      <th className="py-2.5 px-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {(facilitiesData.incidents || []).map((inc: any, incIdx: number) => {
                      const isSelected =
                        selectedIncident?.incidentId === inc.incidentId;
                      return (
                        <tr
                          key={`inc-${inc.incidentId || incIdx}-${incIdx}`}
                          onClick={() => setSelectedIncident(inc)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-accent-soft)] font-medium'
                              : 'hover:bg-[var(--color-paper-2)]'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-[var(--color-muted)]">
                            #{inc.incidentId}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[var(--color-ink)]">
                              {inc.facilityName}
                            </div>
                            <div className="text-[11px] text-[var(--color-muted)]">
                              {inc.locationDescription}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-[var(--color-muted)]">
                            {inc.description}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <StatusBadge status={inc.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedIncident && (
                <div className="p-4 bg-[var(--color-paper-2)] rounded-none border border-[var(--color-rule)] text-xs space-y-3">
                  <div className="font-bold text-[var(--color-ink)]">
                    Xác nhận kết quả sửa chữa: Sự cố #
                    {selectedIncident.incidentId} (
                    {selectedIncident.facilityName})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Kết quả nghiệm thu">
                      <select
                        value={confirmRepairForm.result}
                        onChange={(e) =>
                          setConfirmRepairForm({
                            ...confirmRepairForm,
                            result: e.target.value,
                          })
                        }
                        className={inputBaseClasses}
                      >
                        <option value="DAT">Đạt yêu cầu (Đóng sự cố)</option>
                        <option value="CHUA_DAT">
                          Chưa đạt yêu cầu (Tiếp tục xử lý)
                        </option>
                      </select>
                    </FormField>
                    <FormField label="Ghi chú nghiệm thu">
                      <input
                        type="text"
                        value={confirmRepairForm.note}
                        onChange={(e) =>
                          setConfirmRepairForm({
                            ...confirmRepairForm,
                            note: e.target.value,
                          })
                        }
                        placeholder="Ghi chú nghiệm thu..."
                        className={inputBaseClasses}
                      />
                    </FormField>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() =>
                      void handleConfirmRepair(selectedIncident.incidentId)
                    }
                  >
                    <Icon name="check" className="w-3.5 h-3.5" />
                    <span>Xác nhận nghiệm thu</span>
                  </Button>
                </div>
              )}
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 6: HỢP ĐỒNG THUÊ KHO (UC08, UC09)                             */}
      {/* ================================================================= */}
      {activeTab === 'CONTRACTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-5">
            <SectionPanel
              title={
                editingContractId
                  ? `Cập nhật Hợp đồng #${editingContractId}`
                  : 'Đăng ký Hợp đồng thuê kho'
              }
              actions={
                editingContractId ? (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setEditingContractId(null)}
                  >
                    Hủy sửa
                  </Button>
                ) : undefined
              }
            >
              <form onSubmit={handleCreateContract} className="space-y-3.5">
                <FormField label="Kho thuê" required error={contractErrors.warehouseId}>
                  <select
                    value={newContract.warehouseId}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        warehouseId: Number(e.target.value),
                      })
                    }
                    className={inputBaseClasses}
                  >
                    {warehouses.map((w) => (
                      <option key={w.warehouseId} value={w.warehouseId}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Đơn vị cho thuê" required error={contractErrors.lessorName}>
                  <input
                    type="text"
                    required
                    value={newContract.lessorName}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        lessorName: e.target.value,
                      })
                    }
                    placeholder="Nhập tên đơn vị cho thuê..."
                    className={inputBaseClasses}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Ngày bắt đầu" error={contractErrors.startDate}>
                    <input
                      type="date"
                      value={newContract.startDate}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          startDate: e.target.value,
                        })
                      }
                      className={inputBaseClasses}
                    />
                  </FormField>
                  <FormField label="Ngày kết thúc" error={contractErrors.endDate}>
                    <input
                      type="date"
                      value={newContract.endDate}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          endDate: e.target.value,
                        })
                      }
                      className={inputBaseClasses}
                    />
                  </FormField>
                </div>

                <FormField label="Giá thuê (VNĐ/tháng)">
                  <input
                    type="number"
                    min={0}
                    value={newContract.rentalPrice}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        rentalPrice: Number(e.target.value),
                      })
                    }
                    className={inputBaseClasses}
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  {editingContractId ? 'Lưu cập nhật' : 'Thêm hợp đồng'}
                </Button>
              </form>
            </SectionPanel>

            <SectionPanel
              title="Kiểm tra & Cảnh báo hợp đồng sắp hết hạn"
            >
              <div className="space-y-3 text-xs">
                <p className="text-[var(--color-muted)]">
                  Hệ thống tự động rà soát các hợp đồng còn thời hạn dưới 14
                  ngày và gửi cảnh báo tới quản lý kho.
                </p>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => void handleCheckContractExpiry()}
                  className="w-full"
                >
                  <Icon name="warning" className="w-4 h-4" />
                  <span>Kiểm tra & Gửi cảnh báo Email</span>
                </Button>
                {expiryCheckResult && (
                  <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-none text-[var(--color-warning)]">
                    Đã gửi cảnh báo cho <b>{expiryCheckResult.notifiedCount}</b>{' '}
                    hợp đồng sắp hết hạn (trong vòng 14 ngày).
                  </div>
                )}
              </div>
            </SectionPanel>
          </div>

          <SectionPanel
            title="Danh sách Hợp đồng & Thời hạn hiệu lực"
            count={contracts.length}
            className="lg:col-span-7"
          >
            <div className="space-y-4">
              <div className="border border-[var(--color-rule)] rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-semibold text-[var(--color-muted)]">
                      <th className="py-2.5 px-3">Mã HĐ</th>
                      <th className="py-2.5 px-3">Đơn vị cho thuê</th>
                      <th className="py-2.5 px-3">Hiệu lực</th>
                      <th className="py-2.5 px-3 text-right">Giá thuê/tháng</th>
                      <th className="py-2.5 px-3 text-right">Thời hạn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {contracts.map((c, cIdx) => {
                      const isSelected =
                        selectedContract?.contractId === c.contractId;
                      return (
                        <tr
                          key={`ctr-${c.contractId || cIdx}-${cIdx}`}
                          onClick={() => void loadContractDetail(c.contractId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-accent-soft)] font-medium'
                              : 'hover:bg-[var(--color-paper-2)]'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-[var(--color-ink)]">
                            #{c.contractId}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[var(--color-ink)]">
                              {c.lessorName}
                            </div>
                            <div className="text-[11px] text-[var(--color-muted)]">
                              Trạng thái: {c.status}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                            {String(c.startDate).slice(0, 10)} →{' '}
                            {String(c.endDate).slice(0, 10)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">
                            {Number(c.rentalPrice).toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {c.termInfo ? (
                              <StatusBadge
                                status={c.termInfo.termStatus}
                                label={`${c.termInfo.termStatus} (${c.termInfo.remainingDays} ngày)`}
                              />
                            ) : (
                              <StatusBadge status={c.status} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedContract && (
                <div className="p-4 bg-[var(--color-paper-2)] rounded-none border border-[var(--color-rule)] text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--color-ink)]">
                      Điều phối Hợp đồng #{selectedContract.contractId}:{' '}
                      {selectedContract.lessorName}
                    </span>
                    <StatusBadge status={selectedContract.status} />
                  </div>

                  {selectedContract.termInfo?.warningMessage && (
                    <div className="p-2.5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] text-[var(--color-warning)] rounded font-medium flex items-center gap-2">
                      <Icon name="warning" className="w-4 h-4 shrink-0" />
                      <span>
                        {selectedContract.termInfo.warningMessage} (Còn{' '}
                        {selectedContract.termInfo.remainingDays} ngày)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--color-rule)]">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setEditingContractId(selectedContract.contractId);
                        setNewContract({
                          warehouseId: selectedContract.warehouseId,
                          lessorName: selectedContract.lessorName,
                          startDate: String(selectedContract.startDate).slice(
                            0,
                            10,
                          ),
                          endDate: String(selectedContract.endDate).slice(
                            0,
                            10,
                          ),
                          rentalPrice: Number(selectedContract.rentalPrice),
                          note: selectedContract.note || '',
                        });
                      }}
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                      <span>Sửa hợp đồng</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        value={renewEndDate}
                        onChange={(e) => setRenewEndDate(e.target.value)}
                        aria-label="Ngày gia hạn mới"
                        className="px-2 py-1 text-xs border border-[var(--color-rule-2)] rounded bg-[var(--color-paper-2)]"
                      />
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() =>
                          void handleRenewContract(selectedContract.contractId)
                        }
                      >
                        Gia hạn
                      </Button>
                    </div>

                    <Button
                      variant="warning"
                      size="xs"
                      onClick={() =>
                        requestTerminateContract(selectedContract.contractId)
                      }
                    >
                      Chấm dứt
                    </Button>

                    <Button
                      variant="danger"
                      size="xs"
                      onClick={() =>
                        requestDeleteContract(selectedContract.contractId)
                      }
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                      <span>Xóa hợp đồng</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 7: TIN NHẮN NỘI BỘ (UC11, UC12)                               */}
      {/* ================================================================= */}
      {activeTab === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SectionPanel
            title="Kênh trao đổi vận hành"
            count={conversations.length}
            className="lg:col-span-4"
            noPadding
          >
            {conversations.length === 0 ? (
              <EmptyState
                icon="chat"
                title="Chưa có cuộc trò chuyện"
                description="Danh sách kênh trao đổi nội bộ sẽ hiển thị tại đây."
              />
            ) : (
              <div className="divide-y divide-[var(--color-rule)]">
                {conversations.map((conv, convIdx) => {
                  const isSelected = selectedConvId === conv.conversationId;
                  return (
                    <button
                      key={`conv-${conv.conversationId || convIdx}-${convIdx}`}
                      type="button"
                      onClick={() => void loadMessages(conv.conversationId)}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[var(--color-accent-soft)] border-l-2 border-[var(--color-accent)]'
                          : 'hover:bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--color-ink)] leading-snug break-words">
                          {conv.title}
                        </div>
                        <div className="text-[11px] text-[var(--color-muted)] mt-0.5">
                          Thành viên: {(conv.participants || []).length} người
                        </div>
                      </div>
                      <Icon
                        name="chevronRight"
                        className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </SectionPanel>

          <SectionPanel
            title="Nội dung trao đổi"
            className="lg:col-span-8 min-h-[420px]"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="space-y-2.5 max-h-80 overflow-y-auto p-3.5 bg-[var(--color-paper-2)] rounded-none border border-[var(--color-rule)] flex-1">
                {messages.length === 0 ? (
                  <EmptyState
                    icon="chat"
                    title="Chưa có tin nhắn"
                    description="Hãy gửi tin nhắn đầu tiên để trao đổi công việc với nhóm kho."
                  />
                ) : (
                  messages.map((m, mIdx) => {
                    const isOwn = m.senderId === currentUser.userId;
                    return (
                      <div
                        key={`msg-${m.messageId || mIdx}-${mIdx}`}
                        className={`p-3 rounded-none text-xs max-w-md ${
                          isOwn
                            ? 'ml-auto bg-[var(--color-chat-bubble)] border border-[var(--color-chat-bubble-border)] text-[var(--color-chat-bubble-ink)]'
                            : 'bg-[var(--color-chat-bubble-other)] border border-[var(--color-chat-bubble-other-border)] text-[var(--color-ink)]'
                        }`}
                      >
                        <div
                          className={`font-semibold text-[10px] mb-1 ${
                            isOwn ? 'text-[var(--color-chat-bubble-meta)]' : 'text-[var(--color-muted)]'
                          }`}
                        >
                          {m.sender?.employee?.fullName ||
                            m.sender?.username ||
                            `Người dùng #${m.senderId}`}
                        </div>
                        <div className="leading-relaxed">{m.content}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      setChatError('');
                    }}
                    placeholder="Nhập nội dung tin nhắn điều phối..."
                    aria-label="Nội dung tin nhắn"
                    className={`flex-1 ${inputBaseClasses} ${chatError ? 'border-[var(--color-error)]! ring-1 ring-[var(--color-error)]!' : ''}`}
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={loading}>
                    <Icon name="send" className="w-3.5 h-3.5" />
                    <span>Gửi tin nhắn</span>
                  </Button>
                </form>
                {chatError && (
                  <p className="text-[11px] text-[var(--color-error)] font-medium flex items-center gap-1">
                    <Icon name="error" className="w-3 h-3 shrink-0" />
                    <span>{chatError}</span>
                  </p>
                )}
              </div>
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 8: NHÂN SỰ: LƯƠNG THƯỞNG & CÔNG VIỆC (UC21, UC22)            */}
      {/* ================================================================= */}
      {activeTab === 'HR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bảng lương (UC21) */}
          <SectionPanel
            title="Bảng lương & Thưởng nhân sự"
            className="lg:col-span-6"
            noPadding
            actions={
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                  placeholder="Kỳ (VD: 2026-10)"
                  aria-label="Kỳ lương"
                  className="w-28 px-2.5 py-1 text-xs bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded"
                />
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => void loadHrData()}
                >
                  Truy vấn
                </Button>
              </div>
            }
          >
            {(salariesData?.records || []).length === 0 ? (
              <EmptyState
                icon="hr"
                title="Không có bản ghi lương"
                description="Chọn kỳ lương (VD: 2026-10) và nhấn Truy vấn."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-semibold text-[var(--color-muted)]">
                      <th className="py-2.5 px-4">Nhân sự</th>
                      <th className="py-2.5 px-2">Kỳ</th>
                      <th className="py-2.5 px-3 text-right">Lương cơ bản</th>
                      <th className="py-2.5 px-3 text-right">Thưởng</th>
                      <th className="py-2.5 px-4 text-right">Tổng thực lĩnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {(salariesData?.records || []).map((sal: any, sIdx: number) => (
                      <tr key={`sal-${sal.salaryId || sIdx}-${sIdx}`} className="hover:bg-[var(--color-paper-2)]">
                        <td className="py-2.5 px-4">
                          <div className="font-bold text-[var(--color-ink)]">
                            {sal.employee?.fullName}
                          </div>
                          <div className="text-[11px] text-[var(--color-muted)]">
                            {sal.employee?.position}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[var(--color-muted)]">
                          {sal.period}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[var(--color-ink)]">
                          {Number(sal.baseSalary).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[var(--color-accent)]">
                          +{Number(sal.bonus).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-[var(--color-success)]">
                          {Number(sal.totalSalary).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>

          {/* Danh sách công việc (UC22) */}
          <SectionPanel
            title="Phân công công việc vận hành"
            count={tasksData.length}
            className="lg:col-span-6"
            noPadding
            actions={
              <select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                aria-label="Lọc loại công việc"
                className="px-2.5 py-1 text-xs bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded"
              >
                <option value="">Tất cả loại công việc</option>
                <option value="NHAP_KHO">Nhập kho (NHAP_KHO)</option>
                <option value="KIEM_DINH">Kiểm định (KIEM_DINH)</option>
                <option value="XUAT_KHO">Xuất kho (XUAT_KHO)</option>
              </select>
            }
          >
            {tasksData.length === 0 ? (
              <EmptyState
                icon="hr"
                title="Chưa có nhiệm vụ được phân công"
                description="Các công việc nhập kho, xuất kho và kiểm định sẽ hiển thị tại đây."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-semibold text-[var(--color-muted)]">
                      <th className="py-2.5 px-3">Loại</th>
                      <th className="py-2.5 px-3">Công việc & Mô tả</th>
                      <th className="py-2.5 px-3">Nhân sự / Kho</th>
                      <th className="py-2.5 px-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {tasksData.map((t: any, tIdx: number) => (
                      <tr key={`task-${t.taskId || tIdx}-${tIdx}`} className="hover:bg-[var(--color-paper-2)]">
                        <td className="py-2.5 px-3">
                          <StatusBadge status={t.taskType} mono />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[var(--color-ink)]">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-[var(--color-muted)] mt-0.5">
                            {t.description}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-[var(--color-muted)]">
                          <div className="font-semibold text-[var(--color-ink)]">
                            {t.employee?.fullName}
                          </div>
                          <div>{t.warehouse?.name}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 9: TÀI KHOẢN & PHÂN QUYỀN (UC18)                              */}
      {/* ================================================================= */}
      {activeTab === 'USERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SectionPanel
            title={
              editingUserId
                ? `Cập nhật Tài khoản #${editingUserId}`
                : 'Cấp tài khoản nhân viên mới'
            }
            className="lg:col-span-5"
            actions={
              editingUserId ? (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setEditingUserId(null);
                    setNewUserForm({
                      username: '',
                      password: '',
                      fullName: '',
                      email: '',
                      phone: '',
                      position: 'Nhân viên kho',
                      roleName: 'USER',
                      status: 'ACTIVE',
                    });
                  }}
                >
                  + Tạo mới
                </Button>
              ) : undefined
            }
          >
            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Tên đăng nhập" required error={userErrors.username}>
                  <input
                    type="text"
                    required
                    value={newUserForm.username}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        username: e.target.value,
                      })
                    }
                    placeholder="Nhập username..."
                    className={inputBaseClasses}
                  />
                </FormField>
                <FormField label="Họ và tên nhân viên" required error={userErrors.fullName}>
                  <input
                    type="text"
                    required
                    value={newUserForm.fullName}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Nhập họ và tên..."
                    className={inputBaseClasses}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Chức vụ" error={userErrors.position}>
                  <input
                    type="text"
                    value={newUserForm.position}
                    onChange={(e) => {
                      setNewUserForm({
                        ...newUserForm,
                        position: e.target.value,
                      });
                      if (userErrors.position) setUserErrors((prev) => ({ ...prev, position: undefined }));
                    }}
                    className={inputBaseClasses}
                  />
                </FormField>
                <FormField label="Email liên hệ" error={userErrors.email}>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => {
                      setNewUserForm({
                        ...newUserForm,
                        email: e.target.value,
                      });
                      if (userErrors.email) setUserErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="email@warehouse.vn"
                    className={inputBaseClasses}
                  />
                </FormField>
                <FormField label="Số điện thoại" error={userErrors.phone}>
                  <input
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(e) => {
                      setNewUserForm({
                        ...newUserForm,
                        phone: e.target.value,
                      });
                      if (userErrors.phone) setUserErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="0912345678"
                    className={inputBaseClasses}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  label={editingUserId ? 'Mật khẩu (tùy chọn)' : 'Mật khẩu'}
                  required={!editingUserId}
                  error={userErrors.password}
                >
                  <input
                    type="password"
                    required={!editingUserId}
                    value={newUserForm.password}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        password: e.target.value,
                      })
                    }
                    placeholder={editingUserId ? 'Để trống nếu giữ' : '••••••'}
                    className={inputBaseClasses}
                  />
                </FormField>
                <FormField label="Vai trò">
                  <select
                    value={newUserForm.roleName}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        roleName: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  >
                    <option value="USER">Nhân viên (USER)</option>
                    <option value="ADMIN">Quản trị (ADMIN)</option>
                  </select>
                </FormField>
                <FormField label="Trạng thái">
                  <select
                    value={newUserForm.status}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        status: e.target.value,
                      })
                    }
                    className={inputBaseClasses}
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="LOCKED">Tạm khóa (LOCKED)</option>
                  </select>
                </FormField>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Đang xử lý tài khoản...' : editingUserId ? 'Lưu cập nhật tài khoản' : 'Tạo tài khoản'}
              </Button>
            </form>
          </SectionPanel>

          <SectionPanel
            title="Danh sách tài khoản nhân sự"
            count={usersList.length}
            className="lg:col-span-7"
            noPadding
            actions={
              <Button
                variant="outline"
                size="xs"
                onClick={() => void loadUsers()}
              >
                <Icon name="refresh" className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-semibold text-[var(--color-muted)]">
                    <th className="py-2.5 px-4">Tài khoản</th>
                    <th className="py-2.5 px-3">Họ tên & Chức vụ</th>
                    <th className="py-2.5 px-3">Vai trò</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-rule)]">
                  {usersList.map((u, uIdx) => {
                    const isEditing = editingUserId === u.userId;
                    return (
                      <tr
                        key={`usr-${u.userId || uIdx}-${uIdx}`}
                        onClick={() => {
                          setEditingUserId(u.userId);
                          setNewUserForm({
                            username: u.username,
                            password: '',
                            fullName: u.employee?.fullName || '',
                            email: u.employee?.email || '',
                            phone: u.employee?.phone || '',
                            position: u.employee?.position || 'Nhân viên kho',
                            roleName: u.role?.name || 'USER',
                            status: u.status || 'ACTIVE',
                          });
                        }}
                        className={`cursor-pointer transition-colors ${
                          isEditing ? 'bg-[var(--color-accent-soft)]' : 'hover:bg-[var(--color-paper-2)]'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-[var(--color-ink)]">
                          {u.username}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[var(--color-ink)]">
                            {u.employee?.fullName}
                          </div>
                          <div className="text-[11px] text-[var(--color-muted)]">
                            {u.employee?.position} ·{' '}
                            {u.employee?.email || 'Chưa cập nhật email'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge
                            status={u.role?.name || 'USER'}
                            mono
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
                            Sửa
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 10: HỆ THỐNG: SAO LƯU & NHẬT KÝ LỖI (UC19, UC23)             */}
      {/* ================================================================= */}
      {activeTab === 'SYSTEM' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sao lưu dữ liệu (UC19) */}
          <SectionPanel
            title="Sao lưu cơ sở dữ liệu"
            className="lg:col-span-5"
          >
            <div className="space-y-4 text-xs">
              {backupConfig ? (
                <div className="p-3 bg-[var(--color-paper-2)] rounded-none border border-[var(--color-rule)] space-y-1">
                  <div className="text-[var(--color-muted)]">
                    Thư mục lưu trữ bản sao lưu:
                  </div>
                  <div className="font-mono font-semibold text-[var(--color-ink)] break-all">
                    {backupConfig.backupDestination}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[var(--color-paper-2)] rounded-none border border-[var(--color-rule)] text-[var(--color-muted)]">
                  {isAdmin
                    ? 'Đang kiểm tra cấu hình thư mục sao lưu...'
                    : 'Chức năng cấu hình và kích hoạt sao lưu dữ liệu yêu cầu quyền Quản trị viên (ADMIN).'}
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                disabled={!isAdmin}
                onClick={async () => {
                  const res = await callApi('/system/backup', {
                    method: 'POST',
                    body: JSON.stringify({}),
                  });
                  if (res) {
                    setBackupResult(res.data);
                    void loadSystemData();
                  }
                }}
                className="w-full"
              >
                <Icon name="database" className="w-4 h-4" />
                <span>Sao lưu dữ liệu ngay</span>
              </Button>

              {backupResult && (
                <div className="p-3.5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-none space-y-1.5 text-[var(--color-success)]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Trạng thái sao lưu:</span>
                    <StatusBadge status={backupResult.status} />
                  </div>
                  <div className="text-[11px] break-all">
                    Tệp: <span className="font-mono">{backupResult.filePath}</span>
                  </div>
                  <div className="text-[11px]">
                    Dung lượng: <span className="font-mono tabular-nums">{backupResult.fileSize}</span> bytes
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>

          {/* Nhật ký lỗi hệ thống (UC23) */}
          <SectionPanel
            title="Nhật ký lỗi vận hành hệ thống"
            count={errorLogs.length}
            className="lg:col-span-7"
            actions={
              <Button
                variant="outline"
                size="xs"
                onClick={() => void loadSystemData()}
              >
                <Icon name="refresh" className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="border border-[var(--color-rule)] rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-semibold text-[var(--color-muted)]">
                      <th className="py-2.5 px-3">Mã lỗi</th>
                      <th className="py-2.5 px-3">Phân hệ</th>
                      <th className="py-2.5 px-3">Endpoint</th>
                      <th className="py-2.5 px-3">Thông điệp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {errorLogs.map((err, errIdx) => {
                      const isSelected =
                        selectedErrorLog?.errorId === err.errorId;
                      return (
                        <tr
                          key={`err-${err.errorId || errIdx}-${errIdx}`}
                          onClick={() => setSelectedErrorLog(err)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[var(--color-paper-2)]' : 'hover:bg-[var(--color-paper-2)]'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-[var(--color-error)]">
                            {err.errorCode}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[var(--color-ink)]">
                            {err.moduleName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-muted)]">
                            {err.method} {err.path}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--color-ink)]">
                            {err.message}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedErrorLog && (
                <div className="p-4 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-none text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--color-error)]">
                      Chi tiết lỗi #{selectedErrorLog.errorId}:{' '}
                      {selectedErrorLog.errorCode}
                    </span>
                    <StatusBadge status={selectedErrorLog.severity} mono />
                  </div>
                  <div className="text-[var(--color-ink)]">
                    Mô tả chi tiết: {selectedErrorLog.detail}
                  </div>
                  <div className="text-[11px] text-[var(--color-muted)]">
                    Đường dẫn: <span className="font-mono">{selectedErrorLog.method} {selectedErrorLog.path}</span>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>
        </div>
      )}
    </AppShell>
  );
}
