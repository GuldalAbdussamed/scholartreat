import { NextRequest, NextResponse } from "next/server";
import { rankApplicantsWithCommand } from "@/lib/gemini";
import { Application, Offer } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { command, applicants, offer } = body as {
    command: string;
    applicants: Application[];
    offer: Offer;
  };

  if (!command || !applicants || !offer) {
    return NextResponse.json(
      { error: "command, applicants, and offer are required" },
      { status: 400 }
    );
  }

  if (applicants.length === 0) {
    return NextResponse.json(
      { error: "No applicants to rank" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const result = await rankApplicantsWithCommand(command, applicants, offer, apiKey);

  return NextResponse.json({ result });
}
