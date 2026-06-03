# ScholarTreat 🎓☕ (Web Client)

This directory contains the Next.js frontend and API route implementations for **ScholarTreat**, an AI-matched global student micro-sponsorship platform settled instantly on Stellar.

Refer to the main [README.md](../README.md) in the root directory for full project details, architectural overview, and problems/solutions solved.

## Directory Structure

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx            # ScholarTreat Landing Page
│   │   ├── auth/               # Student & Sponsor registration flow
│   │   ├── sponsor/            # Sponsor dashboard & offer creation
│   │   ├── student/            # Student application & wallet management
│   │   └── api/                # Stellar setup, payments, and Gemini matching endpoints
│   ├── components/             # Reusable UI components & layouts (shadcn/ui)
│   └── lib/
│       ├── stellar.ts          # Stellar SDK wrappers (USDC trustlines, payments, DEX swaps)
│       ├── x402-client.ts      # x402 agentic payment integration client
│       └── firebase.ts         # Firebase initialization
```

## Running the Web App

Make sure you have Node.js and `pnpm` installed.

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Setup `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```

3. Run in development mode:
   ```bash
   pnpm dev
   ```
