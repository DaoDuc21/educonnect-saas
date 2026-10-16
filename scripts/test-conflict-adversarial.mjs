#!/usr/bin/env node
/**
 * EduConnect SaaS - Conflict Engine Adversarial Stress Test Suite
 * File: scripts/test-conflict-adversarial.mjs
 * 
 * Tests src/lib/scheduleValidator.ts directly by transpiling TypeScript via Node & typescript.
 * Validates:
 * 1. Physical Room Clash (same room, overlapping times)
 * 2. Tutor Conflict (same tutor, overlapping times, even in different or online rooms)
 * 3. Capacity Overflow (studentCount/studentIds/studentNames exceeding room capacity)
 * 4. Online Room Exemption (multiple concurrent events in "Phòng Online Meet" / Zoom / Google Meet)
 * 5. Edge Times (back-to-back classes e.g. 07:00-08:30 & 08:30-10:00, 1-min boundaries)
 * 6. Invalid Time Range (endTime <= startTime)
 * 7. Resolution & Precedence (invalid_time -> capacity -> tutor -> room)
 * 8. Backward Compatibility (validateScheduleClash alias and hasClash flag)
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 1. Transpile src/lib/scheduleValidator.ts on-the-fly using installed TypeScript compiler
const tsPath = path.join(PROJECT_ROOT, 'node_modules', 'typescript', 'lib', 'typescript.js');
let ts;
try {
  ts = (await import(path.resolve(tsPath))).default;
} catch {
  // Fallback: simple stripping of TypeScript types if ts module load fails
}

const validatorSourcePath = path.join(PROJECT_ROOT, 'src', 'lib', 'scheduleValidator.ts');
const tsCode = fs.readFileSync(validatorSourcePath, 'utf8');

let jsCode;
if (ts && ts.transpileModule) {
  jsCode = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
} else {
  // Lightweight regex transpiler fallback
  jsCode = tsCode
    .replace(/^import\s+type\s+.*?;/gm, '')
    .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?/gm, '')
    .replace(/export\s+interface\s+[\s\S]*?\}\n/g, '')
    .replace(/:\s*[A-Z][A-Za-z0-9_<>\[\]|&\s]*(\/\*.*?\*\/)?(?=[,);=])/g, '')
    .replace(/:\s*(string|number|boolean|any)(\[\])?/g, '');
}

// Dynamically import transpiled JavaScript via Data URL
const moduleDataUrl = 'data:text/javascript;base64,' + Buffer.from(jsCode).toString('base64');
const { validateSmartScheduleConflict, validateScheduleClash } = await import(moduleDataUrl);

assert.strictEqual(typeof validateSmartScheduleConflict, 'function', 'validateSmartScheduleConflict must be a function');
assert.strictEqual(typeof validateScheduleClash, 'function', 'validateScheduleClash must be a function');

// Standard Classrooms Baseline (matching src/data/mockData.ts)
const standardClassrooms = [
  { id: 'room-a101', name: 'Phòng A101 (Offline)', type: 'physical', capacity: 20 },
  { id: 'room-b202', name: 'Phòng Văn B202', type: 'physical', capacity: 25 },
  { id: 'room-vip01', name: 'Phòng VIP 01 (Gia sư 1-1)', type: 'physical', capacity: 4 },
  { id: 'room-vip02', name: 'Phòng VIP 02', type: 'physical', capacity: 6 },
  { id: 'room-lab-stem', name: 'Phòng Lab STEM 1', type: 'lab', capacity: 16 },
  { id: 'room-lab-eng', name: 'Phòng Lab Ngoại Ngữ E1', type: 'lab', capacity: 24 },
  { id: 'room-hoi-truong', name: 'Hội Trường Thi 01', type: 'physical', capacity: 35 },
  { id: 'room-online-meet', name: 'Phòng Online Meet (Google Meet Pro)', type: 'online', capacity: 40 },
];

// Test Harness Statistics
let passed = 0;
let failed = 0;
const failures = [];

function runTest(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, err });
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('================================================================================');
console.log(' Adversarial Conflict Engine Verification (src/lib/scheduleValidator.ts)');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// CATEGORY 1: PHYSICAL ROOM CLASH
// -----------------------------------------------------------------------------
console.log('[Category 1: Physical Room Clash (Trùng phòng vật lý)]');

runTest('R1.1: Partial overlap in same physical room detects room clash', () => {
  const existing = [{
    id: 'ev-1',
    title: 'Toán 12 Cơ Bản',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-1',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '11:00',
    tutorId: 'tut-2',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.hasClash, true);
  assert.strictEqual(res.type, 'room');
  assert.strictEqual(res.conflictingEvent?.id, 'ev-1');
  assert.ok(res.message?.includes('Trùng phòng học'));
});

runTest('R1.2: Exact identical time slot in same physical room triggers room clash', () => {
  const existing = [{
    id: 'ev-2',
    title: 'Ngữ Văn 12',
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '15:30',
    tutorId: 'tut-3',
    room: 'Phòng Văn B202',
  }];
  const candidate = {
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '15:30',
    tutorId: 'tut-4',
    room: 'Phòng Văn B202',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'room');
});

runTest('R1.3: Enclosed time slot (inner event fully within outer event) triggers room clash', () => {
  const existing = [{
    id: 'ev-3',
    dayOfWeek: 3,
    startTime: '07:00',
    endTime: '11:00',
    tutorId: 'tut-1',
    room: 'Phòng VIP 02',
  }];
  const candidate = {
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '09:00',
    tutorId: 'tut-2',
    room: 'Phòng VIP 02',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'room');
});

runTest('R1.4: Enclosing time slot (outer event engulfs inner event) triggers room clash', () => {
  const existing = [{
    id: 'ev-4',
    dayOfWeek: 3,
    startTime: '08:30',
    endTime: '09:30',
    tutorId: 'tut-1',
    room: 'Phòng VIP 02',
  }];
  const candidate = {
    dayOfWeek: 3,
    startTime: '07:30',
    endTime: '10:30',
    tutorId: 'tut-2',
    room: 'Phòng VIP 02',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'room');
});

runTest('R1.5: Room name case-insensitivity and whitespace padding tolerance', () => {
  const existing = [{
    id: 'ev-5',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 4,
    startTime: '08:30',
    endTime: '09:30',
    room: '  phòng a101 (offline)  ',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'room');
});

runTest('R1.6: Different physical rooms at identical time slot do NOT conflict', () => {
  const existing = [{
    id: 'ev-6',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-1',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-2',
    room: 'Phòng Văn B202',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
  assert.strictEqual(res.hasClash, false);
});

runTest('R1.7: Same physical room on different days of week does NOT conflict', () => {
  const existing = [{
    id: 'ev-7',
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 2, // Tuesday
    startTime: '08:00',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

runTest('R1.8: Self-event update exemption (same id) does NOT conflict with itself', () => {
  const existing = [{
    id: 'ev-update-1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  }];
  const updateCandidate = {
    id: 'ev-update-1',
    dayOfWeek: 1,
    startTime: '08:30',
    endTime: '10:30',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(updateCandidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

// -----------------------------------------------------------------------------
// CATEGORY 2: TUTOR CONFLICT
// -----------------------------------------------------------------------------
console.log('\n[Category 2: Tutor Conflict (Trùng lịch giảng viên)]');

runTest('R2.1: Same tutor in two different rooms during overlapping times triggers tutor conflict', () => {
  const existing = [{
    id: 'ev-tut-1',
    title: 'Toán 12 Thầy Hoàng',
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-hoang',
    tutorName: 'Thầy Hoàng',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '11:00',
    tutorId: 'tut-hoang',
    room: 'Phòng VIP 02',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'tutor');
  assert.strictEqual(res.conflictingEvent?.id, 'ev-tut-1');
  assert.ok(res.message?.includes('Trùng lịch giảng viên'));
});

runTest('R2.2: Same tutor with exact same time slot triggers tutor conflict', () => {
  const existing = [{
    id: 'ev-tut-2',
    dayOfWeek: 3,
    startTime: '14:00',
    endTime: '15:30',
    tutorId: 'tut-mai',
    room: 'Phòng VIP 01 (Gia sư 1-1)',
  }];
  const candidate = {
    dayOfWeek: 3,
    startTime: '14:00',
    endTime: '15:30',
    tutorId: 'tut-mai',
    room: 'Phòng Lab STEM 1',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'tutor');
});

runTest('R2.3: Same tutor in physical room and online room simultaneously triggers tutor conflict', () => {
  const existing = [{
    id: 'ev-tut-3',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-hoang',
    room: 'Phòng Online Meet (Google Meet Pro)',
  }];
  const candidate = {
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '11:00',
    tutorId: 'tut-hoang',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'tutor');
});

runTest('R2.4: Same tutor in two online rooms simultaneously triggers tutor conflict', () => {
  const existing = [{
    id: 'ev-tut-4',
    dayOfWeek: 5,
    startTime: '19:00',
    endTime: '20:30',
    tutorId: 'tut-lan',
    room: 'Phòng Online Meet (Google Meet Pro)',
  }];
  const candidate = {
    dayOfWeek: 5,
    startTime: '19:30',
    endTime: '21:00',
    tutorId: 'tut-lan',
    room: 'Phòng Online Meet (Google Meet Pro)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'tutor');
});

runTest('R2.5: Same tutor on different days of week does NOT trigger conflict', () => {
  const existing = [{
    id: 'ev-tut-5',
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-hoang',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-hoang',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

// -----------------------------------------------------------------------------
// CATEGORY 3: ROOM CAPACITY OVERFLOW
// -----------------------------------------------------------------------------
console.log('\n[Category 3: Capacity Overflow (Quá tải sức chứa phòng)]');

runTest('R3.1: Student count exceeds room capacity (6 students in VIP room with capacity 4)', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'Phòng VIP 01 (Gia sư 1-1)',
    studentCount: 6,
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'capacity');
  assert.strictEqual(res.roomCapacity, 4);
  assert.strictEqual(res.studentCount, 6);
  assert.ok(res.message?.includes('Quá tải sĩ số phòng học'));
  assert.ok(res.message?.includes('tối đa 4'));
});

runTest('R3.2: Capacity overflow detected via studentIds array length', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'Phòng VIP 01 (Gia sư 1-1)',
    studentIds: ['stu-1', 'stu-2', 'stu-3', 'stu-4', 'stu-5'],
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'capacity');
  assert.strictEqual(res.studentCount, 5);
  assert.strictEqual(res.roomCapacity, 4);
});

runTest('R3.3: Capacity overflow detected via studentNames array length', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'Phòng VIP 02', // capacity 6
    studentNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], // 7 students
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'capacity');
  assert.strictEqual(res.studentCount, 7);
  assert.strictEqual(res.roomCapacity, 6);
});

runTest('R3.4: Exact capacity limit (4 students in room with capacity 4) is ALLOWED', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'Phòng VIP 01 (Gia sư 1-1)',
    studentCount: 4,
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

runTest('R3.5: Student count below capacity (2 students in room with capacity 4) is ALLOWED', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'Phòng VIP 01 (Gia sư 1-1)',
    studentCount: 2,
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

runTest('R3.6: Explicit roomCapacity prop on newEvent takes precedence', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'Phòng Tùy Chỉnh',
    roomCapacity: 8,
    studentCount: 10,
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'capacity');
  assert.strictEqual(res.roomCapacity, 8);
  assert.strictEqual(res.studentCount, 10);
});

runTest('R3.7: Room lookup by ID resolves capacity correctly', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'room-vip01', // lookup by id
    studentCount: 5,
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'capacity');
  assert.strictEqual(res.roomCapacity, 4);
});

// -----------------------------------------------------------------------------
// CATEGORY 4: ONLINE ROOM EXEMPTION
// -----------------------------------------------------------------------------
console.log('\n[Category 4: Online Room Exemption (Miễn trừ phòng online)]');

runTest('R4.1: Multiple simultaneous events in "Phòng Online Meet (Google Meet Pro)" do NOT clash', () => {
  const existing = [{
    id: 'ev-on-1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-1',
    room: 'Phòng Online Meet (Google Meet Pro)',
  }];
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:30',
    endTime: '09:30',
    tutorId: 'tut-2', // different tutor
    room: 'Phòng Online Meet (Google Meet Pro)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
  assert.strictEqual(res.hasClash, false);
});

runTest('R4.2: Triple concurrent online sessions with different tutors succeed without clash', () => {
  const existing = [
    { id: 'on-1', dayOfWeek: 2, startTime: '19:00', endTime: '20:30', tutorId: 'tut-1', room: 'Phòng Online Meet (Google Meet Pro)' },
    { id: 'on-2', dayOfWeek: 2, startTime: '19:00', endTime: '20:30', tutorId: 'tut-2', room: 'Phòng Online Meet (Google Meet Pro)' },
  ];
  const candidate = {
    dayOfWeek: 2,
    startTime: '19:00',
    endTime: '20:30',
    tutorId: 'tut-3',
    room: 'Phòng Online Meet (Google Meet Pro)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

runTest('R4.3: Generic "online", "zoom", and "google meet" naming heuristics exempted from room clash', () => {
  const rooms = [
    'Lớp Học Trực Tuyến Online K12',
    'Phòng Google Meet Chuyên Đề',
    'Hội Thảo Zoom Pro 01',
  ];
  for (const r of rooms) {
    const existing = [{
      id: `ev-${r}`,
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '10:00',
      tutorId: 'tut-1',
      room: r,
    }];
    const candidate = {
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '10:00',
      tutorId: 'tut-2',
      room: r,
    };
    const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
    assert.strictEqual(res.hasConflict, false, `Room "${r}" should be exempt from room clash`);
  }
});

runTest('R4.4: Classroom with type="online" exempted even if name has no keywords', () => {
  const customClassrooms = [
    { id: 'room-virt-99', name: 'Không Gian Tri Thức V4', type: 'online', capacity: 100 },
  ];
  const existing = [{
    id: 'ev-virt-1',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-1',
    room: 'Không Gian Tri Thức V4',
  }];
  const candidate = {
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-2',
    room: 'Không Gian Tri Thức V4',
  };
  const res = validateSmartScheduleConflict(candidate, existing, customClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

// -----------------------------------------------------------------------------
// CATEGORY 5: EDGE TIMES (BACK-TO-BACK & MINUTE BOUNDARIES)
// -----------------------------------------------------------------------------
console.log('\n[Category 5: Edge Times (Back-to-back & Minute Boundaries)]');

runTest('R5.1: Back-to-back classes in same physical room (07:00-08:30 and 08:30-10:00) do NOT conflict', () => {
  const existing = [{
    id: 'ev-edge-1',
    dayOfWeek: 1,
    startTime: '07:00',
    endTime: '08:30',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:30',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
  assert.strictEqual(res.hasClash, false);
});

runTest('R5.2: Back-to-back classes for same tutor (07:00-08:30 and 08:30-10:00) do NOT conflict', () => {
  const existing = [{
    id: 'ev-edge-2',
    dayOfWeek: 1,
    startTime: '07:00',
    endTime: '08:30',
    tutorId: 'tut-hoang',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:30',
    endTime: '10:00',
    tutorId: 'tut-hoang',
    room: 'Phòng Văn B202',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

runTest('R5.3: Reverse order back-to-back (existing is 08:30-10:00, candidate is 07:00-08:30)', () => {
  const existing = [{
    id: 'ev-edge-3',
    dayOfWeek: 2,
    startTime: '08:30',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 2,
    startTime: '07:00',
    endTime: '08:30',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

runTest('R5.4: 1-minute overlap (07:00-08:31 vs 08:30-10:00) in same room MUST trigger room clash', () => {
  const existing = [{
    id: 'ev-edge-4',
    dayOfWeek: 3,
    startTime: '07:00',
    endTime: '08:31',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 3,
    startTime: '08:30',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'room');
});

runTest('R5.5: 1-minute gap (07:00-08:29 vs 08:30-10:00) does NOT conflict', () => {
  const existing = [{
    id: 'ev-edge-5',
    dayOfWeek: 3,
    startTime: '07:00',
    endTime: '08:29',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 3,
    startTime: '08:30',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.hasConflict, false);
});

// -----------------------------------------------------------------------------
// CATEGORY 6: INVALID TIME RANGES
// -----------------------------------------------------------------------------
console.log('\n[Category 6: Invalid Time Ranges]');

runTest('R6.1: Zero duration (endTime == startTime) triggers invalid_time', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:30',
    endTime: '08:30',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'invalid_time');
  assert.ok(res.message?.includes('Thời gian kết thúc ca học phải sau'));
});

runTest('R6.2: Inverted time range (endTime < startTime) triggers invalid_time', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '08:00',
    room: 'Phòng A101 (Offline)',
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.hasConflict, true);
  assert.strictEqual(res.type, 'invalid_time');
});

// -----------------------------------------------------------------------------
// CATEGORY 7: PRECEDENCE AND MULTI-FAULT RESOLUTION
// -----------------------------------------------------------------------------
console.log('\n[Category 7: Multi-Fault Precedence]');

runTest('R7.1: Invalid time takes precedence over capacity overflow and clashes', () => {
  const candidate = {
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '08:00', // invalid
    room: 'Phòng VIP 01 (Gia sư 1-1)',
    studentCount: 100, // capacity overflow
  };
  const res = validateSmartScheduleConflict(candidate, [], standardClassrooms);
  assert.strictEqual(res.type, 'invalid_time');
});

runTest('R7.2: Capacity overflow takes precedence over overlap clashes', () => {
  const existing = [{
    id: 'ev-ov-1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-1',
    room: 'Phòng VIP 01 (Gia sư 1-1)',
  }];
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:30',
    endTime: '09:30',
    tutorId: 'tut-1', // tutor clash
    room: 'Phòng VIP 01 (Gia sư 1-1)', // room clash
    studentCount: 10, // capacity overflow (10 > 4)
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.type, 'capacity');
});

runTest('R7.3: Tutor clash takes precedence over room clash', () => {
  const existing = [{
    id: 'ev-tut-room-1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    tutorId: 'tut-1',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 1,
    startTime: '08:30',
    endTime: '09:30',
    tutorId: 'tut-1', // same tutor
    room: 'Phòng A101 (Offline)', // same room
    studentCount: 2, // capacity ok
  };
  const res = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.strictEqual(res.type, 'tutor');
});

// -----------------------------------------------------------------------------
// CATEGORY 8: BACKWARD COMPATIBILITY ALIAS
// -----------------------------------------------------------------------------
console.log('\n[Category 8: Backward Compatibility Alias]');

runTest('R8.1: validateScheduleClash produces 100% identical output to validateSmartScheduleConflict', () => {
  const existing = [{
    id: 'ev-legacy-1',
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '10:00',
    room: 'Phòng A101 (Offline)',
  }];
  const candidate = {
    dayOfWeek: 2,
    startTime: '08:30',
    endTime: '09:30',
    room: 'Phòng A101 (Offline)',
  };
  const resClash = validateScheduleClash(candidate, existing, standardClassrooms);
  const resConflict = validateSmartScheduleConflict(candidate, existing, standardClassrooms);
  assert.deepStrictEqual(resClash, resConflict);
  assert.strictEqual(resClash.hasClash, true);
  assert.strictEqual(resClash.hasConflict, true);
});

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log(` Adversarial Test Suite Summary:`);
console.log(`   Total Tests:  ${passed + failed}`);
console.log(`   Passed:       ${passed}`);
console.log(`   Failed:       ${failed}`);
console.log('================================================================================');

if (failed > 0) {
  console.error('\nFAILURES:');
  failures.forEach((f, idx) => console.error(`${idx + 1}. ${f.name}: ${f.err.message}`));
  process.exit(1);
} else {
  console.log('\nSTATUS: ALL ADVERSARIAL TESTS PASSED (Exit Code: 0)\n');
  process.exit(0);
}
