import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { setupWalletForPayments, getAccountBalance } from "@/lib/stellar";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, userType } = body; // userType: "sponsor" | "student"

  if (!userId || !userType) {
    return NextResponse.json(
      { error: "userId and userType are required" },
      { status: 400 }
    );
  }

  const db = getDb();
  const collection = userType === "sponsor" ? "sponsors" : "students";
  const doc = await db.collection(collection).doc(userId).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data = doc.data()!;
  const secretKey: string | undefined = data.walletSecretKey;
  const publicKey: string = data.walletAddress;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Wallet secret key not found. Please re-register." },
      { status: 400 }
    );
  }

  // Get balance before setup
  const balanceBefore = await getAccountBalance(publicKey);
  console.log(`[setup-wallet] ${userType} ${userId} | before: ${JSON.stringify(balanceBefore)}`);

  // Run full setup: trustline + XLM→USDC swap
  const usdcTarget = userType === "sponsor" ? "100" : "0"; // sponsors get 100 USDC, students just need trustline
  const result = await setupWalletForPayments(secretKey, usdcTarget === "0" ? "10" : usdcTarget);

  // Get balance after setup
  const balanceAfter = await getAccountBalance(publicKey);
  console.log(`[setup-wallet] ${userType} ${userId} | after: ${JSON.stringify(balanceAfter)}`);

  return NextResponse.json({
    success: true,
    userId,
    userType,
    publicKey,
    trustlineSetup: result.trustline,
    swap: result.swap,
    balanceBefore,
    balanceAfter,
  });
}

// GET endpoint to check wallet status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const userType = searchParams.get("userType");

  if (!userId || !userType) {
    return NextResponse.json({ error: "userId and userType required" }, { status: 400 });
  }

  const db = getDb();
  const collection = userType === "sponsor" ? "sponsors" : "students";
  const doc = await db.collection(collection).doc(userId).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data = doc.data()!;
  const balance = await getAccountBalance(data.walletAddress);

  return NextResponse.json({
    publicKey: data.walletAddress,
    balance,
    hasSecretKey: !!data.walletSecretKey,
  });
}
