# ScholarTreat 🎓☕

**Global Sponsor-Student Matching & Instant Micro-Sponsorships Settled on Stellar**

ScholarTreat is a web application built for the **Build on Stellar Hackathon (IBW 2026 Istanbul)**. It connects global sponsors with deserving students, enabling micro-sponsorships (e.g., buying a coffee, funding books, meals, or tuition) that settle instantly and transparently using USDC on the Stellar network.

---

## 💡 The Problem & The Solution

### The Problem
* **Global Access Barriers**: High transaction fees and slow cross-border rails make international micro-donations to students unviable.
* **Lack of Trust**: Sponsors want to know their funds go to actual students meeting specific criteria (e.g., studying computer science, working on open-source).
* **Inefficient Matching**: Manually sorting through student applications is time-consuming for sponsors.

### The ScholarTreat Solution
1. **Edu-Verified Profiles**: Students register and verify their academic status (using `.edu` emails).
2. **AI-Powered Matching**: Sponsors set criteria in natural language. Google **Gemini 2.5 Flash** evaluates student profiles, scores them, and recommends the best match.
3. **Stellar Settlements**: Low-cost, instant USDC payments on Stellar Testnet (with automated trustlines and XLM-to-USDC swaps via the Stellar DEX).
4. **Agentic Micropayments (x402)**: The AI scoring agent charges tiny fees using the x402 protocol, showcasing self-paying autonomous agents.

---

## 🛠️ Architecture & Tech Stack

```
   +--------------------+          +--------------------+
   |  Next.js Frontend  | <======> | Firebase Firestore |
   |  & API Endpoints   |          | (User & Offer Data)|
   +--------------------+          +--------------------+
             ||                              ||
             \/                              \/
   +--------------------+          +--------------------+
   |   Gemini 2.5 API   |          |    Stellar SDK     |
   | (Student Matching) |          | (USDC, Swaps, DEX) |
   +--------------------+          +--------------------+
             ||                              ||
             \/                              \/
   +--------------------+          +--------------------+
   |   x402 Protocol    |          |  Stellar Testnet   |
   | (Agent Payment)    |          |  & Stellar.Expert  |
   +--------------------+          +--------------------+
```

### Core Technologies
* **Framework**: Next.js (App Router, Tailwind CSS + shadcn/ui)
* **Database**: Firebase Firestore
* **Blockchain**: Stellar Network (`@stellar/stellar-sdk` & `@stellar/freighter-api`)
* **AI Engine**: Gemini 2.5 Flash (`@google/genai`)
* **Agent Protocol**: x402 Protocol for payment-required AI API endpoints

---

## 🌟 Key Features

* **Sponsor Hub**: Sponsors can create scholarship or micro-treat offers (e.g., "Buy 10 USDC worth of coffee for a CS student learning Rust").
* **Student Dashboard**: Students apply for active treats, link their academic credentials, Github, and LinkedIn.
* **Smart Matching Engine**: Gemini matches applications to the sponsor's criteria, providing an explanation score.
* **Autonomous Wallet Lifecycle**: 
  * Auto-generates Stellar keypairs for new users.
  * Funds accounts using Friendbot.
  * Sets up USDC trustlines automatically.
  * Swaps XLM to USDC via path payment operations on the Stellar DEX.
* **x402 Agent Payment**: Each AI evaluation runs through a payment-aware route, simulated under the HTTP 402 protocol.
* **Stellar Explorer Integration**: Links directly to Stellar.Expert for transaction verification.

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* pnpm

### Installation

1. Clone the repository and navigate to the web directory:
   ```bash
   cd web
   pnpm install
   ```

2. Configure environment variables in `web/.env.local`:
   ```env
   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash

   # Firebase Config (If using database features locally)
   # (Add your Firebase credentials here)
   ```
   *Note: If no Gemini key is provided, the app gracefully falls back to mock responses.*

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🤝 Team & Acknowledgements

Developed by **Takım 7** for the **Build on Stellar Hackathon / Istanbul Blockchain Week 2026**.
