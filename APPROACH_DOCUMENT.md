
---

# ✅ **APPROACH_DOCUMENT.md (Concise, High-Impact Version)**

```md
# SENTINEL — Approach Document

## 1. Problem Understanding

Halcyon Capital Partners faces a core issue:

- Onboarding is manual (paper + spreadsheet)
- Data is entered retrospectively → errors
- Records are inconsistent → compliance findings

### Key Tension

- **Relationship Manager** → speed (<90 sec entry)
- **Compliance/Auditor** → accuracy, auditability, completeness

The system must satisfy both.

---

## 2. Core Objective

Design a system that:

- Enables fast onboarding
- Automatically computes risk
- Ensures audit-ready records
- Eliminates data inconsistencies

---

## 3. Solution Overview

Built a **frontend SPA prototype** focusing on:

- Intake (form + dashboard)
- Deterministic risk classification
- Audit trail
- Compliance reporting

Backend and integrations were intentionally deferred.

---

## 4. System Decomposition

### 1. Intake Layer
- Capture client data
- Fast, minimal friction

### 2. Validation Layer
- Identify missing/invalid data
- Mark critical gaps as `PENDING`

### 3. Risk Engine
- Evaluate regulatory rules
- Assign highest applicable risk tier

### 4. Audit Layer
- Track all changes
- Ensure attribution (who, when)

### 5. Data Layer
- Store records (localStorage for prototype)

### 6. Reporting Layer
- Surface mismatches and compliance issues

---

## 5. Risk Engine Design

### Approach
- Deterministic, rule-based system
- No ML (ensures explainability)

### Implementation
- Rules extracted into configuration objects
- Pure function: input → evaluation → risk + reasons


### Priority Logic
- HIGH overrides MEDIUM
- MEDIUM overrides LOW
- Missing critical data → PENDING

---

## 6. EDD Handling

### Decision
- Treat EDD as an enforced state, not just a label

### Implementation
- HIGH risk automatically:
- Sets `kyc_status = ENHANCED_DUE_DILIGENCE`
- Prevents approval
- Flags in UI

### Trade-off
- Full approval workflow not implemented (out of scope)

---

## 7. Data Integrity Strategy

CSV is not clean, so:

- Normalize inputs (booleans, dates)
- Handle missing fields:
- Critical → `PENDING`
- Non-critical → display `-`
- Detect mismatches:
- CSV risk vs computed risk

---

## 8. Audit Design

Each record tracks:

- Timestamp (`created_at`, updates)
- Relationship Manager
- Field-level changes

### Decision
- Allow edits for prototype simplicity
- Maintain change history for traceability

---

## 9. Key Design Decisions

### 1. Deterministic Rules
Chosen for:
- Compliance
- Explainability
- Audit readiness

---

### 2. Config-Driven Rules (Partial)
- Extracted rule parameters into config
- Enables future externalization

---

### 3. Frontend-Only Architecture
- Focus on validating core flow
- Avoid backend complexity

---

### 4. LocalStorage Persistence
- Simulates offline-first behavior
- Enables quick prototyping

---

## 10. Trade-offs

| Decision | Trade-off |
|--------|----------|
| No backend | No real multi-user support |
| No approval workflow | Simplified EDD |
| Hardcoded config | Not dynamically updateable |
| Editable records | Not fully audit-grade |

---

## 11. Assumptions

- Single-user environment
- CSV data may be incorrect
- Minimal audit trail sufficient
- Risk computed post-submit

---

## 12. Limitations

- No role-based access
- No real sanctions/PEP integration
- No conflict resolution
- No external rule management

---

## 13. Phase 2 Improvements

### Architecture
- Backend (Node + DB)
- API layer
- Authentication

### Compliance
- Full EDD workflow (approval chain)
- Immutable audit logs
- Versioning

### Scalability
- Multi-branch support
- Real-time updates

### Integrations
- Sanctions APIs
- KYC verification services

---

## 14. AI Collaboration

Used AI tools (Copilot) to:
- Scaffold components
- Generate initial logic
- Speed up UI development

### Human Control
- Validated all logic manually
- Refined risk rules
- Structured architecture decisions

---

## 15. Summary

This prototype prioritizes:

- **Risk accuracy**
- **Audit visibility**
- **Fast onboarding**

While intentionally simplifying:
- Backend
- Workflow complexity
- Scalability concerns

The focus was to demonstrate:
- Correct problem decomposition
- Strong technical judgment
- Practical trade-offs under time constraints