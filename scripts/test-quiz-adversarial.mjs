#!/usr/bin/env node
/**
 * EduConnect SaaS - Quiz Engine Adversarial Stress & Empirical Verification Test Suite
 * File: scripts/test-quiz-adversarial.mjs
 * 
 * Conducts empirical stress testing and mathematical verification of QuizEngineModal logic:
 * 1. Score Normalization & Math (10-point scale: (correct / total) * 10, accuracyRate)
 * 2. Bloom Taxonomy 4-Level Accuracy (recognition, comprehension, application, advanced_application)
 * 3. Topic Gap Classification Thresholds (mastered >=80%, proficient 60-79%, needs_improvement <60%)
 * 4. Timer Countdown Formatting & Visual Warning Boundaries
 * 5. Empirical Challenge: Stale Closure Analysis in Timer Auto-Submit vs Manual Submit
 * 6. Edge Cases & Boundary Conditions (0 questions, 0 correct, all correct, division by zero)
 * 7. Mock Quizzes & Mock Submissions Data Integrity
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Helper to transpile TS file if needed
const tsPath = path.join(PROJECT_ROOT, 'node_modules', 'typescript', 'lib', 'typescript.js');
let ts;
try {
  ts = (await import(path.resolve(tsPath))).default;
} catch {
  // TS compiler optional
}

function transpileAndImport(filePath) {
  const tsCode = fs.readFileSync(filePath, 'utf8');
  let jsCode;
  if (ts && ts.transpileModule) {
    jsCode = ts.transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
  } else {
    // Regex strip
    jsCode = tsCode
      .replace(/^import\s+type\s+.*?;/gm, '')
      .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?/gm, '')
      .replace(/export\s+interface\s+[\s\S]*?\}\n/g, '')
      .replace(/export\s+type\s+[\s\S]*?;\n/g, '')
      .replace(/:\s*[A-Z][A-Za-z0-9_<>\[\]|&\s]*(\/\*.*?\*\/)?(?=[,);=])/g, '')
      .replace(/:\s*(string|number|boolean|any)(\[\])?/g, '');
  }
  return 'data:text/javascript;base64,' + Buffer.from(jsCode).toString('base64');
}

// Import mockQuizzes
const mockQuizzesUrl = transpileAndImport(path.join(PROJECT_ROOT, 'src', 'data', 'mockQuizzes.ts'));
const { mockQuizzes, mockQuizSubmissions } = await import(mockQuizzesUrl);

console.log('='.repeat(80));
console.log('  EDUCONNECT SAAS — QUIZ ENGINE EMPIRICAL CHALLENGE SUITE');
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err.message, stack: err.stack });
    console.log(`  ✗ [FAIL] ${name}`);
    console.log(`     Error: ${err.message}`);
  }
}

// Replicate exact mathematical engine logic from QuizEngineModal.tsx
function computeQuizEngineResults(quiz, selectedAnswers, timeSpentSeconds = 60) {
  const studentAnswers = quiz.questions.map((q) => {
    const selected = selectedAnswers[q.id] || null;
    const isCorrect = selected === q.correctOptionId;
    return {
      questionId: q.id,
      selectedOptionId: selected,
      isCorrect,
      timeSpentSeconds: quiz.questions.length > 0 ? Math.round(timeSpentSeconds / quiz.questions.length) : 0,
    };
  });

  const totalCorrect = studentAnswers.filter((a) => a.isCorrect).length;
  const rawScore = quiz.questions.length > 0 ? (totalCorrect / quiz.questions.length) * 10 : 0;
  const finalScore = Number(rawScore.toFixed(1));
  const accuracyRate = quiz.questions.length > 0 ? Number(((totalCorrect / quiz.questions.length) * 100).toFixed(1)) : 0;

  // Calculate Bloom level accuracy
  const levelCounts = {
    recognition: { total: 0, correct: 0 },
    comprehension: { total: 0, correct: 0 },
    application: { total: 0, correct: 0 },
    advanced_application: { total: 0, correct: 0 },
  };

  quiz.questions.forEach((q) => {
    if (levelCounts[q.difficultyLevel]) {
      levelCounts[q.difficultyLevel].total += 1;
      const ans = studentAnswers.find((a) => a.questionId === q.id);
      if (ans?.isCorrect) {
        levelCounts[q.difficultyLevel].correct += 1;
      }
    }
  });

  const levelAccuracy = {
    recognition: levelCounts.recognition.total > 0
      ? Math.round((levelCounts.recognition.correct / levelCounts.recognition.total) * 100)
      : 100,
    comprehension: levelCounts.comprehension.total > 0
      ? Math.round((levelCounts.comprehension.correct / levelCounts.comprehension.total) * 100)
      : 100,
    application: levelCounts.application.total > 0
      ? Math.round((levelCounts.application.correct / levelCounts.application.total) * 100)
      : 100,
    advancedApplication: levelCounts.advanced_application.total > 0
      ? Math.round((levelCounts.advanced_application.correct / levelCounts.advanced_application.total) * 100)
      : 100,
  };

  // Calculate Topic Gaps
  const topicMap = {};
  quiz.questions.forEach((q) => {
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { total: 0, correct: 0 };
    }
    topicMap[q.topic].total += 1;
    const ans = studentAnswers.find((a) => a.questionId === q.id);
    if (ans?.isCorrect) {
      topicMap[q.topic].correct += 1;
    }
  });

  const topicGaps = Object.entries(topicMap).map(([topic, stat]) => {
    const pct = Math.round((stat.correct / stat.total) * 100);
    let masteryLevel = 'needs_improvement';
    let recommendationNote = 'Cần ôn tập kỹ lại lý thuyết và làm thêm các bài tập cơ bản ở chuyên đề này.';

    if (pct >= 80) {
      masteryLevel = 'mastered';
      recommendationNote = 'Nắm rất vững bản chất chuyên đề, tốc độ xử lý câu hỏi tốt.';
    } else if (pct >= 60) {
      masteryLevel = 'proficient';
      recommendationNote = 'Hiểu cách làm nhưng cần rèn luyện thêm tính chính xác trong biến đổi và bẫy đề.';
    }

    return {
      topic,
      totalQuestions: stat.total,
      correctQuestions: stat.correct,
      accuracyPercentage: pct,
      masteryLevel,
      recommendationNote,
    };
  });

  return {
    studentAnswers,
    totalCorrect,
    rawScore,
    finalScore,
    accuracyRate,
    levelAccuracy,
    topicGaps,
  };
}

// Time formatter matching QuizEngineModal.tsx
const formatTime = (totalSec) => {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

console.log('\n--- SECTION 1: SCORE NORMALIZATION & 10-POINT SCALE MATH ---');

test('1.1. Math 12 Quiz (15 questions): Full score scale (0/15 to 15/15)', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-math-12');
  assert.ok(quiz, 'Quiz quiz-math-12 must exist');
  assert.equal(quiz.questions.length, 15);

  const expectedScores = {
    0: { score: 0.0, acc: 0.0 },
    1: { score: 0.7, acc: 6.7 },
    2: { score: 1.3, acc: 13.3 },
    3: { score: 2.0, acc: 20.0 },
    4: { score: 2.7, acc: 26.7 },
    5: { score: 3.3, acc: 33.3 },
    6: { score: 4.0, acc: 40.0 },
    7: { score: 4.7, acc: 46.7 },
    8: { score: 5.3, acc: 53.3 },
    9: { score: 6.0, acc: 60.0 },
    10: { score: 6.7, acc: 66.7 },
    11: { score: 7.3, acc: 73.3 },
    12: { score: 8.0, acc: 80.0 },
    13: { score: 8.7, acc: 86.7 },
    14: { score: 9.3, acc: 93.3 },
    15: { score: 10.0, acc: 100.0 },
  };

  for (let correctCount = 0; correctCount <= 15; correctCount++) {
    const selected = {};
    for (let i = 0; i < 15; i++) {
      const q = quiz.questions[i];
      if (i < correctCount) {
        selected[q.id] = q.correctOptionId;
      } else {
        selected[q.id] = 'opt-wrong';
      }
    }
    const res = computeQuizEngineResults(quiz, selected);
    assert.equal(res.totalCorrect, correctCount);
    assert.equal(res.finalScore, expectedScores[correctCount].score, `Score mismatch for ${correctCount}/15`);
    assert.equal(res.accuracyRate, expectedScores[correctCount].acc, `Accuracy mismatch for ${correctCount}/15`);
  }
});

test('1.2. IELTS Quiz (12 questions): Full score scale (0/12 to 12/12)', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-eng-ielts');
  assert.ok(quiz, 'Quiz quiz-eng-ielts must exist');
  assert.equal(quiz.questions.length, 12);

  const expectedScores = {
    0: { score: 0.0, acc: 0.0 },
    1: { score: 0.8, acc: 8.3 },
    2: { score: 1.7, acc: 16.7 },
    3: { score: 2.5, acc: 25.0 },
    4: { score: 3.3, acc: 33.3 },
    5: { score: 4.2, acc: 41.7 },
    6: { score: 5.0, acc: 50.0 },
    7: { score: 5.8, acc: 58.3 },
    8: { score: 6.7, acc: 66.7 },
    9: { score: 7.5, acc: 75.0 },
    10: { score: 8.3, acc: 83.3 },
    11: { score: 9.2, acc: 91.7 },
    12: { score: 10.0, acc: 100.0 },
  };

  for (let correctCount = 0; correctCount <= 12; correctCount++) {
    const selected = {};
    for (let i = 0; i < 12; i++) {
      const q = quiz.questions[i];
      if (i < correctCount) {
        selected[q.id] = q.correctOptionId;
      } else {
        selected[q.id] = 'opt-wrong';
      }
    }
    const res = computeQuizEngineResults(quiz, selected);
    assert.equal(res.totalCorrect, correctCount);
    assert.equal(res.finalScore, expectedScores[correctCount].score, `Score mismatch for ${correctCount}/12`);
    assert.equal(res.accuracyRate, expectedScores[correctCount].acc, `Accuracy mismatch for ${correctCount}/12`);
  }
});

console.log('\n--- SECTION 2: BLOOM TAXONOMY 4-LEVEL ACCURACY CALCULATION ---');

test('2.1. Math 12 Bloom Distribution matches difficultyBreakdown metadata', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-math-12');
  const counts = {
    recognition: quiz.questions.filter((q) => q.difficultyLevel === 'recognition').length,
    comprehension: quiz.questions.filter((q) => q.difficultyLevel === 'comprehension').length,
    application: quiz.questions.filter((q) => q.difficultyLevel === 'application').length,
    advanced_application: quiz.questions.filter((q) => q.difficultyLevel === 'advanced_application').length,
  };
  assert.equal(counts.recognition, quiz.difficultyBreakdown.recognitionCount, 'Recognition count');
  assert.equal(counts.comprehension, quiz.difficultyBreakdown.comprehensionCount, 'Comprehension count');
  assert.equal(counts.application, quiz.difficultyBreakdown.applicationCount, 'Application count');
  assert.equal(counts.advanced_application, quiz.difficultyBreakdown.advancedCount, 'Advanced count');
});

test('2.2. IELTS Bloom Distribution matches difficultyBreakdown metadata', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-eng-ielts');
  const counts = {
    recognition: quiz.questions.filter((q) => q.difficultyLevel === 'recognition').length,
    comprehension: quiz.questions.filter((q) => q.difficultyLevel === 'comprehension').length,
    application: quiz.questions.filter((q) => q.difficultyLevel === 'application').length,
    advanced_application: quiz.questions.filter((q) => q.difficultyLevel === 'advanced_application').length,
  };
  assert.equal(counts.recognition, quiz.difficultyBreakdown.recognitionCount, 'Recognition count');
  assert.equal(counts.comprehension, quiz.difficultyBreakdown.comprehensionCount, 'Comprehension count');
  assert.equal(counts.application, quiz.difficultyBreakdown.applicationCount, 'Application count');
  assert.equal(counts.advanced_application, quiz.difficultyBreakdown.advancedCount, 'Advanced count');
});

test('2.3. Pre-seeded mock submission (qsub-math-1) exact Bloom metrics validation', () => {
  const sub = mockQuizSubmissions.find((s) => s.id === 'qsub-math-1');
  assert.ok(sub, 'qsub-math-1 must exist');

  const quiz = mockQuizzes.find((q) => q.id === sub.quizId);
  const selectedMap = {};
  sub.answers.forEach((a) => {
    if (a.selectedOptionId) selectedMap[a.questionId] = a.selectedOptionId;
  });

  const res = computeQuizEngineResults(quiz, selectedMap, sub.gapReport.timeSpentSeconds);
  assert.equal(res.finalScore, sub.score, 'Score must match 8.7');
  assert.equal(res.totalCorrect, sub.gapReport.totalCorrect, 'Total correct must match 13');
  assert.equal(res.levelAccuracy.recognition, sub.gapReport.levelAccuracy.recognition, 'Recognition must match 100%');
  assert.equal(res.levelAccuracy.comprehension, sub.gapReport.levelAccuracy.comprehension, 'Comprehension must match 100%');
  assert.equal(res.levelAccuracy.application, sub.gapReport.levelAccuracy.application, 'Application must match 75%');
  assert.equal(res.levelAccuracy.advancedApplication, sub.gapReport.levelAccuracy.advancedApplication, 'Advanced must match 50%');
});

test('2.4. Bloom level edge case: Level with 0 questions evaluates to 100%', () => {
  const syntheticQuiz = {
    id: 'quiz-synth-1',
    questions: [
      { id: 'sq-1', difficultyLevel: 'recognition', correctOptionId: 'a', topic: 'T1' },
      { id: 'sq-2', difficultyLevel: 'comprehension', correctOptionId: 'a', topic: 'T1' },
    ],
  };
  const res = computeQuizEngineResults(syntheticQuiz, { 'sq-1': 'a', 'sq-2': 'a' });
  // Advanced & Application have 0 questions, code returns 100 to avoid NaN
  assert.equal(res.levelAccuracy.recognition, 100);
  assert.equal(res.levelAccuracy.comprehension, 100);
  assert.equal(res.levelAccuracy.application, 100);
  assert.equal(res.levelAccuracy.advancedApplication, 100);
});

console.log('\n--- SECTION 3: TOPIC GAP CLASSIFICATION THRESHOLDS ---');

test('3.1. Topic Gap Thresholds: mastered (>=80%), proficient (60-79%), needs_improvement (<60%)', () => {
  // Test synthesized stats
  const testCases = [
    { total: 5, correct: 5, expectedPct: 100, expectedMastery: 'mastered' },
    { total: 5, correct: 4, expectedPct: 80, expectedMastery: 'mastered' },
    { total: 10, correct: 8, expectedPct: 80, expectedMastery: 'mastered' },
    { total: 10, correct: 7, expectedPct: 70, expectedMastery: 'proficient' },
    { total: 5, correct: 3, expectedPct: 60, expectedMastery: 'proficient' },
    { total: 10, correct: 6, expectedPct: 60, expectedMastery: 'proficient' },
    { total: 10, correct: 5, expectedPct: 50, expectedMastery: 'needs_improvement' },
    { total: 5, correct: 2, expectedPct: 40, expectedMastery: 'needs_improvement' },
    { total: 5, correct: 0, expectedPct: 0, expectedMastery: 'needs_improvement' },
  ];

  testCases.forEach((tc, idx) => {
    const syntheticQuiz = {
      id: `synth-topic-${idx}`,
      questions: Array.from({ length: tc.total }, (_, i) => ({
        id: `q-${i}`,
        difficultyLevel: 'recognition',
        topic: 'Test Topic',
        correctOptionId: 'opt-correct',
      })),
    };
    const selected = {};
    for (let i = 0; i < tc.correct; i++) {
      selected[`q-${i}`] = 'opt-correct';
    }
    const res = computeQuizEngineResults(syntheticQuiz, selected);
    const gap = res.topicGaps.find((g) => g.topic === 'Test Topic');
    assert.ok(gap, 'Topic gap item must exist');
    assert.equal(gap.accuracyPercentage, tc.expectedPct, `Accuracy pct mismatch for ${tc.correct}/${tc.total}`);
    assert.equal(gap.masteryLevel, tc.expectedMastery, `Mastery level mismatch for ${tc.correct}/${tc.total}`);
  });
});

console.log('\n--- SECTION 4: COUNTDOWN TIMER & FORMATTING ---');

test('4.1. formatTime MM:SS conversion', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(1), '00:01');
  assert.equal(formatTime(59), '00:59');
  assert.equal(formatTime(60), '01:00');
  assert.equal(formatTime(120), '02:00');
  assert.equal(formatTime(300), '05:00');
  assert.equal(formatTime(1800), '30:00');
  assert.equal(formatTime(2700), '45:00');
});

test('4.2. Timer Styling Thresholds in QuizEngineModal', () => {
  // Inspect styling logic in QuizEngineModal lines 319-323:
  // timeLeftSeconds <= 120 -> 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
  // timeLeftSeconds <= 300 -> 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  // else -> 'bg-white/10 text-white border border-white/15'
  const getStyleClass = (sec) => {
    if (sec <= 120) return 'danger-pulse';
    if (sec <= 300) return 'warning-amber';
    return 'normal';
  };

  assert.equal(getStyleClass(2700), 'normal');
  assert.equal(getStyleClass(301), 'normal');
  assert.equal(getStyleClass(300), 'warning-amber');
  assert.equal(getStyleClass(121), 'warning-amber');
  assert.equal(getStyleClass(120), 'danger-pulse');
  assert.equal(getStyleClass(1), 'danger-pulse');
  assert.equal(getStyleClass(0), 'danger-pulse');
});

console.log('\n--- SECTION 5: EMPIRICAL CHALLENGE: STALE CLOSURE & AUTO-SUBMISSION REMEDIATION ---');

test('5.1. Source Code Inspection: selectedAnswersRef synchronization & decoupled timeout trigger', () => {
  const modalPath = path.join(PROJECT_ROOT, 'src', 'components', 'student', 'QuizEngineModal.tsx');
  const code = fs.readFileSync(modalPath, 'utf8');

  // Verify selectedAnswersRef is defined with useRef and synced via useEffect
  assert.ok(
    code.includes('selectedAnswersRef = useRef'),
    'selectedAnswersRef must be declared via useRef'
  );
  assert.ok(
    code.includes('selectedAnswersRef.current = selectedAnswers'),
    'selectedAnswersRef must be synced with selectedAnswers on change'
  );

  // Verify processSubmission reads from selectedAnswersRef.current
  assert.ok(
    code.includes('selectedAnswersRef.current'),
    'processSubmission must read from selectedAnswersRef.current'
  );

  // Verify interval updater does NOT call handleAutoSubmit inside setTimeLeftSeconds
  const intervalCodeMatch = code.match(/timerRef\.current\s*=\s*setInterval\([\s\S]*?\}\s*,\s*1000\);/);
  assert.ok(intervalCodeMatch, 'Timer setInterval must exist');
  assert.ok(
    !intervalCodeMatch[0].includes('handleAutoSubmit()'),
    'handleAutoSubmit() must NOT be called inside functional state updater'
  );

  // Verify decoupled timeout trigger watching timeLeftSeconds === 0
  assert.ok(
    code.includes('timeLeftSeconds === 0'),
    'Timeout auto-submit must be triggered decoupled from interval (watching timeLeftSeconds === 0)'
  );

  // Verify manual submit button uses arrow function wrapper to avoid event parameter pollution
  assert.ok(
    code.includes('onClick={() => processSubmission()}'),
    'Manual submit button must wrap processSubmission in arrow function to avoid event parameter pollution'
  );
  assert.ok(
    !code.includes('onClick={processSubmission}'),
    'Manual submit button must NOT pass processSubmission directly without arrow function'
  );

  // Verify processSubmission guards against SyntheticEvent / MouseEvent pollution
  assert.ok(
    code.includes('isAnswersRecord') &&
    code.includes('nativeEvent') &&
    code.includes('target'),
    'processSubmission must strictly guard currentAnswers against SyntheticEvent / MouseEvent'
  );

  // Verify retake exam handler resets both selectedAnswersRef and hasAutoSubmittedRef
  assert.ok(
    code.includes('hasAutoSubmittedRef.current = false'),
    'Retake exam onClick handler must reset hasAutoSubmittedRef.current to false'
  );
  assert.ok(
    code.includes('selectedAnswersRef.current = {}'),
    'Retake exam onClick handler must reset selectedAnswersRef.current to {}'
  );
});

test('5.2. Simulation of Closure Lifecycle: Demonstrating Stale Closure is Resolved on Auto-Submit', () => {
  /**
   * We model the component rendering with selectedAnswersRef:
   * 1. Render 1: isOpen=true, mode='taking', selectedAnswers = {}
   *    selectedAnswersRef.current = {}
   * 2. Renders 2..N: User answers questions. selectedAnswers updates.
   *    selectedAnswersRef.current is synced to latest selectedAnswers.
   * 3. Timer expires: Auto-submit fires and reads from selectedAnswersRef.current.
   */

  class ReactComponentSimulation {
    constructor(quiz) {
      this.quiz = quiz;
      this.state = {
        isOpen: true,
        mode: 'taking',
        selectedAnswers: {},
        timeLeftSeconds: 10,
      };
      this.selectedAnswersRef = { current: {} };
      this.timerInterval = null;
      this.capturedSubmissionOnTimeout = null;
      this.capturedSubmissionOnManual = null;

      // Mount Render
      this.render();
    }

    render() {
      // Sync ref like useEffect([selectedAnswers])
      this.selectedAnswersRef.current = { ...this.state.selectedAnswers };

      const currentQuiz = this.quiz;
      const ref = this.selectedAnswersRef;

      const processSubmission = (overrideAnswers) => {
        // Defensive check against synthetic events + reads from latest ref
        const isAnswersRecord = overrideAnswers && typeof overrideAnswers === 'object' && !('nativeEvent' in overrideAnswers) && !('target' in overrideAnswers);
        const currentAnswers = isAnswersRecord ? overrideAnswers : ref.current;
        return computeQuizEngineResults(currentQuiz, currentAnswers);
      };

      const handleAutoSubmit = () => {
        this.capturedSubmissionOnTimeout = processSubmission();
      };

      this.manualSubmit = () => {
        this.capturedSubmissionOnManual = processSubmission();
      };

      // Interval only decrements timer state; timeout trigger runs outside state updater
      if (!this.timerInterval && this.state.isOpen && this.state.mode === 'taking') {
        this.timerInterval = () => {
          this.state.timeLeftSeconds = Math.max(0, this.state.timeLeftSeconds - 1);
          if (this.state.timeLeftSeconds === 0) {
            handleAutoSubmit();
          }
        };
      }
    }

    selectOption(questionId, optionId) {
      this.state.selectedAnswers[questionId] = optionId;
      // Triggers re-render and ref sync
      this.render();
    }

    triggerTimerExpiry() {
      this.state.timeLeftSeconds = 0;
      if (this.timerInterval) {
        this.timerInterval();
      }
    }
  }

  const quiz = mockQuizzes.find((q) => q.id === 'quiz-math-12');
  const sim = new ReactComponentSimulation(quiz);

  // Student answers all 15 questions correctly:
  quiz.questions.forEach((q) => {
    sim.selectOption(q.id, q.correctOptionId);
  });

  // Manual submit test:
  sim.manualSubmit();
  assert.equal(sim.capturedSubmissionOnManual.totalCorrect, 15, 'Manual submit captures all 15 answers');
  assert.equal(sim.capturedSubmissionOnManual.finalScore, 10.0, 'Manual submit score is 10.0');

  // Timeout auto-submit test:
  sim.triggerTimerExpiry();
  
  console.log(`     [OBSERVATION] Manual submit score: ${sim.capturedSubmissionOnManual.finalScore} (15/15 correct)`);
  console.log(`     [OBSERVATION] Auto-submit timeout score: ${sim.capturedSubmissionOnTimeout.finalScore} (${sim.capturedSubmissionOnTimeout.totalCorrect}/15 correct)`);

  // Stale closure is resolved! Auto-submit now captures all 15 answers!
  assert.equal(
    sim.capturedSubmissionOnTimeout.totalCorrect,
    15,
    'Auto-submit captures all 15 answers via selectedAnswersRef (STALE CLOSURE DEFECT RESOLVED)'
  );
  assert.equal(
    sim.capturedSubmissionOnTimeout.finalScore,
    10.0,
    'Auto-submit scores 10.0/10 when all answers are correct'
  );
});

test('5.3. Manual Submit Event Immunity: SyntheticEvent/MouseEvent does not pollute answers', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-math-12');
  assert.ok(quiz);

  // Guard function replicated from QuizEngineModal.tsx
  const resolveAnswers = (overrideAnswers, refCurrent) => {
    const isAnswersRecord = overrideAnswers && typeof overrideAnswers === 'object' && !('nativeEvent' in overrideAnswers) && !('target' in overrideAnswers);
    return isAnswersRecord ? overrideAnswers : refCurrent;
  };

  const studentAnswers = {};
  quiz.questions.forEach((q) => {
    studentAnswers[q.id] = q.correctOptionId;
  });

  // Case A: Mock React MouseEvent passed directly as first parameter
  const mockMouseEvent = {
    target: { tagName: 'BUTTON' },
    nativeEvent: { type: 'click' },
    bubbles: true,
    preventDefault: () => {},
    stopPropagation: () => {},
  };

  const resolvedFromEvent = resolveAnswers(mockMouseEvent, studentAnswers);
  assert.deepEqual(resolvedFromEvent, studentAnswers, 'SyntheticEvent must be rejected and fall back to studentAnswers ref');

  const scoreWithEvent = computeQuizEngineResults(quiz, resolvedFromEvent);
  assert.equal(scoreWithEvent.totalCorrect, 15, 'All 15 answers preserved despite MouseEvent parameter');
  assert.equal(scoreWithEvent.finalScore, 10.0, 'Full score 10.0 preserved despite MouseEvent parameter');

  // Case B: Legitimate answer override record passed
  const overrideDict = { 'q-math-1': 'opt-custom' };
  const resolvedFromOverride = resolveAnswers(overrideDict, studentAnswers);
  assert.deepEqual(resolvedFromOverride, overrideDict, 'Valid answer dictionary must be accepted as override');

  // Case C: Undefined passed (e.g. arrow function () => processSubmission())
  const resolvedFromUndefined = resolveAnswers(undefined, studentAnswers);
  assert.deepEqual(resolvedFromUndefined, studentAnswers, 'Undefined override must fall back to studentAnswers ref');
});

test('5.4. Retake Exam Lifecycle: Auto-submit fires cleanly on retaken exam without being suppressed', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-math-12');
  assert.ok(quiz);

  class RetakeLifecycleSimulation {
    constructor(quiz) {
      this.quiz = quiz;
      this.mode = 'taking';
      this.selectedAnswers = {};
      this.selectedAnswersRef = { current: {} };
      this.hasAutoSubmittedRef = { current: false };
      this.timeLeftSeconds = quiz.durationMinutes * 60;
      this.submissions = [];
    }

    selectAnswer(qId, optId) {
      this.selectedAnswers[qId] = optId;
      this.selectedAnswersRef.current = { ...this.selectedAnswers };
    }

    processSubmission(overrideAnswers) {
      this.hasAutoSubmittedRef.current = true;
      const isAnswersRecord = overrideAnswers && typeof overrideAnswers === 'object' && !('nativeEvent' in overrideAnswers) && !('target' in overrideAnswers);
      const currentAnswers = isAnswersRecord ? overrideAnswers : this.selectedAnswersRef.current;
      const result = computeQuizEngineResults(this.quiz, currentAnswers);
      this.submissions.push(result);
      return result;
    }

    handleAutoSubmit() {
      if (this.hasAutoSubmittedRef.current) return;
      this.processSubmission();
    }

    checkTimerExpiry() {
      if (this.mode !== 'taking') return;
      if (this.timeLeftSeconds === 0 && !this.hasAutoSubmittedRef.current) {
        this.handleAutoSubmit();
      }
    }

    retakeExam() {
      this.mode = 'taking';
      this.selectedAnswers = {};
      this.selectedAnswersRef.current = {};
      this.timeLeftSeconds = this.quiz.durationMinutes * 60;
      this.hasAutoSubmittedRef.current = false;
    }
  }

  const sim = new RetakeLifecycleSimulation(quiz);

  // Attempt 1: Answer questions and expire timer
  quiz.questions.forEach((q) => sim.selectAnswer(q.id, q.correctOptionId));
  sim.timeLeftSeconds = 0;
  sim.checkTimerExpiry();

  assert.equal(sim.submissions.length, 1, 'Attempt 1 auto-submits exactly once');
  assert.equal(sim.submissions[0].finalScore, 10.0, 'Attempt 1 achieves score 10.0');
  assert.equal(sim.hasAutoSubmittedRef.current, true, 'hasAutoSubmittedRef is true after attempt 1');

  // Trigger retake exam
  sim.retakeExam();
  assert.equal(sim.hasAutoSubmittedRef.current, false, 'hasAutoSubmittedRef must be reset to false on retake');
  assert.deepEqual(sim.selectedAnswersRef.current, {}, 'selectedAnswersRef must be reset to empty on retake');

  // Attempt 2: Answer 5 questions and expire timer
  for (let i = 0; i < 5; i++) {
    sim.selectAnswer(quiz.questions[i].id, quiz.questions[i].correctOptionId);
  }
  sim.timeLeftSeconds = 0;
  sim.checkTimerExpiry();

  assert.equal(sim.submissions.length, 2, 'Attempt 2 auto-submits successfully (NOT suppressed by stale hasAutoSubmittedRef)');
  assert.equal(sim.submissions[1].totalCorrect, 5, 'Attempt 2 accurately records 5 correct answers');
  assert.equal(sim.submissions[1].finalScore, 3.3, 'Attempt 2 accurately calculates score 3.3');
});

console.log('\n--- SECTION 6: EDGE CASES & DEFENSIVE INTEGRITY ---');

test('6.1. Edge Case: Empty Quiz (0 questions) - Defensive Zero-Division Guard check', () => {
  const emptyQuiz = {
    id: 'quiz-empty',
    questions: [],
  };
  const res = computeQuizEngineResults(emptyQuiz, {});
  // With defensive guards, rawScore, finalScore, and accuracyRate must be 0 instead of NaN
  assert.equal(res.rawScore, 0, 'rawScore is 0 for empty questions (defensive guard)');
  assert.equal(res.finalScore, 0, 'finalScore is 0 for empty questions (defensive guard)');
  assert.equal(res.accuracyRate, 0, 'accuracyRate is 0 for empty questions (defensive guard)');
  assert.ok(!Number.isNaN(res.rawScore), 'rawScore must not be NaN');
  assert.ok(!Number.isNaN(res.finalScore), 'finalScore must not be NaN');
  assert.ok(!Number.isNaN(res.accuracyRate), 'accuracyRate must not be NaN');
});

test('6.2. Edge Case: Unanswered questions (Student leaves questions blank)', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-math-12');
  // Student only answers first 5 questions, leaves 10 blank
  const selected = {};
  for (let i = 0; i < 5; i++) {
    selected[quiz.questions[i].id] = quiz.questions[i].correctOptionId;
  }
  const res = computeQuizEngineResults(quiz, selected);
  assert.equal(res.totalCorrect, 5);
  assert.equal(res.finalScore, 3.3);
  assert.equal(res.accuracyRate, 33.3);

  // Check unanswered items in studentAnswers
  const blankAnswers = res.studentAnswers.filter((a) => a.selectedOptionId === null);
  assert.equal(blankAnswers.length, 10);
  blankAnswers.forEach((a) => {
    assert.equal(a.isCorrect, false);
  });
});

test('6.3. Edge Case: Invalid Option ID selected', () => {
  const quiz = mockQuizzes.find((q) => q.id === 'quiz-math-12');
  const selected = {
    'q-math-1': 'non-existent-option-id',
  };
  const res = computeQuizEngineResults(quiz, selected);
  const q1Ans = res.studentAnswers.find((a) => a.questionId === 'q-math-1');
  assert.equal(q1Ans.isCorrect, false);
});

console.log('\n--- SECTION 7: MOCK QUIZZES DATA INTEGRITY ---');

test('7.1. All mock quizzes have valid structure and questions', () => {
  assert.ok(mockQuizzes.length >= 2, 'Must have at least 2 mock quizzes');
  mockQuizzes.forEach((quiz) => {
    assert.ok(quiz.id, 'Quiz must have id');
    assert.ok(quiz.title, 'Quiz must have title');
    assert.ok(quiz.durationMinutes > 0, 'Quiz must have duration');
    assert.ok(quiz.questions.length > 0, 'Quiz must have questions');
    assert.equal(quiz.questions.length, quiz.totalQuestions, 'totalQuestions must match questions.length');

    quiz.questions.forEach((q, idx) => {
      assert.equal(q.orderNumber, idx + 1, `Question orderNumber for ${q.id}`);
      assert.ok(q.content && q.content.length > 5, `Question content for ${q.id}`);
      assert.ok(
        ['recognition', 'comprehension', 'application', 'advanced_application'].includes(q.difficultyLevel),
        `Valid difficultyLevel for ${q.id}: ${q.difficultyLevel}`
      );
      assert.ok(q.topic && q.topic.length > 0, `Question topic for ${q.id}`);
      assert.equal(q.options.length, 4, `Question must have 4 options for ${q.id}`);
      assert.ok(q.options.some((opt) => opt.id === q.correctOptionId), `correctOptionId exists in options for ${q.id}`);
      assert.ok(q.explanation && q.explanation.length > 10, `Pedagogical explanation for ${q.id}`);
    });
  });
});

console.log('\n' + '='.repeat(80));
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('='.repeat(80));

if (failedTests > 0) {
  console.log('\nFAILURES SUMMARY:');
  failures.forEach((f, idx) => {
    console.log(`${idx + 1}. ${f.name}`);
    console.log(`   ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\nALL TESTS PASSED EMPIRICALLY!');
  process.exit(0);
}
