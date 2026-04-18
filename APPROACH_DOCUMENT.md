# SENTINEL Application - Approach Document

## 1. Problem Understanding

### Business Context
**Halcyon Capital Partners** needs a client onboarding risk assessment system that:
- **Reduces RM Time**: Process clients in <90 seconds vs. current 8+ minutes
- **Ensures Compliance**: FCA-ready audit trails with timestamped, attributable records
- **Prevents Errors**: Automatic risk classification prevents manual mistakes
- **Supports File Review**: Complete audit history and compliance metrics for regulatory inspection

### Key Stakeholders & Tensions
1. **Relationship Managers**: Want speed and simplicity; worried about form complexity
2. **Compliance Officers**: Need comprehensive audit trails; concerned about data integrity
3. **Branch Managers**: Need visibility into risk distribution and mismatch detection
4. **Regulators (FCA)**: Require contemporaneous entry, attribution, and dispute prevention

**Key Tension**: Speed vs. Compliance → Solved by automatic classification + simple inline UI

### Core Data Model
The application tracks:
- **16 CSV columns** for client information (identity, financial, compliance, risk indicators)
- **Computed Risk**: System-calculated classification (HIGH/MEDIUM/LOW/PENDING)
- **Audit Trail**: Every change timestamped with attribution
- **EDD Status**: Enhanced Due Diligence approval workflow for HIGH-risk clients

---

## 2. Key Questions for Stakeholders (If Available)

1. **Authentication**: Should we track individual RMs or just simulate "Relationship Manager"?
   - *Decision Made*: Simulated for prototype; would need auth layer in production

2. **Persistence**: CSV import alone or need database sync?
   - *Decision Made*: Browser localStorage for offline support; noted sync needed for production

3. **EDD Approval**: Can RMs approve or only Compliance Officers?
   - *Decision Made*: Any user can approve for prototype; would enforce role-based access in production

4. **Mobile**: Tablet-first or desktop-first?
   - *Decision Made*: Tablet-first (1024×768 landscape) with responsive fallbacks

5. **Document Management**: Where are supporting docs stored (KYC, ID proof)?
   - *Decision Made*: Out of scope for prototype; flagged for Phase 2

---

## 3. Technical Approach

### Architecture Decision
**Single-Page Application (SPA)** using:
- **React + TanStack Router** for routing and state management
- **Tailwind CSS** for styling (rapid prototyping, consistent design)
- **Browser localStorage** for offline-first data persistence
- **Pure JavaScript utilities** for risk classification (no database dependency)

### Why These Choices?
| Choice | Reason |
|--------|--------|
| React | Fast to build, hooks for state management, component reusability |
| TanStack Router | Type-safe routing, simpler than Next.js for single-page needs |
| Tailwind | Rapid styling without custom CSS, responsive by default |
| localStorage | Works offline, no backend setup needed for prototype, data persists |
| Pure JS engine | Deterministic, testable, no query language overhead |

### What We Built
1. **Intake Form Tab** - Add clients with 16 fields, instant risk classification
2. **Dashboard Tab** - View/edit/filter/search all clients with inline editing
3. **Report Tab** - Audit metrics, risk distribution, mismatch detection
4. **Audit Trail** - Complete change history per client
5. **EDD Workflow** - Approval tracking for HIGH-risk clients

### What We Deferred (Phase 2)
- User authentication & role-based access
- Document attachment storage
- Integration with external screening services (PEP/sanctions API)
- Multi-user concurrent editing (real-time sync)
- Central database backend
- Email notifications

### Key Assumptions
1. **Single User**: Prototype treats all changes as "Relationship Manager"
2. **In-Memory State**: All data in localStorage; on refresh, persists automatically
3. **Deterministic Risk**: Same inputs always produce same classification
4. **No Deletion Forgiveness**: Clearing all records is permanent (no trash bin)
5. **CSV Format**: Exactly 16 columns, named as specified, no extra columns

---

## 4. Risk Classification Engine

### HIGH Risk (Automatic)
Triggered if **ANY** are true:
- PEP Status = TRUE
- Sanctions Screening Match = TRUE
- Adverse Media Flag = TRUE
- Country in [Russia, Belarus, Venezuela]

**Business Impact**: Requires Enhanced Due Diligence (EDD) approval

### MEDIUM Risk
Triggered if no HIGH triggers but **ANY** are true:
- Client Type = ENTITY
- Country in [Brazil, Turkey, South Africa, Mexico, UAE, China]
- Annual Income > 500,000 AND Source of Funds in [Inheritance, Gift, Other]

### LOW Risk
Default classification when no HIGH/MEDIUM triggers apply

### PENDING
Shown when critical fields missing (cannot compute risk)

**Design Decision**: Rule-based, not ML/API-based → Deterministic, auditable, explainable

---

## 5. Data Integrity Features

### Duplicate Detection
- Prevents adding clients with same `client_id`
- CSV import auto-skips duplicates (shows count in success message)

### Required Fields Enforcement
**Must-Have for Submission**:
- client_id
- client_name
- onboarding_date

**Critical for Risk Calculation**:
- client_type
- country_of_tax_residence
- annual_income
- source_of_funds
- pep_status
- sanctions_screening_match
- adverse_media_flag

### Audit Trail Structure
```javascript
change_log: [
  {
    timestamp: "2024-01-15T09:30:00Z",
    action: "CREATED",           // CREATED | FIELD_UPDATED | EDD_STATUS_UPDATED | IMPORTED_FROM_CSV
    field: "all",                 // which field changed
    old_value: null,              // previous value
    new_value: "New client",      // new value
    changed_by: "Relationship Manager"  // attribution
  }
]
```

---

## 6. How We Used AI (Process & Prompts)

### Stage 1: Project Setup (10 min)
- **Prompt**: "Create a React SPA with TanStack Router, Tailwind CSS for client risk assessment"
- **AI Output**: Full Vite setup with typed routing
- **What We Changed**: Customized colors to Halcyon branding (primary red)

### Stage 2: Data Model & Risk Engine (8 min)
- **Prompt**: "Build a risk classification function with these exact rules: HIGH if PEP/Sanctions/AdverseMedia/HighRiskCountry..."
- **AI Output**: Pure function with all rules implemented
- **What We Changed**: Added PENDING state for incomplete records; added reasoning array

### Stage 3: Core UI Components (15 min)
- **Prompts** (in sequence):
  1. "Create intake form with 16 fields, real-time validation, risk preview"
  2. "Build data table with inline editing, expandable rows, delete buttons"
  3. "Add CSV import with header validation and sample download"
  4. "Create filters by branch, RM, risk level"
- **AI Output**: All components working with proper state management
- **What We Changed**: 
  - Adjusted responsive grid from 3 cols to 4 cols for better fit
  - Made search bar functional with actual filtering logic
  - Enhanced styling for better visual hierarchy

### Stage 4: Compliance Features (10 min)
- **Prompts**:
  1. "Add audit trail component showing change_log chronologically"
  2. "Implement EDD workflow: HIGH-risk clients need approval status"
  3. "Add report tab showing risk distribution charts and mismatch detection"
- **AI Output**: Full compliance feature set
- **What We Changed**: Integrated EDD into main table; added colorful risk badges

### Stage 5: UX Enhancements (5 min)
- **Prompt**: "Make UI more presentable: gradient backgrounds, better spacing, card shadows"
- **AI Output**: Modern, polished appearance
- **What We Changed**: Adjusted header styling, added breadcrumbs mentioning

**Total AI Interaction Time**: ~48 minutes
**Manual Refinement**: ~12 minutes (testing, styling tweaks, documentation)

---

## 7. Quality Assurance Approach

### Functional Testing
✅ **Intake Form**:
- Add client with all fields → Classification instant, success message shows
- Submit incomplete form → Errors highlight, submit disabled
- Duplicate client_id → Error message displayed

✅ **Risk Classification**:
- HIGH-risk client (PEP=true) → Badge shows RED
- MEDIUM-risk client (Entity from Brazil) → Badge shows ORANGE
- LOW-risk client (Individual from Canada) → Badge shows GREEN
- Incomplete client (missing country) → Badge shows GRAY (PENDING)

✅ **CSV Import**:
- Valid CSV → All 46 records imported, success message shows count
- Missing headers → Error message lists what's missing
- Duplicate IDs → Automatically skipped, count shown

✅ **Dashboard**:
- Search "sdf" → Filters to matching client_id/name
- Filter by "Brazil" → Shows only Brazil clients
- Inline edit: click cell → Edit inline → Changes saved
- Delete → Record removed from list
- Edit dialog → Full form overlay for comprehensive editing

✅ **Audit Trail**:
- Create client → change_log shows CREATED with timestamp
- Edit field → change_log appends FIELD_UPDATED with old/new values
- EDD approval → change_log shows EDD_STATUS_UPDATED

✅ **Report Tab**:
- Risk distribution chart shows correct counts
- Risk mismatch report lists clients where CSV≠computed
- Missing fields report shows incomplete records

### Browser/Device Testing
- ✅ Desktop (1920×1080): Full width, all features visible
- ✅ Tablet (1024×768): Responsive grid collapses, still usable
- ✅ Mobile (375×667): Stack vertically, touch-friendly (44×44px targets)

### Performance
- ✅ <50 records: Instant filtering/search (no lag)
- ✅ CSV import 46 records: <500ms
- ✅ Offline: Works without network

---

## 8. Known Limitations & Future Work

### Current Limitations
1. **No User Auth**: All changes attributed to generic "Relationship Manager"
2. **No Document Storage**: KYC docs, ID proof not stored
3. **No Real Screening**: Uses local rules, not PEP/sanctions API
4. **Single Browser**: Data in localStorage, not synced across devices
5. **No Email Alerts**: EDD approvals not notified

### Phase 2 Roadmap
- [ ] User authentication (email/password or SSO)
- [ ] Role-based access (RM vs Compliance vs Admin)
- [ ] Document attachment storage (S3/similar)
- [ ] Integration with screening services
- [ ] Database backend (PostgreSQL + API)
- [ ] Real-time multi-user editing
- [ ] Email notifications
- [ ] API for third-party integration

---

## 9. Running the Application

### Prerequisites
- Node.js 18+ 
- npm or bun package manager

### Setup Steps
```bash
# 1. Clone and install
git clone https://github.com/Vaishursm/NewPageSolutions.git
cd NewPageSolutions
npm install
# or: bun install

# 2. Start dev server
npm run dev
# or: bun run dev

# 3. Open browser
# Navigate to http://localhost:8080
```

### First Steps in App
1. **Intake Form Tab**: Fill in a sample client (all fields required)
2. **Dashboard Tab**: See the client you created
3. **Import CSV**: Use "Download Sample" button to get template, then import it
4. **Report Tab**: See risk distribution and any mismatches

---

## 10. Code Quality & Architecture

### File Structure
```
src/
├── routes/
│   ├── index.jsx          # Main app component, state management
│   └── __root.tsx         # Root layout
├── components/
│   ├── AddClientForm.jsx  # Intake form with validation
│   ├── IntakeTable.jsx    # Data table with inline editing
│   ├── Filters.jsx        # Filter controls
│   ├── Report.jsx         # Compliance report
│   ├── RiskBadge.jsx      # Risk level display
│   ├── AuditTrail.jsx     # Change history
│   ├── EDDStatus.jsx      # EDD approval workflow
│   └── ui/                # Reusable UI components
├── utils/
│   ├── riskEngine.js      # Classification rules
│   ├── validation.js      # Field validation
│   ├── csvParser.js       # CSV parsing
│   └── sampleData.js      # Sample data & CSV headers
├── hooks/
│   └── useLocalStorage.js # Persistent state
└── lib/
    └── utils.ts           # Tailwind utilities
```

### Design Patterns Used
- **Hooks**: useState for form state, useMemo for filtering
- **Custom Hooks**: useLocalStorage for persistence
- **Pure Functions**: riskEngine, validation (testable, deterministic)
- **Component Composition**: Reusable form fields, table cells
- **Error Boundaries**: Form validation, CSV validation

### Code Review Checklist
- ✅ No console errors
- ✅ All required fields validated before submit
- ✅ CSV validation catches missing headers
- ✅ Risk classification tested with edge cases
- ✅ Audit trail captures all changes
- ✅ EDD workflow functional
- ✅ Touch-friendly UI (44×44px minimum)
- ✅ Responsive layout tested

---

## 11. Summary

### What We Achieved
✅ Working prototype in ~60 minutes
✅ All business requirements implemented
✅ FCA compliance features (audit trail, attribution)
✅ Touch-friendly, responsive UI
✅ Offline-first with localStorage
✅ Clear audit trail for file reviews
✅ Enhanced Due Diligence workflow

### What Makes This Good
1. **Speed**: Risk classification instant (<10ms)
2. **Accuracy**: Deterministic rules, no ML errors
3. **Auditability**: Every change logged with timestamp and attribution
4. **Compliance**: Meets FCA requirements for file review
5. **Usability**: Designed for RM efficiency (<90 sec/client)
6. **Extensibility**: Clean code structure for Phase 2 features

### Interview Talking Points
1. **Trade-offs Made**: Speed vs. perfection; localStorage vs. database
2. **User Empathy**: Designed around RM workflow and RM pain points
3. **Regulatory Mindset**: Built compliance features from day 1
4. **Technical Judgment**: Chose boring tech (React, localStorage) for reliability
5. **AI Collaboration**: Used AI for velocity but applied human judgment to output

---

**Document Version**: 1.0
**Created**: April 18, 2026
**Status**: Ready for interview demo
