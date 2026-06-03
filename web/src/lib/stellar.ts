import * as StellarSdk from "@stellar/stellar-sdk";

export const NETWORK = "stellar:testnet";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

export const USDC_TESTNET = {
  code: "USDC",
  issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  contract: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
};

export const FACILITATOR_URL = "https://www.x402.org/facilitator";

export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAccountBalance(
  publicKey: string
): Promise<{ xlm: string; usdc: string }> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    let xlm = "0";
    let usdc = "0";

    for (const balance of account.balances) {
      if (balance.asset_type === "native") {
        xlm = balance.balance;
      } else if (
        "asset_code" in balance &&
        balance.asset_code === "USDC" &&
        balance.asset_issuer === USDC_TESTNET.issuer
      ) {
        usdc = balance.balance;
      }
    }

    return { xlm, usdc };
  } catch {
    return { xlm: "0", usdc: "0" };
  }
}

export async function addUsdcTrustline(
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<boolean> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    const usdcAsset = new StellarSdk.Asset(
      USDC_TESTNET.code,
      USDC_TESTNET.issuer
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.changeTrust({ asset: usdcAsset }))
      .setTimeout(30)
      .build();

    const signedXdr = await signTransaction(tx.toXDR());
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      NETWORK_PASSPHRASE
    );
    await server.submitTransaction(signedTx);
    return true;
  } catch {
    return false;
  }
}

export function generateKeypair(): {
  publicKey: string;
  secretKey: string;
} {
  const pair = StellarSdk.Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

export function buildSafeTextMemo(memo: string): StellarSdk.Memo {
  let safeMemo = memo;
  const encoder = new TextEncoder();
  while (encoder.encode(safeMemo).length > 28) {
    safeMemo = safeMemo.slice(0, -1);
  }
  return StellarSdk.Memo.text(safeMemo);
}

export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export interface PayoutTxResult {
  success: boolean;
  txHash?: string;
  ledger?: number;
  stellarExpertUrl?: string;
  error?: string;
}

export async function sendPayment(
  senderSecret: string,
  destinationPublicKey: string,
  amount: string,
  memo?: string
): Promise<PayoutTxResult> {
  // Legacy XLM payment — kept for compatibility
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
    const senderAccount = await server.loadAccount(senderKeypair.publicKey());

    const tx = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(),
          amount,
        })
      )
      .setTimeout(30);

    if (memo) {
      tx.addMemo(buildSafeTextMemo(memo));
    }

    const built = tx.build();
    built.sign(senderKeypair);

    const result = await server.submitTransaction(built);
    const hash = result.hash;
    return {
      success: true,
      txHash: hash,
      ledger: result.ledger,
      stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Transaction failed";
    return { success: false, error: msg };
  }
}

// ── USDC trustline ─────────────────────────────────────────────

export async function ensureUsdcTrustline(secretKey: string): Promise<boolean> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(keypair.publicKey());

    // Check if trustline already exists
    const hasTrustline = account.balances.some(
      (b) =>
        "asset_code" in b &&
        b.asset_code === USDC_TESTNET.code &&
        b.asset_issuer === USDC_TESTNET.issuer
    );
    if (hasTrustline) return true;

    const usdcAsset = new StellarSdk.Asset(USDC_TESTNET.code, USDC_TESTNET.issuer);
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.changeTrust({ asset: usdcAsset }))
      .setTimeout(30)
      .build();

    tx.sign(keypair);
    await server.submitTransaction(tx);
    return true;
  } catch (e) {
    console.error("ensureUsdcTrustline error:", e);
    return false;
  }
}

// ── Real USDC payment ──────────────────────────────────────────

export async function sendUsdcPayment(
  senderSecret: string,
  destinationPublicKey: string,
  amount: string,
  memo?: string
): Promise<PayoutTxResult> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
    const senderAccount = await server.loadAccount(senderKeypair.publicKey());

    const usdcAsset = new StellarSdk.Asset(USDC_TESTNET.code, USDC_TESTNET.issuer);

    const txBuilder = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(
      StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: usdcAsset,
        amount,
      })
    ).setTimeout(30);

    if (memo) {
      txBuilder.addMemo(buildSafeTextMemo(memo));
    }

    const built = txBuilder.build();
    built.sign(senderKeypair);

    const result = await server.submitTransaction(built);
    const hash = result.hash;
    return {
      success: true,
      txHash: hash,
      ledger: result.ledger,
      stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  } catch (e: unknown) {
    const err = e as { response?: { data?: { extras?: { result_codes?: unknown } } } };
    const resultCodes = err?.response?.data?.extras?.result_codes;
    const msg = resultCodes
      ? JSON.stringify(resultCodes)
      : e instanceof Error
      ? e.message
      : "USDC payment failed";
    console.error("sendUsdcPayment error:", msg);
    return { success: false, error: msg };
  }
}

export async function createAndFundDestination(
  senderSecret: string,
  destinationPublicKey: string,
  amount: string,
  memo?: string
): Promise<PayoutTxResult> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
    const senderAccount = await server.loadAccount(senderKeypair.publicKey());

    const tx = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.createAccount({
          destination: destinationPublicKey,
          startingBalance: amount,
        })
      )
      .setTimeout(30);

    if (memo) {
      tx.addMemo(buildSafeTextMemo(memo));
    }

    const built = tx.build();
    built.sign(senderKeypair);

    const result = await server.submitTransaction(built);
    const hash = result.hash;
    return {
      success: true,
      txHash: hash,
      ledger: result.ledger,
      stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  } catch {
    return sendPayment(senderSecret, destinationPublicKey, amount, memo);
  }
}

// ── Auto-fund: XLM → USDC via Stellar DEX ─────────────────────

export interface SwapResult {
  success: boolean;
  usdcReceived?: string;
  xlmSpent?: string;
  txHash?: string;
  error?: string;
}

/**
 * Uses Stellar DEX pathPaymentStrictReceive to swap XLM (from Friendbot)
 * into USDC testnet. Checks for existing USDC balance first.
 */
export async function swapXlmForUsdc(
  secretKey: string,
  usdcAmountWanted: string = "50" // default: get 50 USDC
): Promise<SwapResult> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    const publicKey = keypair.publicKey();

    // 1. Load account
    const account = await server.loadAccount(publicKey);

    // 2. Check if already has enough USDC
    for (const bal of account.balances) {
      if (
        "asset_code" in bal &&
        bal.asset_code === USDC_TESTNET.code &&
        bal.asset_issuer === USDC_TESTNET.issuer
      ) {
        const existing = parseFloat(bal.balance);
        if (existing >= parseFloat(usdcAmountWanted) * 0.5) {
          console.log(`[swap] Already has ${existing} USDC, skipping swap`);
          return { success: true, usdcReceived: bal.balance };
        }
      }
    }

    const usdcAsset = new StellarSdk.Asset(USDC_TESTNET.code, USDC_TESTNET.issuer);

    // 3. Find path from XLM → USDC via Horizon
    const pathsRes = await server
      .strictReceivePaths(
        [StellarSdk.Asset.native()],
        usdcAsset,
        usdcAmountWanted
      )
      .call();

    if (!pathsRes.records || pathsRes.records.length === 0) {
      return { success: false, error: "No DEX path found for XLM→USDC on testnet" };
    }

    const bestPath = pathsRes.records[0];
    const sourceAmount = bestPath.source_amount;

    // Add 20% slippage buffer
    const sendMaxXlm = (parseFloat(sourceAmount) * 1.2).toFixed(7);

    console.log(
      `[swap] Path found: ${sendMaxXlm} XLM max → ${usdcAmountWanted} USDC | path: ${JSON.stringify(bestPath.path)}`
    );

    // 4. Build the pathPaymentStrictReceive transaction
    const intermediaryPath = (bestPath.path || []).map((p: { asset_type: string; asset_code?: string; asset_issuer?: string }) => {
      if (p.asset_type === "native") return StellarSdk.Asset.native();
      return new StellarSdk.Asset(p.asset_code!, p.asset_issuer!);
    });

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: "200",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.pathPaymentStrictReceive({
          sendAsset: StellarSdk.Asset.native(),
          sendMax: sendMaxXlm,
          destination: publicKey, // send to self
          destAsset: usdcAsset,
          destAmount: usdcAmountWanted,
          path: intermediaryPath,
        })
      )
      .setTimeout(60)
      .build();

    tx.sign(keypair);
    const result = await server.submitTransaction(tx);
    const hash = result.hash;

    console.log(`[swap] ✓ Swapped XLM→USDC! TX: ${hash}`);
    return {
      success: true,
      usdcReceived: usdcAmountWanted,
      xlmSpent: sourceAmount,
      txHash: hash,
    };
  } catch (e: unknown) {
    const err = e as { response?: { data?: { extras?: { result_codes?: unknown } } } };
    const resultCodes = err?.response?.data?.extras?.result_codes;
    const msg = resultCodes
      ? JSON.stringify(resultCodes)
      : e instanceof Error
      ? e.message
      : "Swap failed";
    console.error("[swap] error:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Full wallet setup for a new account:
 * 1. Ensure funded (Friendbot)
 * 2. Set up USDC trustline
 * 3. Swap XLM → USDC via DEX
 */
export async function setupWalletForPayments(
  secretKey: string,
  usdcAmount: string = "50"
): Promise<{ trustline: boolean; swap: SwapResult }> {
  const trustline = await ensureUsdcTrustline(secretKey);
  const swap = await swapXlmForUsdc(secretKey, usdcAmount);
  return { trustline, swap };
}

