export interface Student {
  id: string;
  name: string;
  email: string;
  university: string;
  department: string;
  country: string;
  year: number;
  gpa?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  verified: boolean;
  walletAddress: string;
  createdAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  email: string;
  company?: string;
  walletAddress: string;
  createdAt: string;
}

export type OfferType = "scholarship" | "treat";

export interface Offer {
  id: string;
  sponsorId: string;
  sponsorName: string;
  type: OfferType;
  title: string;
  description: string;
  amount: number;
  targetDepartment?: string;
  targetCountry?: string;
  maxApplicants: number;
  treatDetails?: string;
  status: "open" | "closed" | "completed";
  applicants: Application[];
  selectedStudentId?: string;
  createdAt: string;
}

export interface Application {
  studentId: string;
  studentName: string;
  studentEmail: string;
  university: string;
  country: string;
  message?: string;
  aiScore?: number;
  aiAnalysis?: string;
  status: "pending" | "selected" | "rejected";
  appliedAt: string;
}

export interface AIAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  recommendation: string;
}

export interface PaymentResult {
  offerId: string;
  studentId: string;
  amount: number;
  txHash: string;
  stellarExpertUrl: string;
  timestamp: string;
}

export type UserRole = "student" | "sponsor" | "none";
