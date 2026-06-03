import { FACILITATOR_URL, NETWORK, USDC_TESTNET } from "./stellar";

export interface X402PaymentResult {
  success: boolean;
  data?: unknown;
  amount?: string;
  txHash?: string;
  error?: string;
}

export async function payForScoringService(
  secretKey: string,
  endpoint: string,
  body: unknown
): Promise<X402PaymentResult> {
  try {
    const { wrapFetch } = await import("@x402/fetch");
    const { Resource } = await import("@x402/fetch");

    const fetchWithPayment = wrapFetch(fetch, {
      secretKey,
      network: NETWORK,
    });

    const res = await fetchWithPayment(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data,
        amount: "$0.01",
        txHash: res.headers.get("x-payment-tx") ?? undefined,
      };
    }

    return {
      success: false,
      error: `Request failed: ${res.status}`,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Payment failed",
    };
  }
}

export const X402_CONFIG = {
  price: "$0.01",
  asset: USDC_TESTNET.code,
  network: NETWORK,
  facilitator: FACILITATOR_URL,
  description: "AI Scoring Engine — per-request micropayment",
};
