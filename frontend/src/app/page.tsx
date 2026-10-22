'use client';

import { useState, useEffect } from 'react';

interface AuthUser {
  userId: number;
  username: string;
  fullName?: string;
  role?: string;
  position?: string;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  requestId?: string;
  duration?: string;
  timestamp?: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra token đã lưu từ phiên trước
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

  const handleLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage(null);

    const userToSubmit = customUser !== undefined ? customUser : username;
    const passToSubmit = customPass !== undefined ? customPass : password;

    try {
      // UI -> System : kiemTraThongTinXacThuc()
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': `req-${Date.now()}`,
        },
        body: JSON.stringify({
          username: userToSubmit,
          password: passToSubmit,
        }),
      });

      const result: ApiResponse<{ accessToken: string; user: AuthUser }> =
        await response.json();
      setRequestId(result.requestId || response.headers.get('X-Request-Id'));

      if (response.ok && result.success) {
        // Nhánh: Thông tin xác thực hợp lệ
        // System --> UI : xacNhanDangNhapThanhCong()
        // UI -> UI : moGiaoDienChucNang()
        // UI --> User : hienThiGiaoDien()
        localStorage.setItem('access_token', result.data.accessToken);
        localStorage.setItem('user_info', JSON.stringify(result.data.user));
        setCurrentUser(result.data.user);
        setMessageType('success');
        setMessage('Đăng nhập thành công! Hệ thống đang mở giao diện chức năng...');
      } else {
        // Xử lý các nhánh lỗi theo Sequence Diagram:
        // 401: Thông tin đăng nhập sai -> "Không xác thực được"
        // 403: Tài khoản không được phép truy cập -> "Từ chối đăng nhập"
        // 500: Lỗi hệ thống -> "Không thể hoàn tất thao tác"
        setMessageType('error');
        setMessage(result.message || 'Không thể hoàn tất thao tác');
      }
    } catch {
      // Khi không kết nối được tới server backend (Lỗi hệ thống)
      setMessageType('error');
      setMessage('Không thể hoàn tất thao tác');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setCurrentUser(null);
    setMessage('Đã đăng xuất khỏi hệ thống');
    setMessageType('info');
    setUsername('');
    setPassword('');
  };

  // Nếu người dùng đã đăng nhập thành công: Mở Giao diện chức năng (moGiaoDienChucNang)
  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {/* Header Navigation */}
        <header className="bg-blue-900 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center font-bold text-xl shadow">
                👕
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Hệ Thống Quản Lý Kho Quần Áo</h1>
                <p className="text-xs text-blue-200">OOAD Project - Module Vận hành Kho</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-semibold">{currentUser.fullName || currentUser.username}</div>
                <div className="text-xs inline-block px-2 py-0.5 rounded bg-blue-800 text-blue-200 font-mono">
                  Vai trò: {currentUser.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition shadow-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Banner */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Xin chào, {currentUser.fullName || currentUser.username}! 👋
              </h2>
              <p className="text-slate-600 mt-1">
                Giao diện chức năng quản lý kho đã được mở thành công sau khi xác thực quyền hạn.
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              <div>Vị trí: {currentUser.position || 'Nhân sự kho'}</div>
              <div>User ID: #{currentUser.userId}</div>
              {requestId && <div>Request ID: {requestId}</div>}
            </div>
          </div>

          {/* Functional Modules Grid */}
          <h3 className="text-lg font-bold text-slate-800 mb-4">Các phân hệ quản lý kho</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">🏢</div>
              <h4 className="font-bold text-slate-900 text-base">Quản lý Kho & Vị trí</h4>
              <p className="text-sm text-slate-600 mt-1">
                Quản lý kho hàng, khu vực kho (Zone), kệ (Rack) và các ô lưu trữ (StorageLocation).
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">🏷️</div>
              <h4 className="font-bold text-slate-900 text-base">Sản phẩm & Biến thể</h4>
              <p className="text-sm text-slate-600 mt-1">
                Quản lý danh mục quần áo, sản phẩm, kích thước (Size), màu sắc (Color) và mã SKU/Barcode.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">📥</div>
              <h4 className="font-bold text-slate-900 text-base">Nghiệp vụ Nhập kho</h4>
              <p className="text-sm text-slate-600 mt-1">
                Lập phiếu nhập kho (ImportReceipt), chi tiết lô hàng (Lot) và tự động cộng tồn kho.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">📤</div>
              <h4 className="font-bold text-slate-900 text-base">Nghiệp vụ Xuất kho</h4>
              <p className="text-sm text-slate-600 mt-1">
                Lập phiếu xuất kho (ExportReceipt), chỉ định vị trí lấy hàng và tạo đơn giao hàng (Delivery).
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">🔍</div>
              <h4 className="font-bold text-slate-900 text-base">Kiểm định Chất lượng</h4>
              <p className="text-sm text-slate-600 mt-1">
                Ghi nhận lịch sử kiểm tra chất lượng (QualityCheck): Tốt, Lỗi, Hỏng theo từng lô hàng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-bold text-slate-900 text-base">Tồn kho theo Vị trí</h4>
              <p className="text-sm text-slate-600 mt-1">
                Truy vấn chính xác sản phẩm nào, thuộc lô nào, đang ở vị trí kệ/tầng/ô nào (InventoryLocation).
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Giao diện Đăng nhập (:GiaoDienDangNhap)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 text-3xl mb-3 shadow-inner">
            📦
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hệ Thống Quản Lý Kho</h1>
          <p className="text-sm text-slate-500 mt-1">Phân tích & Thiết kế Hướng đối tượng (OOAD)</p>
        </div>

        {/* Message Alert theo Sequence Diagram */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-start space-x-3 transition-all ${
              messageType === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : messageType === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <span className="text-lg">
              {messageType === 'error' ? '⚠️' : messageType === 'success' ? '✅' : 'ℹ️'}
            </span>
            <div className="flex-1">
              <div className="font-semibold">
                {messageType === 'error'
                  ? 'Thông báo từ hệ thống'
                  : messageType === 'success'
                  ? 'Thành công'
                  : 'Thông tin'}
              </div>
              <div className="mt-0.5">{message}</div>
              {requestId && (
                <div className="text-xs text-slate-400 font-mono mt-1">Request-ID: {requestId}</div>
              )}
            </div>
          </div>
        )}

        {/* Form Đăng nhập */}
        <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tên đăng nhập
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-800 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Quick Test Box cho 4 nhánh Sequence Diagram */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
            ⚡ Thử nghiệm nhanh các nhánh Sequence Diagram
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('123456');
                void handleLogin(undefined, 'admin', '123456');
              }}
              className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium transition text-left"
            >
              1. Admin (123456)
              <span className="block text-[10px] text-emerald-600">Đăng nhập thành công</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('thukho');
                setPassword('123456');
                void handleLogin(undefined, 'thukho', '123456');
              }}
              className="p-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-medium transition text-left"
            >
              2. Thủ kho (123456)
              <span className="block text-[10px] text-blue-600">Đăng nhập thành công</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('thukho');
                setPassword('sai_password');
                void handleLogin(undefined, 'thukho', 'sai_password');
              }}
              className="p-2 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium transition text-left"
            >
              3. Sai mật khẩu
              <span className="block text-[10px] text-amber-600">&quot;Không xác thực được&quot;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('khoa_taikhoan');
                setPassword('123456');
                void handleLogin(undefined, 'khoa_taikhoan', '123456');
              }}
              className="p-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-medium transition text-left"
            >
              4. Tài khoản bị khóa
              <span className="block text-[10px] text-rose-600">&quot;Từ chối đăng nhập&quot;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
