import { AuthUser, UserRole, AdminRole } from '@/types';

export interface AccountRecord extends AuthUser {
  password: string;
  badge: string;
  description: string;
}

export const mockAccountCredentials: AccountRecord[] = [
  // 1. Super Admin (Chủ Trung Tâm)
  {
    id: 'user-admin-1',
    email: 'dang.pham@educonnect.vn',
    password: 'admin123',
    name: 'Phạm Hồng Đăng',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    adminRole: 'super_admin',
    title: 'Giám Đốc Trung Tâm (Super Admin)',
    phone: '0903 888 999',
    badge: 'Chủ Trung Tâm',
    description: 'Toàn quyền 100% tất cả các phân hệ học vụ, tài chính, nhân sự',
  },

  // 2. Điều Phối Học Vụ
  {
    id: 'user-admin-2',
    email: 'huong.vu@educonnect.vn',
    password: 'hocvu123',
    name: 'Vũ Thu Hương',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    adminRole: 'academic_coordinator',
    title: 'Trưởng Ban Học Vụ & Điều Phối',
    phone: '0912 333 444',
    badge: 'Điều Phối Học Vụ',
    description: 'Toàn quyền xếp lịch, thêm buổi học, quản lý học sinh; học phí chỉ xem',
  },

  // 3. Tư Vấn Tuyển Sinh
  {
    id: 'user-admin-4',
    email: 'duc.do@educonnect.vn',
    password: 'tuyensinh123',
    name: 'Đỗ Minh Đức',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    adminRole: 'admissions',
    title: 'Chuyên Viên Tư Vấn Tuyển Sinh',
    phone: '0934 111 222',
    badge: 'Tư Vấn Tuyển Sinh',
    description: 'Ghi danh học viên mới; bảo mật ẩn dữ liệu tài chính',
  },

  // 5. Giảng Viên / Gia Sư
  {
    id: 'user-tutor-1',
    email: 'hoang.tran@educonnect.vn',
    password: 'giasu123',
    name: 'Thầy Trần Huy Hoàng',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'tutor',
    title: 'Gia Sư Chuyên Toán & Luyện Thi',
    phone: '0912 345 678',
    badge: 'Giảng Viên / Gia Sư',
    description: 'Quản lý thu nhập real-time, đăng ký lịch rảnh, điểm danh & chấm sao',
  },

  // 6. Học Sinh
  {
    id: 'user-student-1',
    email: 'quan.nguyen@educonnect.vn',
    password: 'hocsinh123',
    name: 'Nguyễn Minh Quân',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    role: 'student',
    title: 'Học Sinh Lớp 12 Chuyên Tự Nhiên',
    phone: '0909 112 233',
    badge: 'Học Sinh',
    description: 'Thời khóa biểu cá nhân, vào phòng học Online, thanh toán VietQR',
  },

  // 7. Phụ Huynh
  {
    id: 'user-parent-1',
    email: 'my.hoang@educonnect.vn',
    password: 'phuhuynh123',
    name: 'Chị Hoàng Thảo My',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'parent',
    title: 'Phụ Huynh Bé Nguyễn An & Minh Thư',
    phone: '0918 889 900',
    badge: 'Phụ Huynh',
    description: 'Theo dõi tiến độ học tập từng buổi, hóa đơn điện tử VAT & đóng học phí',
  },
];

export function authenticateAccount(
  emailInput: string,
  passwordInput: string,
  accountsList: AccountRecord[] = mockAccountCredentials
): AuthUser | null {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const normalizedPassword = passwordInput.trim();

  // Also support matching gmail aliases like @gmail.com
  const user = accountsList.find((acc) => {
    const accEmail = acc.email.toLowerCase();
    const accGmail = accEmail.replace('@educonnect.vn', '@gmail.com');
    const isEmailMatch = accEmail === normalizedEmail || accGmail === normalizedEmail;
    return isEmailMatch && acc.password === normalizedPassword;
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    adminRole: user.adminRole,
    title: user.title,
    phone: user.phone,
  };
}
