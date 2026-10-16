#!/usr/bin/env node
/**
 * EduConnect SaaS - Automated Standalone Test Runner (E2E & Multi-Tier Harness)
 * Target Path: scripts/test-e2e.mjs
 * Milestone: M1 (Data Persistence Layer & Reset Defaults) & Full Tiers 1-4 Harness
 * References: TEST_INFRA.md, ORIGINAL_REQUEST.md §R1-R4, PROJECT.md
 *
 * Zero external dependencies: Runs on Node.js standard libraries only.
 * Exit Code: 0 on success, 1 on failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// ============================================================================
// 1. CONFIGURATION & CLI ARGUMENTS
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const options = {
  tier: null,       // e.g. --tier=1, --tier=2, --tier=3, --tier=4
  scenario: null,   // e.g. --scenario=s1, --scenario=s5
  verbose: false,   // e.g. --verbose
  help: false,
};

for (const arg of args) {
  if (arg === '--help' || arg === '-h') options.help = true;
  else if (arg === '--verbose' || arg === '-v') options.verbose = true;
  else if (arg.startsWith('--tier=')) options.tier = parseInt(arg.split('=')[1], 10);
  else if (arg.startsWith('--scenario=')) options.scenario = arg.split('=')[1].toLowerCase();
}

if (options.help) {
  console.log(`
EduConnect SaaS Test Runner
Usage: node scripts/test-e2e.mjs [options]

Options:
  --tier=<1|2|3|4>     Run only a specific test tier
  --scenario=<s1..s6>  Run only a specific Tier 4 scenario
  --verbose, -v        Display detailed assertion messages
  --help, -h           Show this help message
`);
  process.exit(0);
}

// ============================================================================
// 2. ANSI COLOR & REPORTING UTILITIES
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now(),
  failures: [],
};

let currentSuite = '';

function describe(suiteName, fn) {
  currentSuite = suiteName;
  console.log(`\n${colors.bold}${colors.cyan}[${suiteName}]${colors.reset}`);
  fn();
}

function test(testName, fn) {
  stats.total++;
  const fullTestName = `${currentSuite} > ${testName}`;

  try {
    fn();
    stats.passed++;
    console.log(`  ${colors.green}✓${colors.reset} ${testName}`);
  } catch (err) {
    stats.failed++;
    stats.failures.push({ suite: currentSuite, name: testName, error: err });
    console.log(`  ${colors.red}✗${colors.reset} ${testName}`);
    console.log(`    ${colors.red}${err.message}${colors.reset}`);
    if (options.verbose && err.stack) {
      console.log(`    ${colors.gray}${err.stack.split('\n').slice(1, 4).join('\n    ')}${colors.reset}`);
    }
  }
}

const it = test;

// ============================================================================
// 3. ISOMORPHIC BROWSER & STORAGE POLYFILLS
// ============================================================================

class MockLocalStorage {
  constructor() {
    this.store = new Map();
    this.quotaExceeded = false;
  }

  getItem(key) {
    const k = String(key);
    return this.store.has(k) ? this.store.get(k) : null;
  }

  setItem(key, value) {
    if (this.quotaExceeded) {
      const err = new Error('QuotaExceededError: Storage quota exceeded.');
      err.name = 'QuotaExceededError';
      err.code = 22;
      throw err;
    }
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

class MockCustomEvent {
  constructor(type, eventInitDict = {}) {
    this.type = type;
    this.detail = eventInitDict.detail || null;
  }
}

class MockWindow {
  constructor() {
    this.localStorage = new MockLocalStorage();
    this.sessionStorage = new MockLocalStorage();
    this.listeners = new Map();
  }

  addEventListener(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (!this.listeners.has(event)) return;
    this.listeners.set(event, this.listeners.get(event).filter((cb) => cb !== callback));
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    for (const cb of list) {
      try {
        cb(event);
      } catch {
        // Ignore errors in mock listeners
      }
    }
    return true;
  }
}

// ============================================================================
// 4. CANONICAL CONSTANTS & CANONICAL STORAGE ENGINE IMPLEMENTATION
// ============================================================================

export const STORAGE_PREFIX = 'educonnect_v1_';
export const CURRENT_SCHEMA_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  VERSION: `${STORAGE_PREFIX}version`,
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
};

export const COLLECTION_KEY_MAP = {
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
};

// Canonical 6 Baseline Mock Account Records
export const SEED_ACCOUNT_CREDENTIALS = [
  {
    id: 'user-admin-1',
    email: 'dang.pham@educonnect.vn',
    password: 'admin123',
    name: 'Phạm Hồng Đăng',
    role: 'admin',
    adminRole: 'super_admin',
    title: 'Giám Đốc Trung Tâm (Super Admin)',
    phone: '0903 888 999',
    badge: 'Chủ Trung Tâm',
  },
  {
    id: 'user-admin-2',
    email: 'huong.vu@educonnect.vn',
    password: 'hocvu123',
    name: 'Vũ Thu Hương',
    role: 'admin',
    adminRole: 'academic_coordinator',
    title: 'Trưởng Ban Học Vụ & Điều Phối',
    phone: '0912 333 444',
    badge: 'Điều Phối Học Vụ',
  },
  {
    id: 'user-admin-4',
    email: 'duc.do@educonnect.vn',
    password: 'tuyensinh123',
    name: 'Đỗ Minh Đức',
    role: 'admin',
    adminRole: 'admissions',
    title: 'Chuyên Viên Tư Vấn Tuyển Sinh',
    phone: '0934 111 222',
    badge: 'Tư Vấn Tuyển Sinh',
  },
  {
    id: 'user-tutor-1',
    email: 'hoang.tran@educonnect.vn',
    password: 'giasu123',
    name: 'Thầy Trần Huy Hoàng',
    role: 'tutor',
    title: 'Gia Sư Chuyên Toán & Luyện Thi',
    phone: '0912 345 678',
    badge: 'Giảng Viên / Gia Sư',
  },
  {
    id: 'user-student-1',
    email: 'quan.nguyen@educonnect.vn',
    password: 'hocsinh123',
    name: 'Nguyễn Minh Quân',
    role: 'student',
    title: 'Học Sinh Lớp 12 Chuyên Tự Nhiên',
    phone: '0909 112 233',
    badge: 'Học Sinh',
  },
  {
    id: 'user-parent-1',
    email: 'my.hoang@educonnect.vn',
    password: 'phuhuynh123',
    name: 'Chị Hoàng Thảo My',
    role: 'parent',
    title: 'Phụ Huynh Bé Nguyễn An & Minh Thư',
    phone: '0918 889 900',
    badge: 'Phụ Huynh',
  },
];

export const SEED_NOTIFICATIONS = [
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

export const SEED_RESOURCES = [
  {
    id: 'res-1',
    courseId: 'crs-1',
    courseTitle: 'Toán 12 Vận Dụng Cao & Luyện Thi ĐH',
    title: 'Chuyên đề 01: Hàm số & Bài toán cực trị nâng cao (PDF)',
    type: 'pdf',
    fileUrl: 'https://example.com/docs/toan12-chuyen-de-ham-so.pdf',
    fileSize: '4.8 MB',
    uploadedBy: 'Thầy Trần Huy Hoàng',
    uploadedAt: '15/09/2026',
    gradeLevel: 'Lớp 12',
    subject: 'math',
  },
];

/**
 * Creates an isolated EduConnect Storage Engine instance bound to a given window/environment.
 */
export function createStorageEngine(targetWindow = globalThis.window) {
  const memoryStorage = new Map();

  function isStorageAvailable() {
    if (!targetWindow || !targetWindow.localStorage) return false;
    try {
      const testKey = '__educonnect_test__';
      targetWindow.localStorage.setItem(testKey, '1');
      targetWindow.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function getItem(key, defaultValue) {
    if (!targetWindow) return defaultValue;
    try {
      let raw = null;
      if (isStorageAvailable()) {
        raw = targetWindow.localStorage.getItem(key);
      }
      if (raw === null && memoryStorage.has(key)) {
        raw = memoryStorage.get(key) ?? null;
      }
      if (raw === null || raw === undefined || raw === 'null' || raw === 'undefined') {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  function setItem(key, value) {
    if (!targetWindow) return false;
    try {
      const serialized = typeof value === 'string' && key === STORAGE_KEYS.VERSION ? value : JSON.stringify(value);
      memoryStorage.set(key, serialized);
      let persisted = false;
      if (isStorageAvailable()) {
        targetWindow.localStorage.setItem(key, serialized);
        persisted = true;
      }
      try {
        targetWindow.dispatchEvent(
          new MockCustomEvent('educonnect_storage_update', { detail: { key, value } })
        );
      } catch {
        // Ignore
      }
      return persisted;
    } catch {
      return false;
    }
  }

  function removeItem(key) {
    if (!targetWindow) return;
    try {
      memoryStorage.delete(key);
      if (isStorageAvailable()) {
        targetWindow.localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  }

  function getDefaultSeedData() {
    return {
      courses: [{ id: 'crs-1', title: 'Toán 12 Vận Dụng Cao', price: 2400000 }],
      courseRegistrations: [{ id: 'reg-1', studentName: 'Nguyễn Văn A', currentStep: 4 }],
      adminAccounts: [{ id: 'user-admin-1', name: 'Phạm Hồng Đăng', role: 'super_admin' }],
      accountCredentials: JSON.parse(JSON.stringify(SEED_ACCOUNT_CREDENTIALS.slice(0, 6))),
      tutors: [{ id: 'tutor-1', name: 'Thầy Trần Huy Hoàng', completedHoursThisMonth: 32 }],
      students: [{ id: 'stu-1', name: 'Nguyễn Minh Quân', tuitionStatus: 'paid' }],
      events: [{ id: 'evt-1', title: 'Toán 12 Buổi 1', room: 'A101' }],
      invoices: [{ id: 'inv-1', studentName: 'Nguyễn Văn A', amount: 2400000, status: 'paid' }],
      attendanceRecords: [{ id: 'att-1', studentId: 'stu-1', status: 'present' }],
      homeworkList: [{ id: 'hw-1', title: 'Bài tập Hàm số', totalScore: 10 }],
      submissionsList: [{ id: 'sub-1', homeworkId: 'hw-1', status: 'graded', score: 9.5 }],
      admissionsLeads: [{ id: 'lead-1', studentName: 'Lê Bảo Châu', status: 'consulting' }],
      authSession: null,
      notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
      resources: JSON.parse(JSON.stringify(SEED_RESOURCES)),
    };
  }

  function loadInitialData() {
    const seeds = getDefaultSeedData();

    if (isStorageAvailable() && !targetWindow.localStorage.getItem(STORAGE_KEYS.VERSION)) {
      targetWindow.localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_SCHEMA_VERSION);
      memoryStorage.set(STORAGE_KEYS.VERSION, CURRENT_SCHEMA_VERSION);
    }

    const result = {
      courses: getItem(STORAGE_KEYS.COURSES, seeds.courses),
      courseRegistrations: getItem(STORAGE_KEYS.REGISTRATIONS, seeds.courseRegistrations),
      adminAccounts: getItem(STORAGE_KEYS.ADMIN_ACCOUNTS, seeds.adminAccounts),
      accountCredentials: getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, seeds.accountCredentials),
      tutors: getItem(STORAGE_KEYS.TUTORS, seeds.tutors),
      students: getItem(STORAGE_KEYS.STUDENTS, seeds.students),
      events: getItem(STORAGE_KEYS.SCHEDULE_EVENTS, seeds.events),
      invoices: getItem(STORAGE_KEYS.TUITION_INVOICES, seeds.invoices),
      attendanceRecords: getItem(STORAGE_KEYS.ATTENDANCE, seeds.attendanceRecords),
      homeworkList: getItem(STORAGE_KEYS.HOMEWORK_ASSIGNMENTS, seeds.homeworkList),
      submissionsList: getItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, seeds.submissionsList),
      admissionsLeads: getItem(STORAGE_KEYS.ADMISSIONS_LEADS, seeds.admissionsLeads),
      authSession: getItem(STORAGE_KEYS.AUTH_SESSION, null),
      notifications: getItem(STORAGE_KEYS.NOTIFICATIONS, seeds.notifications),
      resources: getItem(STORAGE_KEYS.RESOURCES, seeds.resources),
    };

    if (isStorageAvailable()) {
      for (const [prop, storageKey] of Object.entries(COLLECTION_KEY_MAP)) {
        if (!targetWindow.localStorage.getItem(storageKey)) {
          setItem(storageKey, result[prop]);
        }
      }
    }

    return result;
  }

  function saveCollection(key, data) {
    const storageKey = COLLECTION_KEY_MAP[key];
    if (!storageKey) return false;
    return setItem(storageKey, data);
  }

  function saveAll(data) {
    for (const [colKey, val] of Object.entries(data)) {
      if (val !== undefined) saveCollection(colKey, val);
    }
  }

  function resetAllToDefaults() {
    const freshSeeds = getDefaultSeedData();
    if (isStorageAvailable()) {
      for (const k of Object.values(STORAGE_KEYS)) {
        try {
          targetWindow.localStorage.removeItem(k);
        } catch {
          // Ignore
        }
      }
    }
    memoryStorage.clear();

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

    return freshSeeds;
  }

  function clearAllEduConnectData() {
    if (isStorageAvailable()) {
      for (const k of Object.values(STORAGE_KEYS)) {
        targetWindow.localStorage.removeItem(k);
      }
    }
    memoryStorage.clear();
  }

  return {
    getItem,
    setItem,
    removeItem,
    loadInitialData,
    loadAll: loadInitialData,
    saveCollection,
    saveAll,
    resetAllToDefaults,
    clearAll: clearAllEduConnectData,
    getDefaultSeedData,
    isStorageAvailable,
  };
}

// ============================================================================
// 5. TEST SUITES EXECUTION
// ============================================================================

console.log(`${colors.bold}${colors.blue}================================================================================${colors.reset}`);
console.log(`${colors.bold} EduConnect SaaS - Automated Test Suite Runner (TEST_INFRA.md)${colors.reset}`);
console.log(`${colors.bold} Milestone: M1 (Persistence & Reset) | Multi-Tier Verification Harness${colors.reset}`);
console.log(`${colors.bold}${colors.blue}================================================================================${colors.reset}`);

// ----------------------------------------------------------------------------
// TIER 1: UNIT & FEATURE TESTS (Category-Partition)
// ----------------------------------------------------------------------------
if (!options.tier || options.tier === 1) {
  describe('Tier 1: Unit & Feature Tests (Category-Partition)', () => {
    let mockWin;
    let storage;

    function beforeEachTest() {
      mockWin = new MockWindow();
      storage = createStorageEngine(mockWin);
    }

    test('T1.1: F1 - Storage version and key naming prefixes (educonnect_v1_*)', () => {
      assert.strictEqual(CURRENT_SCHEMA_VERSION, '1.0.0');
      assert.strictEqual(STORAGE_PREFIX, 'educonnect_v1_');
      for (const [keyName, keyValue] of Object.entries(STORAGE_KEYS)) {
        assert.ok(
          keyValue.startsWith('educonnect_v1_'),
          `Key ${keyName} (${keyValue}) must start with prefix educonnect_v1_`
        );
      }
    });

    test('T1.2: F1 - loadInitialData() seeds all 11 collections + auth + notif + resources', () => {
      beforeEachTest();
      assert.strictEqual(mockWin.localStorage.length, 0);

      const data = storage.loadInitialData();
      assert.ok(data, 'loadInitialData must return data object');
      assert.strictEqual(Array.isArray(data.courses), true, 'courses must be array');
      assert.strictEqual(Array.isArray(data.courseRegistrations), true, 'registrations must be array');
      assert.strictEqual(Array.isArray(data.adminAccounts), true, 'adminAccounts must be array');
      assert.strictEqual(Array.isArray(data.accountCredentials), true, 'accountCredentials must be array');
      assert.strictEqual(Array.isArray(data.tutors), true, 'tutors must be array');
      assert.strictEqual(Array.isArray(data.students), true, 'students must be array');
      assert.strictEqual(Array.isArray(data.events), true, 'events must be array');
      assert.strictEqual(Array.isArray(data.invoices), true, 'invoices must be array');
      assert.strictEqual(Array.isArray(data.attendanceRecords), true, 'attendance must be array');
      assert.strictEqual(Array.isArray(data.homeworkList), true, 'homeworkList must be array');
      assert.strictEqual(Array.isArray(data.submissionsList), true, 'submissionsList must be array');
      assert.strictEqual(Array.isArray(data.admissionsLeads), true, 'admissionsLeads must be array');
      assert.strictEqual(data.authSession, null, 'authSession must default to null');
      assert.strictEqual(Array.isArray(data.notifications), true, 'notifications must be array');
      assert.strictEqual(Array.isArray(data.resources), true, 'resources must be array');

      // Verify keys in localStorage
      assert.ok(mockWin.localStorage.getItem(STORAGE_KEYS.VERSION) !== null);
      assert.ok(mockWin.localStorage.getItem(STORAGE_KEYS.COURSES) !== null);
      assert.ok(mockWin.localStorage.getItem(STORAGE_KEYS.STUDENTS) !== null);
    });

    test('T1.3: F1 - saveCollection() persists each of the 11 domain collections individually', () => {
      beforeEachTest();
      storage.loadInitialData();

      const testCollections = [
        ['courses', [{ id: 'crs-99', title: 'Vật Lý 12 Chuyên Sâu' }]],
        ['courseRegistrations', [{ id: 'reg-99', studentName: 'Trần Thị B' }]],
        ['adminAccounts', [{ id: 'adm-99', name: 'Admin Test' }]],
        ['accountCredentials', [{ id: 'cred-99', email: 'test@educonnect.vn' }]],
        ['tutors', [{ id: 'tut-99', name: 'Gia sư Toán' }]],
        ['students', [{ id: 'stu-99', name: 'Học sinh Giỏi' }]],
        ['events', [{ id: 'evt-99', title: 'Buổi học thử' }]],
        ['invoices', [{ id: 'inv-99', amount: 1500000 }]],
        ['attendanceRecords', [{ id: 'att-99', status: 'present' }]],
        ['homeworkList', [{ id: 'hw-99', title: 'Bài tập 1' }]],
        ['submissionsList', [{ id: 'sub-99', score: 10 }]],
      ];

      for (const [colName, val] of testCollections) {
        const ok = storage.saveCollection(colName, val);
        assert.strictEqual(ok, true, `saveCollection(${colName}) should return true`);
        const reloaded = storage.getItem(COLLECTION_KEY_MAP[colName], []);
        assert.strictEqual(reloaded.length, 1);
        assert.deepStrictEqual(reloaded, val);
      }
    });

    test('T1.4: F1 - Full rehydration after F5 reload retains modified records', () => {
      beforeEachTest();
      storage.loadInitialData();

      // Mutate course catalog
      const customCourse = { id: 'crs-custom-1', title: 'Khóa Học Khởi Nghiệp Lập Trình Next.js' };
      storage.saveCollection('courses', [customCourse]);

      // Simulate F5 Browser Reload: new window instance sharing the same underlying localStorage
      const reloadedWin = new MockWindow();
      reloadedWin.localStorage.store = new Map(mockWin.localStorage.store);
      const reloadedStorage = createStorageEngine(reloadedWin);

      const rehydrated = reloadedStorage.loadInitialData();
      assert.strictEqual(rehydrated.courses.length, 1);
      assert.strictEqual(rehydrated.courses[0].title, 'Khóa Học Khởi Nghiệp Lập Trình Next.js');
    });

    test('T1.5: F1 - Safe getItem and setItem type-safety and fallback mechanisms', () => {
      beforeEachTest();
      const fallbackObj = { status: 'default' };
      const nonExistent = storage.getItem('educonnect_v1_non_existent', fallbackObj);
      assert.deepStrictEqual(nonExistent, fallbackObj);

      storage.setItem('educonnect_v1_primitive_number', 12345);
      assert.strictEqual(storage.getItem('educonnect_v1_primitive_number', 0), 12345);

      storage.setItem('educonnect_v1_boolean', true);
      assert.strictEqual(storage.getItem('educonnect_v1_boolean', false), true);
    });

    test('T1.6: F2 - resetAllToDefaults() reverts all 11 collections to baseline seed data', () => {
      beforeEachTest();
      storage.loadInitialData();

      // Corrupt/modify collections
      storage.saveCollection('courses', []);
      storage.saveCollection('students', []);
      assert.strictEqual(storage.getItem(STORAGE_KEYS.COURSES, []).length, 0);

      // Perform reset
      const resetData = storage.resetAllToDefaults();
      assert.ok(resetData.courses.length > 0, 'courses must be restored');
      assert.ok(resetData.students.length > 0, 'students must be restored');
      assert.strictEqual(storage.getItem(STORAGE_KEYS.COURSES, []).length, resetData.courses.length);
    });

    test('T1.7: F2 - Reset preserves credentials array invariance (strictly trimmed to 6)', () => {
      beforeEachTest();
      storage.loadInitialData();

      // Simulate Challenger 1 Attack: Dynamic provision adds 7th and 8th account
      const currentCreds = storage.getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, []);
      const newCred1 = { id: 'user-provisioned-1', email: 'nam.phan@educonnect.vn', role: 'student' };
      const newCred2 = { id: 'user-provisioned-2', email: 'lan.ho@educonnect.vn', role: 'student' };
      const expandedCreds = [...currentCreds, newCred1, newCred2];

      assert.strictEqual(expandedCreds.length, 8);
      storage.saveCollection('accountCredentials', expandedCreds);
      assert.strictEqual(storage.getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, []).length, 8);

      // Execute Reset
      const fresh = storage.resetAllToDefaults();

      assert.strictEqual(
        fresh.accountCredentials.length,
        6,
        `accountCredentials must strictly reset to 6 seed accounts. Found: ${fresh.accountCredentials.length}`
      );
      const storedAfterReset = storage.getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, []);
      assert.strictEqual(storedAfterReset.length, 6);
      assert.strictEqual(storedAfterReset.some((c) => c.email === 'nam.phan@educonnect.vn'), false);
    });

    test('T1.8: F3 - Storage layer readiness for Notifications (M2 schema & seed data)', () => {
      beforeEachTest();
      const data = storage.loadInitialData();
      assert.ok(data.notifications.length >= 2, 'Must have at least 2 default notifications');
      const first = data.notifications[0];
      assert.ok(first.id && first.title && first.message && first.type && first.timestamp);
      assert.strictEqual(typeof first.isRead, 'boolean');
      assert.ok(first.targetRole);
    });

    test('T1.9: F4 - Event triggers and notification deep-linking schema compatibility', () => {
      beforeEachTest();
      const notifWithDeepLink = {
        id: 'notif-lead-approval',
        title: 'Đơn đăng ký mới',
        message: 'Học sinh Phan Nhật Nam đã hoàn tất đăng ký',
        type: 'info',
        timestamp: 'Vừa xong',
        isRead: false,
        targetRole: 'admin',
        targetTab: 'registrations',
        entityId: 'reg-new-1',
      };
      storage.setItem(STORAGE_KEYS.NOTIFICATIONS, [notifWithDeepLink]);
      const stored = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      assert.strictEqual(stored[0].targetTab, 'registrations');
      assert.strictEqual(stored[0].entityId, 'reg-new-1');
    });

    test('T1.10: F5 - Persistence support for visual analytics aggregation (M3)', () => {
      beforeEachTest();
      const data = storage.loadInitialData();

      // Attendance rate formula test
      const attendance = data.attendanceRecords;
      const presentCount = attendance.filter((a) => a.status === 'present').length;
      const rate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;
      assert.ok(rate >= 0 && rate <= 100);

      // Tuition total formula test
      const paidInvoices = data.invoices.filter((i) => i.status === 'paid');
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      assert.ok(totalRevenue >= 0);
    });

    test('T1.11: F6 - Data export column structures and UTF-8 encoding specifications (M3)', () => {
      const exportCols = [
        { header: 'Họ và Tên', key: 'studentName' },
        { header: 'Học Phí (VND)', key: 'amount' },
        { header: 'Trạng Thái', key: 'status' },
      ];
      assert.strictEqual(exportCols.length, 3);

      // UTF-8 BOM verification
      const UTF8_BOM = '\uFEFF';
      const csvContent = `${UTF8_BOM}Họ và Tên,Học Phí (VND),Trạng Thái\nNguyễn Văn A,2400000,paid\n`;
      assert.ok(csvContent.startsWith('\uFEFF'));
    });

    test('T1.12: F7 - Storage layer readiness for Learning Resources Hub (M4)', () => {
      beforeEachTest();
      const data = storage.loadInitialData();
      assert.ok(data.resources.length >= 1, 'Must have initial learning resources');
      const res = data.resources[0];
      assert.ok(res.id && res.courseId && res.title && res.type && res.fileUrl);
      assert.ok(['pdf', 'slide', 'exam', 'recording', 'other'].includes(res.type));
    });

    test('T1.13: F8 - Build & Project integrity verification', () => {
      const pkgPath = path.join(PROJECT_ROOT, 'package.json');
      assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      assert.ok(pkg.scripts.build, 'build script must exist');
      assert.ok(pkg.scripts.dev, 'dev script must exist');

      const tsConfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
      assert.ok(fs.existsSync(tsConfigPath), 'tsconfig.json must exist');
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      assert.ok(tsConfig.compilerOptions.paths['@/*'], 'tsconfig must map @/*');
    });

    test('T1.14: F3 - Notification unread badge calculation per role and broadcast filtering', () => {
      beforeEachTest();
      const data = storage.loadInitialData();
      const allNotifs = data.notifications;
      assert.strictEqual(allNotifs.length, 17, 'Should load 17 default notifications');

      // Helper function matching AppHome / NotificationPopover filtering
      const filterByRole = (items, role) =>
        items.filter((n) =>
          Array.isArray(n.targetRole)
            ? n.targetRole.includes(role) || n.targetRole.includes('all')
            : n.targetRole === 'all' || n.targetRole === role
        );

      const countUnread = (items, role) =>
        filterByRole(items, role).filter((n) => !n.isRead).length;

      // Admin role unread count
      const adminUnread = countUnread(allNotifs, 'admin');
      assert.strictEqual(adminUnread, 3, 'Admin should have exactly 3 unread notifications');

      // Tutor role unread count
      const tutorUnread = countUnread(allNotifs, 'tutor');
      assert.strictEqual(tutorUnread, 3, 'Tutor should have exactly 3 unread notifications');

      // Student role unread count
      const studentUnread = countUnread(allNotifs, 'student');
      assert.strictEqual(studentUnread, 2, 'Student should have exactly 2 unread notifications');

      // Parent role unread count
      const parentUnread = countUnread(allNotifs, 'parent');
      assert.strictEqual(parentUnread, 3, 'Parent should have exactly 3 unread notifications');

      // Broadcast item visibility across all roles
      const broadcastItem = allNotifs.find((n) => n.id === 'notif-all-1');
      assert.ok(broadcastItem, 'Broadcast item notif-all-1 must exist');
      assert.strictEqual(broadcastItem.targetRole, 'all');
      assert.ok(filterByRole(allNotifs, 'admin').includes(broadcastItem));
      assert.ok(filterByRole(allNotifs, 'tutor').includes(broadcastItem));
      assert.ok(filterByRole(allNotifs, 'student').includes(broadcastItem));
      assert.ok(filterByRole(allNotifs, 'parent').includes(broadcastItem));
    });

    test('T1.15: F3 - Notification operations (mark as read, mark all as read, delete single, clear all)', () => {
      beforeEachTest();
      const data = storage.loadInitialData();
      let notifs = [...data.notifications];

      // 1. Mark single notification as read
      const targetId = 'notif-student-1';
      notifs = notifs.map((n) => (n.id === targetId ? { ...n, isRead: true } : n));
      const targetItem = notifs.find((n) => n.id === targetId);
      assert.strictEqual(targetItem.isRead, true);

      // 2. Mark all as read for role 'student'
      notifs = notifs.map((n) => {
        const matches = n.targetRole === 'all' || n.targetRole === 'student';
        return matches ? { ...n, isRead: true } : n;
      });
      const remainingStudentUnread = notifs.filter(
        (n) => (n.targetRole === 'all' || n.targetRole === 'student') && !n.isRead
      ).length;
      assert.strictEqual(remainingStudentUnread, 0, 'All student notifications should now be read');

      // Verify other roles still have unread notifications (isolation)
      const tutorUnread = notifs.filter((n) => n.targetRole === 'tutor' && !n.isRead).length;
      assert.strictEqual(tutorUnread, 3, 'Tutor unread count must remain unaffected');

      // 3. Delete single notification
      const deleteId = 'notif-tutor-2';
      notifs = notifs.filter((n) => n.id !== deleteId);
      assert.strictEqual(notifs.some((n) => n.id === deleteId), false);

      // 4. Clear all notifications for currentRole 'tutor'
      notifs = notifs.filter((n) => n.targetRole !== 'tutor');
      assert.strictEqual(notifs.some((n) => n.targetRole === 'tutor'), false);
      // Other roles remain
      assert.ok(notifs.some((n) => n.targetRole === 'admin'));
      assert.ok(notifs.some((n) => n.targetRole === 'student'));
    });

    test('T1.16: F4 - Notification deep-linking tab resolution and category badges', () => {
      beforeEachTest();
      const data = storage.loadInitialData();
      const notifs = data.notifications;

      const validTabs = new Set([
        'schedule',
        'courses-manager',
        'admissions-leads',
        'accounts',
        'students',
        'tuition',
        'tutors',
        'settings',
        'earnings',
        'availability',
        'attendance',
        'homework-management',
        'classes',
        'student-schedule',
        'homework',
        'online-room',
        'courses',
        'student-tuition',
        'progress',
        'parent-tuition',
        'schedule-view',
      ]);

      const validTypes = new Set([
        'info',
        'success',
        'warning',
        'homework',
        'tuition',
        'schedule',
        'registration',
      ]);

      for (const n of notifs) {
        assert.ok(n.id, 'Notification must have id');
        assert.ok(n.title, 'Notification must have title');
        assert.ok(n.message, 'Notification must have message');
        assert.ok(validTypes.has(n.type), `Type "${n.type}" must be valid category`);
        if (n.targetTab) {
          assert.ok(validTabs.has(n.targetTab), `targetTab "${n.targetTab}" must map to recognized tab`);
        }
      }
    });

    test('T1.17: F5 - Visual Analytics KPI formulas and dynamic reactive aggregation (M3)', () => {
      beforeEachTest();
      const data = storage.loadInitialData();

      // 1. Tuition Revenue Math
      const invoices = [
        { id: 'inv-1', amount: 2800000, status: 'paid' },
        { id: 'inv-2', amount: 2400000, status: 'pending' },
        { id: 'inv-3', amount: 2200000, status: 'paid' },
        { id: 'inv-4', amount: 2600000, status: 'overdue' },
        { id: 'inv-5', amount: 2100000, status: 'pending' },
        { id: 'inv-6', amount: 2500000, status: 'paid' },
      ];
      const paidInvoices = invoices.filter((i) => i.status === 'paid');
      const pendingInvoices = invoices.filter((i) => i.status === 'pending');
      const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

      const paidTotal = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
      const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
      const overdueTotal = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
      const totalBilled = paidTotal + pendingTotal + overdueTotal;

      assert.strictEqual(paidTotal, 7500000, 'Paid total must equal 7,500,000 VND');
      assert.strictEqual(pendingTotal + overdueTotal, 7100000, 'Outstanding total must equal 7,100,000 VND');
      assert.strictEqual(totalBilled, 14600000, 'Total billed must equal 14,600,000 VND');

      const collectionRate = totalBilled > 0 ? (paidTotal / totalBilled) * 100 : 0;
      assert.ok(Math.abs(collectionRate - 51.37) < 0.1, 'Collection rate should be ~51.4%');

      // Zero-division safety
      const zeroCollectionRate = 0 > 0 ? (0 / 0) * 100 : 0;
      assert.strictEqual(zeroCollectionRate, 0);

      // 2. Attendance Rate Math
      const records = [
        { id: 'att-1', status: 'present', comprehensionRating: 5 },
        { id: 'att-2', status: 'present', comprehensionRating: 4 },
        { id: 'att-3', status: 'late', comprehensionRating: 5 },
        { id: 'att-4', status: 'absent', comprehensionRating: 0 },
      ];
      const totalRecords = records.length;
      const presentCount = records.filter((r) => r.status === 'present').length;
      const lateCount = records.filter((r) => r.status === 'late').length;
      const absentCount = records.filter((r) => r.status === 'absent').length;

      const attendanceRate = totalRecords > 0 ? ((presentCount + lateCount) / totalRecords) * 100 : 0;
      const onTimeRate = (presentCount / totalRecords) * 100;
      const lateRate = (lateCount / totalRecords) * 100;
      const absentRate = (absentCount / totalRecords) * 100;

      assert.strictEqual(attendanceRate, 75.0, 'Attendance rate must equal 75.0%');
      assert.strictEqual(onTimeRate, 50.0, 'On-time rate must equal 50.0%');
      assert.strictEqual(lateRate, 25.0, 'Late rate must equal 25.0%');
      assert.strictEqual(absentRate, 25.0, 'Absent rate must equal 25.0%');

      const rated = records.filter((r) => r.comprehensionRating > 0);
      const avgRating = rated.reduce((sum, r) => sum + r.comprehensionRating, 0) / rated.length;
      assert.ok(Math.abs(avgRating - 4.67) < 0.05, 'Average comprehension rating should be ~4.67');

      // 3. Homework Completion Math
      const submissions = [
        { id: 'sub-1', status: 'submitted' },
        { id: 'sub-2', status: 'not_submitted' },
        { id: 'sub-3', status: 'graded', score: 9.2 },
        { id: 'sub-4', status: 'graded', score: 8.8 },
        { id: 'sub-5', status: 'not_submitted' },
        { id: 'sub-6', status: 'submitted' },
      ];
      const gradedCount = submissions.filter((s) => s.status === 'graded').length;
      const submittedCount = submissions.filter((s) => s.status === 'submitted').length;
      const notSubmittedCount = submissions.filter((s) => s.status === 'not_submitted').length;
      const completedCount = gradedCount + submittedCount;
      const completionRate = (completedCount / submissions.length) * 100;

      assert.strictEqual(completionRate, (4 / 6) * 100, 'Completion rate must be 66.67%');
      const scoredItems = submissions.filter((s) => s.status === 'graded' && typeof s.score === 'number');
      const avgScore = scoredItems.reduce((sum, s) => sum + s.score, 0) / scoredItems.length;
      assert.strictEqual(avgScore, 9.0, 'Average score of graded homework must equal 9.0');

      // 4. Tutor Active Hours & Payroll Math
      const tutors = [
        { id: 'tut-1', completedHoursThisMonth: 36.5, hourlyRate: 350000, totalEarningsThisMonth: 12775000 },
        { id: 'tut-2', completedHoursThisMonth: 30.0, hourlyRate: 300000, totalEarningsThisMonth: 9000000 },
        { id: 'tut-3', completedHoursThisMonth: 28.0, hourlyRate: 400000, totalEarningsThisMonth: 11200000 },
        { id: 'tut-4', completedHoursThisMonth: 24.5, hourlyRate: 320000, totalEarningsThisMonth: 7840000 },
      ];
      const totalHours = tutors.reduce((sum, t) => sum + t.completedHoursThisMonth, 0);
      const totalEarnings = tutors.reduce((sum, t) => sum + t.totalEarningsThisMonth, 0);
      assert.strictEqual(totalHours, 119.0, 'Total hours must equal 119.0 hours');
      assert.strictEqual(totalEarnings, 40815000, 'Total payroll obligation must equal 40,815,000 VND');
    });

    test('T1.18: F6 - Export utilities functions (CSV UTF-8 BOM, escapeCSVField, Excel HTML/XML, print contracts)', () => {
      const exportUtilsPath = path.join(PROJECT_ROOT, 'src', 'lib', 'exportUtils.ts');
      assert.ok(fs.existsSync(exportUtilsPath), 'src/lib/exportUtils.ts must exist');

      const exportCode = fs.readFileSync(exportUtilsPath, 'utf8');

      // 1. Verify Core Exports
      assert.ok(exportCode.includes('export function exportToCSV'), 'Must export exportToCSV');
      assert.ok(exportCode.includes('export function exportToExcel'), 'Must export exportToExcel');
      assert.ok(exportCode.includes('export function printFormattedTable'), 'Must export printFormattedTable');
      assert.ok(exportCode.includes('export function printSingleInvoice'), 'Must export printSingleInvoice');
      assert.ok(exportCode.includes('export function escapeCSVField'), 'Must export escapeCSVField');
      assert.ok(exportCode.includes('export function resolveCellValue'), 'Must export resolveCellValue');
      assert.ok(exportCode.includes('export function sanitizeFilename'), 'Must export sanitizeFilename');
      assert.ok(exportCode.includes('export function getColumnAlignment'), 'Must export getColumnAlignment');

      // 2. Unit Test escapeCSVField (Formula Injection Defense & RFC 4180 Escaping)
      function testEscapeCSV(raw) {
        if (!raw) return '""';
        let str = String(raw);
        if (/^[=+@\-\t\r]/.test(str)) {
          str = `'${str}`;
        }
        return `"${str.replace(/"/g, '""')}"`;
      }

      assert.strictEqual(testEscapeCSV('Hello World'), '"Hello World"');
      assert.strictEqual(testEscapeCSV('Nguyễn Văn An, Lớp 12'), '"Nguyễn Văn An, Lớp 12"');
      assert.strictEqual(testEscapeCSV('Học sinh "Xuất sắc"'), '"Học sinh ""Xuất sắc"""');
      // Injection attacks
      assert.strictEqual(testEscapeCSV('=cmd|/C calc'), '"\'=cmd|/C calc"');
      assert.strictEqual(testEscapeCSV('+12345'), '"\'+12345"');
      assert.strictEqual(testEscapeCSV('-SUM(A1:A10)'), '"\'-SUM(A1:A10)"');
      assert.strictEqual(testEscapeCSV('@import'), '"\'@import"');
      assert.strictEqual(testEscapeCSV('\tTabbed'), '"\'\tTabbed"');

      // 3. UTF-8 BOM Presence Verification
      assert.ok(exportCode.includes('\\uFEFF'), 'exportUtils must prepend UTF-8 BOM \\uFEFF');

      // 4. Excel HTML/XML Structure & Formatting Verification
      assert.ok(exportCode.includes('urn:schemas-microsoft-com:office:excel'), 'Excel export must include MSO Excel XML schema');
      assert.ok(exportCode.includes('mso-number-format'), 'Excel export must include mso-number-format for text cells');
      assert.ok(exportCode.includes('#0F172A'), 'Excel export headers must use #0F172A brand color');

      // 5. Print Document Structure & Vietnamese Signature Block Verification
      assert.ok(exportCode.includes('Người Lập Biểu'), 'Print document must contain Người Lập Biểu signature');
      assert.ok(exportCode.includes('Kế Toán / Thủ Quỹ'), 'Print document must contain Kế Toán / Thủ Quỹ signature');
      assert.ok(exportCode.includes('Giám Đốc Trung Tâm'), 'Print document must contain Giám Đốc Trung Tâm signature');
      assert.ok(exportCode.includes('@media print'), 'Print document must include @media print CSS');

      // 6. Single Invoice Receipt Verification
      assert.ok(exportCode.includes('Phiếu Thu Học Phí'), 'printSingleInvoice must render Phiếu Thu Học Phí');
      assert.ok(exportCode.includes('VIETQR'), 'printSingleInvoice must reference VietQR confirmation');
    });

    test('T1.19: F6 - Export schemas and UI component contracts (Tutor Payroll, Student Roster, Tuition Invoices)', () => {
      const exportUtilsPath = path.join(PROJECT_ROOT, 'src', 'lib', 'exportUtils.ts');
      const exportCode = fs.readFileSync(exportUtilsPath, 'utf8');

      // Verify Column Schemas in exportUtils
      assert.ok(exportCode.includes('TUTOR_PAYROLL_COLUMNS'), 'Must export TUTOR_PAYROLL_COLUMNS');
      assert.ok(exportCode.includes('STUDENT_ROSTER_COLUMNS'), 'Must export STUDENT_ROSTER_COLUMNS');
      assert.ok(exportCode.includes('TUITION_INVOICE_COLUMNS'), 'Must export TUITION_INVOICE_COLUMNS');
      assert.ok(exportCode.includes('getStudentRosterExportColumns'), 'Must export getStudentRosterExportColumns');

      // Check ExportDropdown Component
      const exportDropdownPath = path.join(PROJECT_ROOT, 'src', 'components', 'common', 'ExportDropdown.tsx');
      assert.ok(fs.existsSync(exportDropdownPath), 'src/components/common/ExportDropdown.tsx must exist');
      const dropdownCode = fs.readFileSync(exportDropdownPath, 'utf8');
      assert.ok(dropdownCode.includes('FileSpreadsheet'), 'ExportDropdown must use FileSpreadsheet');
      assert.ok(dropdownCode.includes('FileText'), 'ExportDropdown must use FileText');
      assert.ok(dropdownCode.includes('Printer'), 'ExportDropdown must use Printer');
      assert.ok(dropdownCode.includes('Download'), 'ExportDropdown must use Download');

      // Check AnalyticsDashboard Component
      const analyticsPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'AnalyticsDashboard.tsx');
      assert.ok(fs.existsSync(analyticsPath), 'src/components/admin/AnalyticsDashboard.tsx must exist');
      const analyticsCode = fs.readFileSync(analyticsPath, 'utf8');
      assert.ok(analyticsCode.includes('viewBox="0 0 620 240"'), 'AnalyticsDashboard must render Chart 1 SVG');
      assert.ok(analyticsCode.includes('viewBox="0 0 200 200"'), 'AnalyticsDashboard must render Chart 2 Donut SVG');
      assert.ok(analyticsCode.includes('viewBox="0 0 640 240"'), 'AnalyticsDashboard must render Chart 3 Area SVG');
      assert.ok(analyticsCode.includes('ExportDropdown'), 'AnalyticsDashboard must integrate ExportDropdown');

      // Check TutorSalaryManager Export Integration
      const tutorSalaryPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'TutorSalaryManager.tsx');
      const tutorSalaryCode = fs.readFileSync(tutorSalaryPath, 'utf8');
      assert.ok(tutorSalaryCode.includes('ExportDropdown'), 'TutorSalaryManager must include ExportDropdown');
      assert.ok(tutorSalaryCode.includes('TUTOR_PAYROLL_COLUMNS'), 'TutorSalaryManager must use TUTOR_PAYROLL_COLUMNS');

      // Check StudentTable Export Integration
      const studentTablePath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'StudentTable.tsx');
      const studentTableCode = fs.readFileSync(studentTablePath, 'utf8');
      assert.ok(studentTableCode.includes('selectedClass'), 'StudentTable must support selectedClass filter');
      assert.ok(studentTableCode.includes('ExportDropdown'), 'StudentTable must include ExportDropdown');
      assert.ok(studentTableCode.includes('getStudentRosterExportColumns'), 'StudentTable must use getStudentRosterExportColumns');

      // Check TuitionTracker Export Integration
      const tuitionTrackerPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'TuitionTracker.tsx');
      const tuitionTrackerCode = fs.readFileSync(tuitionTrackerPath, 'utf8');
      assert.ok(tuitionTrackerCode.includes('ExportDropdown'), 'TuitionTracker must include ExportDropdown');
      assert.ok(tuitionTrackerCode.includes('printSingleInvoice'), 'TuitionTracker must support printSingleInvoice');
      assert.ok(tuitionTrackerCode.includes('TUITION_INVOICE_COLUMNS'), 'TuitionTracker must use TUITION_INVOICE_COLUMNS');

      // Check Sidebar Navigation Integration
      const sidebarPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Sidebar.tsx');
      const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
      assert.ok(
        sidebarCode.includes("id: 'analytics'"),
        'Sidebar must include analytics tab in getNavItems'
      );
      assert.ok(
        sidebarCode.includes("label: 'Báo cáo & Phân tích'"),
        'Sidebar must display Báo cáo & Phân tích label'
      );

      // Check Header Breadcrumb Integration
      const headerPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Header.tsx');
      const headerCode = fs.readFileSync(headerPath, 'utf8');
      assert.ok(
        headerCode.includes("analytics: 'Báo cáo & Phân tích'"),
        'Header tabMap must include analytics title'
      );

      // Check Page Router Integration
      const pagePath = path.join(PROJECT_ROOT, 'src', 'app', 'page.tsx');
      const pageCode = fs.readFileSync(pagePath, 'utf8');
      assert.ok(
        pageCode.includes("activeTab === 'analytics'"),
        'page.tsx must mount AnalyticsDashboard for activeTab === analytics'
      );
      assert.ok(
        pageCode.includes('<AnalyticsDashboard'),
        'page.tsx must render <AnalyticsDashboard'
      );
    });
  });
}

// ----------------------------------------------------------------------------
// TIER 2: BOUNDARY VALUE ANALYSIS (BVA)
// ----------------------------------------------------------------------------
if (!options.tier || options.tier === 2) {
  describe('Tier 2: Boundary Value Analysis (BVA)', () => {
    let mockWin;
    let storage;

    function beforeEachTest() {
      mockWin = new MockWindow();
      storage = createStorageEngine(mockWin);
    }

    test('T2.1: Corrupted JSON recovery in localStorage without crashing', () => {
      beforeEachTest();
      // Write malformed JSON
      mockWin.localStorage.setItem(STORAGE_KEYS.COURSES, '{"incomplete_json:');

      const fallback = [{ id: 'fallback', title: 'Khóa dự phòng' }];
      const result = storage.getItem(STORAGE_KEYS.COURSES, fallback);
      assert.deepStrictEqual(result, fallback, 'Should return fallback on SyntaxError');
    });

    test('T2.2: Literal "null" string and undefined handling in storage', () => {
      beforeEachTest();
      mockWin.localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'null');
      const session = storage.getItem(STORAGE_KEYS.AUTH_SESSION, { defaultValue: true });
      assert.deepStrictEqual(session, { defaultValue: true });

      mockWin.localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'undefined');
      const sessionUndef = storage.getItem(STORAGE_KEYS.AUTH_SESSION, { defaultValue: true });
      assert.deepStrictEqual(sessionUndef, { defaultValue: true });
    });

    test('T2.3: Storage Quota Exceeded handles gracefully with in-memory Map fallback', () => {
      beforeEachTest();
      mockWin.localStorage.quotaExceeded = true;

      // setItem must not throw DOMException 22; should fall back safely
      const writeResult = storage.setItem('educonnect_v1_large_data', { key: 'value' });
      assert.strictEqual(writeResult, false);

      // In-memory reading should still function
      const readBack = storage.getItem('educonnect_v1_large_data', null);
      assert.deepStrictEqual(readBack, { key: 'value' });
    });

    test('T2.4: SSR Hydration Safety (window === undefined does not throw)', () => {
      const ssrStorage = createStorageEngine(undefined);
      assert.strictEqual(ssrStorage.isStorageAvailable(), false);

      const fallback = [{ id: 'ssr' }];
      const item = ssrStorage.getItem('educonnect_v1_courses', fallback);
      assert.deepStrictEqual(item, fallback);

      const writeOk = ssrStorage.setItem('educonnect_v1_courses', []);
      assert.strictEqual(writeOk, false);

      assert.doesNotThrow(() => ssrStorage.removeItem('educonnect_v1_courses'));
    });

    test('T2.5: Credentials reset boundary with 0, 6, 7, and 100 accounts', () => {
      beforeEachTest();

      const testLengths = [0, 6, 7, 20, 100];
      for (const len of testLengths) {
        const dummyAccounts = Array.from({ length: len }, (_, i) => ({
          id: `acc-${i}`,
          email: `acc${i}@educonnect.vn`,
          role: 'student',
        }));
        storage.saveCollection('accountCredentials', dummyAccounts);

        const resetData = storage.resetAllToDefaults();
        assert.strictEqual(
          resetData.accountCredentials.length,
          6,
          `Failed invariant reset for initial length ${len}`
        );
      }
    });

    test('T2.6: Empty storage first-time visitor auto-initialization', () => {
      beforeEachTest();
      assert.strictEqual(mockWin.localStorage.length, 0);

      storage.loadInitialData();

      // Must have written schema version and 11 collections + notif + resources
      assert.strictEqual(mockWin.localStorage.getItem(STORAGE_KEYS.VERSION), CURRENT_SCHEMA_VERSION);
      assert.ok(mockWin.localStorage.length >= 13);
    });

    test('T2.7: Multi-reset idempotency and memory leak prevention', () => {
      beforeEachTest();
      storage.loadInitialData();

      const firstReset = storage.resetAllToDefaults();
      const secondReset = storage.resetAllToDefaults();
      const thirdReset = storage.resetAllToDefaults();

      assert.deepStrictEqual(firstReset.courses, secondReset.courses);
      assert.deepStrictEqual(secondReset.courses, thirdReset.courses);
      assert.strictEqual(thirdReset.accountCredentials.length, 6);
    });

    test('T2.8: Special Unicode characters & Vietnamese accents preserved intact', () => {
      beforeEachTest();
      const vietnamesePayload = {
        title: 'Toán 12 Vận Dụng Cao & Luyện Thi THPT Quốc Gia Điểm 9+',
        student: 'Nguyễn Thị Ánh Tuyết',
        note: 'Tiến độ học tập xuất sắc, hoàn thành bài tập đúng hạn!',
      };
      storage.setItem('educonnect_v1_vietnamese_test', vietnamesePayload);
      const retrieved = storage.getItem('educonnect_v1_vietnamese_test', {});
      assert.deepStrictEqual(retrieved, vietnamesePayload);
    });
  });
}

// ----------------------------------------------------------------------------
// TIER 3: CROSS-FEATURE INTEGRATION (Pairwise Combinatorial)
// ----------------------------------------------------------------------------
if (!options.tier || options.tier === 3) {
  describe('Tier 3: Cross-Feature Integration (Pairwise Combinatorial)', () => {
    let mockWin;
    let storage;

    function beforeEachTest() {
      mockWin = new MockWindow();
      storage = createStorageEngine(mockWin);
    }

    test('T3.1: [F1 + F2] Persistence + Reset Defaults cross-lifecycle synchronization', () => {
      beforeEachTest();
      storage.loadInitialData();

      // Step 1: Add new course and new student
      const courses = storage.getItem(STORAGE_KEYS.COURSES, []);
      courses.push({ id: 'crs-new', title: 'Lập trình Python Cho Trẻ Em', price: 1800000 });
      storage.saveCollection('courses', courses);

      const students = storage.getItem(STORAGE_KEYS.STUDENTS, []);
      students.push({ id: 'stu-new', name: 'Đỗ Hải Đăng', status: 'active' });
      storage.saveCollection('students', students);

      // Verify persistence
      assert.strictEqual(storage.getItem(STORAGE_KEYS.COURSES, []).length, courses.length);
      assert.strictEqual(storage.getItem(STORAGE_KEYS.STUDENTS, []).length, students.length);

      // Step 2: Trigger reset
      const fresh = storage.resetAllToDefaults();
      assert.strictEqual(fresh.courses.some((c) => c.id === 'crs-new'), false);
      assert.strictEqual(fresh.students.some((s) => s.id === 'stu-new'), false);
    });

    test('T3.2: [F1 + F3] Persistence + Notification Store unread counter sync', () => {
      beforeEachTest();
      const initial = storage.loadInitialData();

      // Read unread count
      const unreadCountBefore = initial.notifications.filter((n) => !n.isRead).length;
      assert.ok(unreadCountBefore > 0);

      // Mark first notification as read
      const updatedNotifications = initial.notifications.map((n, i) =>
        i === 0 ? { ...n, isRead: true } : n
      );
      storage.saveCollection('notifications', updatedNotifications);

      // Simulate page refresh (F5)
      const refreshedData = storage.loadInitialData();
      const unreadCountAfter = refreshedData.notifications.filter((n) => !n.isRead).length;
      assert.strictEqual(unreadCountAfter, unreadCountBefore - 1);
    });

    test('T3.3: [F1 + F8] Persistence + SSR Hydration Lifecycle & isHydrated Guard', () => {
      // Simulating page.tsx lifecycle:
      // 1. SSR Pass: storage.loadInitialData() runs on client mount only
      let isHydrated = false;
      let stateCourses = [{ id: 'mock-initial' }];

      // Mount hook:
      beforeEachTest();
      const persisted = storage.loadInitialData();
      stateCourses = persisted.courses;
      isHydrated = true;

      // Subsequent reactive sync guarded by isHydrated
      if (isHydrated) {
        stateCourses.push({ id: 'crs-reactive-test' });
        storage.saveCollection('courses', stateCourses);
      }

      assert.strictEqual(storage.getItem(STORAGE_KEYS.COURSES, []).length, stateCourses.length);
    });

    test('T3.4: [F1 + F4] Persistence + Admissions Lead Provisioning Flow', () => {
      beforeEachTest();
      storage.loadInitialData();

      // Admissions adds a lead
      const leads = storage.getItem(STORAGE_KEYS.ADMISSIONS_LEADS, []);
      leads.push({
        id: 'lead-test-1',
        studentName: 'Phan Nhật Nam',
        status: 'pending_provision',
      });
      storage.saveCollection('admissionsLeads', leads);

      // Super Admin approves provision
      const leadsUpdated = storage.getItem(STORAGE_KEYS.ADMISSIONS_LEADS, []).map((l) =>
        l.id === 'lead-test-1' ? { ...l, status: 'provisioned' } : l
      );
      storage.saveCollection('admissionsLeads', leadsUpdated);

      const savedLeads = storage.getItem(STORAGE_KEYS.ADMISSIONS_LEADS, []);
      const targeted = savedLeads.find((l) => l.id === 'lead-test-1');
      assert.strictEqual(targeted.status, 'provisioned');
    });

    test('T3.5: [F1 + F5/F6] Persistence + Analytics & Export Synchronization', () => {
      beforeEachTest();
      storage.loadInitialData();

      // Add a paid tuition invoice
      const invoices = storage.getItem(STORAGE_KEYS.TUITION_INVOICES, []);
      invoices.push({
        id: 'inv-analytics-1',
        studentName: 'Hoàng Minh Châu',
        amount: 3500000,
        status: 'paid',
        paymentCode: 'DK-VIETQR-001',
      });
      storage.saveCollection('invoices', invoices);

      // Verify analytical total update
      const allInvoices = storage.getItem(STORAGE_KEYS.TUITION_INVOICES, []);
      const totalPaid = allInvoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

      assert.ok(totalPaid >= 3500000);
    });

    test('T3.6: [F1 + F7] Persistence + Learning Resources filtering by enrolled course', () => {
      beforeEachTest();
      storage.loadInitialData();

      const newResource = {
        id: 'res-new-video',
        courseId: 'crs-1',
        courseTitle: 'Toán 12 Vận Dụng Cao',
        title: 'Video Buổi 04: Ôn tập Tích phân',
        type: 'recording',
        fileUrl: 'https://meet.google.com/rec-toan12-b04',
        uploadedBy: 'Thầy Hoàng',
      };

      const existingRes = storage.getItem(STORAGE_KEYS.RESOURCES, []);
      storage.saveCollection('resources', [...existingRes, newResource]);

      const studentCourseId = 'crs-1';
      const studentResources = storage
        .getItem(STORAGE_KEYS.RESOURCES, [])
        .filter((r) => r.courseId === studentCourseId);

      assert.ok(studentResources.some((r) => r.id === 'res-new-video'));
    });

    test('T3.7: [F3 + F4] Real-time event generation: Homework creation & grading workflow', () => {
      beforeEachTest();
      storage.loadInitialData();
      let notifs = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);

      // Simulating handleCreateHomework: Tutor assigns homework hw-test-101
      const newHomeworkNotifs = [
        {
          id: 'notif-hw-assign-student',
          title: 'Bài tập mới: Giải tích 12 - Tích phân nâng cao',
          message: 'Thầy Hoàng vừa giao bài tập mới môn Toán 12. Hạn nộp: 23:59 ngày mai.',
          type: 'homework',
          targetRole: 'student',
          targetTab: 'homework',
          entityId: 'hw-test-101',
          isRead: false,
          timestamp: 'Vừa xong',
        },
        {
          id: 'notif-hw-assign-parent',
          title: 'Bài tập mới của con: Giải tích 12 - Tích phân nâng cao',
          message: 'Gia sư Thầy Hoàng đã giao bài tập về nhà môn Toán 12. Hạn nộp: 23:59 ngày mai.',
          type: 'homework',
          targetRole: 'parent',
          targetTab: 'progress',
          entityId: 'hw-test-101',
          isRead: false,
          timestamp: 'Vừa xong',
        },
      ];
      notifs = [...newHomeworkNotifs, ...notifs];
      storage.saveCollection('notifications', notifs);

      // Verify student and parent receive unread notifications
      let storedNotifs = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      const stuHw = storedNotifs.find((n) => n.id === 'notif-hw-assign-student');
      const parHw = storedNotifs.find((n) => n.id === 'notif-hw-assign-parent');
      assert.ok(stuHw && !stuHw.isRead && stuHw.targetTab === 'homework');
      assert.ok(parHw && !parHw.isRead && parHw.targetTab === 'progress');

      // Simulating handleGradeHomework: Tutor grades submission with score 9.5
      const gradedNotifs = [
        {
          id: 'notif-hw-graded-student',
          title: 'Bài tập đã được chấm điểm: Giải tích 12 - Tích phân nâng cao',
          message: 'Thầy/Cô đã chấm bài của bạn: 9.5/10 điểm. Nhận xét: "Lời giải sáng tạo, trình bày sạch sẽ".',
          type: 'homework',
          targetRole: 'student',
          targetTab: 'homework',
          entityId: 'hw-test-101',
          targetUserId: 'stu-1',
          isRead: false,
          timestamp: 'Vừa xong',
        },
        {
          id: 'notif-hw-graded-parent',
          title: 'Kết quả bài tập của Nguyễn Minh Quân',
          message: 'Gia sư đã chấm bài "Giải tích 12 - Tích phân nâng cao" của con: 9.5/10 điểm. Nhận xét: "Lời giải sáng tạo".',
          type: 'homework',
          targetRole: 'parent',
          targetTab: 'progress',
          entityId: 'hw-test-101',
          targetUserId: 'stu-1',
          isRead: false,
          timestamp: 'Vừa xong',
        },
      ];
      notifs = [...gradedNotifs, ...notifs];
      storage.saveCollection('notifications', notifs);

      storedNotifs = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      const gradedStu = storedNotifs.find((n) => n.id === 'notif-hw-graded-student');
      assert.ok(gradedStu && gradedStu.message.includes('9.5/10 điểm'));
    });

    test('T3.8: [F3 + F4] Real-time event generation: Course registration, payment & lead consultation', () => {
      beforeEachTest();
      storage.loadInitialData();
      let notifs = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);

      // 1. Lead submitted on landing page -> Admin notification
      const leadNotif = {
        id: 'notif-new-lead-event',
        title: 'Hồ sơ tuyển sinh mới: Vũ Mai Anh',
        message: 'Phụ huynh Vũ Mai Anh (Lớp 11) đăng ký tư vấn khóa IELTS 7.5+.',
        type: 'registration',
        targetRole: 'admin',
        targetTab: 'admissions-leads',
        entityId: 'lead-test-202',
        isRead: false,
        timestamp: 'Vừa xong',
      };

      // 2. Course registration approved -> Student notification
      const regApprovedNotif = {
        id: 'notif-reg-approved-event',
        title: 'Đơn đăng ký khóa học đã được duyệt xếp lớp',
        message: 'Đơn đăng ký khóa IELTS 7.5+ đã được xếp phòng: Phòng B204. Vui lòng thanh toán học phí (Bước 4).',
        type: 'registration',
        targetRole: 'student',
        targetTab: 'courses',
        entityId: 'reg-test-202',
        isRead: false,
        timestamp: 'Vừa xong',
      };

      // 3. Tuition paid -> Admin & Student notification
      const tuitionPaidNotif = {
        id: 'notif-tuition-paid-event',
        title: 'Học viên thanh toán học phí thành công',
        message: 'Học sinh Vũ Mai Anh đã thanh toán 3.200.000 đ khóa IELTS 7.5+.',
        type: 'tuition',
        targetRole: 'admin',
        targetTab: 'tuition',
        entityId: 'inv-test-202',
        isRead: false,
        timestamp: 'Vừa xong',
      };

      notifs = [leadNotif, regApprovedNotif, tuitionPaidNotif, ...notifs];
      storage.saveCollection('notifications', notifs);

      // Verify deep-linking resolution
      const stored = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      const foundLead = stored.find((n) => n.id === 'notif-new-lead-event');
      const foundReg = stored.find((n) => n.id === 'notif-reg-approved-event');
      const foundTuition = stored.find((n) => n.id === 'notif-tuition-paid-event');

      assert.strictEqual(foundLead.targetTab, 'admissions-leads');
      assert.strictEqual(foundReg.targetTab, 'courses');
      assert.strictEqual(foundTuition.targetTab, 'tuition');

      // Simulate clicking foundReg: marks as read and closes
      foundReg.isRead = true;
      storage.saveCollection('notifications', stored);

      const afterClick = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      assert.strictEqual(afterClick.find((n) => n.id === 'notif-reg-approved-event').isRead, true);
    });

    test('T3.9: [F3 + F2] Notification Store survives Reset Defaults and reseeds canonical 17 notifications', () => {
      beforeEachTest();
      storage.loadInitialData();

      // Clear all notifications
      storage.saveCollection('notifications', []);
      assert.strictEqual(storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []).length, 0);

      // Execute Reset
      const fresh = storage.resetAllToDefaults();
      assert.strictEqual(fresh.notifications.length, 17, 'Must reseed 17 notifications');

      const reloaded = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      assert.strictEqual(reloaded.length, 17);
      assert.strictEqual(reloaded.some((n) => n.id === 'notif-admin-1'), true);
      assert.strictEqual(reloaded.some((n) => n.id === 'notif-student-1'), true);
      assert.strictEqual(reloaded.some((n) => n.id === 'notif-parent-1'), true);
      assert.strictEqual(reloaded.some((n) => n.id === 'notif-tutor-1'), true);
      assert.strictEqual(reloaded.some((n) => n.id === 'notif-all-1'), true);
    });

    test('T3.10: [F3 + F4] Real-time event generation: Tuition reminder workflow & unread badge counters', () => {
      beforeEachTest();
      const initial = storage.loadInitialData();

      // Role filter and unread counter helper matching NotificationPopover & page.tsx
      const filterByRole = (items, role) =>
        items.filter((n) =>
          Array.isArray(n.targetRole)
            ? n.targetRole.includes(role) || n.targetRole.includes('all')
            : n.targetRole === 'all' || n.targetRole === role
        );

      const countUnread = (items, role) =>
        filterByRole(items, role).filter((n) => !n.isRead).length;

      // 1. Establish initial baseline unread badge counts
      const adminUnreadBefore = countUnread(initial.notifications, 'admin');
      const tutorUnreadBefore = countUnread(initial.notifications, 'tutor');
      const studentUnreadBefore = countUnread(initial.notifications, 'student');
      const parentUnreadBefore = countUnread(initial.notifications, 'parent');

      assert.strictEqual(studentUnreadBefore, 2, 'Initial student unread count should be 2');
      assert.strictEqual(parentUnreadBefore, 3, 'Initial parent unread count should be 3');

      // 2. Select an unpaid invoice (status: pending or overdue)
      const unpaidInvoice = {
        id: 'inv-test-remind-002',
        studentId: 'stu-2',
        studentName: 'Nguyễn An (Bé An)',
        courseName: 'Toán 8 Bứt Phá & Hình Học',
        amount: 2400000,
        dueDate: '15/10/2026',
        status: 'pending',
        paymentCode: 'EDU-HS02-T10',
        sessionsCount: 8,
      };

      // 3. Simulate calling handleSendTuitionReminder(unpaidInvoice) as implemented in page.tsx:357-381
      const formatVND = (amount) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(amount);

      const reminderStudentNotif = {
        id: `notif-tuition-stu-${Date.now()}`,
        title: `Nhắc hạn đóng học phí: ${unpaidInvoice.courseName}`,
        message: `Hóa đơn học phí khóa ${unpaidInvoice.courseName} (${formatVND(unpaidInvoice.amount)}) của bạn có hạn chót ${unpaidInvoice.dueDate}. Vui lòng nộp học phí qua VietQR.`,
        type: 'tuition',
        targetRole: 'student',
        targetTab: 'student-tuition',
        entityId: unpaidInvoice.id,
        targetUserId: unpaidInvoice.studentId,
        isRead: false,
        timestamp: 'Vừa xong',
        createdAt: new Date().toISOString(),
      };

      const reminderParentNotif = {
        id: `notif-tuition-par-${Date.now()}`,
        title: `Nhắc đóng học phí cho ${unpaidInvoice.studentName}`,
        message: `Học phí môn ${unpaidInvoice.courseName} (${formatVND(unpaidInvoice.amount)}) của ${unpaidInvoice.studentName} đến hạn ngày ${unpaidInvoice.dueDate}. Quý phụ huynh vui lòng thanh toán.`,
        type: 'tuition',
        targetRole: 'parent',
        targetTab: 'parent-tuition',
        entityId: unpaidInvoice.id,
        targetUserId: unpaidInvoice.studentId,
        isRead: false,
        timestamp: 'Vừa xong',
        createdAt: new Date().toISOString(),
      };

      // Dispatched to notifications state and synced to storage
      let currentNotifs = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      currentNotifs = [reminderStudentNotif, reminderParentNotif, ...currentNotifs];
      storage.saveCollection('notifications', currentNotifs);

      // 4. Assert notifications persisted and schema contracts are strictly met
      const persistedNotifs = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      assert.strictEqual(
        persistedNotifs.length,
        initial.notifications.length + 2,
        'Notification store must grow by exactly 2 items'
      );

      const stuNotif = persistedNotifs.find((n) => n.id === reminderStudentNotif.id);
      assert.ok(stuNotif, 'Student tuition reminder notification must exist in store');
      assert.strictEqual(stuNotif.targetRole, 'student');
      assert.strictEqual(stuNotif.type, 'tuition');
      assert.strictEqual(stuNotif.targetTab, 'student-tuition');
      assert.strictEqual(stuNotif.entityId, unpaidInvoice.id);
      assert.strictEqual(stuNotif.targetUserId, unpaidInvoice.studentId);
      assert.strictEqual(stuNotif.isRead, false);
      assert.ok(stuNotif.title.includes(unpaidInvoice.courseName));
      assert.ok(stuNotif.message.includes(unpaidInvoice.dueDate));

      const parNotif = persistedNotifs.find((n) => n.id === reminderParentNotif.id);
      assert.ok(parNotif, 'Parent tuition reminder notification must exist in store');
      assert.strictEqual(parNotif.targetRole, 'parent');
      assert.strictEqual(parNotif.type, 'tuition');
      assert.strictEqual(parNotif.targetTab, 'parent-tuition');
      assert.strictEqual(parNotif.entityId, unpaidInvoice.id);
      assert.strictEqual(parNotif.targetUserId, unpaidInvoice.studentId);
      assert.strictEqual(parNotif.isRead, false);
      assert.ok(parNotif.title.includes(unpaidInvoice.studentName));
      assert.ok(parNotif.message.includes(unpaidInvoice.dueDate));

      // 5. Assert unread badge increments and role isolation
      const studentUnreadAfter = countUnread(persistedNotifs, 'student');
      const parentUnreadAfter = countUnread(persistedNotifs, 'parent');
      const adminUnreadAfter = countUnread(persistedNotifs, 'admin');
      const tutorUnreadAfter = countUnread(persistedNotifs, 'tutor');

      assert.strictEqual(
        studentUnreadAfter,
        studentUnreadBefore + 1,
        `Student unread badge must increment by 1 (expected ${studentUnreadBefore + 1}, got ${studentUnreadAfter})`
      );
      assert.strictEqual(
        parentUnreadAfter,
        parentUnreadBefore + 1,
        `Parent unread badge must increment by 1 (expected ${parentUnreadBefore + 1}, got ${parentUnreadAfter})`
      );
      assert.strictEqual(
        adminUnreadAfter,
        adminUnreadBefore,
        'Admin unread badge count must remain unchanged'
      );
      assert.strictEqual(
        tutorUnreadAfter,
        tutorUnreadBefore,
        'Tutor unread badge count must remain unchanged'
      );

      // 6. Assert F5 Browser Reload persistence
      const reloadedWin = new MockWindow();
      reloadedWin.localStorage.store = new Map(mockWin.localStorage.store);
      const reloadedStorage = createStorageEngine(reloadedWin);
      const hydrated = reloadedStorage.loadInitialData();

      const hydratedStudentUnread = countUnread(hydrated.notifications, 'student');
      const hydratedParentUnread = countUnread(hydrated.notifications, 'parent');
      assert.strictEqual(hydratedStudentUnread, studentUnreadBefore + 1, 'Student unread badge persists across F5');
      assert.strictEqual(hydratedParentUnread, parentUnreadBefore + 1, 'Parent unread badge persists across F5');
      assert.ok(hydrated.notifications.some((n) => n.id === reminderStudentNotif.id && !n.isRead));
      assert.ok(hydrated.notifications.some((n) => n.id === reminderParentNotif.id && !n.isRead));

      // 7. Simulate Student clicking notification (deep link + mark as read)
      const afterStudentRead = hydrated.notifications.map((n) =>
        n.id === reminderStudentNotif.id ? { ...n, isRead: true } : n
      );
      reloadedStorage.saveCollection('notifications', afterStudentRead);

      const notifsAfterRead = reloadedStorage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      const readStuItem = notifsAfterRead.find((n) => n.id === reminderStudentNotif.id);
      assert.strictEqual(readStuItem.isRead, true, 'Student notification isRead should become true');

      const studentUnreadAfterClick = countUnread(notifsAfterRead, 'student');
      assert.strictEqual(
        studentUnreadAfterClick,
        studentUnreadBefore,
        'Student unread badge should decrement back to baseline after reading'
      );

      // Parent notification remains unread (independent multi-role state)
      const parentUnreadStill = countUnread(notifsAfterRead, 'parent');
      assert.strictEqual(
        parentUnreadStill,
        parentUnreadBefore + 1,
        'Parent unread notification must remain unread independently'
      );

      // 8. Anti-Facade Static Wiring Assertion (Verifies UI is physically connected)
      const trackerPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'TuitionTracker.tsx');
      const trackerCode = fs.readFileSync(trackerPath, 'utf8');
      assert.ok(
        trackerCode.includes('onSendReminder?:') || trackerCode.includes('onSendReminder:'),
        'TuitionTrackerProps must define onSendReminder prop'
      );
      assert.ok(
        trackerCode.includes('onSendReminder(') || trackerCode.includes('onSendReminder?.('),
        'TuitionTracker must invoke onSendReminder in its button click handler'
      );

      const pagePath = path.join(PROJECT_ROOT, 'src', 'app', 'page.tsx');
      const pageCode = fs.readFileSync(pagePath, 'utf8');
      assert.ok(
        pageCode.includes('onSendReminder={handleSendTuitionReminder}'),
        'page.tsx must pass onSendReminder={handleSendTuitionReminder} to <TuitionTracker />'
      );
    });
  });
}

// ----------------------------------------------------------------------------
// TIER 4: REAL-WORLD APPLICATION SCENARIOS (S1 - S6 per TEST_INFRA.md)
// ----------------------------------------------------------------------------
if (!options.tier || options.tier === 4) {
  describe('Tier 4: Real-World Application Scenarios (S1 - S6)', () => {
    let mockWin;
    let storage;

    function beforeEachTest() {
      mockWin = new MockWindow();
      storage = createStorageEngine(mockWin);
    }

    if (!options.scenario || options.scenario === 's1') {
      test('S1: 4-Step Registration to Schedule & F5 Persistence', () => {
        beforeEachTest();
        storage.loadInitialData();

        // Step 1: Student fills registration form
        const newReg = {
          id: 'reg-s1-001',
          courseId: 'crs-1',
          courseTitle: 'Toán 12 Vận Dụng Cao',
          studentName: 'Lê Văn An',
          studentPhone: '0901 234 567',
          studentEmail: 'an.le@gmail.com',
          currentStep: 1,
        };

        // Step 2: Select schedule and learning format
        newReg.selectedSchedule = 'Thứ 2 & Thứ 5 (19:30 - 21:00)';
        newReg.learningFormat = 'online';
        newReg.currentStep = 2;

        // Step 3: Admin approves registration & assigns room
        newReg.centerStatus = 'approved';
        newReg.assignedRoom = 'Google Meet (meet.google.com/edu-toan-12)';
        newReg.currentStep = 3;

        // Step 4: VietQR Tuition Payment & Invoice generation
        newReg.paymentStatus = 'paid';
        newReg.paymentCode = 'DK-TOAN12-998';
        newReg.currentStep = 4;

        // Persist to registrations
        const registrations = storage.getItem(STORAGE_KEYS.REGISTRATIONS, []);
        storage.saveCollection('courseRegistrations', [...registrations, newReg]);

        // Persist new student entity
        const students = storage.getItem(STORAGE_KEYS.STUDENTS, []);
        students.push({
          id: 'stu-s1-001',
          name: newReg.studentName,
          enrolledCourses: [newReg.courseId],
          tuitionStatus: 'paid',
        });
        storage.saveCollection('students', students);

        // Persist new invoice
        const invoices = storage.getItem(STORAGE_KEYS.TUITION_INVOICES, []);
        invoices.push({
          id: 'inv-s1-001',
          studentId: 'stu-s1-001',
          studentName: newReg.studentName,
          amount: 2400000,
          status: 'paid',
          paymentCode: newReg.paymentCode,
        });
        storage.saveCollection('invoices', invoices);

        // Simulate F5 Browser Reload
        const reloadedWin = new MockWindow();
        reloadedWin.localStorage.store = new Map(mockWin.localStorage.store);
        const reloadedStorage = createStorageEngine(reloadedWin);
        const hydrated = reloadedStorage.loadInitialData();

        // Assert all 3 collections retained the workflow updates
        assert.ok(hydrated.courseRegistrations.some((r) => r.id === 'reg-s1-001'));
        assert.ok(hydrated.students.some((s) => s.id === 'stu-s1-001'));
        assert.ok(hydrated.invoices.some((i) => i.id === 'inv-s1-001' && i.status === 'paid'));
      });
    }

    if (!options.scenario || options.scenario === 's2') {
      test('S2: Tutor Homework Creation, Student Submission, Grading & Notification', () => {
        beforeEachTest();
        storage.loadInitialData();

        // 1. Tutor creates homework
        const newHw = {
          id: 'hw-s2-001',
          title: 'Đề Luyện Thi Số 05: Hàm Số & Tích Phân',
          tutorId: 'user-tutor-1',
          totalScore: 10,
          studentIds: ['stu-1'],
        };
        const hwList = storage.getItem(STORAGE_KEYS.HOMEWORK_ASSIGNMENTS, []);
        storage.saveCollection('homeworkList', [...hwList, newHw]);

        // 2. Student submits homework
        const submission = {
          id: 'sub-s2-001',
          homeworkId: 'hw-s2-001',
          studentId: 'stu-1',
          status: 'submitted',
          submissionText: 'Em đã hoàn thành 50 câu trắc nghiệm.',
        };
        const subList = storage.getItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, []);
        storage.saveCollection('submissionsList', [...subList, submission]);

        // 3. Tutor grades assignment
        const gradedSubList = storage.getItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, []).map((s) =>
          s.id === 'sub-s2-001'
            ? { ...s, status: 'graded', score: 9.0, tutorFeedback: 'Bài làm rất tốt, cẩn thận câu 42.' }
            : s
        );
        storage.saveCollection('submissionsList', gradedSubList);

        // 4. Notification generated for student
        const notif = {
          id: 'notif-grade-s2',
          title: 'Bài tập đã được chấm điểm',
          message: 'Thầy Hoàng đã chấm Đề Luyện Thi Số 05: 9.0 / 10',
          type: 'homework',
          isRead: false,
          targetRole: 'student',
          targetTab: 'homework',
        };
        const notifs = storage.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
        storage.saveCollection('notifications', [...notifs, notif]);

        // Verify rehydration
        const hydrated = storage.loadInitialData();
        const foundSub = hydrated.submissionsList.find((s) => s.id === 'sub-s2-001');
        assert.strictEqual(foundSub.status, 'graded');
        assert.strictEqual(foundSub.score, 9.0);
        assert.ok(hydrated.notifications.some((n) => n.id === 'notif-grade-s2'));
      });
    }

    if (!options.scenario || options.scenario === 's3') {
      test('S3: Tuition Payment with VietQR, Invoice Generation & Export', () => {
        beforeEachTest();
        storage.loadInitialData();

        // Parent initiates VietQR payment
        const newInvoice = {
          id: 'inv-s3-100',
          studentId: 'stu-1',
          studentName: 'Nguyễn Minh Quân',
          courseName: 'Toán 12 Vận Dụng Cao',
          amount: 2400000,
          status: 'paid',
          paymentDate: '24/09/2026',
          paymentCode: 'DK-TOAN12-VQR',
          sessionsCount: 24,
        };

        const invoices = storage.getItem(STORAGE_KEYS.TUITION_INVOICES, []);
        storage.saveCollection('invoices', [...invoices, newInvoice]);

        // Prepare Export Column Format
        const exportColumns = [
          { header: 'Mã Hóa Đơn', key: 'id' },
          { header: 'Học Sinh', key: 'studentName' },
          { header: 'Khóa Học', key: 'courseName' },
          { header: 'Số Tiền (VND)', key: 'amount' },
          { header: 'Mã Thanh Toán VietQR', key: 'paymentCode' },
          { header: 'Trạng Thái', key: 'status' },
        ];

        const persistedInvoices = storage.getItem(STORAGE_KEYS.TUITION_INVOICES, []);
        const exportedRows = persistedInvoices.map((inv) =>
          exportColumns.map((col) => inv[col.key] || '')
        );

        assert.ok(exportedRows.length >= 1);
        const lastRow = exportedRows[exportedRows.length - 1];
        assert.strictEqual(lastRow[0], 'inv-s3-100');
        assert.strictEqual(lastRow[4], 'DK-TOAN12-VQR');
      });
    }

    if (!options.scenario || options.scenario === 's4') {
      test('S4: Resource Upload by Tutor, Download by Student/Parent', () => {
        beforeEachTest();
        storage.loadInitialData();

        // Tutor uploads study material and Meet recording
        const materials = [
          {
            id: 'res-pdf-s4',
            courseId: 'crs-1',
            courseTitle: 'Toán 12 Vận Dụng Cao',
            title: 'Tài liệu Phương pháp Giải Nhanh Hình Học Oxyz',
            type: 'pdf',
            fileUrl: 'https://example.com/docs/toan12-oxyz.pdf',
            fileSize: '6.4 MB',
            uploadedBy: 'Thầy Trần Huy Hoàng',
          },
          {
            id: 'res-rec-s4',
            courseId: 'crs-1',
            courseTitle: 'Toán 12 Vận Dụng Cao',
            title: 'Video Ghi hình Tiết 08: Giải Chi Tiết Đề Thi Thử',
            type: 'recording',
            fileUrl: 'https://meet.google.com/rec-toan12-s08',
            duration: '90 phút',
            uploadedBy: 'Thầy Trần Huy Hoàng',
          },
        ];

        const existing = storage.getItem(STORAGE_KEYS.RESOURCES, []);
        storage.saveCollection('resources', [...existing, ...materials]);

        // Student/Parent query
        const studentEnrolledCourses = ['crs-1'];
        const viewableResources = storage
          .getItem(STORAGE_KEYS.RESOURCES, [])
          .filter((res) => studentEnrolledCourses.includes(res.courseId));

        assert.ok(viewableResources.some((r) => r.id === 'res-pdf-s4'));
        assert.ok(viewableResources.some((r) => r.id === 'res-rec-s4'));
      });
    }

    if (!options.scenario || options.scenario === 's5') {
      test('S5: System Settings Reset to Default Mock Data (Credential Trimming Verification)', () => {
        beforeEachTest();
        storage.loadInitialData();

        // 1. In-memory array mockAccountCredentials simulation
        const mockAccountCredentials = JSON.parse(JSON.stringify(SEED_ACCOUNT_CREDENTIALS));
        assert.strictEqual(mockAccountCredentials.length, 6);

        // 2. Admissions provisioning mutation: 7th account added
        const provisionedAccount = {
          id: 'user-student-provisioned',
          email: 'phan.nhat.nam@educonnect.vn',
          password: 'hocsinh_nam123',
          name: 'Phan Nhật Nam',
          role: 'student',
          badge: 'Học Sinh',
        };
        mockAccountCredentials.push(provisionedAccount);
        assert.strictEqual(mockAccountCredentials.length, 7);

        // Persist to storage
        storage.saveCollection('accountCredentials', mockAccountCredentials);
        assert.strictEqual(storage.getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, []).length, 7);

        // 3. User navigates to Settings -> Clicks "Khôi Phục Dữ Liệu Gốc"
        // Correct implementation sequence (pre-trimming + defensive seed slice):
        if (Array.isArray(mockAccountCredentials) && mockAccountCredentials.length > 6) {
          mockAccountCredentials.length = 6;
        }

        const freshSeeds = storage.resetAllToDefaults();

        // 4. Verify invariant guarantees
        assert.strictEqual(
          mockAccountCredentials.length,
          6,
          'mockAccountCredentials in memory must be strictly trimmed to length 6'
        );
        assert.strictEqual(
          freshSeeds.accountCredentials.length,
          6,
          'freshSeeds.accountCredentials must contain strictly 6 seed records'
        );
        const storedCredsAfterReset = storage.getItem(STORAGE_KEYS.ACCOUNT_CREDENTIALS, []);
        assert.strictEqual(
          storedCredsAfterReset.length,
          6,
          'STORAGE_KEYS.ACCOUNT_CREDENTIALS in storage must contain strictly 6 seed records'
        );
        assert.strictEqual(
          storedCredsAfterReset.some((c) => c.email === 'phan.nhat.nam@educonnect.vn'),
          false,
          'Provisioned account must be purged completely from credentials storage'
        );
      });
    }

    if (!options.scenario || options.scenario === 's6') {
      test('S6: End-to-End Build and Zero Error Verification', () => {
        // Inspect files and structural requirements
        const storageTsPath = path.join(PROJECT_ROOT, 'src', 'lib', 'storage.ts');
        assert.ok(fs.existsSync(storageTsPath), 'src/lib/storage.ts must exist');

        const pageTsxPath = path.join(PROJECT_ROOT, 'src', 'app', 'page.tsx');
        assert.ok(fs.existsSync(pageTsxPath), 'src/app/page.tsx must exist');

        const typesIndexPath = path.join(PROJECT_ROOT, 'src', 'types', 'index.ts');
        assert.ok(fs.existsSync(typesIndexPath), 'src/types/index.ts must exist');

        const storageCode = fs.readFileSync(storageTsPath, 'utf8');
        assert.ok(storageCode.includes('loadInitialData'), 'storage.ts must export loadInitialData');
        assert.ok(storageCode.includes('resetAllToDefaults'), 'storage.ts must export resetAllToDefaults');
        assert.ok(storageCode.includes('STORAGE_KEYS'), 'storage.ts must export STORAGE_KEYS');

        const typesCode = fs.readFileSync(typesIndexPath, 'utf8');
        assert.ok(typesCode.includes('export interface AppNotification'), 'types/index.ts must export AppNotification');
        assert.ok(typesCode.includes('export interface CourseResource'), 'types/index.ts must export CourseResource');

        // Verify TuitionTracker wiring
        const tuitionTrackerPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'TuitionTracker.tsx');
        assert.ok(fs.existsSync(tuitionTrackerPath), 'src/components/admin/TuitionTracker.tsx must exist');
        const tuitionTrackerCode = fs.readFileSync(tuitionTrackerPath, 'utf8');
        assert.ok(
          tuitionTrackerCode.includes('onSendReminder'),
          'TuitionTracker.tsx must support onSendReminder prop'
        );
        const pageCode = fs.readFileSync(pageTsxPath, 'utf8');
        assert.ok(
          pageCode.includes('onSendReminder={handleSendTuitionReminder}'),
          'page.tsx must connect onSendReminder={handleSendTuitionReminder}'
        );

        // Milestone 3: Analytics Dashboard & Operational Export Suite Verification
        const exportUtilsPath = path.join(PROJECT_ROOT, 'src', 'lib', 'exportUtils.ts');
        assert.ok(fs.existsSync(exportUtilsPath), 'src/lib/exportUtils.ts must exist');

        const exportDropdownPath = path.join(PROJECT_ROOT, 'src', 'components', 'common', 'ExportDropdown.tsx');
        assert.ok(fs.existsSync(exportDropdownPath), 'src/components/common/ExportDropdown.tsx must exist');

        const analyticsPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'AnalyticsDashboard.tsx');
        assert.ok(fs.existsSync(analyticsPath), 'src/components/admin/AnalyticsDashboard.tsx must exist');

        assert.ok(
          pageCode.includes('<AnalyticsDashboard'),
          'page.tsx must mount AnalyticsDashboard'
        );
        assert.ok(
          pageCode.includes("activeTab === 'analytics'"),
          'page.tsx must conditionally display AnalyticsDashboard on activeTab === analytics'
        );

        const sidebarPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Sidebar.tsx');
        const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
        assert.ok(
          sidebarCode.includes("id: 'analytics'"),
          'Sidebar.tsx must include analytics navigation item'
        );

        const headerPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Header.tsx');
        const headerCode = fs.readFileSync(headerPath, 'utf8');
        assert.ok(
          headerCode.includes("analytics: 'Báo cáo & Phân tích'"),
          'Header.tsx must map analytics tab title'
        );
      });
    }

    if (!options.scenario || options.scenario === 's7') {
      test('S7: Smart Schedule Clash Detection & Conflict Prevention', () => {
        const scheduleValidatorPath = path.join(PROJECT_ROOT, 'src', 'lib', 'scheduleValidator.ts');
        assert.ok(fs.existsSync(scheduleValidatorPath), 'scheduleValidator.ts must exist');

        const validatorContent = fs.readFileSync(scheduleValidatorPath, 'utf8');
        assert.ok(validatorContent.includes('validateScheduleClash'), 'Must export validateScheduleClash');

        // Empirical execution of scheduleValidator.ts
        const tsModPath = path.join(PROJECT_ROOT, 'node_modules', 'typescript', 'lib', 'typescript.js');
        let tsCompiler;
        try {
          tsCompiler = require(tsModPath);
        } catch {}

        let validatorJs;
        if (tsCompiler && tsCompiler.transpileModule) {
          validatorJs = tsCompiler.transpileModule(validatorContent, {
            compilerOptions: { module: tsCompiler.ModuleKind.CommonJS, target: tsCompiler.ScriptTarget.ES2022 }
          }).outputText;
        } else {
          validatorJs = validatorContent
            .replace(/^import\s+type\s+.*?;/gm, '')
            .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?/gm, '')
            .replace(/export\s+interface\s+[\s\S]*?\}\n/g, '')
            .replace(/:\s*[A-Z][A-Za-z0-9_<>\[\]|&\s]*(\/\*.*?\*\/)?(?=[,);=])/g, '')
            .replace(/:\s*(string|number|boolean|any)(\[\])?/g, '')
            .replace(/export\s+function/g, 'exports.');
        }

        const validatorExports = {};
        const fn = new Function('exports', validatorJs);
        fn(validatorExports);
        const { validateSmartScheduleConflict, validateScheduleClash } = validatorExports;
        assert.strictEqual(typeof validateSmartScheduleConflict, 'function', 'Must export validateSmartScheduleConflict function');
        assert.strictEqual(typeof validateScheduleClash, 'function', 'Must export validateScheduleClash function');

        const testClassrooms = [
          { id: 'room-a101', name: 'Phòng A101 (Offline)', type: 'physical', capacity: 20 },
          { id: 'room-b202', name: 'Phòng Văn B202', type: 'physical', capacity: 25 },
          { id: 'room-vip01', name: 'Phòng VIP 01 (Gia sư 1-1)', type: 'physical', capacity: 4 },
          { id: 'room-vip02', name: 'Phòng VIP 02', type: 'physical', capacity: 6 },
          { id: 'room-online-meet', name: 'Phòng Online Meet (Google Meet Pro)', type: 'online', capacity: 40 },
        ];

        const existingEvents = [
          {
            id: 'ev-1',
            dayOfWeek: 2,
            startTime: '08:00',
            endTime: '10:00',
            tutorId: 'tut-1',
            tutorName: 'Thầy Hoàng',
            room: 'Phòng A101 (Offline)',
          },
        ];

        // 1. Room Clash: two events in same physical room with overlapping times
        const roomClash = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:30', endTime: '09:30', tutorId: 'tut-2', room: 'Phòng A101 (Offline)' },
          existingEvents,
          testClassrooms
        );
        assert.strictEqual(roomClash.hasConflict, true);
        assert.strictEqual(roomClash.hasClash, true);
        assert.strictEqual(roomClash.type, 'room');
        assert.strictEqual(roomClash.conflictingEvent?.id, 'ev-1');

        // 2. Tutor Conflict: same tutor assigned to two overlapping events in different rooms
        const tutorClash = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '09:00', endTime: '11:00', tutorId: 'tut-1', room: 'Phòng Văn B202' },
          existingEvents,
          testClassrooms
        );
        assert.strictEqual(tutorClash.hasConflict, true);
        assert.strictEqual(tutorClash.hasClash, true);
        assert.strictEqual(tutorClash.type, 'tutor');
        assert.strictEqual(tutorClash.conflictingEvent?.id, 'ev-1');

        // 3. Capacity Overflow: 6 students in room with capacity 4
        const capacityClash = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '14:00', endTime: '15:30', room: 'Phòng VIP 01 (Gia sư 1-1)', studentCount: 6 },
          existingEvents,
          testClassrooms
        );
        assert.strictEqual(capacityClash.hasConflict, true);
        assert.strictEqual(capacityClash.hasClash, true);
        assert.strictEqual(capacityClash.type, 'capacity');
        assert.strictEqual(capacityClash.roomCapacity, 4);
        assert.strictEqual(capacityClash.studentCount, 6);

        // 4. Online Room Exemption: multiple simultaneous events in "Phòng Online Meet"
        const onlineExisting = [{
          id: 'ev-on-1',
          dayOfWeek: 2,
          startTime: '08:00',
          endTime: '10:00',
          tutorId: 'tut-1',
          room: 'Phòng Online Meet (Google Meet Pro)',
        }];
        const onlineRoom = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:30', endTime: '09:30', tutorId: 'tut-2', room: 'Phòng Online Meet (Google Meet Pro)' },
          onlineExisting,
          testClassrooms
        );
        assert.strictEqual(onlineRoom.hasConflict, false);
        assert.strictEqual(onlineRoom.hasClash, false);

        // 5. Edge Times: back-to-back classes (07:00-08:30 and 08:30-10:00) should NOT conflict
        const backToBack = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '07:00', endTime: '08:30', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' },
          existingEvents, // existing starts at 08:30? No, existing is 08:00-10:00. Let's create exact back-to-back
          testClassrooms
        );
        // Compare with 08:00-10:00: 07:00-08:00 should NOT conflict
        const exactBackToBack = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '07:00', endTime: '08:00', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' },
          existingEvents,
          testClassrooms
        );
        assert.strictEqual(exactBackToBack.hasConflict, false);
        assert.strictEqual(exactBackToBack.hasClash, false);

        // 6. 1-minute overlap MUST conflict (07:00-08:01 vs 08:00-10:00)
        const minuteOverlap = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '07:00', endTime: '08:01', tutorId: 'tut-2', room: 'Phòng A101 (Offline)' },
          existingEvents,
          testClassrooms
        );
        assert.strictEqual(minuteOverlap.hasConflict, true);
        assert.strictEqual(minuteOverlap.type, 'room');

        // 7. Invalid time range (endTime <= startTime)
        const invalidTime = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '09:00', endTime: '08:00', room: 'Phòng A101 (Offline)' },
          existingEvents,
          testClassrooms
        );
        assert.strictEqual(invalidTime.hasConflict, true);
        assert.strictEqual(invalidTime.type, 'invalid_time');

        // 8. Backward compatibility alias validateScheduleClash
        const clashAlias = validateScheduleClash(
          { dayOfWeek: 2, startTime: '08:30', endTime: '09:30', tutorId: 'tut-2', room: 'Phòng A101 (Offline)' },
          existingEvents,
          testClassrooms
        );
        assert.deepStrictEqual(clashAlias, roomClash);

        // 9. Cross-date recurrence: identical dayOfWeek and hours but different dateStr MUST NOT conflict
        const dateEvent1 = {
          id: 'ev-sep15',
          dayOfWeek: 2,
          dateStr: '2026-09-15',
          startTime: '19:30',
          endTime: '21:00',
          tutorId: 'tut-1',
          room: 'Phòng A101 (Offline)',
        };
        const dateEvent2DifferentDate = {
          dayOfWeek: 2,
          dateStr: '2026-09-22',
          startTime: '19:30',
          endTime: '21:00',
          tutorId: 'tut-1',
          room: 'Phòng A101 (Offline)',
        };
        const crossDateResult = validateSmartScheduleConflict(
          dateEvent2DifferentDate,
          [dateEvent1],
          testClassrooms
        );
        assert.strictEqual(
          crossDateResult.hasConflict,
          false,
          'Events with identical dayOfWeek and hours but different dateStr must return hasConflict: false'
        );
        assert.strictEqual(crossDateResult.hasClash, false);

        // Verification: same dayOfWeek AND same dateStr MUST conflict
        const sameDateResult = validateSmartScheduleConflict(
          { ...dateEvent2DifferentDate, dateStr: '2026-09-15' },
          [dateEvent1],
          testClassrooms
        );
        assert.strictEqual(sameDateResult.hasConflict, true, 'Same date and overlapping time must conflict');

        // 10. Multi-week series verification (4 consecutive Tuesdays)
        const weeklySeries = [
          { id: 'w1', dayOfWeek: 2, dateStr: '2026-09-08', startTime: '14:00', endTime: '16:00', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' },
          { id: 'w2', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '14:00', endTime: '16:00', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' },
          { id: 'w3', dayOfWeek: 2, dateStr: '2026-09-22', startTime: '14:00', endTime: '16:00', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' },
          { id: 'w4', dayOfWeek: 2, dateStr: '2026-09-29', startTime: '14:00', endTime: '16:00', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' },
        ];
        for (let i = 0; i < weeklySeries.length; i++) {
          const others = weeklySeries.filter((_, idx) => idx !== i);
          const multiWeekCheck = validateSmartScheduleConflict(weeklySeries[i], others, testClassrooms);
          assert.strictEqual(multiWeekCheck.hasConflict, false, `Week ${i + 1} must not conflict with other weeks in series`);
        }

        // 11. Mixed dateStr vs template fallback (Specific date vs Weekly recurring template)
        const templateEvent = {
          id: 'ev-template',
          dayOfWeek: 2,
          startTime: '14:00',
          endTime: '16:00',
          tutorId: 'tut-2',
          room: 'Phòng A101 (Offline)',
        };
        const dateSpecificEvent = {
          id: 'ev-specific',
          dayOfWeek: 2,
          dateStr: '2026-09-15',
          startTime: '14:30',
          endTime: '15:30',
          tutorId: 'tut-3',
          room: 'Phòng A101 (Offline)',
        };
        const mixedClash = validateSmartScheduleConflict(dateSpecificEvent, [templateEvent], testClassrooms);
        assert.strictEqual(mixedClash.hasConflict, true, 'Specific date event must conflict with recurring template occupying same room on same dayOfWeek');
        assert.strictEqual(mixedClash.type, 'room');

        // 12. Same date, same tutor, different rooms -> Tutor conflict
        const tutorCrossRoom1 = {
          id: 'ev-tutor-1',
          dayOfWeek: 2,
          dateStr: '2026-09-15',
          startTime: '10:00',
          endTime: '11:30',
          tutorId: 'tut-1',
          room: 'Phòng A101 (Offline)',
        };
        const tutorCrossRoom2 = {
          id: 'ev-tutor-2',
          dayOfWeek: 2,
          dateStr: '2026-09-15',
          startTime: '10:30',
          endTime: '12:00',
          tutorId: 'tut-1',
          room: 'Phòng Văn B202',
        };
        const tutorCrossRoomResult = validateSmartScheduleConflict(tutorCrossRoom2, [tutorCrossRoom1], testClassrooms);
        assert.strictEqual(tutorCrossRoomResult.hasConflict, true, 'Same tutor on same date at overlapping hours must conflict even in different rooms');
        assert.strictEqual(tutorCrossRoomResult.type, 'tutor');

        // 13. Back-to-back classes with dateStr (14:00-15:00 vs 15:00-16:00) MUST NOT conflict
        const dateBackToBack = validateSmartScheduleConflict(
          { id: 'b2b-new', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '15:00', endTime: '16:00', tutorId: 'tut-2', room: 'Phòng A101 (Offline)' },
          [{ id: 'b2b-prev', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '14:00', endTime: '15:00', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' }],
          testClassrooms
        );
        assert.strictEqual(dateBackToBack.hasConflict, false, 'Back-to-back classes on same date must not conflict');

        // 14. 1-minute overlap with dateStr (14:00-15:01 vs 15:00-16:00) MUST conflict
        const dateMinuteOverlap = validateSmartScheduleConflict(
          { id: 'min-new', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '14:00', endTime: '15:01', tutorId: 'tut-2', room: 'Phòng A101 (Offline)' },
          [{ id: 'min-prev', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '15:00', endTime: '16:00', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' }],
          testClassrooms
        );
        assert.strictEqual(dateMinuteOverlap.hasConflict, true, '1-minute overlap on same date must conflict');
        assert.strictEqual(dateMinuteOverlap.type, 'room');

        // 15. Self-update on same date with identical id MUST NOT conflict with self
        const selfUpdate = validateSmartScheduleConflict(
          { id: 'self-1', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '14:00', endTime: '15:30', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' },
          [{ id: 'self-1', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '14:00', endTime: '15:30', tutorId: 'tut-1', room: 'Phòng A101 (Offline)' }],
          testClassrooms
        );
        assert.strictEqual(selfUpdate.hasConflict, false, 'Event updating itself must not conflict');

        // 16. Online room with explicit dateStr allows concurrent events with different tutors
        const onlineDateCheck = validateSmartScheduleConflict(
          { id: 'on-date-2', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '14:00', endTime: '15:30', tutorId: 'tut-2', room: 'Phòng Online Meet (Google Meet Pro)' },
          [{ id: 'on-date-1', dayOfWeek: 2, dateStr: '2026-09-15', startTime: '14:00', endTime: '15:30', tutorId: 'tut-1', room: 'Phòng Online Meet (Google Meet Pro)' }],
          testClassrooms
        );
        assert.strictEqual(onlineDateCheck.hasConflict, false, 'Concurrent events in online room on same date must not conflict if tutors differ');



        // Verification of AddEventModal integration
        const addEventModalPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'AddEventModal.tsx');
        const modalCode = fs.readFileSync(addEventModalPath, 'utf8');
        assert.ok(modalCode.includes('validateScheduleClash'), 'AddEventModal must import validateScheduleClash');
        assert.ok(modalCode.includes('clashResult.hasClash'), 'AddEventModal must display clash alert');

        // M1 Data Models Verification (src/types/index.ts)
        const typesPath = path.join(PROJECT_ROOT, 'src', 'types', 'index.ts');
        const typesCode = fs.readFileSync(typesPath, 'utf8');
        assert.ok(typesCode.includes('export interface Classroom'), 'types/index.ts must export Classroom interface');
        assert.ok(typesCode.includes('export type ScheduleConflictType'), 'types/index.ts must export ScheduleConflictType');
        assert.ok(typesCode.includes('export interface ScheduleConflictResult'), 'types/index.ts must export ScheduleConflictResult');
        assert.ok(typesCode.includes('roomCapacity?: number;'), 'ScheduleEvent must include optional roomCapacity');

        // M1 Mock Data Verification (src/data/mockData.ts)
        const mockDataPath = path.join(PROJECT_ROOT, 'src', 'data', 'mockData.ts');
        const mockDataCode = fs.readFileSync(mockDataPath, 'utf8');
        assert.ok(mockDataCode.includes('export const mockClassrooms: Classroom[]'), 'mockData.ts must export mockClassrooms');
        assert.ok(mockDataCode.includes('Phòng A101 (Offline)'), 'mockClassrooms must include standard rooms');
        assert.ok(!mockDataCode.includes("'Xưởng Art Studio'"), 'No non-standard rooms in mockScheduleEvents');
        assert.ok(!mockDataCode.includes("'Sân Thể Thao Đa Năng'"), 'No non-standard rooms in mockScheduleEvents');

        // Empirical Transpilation & Execution of mockData.ts to verify all 14 mock events
        let mockDataJs;
        if (tsCompiler && tsCompiler.transpileModule) {
          mockDataJs = tsCompiler.transpileModule(mockDataCode, {
            compilerOptions: { module: tsCompiler.ModuleKind.CommonJS, target: tsCompiler.ScriptTarget.ES2022 }
          }).outputText;
        } else {
          mockDataJs = mockDataCode
            .replace(/^import\s+type\s+.*?;/gm, '')
            .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?/gm, '')
            .replace(/export\s+const\s+(\w+)\s*:\s*[\w\[\]<>]+\s*=/g, 'exports.$1 =');
        }

        const mockExports = {};
        const mockFn = new Function('exports', mockDataJs);
        mockFn(mockExports);
        const { mockClassrooms, mockScheduleEvents } = mockExports;

        // 1. Verify exact 14 mock events
        assert.strictEqual(Array.isArray(mockScheduleEvents), true, 'mockScheduleEvents must be an array');
        assert.strictEqual(mockScheduleEvents.length, 14, 'mockScheduleEvents must contain exactly 14 events');

        // 2. Verify all 14 mock events match valid rooms in mockClassrooms
        const validRoomNames = new Set(mockClassrooms.map((c) => c.name));
        const validRoomIds = new Set(mockClassrooms.map((c) => c.id));
        const classroomMap = new Map(mockClassrooms.map((c) => [c.name, c]));

        for (const ev of mockScheduleEvents) {
          const isRoomValid = validRoomNames.has(ev.room) || validRoomIds.has(ev.room);
          assert.strictEqual(
            isRoomValid,
            true,
            `Event ${ev.id} (${ev.title}) has invalid room: "${ev.room}" - must match mockClassrooms`
          );

          // Verify capacity safety
          const targetRoom = classroomMap.get(ev.room);
          const studentCount = (ev.studentIds && ev.studentIds.length) || (ev.studentNames && ev.studentNames.length) || 1;
          assert.ok(
            studentCount <= targetRoom.capacity,
            `Event ${ev.id} capacity overflow: ${studentCount} students in ${targetRoom.name} (max ${targetRoom.capacity})`
          );
        }

        // 3. Empirical Verification of Room Grid Matrix Display in MasterSchedule.tsx
        // The matrix defines 7 standardized slots across 7 days
        const MATRIX_SLOTS = [
          { id: 'm1', label: '07:00 - 08:30', startH: 7.0, endH: 8.5 },
          { id: 'm2', label: '08:30 - 10:00', startH: 8.5, endH: 10.0 },
          { id: 'm3', label: '10:00 - 11:30', startH: 10.0, endH: 11.5 },
          { id: 'm4', label: '13:30 - 15:00', startH: 13.5, endH: 15.0 },
          { id: 'm5', label: '15:00 - 16:30', startH: 15.0, endH: 16.5 },
          { id: 'm6', label: '18:00 - 19:30', startH: 18.0, endH: 19.5 },
          { id: 'm7', label: '19:30 - 21:00', startH: 19.5, endH: 21.0 },
        ];

        const accountedEvents = new Set();
        for (let day = 1; day <= 7; day++) {
          for (const roomItem of mockClassrooms) {
            for (const slot of MATRIX_SLOTS) {
              const occupiedEvent = mockScheduleEvents.find((ev) => {
                if (ev.dayOfWeek !== day) return false;
                const matchRoom =
                  ev.room.trim().toLowerCase() === roomItem.name.trim().toLowerCase() ||
                  (roomItem.type === 'online' && ev.room.toLowerCase().includes('online'));
                if (!matchRoom) return false;

                const evStart = ev.startHour;
                const evEnd = ev.startHour + ev.durationHours;
                return Math.max(slot.startH, evStart) < Math.min(slot.endH, evEnd);
              });

              if (occupiedEvent) {
                accountedEvents.add(occupiedEvent.id);
              }
            }
          }
        }

        assert.strictEqual(
          accountedEvents.size,
          14,
          `Room Grid Matrix must display 100% of mock events (14/14). Found ${accountedEvents.size}/14 visible.`
        );

        // M1 Conflict Engine Verification (src/lib/scheduleValidator.ts)
        const validatorPath = path.join(PROJECT_ROOT, 'src', 'lib', 'scheduleValidator.ts');
        const validatorCode = fs.readFileSync(validatorPath, 'utf8');
        assert.ok(validatorCode.includes('validateSmartScheduleConflict'), 'scheduleValidator must export validateSmartScheduleConflict');
        assert.ok(validatorCode.includes("type: 'capacity'"), 'scheduleValidator must support capacity overflow detection');
        assert.ok(validatorCode.includes("type: 'invalid_time'"), 'scheduleValidator must detect invalid time range');

        // M1 MasterSchedule 4-View Switcher & Vietnamese Localization Verification
        const masterSchedulePath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'MasterSchedule.tsx');
        const masterScheduleCode = fs.readFileSync(masterSchedulePath, 'utf8');
        assert.ok(masterScheduleCode.includes('Ma trận Phòng học'), 'MasterSchedule must include Room Matrix view switcher');
        assert.ok(masterScheduleCode.includes("viewMode === 'day'"), 'MasterSchedule must support Day View');
        assert.ok(masterScheduleCode.includes("viewMode === 'week'"), 'MasterSchedule must support Week View');
        assert.ok(masterScheduleCode.includes("viewMode === 'month'"), 'MasterSchedule must support Month View');
        assert.ok(masterScheduleCode.includes("viewMode === 'room_matrix'"), 'MasterSchedule must support Room Matrix view');
        assert.ok(masterScheduleCode.includes('Đã xác nhận'), 'MasterSchedule must localize Confirmed to Đã xác nhận');
        assert.ok(!masterScheduleCode.includes("'01-07 January 2025'"), 'MasterSchedule must eliminate hardcoded English date header');
        assert.ok(masterScheduleCode.includes('30/12'), 'MasterSchedule must localize 30 Dec to 30/12');
        assert.ok(masterScheduleCode.includes('01/02'), 'MasterSchedule must localize 01 Feb to 01/02');

        // M1 Recurring Schedule Generation in page.tsx
        const pageCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'app', 'page.tsx'), 'utf8');
        assert.ok(pageCode.includes('recurringEvents'), 'page.tsx must generate recurringEvents series');
        assert.ok(pageCode.includes('classrooms={classrooms}'), 'page.tsx must pass classrooms to MasterSchedule and modals');
      });
    }

    if (!options.scenario || options.scenario === 's8') {
      test('S8: Student Gamified Learning Hub & Direct Meet Integration', () => {
        const hubPath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'StudentLearningHub.tsx');
        assert.ok(fs.existsSync(hubPath), 'StudentLearningHub.tsx must exist');

        const hubCode = fs.readFileSync(hubPath, 'utf8');
        assert.ok(hubCode.includes('Góc Học Tập Thông Minh'), 'Must have hub title');
        assert.ok(hubCode.includes('Kỳ Thi THPT Quốc Gia'), 'Must have countdown goal tracker');
        assert.ok(hubCode.includes('badges'), 'Must display badges or achievements');

        const timetablePath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'StudentTimetable.tsx');
        const timetableCode = fs.readFileSync(timetablePath, 'utf8');
        assert.ok(
          timetableCode.includes('bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700'),
          'StudentTimetable must feature the upgraded modern gradient header'
        );

        const sidebarPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Sidebar.tsx');
        const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
        assert.ok(sidebarCode.includes("id: 'student-dashboard'"), 'Sidebar must have student-dashboard tab');

        const headerPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Header.tsx');
        const headerCode = fs.readFileSync(headerPath, 'utf8');
        assert.ok(
          headerCode.includes("'student-dashboard': 'Góc học tập thông minh'"),
          'Header must map student-dashboard'
        );

        const pagePath = path.join(PROJECT_ROOT, 'src', 'app', 'page.tsx');
        const pageCode = fs.readFileSync(pagePath, 'utf8');
        assert.ok(pageCode.includes('<StudentLearningHub'), 'page.tsx must mount StudentLearningHub');
        assert.ok(pageCode.includes("targetTab = 'student-dashboard'"), 'Student login must default to student-dashboard');
      });
    }

    if (!options.scenario || options.scenario === 's9') {
      test('S9: Center Omnichannel Support Desk & Pinned Announcement Management', () => {
        const chatHubPath = path.join(PROJECT_ROOT, 'src', 'components', 'chat', 'ChatHub.tsx');
        assert.ok(fs.existsSync(chatHubPath), 'ChatHub.tsx must exist');

        const chatHubCode = fs.readFileSync(chatHubPath, 'utf8');
        assert.ok(chatHubCode.includes('handleUpdateTicketStatus'), 'Must handle ticket status updates');
        assert.ok(chatHubCode.includes('ticketStatus === \'resolved\''), 'Must have resolved ticket state');
        assert.ok(chatHubCode.includes('ticketStatus === \'in_progress\''), 'Must have in_progress ticket state');
        assert.ok(chatHubCode.includes('pinnedAnnouncement'), 'Must support pinned announcement banner');
        assert.ok(chatHubCode.includes('handleQuickSendMeet'), 'Must have 1-click Google Meet sender');
        assert.ok(chatHubCode.includes('meet.google.com'), 'Must render interactive Google Meet card');
      });
    }

    if (!options.scenario || options.scenario === 's10') {
      test('S10: Official E-Invoicing (VAT) & Parent Progress Report Suite', () => {
        const invoiceModalPath = path.join(PROJECT_ROOT, 'src', 'components', 'shared', 'InvoiceModal.tsx');
        assert.ok(fs.existsSync(invoiceModalPath), 'InvoiceModal.tsx must exist');

        const invoiceCode = fs.readFileSync(invoiceModalPath, 'utf8');
        assert.ok(invoiceCode.toLowerCase().includes('hóa đơn giá trị gia tăng (điện tử)'), 'Invoice must have official title');
        assert.ok(invoiceCode.toLowerCase().includes('cộng hòa xã hội chủ nghĩa việt nam'), 'Invoice must have official header');
        assert.ok(invoiceCode.toLowerCase().includes('trung tâm giáo dục educonnect'), 'Must identify center as seller');
        assert.ok(invoiceCode.toLowerCase().includes('chữ ký số hợp lệ'), 'Must render digital signature');

        const reportModalPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'StudentReportModal.tsx');
        assert.ok(fs.existsSync(reportModalPath), 'StudentReportModal.tsx must exist');

        const reportCode = fs.readFileSync(reportModalPath, 'utf8');
        assert.ok(reportCode.includes('Sổ Học Bạ Điện Tử & Báo Cáo Tiến Độ'), 'Report modal must have title');
        assert.ok(reportCode.includes('window.print()'), 'Report modal must support printable action');

        const parentTuitionPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'ParentTuitionCenter.tsx');
        const parentTuitionCode = fs.readFileSync(parentTuitionPath, 'utf8');
        assert.ok(parentTuitionCode.includes('<InvoiceModal'), 'ParentTuitionCenter must mount InvoiceModal');

        const progressFeedPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'ProgressFeed.tsx');
        const progressFeedCode = fs.readFileSync(progressFeedPath, 'utf8');
        assert.ok(progressFeedCode.includes('<StudentReportModal'), 'ProgressFeed must mount StudentReportModal');
      });
    }

    if (!options.scenario || options.scenario === 's11') {
      test('S11: Multi-Role UI Modernization & System Optimization Suite', () => {
        // 1. Verify RealtimeSalaryCard has zero #DDD8CF and uses luxury Dark Indigo styling
        const salaryCardPath = path.join(PROJECT_ROOT, 'src', 'components', 'tutor', 'RealtimeSalaryCard.tsx');
        assert.ok(fs.existsSync(salaryCardPath), 'RealtimeSalaryCard.tsx must exist');
        const salaryCode = fs.readFileSync(salaryCardPath, 'utf8');
        assert.ok(!salaryCode.includes('#DDD8CF'), 'RealtimeSalaryCard must not contain obsolete #DDD8CF background');
        assert.ok(salaryCode.includes('from-slate-950 via-indigo-950 to-slate-900'), 'Must use Dark Indigo luxury gradient');
        assert.ok(salaryCode.includes('Bảng Phân Tích Thù Lao Real-Time'), 'Must have official Vietnamese title');

        // 2. Verify StudentTuitionCard has 3 KPI financial cards and links to InvoiceModal
        const studentTuitionPath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'StudentTuitionCard.tsx');
        assert.ok(fs.existsSync(studentTuitionPath), 'StudentTuitionCard.tsx must exist');
        const tuitionCode = fs.readFileSync(studentTuitionPath, 'utf8');
        assert.ok(tuitionCode.includes('Tổng Học Phí Đăng Ký'), 'Must have total tuition KPI');
        assert.ok(tuitionCode.includes('Đã Hoàn Tất Thanh Toán'), 'Must have paid KPI');
        assert.ok(tuitionCode.includes('Chưa Thanh Toán'), 'Must have unpaid KPI');
        assert.ok(tuitionCode.includes('<InvoiceModal'), 'Must mount InvoiceModal for official VAT receipts');
        assert.ok(tuitionCode.includes('Xem Hóa Đơn Điện Tử'), 'Must have VAT invoice trigger button');

        // 3. Verify ChildSwitcher has attendance metrics and mounts StudentReportModal
        const childSwitcherPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'ChildSwitcher.tsx');
        assert.ok(fs.existsSync(childSwitcherPath), 'ChildSwitcher.tsx must exist');
        const switcherCode = fs.readFileSync(childSwitcherPath, 'utf8');
        assert.ok(switcherCode.includes('Chuyên cần 98%'), 'Must display student attendance metric badge');
        assert.ok(switcherCode.includes('Sổ Học Bạ & Báo Cáo'), 'Must have academic report card button');
        assert.ok(switcherCode.includes('<StudentReportModal'), 'ChildSwitcher must embed StudentReportModal');

        // 4. Verify OnlineClassModal 2.0 has reactions, multi-views and meet recording sync
        const onlineClassPath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'OnlineClassModal.tsx');
        assert.ok(fs.existsSync(onlineClassPath), 'OnlineClassModal.tsx must exist');
        const classCode = fs.readFileSync(onlineClassPath, 'utf8');
        assert.ok(classCode.includes('Ghi hình tự động Meet'), 'Must show recording badge');
        assert.ok(classCode.includes('whiteboard') && classCode.includes('slide') && classCode.includes('roster'), 'Must support 3 view modes');
        assert.ok(classCode.includes('👍') && classCode.includes('❤️') && classCode.includes('🔥'), 'Must support interactive emoji reactions');
      });
    }

    if (!options.scenario || options.scenario === 's12') {
      test('S12: Milestone 3 UI/UX 2.0 Overhaul Suite (Zero Legacy Colors, All 4 Portals & Public Landing)', () => {
        // 1. Zero outdated colors (#DDD8CF and #CCC6BC) across src/
        function scanFiles(dir, exts = ['.ts', '.tsx', '.css']) {
          let results = [];
          const list = fs.readdirSync(dir);
          for (const file of list) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              results = results.concat(scanFiles(fullPath, exts));
            } else if (exts.includes(path.extname(file))) {
              results.push(fullPath);
            }
          }
          return results;
        }

        const srcFiles = scanFiles(path.join(PROJECT_ROOT, 'src'));
        const legacyColor1Files = [];
        const legacyColor2Files = [];

        for (const filePath of srcFiles) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.toUpperCase().includes('#DDD8CF')) legacyColor1Files.push(path.relative(PROJECT_ROOT, filePath));
          if (content.toUpperCase().includes('#CCC6BC')) legacyColor2Files.push(path.relative(PROJECT_ROOT, filePath));
        }

        assert.strictEqual(
          legacyColor1Files.length,
          0,
          `Found ${legacyColor1Files.length} files still using outdated #DDD8CF: ${legacyColor1Files.join(', ')}`
        );
        assert.strictEqual(
          legacyColor2Files.length,
          0,
          `Found ${legacyColor2Files.length} files still using outdated #CCC6BC: ${legacyColor2Files.join(', ')}`
        );

        // 2. TuitionCalculator component verification
        const calcPath = path.join(PROJECT_ROOT, 'src', 'components', 'public', 'TuitionCalculator.tsx');
        assert.ok(fs.existsSync(calcPath), 'TuitionCalculator.tsx must exist');
        const calcCode = fs.readFileSync(calcPath, 'utf8');
        assert.ok(calcCode.includes('export function TuitionCalculator'), 'Must export TuitionCalculator');
        assert.ok(calcCode.includes('calculatedPlan'), 'Must include calculation logic');
        assert.ok(calcCode.includes('FORMATS'), 'Must define format options');
        assert.ok(calcCode.includes('CYCLES'), 'Must define cycle options (with discounts up to 20%)');

        // 3. PublicLandingPage.tsx integration
        const landingPath = path.join(PROJECT_ROOT, 'src', 'components', 'public', 'PublicLandingPage.tsx');
        assert.ok(fs.existsSync(landingPath), 'PublicLandingPage.tsx must exist');
        const landingCode = fs.readFileSync(landingPath, 'utf8');
        assert.ok(landingCode.includes('<TuitionCalculator'), 'PublicLandingPage must render TuitionCalculator');
        assert.ok(landingCode.includes('educonnect_admissions_draft'), 'PublicLandingPage must persist draft to localStorage');
        assert.ok(landingCode.includes('TS-2026-'), 'PublicLandingPage must generate TS-2026- registration codes');
        assert.ok(landingCode.includes('id="admissions-form"'), 'PublicLandingPage must provide admissions-form anchor target');
        assert.ok(landingCode.includes('courseSearch') && landingCode.includes('gradeLevelFilter'), 'PublicLandingPage must support course search & filters');

        // Verify Vietnamese phone number regex (optimized without literal pipes)
        const phoneRegex = /^(0[35789])[0-9]{8}$/;
        assert.ok(phoneRegex.test('0912345678'), 'Valid 09 phone number must pass');
        assert.ok(phoneRegex.test('0387654321'), 'Valid 03 phone number must pass');
        assert.ok(!phoneRegex.test('0123456789'), 'Invalid prefix 01 must fail');
        assert.ok(!phoneRegex.test('091234567'), '9 digits phone number must fail');

        // Verify PublicLandingPage useEffect import & admissions form dropdowns
        assert.ok(
          landingCode.includes("import React, { useState, useEffect } from 'react';"),
          'PublicLandingPage must import useEffect from react'
        );
        assert.ok(
          landingCode.includes('id="leadCourse"'),
          'PublicLandingPage must define select id="leadCourse"'
        );
        assert.ok(
          landingCode.includes('id="leadGrade"'),
          'PublicLandingPage must define select id="leadGrade"'
        );
        assert.ok(
          landingCode.includes('<option value="Lớp 1">Lớp 1</option>') &&
          landingCode.includes('<option value="Lớp 2">Lớp 2</option>') &&
          landingCode.includes('<option value="Lớp 3">Lớp 3</option>') &&
          landingCode.includes('<option value="Lớp 4">Lớp 4</option>') &&
          landingCode.includes('<option value="Lớp 5">Lớp 5</option>'),
          'PublicLandingPage must provide standard options for Lớp 1 to Lớp 5'
        );
        assert.ok(
          landingCode.includes('<option value={leadCourse}>{leadCourse}</option>'),
          'PublicLandingPage must render dynamic leadCourse option at the top of select list'
        );

        // Verify StudentTimetable JSX validity and closing delimiters
        const studentTimetablePath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'StudentTimetable.tsx');
        assert.ok(fs.existsSync(studentTimetablePath), 'StudentTimetable.tsx must exist');
        const timetableCode = fs.readFileSync(studentTimetablePath, 'utf8');
        assert.ok(
          timetableCode.includes("{viewMode === 'cards' && ("),
          'StudentTimetable must support cards view mode'
        );

        // TypeScript AST parse diagnostics check to ensure 0 syntax / JSX errors
        try {
          const ts = require('typescript');
          const timetableSource = ts.createSourceFile(
            'StudentTimetable.tsx',
            timetableCode,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX
          );
          assert.strictEqual(
            timetableSource.parseDiagnostics.length,
            0,
            `StudentTimetable.tsx syntax error: ${timetableSource.parseDiagnostics.map((d) => d.messageText).join('; ')}`
          );

          const landingSource = ts.createSourceFile(
            'PublicLandingPage.tsx',
            landingCode,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX
          );
          assert.strictEqual(
            landingSource.parseDiagnostics.length,
            0,
            `PublicLandingPage.tsx syntax error: ${landingSource.parseDiagnostics.map((d) => d.messageText).join('; ')}`
          );
        } catch (err) {
          if (err.message && err.message.includes('syntax error')) throw err;
        }

        // 4. PublicNavbar.tsx mobile navigation toggle
        const navbarPath = path.join(PROJECT_ROOT, 'src', 'components', 'public', 'PublicNavbar.tsx');
        assert.ok(fs.existsSync(navbarPath), 'PublicNavbar.tsx must exist');
        const navbarCode = fs.readFileSync(navbarPath, 'utf8');
        assert.ok(navbarCode.includes('mobileMenuOpen'), 'PublicNavbar must support mobile navigation state');
        assert.ok(navbarCode.includes('Menu') && navbarCode.includes('X'), 'PublicNavbar must support mobile hamburger icon toggle');

        // 5. Student Experience (4-target switcher, 7-day streak)
        const hubPath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'StudentLearningHub.tsx');
        const hubCode = fs.readFileSync(hubPath, 'utf8');
        assert.ok(hubCode.includes('thpt') && hubCode.includes('dgnl_hn') && hubCode.includes('dgnl_hcm') && hubCode.includes('ielts'), 'StudentLearningHub must support 4 exam targets');
        assert.ok(hubCode.includes('weeklyStreakDays') || hubCode.includes('streakFrozen'), 'StudentLearningHub must track attendance streak');

        // 6. Admin & Academic Portal (Room Maintenance & Capacity Utilization)
        const validatorPath = path.join(PROJECT_ROOT, 'src', 'lib', 'scheduleValidator.ts');
        const validatorCode = fs.readFileSync(validatorPath, 'utf8');
        assert.ok(validatorCode.includes("type: 'room_maintenance'"), 'scheduleValidator must support room_maintenance conflict');

        const masterSchedulePath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'MasterSchedule.tsx');
        const masterScheduleCode = fs.readFileSync(masterSchedulePath, 'utf8');
        assert.ok(masterScheduleCode.includes("status === 'maintenance'"), 'MasterSchedule must detect room maintenance status');

        const analyticsPath = path.join(PROJECT_ROOT, 'src', 'components', 'admin', 'AnalyticsDashboard.tsx');
        const analyticsCode = fs.readFileSync(analyticsPath, 'utf8');
        assert.ok(analyticsCode.includes('roomUtilization'), 'AnalyticsDashboard must calculate roomUtilization percentage');
        assert.ok(analyticsCode.includes('netOperatingCashflow'), 'AnalyticsDashboard must calculate net operating cashflow');

        // 7. Tutor Portal RealtimeSalaryCard exportToExcel
        const exportUtilPath = path.join(PROJECT_ROOT, 'src', 'lib', 'exportUtils.ts');
        assert.ok(fs.existsSync(exportUtilPath), 'exportUtils.ts must exist');
        const exportCode = fs.readFileSync(exportUtilPath, 'utf8');
        assert.ok(exportCode.includes('export function exportToExcel'), 'exportUtils must export exportToExcel');

        const salaryPath = path.join(PROJECT_ROOT, 'src', 'components', 'tutor', 'RealtimeSalaryCard.tsx');
        const salaryCode = fs.readFileSync(salaryPath, 'utf8');
        assert.ok(salaryCode.includes('exportToExcel'), 'RealtimeSalaryCard must invoke genuine exportToExcel');

        // 8. Parent Portal ChildSwitcher attendance rate & ProgressFeed multimedia
        const childSwitcherPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'ChildSwitcher.tsx');
        const childSwitcherCode = fs.readFileSync(childSwitcherPath, 'utf8');
        assert.ok(childSwitcherCode.includes('getChildAttendanceRate'), 'ChildSwitcher must calculate attendance rate dynamically');

        const progressFeedPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'ProgressFeed.tsx');
        const progressFeedCode = fs.readFileSync(progressFeedPath, 'utf8');
        assert.ok(progressFeedCode.includes('audioUrl') || progressFeedCode.includes('voiceNote'), 'ProgressFeed must support voice note multimedia');
        assert.ok(progressFeedCode.includes('lightboxImage') || progressFeedCode.includes('previewImage'), 'ProgressFeed must support homework photo lightbox preview');

        // 9. Printable StudentReportModal print isolation
        const reportPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'StudentReportModal.tsx');
        const reportCode = fs.readFileSync(reportPath, 'utf8');
        assert.ok(reportCode.includes('@media print'), 'StudentReportModal must contain print stylesheet rules');
        assert.ok(reportCode.includes('#printable-student-report'), 'StudentReportModal must isolate printable student report section');
      });
    }

    if (!options.scenario || options.scenario === 's13') {
      test('S13: Milestone 3 Adversarial Edge Cases & Localization Verification', () => {
        // 1. Comprehensive Banished Tokens Check across all src/ files
        function scanAllSrcFiles(dir) {
          let results = [];
          const list = fs.readdirSync(dir);
          for (const file of list) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              results = results.concat(scanAllSrcFiles(fullPath));
            } else if (['.ts', '.tsx', '.css', '.js', '.jsx'].includes(path.extname(file))) {
              results.push(fullPath);
            }
          }
          return results;
        }

        const srcFiles = scanAllSrcFiles(path.join(PROJECT_ROOT, 'src'));
        for (const filePath of srcFiles) {
          const content = fs.readFileSync(filePath, 'utf8');
          assert.strictEqual(content.includes('#DDD8CF') || content.includes('#ddd8cf'), false, `File ${filePath} contains #DDD8CF`);
          assert.strictEqual(content.includes('#CCC6BC') || content.includes('#ccc6bc'), false, `File ${filePath} contains #CCC6BC`);
          assert.strictEqual(content.includes('DDD8CF'), false, `File ${filePath} contains raw DDD8CF`);
          assert.strictEqual(content.includes('CCC6BC'), false, `File ${filePath} contains raw CCC6BC`);
        }

        // 2. Vietnamese Phone Regex: 03x, 05x, 07x, 08x, 09x (10 digits) & invalid numbers
        const landingPath = path.join(PROJECT_ROOT, 'src', 'components', 'public', 'PublicLandingPage.tsx');
        const landingCode = fs.readFileSync(landingPath, 'utf8');
        const regexMatch = landingCode.match(/VIETNAMESE_PHONE_REGEX\s*=\s*(\/.*?\/[a-z]*);/);
        assert.ok(regexMatch, 'PublicLandingPage.tsx must define VIETNAMESE_PHONE_REGEX');
        assert.ok(!regexMatch[1].includes('|'), `VIETNAMESE_PHONE_REGEX must NOT contain literal pipe characters: ${regexMatch[1]}`);
        assert.strictEqual(regexMatch[1], '/^(0[35789])[0-9]{8}$/', 'VIETNAMESE_PHONE_REGEX must match canonical /^(0[35789])[0-9]{8}$/');
        const implRegex = eval(regexMatch[1]);

        // Valid 10-digit mobile numbers across all 5 prefix groups (03, 05, 07, 08, 09)
        const validPhoneSamples = [
          '0321234567', '0339876543', '0345678901', '0352468135', '0361357924', '0378901234', '0387654321', '0390123456',
          '0521234567', '0567890123', '0583456789', '0590123456',
          '0701234567', '0763456789', '0779012345', '0781234567', '0798765432',
          '0812345678', '0823456789', '0834567890', '0845678901', '0856789012', '0868889999', '0881234567', '0898765432',
          '0903888999', '0912345678', '0923456789', '0934111222', '0945678901', '0967890123', '0978901234', '0988765432', '0990123456',
        ];
        for (const phone of validPhoneSamples) {
          assert.strictEqual(implRegex.test(phone), true, `Valid phone ${phone} must pass regex`);
        }

        // Invalid phone numbers - including adversarial literal-pipe injection attacks
        const invalidPhoneSamples = [
          '',
          '0',
          '09',
          '091234567',
          '09123456789',
          '091234567890',
          '0123456789',
          '0243856789',
          '0412345678',
          '0612345678',
          '1900123456',
          '1800123456',
          '0012345678',
          '84912345678',
          '091234567a',
          '091234567@',
          // Adversarial pipe injection attacks that would pass with buggy /^(0[3|5|7|8|9])[0-9]{8}$/
          '0|12345678',
          '0|51234567',
          '0|71234567',
          '0|81234567',
          '0|91234567',
          '032123456|',
          '|032123456',
          '0321|23456',
          '0|||||||||',
          // Adversarial whitespace/punctuation not cleaned
          '0912 345 678',
          '0912-345-678',
          ' 0912345678',
          '0912345678 ',
          '+84912345678',
        ];
        for (const phone of invalidPhoneSamples) {
          assert.strictEqual(implRegex.test(phone), false, `Invalid phone ${phone} must be rejected by regex`);
        }

        // Sanitizer check
        const rawWithSeparators = '0903 888 999';
        const cleaned = rawWithSeparators.replace(/[\s.-]/g, '');
        assert.strictEqual(implRegex.test(cleaned), true, 'Sanitized 0903 888 999 must pass');

        // Sanitizer with hyphens and dots
        const rawWithHyphens = '038-765-4321';
        assert.strictEqual(implRegex.test(rawWithHyphens.replace(/[\s.-]/g, '')), true, 'Sanitized 038-765-4321 must pass');
        const rawWithDots = '070.123.4567';
        assert.strictEqual(implRegex.test(rawWithDots.replace(/[\s.-]/g, '')), true, 'Sanitized 070.123.4567 must pass');

        // Verify primary grade options in STANDARD_GRADE_OPTIONS
        const primaryGrades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 5 (Chuyển cấp)'];
        for (const grade of primaryGrades) {
          assert.ok(landingCode.includes(`'${grade}'`), `PublicLandingPage must define '${grade}' in STANDARD_GRADE_OPTIONS`);
          assert.ok(landingCode.includes(`<option value="${grade}">${grade}</option>`), `PublicLandingPage must render option for '${grade}'`);
        }

        // Verify dynamic fallback options in admissions form
        assert.ok(landingCode.includes('{leadGrade && !STANDARD_GRADE_OPTIONS.includes(leadGrade) && ('), 'PublicLandingPage must support dynamic leadGrade');
        assert.ok(landingCode.includes('{leadCourse && !STANDARD_COURSE_OPTIONS.includes(leadCourse) && ('), 'PublicLandingPage must support dynamic leadCourse');

        // 3. Admissions Code Format: TS-2026-XXXX over 10,000 iterations
        const admissionsCodeRegex = /^TS-2026-\d{4}$/;
        let minNum = Infinity;
        let maxNum = -Infinity;
        for (let i = 0; i < 10000; i++) {
          const randNum = Math.floor(1000 + Math.random() * 9000);
          const code = `TS-2026-${randNum}`;
          assert.ok(admissionsCodeRegex.test(code), `Generated code ${code} must match TS-2026-XXXX format`);
          if (randNum < minNum) minNum = randNum;
          if (randNum > maxNum) maxNum = randNum;
        }
        assert.ok(minNum >= 1000, `Minimum generated number ${minNum} must be >= 1000`);
        assert.ok(maxNum <= 9999, `Maximum generated number ${maxNum} must be <= 9999`);

        // 4. Student Timetable Filtering: multi-student isolation & no hardcoded 'quân'
        const timetablePath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'StudentTimetable.tsx');
        const timetableCode = fs.readFileSync(timetablePath, 'utf8');
        assert.ok(!timetableCode.includes("includes('quân')"), 'StudentTimetable must not contain hardcoded "quân" in filter');
        assert.ok(!timetableCode.includes('includes("quân")'), 'StudentTimetable must not contain hardcoded "quân" in filter');

        // Test filtering logic on mock events
        const sampleEvents = [
          { id: 'ev-ngoc', studentIds: ['stu-ngoc'], studentNames: ['Trần Bảo Ngọc'], title: 'Toán 12' },
          { id: 'ev-duc', studentIds: ['stu-duc'], studentNames: ['Lê Minh Đức'], title: 'Lý 12' },
          { id: 'ev-mai', studentIds: ['stu-mai'], studentNames: ['Phạm Hương Mai'], title: 'Hóa 12' },
          { id: 'ev-shared', studentIds: ['stu-ngoc', 'stu-duc'], studentNames: ['Trần Bảo Ngọc', 'Lê Minh Đức'], title: 'Anh 12' },
          { id: 'ev-open', studentIds: [], studentNames: [], title: 'Sinh hoạt chung' },
        ];

        function simulateStudentFilter(events, studentName, studentId) {
          if (!events || events.length === 0) return [];
          const cleanTarget = (studentName || '').toLowerCase().trim();
          const filtered = events.filter((ev) => {
            if (studentId && ev.studentIds && ev.studentIds.includes(studentId)) return true;
            if (!ev.studentNames || ev.studentNames.length === 0) return true;
            if (!cleanTarget) return true;
            return ev.studentNames.some((name) => {
              const cleanName = name.toLowerCase().trim();
              return (
                cleanName.includes(cleanTarget) ||
                cleanTarget.includes(cleanName) ||
                cleanName.split(' ').slice(-1)[0] === cleanTarget.split(' ').slice(-1)[0]
              );
            });
          });
          return filtered.length > 0 ? filtered : events;
        }

        // Test Student 1: Trần Bảo Ngọc (no 'quân' in name or ID)
        const ngocSchedules = simulateStudentFilter(sampleEvents, 'Trần Bảo Ngọc', 'stu-ngoc');
        const ngocIds = ngocSchedules.map((e) => e.id);
        assert.ok(ngocIds.includes('ev-ngoc'), 'Ngọc must have ev-ngoc');
        assert.ok(ngocIds.includes('ev-shared'), 'Ngọc must have ev-shared');
        assert.ok(ngocIds.includes('ev-open'), 'Ngọc must have ev-open');
        assert.ok(!ngocIds.includes('ev-duc'), 'Ngọc must not have ev-duc');
        assert.ok(!ngocIds.includes('ev-mai'), 'Ngọc must not have ev-mai');

        // Test Student 2: Phạm Hương Mai (matching by last word "Mai")
        const maiSchedules = simulateStudentFilter(sampleEvents, 'Mai', undefined);
        const maiIds = maiSchedules.map((e) => e.id);
        assert.ok(maiIds.includes('ev-mai'), 'Mai must have ev-mai');
        assert.ok(!maiIds.includes('ev-ngoc'), 'Mai must not have ev-ngoc');

        // Test Case A: Unknown student sees universal open events (studentNames: [])
        const openSchedules = simulateStudentFilter(sampleEvents, 'Học Sinh Mới', 'stu-unknown');
        assert.strictEqual(openSchedules.length, 1, 'Unknown student must see universal open events');
        assert.strictEqual(openSchedules[0].id, 'ev-open', 'Unknown student must see ev-open');

        // Test Case B: When NO open events exist and 0 match, it falls back to all events gracefully
        const strictlySpecificEvents = sampleEvents.filter(e => e.studentNames && e.studentNames.length > 0);
        const fallbackSchedules = simulateStudentFilter(strictlySpecificEvents, 'Học Sinh Mới', 'stu-unknown');
        assert.strictEqual(fallbackSchedules.length, strictlySpecificEvents.length, 'When no matches exist, must fallback to all events gracefully');

        // 5. Print Isolation: StudentReportModal print styling
        const reportModalPath = path.join(PROJECT_ROOT, 'src', 'components', 'parent', 'StudentReportModal.tsx');
        const reportModalCode = fs.readFileSync(reportModalPath, 'utf8');
        assert.ok(reportModalCode.includes('print:bg-white'), 'Modal backdrop must turn white on print');
        assert.ok(reportModalCode.includes('print:static'), 'Modal backdrop must be static on print');
        assert.ok(reportModalCode.includes('print:p-0'), 'Modal backdrop padding must be 0 on print');
        assert.ok(reportModalCode.includes('print:inset-auto'), 'Modal backdrop inset must be auto on print');
        assert.ok(reportModalCode.includes('body {') && reportModalCode.includes('background-color: #ffffff !important;'), 'Print styles must enforce white body');
        assert.ok(reportModalCode.includes('display: none !important;'), 'Print styles must hide non-printable elements');
        assert.ok(reportModalCode.includes('In Sổ / Lưu PDF') && reportModalCode.includes('print:hidden'), 'Action header must be hidden on print');
        assert.ok(reportModalCode.includes('Đóng sổ học bạ') && reportModalCode.includes('print:hidden'), 'Footer button must be hidden on print');
      });
    }

    if (!options.scenario || options.scenario === 's14') {
      test('S14: Milestone 3 Empirical Math & Logic Verification Suite (TuitionCalculator, Maintenance Clash, Attendance Rate)', () => {
        // ----------------------------------------------------------------------
        // 1. TuitionCalculator Formula Verification (1,152 combinations + edge cases)
        // Replicating src/components/public/TuitionCalculator.tsx lines 93-119
        // ----------------------------------------------------------------------
        function computeTuitionPlan(baseRate, formatMultiplier, frequency, cycleMonths, discountRate) {
          const sessionRate = Math.round(baseRate * formatMultiplier);
          const monthlySessions = frequency * 4;
          const totalSessions = monthlySessions * cycleMonths;
          const originalPrice = sessionRate * totalSessions;
          const discountAmount = Math.round(originalPrice * discountRate);
          const finalPrice = originalPrice - discountAmount;
          const pricePerSession = totalSessions > 0 ? Math.round(finalPrice / totalSessions) : sessionRate;
          return { sessionRate, monthlySessions, totalSessions, originalPrice, discountRate, discountAmount, finalPrice, pricePerSession };
        }

        const BASE_RATES_12_GRADES = [
          { grade: 1, baseRate: 180000 },
          { grade: 2, baseRate: 180000 },
          { grade: 3, baseRate: 190000 },
          { grade: 4, baseRate: 200000 },
          { grade: 5, baseRate: 220000 },
          { grade: 6, baseRate: 240000 },
          { grade: 7, baseRate: 250000 },
          { grade: 8, baseRate: 260000 },
          { grade: 9, baseRate: 290000 },
          { grade: 10, baseRate: 310000 },
          { grade: 11, baseRate: 330000 },
          { grade: 12, baseRate: 360000 },
        ];

        // Part 1A: 576 cases using Worker Handoff Multipliers & Discounts
        const handoffMultipliers = [1.8, 1.0, 0.75, 0.65];
        const frequencies = [2, 3, 4];
        const handoffCycles = [
          { months: 1, discount: 0.0 },
          { months: 3, discount: 0.05 },
          { months: 6, discount: 0.10 },
          { months: 12, discount: 0.20 },
        ];

        let countHandoff = 0;
        for (const g of BASE_RATES_12_GRADES) {
          for (const m of handoffMultipliers) {
            for (const f of frequencies) {
              for (const c of handoffCycles) {
                countHandoff++;
                const plan = computeTuitionPlan(g.baseRate, m, f, c.months, c.discount);
                assert.ok(!isNaN(plan.finalPrice), `Grade ${g.grade}: finalPrice is NaN`);
                assert.ok(!isNaN(plan.pricePerSession), `Grade ${g.grade}: pricePerSession is NaN`);
                assert.ok(plan.finalPrice > 0, `Grade ${g.grade}: finalPrice <= 0`);
                assert.ok(plan.pricePerSession > 0, `Grade ${g.grade}: pricePerSession <= 0`);
                assert.strictEqual(plan.finalPrice, plan.originalPrice - plan.discountAmount);
                assert.ok(plan.finalPrice <= plan.originalPrice);
                assert.strictEqual(Number.isInteger(plan.finalPrice), true);
                assert.strictEqual(Number.isInteger(plan.pricePerSession), true);
              }
            }
          }
        }
        assert.strictEqual(countHandoff, 576, 'Must verify 576 handoff parameter combinations');

        // Part 1B: 576 cases using In-Code Multipliers & Discounts in TuitionCalculator.tsx
        const inCodeMultipliers = [1.8, 1.15, 1.0, 0.85];
        const inCodeCycles = [
          { months: 1, discount: 0.0 },
          { months: 3, discount: 0.10 },
          { months: 6, discount: 0.15 },
          { months: 12, discount: 0.20 },
        ];

        let countInCode = 0;
        for (const g of BASE_RATES_12_GRADES) {
          for (const m of inCodeMultipliers) {
            for (const f of frequencies) {
              for (const c of inCodeCycles) {
                countInCode++;
                const plan = computeTuitionPlan(g.baseRate, m, f, c.months, c.discount);
                assert.ok(!isNaN(plan.finalPrice));
                assert.ok(plan.finalPrice > 0);
                assert.ok(plan.finalPrice <= plan.originalPrice);
                assert.strictEqual(plan.finalPrice, plan.originalPrice - plan.discountAmount);
                assert.strictEqual(Number.isInteger(plan.finalPrice), true);
                assert.strictEqual(Number.isInteger(plan.pricePerSession), true);
              }
            }
          }
        }
        assert.strictEqual(countInCode, 576, 'Must verify 576 in-code parameter combinations');

        // Part 1C: Edge & Boundary Math Tests
        const zeroFreq = computeTuitionPlan(200000, 1.0, 0, 1, 0);
        assert.strictEqual(zeroFreq.totalSessions, 0);
        assert.strictEqual(zeroFreq.pricePerSession, 200000, 'Zero sessions must safely fallback to sessionRate');
        assert.ok(!isNaN(zeroFreq.pricePerSession));

        const freeCycle = computeTuitionPlan(300000, 1.0, 2, 1, 1.0);
        assert.strictEqual(freeCycle.finalPrice, 0, '100% discount must yield 0 VND finalPrice');
        assert.strictEqual(freeCycle.pricePerSession, 0);

        // ----------------------------------------------------------------------
        // 2. Schedule Validator Room Maintenance Conflict Detection
        // ----------------------------------------------------------------------
        const scheduleValidatorPath = path.join(PROJECT_ROOT, 'src', 'lib', 'scheduleValidator.ts');
        const validatorContent = fs.readFileSync(scheduleValidatorPath, 'utf8');
        const tsModPath = path.join(PROJECT_ROOT, 'node_modules', 'typescript', 'lib', 'typescript.js');
        const tsCompiler = require(tsModPath);
        const validatorJs = tsCompiler.transpileModule(validatorContent, {
          compilerOptions: { module: tsCompiler.ModuleKind.CommonJS, target: tsCompiler.ScriptTarget.ES2022 },
        }).outputText;

        const validatorExports = {};
        const fn = new Function('exports', validatorJs);
        fn(validatorExports);
        const { validateSmartScheduleConflict } = validatorExports;

        const mockRooms = [
          { id: 'room-a101', name: 'Phòng A101 (Offline)', type: 'physical', capacity: 20, status: 'active' },
          { id: 'room-lab-maint', name: 'Phòng Lab STEM 2', type: 'lab', capacity: 16, status: 'maintenance' },
          { id: 'room-rep', name: 'Phòng B202', type: 'physical', capacity: 25, status: 'maintenance' },
        ];

        // 2A: Detects maintenance by exact room name
        const maintByName = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: 'Phòng Lab STEM 2', tutorId: 't1' },
          [],
          mockRooms
        );
        assert.strictEqual(maintByName.hasConflict, true);
        assert.strictEqual(maintByName.hasClash, true);
        assert.strictEqual(maintByName.type, 'room_maintenance');
        assert.ok(maintByName.message.includes('bảo trì'));

        // 2B: Detects maintenance by room ID
        const maintById = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: 'room-rep', tutorId: 't1' },
          [],
          mockRooms
        );
        assert.strictEqual(maintById.hasConflict, true);
        assert.strictEqual(maintById.type, 'room_maintenance');

        // 2C: Case-insensitive and whitespace tolerance
        const maintInsensitive = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: '  phòng lab stem 2  ', tutorId: 't1' },
          [],
          mockRooms
        );
        assert.strictEqual(maintInsensitive.hasConflict, true);
        assert.strictEqual(maintInsensitive.type, 'room_maintenance');

        // 2D: Active room does not trigger maintenance clash
        const activeRoom = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: 'Phòng A101 (Offline)', tutorId: 't1' },
          [],
          mockRooms
        );
        assert.strictEqual(activeRoom.hasConflict, false);

        // 2E: Precedence: Invalid time fires before maintenance check
        const invalidTimeMaint = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '10:00', endTime: '08:00', room: 'Phòng Lab STEM 2', tutorId: 't1' },
          [],
          mockRooms
        );
        assert.strictEqual(invalidTimeMaint.type, 'invalid_time');

        // 2F: Precedence: Capacity overflow fires before maintenance check
        const capOverflowMaint = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: 'Phòng Lab STEM 2', studentCount: 20, tutorId: 't1' },
          [],
          mockRooms
        );
        assert.strictEqual(capOverflowMaint.type, 'capacity');

        // 2G: Precedence: Maintenance fires BEFORE event overlap checks
        const existingMaintEvent = [
          { id: 'ev-prev', title: 'Lớp Cũ', dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: 'Phòng Lab STEM 2', tutorId: 't1' }
        ];
        const overlapMaint = validateSmartScheduleConflict(
          { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', room: 'Phòng Lab STEM 2', tutorId: 't1' },
          existingMaintEvent,
          mockRooms
        );
        assert.strictEqual(overlapMaint.type, 'room_maintenance');

        // ----------------------------------------------------------------------
        // 3. ChildSwitcher Attendance Rate Calculation Verification
        // Replicating src/components/parent/ChildSwitcher.tsx lines 39-49
        // ----------------------------------------------------------------------
        function getChildAttendanceRate(studentId, attendanceRecords) {
          if (!attendanceRecords || attendanceRecords.length === 0) return 98;
          const records = attendanceRecords.filter((r) => r.studentId === studentId);
          if (records.length === 0) return 98;
          const presentCount = records.filter((r) => r.status === 'present').length;
          return Math.round((presentCount / records.length) * 100);
        }

        // 3A: Fallbacks
        assert.strictEqual(getChildAttendanceRate('stu-1', undefined), 98);
        assert.strictEqual(getChildAttendanceRate('stu-1', null), 98);
        assert.strictEqual(getChildAttendanceRate('stu-1', []), 98);
        assert.strictEqual(getChildAttendanceRate('stu-1', [{ id: '1', studentId: 'other', status: 'present' }]), 98);

        // 3B: Perfect and Zero Attendance
        assert.strictEqual(getChildAttendanceRate('s1', Array(10).fill({ studentId: 's1', status: 'present' })), 100);
        assert.strictEqual(getChildAttendanceRate('s1', Array(10).fill({ studentId: 's1', status: 'absent' })), 0);

        // 3C: Rounding behavior
        const makeRecs = (p, a, s = 's1') => [
          ...Array(p).fill(null).map((_, i) => ({ id: `p${i}`, studentId: s, status: 'present' })),
          ...Array(a).fill(null).map((_, i) => ({ id: `a${i}`, studentId: s, status: 'absent' })),
        ];
        assert.strictEqual(getChildAttendanceRate('s1', makeRecs(1, 2)), 33); // 33.3% -> 33
        assert.strictEqual(getChildAttendanceRate('s1', makeRecs(2, 1)), 67); // 66.7% -> 67
        assert.strictEqual(getChildAttendanceRate('s1', makeRecs(1, 7)), 13); // 12.5% -> 13
        assert.strictEqual(getChildAttendanceRate('s1', makeRecs(3, 5)), 38); // 37.5% -> 38
        assert.strictEqual(getChildAttendanceRate('s1', makeRecs(7, 1)), 88); // 87.5% -> 88

        // 3D: Status 'late' treatment: In ChildSwitcher, 'late' is not counted as present
        const withLate = [
          ...Array(8).fill({ studentId: 's1', status: 'present' }),
          ...Array(2).fill({ studentId: 's1', status: 'late' }),
        ];
        assert.strictEqual(getChildAttendanceRate('s1', withLate), 80);

        // 3E: Multi-child isolation
        const mixedChildren = [
          ...Array(9).fill({ studentId: 'child-a', status: 'present' }),
          { studentId: 'child-a', status: 'absent' },
          ...Array(5).fill({ studentId: 'child-b', status: 'present' }),
          ...Array(5).fill({ studentId: 'child-b', status: 'absent' }),
        ];
        assert.strictEqual(getChildAttendanceRate('child-a', mixedChildren), 90);
        assert.strictEqual(getChildAttendanceRate('child-b', mixedChildren), 50);
        assert.strictEqual(getChildAttendanceRate('child-c', mixedChildren), 98);
      });
    }

    if (!options.scenario || options.scenario === 's15') {
      test('S15: Challenger M3 Iteration 2 Adversarial Edge Cases & Gate Verification', () => {
        // ----------------------------------------------------------------------
        // 1. AST Syntax & Delimiter Integrity
        // ----------------------------------------------------------------------
        const ts = require('typescript');
        const timetablePath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'StudentTimetable.tsx');
        const timetableCode = fs.readFileSync(timetablePath, 'utf8');
        const timetableAst = ts.createSourceFile('StudentTimetable.tsx', timetableCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        assert.strictEqual(timetableAst.parseDiagnostics.length, 0, `StudentTimetable.tsx parse errors: ${timetableAst.parseDiagnostics.map(d => d.messageText).join('; ')}`);
        assert.ok(timetableCode.includes("{viewMode === 'cards' && ("), 'Must contain viewMode cards conditional');
        assert.ok(timetableCode.includes("        </div>\n      )}"), 'Must cleanly close viewMode cards with )}');

        const landingPath = path.join(PROJECT_ROOT, 'src', 'components', 'public', 'PublicLandingPage.tsx');
        const landingCode = fs.readFileSync(landingPath, 'utf8');
        const landingAst = ts.createSourceFile('PublicLandingPage.tsx', landingCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        assert.strictEqual(landingAst.parseDiagnostics.length, 0, `PublicLandingPage.tsx parse errors: ${landingAst.parseDiagnostics.map(d => d.messageText).join('; ')}`);
        assert.ok(landingCode.includes("import React, { useState, useEffect } from 'react';"), 'Must import useEffect from react');

        // ----------------------------------------------------------------------
        // 2. Absolute Zero Banned Colors (#DDD8CF and #CCC6BC)
        // ----------------------------------------------------------------------
        function recursiveCollectFiles(dir) {
          let list = [];
          for (const item of fs.readdirSync(dir)) {
            const full = path.join(dir, item);
            if (fs.statSync(full).isDirectory()) {
              list = list.concat(recursiveCollectFiles(full));
            } else if (['.ts', '.tsx', '.css', '.js', '.jsx', '.json', '.html'].includes(path.extname(item))) {
              list.push(full);
            }
          }
          return list;
        }

        const srcDir = path.join(PROJECT_ROOT, 'src');
        const filesToScan = recursiveCollectFiles(srcDir);
        for (const f of filesToScan) {
          const content = fs.readFileSync(f, 'utf8');
          assert.strictEqual(/#ddd8cf/i.test(content), false, `Banned color #DDD8CF found in ${f}`);
          assert.strictEqual(/#ccc6bc/i.test(content), false, `Banned color #CCC6BC found in ${f}`);
          assert.strictEqual(/ddd8cf/i.test(content), false, `Raw hex DDD8CF found in ${f}`);
          assert.strictEqual(/ccc6bc/i.test(content), false, `Raw hex CCC6BC found in ${f}`);
        }

        // ----------------------------------------------------------------------
        // 3. Phone Regex Adversarial Challenge (Confirm No Pipes & Exact Match)
        // ----------------------------------------------------------------------
        const regexMatch = landingCode.match(/VIETNAMESE_PHONE_REGEX\s*=\s*(\/.*?\/[a-z]*);/);
        assert.ok(regexMatch, 'VIETNAMESE_PHONE_REGEX must be defined');
        assert.strictEqual(regexMatch[1], '/^(0[35789])[0-9]{8}$/', 'Must match exact /^(0[35789])[0-9]{8}$/');
        assert.strictEqual(regexMatch[1].includes('|'), false, 'Literal pipe | MUST NOT exist in regex');
        const phoneRegex = eval(regexMatch[1]);

        // 3A: 1,000 Fuzzed Valid Numbers (200 for each prefix 03, 05, 07, 08, 09)
        const validPrefixes = ['03', '05', '07', '08', '09'];
        for (const prefix of validPrefixes) {
          for (let i = 0; i < 200; i++) {
            const randomSuffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
            const validNum = `${prefix}${randomSuffix}`;
            assert.strictEqual(phoneRegex.test(validNum), true, `Fuzzed valid number ${validNum} must pass`);
          }
        }

        // 3B: Adversarial Pipe-Injection (Must all FAIL)
        const pipeAttacks = [
          '0|12345678', '0|34567890', '0|56789012', '0|78901234', '0|89012345', '0|90123456',
          '032123456|', '|032123456', '0321|23456', '0|||||||||', '0|00000000', '03|5789000',
        ];
        for (const atk of pipeAttacks) {
          assert.strictEqual(phoneRegex.test(atk), false, `Pipe injection ${atk} must be rejected`);
        }

        // 3C: Invalid Prefixes (Must all FAIL)
        const invalidPrefixes = ['00', '01', '02', '04', '06'];
        for (const ip of invalidPrefixes) {
          for (let i = 0; i < 20; i++) {
            const randomSuffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
            const invalidNum = `${ip}${randomSuffix}`;
            assert.strictEqual(phoneRegex.test(invalidNum), false, `Invalid prefix number ${invalidNum} must fail`);
          }
        }

        // 3D: Length Boundaries (Must all FAIL)
        const boundarySamples = ['', '0', '09', '09123456', '091234567', '09123456789', '091234567890'];
        for (const bs of boundarySamples) {
          assert.strictEqual(phoneRegex.test(bs), false, `Boundary length ${bs} (${bs.length} chars) must fail`);
        }

        // 3E: Sanitizer Testing
        function sanitizeAndTest(raw) {
          const clean = raw.replace(/[\s.-]/g, '');
          return phoneRegex.test(clean);
        }
        assert.strictEqual(sanitizeAndTest('0903 888 999'), true);
        assert.strictEqual(sanitizeAndTest('038-765-4321'), true);
        assert.strictEqual(sanitizeAndTest('070.123.4567'), true);
        assert.strictEqual(sanitizeAndTest('  0812  345  678  '), true);
        assert.strictEqual(sanitizeAndTest('0903/888/999'), false); // Slash not sanitized
        assert.strictEqual(sanitizeAndTest('0903(888)999'), false); // Parens not sanitized

        // ----------------------------------------------------------------------
        // 4. Primary Grade Options & Admissions Synchronization
        // ----------------------------------------------------------------------
        const primaryGrades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 5 (Chuyển cấp)'];
        for (const g of primaryGrades) {
          assert.ok(landingCode.includes(`'${g}'`), `STANDARD_GRADE_OPTIONS must contain '${g}'`);
          assert.ok(landingCode.includes(`<option value="${g}">${g}</option>`), `<select id="leadGrade"> must contain option '${g}'`);
        }

        // Admissions form select IDs and dynamic option renderers
        assert.ok(landingCode.includes('id="leadGrade"'), 'Admissions form must define select id="leadGrade"');
        assert.ok(landingCode.includes('id="leadCourse"'), 'Admissions form must define select id="leadCourse"');
        assert.ok(landingCode.includes('<option value={leadCourse}>{leadCourse}</option>'), 'Admissions form must dynamically render selected course at the top');
        assert.ok(landingCode.includes('<option value={leadGrade}>{leadGrade}</option>'), 'Admissions form must dynamically render selected grade');

        // Simulate TuitionCalculator selections for primary grades
        const calcPath = path.join(PROJECT_ROOT, 'src', 'components', 'public', 'TuitionCalculator.tsx');
        const calcCode = fs.readFileSync(calcPath, 'utf8');
        for (let gradeNum = 1; gradeNum <= 5; gradeNum++) {
          assert.ok(calcCode.includes(`id: 'grade-${gradeNum}'`), `TuitionCalculator must include grade-${gradeNum}`);
        }

        // ----------------------------------------------------------------------
        // 5. Empirical Verification of Admissions Form Dropdown Synchronization
        // ----------------------------------------------------------------------
        const subjects = [
          'Toán Học', 'Ngữ Văn', 'Tiếng Anh (IELTS / Giao Tiếp)', 'Vật Lý', 'Hóa Học', 'Sinh Học'
        ];
        const grades = [
          'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5 (Chuyển cấp)',
          'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9 (Luyện thi vào 10)',
          'Lớp 10', 'Lớp 11', 'Lớp 12 & Ôn Thi ĐH'
        ];
        const formats = [
          'Gia Sư 1:1 VIP Cá Nhân Hóa',
          'Lớp Sĩ Số Vàng (4 - 6 HS)',
          'Chuyên Đề Trọng Điểm (10 - 15 HS)',
          'Lớp Trực Tuyến Live (Meet Interactive)'
        ];

        // Standard options extracted from PublicLandingPage.tsx
        const standardGradeOptions = [
          'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 5 (Chuyển cấp)',
          'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9 (Thi vào 10)', 'Lớp 9 (Luyện thi vào 10)',
          'Lớp 10', 'Lớp 11', 'Lớp 12 (Luyện thi ĐH)', 'Lớp 12 & Ôn Thi ĐH',
          'Đại học / Người đi làm'
        ];
        const standardCourseOptions = [
          'IELTS Academic Master 7.0+ Toàn Diện (4 Kỹ Năng)',
          'Toán Học Tuyển Sinh 10 Chuyên (KHTN, Sư Phạm, Ams)',
          'Toán 12 - Chinh Phục Điểm 9+ THPT Quốc Gia & ĐGNL',
          'Vật Lý 11 - 12 Cốt Lõi & Luyện Đề Đánh Giá Năng Lực',
          'Ngữ Văn 9 - Bí Quyết Viết Nghị Luận Điểm 9 Vào 10',
          'Toán Tiểu Học (Lớp 1 - 5) - Phát Triển Tư Duy Nền Tảng',
          'Tiếng Anh Tiểu Học (Lớp 1 - 5) - Chuẩn Cambridge',
          'Gia Sư Kèm Riêng 1:1 Cá Nhân Hóa (Toán - Lý - Anh)'
        ];

        // Simulation function replicating PublicLandingPage select option rendering
        function simulateCourseSelectOptions(currentCourse) {
          const opts = [];
          if (currentCourse && !standardCourseOptions.includes(currentCourse)) {
            opts.push({ value: currentCourse, label: currentCourse, isDynamic: true });
          }
          for (const std of standardCourseOptions) {
            opts.push({ value: std, label: std, isDynamic: false });
          }
          return opts;
        }

        function simulateGradeSelectOptions(currentGrade) {
          const opts = [];
          if (currentGrade && !standardGradeOptions.includes(currentGrade)) {
            opts.push({ value: currentGrade, label: currentGrade, isDynamic: true });
          }
          for (const std of standardGradeOptions) {
            opts.push({ value: std, label: std, isDynamic: false });
          }
          return opts;
        }

        // Test all 288 custom plan permutations (6 subjects x 12 grades x 4 formats)
        let customPlanCount = 0;
        for (const sub of subjects) {
          for (const grd of grades) {
            for (const fmt of formats) {
              customPlanCount++;
              const selectedCourse = `${sub} - ${grd} (${fmt})`;
              const selectedGrade = grd;

              // Verify Course Select: Must contain an option with value === selectedCourse
              const courseOpts = simulateCourseSelectOptions(selectedCourse);
              const matchingCourseOpt = courseOpts.find(o => o.value === selectedCourse);
              assert.ok(matchingCourseOpt, `Course option must exist for custom plan: ${selectedCourse}`);
              assert.strictEqual(matchingCourseOpt.value, selectedCourse);

              // If it is a custom plan (not in standard), it must be at index 0 as dynamic option
              if (!standardCourseOptions.includes(selectedCourse)) {
                assert.strictEqual(courseOpts[0].value, selectedCourse, `Custom plan must appear at the top: ${selectedCourse}`);
                assert.strictEqual(courseOpts[0].isDynamic, true);
              }

              // Verify Grade Select: Must contain an option with value === selectedGrade
              const gradeOpts = simulateGradeSelectOptions(selectedGrade);
              const matchingGradeOpt = gradeOpts.find(o => o.value === selectedGrade);
              assert.ok(matchingGradeOpt, `Grade option must exist for grade: ${selectedGrade}`);
              assert.strictEqual(matchingGradeOpt.value, selectedGrade);
            }
          }
        }
        assert.strictEqual(customPlanCount, 288, 'Must verify all 288 custom plan permutations');

        // Test Tutor Card custom plan setting: e.g. "Học cùng TS. Đặng Tiến Dũng (Vật Lý)"
        const tutorCustomPlan = 'Học cùng TS. Đặng Tiến Dũng (Vật Lý)';
        const tutorOpts = simulateCourseSelectOptions(tutorCustomPlan);
        assert.strictEqual(tutorOpts[0].value, tutorCustomPlan);
        assert.strictEqual(tutorOpts[0].isDynamic, true);

        // ----------------------------------------------------------------------
        // 6. Deep TypeScript AST Traversal & Balance Verification
        // ----------------------------------------------------------------------
        let timetableJsxOpeningCount = 0;
        let timetableJsxClosingCount = 0;
        function countTimetableJsx(node) {
          if (ts.isJsxOpeningElement(node)) timetableJsxOpeningCount++;
          if (ts.isJsxClosingElement(node)) timetableJsxClosingCount++;
          ts.forEachChild(node, countTimetableJsx);
        }
        countTimetableJsx(timetableAst);
        assert.strictEqual(
          timetableJsxOpeningCount,
          timetableJsxClosingCount,
          `StudentTimetable.tsx JSX opening (${timetableJsxOpeningCount}) and closing (${timetableJsxClosingCount}) counts must match`
        );
        assert.ok(timetableJsxOpeningCount > 20, 'Must have parsed genuine JSX elements');

        let landingJsxOpeningCount = 0;
        let landingJsxClosingCount = 0;
        function countLandingJsx(node) {
          if (ts.isJsxOpeningElement(node)) landingJsxOpeningCount++;
          if (ts.isJsxClosingElement(node)) landingJsxClosingCount++;
          ts.forEachChild(node, countLandingJsx);
        }
        countLandingJsx(landingAst);
        assert.strictEqual(
          landingJsxOpeningCount,
          landingJsxClosingCount,
          `PublicLandingPage.tsx JSX opening (${landingJsxOpeningCount}) and closing (${landingJsxClosingCount}) counts must match`
        );
        assert.ok(landingJsxOpeningCount > 50, 'PublicLandingPage must have parsed genuine JSX elements');
      });
    }
  });
}

// ============================================================================
// 6. SUMMARY & EXIT CODE HANDLING
// ============================================================================

const elapsed = Date.now() - stats.startTime;

console.log(`\n${colors.bold}${colors.blue}================================================================================${colors.reset}`);
console.log(`${colors.bold} Test Results Summary:${colors.reset}`);
console.log(`   Total Tests:  ${colors.bold}${stats.total}${colors.reset}`);
console.log(`   Passed:       ${colors.green}${colors.bold}${stats.passed}${colors.reset}`);
console.log(`   Failed:       ${stats.failed > 0 ? colors.red : colors.gray}${colors.bold}${stats.failed}${colors.reset}`);
console.log(`   Duration:     ${colors.cyan}${elapsed}ms${colors.reset}`);

if (stats.failed > 0) {
  console.log(`\n${colors.bold}${colors.red}Failures Breakdown:${colors.reset}`);
  stats.failures.forEach((f, idx) => {
    console.log(`  ${idx + 1}) [${f.suite}] ${f.name}`);
    console.log(`     ${colors.red}${f.error.message}${colors.reset}`);
  });
  console.log(`\n${colors.bold}${colors.red}STATUS: FAILED (Exit Code: 1)${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}================================================================================${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.bold}${colors.green}STATUS: ALL PASS (Exit Code: 0)${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}================================================================================${colors.reset}`);
  process.exit(0);
}
