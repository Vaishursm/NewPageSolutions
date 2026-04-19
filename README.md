# SENTINEL — Client Onboarding Risk Assessment

## TL;DR
- React SPA for onboarding risk assessment in a wealth management firm
- Deterministic, config-driven risk engine + audit trail
- Focused on compliance, accuracy, and RM efficiency

---

## Problem

Relationship Managers currently:
- Use paper forms + spreadsheets
- Enter data later → errors and delays
- Create mismatches → compliance findings

Compliance requires:
- Accurate, explainable risk classification
- Complete audit trails (who, when, what)
- No missing or inconsistent records

---

## Solution

A single-page application that:

- Captures onboarding data quickly (<90 seconds)
- Automatically computes risk classification
- Enforces compliance rules (EDD for high-risk clients)
- Maintains an audit trail of all changes
- Highlights mismatches and missing data

---

## Key Features

### Risk Engine
- Deterministic classification (HIGH / MEDIUM / LOW / PENDING)
- Config-driven rules (countries, thresholds)
- Always computes risk from input (CSV not trusted)

### EDD Enforcement
- HIGH-risk clients automatically require:
  - `kyc_status = ENHANCED_DUE_DILIGENCE`
- Prevents direct approval
- Clearly flagged in UI

### Audit Trail
- Every change logged with:
  - Timestamp
  - Relationship Manager
  - Field-level updates

### Data Handling
- CSV import with normalization
- Dirty data handled safely:
  - Missing critical fields → `PENDING`
  - Non-critical fields → `-`

### Dashboard
- View all records
- Filter by branch, RM, risk
- Inline editing with real-time updates

### Compliance Report
- Risk distribution (computed vs CSV)
- Mismatch detection
- Missing data visibility

### Offline Support
- localStorage persistence
- Works without backend

---

## Architecture

Frontend-only SPA (React)

UI Layer (Form + Dashboard)
↓
Validation Layer
↓
Risk Engine (config-driven)
↓
Audit Logger
↓
LocalStorage Persistence


---

## Key Design Decisions

### Deterministic Rules over ML
- Ensures auditability and explainability
- Required for regulatory compliance

### Config-Driven Risk Rules
- Extracted rule parameters into configuration
- Enables future updates without code changes

### System-Driven Risk Classification
- Prevents RM errors
- Ensures consistency across records

### EDD as Enforced State
- HIGH risk automatically triggers EDD
- Prevents invalid approval states

### Frontend-Only Prototype
- Focused on validating core flow (intake → risk → audit)
- Backend intentionally deferred

---

## Assumptions

- CSV data is not the source of truth
- Missing critical data → `PENDING`
- Minimal audit trail sufficient for prototype
- Single-user system (no concurrency handling)

---

## Demo Flow (5–6 minutes)

1. Add client → instant risk classification
2. HIGH risk → EDD enforced automatically
3. View dashboard → filter + detect mismatches
4. Edit record → audit trail updates
5. View report → compliance summary

---

## How to Run

```bash
git clone https://github.com/Vaishursm/NewPageSolutions.git
cd NewPageSolutions
npm install
npm run dev
Open: http://localhost:8080

## Limitations

- No backend or authentication (frontend-only prototype)
- No full EDD approval workflow (only enforcement)
- Rules are locally configurable (not externally managed)
- No multi-user conflict handling

## Phase 2 Improvements

- External rules engine (configurable via JSON/admin UI)
- Backend + database for persistence and audit logs
- Role-based access (Relationship Manager vs Compliance)
- Full EDD workflow (approval chain)
- Integration with sanctions/KYC APIs
- Offline sync with conflict resolution

## Where to Start

1. Run the application locally
2. Explore the intake flow and dashboard
3. Review APPROACH_DOCUMENT.md for detailed design decisions