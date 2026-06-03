import { Student, Offer, AIAnalysis } from "./types";

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd !== -1) return text.slice(braceStart, braceEnd + 1);
  return text.trim();
}

function buildStudentAnalysisPrompt(student: Student, offer: Offer): string {
  return `You are an autonomous scholarship matching agent. Analyze this student's profile against the scholarship/treat offer and provide a match score.

Student Profile:
- Name: ${student.name}
- University: ${student.university}
- Department: ${student.department}
- Country: ${student.country}
- Year: ${student.year}
- GPA: ${student.gpa ?? "Not provided"}
- GitHub: ${student.githubUrl || "Not provided"}
- LinkedIn: ${student.linkedinUrl || "Not provided"}
- Verified: ${student.verified}

Offer Details:
- Title: ${offer.title}
- Type: ${offer.type} (${offer.type === "treat" ? "coffee/food/gift sponsorship" : "academic scholarship"})
- Description: ${offer.description}
- Amount: ${offer.amount} USDC
- Target Department: ${offer.targetDepartment || "Any"}
- Target Country: ${offer.targetCountry || "Worldwide"}
${offer.treatDetails ? `- Treat: ${offer.treatDetails}` : ""}

Return ONLY valid JSON (no markdown, no code fences):
{
  "score": 85,
  "summary": "One paragraph analysis of why this student is a good/bad match",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "recommendation": "One sentence: should this student be selected?"
}

Scoring rules:
- Score 0-100
- Verified student: +20 base
- Department match: +25
- Country/region match: +15
- High GPA (>3.5): +20
- Active study year (2-3): +10
- GitHub/LinkedIn presence: +10
- Be honest and specific in the summary`;
}

export async function analyzeStudentWithGemini(
  student: Student,
  offer: Offer,
  apiKey?: string
): Promise<AIAnalysis> {
  if (!apiKey) return fallbackAnalysis(student, offer);

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: buildStudentAnalysisPrompt(student, offer),
        config: { responseMimeType: "application/json" },
      });
      const text = response.text ?? "";
      const json = JSON.parse(extractJSON(text));
      if (typeof json.score === "number") return json as AIAnalysis;
    } catch (e) {
      const msg = (e as Error).message || "";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        await new Promise((r) => setTimeout(r, 10000 * (attempt + 1)));
      }
    }
  }

  return fallbackAnalysis(student, offer);
}

function fallbackAnalysis(student: Student, offer: Offer): AIAnalysis {
  let score = 0;
  const strengths: string[] = [];

  if (student.verified) { score += 20; strengths.push("Verified student identity"); }
  if (offer.targetDepartment && student.department.toLowerCase().includes(offer.targetDepartment.toLowerCase())) {
    score += 25; strengths.push(`Department match: ${student.department}`);
  }
  if (offer.targetCountry && student.country.toLowerCase().includes(offer.targetCountry.toLowerCase())) {
    score += 15; strengths.push(`Region match: ${student.country}`);
  }
  if (student.gpa && student.gpa >= 3.5) { score += 20; strengths.push(`High GPA: ${student.gpa}`); }
  else if (student.gpa && student.gpa >= 3.0) { score += 10; strengths.push(`Good GPA: ${student.gpa}`); }
  if (student.year === 2 || student.year === 3) { score += 10; strengths.push(`Active study period (Year ${student.year})`); }
  if (student.githubUrl || student.linkedinUrl) { score += 10; strengths.push("Active professional profile"); }

  return {
    score,
    summary: `${student.name} from ${student.university} (${student.country}) scored ${score}/100 for "${offer.title}". ${strengths.length > 0 ? "Key strengths include " + strengths.slice(0, 2).join(" and ") + "." : "Limited profile data available."}`,
    strengths,
    recommendation: score >= 60 ? "Recommended for selection." : "Below threshold — consider other candidates.",
  };
}
