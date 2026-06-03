import { NextRequest, NextResponse } from "next/server";
import { analyzeStudentWithGemini } from "@/lib/gemini";
import { Student, Offer } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { student, offer } = (await req.json()) as { student: Student; offer: Offer };
  if (!student || !offer) return NextResponse.json({ error: "Student and offer are required" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  const analysis = await analyzeStudentWithGemini(student, offer, apiKey);
  return NextResponse.json({ analysis });
}
