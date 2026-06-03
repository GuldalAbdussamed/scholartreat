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
      tx.addMemo(StellarSdk.Memo.text(memo.slice(0, 28)));
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
    const msg =
      e instanceof Error ? e.message : "Transaction failed";
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
      tx.addMemo(StellarSdk.Memo.text(memo.slice(0, 28)));
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
