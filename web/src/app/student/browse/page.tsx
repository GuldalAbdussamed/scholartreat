"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { Coffee, GraduationCap, Globe, Loader2, Bot, Send, CheckCircle2 } from "lucide-react";
import { Offer, AIAnalysis } from "@/lib/types";

export default function BrowseOffersPage() {
  const student = useAppStore((s) => s.student);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/offers").then((r) => r.json()).then((data) => {
      setOffers((data.offers || []).filter((o: Offer) => o.status === "open"));
      setLoading(false);
    });
  }, []);

  if (!student) return (<div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4"><h2 className="text-xl font-bold">Please log in first</h2><Link href="/auth/student"><Button>Go to Student Login</Button></Link></div>);

  const handleAnalyze = async (offer: Offer) => {
    setAnalyzing(offer.id);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student, offer }) });
      const data = await res.json();
      setAnalyses((prev) => ({ ...prev, [offer.id]: data.analysis }));
    } catch { /* fallback handled server-side */ }
    setAnalyzing(null);
  };

  const handleApply = async (offer: Offer) => {
    setApplying(offer.id);
    try {
      await fetch("/api/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "apply", offerId: offer.id, studentId: student.id, studentName: student.name, studentEmail: student.email, university: student.university, country: student.country }) });
      setApplied((prev) => new Set(prev).add(offer.id));
    } catch { /* handle error */ }
    setApplying(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div><h1 className="text-2xl font-bold">Browse Opportunities</h1><p className="text-sm text-muted-foreground">Welcome, {student.name} &bull; {student.university}</p></div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : offers.length === 0 ? (
        <Card><CardContent className="py-12 text-center space-y-4"><GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" /><h3 className="font-semibold">No offers available yet</h3><p className="text-sm text-muted-foreground">Check back soon — sponsors are creating opportunities!</p></CardContent></Card>
      ) : (
        <div className="space-y-4">{offers.map((offer) => {
          const analysis = analyses[offer.id];
          const isApplied = applied.has(offer.id);
          return (
            <Card key={offer.id} className="overflow-hidden">
              <CardHeader className="pb-2"><div className="flex items-center justify-between"><div className="flex items-center gap-2">{offer.type === "treat" ? <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center"><Coffee className="h-4 w-4 text-blue-600" /></div> : <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center"><GraduationCap className="h-4 w-4 text-violet-600" /></div>}<div><CardTitle className="text-base">{offer.title}</CardTitle><p className="text-xs text-muted-foreground">by {offer.sponsorName}</p></div></div><span className="text-lg font-bold text-green-600">{offer.amount} USDC</span></div></CardHeader>
              <CardContent className="space-y-3">
                {offer.description && <p className="text-sm text-muted-foreground">{offer.description}</p>}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{offer.type}</Badge>
                  {offer.treatDetails && <Badge variant="outline" className="text-xs">{offer.treatDetails}</Badge>}
                  {offer.targetDepartment && <Badge variant="outline" className="text-xs">{offer.targetDepartment}</Badge>}
                  <Badge variant="outline" className="text-xs"><Globe className="h-3 w-3 mr-1" />{offer.targetCountry || "Worldwide"}</Badge>
                </div>
                {analysis && (
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-violet-700"><Bot className="h-4 w-4" /> AI Match Analysis <Badge className="bg-violet-100 text-violet-700 text-xs">{analysis.score}/100</Badge></div>
                    <p className="text-xs text-violet-800">{analysis.summary}</p>
                    <div className="flex flex-wrap gap-1">{analysis.strengths.map((s, i) => <Badge key={i} variant="outline" className="text-xs bg-white">{s}</Badge>)}</div>
                    <p className="text-xs font-medium text-violet-900">{analysis.recommendation}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {!analysis && <Button variant="outline" size="sm" onClick={() => handleAnalyze(offer)} disabled={analyzing === offer.id}>{analyzing === offer.id ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Analyzing...</> : <><Bot className="h-3 w-3 mr-1" /> Check My Match</>}</Button>}
                  {isApplied ? <Button size="sm" disabled className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Applied</Button> : <Button size="sm" onClick={() => handleApply(offer)} disabled={applying === offer.id}>{applying === offer.id ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Applying...</> : <><Send className="h-3 w-3 mr-1" /> Apply</>}</Button>}
                </div>
              </CardContent>
            </Card>
          );
        })}</div>
      )}
    </div>
  );
}
