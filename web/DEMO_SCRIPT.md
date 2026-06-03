# Demo Script - Autonomous Compensation Agent

**Duration: 2-3 minutes**

---

## Opening (15 seconds)

"We built the Autonomous Compensation Agent - an AI-powered platform that makes performance bonuses transparent, explainable, and auditable. Managers describe rules in natural language, AI does the analysis, and humans make the final call."

## Demo Flow

### 1. Dashboard (10 seconds)

Show the main dashboard with the 6-step workflow. Point out the badges: AI Powered, Human Approval Required, Auditable, Mock Soroban, Stellar Ready.

### 2. Manager Setup (15 seconds)

- Enter organization name: "Acme Corp"
- Enter manager name: "Jane Smith"
- Click "Connect Wallet" - show the mock Stellar address generated
- Click "Continue to Rule Builder"

### 3. Rule Builder (30 seconds)

- Show the pre-filled natural language input:
  > "This month Project Alpha contribution should be 50%, merged pull requests 30%, bug fixes 20%. Code quality should be used as a tie-breaker."
- Click "Generate Rules with Gemini"
- Show the structured table: Metric | Weight | Source
- Highlight that weights total 100%
- Mention metrics are editable
- Click "Save Rules"

### 4. Contributions (15 seconds)

- Show the 3 employee cards: Alice, Bob, Carol
- Click on Alice to show the detail modal with progress bars
- Point out the comparison table below

### 5. AI Scoring (30 seconds)

- Show the bonus pool: 1000 USDC
- Click "Analyze Contributions"
- Show the results with scores and recommended bonuses
- Expand one employee to show the breakdown:
  - Per-metric scores (raw, normalized, weighted)
  - AI explanation
  - Evidence points
- Emphasize: "AI recommends, it doesn't decide"

### 6. Manager Approval (20 seconds)

- Show the allocation table with AI recommendations vs final amounts
- Toggle "Edit" to show amounts are adjustable
- Check the confirmation checkbox:
  > "I confirm that AI only provided recommendations and the final decision is approved by an authorized manager."
- Click "Approve Distribution"

### 7. Audit Trail (15 seconds)

- Show the three SHA-256 hashes: Rule, Score, Approval
- Show the transaction ID and timestamp
- Point out the "Mock Soroban Mode" badge
- Explain: "In production, these hashes live on Stellar via Soroban smart contracts"

### 8. Payout (15 seconds)

- Click "Simulate Payouts"
- Show the progress bar as each payout processes
- Show final table: Employee | Wallet | Amount | Status | Tx Hash
- Show the "Distribution Complete" success card

## Closing (15 seconds)

"The key innovation: natural language rules become measurable criteria, AI provides explainable scoring, humans retain final authority, and Soroban provides the audit trail. This isn't AI replacing managers - it's AI making compensation fair and transparent."

---

## Key Talking Points

- **Not an AI salary system** - AI recommends, manager approves
- **Explainable AI** - Every score has a breakdown and evidence
- **Auditable** - SHA-256 hashes of every decision artifact
- **Stellar-ready** - Mock Soroban today, real smart contracts tomorrow
- **Natural language** - No complex configuration needed
