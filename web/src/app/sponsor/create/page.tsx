"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { Coffee, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CreateOfferPage() {
  const router = useRouter();
  const sponsor = useAppStore((s) => s.sponsor);
  const [offerType, setOfferType] = useState<"treat" | "scholarship">("treat");
  const [form, setForm] = useState({ title: "", description: "", amount: "", targetDepartment: "", targetCountry: "", maxApplicants: "10", treatDetails: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!sponsor) return (<div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4"><h2 className="text-xl font-bold">Please log in first</h2><Link href="/auth/sponsor"><Button>Go to Sponsor Login</Button></Link></div>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", sponsorId: sponsor.id, sponsorName: sponsor.company || sponsor.name, type: offerType, ...form, amount: Number(form.amount) }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push("/sponsor/dashboard");
    } catch { setError("Network error"); setLoading(false); }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Offer</h1>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => setOfferType("treat")} className={`p-4 rounded-xl border-2 text-center transition-all ${offerType === "treat" ? "border-blue-500 bg-blue-50" : "border-muted hover:border-blue-200"}`}>
          <Coffee className={`h-6 w-6 mx-auto mb-2 ${offerType === "treat" ? "text-blue-600" : "text-muted-foreground"}`} /><p className="font-semibold text-sm">Treat</p><p className="text-xs text-muted-foreground">Coffee, lunch, books...</p>
        </button>
        <button onClick={() => setOfferType("scholarship")} className={`p-4 rounded-xl border-2 text-center transition-all ${offerType === "scholarship" ? "border-violet-500 bg-violet-50" : "border-muted hover:border-violet-200"}`}>
          <GraduationCap className={`h-6 w-6 mx-auto mb-2 ${offerType === "scholarship" ? "text-violet-600" : "text-muted-foreground"}`} /><p className="font-semibold text-sm">Scholarship</p><p className="text-xs text-muted-foreground">Academic support</p>
        </button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">{offerType === "treat" ? "Treat Details" : "Scholarship Details"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input placeholder={offerType === "treat" ? "Coffee for CS students" : "Engineering Scholarship 2026"} value={form.title} onChange={(e) => update("title", e.target.value)} required /></div>
            <div className="space-y-2"><Label>Amount (USDC) *</Label><Input type="number" min="1" placeholder={offerType === "treat" ? "5" : "500"} value={form.amount} onChange={(e) => update("amount", e.target.value)} required /></div>
            {offerType === "treat" && <div className="space-y-2"><Label>What are you treating? *</Label><Input placeholder="Starbucks coffee, lunch, books..." value={form.treatDetails} onChange={(e) => update("treatDetails", e.target.value)} /></div>}
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Who is this for? What do you hope to achieve?" value={form.description} onChange={(e) => update("description", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Target Department</Label><Input placeholder="Any" value={form.targetDepartment} onChange={(e) => update("targetDepartment", e.target.value)} /></div>
              <div className="space-y-2"><Label>Target Region</Label><Input placeholder="Worldwide" value={form.targetCountry} onChange={(e) => update("targetCountry", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Max Applicants</Label><Input type="number" min="1" value={form.maxApplicants} onChange={(e) => update("maxApplicants", e.target.value)} /></div>
            {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"><AlertCircle className="h-4 w-4" /> {error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</> : `Create ${offerType === "treat" ? "Treat" : "Scholarship"}`}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
