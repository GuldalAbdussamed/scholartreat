import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import {
  ensureUsdcTrustline,
  sendUsdcPayment,
  swapXlmForUsdc,
  getAccountBalance,
  generateKeypair,
  fundTestnetAccount,
  setupWalletForPayments,
} from "@/lib/stellar";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sponsorId, studentId, offerId, amount, memo } = body;

  if (!sponsorId || !studentId || !amount) {
    return NextResponse.json(
      { error: "sponsorId, studentId, and amount are required" },
      { status: 400 }
    );
  }

  const db = getDb();

  // 1. Get sponsor's secret key from Firestore
  const sponsorDoc = await db.collection("sponsors").doc(sponsorId).get();
  if (!sponsorDoc.exists) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }
  const sponsorData = sponsorDoc.data()!;
  let sponsorSecret: string = sponsorData.walletSecretKey;
  let sponsorPublicKey: string = sponsorData.walletAddress;

  if (!sponsorSecret || !sponsorPublicKey) {
    const { publicKey, secretKey } = generateKeypair();
    console.log(`[pay] Auto-generating wallet for sponsor ${sponsorId}: ${publicKey}`);
    const funded = await fundTestnetAccount(publicKey);
    if (!funded) {
      return NextResponse.json({ error: "Failed to fund new sponsor wallet via Friendbot" }, { status: 500 });
    }
    // Update firestore
    await db.collection("sponsors").doc(sponsorId).update({
      walletAddress: publicKey,
      walletSecretKey: secretKey,
    });
    sponsorSecret = secretKey;
    sponsorPublicKey = publicKey;

    // Run full setup: trustline + swap XLM→USDC
    console.log("[pay] Running wallet setup for auto-generated sponsor wallet...");
    await setupWalletForPayments(sponsorSecret, "100");
  }

  // 2. Get student's public key (and secret for trustline setup)
  const studentDoc = await db.collection("students").doc(studentId).get();
  if (!studentDoc.exists) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  const studentData = studentDoc.data()!;
  let studentPublicKey: string = studentData.walletAddress;
  let studentSecret: string | undefined = studentData.walletSecretKey;

  if (!studentSecret || !studentPublicKey) {
    const { publicKey, secretKey } = generateKeypair();
    console.log(`[pay] Auto-generating wallet for student ${studentId}: ${publicKey}`);
    const funded = await fundTestnetAccount(publicKey);
    if (!funded) {
      console.warn("[pay] Failed to fund new student wallet via Friendbot");
    }
    // Update firestore
    await db.collection("students").doc(studentId).update({
      walletAddress: publicKey,
      walletSecretKey: secretKey,
    });
    studentSecret = secretKey;
    studentPublicKey = publicKey;

    // Run full setup for student: trustline + swap XLM→USDC
    console.log("[pay] Running wallet setup for auto-generated student wallet...");
    await setupWalletForPayments(studentSecret, "10");
  }

  console.log(`[pay] Sponsor: ${sponsorPublicKey} → Student: ${studentPublicKey}, Amount: ${amount} USDC`);

  // 3. Ensure sponsor has USDC trustline
  console.log("[pay] Setting up sponsor USDC trustline...");
  const sponsorTrustline = await ensureUsdcTrustline(sponsorSecret);
  if (!sponsorTrustline) {
    return NextResponse.json(
      { error: "Failed to set up sponsor USDC trustline. Make sure sponsor has XLM for fees." },
      { status: 500 }
    );
  }

  // 4. Ensure student has USDC trustline (needs their secret key)
  if (studentSecret) {
    console.log("[pay] Setting up student USDC trustline...");
    await ensureUsdcTrustline(studentSecret);
  } else {
    // Student registered before secret key was saved — fund + fund won't help
    // We'll try the payment anyway; it may fail if no trustline
    console.warn("[pay] Student secret key not available, skipping trustline setup");
  }

  // 5. Check sponsor USDC balance — auto-swap if needed
  const balanceBefore = await getAccountBalance(sponsorPublicKey);
  const usdcBalance = parseFloat(balanceBefore.usdc || "0");
  const amountNeeded = parseFloat(String(amount));

  console.log(`[pay] Sponsor USDC balance: ${usdcBalance}, need: ${amountNeeded}`);

  if (usdcBalance < amountNeeded) {
    console.log(`[pay] Insufficient USDC — auto-swapping XLM→USDC via DEX...`);
    const swapAmount = Math.max(amountNeeded * 2, 50).toFixed(0); // swap 2x needed, min 50
    const swapResult = await swapXlmForUsdc(sponsorSecret, swapAmount);
    if (swapResult.success) {
      console.log(`[pay] ✓ Swapped! Got ${swapResult.usdcReceived} USDC | TX: ${swapResult.txHash}`);
    } else {
      console.warn(`[pay] Swap failed: ${swapResult.error} — will try XLM fallback`);
    }
  }

  // 6. Send USDC payment
  console.log("[pay] Sending USDC payment...");
  const result = await sendUsdcPayment(
    sponsorSecret,
    studentPublicKey,
    String(amount),
    memo || `ScholarTreat pay`
  );

  if (!result.success) {
    // If USDC payment fails (likely no USDC balance), try XLM as fallback for demo
    console.warn("[pay] USDC payment failed, trying XLM fallback:", result.error);

    // Import sendPayment for XLM fallback
    const { sendPayment } = await import("@/lib/stellar");
    const xlmResult = await sendPayment(
      sponsorSecret,
      studentPublicKey,
      String(amount),
      memo || "ScholarTreat"
    );

    if (xlmResult.success) {
      // Mark offer as completed
      if (offerId) {
        await db.collection("offers").doc(offerId).update({
          selectedStudentId: studentId,
          status: "completed",
          txHash: xlmResult.txHash,
          paidAt: new Date().toISOString(),
          assetUsed: "XLM (fallback)",
        });
      }

      return NextResponse.json({
        success: true,
        txHash: xlmResult.txHash,
        ledger: xlmResult.ledger,
        stellarExpertUrl: xlmResult.stellarExpertUrl,
        asset: "XLM",
        note: "Sent XLM (testnet). To send USDC, fund the sponsor wallet at faucet.circle.com",
      });
    }

    return NextResponse.json(
      { error: `Payment failed: ${result.error}` },
      { status: 500 }
    );
  }

  // 6. Mark offer as completed in Firestore
  if (offerId) {
    await db.collection("offers").doc(offerId).update({
      selectedStudentId: studentId,
      status: "completed",
      txHash: result.txHash,
      paidAt: new Date().toISOString(),
      assetUsed: "USDC",
    });
  }

  console.log("[pay] Payment successful! TX:", result.txHash);

  return NextResponse.json({
    success: true,
    txHash: result.txHash,
    ledger: result.ledger,
    stellarExpertUrl: result.stellarExpertUrl,
    asset: "USDC",
    sponsorPublicKey,
    studentPublicKey,
  });
}
