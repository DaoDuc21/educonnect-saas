# E2E Test Infra: EduConnect SaaS

## Test Philosophy
- **Opaque-box, requirement-driven**: Tests derive directly from `ORIGINAL_REQUEST.md` and user-facing acceptance criteria.
- **Methodology**: Systematic 4-tier testing (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial, and Real-World Workload Testing).

## Feature Inventory Coverage Map
| # | Feature | Requirement | Tier 1 (Unit/Feature) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (E2E Scenario) |
|---|---------|-------------|:---------------------:|:-----------------:|:----------------------:|:---------------------:|
| F1 | Data Persistence Layer | ORIGINAL_REQUEST §R1 | ≥ 5 | ≥ 5 | ✓ | ✓ |
| F2 | Reset Default Mock Data | ORIGINAL_REQUEST §R1 | ≥ 5 | ≥ 5 | ✓ | ✓ |
| F3 | Notification Center UI & Store | ORIGINAL_REQUEST §R2 | ≥ 5 | ≥ 5 | ✓ | ✓ |
| F4 | Event Triggers & Deep-Linking | ORIGINAL_REQUEST §R2 | ≥ 5 | ≥ 5 | ✓ | ✓ |
| F5 | Analytics Dashboard & Visuals | ORIGINAL_REQUEST §R3 | ≥ 5 | ≥ 5 | ✓ | ✓ |
| F6 | Export (Excel/CSV/Print) | ORIGINAL_REQUEST §R3 | ≥ 5 | ≥ 5 | ✓ | ✓ |
| F7 | Learning Resources Hub | ORIGINAL_REQUEST §R4 | ≥ 5 | ≥ 5 | ✓ | ✓ |
| F8 | Build & Production Integrity | Acceptance Criteria | ≥ 5 | ≥ 5 | ✓ | ✓ |

## Test Architecture & Execution
- Harness runner: Automated test suite verification script (`scripts/test-e2e.mjs` or `npm run test:e2e` / `npm run build`).
- Exit Code: Must exit with code 0.
- Zero TypeScript diagnostics.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Role Workflow |
|---|----------|--------------------|---------------|
| S1 | 4-Step Registration to Schedule & F5 Persistence | F1, F3, F4, F8 | Guest / Student / Admin |
| S2 | Tutor Homework Creation, Student Submission, Grading & Notif | F1, F3, F4, F5 | Tutor & Student |
| S3 | Tuition Payment with VietQR, Invoice Generation & Export | F1, F3, F6 | Parent & Admin |
| S4 | Resource Upload by Tutor, Download by Student/Parent | F1, F7 | Tutor & Student/Parent |
| S5 | System Settings Reset to Default Mock Data | F1, F2 | Super Admin |
| S6 | End-to-End Build and Zero Error Verification | F8 | CI / Production |
