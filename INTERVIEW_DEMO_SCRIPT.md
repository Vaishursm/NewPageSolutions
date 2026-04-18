# SENTINEL - Interview Demo Script

> 10-minute presentation guide + talking points

---

## Opening (1 minute)

**"SENTINEL is a client onboarding risk assessment application built in 60 minutes. It demonstrates how automation and good UX can improve both speed and compliance.**

**The problem: Relationship Managers at Halcyon spend 8+ minutes per client onboarding. They need to assess risk, but current process has errors and no audit trail for regulators.**

**The solution: Instant risk classification + audit-ready compliance features.**

---

## Demo Flow (6 minutes)

### 1. Intake Form → Classification (1.5 minutes)
**"Let me add a client and show the risk classification in action"**

1. Click "Intake Form" tab
2. Fill in sample data:
   - Client ID: CLI-TEST-001
   - Name: Test Client
   - Branch: London
   - Country: United Kingdom (choose from dropdown)
   - **For HIGH risk demo**: Check "PEP Status" ✓
3. Click "Submit & Classify"
4. **Point out**:
   - ⏱️ Instant classification (<100ms)
   - 🔴 RED badge shows HIGH risk
   - 📝 Classification reasons displayed
   - ✅ Confirmation message with client ID

**Talking point**: "Less than 90 seconds from form to classification, which was our target. The system prevents RMs from guessing risk - it's deterministic."

---

### 2. Dashboard → Search & Filter (1.5 minutes)
**"Now let me show managing multiple clients"**

1. Click "Dashboard" tab
2. Click "Download Sample" → Save CSV
3. Click "Import CSV" → Select the downloaded sample
4. **Show results**:
   - "Imported 46 records" message
   - Table displays all clients
5. **Test Search**:
   - Type "John" in search box → Filters instantly
   - Type client ID → Filters to that client
6. **Test Filters**:
   - Filter by "Brazil" in country → Shows only Brazil clients
   - Filter by HIGH risk → Shows only HIGH clients
7. **Inline Edit**:
   - Click a cell → Edit inline
   - Shows "Updated at" timestamp
8. Click Expand (>) on a row → Show expandable details

**Talking point**: "CSV import validates headers - if a column is missing, we show exactly which one. Search and filters are real-time. The audit trail at the bottom shows complete change history with attribution."

---

### 3. Report Tab → Compliance Metrics (1.5 minutes)
**"This is for compliance officers doing file reviews"**

1. Click "Report" tab
2. **Show sections**:
   - **Risk Distribution**: Charts showing HIGH/MEDIUM/LOW breakdown
   - **Risk Mismatches**: Clients where CSV classification ≠ computed risk
   - **Missing Fields**: Records with incomplete data
3. **Point out**: 
   - Helps identify risky clients requiring attention
   - Shows data quality issues
   - Supports regulatory file reviews

**Talking point**: "This report supports FCA file reviews. Every metric is timestamped and attributable. If questioned about a client classification, we have the complete audit trail."

---

### 4. Audit Trail → Change History (1 minute)
**"Compliance asks: 'Who changed this client and when?'"**

1. Go back to Dashboard
2. Expand a client row
3. Scroll to "Audit Trail" section
4. **Show**:
   - Timestamp of each change
   - Action type (CREATED, FIELD_UPDATED, etc.)
   - Old value → New value
   - Attribution (who made the change)

**Talking point**: "Every edit is logged. This prevents disputes about 'but I didn't change that'. The FCA requirement for contemporaneous, attributable records is built in from the start."

---

## Technical Approach (2 minutes)

### Architecture Decisions
| Decision | Why |
|----------|-----|
| **React SPA** | Fast to build, hooks for state, reusable components |
| **localStorage** | Works offline, no backend setup needed, data persists |
| **Tailwind CSS** | Rapid styling, responsive by default |
| **TanStack Router** | Type-safe, simpler than Next.js for SPA |
| **Pure JS Rules Engine** | Deterministic, testable, auditable (no black-box APIs) |

### Key Implementation Details
1. **Risk Classification**: Pure function - same inputs = same output always
2. **Change Log**: Appends to array on every edit - never overwrites
3. **Search/Filter**: Real-time memoized calculations
4. **CSV Validation**: Checks all 16 columns present before import
5. **Duplicate Detection**: Prevents duplicate client_ids

---

## Process: How I Used AI (Optional - if asked)

**"I used Copilot to accelerate development, but maintained full control:"**

### Prompt Strategy
1. **Architecture**: "Build React SPA with TanStack Router, risk classification engine..."
2. **Features**: "Add intake form with these 16 fields, CSV import with validation, audit trail..."
3. **UI**: "Make it responsive, touch-friendly, professional appearance"

### What I Changed
- ✅ Kept core risk engine - deterministic rules
- ✅ Enhanced CSV validation - catch missing headers
- ✅ Improved responsive grid - 4 columns instead of 3
- ✅ Added real search functionality - not just placeholder
- ❌ Removed emoji clutter - kept professional appearance
- ❌ Adjusted form spacing - more compact for less scrolling

### Time Breakdown
- Setup: 10 min
- Risk engine: 8 min
- UI components: 15 min
- Compliance features: 10 min
- UX polish: 5 min
- Testing & tweaks: 12 min

---

## Questions to Expect

### Q: "How would you handle user authentication?"
**A**: "This is deferred to Phase 2. I'd add:
- Email/password or SSO
- Role-based access control (RM vs Compliance Officer vs Admin)
- User attribution to each change (already in audit log structure)
- Session management with token refresh"

### Q: "What if you need to scale to 10,000 clients?"
**A**: "localStorage has limits. I'd move to:
- PostgreSQL for persistent storage
- Redis for caching/search
- API backend (Node/Python)
- Pagination in tables for performance"

### Q: "How would you integrate with real PEP/sanctions APIs?"
**A**: "Replace the local rules with API calls:
- Call screening service for each new client
- Cache results for performance
- Handle API failures gracefully
- Still maintain audit trail of screening result"

### Q: "What about document management?"
**A**: "Would add:
- S3/similar for document storage
- File upload UI in form
- Document expiry tracking
- OCR for ID verification automation"

### Q: "Can you show me editing a client?"
**A**: "Sure - click a cell and edit inline (changes save immediately), or click the Edit button for a full form dialog. All changes are logged in the audit trail."

---

## Key Talking Points

1. **Problem-Centric**: Built around RM pain points and compliance requirements
2. **Speed**: Instant classification, real-time search, <90 sec onboarding
3. **Compliance**: Audit trail from day 1, attribution, change history
4. **User Empathy**: Touch-friendly, clear error messages, forgiving UI
5. **Technical Judgment**: Chose simple, reliable tech over complex solutions
6. **Testability**: Pure functions, deterministic rules, no magic
7. **Scalability**: Architecture supports Phase 2 database/auth additions

---

## Things NOT to Say

❌ "It's perfect" - It's a prototype
❌ "It uses ML for risk" - It uses deterministic rules
❌ "Multiple users can edit simultaneously" - Single user for prototype
❌ "Data is backed up to cloud" - localStorage only, Phase 2 work
❌ "We interviewed users" - Followed problem statement requirements

---

## Closing (10 seconds)

**"That's SENTINEL - a focused prototype that handles the core onboarding flow and compliance requirements. I chose speed and clarity over completeness. The code is structured for Phase 2 additions like auth, real screening APIs, and a production database.**

**Any questions about the approach, architecture, or data?"**

---

## Emergency Troubleshooting

If the app won't start:
```bash
# Kill any existing process
ctrl+c

# Clear cache
rm -rf .vite node_modules/.vite

# Restart
npm run dev
```

If search/filters aren't working:
- Check browser console (F12) for errors
- Refresh page (Ctrl+R)
- Try a different client name

If CSV import fails:
- Use "Download Sample" button to verify format
- Check that all 16 columns are present
- Verify no extra spaces in headers

---

**Status**: ✅ Ready for 10-minute demo
**Time**: 6 min demo + 2 min tech + 2 min Q&A = 10 min
