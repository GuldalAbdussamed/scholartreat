import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export async function GET() {
  const db = getDb();
  const snapshot = await db.collection("offers").orderBy("createdAt", "desc").get();
  const offers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    const {
      sponsorId, sponsorName, type, title, description,
      amount, targetDepartment, targetCountry, maxApplicants, treatDetails,
    } = body;

    if (!sponsorId || !title || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const offer = {
      sponsorId, sponsorName: sponsorName || "Anonymous", type, title,
      description: description || "", amount: Number(amount),
      targetDepartment: targetDepartment || null, targetCountry: targetCountry || null,
      maxApplicants: Number(maxApplicants) || 10, treatDetails: treatDetails || null,
      status: "open", applicants: [], selectedStudentId: null,
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("offers").add(offer);
    return NextResponse.json({ offer: { id: ref.id, ...offer } });
  }

  if (action === "apply") {
    const { offerId, studentId, studentName, studentEmail, university, country, message } = body;
    if (!offerId || !studentId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const db = getDb();
    const offerRef = db.collection("offers").doc(offerId);
    const offerDoc = await offerRef.get();
    if (!offerDoc.exists) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    const applicants = offerDoc.data()!.applicants || [];
    if (applicants.some((a: { studentId: string }) => a.studentId === studentId))
      return NextResponse.json({ error: "Already applied" }, { status: 400 });

    const application = {
      studentId, studentName: studentName || "Student", studentEmail: studentEmail || "",
      university: university || "", country: country || "", message: message || "",
      aiScore: null, aiAnalysis: null, status: "pending", appliedAt: new Date().toISOString(),
    };

    await offerRef.update({ applicants: [...applicants, application] });
    return NextResponse.json({ success: true, application });
  }

  if (action === "select") {
    const { offerId, studentId } = body;
    const db = getDb();
    await db.collection("offers").doc(offerId).update({ selectedStudentId: studentId, status: "completed" });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
