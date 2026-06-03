import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { generateKeypair, fundTestnetAccount, setupWalletForPayments } from "@/lib/stellar";

const EDU_DOMAINS = [
  ".edu", ".edu.tr", ".ac.uk", ".ac.in", ".edu.br", ".edu.ng",
  ".edu.ar", ".edu.lb", ".edu.gh", ".ac.jp", ".edu.au", ".edu.mx",
  ".edu.cn", ".ac.za", ".edu.eg", ".edu.pk", ".ac.kr", ".edu.my",
  ".edu.sg", ".edu.co", ".edu.pe", ".edu.cl",
];

function isEduEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return EDU_DOMAINS.some((domain) => lower.endsWith(domain));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "login-student") {
    const { email } = body;
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const db = getDb();
    const existing = await db.collection("students").where("email", "==", email).get();
    if (existing.empty) {
      return NextResponse.json({ error: "No account found with this email. Please register first." }, { status: 404 });
    }
    const doc = existing.docs[0];
    return NextResponse.json({ student: { id: doc.id, ...doc.data() } });
  }

  if (action === "login-sponsor") {
    const { email } = body;
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const db = getDb();
    const existing = await db.collection("sponsors").where("email", "==", email).get();
    if (existing.empty) {
      return NextResponse.json({ error: "No account found with this email. Please register first." }, { status: 404 });
    }
    const doc = existing.docs[0];
    return NextResponse.json({ sponsor: { id: doc.id, ...doc.data() } });
  }

  if (action === "register-student") {
    const { name, email, university, department, country, year, gpa, githubUrl, linkedinUrl } = body;

    if (!name || !email || !university || !department || !country || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isEduEmail(email)) {
      return NextResponse.json(
        { error: "A valid university email (.edu) is required to register as a student" },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = await db.collection("students").where("email", "==", email).get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      return NextResponse.json({ student: { id: doc.id, ...doc.data() } });
    }

    const { publicKey, secretKey } = generateKeypair();
    await fundTestnetAccount(publicKey);

    const student = {
      name, email, university, department, country,
      year: Number(year),
      gpa: gpa ? Number(gpa) : null,
      githubUrl: githubUrl || null,
      linkedinUrl: linkedinUrl || null,
      verified: true,
      walletAddress: publicKey,
      walletSecretKey: secretKey, // stored server-side only for testnet payments
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("students").add(student);
    // Never expose secretKey to the frontend
    const { walletSecretKey: _s, ...safeStudent } = student;
    void _s;

    // Background: setup USDC trustline + swap XLM→USDC (don't await — don't block response)
    void setupWalletForPayments(secretKey, "10").then((r) =>
      console.log(`[auth] student wallet setup done:`, r)
    );

    return NextResponse.json({ student: { id: ref.id, ...safeStudent } });
  }

  if (action === "register-sponsor") {
    const { name, email, company } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.collection("sponsors").where("email", "==", email).get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      return NextResponse.json({ sponsor: { id: doc.id, ...doc.data() } });
    }

    const { publicKey, secretKey } = generateKeypair();
    await fundTestnetAccount(publicKey);

    const sponsor = {
      name, email,
      company: company || null,
      walletAddress: publicKey,
      walletSecretKey: secretKey, // stored server-side only for testnet payments
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("sponsors").add(sponsor);
    // Never expose secretKey to the frontend
    const { walletSecretKey: _s, ...safeSponsor } = sponsor;
    void _s;

    // Background: setup USDC trustline + swap XLM→USDC (don't await — don't block response)
    void setupWalletForPayments(secretKey, "100").then((r) =>
      console.log(`[auth] sponsor wallet setup done:`, r)
    );

    return NextResponse.json({ sponsor: { id: ref.id, ...safeSponsor } });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
