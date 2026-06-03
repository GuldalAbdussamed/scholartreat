"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Coffee, AlertCircle, Loader2 } from "lucide-react";

export default function SponsorAuthPage() {
  const router = useRouter();
  const setSponsor = useAppStore((s) => s.setSponsor);
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "register-sponsor", ...form }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      setSponsor(data.sponsor);
      router.push("/sponsor/dashboard");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-3"><Coffee className="h-7 w-7 text-blue-600" /></div>
        <h1 className="text-2xl font-bold">Sponsor Registration</h1>
        <p className="text-sm text-muted-foreground mt-1">Individual or company — start supporting students in minutes</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Your Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="Jane Smith" value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => update("email", e.target.value)} required /></div>
            <div className="space-y-2"><Label>Company / Organization (optional)</Label><Input placeholder="Acme Corp" value={form.company} onChange={(e) => update("company", e.target.value)} /></div>
            {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Setting up...</> : "Register & Get Stellar Wallet"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
