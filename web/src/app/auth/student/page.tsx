"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { GraduationCap, Code2, Briefcase, AlertCircle, Loader2 } from "lucide-react";

export default function StudentAuthPage() {
  const router = useRouter();
  const setStudent = useAppStore((s) => s.setStudent);
  const [form, setForm] = useState({ name: "", email: "", university: "", department: "", country: "", year: "", gpa: "", githubUrl: "", linkedinUrl: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "register-student", ...form }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      setStudent(data.student);
      router.push("/student/browse");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-3"><GraduationCap className="h-7 w-7 text-violet-600" /></div>
        <h1 className="text-2xl font-bold">Student Registration</h1>
        <p className="text-sm text-muted-foreground mt-1">A valid university email is required to verify your student status</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Your Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
            <div className="space-y-2"><Label>University Email *</Label><Input type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => update("email", e.target.value)} required /><p className="text-xs text-muted-foreground">Must end with .edu, .edu.tr, .ac.uk, etc.</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>University *</Label><Input placeholder="MIT" value={form.university} onChange={(e) => update("university", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Department *</Label><Input placeholder="Computer Science" value={form.department} onChange={(e) => update("department", e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Country *</Label><Input placeholder="Turkey" value={form.country} onChange={(e) => update("country", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Year *</Label><Input type="number" min="1" max="6" placeholder="3" value={form.year} onChange={(e) => update("year", e.target.value)} required /></div>
              <div className="space-y-2"><Label>GPA</Label><Input type="number" step="0.1" min="0" max="4" placeholder="3.5" value={form.gpa} onChange={(e) => update("gpa", e.target.value)} /></div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3"><Badge variant="outline" className="text-xs">Optional</Badge><span className="text-sm text-muted-foreground">Improve your AI match score</span></div>
              <div className="space-y-3">
                <div className="space-y-2"><Label className="flex items-center gap-2"><Code2 className="h-4 w-4" /> GitHub Profile</Label><Input placeholder="https://github.com/username" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} /></div>
                <div className="space-y-2"><Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> LinkedIn Profile</Label><Input placeholder="https://linkedin.com/in/username" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} /></div>
              </div>
            </div>
            {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</> : "Register & Get Stellar Wallet"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
