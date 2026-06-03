# Autonomous Compensation Agent

**Natural Language Performance Incentive Agent**

> AI recommends, explains, and scores. The authorized manager approves. Soroban makes the compensation rules, approval, and payout result auditable.

---

## Problem

Traditional performance bonus distribution is opaque, subjective, and inconsistent:

- **No transparency**: Employees don't understand how bonuses are calculated
- **Bias-prone**: Manual evaluations lead to inconsistent and unfair outcomes
- **No audit trail**: Decisions are undocumented and impossible to verify
- **Time-consuming**: Managers spend hours on spreadsheets every cycle

## Solution

Autonomous Compensation Agent lets managers describe performance criteria in **natural language**. Gemini AI converts those descriptions into measurable rules, analyzes employee contribution data, generates explainable scores, and recommends bonus allocations. A human manager reviews and approves the recommendations. The system creates an auditable record using mock Soroban/Stellar.

**Key principle: AI recommends, humans decide.**

### Workflow

1. **Define Rules** - Manager writes criteria in plain English
2. **Analyze Contributions** - Review employee performance data
3. **Generate Scores** - Gemini AI calculates weighted scores with explanations
4. **Manager Approval** - Human reviews, edits, and approves
5. **Audit Record** - SHA-256 hashes stored via mock Soroban
6. **Payout** - Simulated USDC distribution on Stellar

## Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   Next.js 15     |---->|   Gemini API     |---->|   Mock Soroban   |
|   Frontend       |     |   (AI Engine)    |     |   (Audit Layer)  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|   shadcn/ui      |     |   parseRules()   |     |   SHA-256 Hash   |
|   Tailwind CSS   |     |   scoreEmployees |     |   Transaction ID |
|   Zustand State  |     |   generateExpl() |     |   Audit Records  |
+------------------+     +------------------+     +------------------+
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Gemini API (gemini-2.5-flash) |
| State | Zustand |
| Audit | SHA-256 hashing (Web Crypto API) |
| Blockchain | Mock Soroban/Stellar integration |

## Gemini Usage

Three core AI functions powered by Gemini:

1. **`parseRules()`** - Converts natural language performance criteria into structured JSON metrics with weights and data sources
2. **`scoreEmployees()`** - Analyzes employee contributions against defined metrics, calculates normalized/weighted scores, and recommends bonus allocations
3. **`generateExplanation()`** - Produces human-readable explanations and evidence for each score

All functions include:
- JSON-only output format
- Automatic retry on invalid responses
- Fallback mock responses when API key is missing
- Input validation and weight normalization

## Stellar Integration Strategy

### Current (Hackathon MVP)
- Mock Soroban audit layer using SHA-256 hashing
- Simulated USDC payouts with generated transaction hashes
- Mock Stellar wallet connection

### Future Real Soroban Integration
- **Smart Contract**: Deploy Soroban contract storing rule hashes, score hashes, and approval records on-chain
- **USDC Payments**: Real Circle USDC transfers on Stellar for bonus distribution
- **Passkey-Kit**: Smart wallet authentication for managers
- **Trustlines**: Automatic USDC trustline management
- **Compliance Hooks**: On-chain verification of manager approval before payout execution

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
cd web
pnpm install
```

### Configuration

Create `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

The app works without an API key using fallback mock responses.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Team

**Takim 7** - Build On Stellar Hackathon, IBW 2026 Istanbul
