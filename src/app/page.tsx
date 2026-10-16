'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MasterSchedule } from '@/components/admin/MasterSchedule';
import { StudentTable } from '@/components/admin/StudentTable';
import { TuitionTracker } from '@/components/admin/TuitionTracker';
import { AddEventModal } from '@/components/admin/AddEventModal';
import { RealtimeSalaryCard } from '@/components/tutor/RealtimeSalaryCard';
import { AvailabilityPicker } from '@/components/tutor/AvailabilityPicker';
import { AttendanceModal } from '@/components/tutor/AttendanceModal';
import { StudentTimetable } from '@/components/student/StudentTimetable';
import { StudentLearningHub } from '@/components/student/StudentLearningHub';
import { CourseCatalog } from '@/components/student/CourseCatalog';
import { StudentTuitionCard } from '@/components/student/StudentTuitionCard';
import { OnlineClassModal } from '@/components/student/OnlineClassModal';
import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { ProgressFeed } from '@/components/parent/ProgressFeed';
import { ParentTuitionCenter } from '@/components/parent/ParentTuitionCenter';

import { AccountManagementHub } from '@/components/admin/AccountManagementHub';
import { PublicLandingPage } from '@/components/public/PublicLandingPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { HomeworkManagement } from '@/components/tutor/HomeworkManagement';
import { CreateHomeworkModal } from '@/components/tutor/CreateHomeworkModal';
import { StudentHomeworkView } from '@/components/student/StudentHomeworkView';
import { TutorSalaryManager } from '@/components/admin/TutorSalaryManager';
import { AdmissionsLeadManager } from '@/components/admin/AdmissionsLeadManager';
import { AccountProvisionRequestsModal } from '@/components/admin/AccountProvisionRequestsModal';
import { CourseManager } from '@/components/admin/CourseManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { LearningResourcesHub } from '@/components/tutor/LearningResourcesHub';
import { StudentResourcesView } from '@/components/student/StudentResourcesView';
import { ChatHub } from '@/components/chat/ChatHub';

import {
  mockScheduleEvents,
  mockStudents,
  mockTutors,
  mockTuitionInvoices,
  mockAttendanceList,
  mockCoursesCatalog,
  mockHabitProgressItems,
  mockAdminAccounts,
  mockPermissionsMatrix,
  mockClassrooms,
} from '@/data/mockData';
import { mockHomeworkAssignments, mockHomeworkSubmissions } from '@/data/mockHomework';
import { mockAdmissionsLeads } from '@/data/mockAdmissions';
import { mockAccountCredentials, AccountRecord } from '@/data/mockAccounts';
import { mockCourseRegistrations } from '@/data/mockRegistrations';
import { mockConversations, mockChatMessages } from '@/data/mockMessages';
import { mockQuizzes, mockQuizSubmissions } from '@/data/mockQuizzes';
import { QuizEngineModal } from '@/components/student/QuizEngineModal';
import { UserRole, AdminRole, AdminAccount, AuthUser, Tutor, Student, ScheduleEvent, TuitionInvoice, AttendanceRecord, HomeworkAssignment, HomeworkSubmission, AdmissionsLead, LeadStatus, Course, CourseRegistration, AppNotification, CourseResource, Conversation, ChatMessage, Classroom, Quiz, QuizSubmission } from '@/types';
import { CheckSquare, GraduationCap, Video, Star, Phone, Mail, Award, BookOpen, Clock, UserCheck, Sparkles, ShieldAlert, Settings, Database, RotateCcw, X, HardDrive, ExternalLink, Brain } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { useToast } from '@/components/shared/ToastNotification';
import { storage, STORAGE_KEYS, PersistedAppData, AuthSession, defaultMockNotifications, defaultMockResources } from '@/lib/storage';
import { validateSmartScheduleConflict } from '@/lib/scheduleValidator';

export default function AppHome() {
  const { showToast } = useToast();

  // Authentication & View Mode State ('landing' | 'login' | 'dashboard')
  const [authView, setAuthView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Role & Tab Navigation State
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('schedule');

  // Admin Sub-Role & Accounts State
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>('super_admin');
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(mockAdminAccounts);
  const [tutors, setTutors] = useState<Tutor[]>(mockTutors);
  const [classrooms, setClassrooms] = useState<Classroom[]>(mockClassrooms);

  // Shared Data States
  const [events, setEvents] = useState<ScheduleEvent[]>(mockScheduleEvents);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [invoices, setInvoices] = useState<TuitionInvoice[]>(mockTuitionInvoices);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceList);

  // Homework Management States
  const [homeworkList, setHomeworkList] = useState<HomeworkAssignment[]>(mockHomeworkAssignments);
  const [submissionsList, setSubmissionsList] = useState<HomeworkSubmission[]>(mockHomeworkSubmissions);

  // Admissions Leads State
  const [admissionsLeads, setAdmissionsLeads] = useState<AdmissionsLead[]>(mockAdmissionsLeads);

  // Courses & Course Registrations State (Dynamic Website Catalog & 4-Step Registration)
  const [courses, setCourses] = useState<Course[]>(mockCoursesCatalog);
  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>(mockCourseRegistrations);

  // Notifications State (Milestone M2)
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [highlightedEntityId, setHighlightedEntityId] = useState<string | null>(null);

  // Learning Resources State (Milestone M4)
  const [courseResources, setCourseResources] = useState<CourseResource[]>([]);

  // Messaging & Omnichannel Communication State
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);

  // Assessment & Quiz Engine States (Requirement R3)
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>(mockQuizSubmissions);
  const [activeQuizForEngine, setActiveQuizForEngine] = useState<Quiz | null>(null);
  const [activeQuizSubmissionForEngine, setActiveQuizSubmissionForEngine] = useState<QuizSubmission | null>(null);

  // Modal States
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isOnlineClassOpen, setIsOnlineClassOpen] = useState(false);
  const [onlineClassEvent, setOnlineClassEvent] = useState<ScheduleEvent | null>(null);
  const [isCreateHomeworkOpen, setIsCreateHomeworkOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  // Parent Child selection state
  const [selectedChildId, setSelectedChildId] = useState<string>('stu-2'); // Bé An default

  // Hydration readiness guard (prevents SSR hydration mismatch & premature storage overwrite)
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Dynamic user credentials state (seeded from mockAccountCredentials, persisted to storage)
  const [credentials, setCredentials] = useState<AccountRecord[]>(mockAccountCredentials);

  // Reset Default Mock Data confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // =========================================================================
  // 1. ISOMORPHIC HYDRATION LIFECYCLE (Avoids Next.js SSR Hydration Mismatch)
  // =========================================================================
  useEffect(() => {
    try {
      const data = storage.loadInitialData();
      setCourses(data.courses);
      setCourseRegistrations(data.courseRegistrations);
      setAdminAccounts(data.adminAccounts);
      setTutors(data.tutors);
      setStudents(data.students);
      setEvents(data.events);
      setInvoices(data.invoices);
      setAttendanceRecords(data.attendanceRecords);
      setHomeworkList(data.homeworkList);
      setSubmissionsList(data.submissionsList);
      setAdmissionsLeads(data.admissionsLeads);
      setNotifications(data.notifications || defaultMockNotifications);
      setCourseResources(data.resources || defaultMockResources);
      setConversations(data.conversations || mockConversations);
      setChatMessages(data.chatMessages || mockChatMessages);
      setQuizzes(data.quizzes || mockQuizzes);
      setQuizSubmissions(data.quizSubmissions || mockQuizSubmissions);

      const storedCreds = storage.getItem<AccountRecord[]>(
        STORAGE_KEYS.ACCOUNT_CREDENTIALS,
        mockAccountCredentials
      );
      setCredentials(storedCreds);

      // Rehydrate authenticated session
      const savedSession = storage.getItem<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, null);
      if (savedSession) {
        if (savedSession.currentUser) {
          setCurrentUser(savedSession.currentUser);
          setCurrentRole(savedSession.currentRole || savedSession.currentUser.role);
          if (savedSession.currentAdminRole) {
            setCurrentAdminRole(savedSession.currentAdminRole);
          }
          if (savedSession.activeTab) {
            setActiveTab(savedSession.activeTab);
          }
          if (savedSession.selectedChildId) {
            setSelectedChildId(savedSession.selectedChildId);
          }
        }
        if (savedSession.authView) {
          setAuthView(savedSession.authView);
        }
      }
    } catch (err) {
      console.warn('[EduConnect] Failed to rehydrate state from storage:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // =========================================================================
  // 2. REACTIVE PERSISTENCE SYNCHRONIZATION (Selective per-collection sync)
  // =========================================================================
  useEffect(() => {
    if (isHydrated) storage.saveCollection('courses', courses);
  }, [courses, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('courseRegistrations', courseRegistrations);
  }, [courseRegistrations, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('events', events);
  }, [events, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('students', students);
  }, [students, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('invoices', invoices);
  }, [invoices, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('tutors', tutors);
  }, [tutors, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('attendanceRecords', attendanceRecords);
  }, [attendanceRecords, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('homeworkList', homeworkList);
  }, [homeworkList, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('submissionsList', submissionsList);
  }, [submissionsList, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('admissionsLeads', admissionsLeads);
  }, [admissionsLeads, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('adminAccounts', adminAccounts);
  }, [adminAccounts, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('accountCredentials', credentials);
  }, [credentials, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('notifications', notifications);
  }, [notifications, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('resources', courseResources);
  }, [courseResources, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('conversations', conversations);
  }, [conversations, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('chatMessages', chatMessages);
  }, [chatMessages, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('quizzes', quizzes);
  }, [quizzes, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollection('quizSubmissions', quizSubmissions);
  }, [quizSubmissions, isHydrated]);

  // Auth Session Sync
  useEffect(() => {
    if (!isHydrated) return;
    if (currentUser) {
      storage.setItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION, {
        currentUser,
        currentRole,
        currentAdminRole,
        authView,
        activeTab,
        selectedChildId,
      });
    } else if (authView === 'login') {
      storage.setItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION, {
        currentUser: null,
        currentRole,
        currentAdminRole,
        authView: 'login',
        activeTab,
        selectedChildId,
      });
    } else {
      storage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  }, [currentUser, currentRole, currentAdminRole, authView, activeTab, selectedChildId, isHydrated]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    switch (role) {
      case 'admin':
        setActiveTab('schedule');
        break;
      case 'tutor':
        setActiveTab('earnings');
        break;
      case 'student':
        setActiveTab('student-schedule');
        break;
      case 'parent':
        setActiveTab('progress');
        break;
    }
    showToast(`Đã chuyển sang giao diện: ${role.toUpperCase()}`, 'info');
  };

  // =========================================================================
  // NOTIFICATION ACTIONS & REAL-TIME EVENT DISPATCHERS (Milestone M2)
  // =========================================================================
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        const matches = Array.isArray(n.targetRole)
          ? n.targetRole.includes(currentRole) || n.targetRole.includes('all' as any)
          : n.targetRole === 'all' || n.targetRole === currentRole;
        return matches ? { ...n, isRead: true } : n;
      })
    );
    showToast('Đã đánh dấu tất cả thông báo là đã đọc!', 'success');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Đã xóa thông báo.', 'info');
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) =>
      prev.filter((n) => {
        const matches = Array.isArray(n.targetRole)
          ? n.targetRole.includes(currentRole) || n.targetRole.includes('all' as any)
          : n.targetRole === 'all' || n.targetRole === currentRole;
        return !matches;
      })
    );
    showToast('Đã xóa toàn bộ thông báo của phân hệ hiện tại!', 'info');
  };

  const handleAddNotification = (
    newNotif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> & {
      timestamp?: string;
      isRead?: boolean;
      id?: string;
    }
  ) => {
    const notif: AppNotification = {
      id: newNotif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: newNotif.timestamp || 'Vừa xong',
      isRead: newNotif.isRead || false,
      createdAt: new Date().toISOString(),
      ...newNotif,
    };
    setNotifications((prev) => [notif, ...prev]);
    return notif;
  };

  const handleSelectNotification = (item: AppNotification) => {
    // 1. Mark as read
    handleMarkAsRead(item.id);

    // 2. Role switch if needed
    if (item.targetRole && item.targetRole !== 'all' && !Array.isArray(item.targetRole) && item.targetRole !== currentRole) {
      setCurrentRole(item.targetRole);
      if (item.targetRole === 'admin') {
        if (item.targetTab === 'admissions-leads') {
          setCurrentAdminRole('admissions');
        } else if (item.targetTab === 'tuition' || item.targetTab === 'tutors') {
          setCurrentAdminRole('super_admin');
        }
      }
    }

    // 3. Navigate to targetTab
    if (item.targetTab) {
      setActiveTab(item.targetTab);
    }

    // 4. Highlight/select entity
    if (item.entityId) {
      setHighlightedEntityId(item.entityId);
      if (item.entityId.startsWith('quiz-')) {
        const matchedQuiz = quizzes.find((q) => q.id === item.entityId);
        if (matchedQuiz) {
          const sub = quizSubmissions.find(
            (s) => s.quizId === matchedQuiz.id && (s.studentId === item.targetUserId || s.studentId === 'stu-1')
          );
          setActiveQuizForEngine(matchedQuiz);
          setActiveQuizSubmissionForEngine(sub || null);
        }
      }
    }

    // 5. Parent child selection alignment
    if (item.targetRole === 'parent' || currentRole === 'parent') {
      if (item.targetUserId) {
        setSelectedChildId(item.targetUserId);
      } else if (item.message.includes('Nguyễn An') || item.title.includes('Nguyễn An') || item.message.includes('bé An')) {
        setSelectedChildId('stu-2');
      } else if (item.message.includes('Anh Thư') || item.title.includes('Anh Thư')) {
        setSelectedChildId('stu-3');
      }
    }

    showToast(`Chuyển đến: ${item.title}`, 'info');
  };

  const handleSendTuitionReminder = (invoice: TuitionInvoice) => {
    // 1. To Student
    handleAddNotification({
      title: `Nhắc hạn đóng học phí: ${invoice.courseName}`,
      message: `Hóa đơn học phí khóa ${invoice.courseName} (${formatVND(invoice.amount)}) của bạn có hạn chót ${invoice.dueDate}. Vui lòng nộp học phí qua VietQR.`,
      type: 'tuition',
      targetRole: 'student',
      targetTab: 'student-tuition',
      entityId: invoice.id,
      targetUserId: invoice.studentId,
    });

    // 2. To Parent
    handleAddNotification({
      title: `Nhắc đóng học phí cho ${invoice.studentName}`,
      message: `Học phí môn ${invoice.courseName} (${formatVND(invoice.amount)}) của ${invoice.studentName} đến hạn ngày ${invoice.dueDate}. Quý phụ huynh vui lòng thanh toán.`,
      type: 'tuition',
      targetRole: 'parent',
      targetTab: 'parent-tuition',
      entityId: invoice.id,
      targetUserId: invoice.studentId,
    });

    showToast(`Đã gửi thông báo nhắc học phí cho học sinh ${invoice.studentName} và phụ huynh!`, 'success');
  };

  const handleAddEvent = (newEvent: ScheduleEvent) => {
    setEvents((prev) => [newEvent, ...prev]);

    // 1. Notify Tutor (Event e)
    handleAddNotification({
      title: `Ca dạy mới: ${newEvent.title}`,
      message: `Ca dạy ${newEvent.title} đã được xếp lịch (${newEvent.startTime} - ${newEvent.endTime}) tại ${newEvent.room}.`,
      type: 'schedule',
      targetRole: 'tutor',
      targetTab: 'classes',
      entityId: newEvent.id,
      targetUserId: newEvent.tutorId,
    });

    // 2. Notify Student (Event e)
    handleAddNotification({
      title: `Ca học mới được xếp: ${newEvent.title}`,
      message: `Ca học ${newEvent.title} (${newEvent.startTime} - ${newEvent.endTime}) tại ${newEvent.room} đã được cập nhật vào Thời khóa biểu của bạn.`,
      type: 'schedule',
      targetRole: 'student',
      targetTab: 'student-schedule',
      entityId: newEvent.id,
    });

    // 3. Notify Parent
    handleAddNotification({
      title: `Lịch học mới của con: ${newEvent.title}`,
      message: `Lịch học môn ${newEvent.title} (${newEvent.startTime} - ${newEvent.endTime}) tại ${newEvent.room} đã được cập nhật.`,
      type: 'schedule',
      targetRole: 'parent',
      targetTab: 'schedule-view',
      entityId: newEvent.id,
    });
  };

  const handleUpdateEvent = (updatedEvent: ScheduleEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  const handleCreateHomework = (newHw: HomeworkAssignment) => {
    setHomeworkList((prev) => [newHw, ...prev]);
    const initialSubs: HomeworkSubmission[] = (newHw.studentIds || []).map((stuId) => {
      const studentObj = students.find((s) => s.id === stuId);
      return {
        id: `sub-${Date.now()}-${stuId}`,
        homeworkId: newHw.id,
        studentId: stuId,
        studentName: studentObj ? studentObj.name : 'Học sinh',
        studentAvatar: studentObj
          ? studentObj.avatar
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        status: 'not_submitted',
      };
    });
    setSubmissionsList((prev) => [...initialSubs, ...prev]);

    // 1. Notify enrolled Students (Event b)
    handleAddNotification({
      title: `Bài tập mới: ${newHw.title}`,
      message: `Thầy/Cô ${newHw.tutorName} vừa giao bài tập cho môn ${newHw.sessionTitle}. Hạn nộp: ${newHw.dueDate}.`,
      type: 'homework',
      targetRole: 'student',
      targetTab: 'homework',
      entityId: newHw.id,
    });

    // 2. Notify Parents of enrolled Students (Event b)
    handleAddNotification({
      title: `Bài tập mới của con: ${newHw.title}`,
      message: `Gia sư ${newHw.tutorName} đã giao bài tập về nhà môn ${newHw.sessionTitle}. Hạn nộp: ${newHw.dueDate}.`,
      type: 'homework',
      targetRole: 'parent',
      targetTab: 'progress',
      entityId: newHw.id,
    });
  };

  const handleSubmitHomework = (submission: HomeworkSubmission) => {
    setSubmissionsList((prev) => {
      const existingIndex = prev.findIndex(
        (s) => s.homeworkId === submission.homeworkId && s.studentId === submission.studentId
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = submission;
        return next;
      }
      return [submission, ...prev];
    });

    const hw = homeworkList.find((h) => h.id === submission.homeworkId);
    // Notify Tutor
    handleAddNotification({
      title: `Học sinh đã nộp bài: ${submission.studentName}`,
      message: `Học sinh ${submission.studentName} đã nộp bài tập "${hw?.title || 'Bài tập'}". Cần chấm điểm.`,
      type: 'homework',
      targetRole: 'tutor',
      targetTab: 'homework-management',
      entityId: submission.homeworkId,
    });
  };

  const handleGradeHomework = (gradedSubmission: HomeworkSubmission) => {
    setSubmissionsList((prev) =>
      prev.map((s) => (s.id === gradedSubmission.id ? gradedSubmission : s))
    );

    const hw = homeworkList.find((h) => h.id === gradedSubmission.homeworkId);
    const hwTitle = hw?.title || 'Bài tập về nhà';
    const totalScore = hw?.totalScore || 10;

    let rubricSummary = '';
    if (gradedSubmission.rubricScores && gradedSubmission.rubricScores.length > 0) {
      const parts = gradedSubmission.rubricScores.map((r) => `${r.criterionName}: ${r.scoreAwarded}/${r.maxScore}đ`);
      rubricSummary = ` [Rubrics: ${parts.join(', ')}]`;
    }

    // 1. Notify Student (Event c)
    handleAddNotification({
      title: `Bài tập đã được chấm điểm: ${hwTitle}`,
      message: `Thầy/Cô đã chấm bài của bạn: ${gradedSubmission.score}/${totalScore} điểm.${rubricSummary} Nhận xét: "${gradedSubmission.tutorFeedback || 'Đã hoàn thành'}".`,
      type: 'homework',
      targetRole: 'student',
      targetTab: 'homework',
      entityId: gradedSubmission.homeworkId,
      targetUserId: gradedSubmission.studentId,
    });

    // 2. Notify Parent (Event c)
    handleAddNotification({
      title: `Kết quả bài tập của ${gradedSubmission.studentName}`,
      message: `Gia sư đã chấm bài "${hwTitle}" của con: ${gradedSubmission.score}/${totalScore} điểm.${rubricSummary} Nhận xét: "${gradedSubmission.tutorFeedback || 'Đã hoàn thành'}".`,
      type: 'homework',
      targetRole: 'parent',
      targetTab: 'progress',
      entityId: gradedSubmission.homeworkId,
      targetUserId: gradedSubmission.studentId,
    });
  };

  const handleCompleteQuiz = (newSubmission: QuizSubmission) => {
    setQuizSubmissions((prev) => {
      const filtered = prev.filter(
        (s) => s.id !== newSubmission.id && !(s.quizId === newSubmission.quizId && s.studentId === newSubmission.studentId)
      );
      return [newSubmission, ...filtered];
    });

    // 1. Update Student Study Streak
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id === newSubmission.studentId) {
          const currentStreak = stu.studyStreakDays || 0;
          return {
            ...stu,
            studyStreakDays: currentStreak + 1,
          };
        }
        return stu;
      })
    );

    // 2. Dispatch Notification to Parent
    handleAddNotification({
      title: `Kết quả bài thi thử: ${newSubmission.studentName}`,
      message: `Học sinh đã hoàn thành đề thi "${newSubmission.quizTitle}": Điểm số ${newSubmission.score}/10 (${newSubmission.gapReport.accuracyRate}%). Báo cáo lỗ hổng kiến thức đã sẵn sàng.`,
      type: 'homework',
      targetRole: 'parent',
      targetTab: 'progress',
      entityId: newSubmission.quizId,
      targetUserId: newSubmission.studentId,
    });

    // 3. Dispatch Notification to Tutor
    handleAddNotification({
      title: `Học sinh hoàn thành khảo sát trắc nghiệm`,
      message: `Học sinh ${newSubmission.studentName} đã nộp đề "${newSubmission.quizTitle}": Đạt ${newSubmission.score}/10 điểm. Hệ thống đã tự động chẩn đoán ma trận kiến thức Bloom.`,
      type: 'homework',
      targetRole: 'tutor',
      targetTab: 'homework-management',
      entityId: newSubmission.quizId,
      targetUserId: newSubmission.studentId,
    });
  };

  const handleAddAdmin = (newAdmin: AdminAccount) => {
    setAdminAccounts((prev) => [newAdmin, ...prev]);
  };

  const handleAddTutor = (newTutor: Tutor) => {
    setTutors((prev) => [newTutor, ...prev]);
  };

  const handleUpdateHourlyRate = (tutorId: string, newRate: number, notes?: string) => {
    setTutors((prev) =>
      prev.map((t) => {
        if (t.id === tutorId) {
          return {
            ...t,
            hourlyRate: newRate,
            hourlyRateNotes: notes || t.hourlyRateNotes,
            totalEarningsThisMonth: Math.round(t.completedHoursThisMonth * newRate),
          };
        }
        return t;
      })
    );
    showToast('Đã cập nhật đơn giá giờ dạy giảng viên thành công!', 'success');
  };

  const handleApproveSalary = (tutorId: string) => {
    let approvedTutorName = 'Gia sư';
    let earnings = 0;
    setTutors((prev) =>
      prev.map((t) => {
        if (t.id === tutorId) {
          approvedTutorName = t.name;
          earnings = t.totalEarningsThisMonth;
          return {
            ...t,
            salaryStatus: 'approved',
            approvedAt: new Date().toLocaleString('vi-VN'),
            approvedBy: currentUser ? `${currentUser.name} (${currentUser.title})` : 'Phạm Hải Đăng (Admin)',
          };
        }
        return t;
      })
    );

    handleAddNotification({
      title: 'Thù lao giảng dạy đã được duyệt',
      message: `Thù lao giảng dạy kỳ này (${formatVND(earnings || 13500000)}) của thầy/cô ${approvedTutorName} đã được Ban Giám Đốc phê duyệt chuyển khoản.`,
      type: 'success',
      targetRole: 'tutor',
      targetTab: 'earnings',
      entityId: tutorId,
      targetUserId: tutorId,
    });

    showToast('Đã phê duyệt bảng lương giảng viên!', 'success');
  };

  const handleBatchApproveSalaries = () => {
    setTutors((prev) =>
      prev.map((t) => ({
        ...t,
        salaryStatus: 'approved',
        approvedAt: new Date().toLocaleString('vi-VN'),
        approvedBy: currentUser ? `${currentUser.name} (${currentUser.title})` : 'Phạm Hải Đăng (Admin)',
      }))
    );
    showToast('Đã duyệt toàn bộ bảng lương giảng viên kỳ này!', 'success');
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleAttendanceSave = (updated: AttendanceRecord[]) => {
    setAttendanceRecords(updated);
  };

  const handleAddLead = (
    leadData: Omit<AdmissionsLead, 'id' | 'createdAt' | 'status' | 'requestedAt' | 'provisionedAt'>
  ) => {
    const newLead: AdmissionsLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      status: 'consulting',
    };
    setAdmissionsLeads((prev) => [newLead, ...prev]);

    // 1. Notify Admin / Admissions (Event a)
    handleAddNotification({
      title: `Hồ sơ tuyển sinh mới: ${newLead.studentName}`,
      message: `Phụ huynh/Học sinh ${newLead.studentName} (${newLead.grade}) đăng ký tư vấn khóa ${newLead.desiredCourse}. SĐT: ${newLead.parentPhone}.`,
      type: 'registration',
      targetRole: 'admin',
      targetTab: 'admissions-leads',
      entityId: newLead.id,
    });

    showToast('Đã thêm học sinh tuyển sinh mới thành công!', 'success');
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadStatus) => {
    setAdmissionsLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    showToast('Đã cập nhật trạng thái tuyển sinh!', 'info');
  };

  const handleRequestAccountProvision = (leadId: string) => {
    const lead = admissionsLeads.find((l) => l.id === leadId);
    setAdmissionsLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: 'pending_provision',
              requestedAt: new Date().toLocaleString('vi-VN'),
            }
          : l
      )
    );

    // Notify Super Admin (Event a)
    handleAddNotification({
      title: `Yêu cầu cấp tài khoản: ${lead?.studentName || 'Học viên'}`,
      message: `Tư vấn Tuyển sinh yêu cầu cấp tài khoản chính thức cho học sinh ${lead?.studentName || ''}. Cần Ban Quản Trị phê duyệt.`,
      type: 'registration',
      targetRole: 'admin',
      targetTab: 'admissions-leads',
      entityId: leadId,
    });

    showToast('Đã gửi yêu cầu cấp tài khoản cho Ban Quản Trị thành công!', 'success');
  };

  const handleApproveProvision = (lead: AdmissionsLead) => {
    // 1. Create active student
    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name: lead.studentName,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      grade: lead.grade,
      parentId: `par-${Date.now()}`,
      parentName: lead.parentName,
      parentPhone: lead.parentPhone,
      enrolledCourses: [lead.desiredCourse],
      overallProgress: 0,
      status: 'active',
      tuitionStatus: 'paid',
    };
    setStudents((prev) => [newStudent, ...prev]);

    // 2. Add credentials to credentials state & mockAccountCredentials
    const newCredential: AccountRecord = {
      id: newStudent.id,
      email: lead.studentEmail.toLowerCase().trim(),
      password: '123456',
      name: lead.studentName,
      avatar: newStudent.avatar,
      role: 'student',
      title: `Học sinh ${lead.grade}`,
      phone: lead.parentPhone,
      badge: 'Học viên',
      description: `Học viên chính thức khóa ${lead.desiredCourse}`,
    };
    setCredentials((prev) => [newCredential, ...prev]);
    mockAccountCredentials.push(newCredential);

    // 3. Mark lead as provisioned
    setAdmissionsLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status: 'provisioned',
              provisionedAt: new Date().toLocaleString('vi-VN'),
            }
          : l
      )
    );

    // 4. Notify Student & Parent
    handleAddNotification({
      title: 'Tài khoản học viên đã được kích hoạt',
      message: `Chào mừng ${lead.studentName}! Tài khoản học viên của bạn đã sẵn sàng với email ${lead.studentEmail}.`,
      type: 'registration',
      targetRole: 'student',
      targetTab: 'student-schedule',
      entityId: newStudent.id,
      targetUserId: newStudent.id,
    });
    handleAddNotification({
      title: 'Tài khoản của con đã được kích hoạt',
      message: `Tài khoản của bé ${lead.studentName} đã được kích hoạt trên hệ thống EduConnect.`,
      type: 'registration',
      targetRole: 'parent',
      targetTab: 'progress',
      entityId: newStudent.id,
      targetUserId: newStudent.id,
    });

    showToast(`Đã kích hoạt tài khoản chính thức cho học sinh ${lead.studentName}!`, 'success');
  };

  // Course Management Handlers (Super Admin & Academic Coordinator)
  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const handleApproveRegistration = (regId: string, assignedRoom?: string) => {
    let regTitle = 'khóa học';
    setCourseRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          regTitle = r.courseTitle;
          return {
            ...r,
            centerStatus: 'approved',
            approvedAt: new Date().toLocaleString('vi-VN'),
            approvedBy: currentUser ? `${currentUser.name} (${currentUser.title})` : 'Vũ Thu Hương (Học Vụ)',
            assignedRoom: assignedRoom || 'Phòng A101 & Google Meet VIP',
            currentStep: 4,
          };
        }
        return r;
      })
    );

    // Notify Student (Event a)
    handleAddNotification({
      title: 'Đơn đăng ký khóa học đã được duyệt xếp lớp',
      message: `Đơn đăng ký khóa "${regTitle}" đã được xếp phòng: ${assignedRoom || 'Phòng A101 & Google Meet VIP'}. Bạn có thể tiến hành thanh toán học phí (Bước 4).`,
      type: 'registration',
      targetRole: 'student',
      targetTab: 'courses',
      entityId: regId,
    });
  };

  const handleCompleteEnrollment = (registration: CourseRegistration) => {
    // 1. Update registration list to paid
    setCourseRegistrations((prev) => {
      const exists = prev.some((r) => r.id === registration.id || r.paymentCode === registration.paymentCode);
      if (exists) {
        return prev.map((r) =>
          r.id === registration.id || r.paymentCode === registration.paymentCode
            ? { ...r, paymentStatus: 'paid', paidAt: new Date().toLocaleString('vi-VN'), currentStep: 4 }
            : r
        );
      }
      return [
        { ...registration, paymentStatus: 'paid', paidAt: new Date().toLocaleString('vi-VN'), currentStep: 4 },
        ...prev,
      ];
    });

    // 2. Update Student enrolled courses
    const targetStudentId = currentUser?.role === 'student' ? currentUser.id : 'stu-1';
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === targetStudentId || s.name === registration.studentName) {
          return {
            ...s,
            enrolledCourses: Array.from(new Set([...s.enrolledCourses, registration.courseTitle])),
          };
        }
        return s;
      })
    );

    // 3. Create paid invoice in tuition list
    const newInvoice: TuitionInvoice = {
      id: `inv-${Date.now()}`,
      studentId: targetStudentId,
      studentName: registration.studentName,
      courseName: registration.courseTitle,
      amount: registration.price,
      dueDate: new Date().toLocaleDateString('vi-VN'),
      status: 'paid',
      paymentDate: new Date().toLocaleString('vi-VN'),
      paymentCode: registration.paymentCode,
      sessionsCount: 24,
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // 4. Auto-generate full recurring schedule series (12 to 24 sessions)
    const rawDuration = registration.duration || '';
    const durationMatch = rawDuration.match(/(\d+)\s*buổi/i);
    let targetSessionsCount = durationMatch ? parseInt(durationMatch[1], 10) : 24;
    if (targetSessionsCount < 12) targetSessionsCount = 12;
    if (targetSessionsCount > 24) targetSessionsCount = 24;

    // Parse selected study days
    const scheduleStr = (registration.selectedSchedule + ' ' + registration.scheduleDescription).toLowerCase();
    const targetDays: number[] = [];
    if (scheduleStr.includes('thứ 2') || scheduleStr.includes('t2') || scheduleStr.includes('thứ hai')) targetDays.push(1);
    if (scheduleStr.includes('thứ 3') || scheduleStr.includes('t3') || scheduleStr.includes('thứ ba')) targetDays.push(2);
    if (scheduleStr.includes('thứ 4') || scheduleStr.includes('t4') || scheduleStr.includes('thứ tư')) targetDays.push(3);
    if (scheduleStr.includes('thứ 5') || scheduleStr.includes('t5') || scheduleStr.includes('thứ năm')) targetDays.push(4);
    if (scheduleStr.includes('thứ 6') || scheduleStr.includes('t6') || scheduleStr.includes('thứ sáu')) targetDays.push(5);
    if (scheduleStr.includes('thứ 7') || scheduleStr.includes('t7') || scheduleStr.includes('thứ bảy')) targetDays.push(6);
    if (scheduleStr.includes('chủ nhật') || scheduleStr.includes('cn')) targetDays.push(7);

    // Default to Tuesday & Friday (2 & 5) if none matched
    const studyDays = targetDays.length > 0 ? targetDays : [2, 5];

    // Parse start & end times
    const timeMatch = scheduleStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    const sessionStartTime = timeMatch ? timeMatch[1] : '19:30';
    const sessionEndTime = timeMatch ? timeMatch[2] : '21:00';
    const [sh, sm] = sessionStartTime.split(':').map(Number);
    const [eh, em] = sessionEndTime.split(':').map(Number);
    const startHourVal = (sh || 19) + (sm || 30) / 60;
    const endHourVal = (eh || 21) + (em || 0) / 60;
    const durationHoursVal = Math.max(endHourVal - startHourVal, 1.5);

    // Find tutor info
    const matchedTutor = tutors.find((t) => t.name.toLowerCase() === registration.tutorName.toLowerCase()) || tutors[0];
    const assignedTutorId = matchedTutor ? matchedTutor.id : 'tut-1';

    // Room assignment
    const assignedRoomName = registration.assignedRoom || 'Phòng A101 (Offline)';
    const matchedClassroom = classrooms.find((c) => c.name.toLowerCase() === assignedRoomName.toLowerCase());
    const assignedRoomCapacity = matchedClassroom?.capacity || 20;

    // Generate series of sessions starting from 2026-09-15
    const recurringEvents: ScheduleEvent[] = [];
    let currentScanDate = new Date('2026-09-15T00:00:00Z');
    let sessionCount = 0;
    let safetyCounter = 0;

    while (sessionCount < targetSessionsCount && safetyCounter < 180) {
      safetyCounter++;
      const jsDay = currentScanDate.getUTCDay();
      const eduDay = jsDay === 0 ? 7 : jsDay;

      if (studyDays.includes(eduDay)) {
        sessionCount++;
        const yyyy = currentScanDate.getUTCFullYear();
        const mm = String(currentScanDate.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(currentScanDate.getUTCDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;

        const candidateSession: ScheduleEvent = {
          id: `ev-reg-${registration.id}-${sessionCount}`,
          title: `${registration.courseTitle} - Buổi ${sessionCount}`,
          subject: registration.subject,
          dayOfWeek: eduDay,
          dateStr: dateString,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          startHour: startHourVal,
          durationHours: durationHoursVal,
          tutorId: assignedTutorId,
          tutorName: registration.tutorName,
          tutorAvatar:
            registration.tutorAvatar ||
            matchedTutor?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          room: assignedRoomName,
          roomCapacity: assignedRoomCapacity,
          status: 'confirmed',
          studentIds: [targetStudentId],
          studentNames: [registration.studentName],
          onlineMeetingUrl:
            registration.learningFormat === 'online'
              ? `https://meet.google.com/edu-${registration.subject}-${sessionCount}`
              : undefined,
          description: `Buổi học số ${sessionCount}/${targetSessionsCount} theo lộ trình khóa "${registration.courseTitle}".`,
        };

        // Check for schedule conflicts before committing
        const conflictCheck = validateSmartScheduleConflict(
          candidateSession,
          [...events, ...recurringEvents],
          classrooms
        );

        if (conflictCheck.hasConflict || conflictCheck.hasClash) {
          if (conflictCheck.type === 'room') {
            candidateSession.room = 'Phòng Online Meet (Google Meet Pro)';
            candidateSession.onlineMeetingUrl = `https://meet.google.com/edu-${registration.subject}-${sessionCount}`;
          }
        }

        recurringEvents.push(candidateSession);
      }

      currentScanDate.setUTCDate(currentScanDate.getUTCDate() + 1);
    }

    setEvents((prev) => [...recurringEvents, ...prev]);

    // 5. Real-time Event: Notify Admin & Student (Event a & d)
    handleAddNotification({
      title: 'Học viên thanh toán học phí thành công',
      message: `Học sinh ${registration.studentName} đã hoàn tất thanh toán ${formatVND(registration.price)} khóa ${registration.courseTitle}.`,
      type: 'tuition',
      targetRole: 'admin',
      targetTab: 'tuition',
      entityId: newInvoice.id,
    });
    handleAddNotification({
      title: 'Kích hoạt khóa học thành công',
      message: `Chúc mừng bạn đã ghi danh khóa "${registration.courseTitle}". Chuỗi ${recurringEvents.length} buổi học đã được tự động xếp vào Thời khóa biểu.`,
      type: 'success',
      targetRole: 'student',
      targetTab: 'student-schedule',
      entityId: recurringEvents[0]?.id || `ev-reg-${Date.now()}`,
      targetUserId: targetStudentId,
    });
  };

  // =========================================================================
  // LEARNING RESOURCES MANAGEMENT (Milestone M4)
  // =========================================================================
  const handleAddResource = (newResource: CourseResource) => {
    setCourseResources((prev) => [newResource, ...prev]);
    showToast(`Đã thêm tài liệu: ${newResource.title}`, 'success');

    // Notify students & parents about new resource or recording
    handleAddNotification({
      title: `Tài liệu mới: ${newResource.title}`,
      message: `${newResource.uploadedBy} vừa đăng tải ${newResource.type === 'recording' ? 'video ghi hình buổi học' : 'tài liệu mới'} cho khóa ${newResource.courseTitle}.`,
      type: 'info',
      targetRole: ['student', 'parent'],
      targetTab: 'learning-resources',
      entityId: newResource.id,
    });
  };

  const handleDeleteResource = (resourceId: string) => {
    setCourseResources((prev) => prev.filter((r) => r.id !== resourceId));
    showToast('Đã xóa tài liệu khỏi hệ thống!', 'info');
  };

  const handleUpdateResource = (updatedResource: CourseResource) => {
    setCourseResources((prev) =>
      prev.map((r) => (r.id === updatedResource.id ? updatedResource : r))
    );
    showToast('Đã cập nhật thông tin tài liệu!', 'success');
  };

  // =========================================================================
  // OMNICHANNEL MESSAGING & COMMUNICATION (Real-time Center Communication Hub)
  // =========================================================================
  const handleSendMessage = (
    conversationId: string,
    content: string,
    attachmentUrl?: string,
    attachmentName?: string
  ) => {
    const sender = currentUser || {
      id: currentRole === 'student' ? 'stu-1' : currentRole === 'tutor' ? 'tutor-1' : currentRole === 'parent' ? 'parent-1' : 'super-admin-1',
      name: currentRole === 'student' ? 'Nguyễn Minh Quân' : currentRole === 'tutor' ? 'Trần Huy Hoàng' : currentRole === 'parent' ? 'Hoàng Thị Mỹ' : 'Phạm Hải Đăng',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: currentRole,
    };

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: currentRole,
      senderAvatar: sender.avatar,
      content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      attachmentUrl,
      attachmentName,
      isRead: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Update conversation's lastMessage
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: content || (attachmentName ? `[Tệp: ${attachmentName}]` : 'Đã gửi một tệp đính kèm'),
              lastMessageTime: 'Vừa xong',
            }
          : c
      )
    );

    showToast('Tin nhắn đã được chuyển tiếp thành công!', 'success');
  };

  const handleMarkConversationAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleCreateConversation = (
    title: string,
    type: Conversation['type'],
    participantIds: string[]
  ) => {
    const newConv: Conversation = {
      id: `conv-${Date.now().toString(36)}`,
      title,
      type,
      participants: [
        {
          userId: currentUser?.id || 'super-admin-1',
          name: currentUser?.name || 'Phạm Hải Đăng',
          role: currentRole,
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        },
      ],
      lastMessage: 'Kênh liên lạc mới đã sẵn sàng trao đổi.',
      lastMessageTime: 'Vừa xong',
      unreadCount: 0,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    };
    setConversations((prev) => [newConv, ...prev]);
    showToast(`Đã tạo kênh trao đổi: ${title}`, 'success');
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.adminRole) {
      setCurrentAdminRole(user.adminRole);
    }
    let targetTab = 'schedule';
    switch (user.role) {
      case 'admin':
        targetTab = user.adminRole === 'admissions' ? 'admissions-leads' : 'schedule';
        break;
      case 'tutor':
        targetTab = 'earnings';
        break;
      case 'student':
        targetTab = 'student-dashboard';
        break;
      case 'parent':
        targetTab = 'progress';
        break;
    }
    setActiveTab(targetTab);
    setAuthView('dashboard');

    storage.setItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION, {
      currentUser: user,
      currentRole: user.role,
      currentAdminRole: user.adminRole || currentAdminRole,
      authView: 'dashboard',
      activeTab: targetTab,
      selectedChildId,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('landing');
    storage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    showToast('Đã đăng xuất tài khoản!', 'info');
  };

  // =========================================================================
  // RESET DEFAULT MOCK DATA (Milestone M1 - Feature F2)
  // =========================================================================
  const handleResetToDefaults = () => {
    try {
      if (Array.isArray(mockAccountCredentials) && mockAccountCredentials.length > 6) {
        mockAccountCredentials.length = 6;
      }

      const freshSeeds = storage.resetAllToDefaults();
      setCourses(freshSeeds.courses);
      setCourseRegistrations(freshSeeds.courseRegistrations);
      setEvents(freshSeeds.events);
      setStudents(freshSeeds.students);
      setInvoices(freshSeeds.invoices);
      setTutors(freshSeeds.tutors);
      setAttendanceRecords(freshSeeds.attendanceRecords);
      setHomeworkList(freshSeeds.homeworkList);
      setSubmissionsList(freshSeeds.submissionsList);
      setAdmissionsLeads(freshSeeds.admissionsLeads);
      setAdminAccounts(freshSeeds.adminAccounts);
      setCredentials(freshSeeds.accountCredentials);
      setNotifications(freshSeeds.notifications);
      setCourseResources(freshSeeds.resources);
      setConversations(freshSeeds.conversations);
      setChatMessages(freshSeeds.chatMessages);
      setQuizzes(freshSeeds.quizzes);
      setQuizSubmissions(freshSeeds.quizSubmissions);

      // Preserve active administrator session in Settings
      if (currentUser) {
        storage.setItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION, {
          currentUser,
          currentRole,
          currentAdminRole,
          authView: 'dashboard',
          activeTab: 'settings',
          selectedChildId,
        });
      }

      setIsResetConfirmOpen(false);
      showToast('Đã khôi phục toàn bộ dữ liệu mẫu mặc định!', 'success');
    } catch (error) {
      console.warn('Storage reset warning:', error);
      showToast('Có lỗi xảy ra khi khôi phục dữ liệu mẫu.', 'warning');
    }
  };

  // View 1: Public Landing Page
  if (authView === 'landing') {
    return (
      <PublicLandingPage
        onOpenLogin={() => setAuthView('login')}
        onRegisterLead={handleAddLead}
        courses={courses}
        onCompleteEnrollment={handleCompleteEnrollment}
      />
    );
  }

  // View 2: Authentication Login Page
  if (authView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => setAuthView('landing')}
        credentials={credentials}
      />
    );
  }

  const currentChild = students.find((s) => s.id === selectedChildId) || students[1];
  const currentStudent = students.find((s) => s.id === (currentUser?.role === 'student' ? currentUser.id : 'stu-1')) || students[0];
  const parentChildren = students.filter((s) => s.parentId === 'par-2');

  const roleFilteredNotifications = notifications.filter((n) =>
    Array.isArray(n.targetRole)
      ? n.targetRole.includes(currentRole) || n.targetRole.includes('all' as any)
      : n.targetRole === 'all' || n.targetRole === currentRole
  );

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] overflow-x-hidden">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentAdminRole={currentAdminRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          activeTab={activeTab}
          onOpenAddEventModal={() => setIsAddEventOpen(true)}
          currentAdminRole={currentAdminRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          notifications={roleFilteredNotifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteNotification={handleDeleteNotification}
          onClearAllNotifications={handleClearAllNotifications}
          onSelectNotification={handleSelectNotification}
          onNavigateTab={(tab, entityId) => {
            setActiveTab(tab);
            if (entityId) setHighlightedEntityId(entityId);
          }}
          conversations={conversations}
          chatMessages={chatMessages}
          onSendMessage={handleSendMessage}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 min-w-0 overflow-x-hidden">
          {/* ============================================================ */}
          {/* MODULE 1: ADMIN VIEWS                                        */}
          {/* ============================================================ */}
          {currentRole === 'admin' && (
            <>
              {/* Super Admin Notice: Pending Account Provisioning Requests */}
              {currentAdminRole === 'super_admin' && admissionsLeads.some((l) => l.status === 'pending_provision') && (
                <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-100" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">
                        Có {admissionsLeads.filter((l) => l.status === 'pending_provision').length} yêu cầu cấp tài khoản học sinh mới từ Phòng Tuyển Sinh!
                      </h3>
                      <p className="text-xs text-amber-100 mt-0.5">
                        Học sinh đã hoàn tất ghi danh & đặt cọc khóa học. Nhấn để duyệt và kích hoạt tài khoản chính thức ngay.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProvisionModalOpen(true)}
                    className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap self-start sm:self-auto"
                  >
                    Xem & Phê duyệt ({admissionsLeads.filter((l) => l.status === 'pending_provision').length})
                  </button>
                </div>
              )}

              {/* Notice for Academic Coordinator / Super Admin: Pending Course Registrations (Step 3) */}
              {(currentAdminRole === 'super_admin' || currentAdminRole === 'academic_coordinator') &&
                courseRegistrations.some((r) => r.centerStatus === 'pending' || r.currentStep === 3) && (
                  <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
                        <BookOpen className="w-5 h-5 text-amber-100" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base">
                          Có {courseRegistrations.filter((r) => r.centerStatus === 'pending' || r.currentStep === 3).length} đơn đăng ký khóa học mới cần xác nhận & xếp lớp (Bước 3)!
                        </h3>
                        <p className="text-xs text-amber-100 mt-0.5">
                          Học sinh đã xác nhận lịch học & quy chế. Nhấn để duyệt xếp lớp và chuyển đơn sang Bước 4 (Thanh toán).
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('courses-manager')}
                      className="px-4 py-2 bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap self-start sm:self-auto"
                    >
                      Duyệt ngay ({courseRegistrations.filter((r) => r.centerStatus === 'pending' || r.currentStep === 3).length})
                    </button>
                  </div>
                )}

              {activeTab === 'courses-manager' && (
                <CourseManager
                  courses={courses}
                  onAddCourse={handleAddCourse}
                  onDeleteCourse={handleDeleteCourse}
                  registrations={courseRegistrations}
                  onApproveRegistration={handleApproveRegistration}
                  tutors={tutors}
                  isSuperAdmin={currentAdminRole === 'super_admin'}
                  currentUserTitle={currentUser?.title}
                />
              )}

              {activeTab === 'schedule' && (
                <MasterSchedule
                  events={events}
                  onOpenAddEvent={() => setIsAddEventOpen(true)}
                  onUpdateEvent={handleUpdateEvent}
                  currentAdminRole={currentAdminRole}
                  tutors={tutors}
                  classrooms={classrooms}
                />
              )}

              {activeTab === 'accounts' && (
                <AccountManagementHub
                  currentAdminRole={currentAdminRole}
                  onAdminRoleChange={setCurrentAdminRole}
                  adminAccounts={adminAccounts}
                  onAddAdmin={handleAddAdmin}
                  tutors={tutors}
                  onAddTutor={handleAddTutor}
                  students={students}
                  onAddStudent={handleAddStudent}
                  permissionsMatrix={mockPermissionsMatrix}
                />
              )}

              {activeTab === 'admissions-leads' && (
                <AdmissionsLeadManager
                  leads={admissionsLeads}
                  onAddLead={handleAddLead}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onRequestAccountProvision={handleRequestAccountProvision}
                  currentUserName={currentUser ? currentUser.name : 'Đỗ Minh Đức'}
                />
              )}

              {activeTab === 'students' && (
                <StudentTable
                  students={students}
                  courses={courses}
                  attendanceRecords={attendanceRecords}
                />
              )}

              {activeTab === 'tuition' && (
                <TuitionTracker
                  invoices={invoices}
                  onInvoicesUpdate={setInvoices}
                  currentAdminRole={currentAdminRole}
                  onSendReminder={handleSendTuitionReminder}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard
                  attendanceRecords={attendanceRecords}
                  homeworkList={homeworkList}
                  submissionsList={submissionsList}
                  invoices={invoices}
                  events={events}
                  tutors={tutors}
                  students={students}
                  courses={courses}
                  classrooms={classrooms}
                  currentAdminRole={currentAdminRole}
                  onNavigateTab={(tab, entityId) => {
                    setActiveTab(tab);
                    if (entityId) setHighlightedEntityId(entityId);
                  }}
                />
              )}

              {activeTab === 'tutors' && (
                <TutorSalaryManager
                  tutors={tutors}
                  onUpdateHourlyRate={handleUpdateHourlyRate}
                  onApproveSalary={handleApproveSalary}
                  onBatchApproveSalaries={handleBatchApproveSalaries}
                  isSuperAdmin={currentAdminRole === 'super_admin'}
                />
              )}

              {activeTab === 'learning-resources' && (
                <LearningResourcesHub
                  resources={courseResources}
                  courses={courses}
                  currentTutorName={currentUser?.name || 'Ban Quản Trị Trung Tâm'}
                  onAddResource={handleAddResource}
                  onDeleteResource={handleDeleteResource}
                  onUpdateResource={handleUpdateResource}
                />
              )}

              {activeTab === 'messages' && (
                <ChatHub
                  conversations={conversations}
                  messages={chatMessages}
                  currentUser={currentUser}
                  currentRole={currentRole}
                  onSendMessage={handleSendMessage}
                  onCreateConversation={handleCreateConversation}
                  onMarkConversationAsRead={handleMarkConversationAsRead}
                  onUpdateConversation={handleUpdateConversation}
                />
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl">
                  {/* Header Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Settings className="w-6 h-6 text-slate-700" />
                        Cài Đặt Hệ Thống & Lưu Trữ Dữ Liệu
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Quản lý cơ chế lưu trữ bền vững (LocalStorage Persistence), thông số vận hành trung tâm và khôi phục dữ liệu demo chuẩn.
                      </p>
                    </div>
                  </div>

                  {/* Section 1: Storage Status & Persistence Manager */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-soft space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0">
                          <Database className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base flex flex-wrap items-center gap-2">
                            Trạng Thái Lưu Trữ Bền Vững (Client Persistence Layer)
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Đang Đồng Bộ Tự Động
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cơ chế lưu trữ client-side giúp bảo toàn mọi thay đổi qua các lần tải lại trang (F5) và chuyển đổi tài khoản.
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          Storage Engine: v1.0.0
                        </span>
                      </div>
                    </div>

                    {/* Persistence KPI Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-slate-200/60">
                        <span className="text-[11px] font-medium text-slate-500 block">Tổng thực thể lưu trữ</span>
                        <span className="text-2xl font-black text-slate-900 mt-1 block">
                          {courses.length + courseRegistrations.length + events.length + students.length + invoices.length + tutors.length + attendanceRecords.length + homeworkList.length + submissionsList.length + admissionsLeads.length + adminAccounts.length}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">bản ghi trong 11 danh mục</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-slate-200/60">
                        <span className="text-[11px] font-medium text-slate-500 block">Danh mục quản lý</span>
                        <span className="text-2xl font-black text-slate-900 mt-1 block">
                          11 / 11
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% Collections Synced</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-slate-200/60">
                        <span className="text-[11px] font-medium text-slate-500 block">Tiền tố Khóa (Key Prefix)</span>
                        <span className="text-sm font-mono font-bold text-slate-900 mt-2 block truncate">
                          educonnect_v1_*
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Isolated Namespace</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-slate-200/60">
                        <span className="text-[11px] font-medium text-slate-500 block">Bộ nhớ Trình duyệt</span>
                        <span className="text-base font-bold text-slate-900 mt-1.5 block">
                          HTML5 LocalStorage
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Isomorphic Hydrated</span>
                      </div>
                    </div>

                    {/* Breakdown of collections */}
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                        Chi Tiết Số Lượng Bản Ghi Theo Phân Hệ
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Khóa học:</span>
                          <strong className="text-slate-900 font-bold">{courses.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Đơn đăng ký 4 bước:</span>
                          <strong className="text-slate-900 font-bold">{courseRegistrations.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Ca học / Lịch tuần:</span>
                          <strong className="text-slate-900 font-bold">{events.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Học sinh:</span>
                          <strong className="text-slate-900 font-bold">{students.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Hóa đơn học phí:</span>
                          <strong className="text-slate-900 font-bold">{invoices.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Giảng viên / Gia sư:</span>
                          <strong className="text-slate-900 font-bold">{tutors.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Nhật ký điểm danh:</span>
                          <strong className="text-slate-900 font-bold">{attendanceRecords.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Bài tập đã giao:</span>
                          <strong className="text-slate-900 font-bold">{homeworkList.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Bài nộp học sinh:</span>
                          <strong className="text-slate-900 font-bold">{submissionsList.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between">
                          <span className="text-slate-600">Hồ sơ tuyển sinh:</span>
                          <strong className="text-slate-900 font-bold">{admissionsLeads.length}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between col-span-2 sm:col-span-1">
                          <span className="text-slate-600">Tài khoản quản trị:</span>
                          <strong className="text-slate-900 font-bold">{adminAccounts.length}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Danger Zone - Reset Default Mock Data */}
                  <div className="bg-rose-50/40 rounded-3xl p-6 sm:p-7 border border-rose-200/80 shadow-soft space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            Khôi Phục Dữ Liệu Mẫu Mặc Định (Reset Default Mock Data)
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                              Vùng Nguy Hiểm
                            </span>
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                            Xóa toàn bộ các thay đổi phát sinh trong quá trình trải nghiệm (khóa học mới, đăng ký 4 bước, tài khoản tuyển sinh vừa duyệt, lịch học mới, bài nộp...) và đưa tất cả 11 bộ dữ liệu về trạng thái mẫu ban đầu.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-soft hover:shadow-md active:scale-95 transition-all self-start sm:self-auto shrink-0"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Khôi Phục Dữ Liệu Gốc</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 3: Operational Gateways & Center Config */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-soft space-y-4">
                    <h3 className="font-bold text-slate-900 text-base">Cấu Hình Cổng Vận Hành & Tích Hợp</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-[#F5F3EF] border border-slate-200/60 space-y-1">
                        <span className="font-bold text-slate-800 block">Cổng VietQR NAPAS 247</span>
                        <p className="text-slate-600">Đã kết nối MBBank</p>
                        <code className="text-[11px] font-mono text-slate-700 block">STK: 88880912345678</code>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600">● Hoạt động 24/7</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#F5F3EF] border border-slate-200/60 space-y-1">
                        <span className="font-bold text-slate-800 block">Dịch vụ Zalo ZNS / SMS</span>
                        <p className="text-slate-600">Thông báo tự động</p>
                        <span className="text-[11px] text-slate-700 block">Brandname: EDUCONNECT</span>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600">● Sẵn sàng gửi tin</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#F5F3EF] border border-slate-200/60 space-y-1">
                        <span className="font-bold text-slate-800 block">Khung Giờ Hoạt Động</span>
                        <p className="text-slate-600">Trung tâm & CSKH</p>
                        <span className="text-[11px] text-slate-700 block">07:00 - 21:30 hàng ngày</span>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-sky-600">● Thứ 2 đến Chủ Nhật</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================ */}
          {/* MODULE 2: TUTOR VIEWS                                        */}
          {/* ============================================================ */}
          {currentRole === 'tutor' && (
            <>
              {activeTab === 'earnings' && (
                <div className="space-y-6">
                  <RealtimeSalaryCard
                    tutorName={currentUser?.name || 'Thầy Quang Huy'}
                    events={events}
                    attendanceRecords={attendanceRecords}
                  />

                  {/* Attendance quick launch bar */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Buổi Dạy Hiện Tại: Toán 12 Vận Dụng Cao (07:00 - 08:30)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Phòng A101 • 4 học sinh đã được xếp lớp • Chưa hoàn tất điểm danh hôm nay
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAttendanceOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-soft transition-all self-start md:self-auto"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-300" />
                      <span>Mở giao diện điểm danh & đánh giá</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'availability' && (
                <AvailabilityPicker
                  onSaveAvailability={(slots) => {
                    storage.setItem('educonnect_v1_tutor_availability', slots);
                    showToast('Đã lưu lịch rảnh thành công!', 'success');
                  }}
                />
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsAttendanceOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-soft"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-300" />
                      <span>Mở Modal Điểm Danh</span>
                    </button>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
                    <h3 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
                      Nhật Ký Điểm Danh Gần Đây
                    </h3>
                    <div className="divide-y divide-slate-100 mt-2">
                      {attendanceRecords.map((att) => (
                        <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={att.studentAvatar} alt={att.studentName} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <span className="font-bold text-slate-900 block">{att.studentName}</span>
                              <span className="text-slate-500">{att.remarks}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                              att.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                              att.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {att.status === 'present' ? 'Có mặt' : att.status === 'late' ? 'Muộn' : 'Vắng'}
                            </span>
                            <span className="font-bold text-amber-500 flex items-center gap-0.5">
                              {att.comprehensionRating} <Star className="w-3 h-3 fill-amber-400" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'homework-management' && (
                <HomeworkManagement
                  homeworkList={homeworkList}
                  submissionsList={submissionsList}
                  events={events}
                  students={students}
                  onCreateHomework={handleCreateHomework}
                  onGradeHomework={handleGradeHomework}
                />
              )}

              {activeTab === 'learning-resources' && (
                <LearningResourcesHub
                  resources={courseResources}
                  courses={courses}
                  currentTutorName={currentUser?.name || 'Trần Huy Hoàng'}
                  onAddResource={handleAddResource}
                  onDeleteResource={handleDeleteResource}
                  onUpdateResource={handleUpdateResource}
                />
              )}

              {activeTab === 'messages' && (
                <ChatHub
                  conversations={conversations}
                  messages={chatMessages}
                  currentUser={currentUser}
                  currentRole={currentRole}
                  onSendMessage={handleSendMessage}
                  onCreateConversation={handleCreateConversation}
                  onMarkConversationAsRead={handleMarkConversationAsRead}
                  onUpdateConversation={handleUpdateConversation}
                />
              )}

              {activeTab === 'classes' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Các Lớp Học Đang Phụ Trách</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.slice(0, 4).map((ev) => (
                      <div key={ev.id} className="p-4 rounded-2xl bg-[#F5F3EF] border border-slate-200 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-xs font-bold text-slate-500">Thứ {ev.dayOfWeek + 1} ({ev.startTime} - {ev.endTime})</span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">{ev.title}</h4>
                          <p className="text-xs text-slate-600 mt-1">{ev.room} • {ev.studentNames.join(', ')}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsAttendanceOpen(true);
                          }}
                          className="self-start px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
                        >
                          Điểm danh lớp này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================ */}
          {/* MODULE 3: STUDENT VIEWS                                      */}
          {/* ============================================================ */}
          {currentRole === 'student' && (
            <>
              {activeTab === 'student-dashboard' && (
                <StudentLearningHub
                  student={currentStudent}
                  events={events}
                  homeworkList={homeworkList}
                  submissionsList={submissionsList}
                  resources={courseResources}
                  quizzes={quizzes}
                  quizSubmissions={quizSubmissions}
                  onOpenQuiz={(quiz) => {
                    setActiveTab('homework');
                  }}
                  onNavigateTab={(tab, entityId) => {
                    setActiveTab(tab);
                    if (entityId) setHighlightedEntityId(entityId);
                  }}
                  onOpenOnlineClass={(evt) => {
                    setOnlineClassEvent(evt || null);
                    setIsOnlineClassOpen(true);
                  }}
                />
              )}

              {activeTab === 'student-schedule' && (
                <StudentTimetable
                  events={events}
                  studentName={currentUser?.role === 'student' ? currentUser.name : 'Nguyễn Minh Quân'}
                  studentId={currentStudent?.id || 'stu-1'}
                />
              )}

              {activeTab === 'homework' && (
                <StudentHomeworkView
                  homeworkList={homeworkList}
                  submissionsList={submissionsList}
                  quizzes={quizzes}
                  quizSubmissions={quizSubmissions}
                  studentId="stu-1"
                  studentName={currentUser?.role === 'student' ? currentUser.name : 'Nguyễn Minh Quân'}
                  studentAvatar={
                    currentUser?.role === 'student'
                      ? currentUser.avatar
                      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
                  }
                  onSubmitHomework={handleSubmitHomework}
                  onCompleteQuiz={handleCompleteQuiz}
                />
              )}

              {activeTab === 'online-room' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
                      <Video className="w-8 h-8 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Phòng Học Trực Tuyến Tương Tác</h2>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Tích hợp bảng vẽ kỹ thuật số, chia sẻ màn hình, âm thanh chuẩn HD và thảo luận nhóm 1:1
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <button
                        onClick={() => {
                          setOnlineClassEvent(null);
                          setIsOnlineClassOpen(true);
                        }}
                        className="px-6 py-3 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-soft flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Video className="w-4 h-4 text-amber-300" />
                        <span>Mở Phòng Học Ảo Tương Tác</span>
                      </button>

                      <a
                        href="https://meet.google.com/edu-math-12a"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Chuyển Sang Google Meet Trực Tiếp</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <CourseCatalog
                  courses={courses}
                  onCompleteEnrollment={handleCompleteEnrollment}
                  enrolledCourseTitles={
                    students.find(
                      (s) => s.id === (currentUser?.role === 'student' ? currentUser.id : 'stu-1')
                    )?.enrolledCourses || ['Toán 12 - Chinh Phục Điểm 9+ THPT Quốc Gia & ĐGNL']
                  }
                  currentStudentName={currentUser?.role === 'student' ? currentUser.name : 'Nguyễn Minh Quân'}
                  currentStudentPhone={currentUser?.phone || '0909 112 233'}
                  currentStudentEmail={currentUser?.email || 'quan.nguyen@educonnect.vn'}
                  registrations={courseRegistrations}
                  onUpdateRegistration={(newReg) => {
                    setCourseRegistrations((prev) => [
                      newReg,
                      ...prev.filter((r) => r.id !== newReg.id),
                    ]);
                  }}
                />
              )}

              {activeTab === 'learning-resources' && (
                <StudentResourcesView
                  resources={courseResources}
                  courses={courses}
                  viewerRole="student"
                  studentName={currentUser?.name || 'Nguyễn Minh Quân'}
                />
              )}

              {activeTab === 'student-tuition' && (
                <StudentTuitionCard
                  invoices={invoices}
                  onInvoicesUpdate={setInvoices}
                />
              )}

              {activeTab === 'messages' && (
                <ChatHub
                  conversations={conversations}
                  messages={chatMessages}
                  currentUser={currentUser}
                  currentRole={currentRole}
                  onSendMessage={handleSendMessage}
                  onCreateConversation={handleCreateConversation}
                  onMarkConversationAsRead={handleMarkConversationAsRead}
                  onUpdateConversation={handleUpdateConversation}
                />
              )}
            </>
          )}

          {/* ============================================================ */}
          {/* MODULE 4: PARENT VIEWS                                       */}
          {/* ============================================================ */}
          {currentRole === 'parent' && (
            <div className="space-y-6">
              {/* Child Switcher Component (PRD requirement) */}
              <ChildSwitcher
                childrenList={parentChildren}
                selectedChildId={selectedChildId}
                onSelectChild={setSelectedChildId}
                attendanceRecords={attendanceRecords}
              />

              {activeTab === 'progress' && (
                <ProgressFeed
                  child={currentChild}
                  habits={mockHabitProgressItems}
                />
              )}

              {activeTab === 'parent-tuition' && (
                <ParentTuitionCenter
                  child={currentChild}
                  invoices={invoices}
                  onInvoicesUpdate={setInvoices}
                />
              )}

              {activeTab === 'learning-resources' && (
                <StudentResourcesView
                  resources={courseResources}
                  courses={courses}
                  viewerRole="parent"
                  studentName={currentChild.name}
                />
              )}

              {activeTab === 'messages' && (
                <ChatHub
                  conversations={conversations}
                  messages={chatMessages}
                  currentUser={currentUser}
                  currentRole={currentRole}
                  onSendMessage={handleSendMessage}
                  onCreateConversation={handleCreateConversation}
                  onMarkConversationAsRead={handleMarkConversationAsRead}
                  onUpdateConversation={handleUpdateConversation}
                />
              )}

              {activeTab === 'schedule-view' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Lịch Học Tuần Của {currentChild.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Theo dõi thời gian biểu các buổi học đã được trung tâm sắp xếp
                  </p>
                  <StudentTimetable events={events} studentName={currentChild.name} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onAddEvent={handleAddEvent}
        tutors={tutors}
        existingEvents={events}
        classrooms={classrooms}
      />

      <AttendanceModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        initialRecords={attendanceRecords}
        onSave={handleAttendanceSave}
        onOpenHomeworkModal={() => setIsCreateHomeworkOpen(true)}
      />

      <CreateHomeworkModal
        isOpen={isCreateHomeworkOpen}
        onClose={() => setIsCreateHomeworkOpen(false)}
        events={events}
        onCreateHomework={handleCreateHomework}
      />

      <OnlineClassModal
        isOpen={isOnlineClassOpen}
        onClose={() => setIsOnlineClassOpen(false)}
        classTitle={onlineClassEvent?.title || 'Toán 12 – Chuyên Đề Tích Phân & Giải Tích'}
        tutorName={onlineClassEvent?.tutorName || 'Thầy Trần Huy Hoàng'}
        meetUrl={onlineClassEvent?.onlineMeetingUrl || 'https://meet.google.com/edu-math-12a'}
      />

      <AccountProvisionRequestsModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        pendingLeads={admissionsLeads.filter((l) => l.status === 'pending_provision')}
        onApproveProvision={handleApproveProvision}
      />

      {activeQuizForEngine && (
        <QuizEngineModal
          isOpen={true}
          onClose={() => {
            setActiveQuizForEngine(null);
            setActiveQuizSubmissionForEngine(null);
          }}
          quiz={activeQuizForEngine}
          studentId="stu-1"
          studentName={currentUser?.role === 'student' ? currentUser.name : 'Nguyễn Minh Quân'}
          studentAvatar={
            currentUser?.role === 'student'
              ? currentUser.avatar
              : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
          }
          existingSubmission={activeQuizSubmissionForEngine}
          onCompleteQuiz={handleCompleteQuiz}
        />
      )}

      {/* Reset Default Mock Data Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Khôi Phục Dữ Liệu Gốc?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reset Default Mock Data
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Cảnh báo hành động không thể hoàn tác!
              </p>
              <ul className="list-disc list-inside space-y-1 text-rose-800 pl-1 leading-relaxed">
                <li>Toàn bộ 11 danh mục dữ liệu sẽ được đưa về giá trị mặc định ban đầu từ hệ thống.</li>
                <li>Mọi khóa học, đơn đăng ký 4 bước, tài khoản tuyển sinh đã duyệt, và lịch học mới tạo sẽ bị xóa vĩnh viễn khỏi LocalStorage.</li>
                <li>Phiên đăng nhập Super Admin hiện tại của bạn sẽ vẫn được bảo lưu an toàn.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-soft hover:shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Xác Nhận Khôi Phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
