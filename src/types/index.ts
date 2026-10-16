export type UserRole = 'admin' | 'tutor' | 'student' | 'parent';

export type AdminRole = 'super_admin' | 'academic_coordinator' | 'admissions';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  adminRole?: AdminRole;
  title: string;
  phone?: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  title: string;
  department: string;
  status: 'active' | 'suspended';
  lastLogin: string;
  phone: string;
}

export interface RolePermission {
  id: string;
  module: string;
  action: string;
  label: string;
  description: string;
  super_admin: boolean;
  academic_coordinator: boolean;
  admissions: boolean;
}

export type SubjectType = 'math' | 'literature' | 'english' | 'science' | 'art' | 'other';

export interface Classroom {
  id: string;
  name: string;
  type: 'physical' | 'online' | 'lab';
  capacity: number;
  facilities: string[];
  location: string;
  status: 'active' | 'maintenance';
}

export type ScheduleConflictType = 'tutor' | 'room' | 'capacity' | 'invalid_time' | 'room_maintenance';

export interface ScheduleConflictResult {
  hasConflict: boolean;
  hasClash?: boolean; // Backward compatibility alias
  type?: ScheduleConflictType;
  conflictingEvent?: ScheduleEvent;
  message?: string;
  roomCapacity?: number;
  studentCount?: number;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  subject: SubjectType;
  dayOfWeek: number; // 1 = Mon, 2 = Tue, ..., 7 = Sun
  dateStr: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "07:00")
  endTime: string; // HH:mm (e.g. "08:40")
  startHour: number; // e.g. 7.0
  durationHours: number; // e.g. 1.5
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  room: string;
  roomCapacity?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  studentIds: string[];
  studentNames: string[];
  onlineMeetingUrl?: string;
  documentUrl?: string;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  grade: string; // "Lớp 8", "Lớp 12"
  parentId: string;
  parentName: string;
  parentPhone: string;
  enrolledCourses: string[];
  overallProgress: number; // 0 - 100
  status: 'active' | 'suspended' | 'completed';
  tuitionStatus: 'paid' | 'pending' | 'overdue';
  studyStreakDays?: number;
  examGoal?: StudentExamGoal;
  badges?: StudentBadge[];
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: 'star' | 'flame' | 'award' | 'shield' | 'clock' | 'book';
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'streak' | 'grade' | 'speed' | 'attendance';
}

export interface StudentExamGoal {
  examName: string;
  targetDate: string; // YYYY-MM-DD
  targetScore: string;
  daysRemaining?: number;
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  hourlyRate: number; // VND
  completedHoursThisMonth: number;
  totalEarningsThisMonth: number;
  rating: number;
  activeClassesCount: number;
  phone: string;
  email: string;
  salaryStatus?: 'pending_approval' | 'approved' | 'paid';
  salaryMonth?: string;
  approvedAt?: string;
  approvedBy?: string;
  hourlyRateNotes?: string;
  degrees?: string[];
  experienceYears?: number;
  achievements?: string[];
  quote?: string;
  badgeTitle?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  date: string;
  status: 'present' | 'late' | 'absent';
  remarks: string;
  comprehensionRating: number; // 1 to 5 stars
  homeworkScore?: number; // 0 - 10
}

export interface TuitionInvoice {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  amount: number; // VND
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
  paymentCode: string;
  sessionsCount: number;
  discountAmount?: number;
}

export interface Course {
  id: string;
  title: string;
  subject: SubjectType;
  gradeLevel: string;
  tutorName: string;
  tutorAvatar: string;
  duration: string; // "24 buổi (3 tháng)"
  price: number;
  scheduleDescription: string;
  rating: number;
  enrolledCount: number;
  maxStudents: number;
  features: string[];
  bannerImage: string;
  originalPrice?: number;
  commitmentBadge?: string;
  targetAudience?: string;
  courseOverview?: string;
  tutorTitle?: string;
  description?: string;
  code?: string;
}

export interface HabitProgressItem {
  id: string;
  courseTitle: string;
  tutorName: string;
  tutorAvatar: string;
  totalSessions: number;
  completedSessions: number;
  latestDate: string;
  attendanceStatus: 'present' | 'late' | 'absent';
  feedback: string;
  homeworkScore: number;
  voiceNote?: string;
  homeworkPhoto?: string;
  badgeAward?: string;
}

export interface HomeworkAssignment {
  id: string;
  sessionId: string;
  sessionTitle: string;
  subject: SubjectType;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD HH:mm
  totalScore: number; // e.g. 10
  studentIds: string[];
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  submittedAt?: string;
  submissionText?: string;
  submissionFileUrl?: string;
  score?: number; // 0 - 10
  tutorFeedback?: string;
  comprehensionRating?: number; // 1 - 5 stars
  gradedAt?: string;
  rubricScores?: RubricScoreEvaluation[];
}

// ============================================================================
// ASSESSMENT & QUIZ ENGINE TYPES (Requirement R3)
// ============================================================================

/** 4 Cấp độ nhận thức chuẩn Bloom & Bộ GD&ĐT */
export type QuizDifficultyLevel =
  | 'recognition'          // Nhận biết (Nhận diện công thức, định nghĩa cơ bản)
  | 'comprehension'        // Thông hiểu (Hiểu bản chất, giải thích, biến đổi đơn giản)
  | 'application'          // Vận dụng (Áp dụng giải bài toán nhiều bước tiêu chuẩn)
  | 'advanced_application'; // Vận dụng cao (Phân hóa 9+, tổng hợp, bài toán thực tế)

export interface QuizOption {
  id: string;              // 'opt-a', 'opt-b', 'opt-c', 'opt-d'
  label: string;           // 'A', 'B', 'C', 'D'
  content: string;         // Nội dung đáp án (chứa text, công thức toán học)
}

export interface QuizQuestion {
  id: string;              // 'q-1', 'q-2',...
  quizId: string;
  orderNumber: number;     // 1, 2, 3,...
  content: string;         // Đề bài câu hỏi
  difficultyLevel: QuizDifficultyLevel;
  topic: string;           // Chuyên đề: e.g. "Tích phân hàm ẩn", "Khối đa diện", "Reading: Heading Matching"
  options: QuizOption[];
  correctOptionId: string; // 'opt-b'
  explanation: string;     // Lời giải chi tiết từ Thầy/Cô & Bẫy thường gặp
  points: number;          // Điểm số của câu (mặc định 1 điểm)
}

export interface Quiz {
  id: string;
  courseId: string;
  courseTitle: string;
  subject: SubjectType;
  title: string;           // Tiêu đề đề thi: "Khảo sát chất lượng Toán 12 - Số 01"
  description: string;
  durationMinutes: number; // Thời gian làm bài (e.g. 45 phút, 90 phút)
  totalQuestions: number;  // e.g. 15 câu hoặc 12 câu
  passingScore: number;    // e.g. 5.0 / 10
  questions: QuizQuestion[];
  assignedDate: string;
  dueDate: string;
  difficultyBreakdown: {
    recognitionCount: number;
    comprehensionCount: number;
    applicationCount: number;
    advancedCount: number;
  };
}

export interface StudentQuizAnswer {
  questionId: string;
  selectedOptionId: string | null; // null nếu bỏ trống chưa chọn
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface TopicGapItem {
  topic: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracyPercentage: number; // 0 - 100%
  masteryLevel: 'mastered' | 'proficient' | 'needs_improvement'; // >=80%: Nắm vững, 60-79%: Khá, <60%: Lỗ hổng
  recommendationNote: string;
  suggestedResourceIds?: string[];
}

export interface KnowledgeGapReport {
  overallScore: number;        // Thang điểm 10 (e.g. 8.5)
  totalCorrect: number;
  totalQuestions: number;
  accuracyRate: number;        // e.g. 85%
  timeSpentSeconds: number;
  completionDate: string;
  levelAccuracy: {
    recognition: number;       // % đúng ở mức Nhận biết
    comprehension: number;     // % đúng ở mức Thông hiểu
    application: number;       // % đúng ở mức Vận dụng
    advancedApplication: number; // % đúng ở mức Vận dụng cao
  };
  topicGaps: TopicGapItem[];   // Phân tích chi tiết từng chuyên đề kiến thức
  strengthsSummary: string;    // Tóm tắt thế mạnh
  weaknessesSummary: string;   // Tóm tắt lỗ hổng kiến thức cần ôn lại
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  startedAt: string;
  submittedAt: string;
  score: number;               // Thang điểm 10 chuẩn
  status: 'submitted' | 'reviewed';
  answers: StudentQuizAnswer[];
  gapReport: KnowledgeGapReport;
}

// ============================================================================
// RUBRIC-BASED GRADING TYPES (Requirement R3)
// ============================================================================

export interface RubricLevel {
  levelScore: number;          // e.g. 4.0, 3.0, 2.0, 1.0
  title: string;               // "Xuất sắc", "Khá", "Đạt", "Chưa đạt"
  description: string;         // Tiêu chuẩn biểu hiện
}

export interface RubricCriterion {
  id: string;                  // 'crit-method', 'crit-calc', 'crit-presentation', 'crit-conclusion'
  name: string;                // "Phương pháp & Hướng giải quyết"
  description: string;
  maxScore: number;            // e.g. 4.0
  weightPercentage: number;    // e.g. 40%
  levels: RubricLevel[];
}

export interface RubricScoreEvaluation {
  criterionId: string;
  criterionName: string;
  scoreAwarded: number;        // Điểm giáo viên chấm cho tiêu chí này
  maxScore: number;
  tutorComment?: string;       // Nhận xét riêng cho tiêu chí
}

export interface RubricGradingPayload {
  submissionId: string;
  homeworkId: string;
  criteriaScores: RubricScoreEvaluation[];
  totalScore: number;          // Điểm tổng tính theo trọng số (thang 10)
  generalFeedback: string;
  comprehensionRating: number; // 1 - 5 sao
  gradedBy: string;
  gradedAt: string;
}


export type LeadStatus = 'consulting' | 'trial_lesson' | 'enrolled' | 'pending_provision' | 'provisioned';

export interface AdmissionsLead {
  id: string;
  studentName: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  studentEmail: string;
  desiredCourse: string;
  consultantId: string;
  consultantName: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  requestedAt?: string;
  provisionedAt?: string;
}
export type CourseRegistrationStep = 1 | 2 | 3 | 4;

export interface CourseRegistration {
  id: string;
  courseId: string;
  courseTitle: string;
  subject: SubjectType;
  tutorName: string;
  tutorAvatar?: string;
  price: number;
  duration: string;
  scheduleDescription: string;

  // Bước 1: Thông tin học sinh
  studentId?: string;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  grade: string;
  targetGoal?: string; // Ví dụ: "Đạt 7.5 IELTS", "Thi đỗ Chuyên Toán KHTN"

  // Bước 2: Xác nhận lớp & lịch dạy
  selectedSchedule: string; // Ca học học sinh chọn (VD: "Thứ 3 & Thứ 6 (19:30 - 21:00)")
  learningFormat: 'online' | 'offline'; // "Học Trực Tuyến (Google Meet)" | "Học Tại Trung Tâm"
  confirmedTerms: boolean; // Đã kiểm tra và đồng ý lịch dạy

  // Bước 3: Phê duyệt từ Trung tâm
  centerStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string; // Tên cán bộ Học vụ / Chủ trung tâm đã duyệt
  assignedRoom?: string; // Phòng học hoặc link Google Meet

  // Bước 4: Thanh toán học phí
  paymentStatus: 'unpaid' | 'paid';
  paymentCode: string; // Mã thanh toán VietQR (VD: "DK-IELTS-882")
  paidAt?: string;

  currentStep: CourseRegistrationStep;
  createdAt: string;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'homework'
  | 'tuition'
  | 'schedule'
  | 'registration';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  targetRole: UserRole | 'all' | UserRole[];
  targetUserId?: string;
  targetTab?: string;
  actionUrl?: string;
  entityId?: string;
  createdAt?: string;
}

export interface CourseResource {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  type: 'pdf' | 'slide' | 'exam' | 'recording' | 'other';
  fileUrl: string;
  fileSize?: string;
  recordingDate?: string;
  duration?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  gradeLevel?: string;
  subject?: SubjectType;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  content: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  type: 'direct' | 'group' | 'support';
  courseId?: string;
  courseTitle?: string;
  participants: {
    userId: string;
    name: string;
    role: UserRole;
    avatar: string;
    title?: string;
  }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isPinned?: boolean;
  avatar?: string;
  ticketStatus?: 'open' | 'in_progress' | 'resolved';
  pinnedAnnouncement?: {
    content: string;
    pinnedBy: string;
    pinnedAt: string;
  };
}

