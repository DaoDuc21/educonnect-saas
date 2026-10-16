/**
 * EduConnect SaaS - Client Data Persistence Layer
 * Location: src/lib/storage.ts
 * Milestone: M1 (Data Persistence Layer & Reset Defaults)
 * Specification: PROJECT.md §M1, ORIGINAL_REQUEST.md §R1
 */

import {
  Course,
  CourseRegistration,
  AdminAccount,
  Tutor,
  Student,
  ScheduleEvent,
  TuitionInvoice,
  AttendanceRecord,
  HomeworkAssignment,
  HomeworkSubmission,
  AdmissionsLead,
  AuthUser,
  UserRole,
  AdminRole,
  SubjectType,
  AppNotification,
  CourseResource,
  Conversation,
  ChatMessage,
  Quiz,
  QuizSubmission,
} from '@/types';

import {
  mockCoursesCatalog,
  mockAdminAccounts,
  mockTutors,
  mockStudents,
  mockScheduleEvents,
  mockTuitionInvoices,
  mockAttendanceList,
} from '@/data/mockData';

import { mockCourseRegistrations } from '@/data/mockRegistrations';
import { mockHomeworkAssignments, mockHomeworkSubmissions } from '@/data/mockHomework';
import { mockAdmissionsLeads } from '@/data/mockAdmissions';
import { mockAccountCredentials, AccountRecord } from '@/data/mockAccounts';
import { mockCourseResources } from '@/data/mockResources';
import { mockConversations, mockChatMessages } from '@/data/mockMessages';
import { mockQuizzes, mockQuizSubmissions } from '@/data/mockQuizzes';

// ============================================================================
// 1. EXTENDED TYPE DEFINITIONS
// ============================================================================

export interface AuthSession {
  currentUser: AuthUser | null;
  currentRole: UserRole;
  currentAdminRole?: AdminRole;
  authView: 'landing' | 'login' | 'dashboard';
  activeTab?: string;
  selectedChildId?: string;
}

export type AuthSessionData = AuthSession;

export interface PersistedAppData {
  courses: Course[];
  courseRegistrations: CourseRegistration[];
  adminAccounts: AdminAccount[];
  accountCredentials: AccountRecord[];
  tutors: Tutor[];
  students: Student[];
  events: ScheduleEvent[];
  invoices: TuitionInvoice[];
  attendanceRecords: AttendanceRecord[];
  homeworkList: HomeworkAssignment[];
  submissionsList: HomeworkSubmission[];
  admissionsLeads: AdmissionsLead[];
  authSession: AuthSession | null;
  notifications: AppNotification[];
  resources: CourseResource[];
  conversations: Conversation[];
  chatMessages: ChatMessage[];
  quizzes: Quiz[];
  quizSubmissions: QuizSubmission[];
}

// Re-export AppNotification & CourseResource & Chat & Quiz Types for convenience
export type { AppNotification, CourseResource, Conversation, ChatMessage, Quiz, QuizSubmission };

// ============================================================================
// 2. VERSIONED STORAGE KEYS
// ============================================================================

export const STORAGE_PREFIX = 'educonnect_v1_';
export const CURRENT_SCHEMA_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  VERSION: `${STORAGE_PREFIX}version`,
  APP_VERSION: `${STORAGE_PREFIX}version`,
  COURSES: `${STORAGE_PREFIX}courses`,
  REGISTRATIONS: `${STORAGE_PREFIX}course_registrations`,
  ADMIN_ACCOUNTS: `${STORAGE_PREFIX}admin_accounts`,
  ACCOUNT_CREDENTIALS: `${STORAGE_PREFIX}account_credentials`,
  TUTORS: `${STORAGE_PREFIX}tutors`,
  STUDENTS: `${STORAGE_PREFIX}students`,
  SCHEDULE_EVENTS: `${STORAGE_PREFIX}schedule_events`,
  ATTENDANCE: `${STORAGE_PREFIX}attendance`,
  HOMEWORK_ASSIGNMENTS: `${STORAGE_PREFIX}homework_assignments`,
  HOMEWORK_SUBMISSIONS: `${STORAGE_PREFIX}homework_submissions`,
  TUITION_INVOICES: `${STORAGE_PREFIX}tuition_invoices`,
  INVOICES: `${STORAGE_PREFIX}tuition_invoices`,
  ADMISSIONS_LEADS: `${STORAGE_PREFIX}admissions_leads`,
  AUTH_SESSION: `${STORAGE_PREFIX}auth_session`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  RESOURCES: `${STORAGE_PREFIX}resources`,
  CONVERSATIONS: `${STORAGE_PREFIX}conversations`,
  CHAT_MESSAGES: `${STORAGE_PREFIX}chat_messages`,
  QUIZZES: `${STORAGE_PREFIX}quizzes`,
  QUIZ_SUBMISSIONS: `${STORAGE_PREFIX}quiz_submissions`,
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Mapping between collection property name and storage key
export const COLLECTION_KEY_MAP: Record<keyof PersistedAppData, string> = {
  courses: STORAGE_KEYS.COURSES,
  courseRegistrations: STORAGE_KEYS.REGISTRATIONS,
  adminAccounts: STORAGE_KEYS.ADMIN_ACCOUNTS,
  accountCredentials: STORAGE_KEYS.ACCOUNT_CREDENTIALS,
  tutors: STORAGE_KEYS.TUTORS,
  students: STORAGE_KEYS.STUDENTS,
  events: STORAGE_KEYS.SCHEDULE_EVENTS,
  invoices: STORAGE_KEYS.TUITION_INVOICES,
  attendanceRecords: STORAGE_KEYS.ATTENDANCE,
  homeworkList: STORAGE_KEYS.HOMEWORK_ASSIGNMENTS,
  submissionsList: STORAGE_KEYS.HOMEWORK_SUBMISSIONS,
  admissionsLeads: STORAGE_KEYS.ADMISSIONS_LEADS,
  authSession: STORAGE_KEYS.AUTH_SESSION,
  notifications: STORAGE_KEYS.NOTIFICATIONS,
  resources: STORAGE_KEYS.RESOURCES,
  conversations: STORAGE_KEYS.CONVERSATIONS,
  chatMessages: STORAGE_KEYS.CHAT_MESSAGES,
  quizzes: STORAGE_KEYS.QUIZZES,
  quizSubmissions: STORAGE_KEYS.QUIZ_SUBMISSIONS,
};

// ============================================================================
// 3. DEFAULT SEED DATA
// ============================================================================

export const defaultMockNotifications: AppNotification[] = [
  // --- Admin Notifications (4 items) ---
  {
    id: 'notif-admin-1',
    title: 'Yêu cầu cấp tài khoản học sinh mới',
    message: 'Phụ huynh/Học sinh Đỗ Khánh Huyền vừa gửi thông tin đăng ký tư vấn tuyển sinh.',
    type: 'registration',
    timestamp: '15 phút trước',
    createdAt: '2026-09-24T16:30:00Z',
    isRead: false,
    targetRole: 'admin',
    targetTab: 'admissions-leads',
    entityId: 'lead-2',
  },
  {
    id: 'notif-admin-2',
    title: 'Đã nhận thanh toán học phí',
    message: 'Học sinh Nguyễn Minh Quân đã thanh toán 2.400.000 đ qua VietQR Napas.',
    type: 'tuition',
    timestamp: '45 phút trước',
    createdAt: '2026-09-24T16:00:00Z',
    isRead: false,
    targetRole: 'admin',
    targetTab: 'tuition',
    entityId: 'inv-1',
  },
  {
    id: 'notif-admin-3',
    title: 'Đơn đăng ký khóa học cần xếp lớp',
    message: 'Đơn đăng ký khóa IELTS Master 7.5+ (Học sinh Hoàng Hải Nam) đang chờ duyệt Bước 3.',
    type: 'registration',
    timestamp: '2 giờ trước',
    createdAt: '2026-09-24T14:45:00Z',
    isRead: false,
    targetRole: 'admin',
    targetTab: 'courses-manager',
    entityId: 'reg-2',
  },
  {
    id: 'notif-admin-4',
    title: 'Bảng kê thù lao gia sư tháng 9',
    message: 'Bảng lương gia sư kỳ 1 tháng 9/2026 đã sẵn sàng để kiểm tra và phê duyệt.',
    type: 'warning',
    timestamp: '1 ngày trước',
    createdAt: '2026-09-23T09:00:00Z',
    isRead: true,
    targetRole: 'admin',
    targetTab: 'tutors',
    entityId: 'tutor-1',
  },

  // --- Tutor Notifications (4 items) ---
  {
    id: 'notif-tutor-1',
    title: 'Học sinh đã nộp bài tập về nhà',
    message: 'Học sinh Nguyễn Minh Quân đã nộp bài: Đề luyện thi ĐH Số 01 - Khảo sát hàm số.',
    type: 'homework',
    timestamp: '25 phút trước',
    createdAt: '2026-09-24T16:20:00Z',
    isRead: false,
    targetRole: 'tutor',
    targetTab: 'homework-management',
    entityId: 'hw-1',
  },
  {
    id: 'notif-tutor-2',
    title: 'Nhắc nhở hoàn tất điểm danh ca học',
    message: 'Ca dạy Toán 12 chiều qua chưa được chốt sĩ số và đánh giá mức độ hiểu bài.',
    type: 'warning',
    timestamp: '3 giờ trước',
    createdAt: '2026-09-24T13:30:00Z',
    isRead: false,
    targetRole: 'tutor',
    targetTab: 'attendance',
    entityId: 'ev-1',
  },
  {
    id: 'notif-tutor-3',
    title: 'Thù lao giảng dạy đã được duyệt',
    message: 'Thù lao 18 ca dạy tháng này (13.500.000 đ) đã được Ban Giám đốc phê duyệt chuyển khoản.',
    type: 'success',
    timestamp: '1 ngày trước',
    createdAt: '2026-09-23T11:00:00Z',
    isRead: true,
    targetRole: 'tutor',
    targetTab: 'earnings',
    entityId: 'tutor-1',
  },
  {
    id: 'notif-tutor-4',
    title: 'Lịch dạy lớp IELTS Academic chiều nay',
    message: 'Ca học 14:00 - 16:00 tại Phòng B204 với 6 học viên. Vui lòng vào lớp đúng giờ.',
    type: 'schedule',
    timestamp: '4 giờ trước',
    createdAt: '2026-09-24T12:30:00Z',
    isRead: false,
    targetRole: 'tutor',
    targetTab: 'classes',
    entityId: 'ev-2',
  },

  // --- Student Notifications (4 items) ---
  {
    id: 'notif-student-1',
    title: 'Bài tập mới: Writing Task 2 - Essay',
    message: 'Thầy David Vũ đã giao bài tập mới môn IELTS Writing. Hạn nộp: 23:59 ngày mai.',
    type: 'homework',
    timestamp: '30 phút trước',
    createdAt: '2026-09-24T16:15:00Z',
    isRead: false,
    targetRole: 'student',
    targetTab: 'homework',
    entityId: 'hw-2',
  },
  {
    id: 'notif-student-2',
    title: 'Thầy Hoàng đã chấm bài tập của bạn',
    message: 'Đề luyện thi ĐH Số 01: Bạn đạt 9.0/10 điểm. Nhận xét: "Làm bài cẩn thận, phương pháp tốt".',
    type: 'success',
    timestamp: '2 giờ trước',
    createdAt: '2026-09-24T14:30:00Z',
    isRead: false,
    targetRole: 'student',
    targetTab: 'homework',
    entityId: 'hw-1',
  },
  {
    id: 'notif-student-3',
    title: 'Ca học Toán 12 lúc 19:30 tối nay',
    message: 'Buổi học Chuyên đề Khảo sát hàm số tại Phòng A101 sẽ bắt đầu sau ít giờ.',
    type: 'schedule',
    timestamp: '5 giờ trước',
    createdAt: '2026-09-24T11:30:00Z',
    isRead: true,
    targetRole: 'student',
    targetTab: 'student-schedule',
    entityId: 'ev-1',
  },
  {
    id: 'notif-student-4',
    title: 'Học phí khóa IELTS 7.5+ đã thanh toán',
    message: 'Hóa đơn INV-2026-002 đã được xác nhận thanh toán thành công qua VietQR Napas.',
    type: 'tuition',
    timestamp: '1 ngày trước',
    createdAt: '2026-09-23T15:00:00Z',
    isRead: true,
    targetRole: 'student',
    targetTab: 'student-tuition',
    entityId: 'inv-2',
  },

  // --- Parent Notifications (4 items) ---
  {
    id: 'notif-parent-1',
    title: 'Bé Nguyễn An đã hoàn thành buổi học',
    message: 'Thầy Hoàng nhận xét: "Em tiếp thu nhanh, giải bài tập đạo hàm tốt. Đánh giá hiểu bài 5/5 sao".',
    type: 'schedule',
    timestamp: '1 giờ trước',
    createdAt: '2026-09-24T15:30:00Z',
    isRead: false,
    targetRole: 'parent',
    targetTab: 'progress',
    entityId: 'att-1',
    targetUserId: 'stu-2',
  },
  {
    id: 'notif-parent-2',
    title: 'Kết quả bài tập về nhà của con',
    message: 'Bé Nguyễn An đạt 9.0/10 điểm bài tập Toán 12: Đề luyện thi ĐH Số 01.',
    type: 'homework',
    timestamp: '2 giờ trước',
    createdAt: '2026-09-24T14:35:00Z',
    isRead: false,
    targetRole: 'parent',
    targetTab: 'progress',
    entityId: 'hw-1',
    targetUserId: 'stu-2',
  },
  {
    id: 'notif-parent-3',
    title: 'Thông báo học phí kỳ tháng 10',
    message: 'Học phí khóa Toán 12 của bé An (2.400.000 đ) có hạn đóng trước ngày 05/10/2026.',
    type: 'tuition',
    timestamp: '6 giờ trước',
    createdAt: '2026-09-24T10:30:00Z',
    isRead: false,
    targetRole: 'parent',
    targetTab: 'parent-tuition',
    entityId: 'inv-1',
    targetUserId: 'stu-2',
  },
  {
    id: 'notif-parent-4',
    title: 'Điều chỉnh lịch học lớp Tiếng Anh',
    message: 'Ca học Thứ 7 tuần này của bé Anh Thư chuyển sang 15:00 - 17:00 tại Phòng B204.',
    type: 'info',
    timestamp: '1 ngày trước',
    createdAt: '2026-09-23T14:00:00Z',
    isRead: true,
    targetRole: 'parent',
    targetTab: 'schedule-view',
    entityId: 'ev-2',
    targetUserId: 'stu-3',
  },

  // --- Broadcast / All (1 item) ---
  {
    id: 'notif-all-1',
    title: 'Thông báo lịch nghỉ lễ & kế hoạch học tập',
    message: 'Trung tâm EduConnect thông báo lịch nghỉ lễ và kế hoạch học bù cho tất cả các lớp.',
    type: 'info',
    timestamp: '2 ngày trước',
    createdAt: '2026-09-22T08:00:00Z',
    isRead: true,
    targetRole: 'all',
    targetTab: 'schedule',
  },
];

export const defaultMockResources: CourseResource[] = mockCourseResources;

/**
 * Returns fresh, deeply-cloned default seed data objects.
 */
export function getDefaultSeedData(): PersistedAppData {
  return {
    courses: JSON.parse(JSON.stringify(mockCoursesCatalog)),
    courseRegistrations: JSON.parse(JSON.stringify(mockCourseRegistrations)),
    adminAccounts: JSON.parse(JSON.stringify(mockAdminAccounts)),
    accountCredentials: JSON.parse(JSON.stringify(mockAccountCredentials.slice(0, 6))),
    tutors: JSON.parse(JSON.stringify(mockTutors)),
    students: JSON.parse(JSON.stringify(mockStudents)),
    events: JSON.parse(JSON.stringify(mockScheduleEvents)),
    invoices: JSON.parse(JSON.stringify(mockTuitionInvoices)),
    attendanceRecords: JSON.parse(JSON.stringify(mockAttendanceList)),
    homeworkList: JSON.parse(JSON.stringify(mockHomeworkAssignments)),
    submissionsList: JSON.parse(JSON.stringify(mockHomeworkSubmissions)),
    admissionsLeads: JSON.parse(JSON.stringify(mockAdmissionsLeads)),
    authSession: null,
    notifications: JSON.parse(JSON.stringify(defaultMockNotifications)),
    resources: JSON.parse(JSON.stringify(defaultMockResources)),
    conversations: JSON.parse(JSON.stringify(mockConversations)),
    chatMessages: JSON.parse(JSON.stringify(mockChatMessages)),
    quizzes: JSON.parse(JSON.stringify(mockQuizzes)),
    quizSubmissions: JSON.parse(JSON.stringify(mockQuizSubmissions)),
  };
}

// ============================================================================
// 4. DEFENSIVE IN-MEMORY FALLBACK & SSR GUARDS
// ============================================================================

const memoryStorage = new Map<string, string>();

/**
 * Checks whether localStorage is available and writable.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const testKey = '__educonnect_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe generic reader with defensive error handling and in-memory fallback.
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    let raw: string | null = null;
    if (isStorageAvailable()) {
      raw = window.localStorage.getItem(key);
    }
    if (raw === null && memoryStorage.has(key)) {
      raw = memoryStorage.get(key) ?? null;
    }
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    if (parsed === null && defaultValue !== null) {
      return defaultValue;
    }
    return parsed as T;
  } catch (err) {
    console.warn(`[EduConnect Storage] Error reading key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Safe generic writer with quota handling and in-memory fallback.
 */
export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    memoryStorage.set(key, serialized);

    if (isStorageAvailable()) {
      window.localStorage.setItem(key, serialized);
    }

    // Dispatch custom event for reactive in-tab subscribers
    try {
      window.dispatchEvent(
        new CustomEvent('educonnect_storage_update', {
          detail: { key, value },
        })
      );
    } catch {
      // Ignored in non-browser or legacy contexts
    }

    return true;
  } catch (err) {
    console.warn(`[EduConnect Storage] Error setting key "${key}":`, err);
    return false;
  }
}

/**
 * Safe generic item remover.
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    memoryStorage.delete(key);
    if (isStorageAvailable()) {
      window.localStorage.removeItem(key);
    }

    try {
      window.dispatchEvent(
        new CustomEvent('educonnect_storage_update', {
          detail: { key, value: null },
        })
      );
    } catch {
      // Ignored
    }
  } catch (err) {
    console.warn(`[EduConnect Storage] Error removing key "${key}":`, err);
  }
}

// ============================================================================
// 5. HIGH-LEVEL DOMAIN FUNCTIONS
// ============================================================================

/**
 * Initializes and retrieves all 11 collections + auth session + notifications + resources.
 * If any collection is not yet stored, it seeds it automatically from mock data.
 */
export function loadInitialData(): PersistedAppData {
  const seeds = getDefaultSeedData();

  // Ensure version is set
  if (isStorageAvailable() && !window.localStorage.getItem(STORAGE_KEYS.VERSION)) {
    setItem(STORAGE_KEYS.VERSION, CURRENT_SCHEMA_VERSION);
  }

  const courses = getItem(STORAGE_KEYS.COURSES, seeds.courses);
  const courseRegistrations = getItem(STORAGE_KEYS.REGISTRATIONS, seeds.courseRegistrations);
  const adminAccounts = getItem(STORAGE_KEYS.ADMIN_ACCOUNTS, seeds.adminAccounts);
  const accountCredentials = getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, seeds.accountCredentials);
  const tutors = getItem(STORAGE_KEYS.TUTORS, seeds.tutors);
  const students = getItem(STORAGE_KEYS.STUDENTS, seeds.students);
  const events = getItem(STORAGE_KEYS.SCHEDULE_EVENTS, seeds.events);
  const invoices = getItem(STORAGE_KEYS.TUITION_INVOICES, seeds.invoices);
  const attendanceRecords = getItem(STORAGE_KEYS.ATTENDANCE, seeds.attendanceRecords);
  const homeworkList = getItem(STORAGE_KEYS.HOMEWORK_ASSIGNMENTS, seeds.homeworkList);
  const submissionsList = getItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, seeds.submissionsList);
  const admissionsLeads = getItem(STORAGE_KEYS.ADMISSIONS_LEADS, seeds.admissionsLeads);
  const authSession = getItem<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
  const notifications = getItem(STORAGE_KEYS.NOTIFICATIONS, seeds.notifications);
  const resources = getItem(STORAGE_KEYS.RESOURCES, seeds.resources);
  const conversations = getItem(STORAGE_KEYS.CONVERSATIONS, seeds.conversations);
  const chatMessages = getItem(STORAGE_KEYS.CHAT_MESSAGES, seeds.chatMessages);
  const quizzes = getItem(STORAGE_KEYS.QUIZZES, seeds.quizzes);
  const quizSubmissions = getItem(STORAGE_KEYS.QUIZ_SUBMISSIONS, seeds.quizSubmissions);

  // Auto-seed missing keys into storage so subsequent reads find them persisted
  if (isStorageAvailable()) {
    if (!window.localStorage.getItem(STORAGE_KEYS.COURSES)) setItem(STORAGE_KEYS.COURSES, courses);
    if (!window.localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) setItem(STORAGE_KEYS.REGISTRATIONS, courseRegistrations);
    if (!window.localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNTS)) setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, adminAccounts);
    if (!window.localStorage.getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS)) setItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, accountCredentials);
    if (!window.localStorage.getItem(STORAGE_KEYS.TUTORS)) setItem(STORAGE_KEYS.TUTORS, tutors);
    if (!window.localStorage.getItem(STORAGE_KEYS.STUDENTS)) setItem(STORAGE_KEYS.STUDENTS, students);
    if (!window.localStorage.getItem(STORAGE_KEYS.SCHEDULE_EVENTS)) setItem(STORAGE_KEYS.SCHEDULE_EVENTS, events);
    if (!window.localStorage.getItem(STORAGE_KEYS.TUITION_INVOICES)) setItem(STORAGE_KEYS.TUITION_INVOICES, invoices);
    if (!window.localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) setItem(STORAGE_KEYS.ATTENDANCE, attendanceRecords);
    if (!window.localStorage.getItem(STORAGE_KEYS.HOMEWORK_ASSIGNMENTS)) setItem(STORAGE_KEYS.HOMEWORK_ASSIGNMENTS, homeworkList);
    if (!window.localStorage.getItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS)) setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, submissionsList);
    if (!window.localStorage.getItem(STORAGE_KEYS.ADMISSIONS_LEADS)) setItem(STORAGE_KEYS.ADMISSIONS_LEADS, admissionsLeads);
    if (!window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    if (!window.localStorage.getItem(STORAGE_KEYS.RESOURCES)) setItem(STORAGE_KEYS.RESOURCES, resources);
    if (!window.localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) setItem(STORAGE_KEYS.CONVERSATIONS, conversations);
    if (!window.localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) setItem(STORAGE_KEYS.CHAT_MESSAGES, chatMessages);
    if (!window.localStorage.getItem(STORAGE_KEYS.QUIZZES)) setItem(STORAGE_KEYS.QUIZZES, quizzes);
    if (!window.localStorage.getItem(STORAGE_KEYS.QUIZ_SUBMISSIONS)) setItem(STORAGE_KEYS.QUIZ_SUBMISSIONS, quizSubmissions);
  }

  return {
    courses,
    courseRegistrations,
    adminAccounts,
    accountCredentials,
    tutors,
    students,
    events,
    invoices,
    attendanceRecords,
    homeworkList,
    submissionsList,
    admissionsLeads,
    authSession,
    notifications,
    resources,
    conversations,
    chatMessages,
    quizzes,
    quizSubmissions,
  };
}

/**
 * Saves a single domain collection typesafely.
 */
export function saveCollection<K extends keyof PersistedAppData>(
  key: K,
  data: PersistedAppData[K]
): boolean {
  const storageKey = COLLECTION_KEY_MAP[key];
  if (!storageKey) {
    console.error(`[EduConnect Storage] Unknown collection key: ${String(key)}`);
    return false;
  }
  return setItem(storageKey, data);
}

/**
 * Saves multiple collections in batch.
 */
export function saveAll(data: Partial<PersistedAppData>): void {
  (Object.keys(data) as Array<keyof PersistedAppData>).forEach((colKey) => {
    const val = data[colKey];
    if (val !== undefined) {
      saveCollection(colKey, val as any);
    }
  });
}

/**
 * Clears all EduConnect keys and re-seeds fresh mock data.
 * Returns the fresh seed data.
 */
export function resetAllToDefaults(): PersistedAppData {
  const freshSeeds = getDefaultSeedData();

  if (isStorageAvailable()) {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // Ignore
      }
    });
  }
  memoryStorage.clear();

  // Re-seed all collections
  setItem(STORAGE_KEYS.VERSION, CURRENT_SCHEMA_VERSION);
  setItem(STORAGE_KEYS.COURSES, freshSeeds.courses);
  setItem(STORAGE_KEYS.REGISTRATIONS, freshSeeds.courseRegistrations);
  setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, freshSeeds.adminAccounts);
  setItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, freshSeeds.accountCredentials);
  setItem(STORAGE_KEYS.TUTORS, freshSeeds.tutors);
  setItem(STORAGE_KEYS.STUDENTS, freshSeeds.students);
  setItem(STORAGE_KEYS.SCHEDULE_EVENTS, freshSeeds.events);
  setItem(STORAGE_KEYS.TUITION_INVOICES, freshSeeds.invoices);
  setItem(STORAGE_KEYS.ATTENDANCE, freshSeeds.attendanceRecords);
  setItem(STORAGE_KEYS.HOMEWORK_ASSIGNMENTS, freshSeeds.homeworkList);
  setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, freshSeeds.submissionsList);
  setItem(STORAGE_KEYS.ADMISSIONS_LEADS, freshSeeds.admissionsLeads);
  setItem(STORAGE_KEYS.NOTIFICATIONS, freshSeeds.notifications);
  setItem(STORAGE_KEYS.RESOURCES, freshSeeds.resources);
  setItem(STORAGE_KEYS.CONVERSATIONS, freshSeeds.conversations);
  setItem(STORAGE_KEYS.CHAT_MESSAGES, freshSeeds.chatMessages);
  setItem(STORAGE_KEYS.QUIZZES, freshSeeds.quizzes);
  setItem(STORAGE_KEYS.QUIZ_SUBMISSIONS, freshSeeds.quizSubmissions);

  return freshSeeds;
}

/**
 * Removes all EduConnect items from storage without re-seeding.
 */
export function clearAllEduConnectData(): void {
  if (isStorageAvailable()) {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // Ignore
      }
    });
  }
  memoryStorage.clear();
}

// ============================================================================
// 6. SINGLETON OBJECT CONFORMING TO StorageManager CONTRACT
// ============================================================================

export interface StorageManager {
  getItem<T>(key: string, defaultValue: T): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  loadAll(): PersistedAppData;
  saveAll(data: Partial<PersistedAppData>): void;
  resetAllToDefaults(): PersistedAppData;
  loadInitialData(): PersistedAppData;
  saveCollection<K extends keyof PersistedAppData>(key: K, data: PersistedAppData[K]): boolean;
  clearAll(): void;
}

export const storage: StorageManager = {
  getItem,
  setItem,
  removeItem,
  loadAll: loadInitialData,
  saveAll,
  resetAllToDefaults,
  loadInitialData,
  saveCollection,
  clearAll: clearAllEduConnectData,
};

export default storage;
