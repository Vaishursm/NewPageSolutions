# SENTINEL - Client Onboarding Risk Assessment

> A fullstack prototype for rapid client risk assessment with FCA-compliant audit trails

## Quick Start

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org))
- **npm** (comes with Node) or **bun** ([download](https://bun.sh))

### Installation & Running

```bash
# 1. Clone the repository
git clone https://github.com/Vaishursm/NewPageSolutions.git
cd NewPageSolutions

# 2. Install dependencies
npm install
# or if using bun:
bun install

# 3. Start development server
npm run dev
# or:
bun run dev

# 4. Open in browser
# Application will be available at: http://localhost:8080
```

**Expected output**:
```
VITE v7.3.2 ready in 2485 ms
➜ Local: http://localhost:8080/
```

---

## Using the Application

### 1. Add Your First Client (Intake Form Tab)
1. Click **"Intake Form"** in the header
2. Fill in the required fields:
   - **Client ID**: Unique identifier (e.g., "CLI-001")
   - **Client Name**: Full name
   - **Onboarding Date**: Today's date
   - Other fields as needed
3. Click **"Submit & Classify"**
4. System instantly calculates risk level (HIGH/MEDIUM/LOW)
5. Success message shows classification with reasons

**💡 Tip**: Try entering a client with "PEP Status" checked to see HIGH risk classification

### 2. View & Manage Clients (Dashboard Tab)
1. Click **"Dashboard"** in the header
2. **Search**: Type in search box to find by name, ID, or branch
3. **Filter**: Use dropdowns to filter by branch, relationship manager, or risk level
4. **Quick Insights**: See summary metrics at the bottom
5. **Edit**: Click any cell to edit inline, or click "Edit" button for full form
6. **Expand**: Click the chevron (>) to see additional fields
7. **Delete**: Click "Delete" to remove a client

### 3. Import Bulk Data (CSV)
1. In Dashboard tab, click **"Download Sample"** to get the CSV template
2. Edit the CSV file with your data (16 columns required)
3. Click **"Import CSV"** button
4. Select your CSV file
5. System validates headers and imports records
6. Success message shows import count and any duplicates skipped

**⚠️ Important**: CSV must have exactly these 16 columns:
```
client_id, branch, onboarding_date, client_name, client_type,
country_of_tax_residence, annual_income, source_of_funds, pep_status,
sanctions_screening_match, adverse_media_flag, risk_classification,
kyc_status, id_verification_date, relationship_manager, documentation_complete
```

### 4. View Compliance Report (Report Tab)
1. Click **"Report"** in the header
2. See:
   - **Risk Distribution**: Breakdown of HIGH/MEDIUM/LOW/PENDING clients
   - **Risk Mismatches**: Clients where CSV classification ≠ computed classification
   - **Missing Fields**: Incomplete records needing attention
   - **Audit Metrics**: Timestamp and attribution information

### 5. Check Audit Trail (In Dashboard)
1. Find a client in the Dashboard
2. Click the **Expand** (>) button to see row details
3. Scroll down to see **Audit Trail** section
4. Shows: Who changed what, when, and the old/new values

---

## Risk Classification Rules

### HIGH Risk (Automatic)
Client is classified **HIGH** if **ANY** of these are true:
- ✅ PEP Status = TRUE
- ✅ Sanctions Screening Match = TRUE
- ✅ Adverse Media Flag = TRUE
- ✅ Country of Tax Residence in [Russia, Belarus, Venezuela]

**→ Requires Enhanced Due Diligence (EDD) approval**

### MEDIUM Risk
Client is classified **MEDIUM** if no HIGH triggers apply but **ANY** of these are true:
- ✅ Client Type = ENTITY
- ✅ Country in [Brazil, Turkey, South Africa, Mexico, UAE, China]
- ✅ Annual Income > 500,000 AND Source of Funds in [Inheritance, Gift, Other]

### LOW Risk
Default classification when no HIGH or MEDIUM triggers apply

### PENDING
Shown when critical fields are missing (cannot compute risk)

---

## Features

### ✅ Core Features
- **Fast Client Onboarding**: Add clients in <90 seconds
- **Instant Risk Classification**: Automatic rules-based system
- **CSV Import**: Bulk load client data with header validation
- **Real-time Search**: Find clients by name, ID, or branch
- **Inline Editing**: Click cells to edit without page refresh
- **Audit Trail**: Complete change history with timestamps

### ✅ Compliance Features
- **Change Log**: Every edit logged with attribution
- **EDD Workflow**: Enhanced Due Diligence approval for HIGH-risk clients
- **Compliance Report**: Risk distribution, mismatches, missing fields
- **Data Integrity**: Duplicate detection, required field validation

### ✅ User Experience
- **Touch-Friendly**: 44×44px minimum tap targets
- **Responsive**: Works on mobile, tablet, desktop
- **Offline Support**: All data stored in browser (no server needed)
- **Visual Feedback**: Color-coded risk badges, clear error messages

---

## Architecture

### Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend Framework** | React 19 | Fast, component-based, hooks for state |
| **Routing** | TanStack Router | Type-safe, simpler than Next.js for SPA |
| **Styling** | Tailwind CSS | Rapid prototyping, responsive by default |
| **State Management** | React hooks + localStorage | Simple, offline-first, no backend needed |
| **Build Tool** | Vite | Fast dev server, optimized production builds |

### Data Flow
```
User Input
    ↓
React State (useState)
    ↓
Persist to localStorage (custom hook)
    ↓
Compute Risk (pure function)
    ↓
Render UI with Classification
    ↓
Log Changes to Audit Trail
```

### File Structure
```
src/
├── routes/
│   ├── index.jsx              # Main app component
│   └── __root.tsx             # Root layout
├── components/
│   ├── AddClientForm.jsx      # Client intake form
│   ├── IntakeTable.jsx        # Data display & editing
│   ├── Filters.jsx            # Filter controls
│   ├── Report.jsx             # Compliance report
│   ├── RiskBadge.jsx          # Risk display
│   ├── AuditTrail.jsx         # Change history
│   ├── EDDStatus.jsx          # EDD workflow
│   └── ui/                    # Reusable UI components
├── utils/
│   ├── riskEngine.js          # Classification rules
│   ├── validation.js          # Field validation
│   ├── csvParser.js           # CSV import
│   └── sampleData.js          # Sample templates
├── hooks/
│   └── useLocalStorage.js     # Persistent state
└── lib/
    └── utils.ts               # Tailwind utilities
```

---

## Development

### Available Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

### Technology Details
- **React Router**: TanStack Router with file-based routing
- **Styling**: Tailwind CSS with custom Halcyon branding colors
- **Data Persistence**: Browser localStorage (survives page refresh)
- **Offline Mode**: Fully functional without internet connection
- **Build Output**: Single HTML file with bundled JS and CSS

---

## Data Model

### Client Record Structure
```javascript
{
  // Identity
  client_id: "CLI-001",
  client_name: "John Doe",
  branch: "London",
  onboarding_date: "2024-01-15",
  
  // Compliance
  client_type: "INDIVIDUAL",
  country_of_tax_residence: "United Kingdom",
  kyc_status: "APPROVED",
  id_verification_date: "2024-01-15",
  relationship_manager: "Jane Smith",
  
  // Financial
  annual_income: 250000,
  source_of_funds: "Salary",
  
  // Risk Indicators
  pep_status: false,
  sanctions_screening_match: false,
  adverse_media_flag: false,
  documentation_complete: true,
  
  // Audit Fields
  created_at: "2024-01-15T09:30:00Z",
  updated_at: "2024-01-15T14:45:00Z",
  computed_risk: "MEDIUM",
  change_log: [
    {
      timestamp: "2024-01-15T09:30:00Z",
      action: "CREATED",
      field: "all",
      old_value: null,
      new_value: "New client created",
      changed_by: "Relationship Manager"
    }
  ]
}
```

---

## Known Limitations

### Current Scope (Prototype)
- ❌ No user authentication (simulates single RM)
- ❌ No document storage (KYC docs, ID proof)
- ❌ No real PEP/sanctions screening API integration
- ❌ Data stored locally only (not synced across devices)
- ❌ No email notifications

### Phase 2 Features (Deferred)
- [ ] User authentication & role-based access
- [ ] Document attachment storage
- [ ] Real screening service integration
- [ ] Central database backend
- [ ] Multi-user concurrent editing
- [ ] Email alerts for EDD approvals

---

## Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 8080
# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :8080
kill -9 <PID>
```

### Clear Application Data
To reset the application and clear all stored clients:
1. Open browser DevTools (F12)
2. Go to **Application** or **Storage** tab
3. Find **localStorage**
4. Look for **sentinel.records** key
5. Delete it
6. Refresh the page

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run dev
```

---

## Support

### Documentation
- **Full Features Guide**: See `COMPLETE_FEATURE_GUIDE.md`
- **Compliance Details**: See `REQUIREMENTS_COMPLIANCE_COMPLETE.md`
- **Approach Document**: See `APPROACH_DOCUMENT.md` (for interview)

### Data Files
- **Sample CSV**: Download from "Download Sample" button in Dashboard
- **Test Data**: 46-record sample available for import

---

## Performance Metrics

### Speed Targets ✅
- **Client Addition**: <90 seconds (UI validated)
- **Risk Classification**: <10ms (instant)
- **CSV Import (46 records)**: <500ms
- **Search/Filter**: Real-time (<100ms)

### Capacity
- **Tested with**: 50+ records
- **Scaling**: localStorage limit ~5-10MB (thousands of records possible)
- **Responsive**: Works smoothly on mobile, tablet, desktop

---

## License & Attribution

Built as a fullstack engineering assessment prototype.

**Stack**:
- React 19
- TanStack Router
- Tailwind CSS
- Vite
- JavaScript/TypeScript

**AI Collaboration**:
- Used GitHub Copilot for rapid development
- Manual review and modification of all generated code
- Core business logic (risk engine) implemented with human oversight

---

## Questions?

Review the **Approach Document** for:
- Business context and problem understanding
- Technical decisions and trade-offs
- Data integrity approach
- AI collaboration process
- QA testing results

**Ready to demo?** Start the dev server and navigate to http://localhost:8080
