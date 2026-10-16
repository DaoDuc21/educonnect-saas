# Project: EduConnect SaaS Production-Ready System

## Architecture
- **Framework**: Next.js 14.2.18 (App Router), React 18.3.1, TypeScript 5.6.3, Tailwind CSS 3.4.15.
- **Design System**: Warm neutral canvas (`#F5F3EF`), `#0F172A` primary, Maham Timetable & Be.run Dashboard aesthetic.
- **State Management**: Centralized isomorphic state management in `src/app/page.tsx` backed by client persistence (`src/lib/storage.ts`).
- **User Roles & Personas**:
  1. Super Admin, Academic Coordinator, Admissions (`admin`)
  2. Teacher / Tutor (`tutor`)
  3. Student (`student`)
  4. Parent (`parent` with multi-child switcher)

## Code Layout
- `src/app/page.tsx`: Central SPA coordinator, view routing, role switching, state management.
- `src/types/index.ts`: Domain models and schemas.
- `src/data/`: Default mock data collections.
- `src/lib/storage.ts`: Persistence manager, versioned keys (`educonnect_v1_*`), localStorage wrapper, reset helper.
- `src/lib/exportUtils.ts`: Excel / CSV / Print export utilities with UTF-8 BOM.
- `src/components/layout/Header.tsx`: Header navigation, user profile, interactive notification popover with unread counter.
- `src/components/layout/Sidebar.tsx`: Navigation menu with active tabs per role, permissions badge, logout.
- `src/components/admin/AnalyticsDashboard.tsx`: Visual analytics (attendance, homework, revenue, tutor teaching hours).
- `src/components/resources/LearningResourcesHub.tsx`: Course & class learning resources and recorded video sessions repository.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F1: Data Persistence Layer | Typesafe LocalStorage persistence for 11 collections + auth session; isomorphic hydration; F5 preservation | M1 | ORIGINAL_REQUEST §R1 |
| 2 | F2: Reset Default Mock Data | System Settings interactive reset button with confirmation modal to reseed default data | M1 | ORIGINAL_REQUEST §R1 |
| 3 | F3: Notification Center UI & Store | Bell icon in Header, unread badge, interactive popover, mark read, delete, clear all | M2 | ORIGINAL_REQUEST §R2 |
| 4 | F4: Real-time Event Triggers & Deep Linking | Auto-generate notifications on registrations, homework, grading, tuition, and deep link to views | M2 | ORIGINAL_REQUEST §R2 |
| 5 | F5: Analytics Dashboard | Visual analytics for Admin/Coordinator (attendance rate, homework completion, revenue growth, tutor hours) | M3 | ORIGINAL_REQUEST §R3 |
| 6 | F6: Data Export Functions | Working Excel, CSV (UTF-8 BOM), and formatted Print for Payroll, Student Roster, and Tuition Invoices | M3 | ORIGINAL_REQUEST §R3 |
| 7 | F7: Learning Resources Hub | Class/course library for PDFs/slides/exams and Google Meet recording links with role-based access | M4 | ORIGINAL_REQUEST §R4 |
| 8 | F8: Full E2E & Production Verification | TypeScript zero errors, `npm run build` exit code 0, responsive design QA, and end-to-end user workflows | M5 | ORIGINAL_REQUEST AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Data Persistence Layer & Reset Defaults | F1, F2: `storage.ts`, state synchronization, Settings reset modal | none | DONE |
| M2 | Notification Center & Deep-Linking | F3, F4: `AppNotification` type, Header bell, live event triggers, tab navigation | M1 | IN_PROGRESS |
| M3 | Analytics Dashboard & Export Suite | F5, F6: Analytics tab, 4 SVG visual charts, `exportUtils.ts` (Excel/CSV/Print) | M1 | PLANNED |
| M4 | Learning Resources Hub & Videos | F7: Resource library, teacher upload, student/parent view/download, Meet links | M1 | PLANNED |
| M5 | Final E2E Integration & Verification | F8: E2E test suite (Tiers 1-4), adversarial test hardening (Tier 5), build exit code 0 | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### M1: Storage Interface (`src/lib/storage.ts`)
```typescript
export interface StorageManager {
  getItem<T>(key: string, defaultValue: T): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  loadAll(): PersistedAppData;
  saveAll(data: Partial<PersistedAppData>): void;
  resetAllToDefaults(): PersistedAppData;
}
```

### M2: Notification Interface (`src/types/index.ts`)
```typescript
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'homework' | 'tuition' | 'schedule';
  timestamp: string;
  isRead: boolean;
  targetRole: UserRole | 'all';
  targetTab?: string;
  actionUrl?: string;
  entityId?: string;
}
```

### M3: Export Utilities Interface (`src/lib/exportUtils.ts`)
```typescript
export interface ExportColumn<T> {
  header: string;
  key: keyof T | ((item: T) => string | number);
}
export function exportToCSV<T>(filename: string, columns: ExportColumn<T>[], data: T[]): void;
export function exportToExcel<T>(filename: string, columns: ExportColumn<T>[], data: T[]): void;
export function printFormattedTable<T>(title: string, columns: ExportColumn<T>[], data: T[]): void;
```

### M4: Learning Resources Interface (`src/types/index.ts`)
```typescript
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
```
