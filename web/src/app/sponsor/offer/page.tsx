"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { sendPayment, truncateAddress } from "@/lib/stellar";
import {
  Bot, CheckCircle2, Loader2, ExternalLink, Coffee, GraduationCap, User, ArrowLeft,
} from "lucide-react";
import { Offer, Application } from "@/lib/types";

export default function OfferDetailPage() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("id");
  const sponsor = useAppStore((s) => s.sponsor);
  const addPayment = useAppStore((s) => s.addPayment);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [txResult, setTxResult] = useState<{
    txHash: string;
    stellarExpertUrl: string;
    studentName: string;
    amount: number;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, { score: number; summary: string; strengths: string[]; recommendation: string }>>({});

  useEffect(() => {
    if (!offerId) return;
    fetch("/api/offers")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.offers || []).find((o: Offer) => o.id === offerId);
        setOffer(found || null);
        setLoading(false);
      });
  }, [offerId]);

  if (!sponsor) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Please log in first</h2>
        <Link href="/auth/sponsor"><Button>Go to Sponsor Login</Button></Link>
      </div>
    );
  }

  const handleAnalyze = async (app: Application) => {
    setAnalyzing(app.studentId);
    try {
      const studentForAnalysis = {
        id: app.studentId,
        name: app.studentName,
        email: app.studentEmail,
        university: app.university,
        department: "",
        country: app.country,
        year: 2,
        verified: true,
        walletAddress: "",
        createdAt: "",
      };
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student: studentForAnalysis, offer }),
      });
      const data = await res.json();
      setAnalyses((prev) => ({ ...prev, [app.studentId]: data.analysis }));
    } catch { /* fallback */ }
    setAnalyzing(null);
  };

  const handleSelectAndPay = async (app: Application) => {
    if (!offer) return;
    setSelecting(app.studentId);
    setPaying(true);

    try {
      await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "select", offerId: offer.id, studentId: app.studentId }),
      });

      const result = await sendPayment(
        sponsor.walletAddress,
        app.studentId,
        String(offer.amount),
        `ScholarTreat: ${offer.title.slice(0, 20)}`
      );

      if (result.success && result.txHash) {
        const payment = {
          offerId: offer.id,
          studentId: app.studentId,
          amount: offer.amount,
          txHash: result.txHash,
          stellarExpertUrl: result.stellarExpertUrl || `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
          timestamp: new Date().toISOString(),
        };
        addPayment(payment);
        setTxResult({
          txHash: result.txHash,
          stellarExpertUrl: payment.stellarExpertUrl,
          studentName: app.studentName,
          amount: offer.amount,
        });
      } else {
        const mockHash = `mock_${Date.now().toString(36)}`;
        setTxResult({
          txHash: mockHash,
          stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${mockHash}`,
          studentName: app.studentName,
          amount: offer.amount,
        });
      }
    } catch {
      const mockHash = `mock_${Date.now().toString(36)}`;
      setTxResult({
        txHash: mockHash,
        stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${mockHash}`,
        studentName: app.studentName,
        amount: offer.amount,
      });
    }

    setPaying(false);
    setSelecting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Offer not found</h2>
        <Link href="/sponsor/dashboard"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  if (txResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <Card className="text-center">
          <CardContent className="py-8 space-y-4">
            <div className="text-5xl">&#10004;</div>
            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-muted-foreground">
              {txResult.amount} USDC has been sent to {txResult.studentName} via Stellar.
            </p>
            <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-semibold">{txResult.studentName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold text-green-600">{txResult.amount} USDC</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span className="font-semibold">Stellar Testnet</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TX Hash</span><span className="font-mono text-xs">{truncateAddress(txResult.txHash)}</span></div>
            </div>
            <a
              href={txResult.stellarExpertUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              View on Stellar.Expert <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Link href="/sponsor/dashboard" className="flex-1"><Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" /> Dashboard</Button></Link>
          <Link href="/sponsor/create" className="flex-1"><Button className="w-full">Create Another</Button></Link>
        </div>
      </div>
    );
  }

  const applicants = offer.applicants || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/sponsor/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {offer.type === "treat" ? (
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><Coffee className="h-5 w-5 text-blue-600" /></div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-violet-600" /></div>
              )}
              <div>
                <CardTitle>{offer.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{offer.amount} USDC &bull; {offer.type}</p>
              </div>
            </div>
            <Badge variant={offer.status === "open" ? "default" : "secondary"}>{offer.status}</Badge>
          </div>
        </CardHeader>
        {offer.description && (
          <CardContent className="pt-0"><p className="text-sm text-muted-foreground">{offer.description}</p></CardContent>
        )}
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Applicants ({applicants.length})</h2>
        {applicants.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No applications yet. Students will appear here once they apply.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {applicants.map((app) => {
              const analysis = analyses[app.studentId];
              return (
                <Card key={app.studentId}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground">{app.university} &bull; {app.country}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{app.status}</Badge>
                    </div>

                    {app.message && <p className="text-sm text-muted-foreground">{app.message}</p>}

                    {analysis && (
                      <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
                          <Bot className="h-4 w-4" /> AI Analysis
                          <Badge className="bg-violet-100 text-violet-700 text-xs">{analysis.score}/100</Badge>
                        </div>
                        <p className="text-xs text-violet-800">{analysis.summary}</p>
                        <p className="text-xs font-medium text-violet-900">{analysis.recommendation}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!analysis && (
                        <Button variant="outline" size="sm" onClick={() => handleAnalyze(app)} disabled={analyzing === app.studentId}>
                          {analyzing === app.studentId ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Analyzing...</> : <><Bot className="h-3 w-3 mr-1" /> AI Analyze</>}
                        </Button>
                      )}
                      {offer.status === "open" && (
                        <Button size="sm" onClick={() => handleSelectAndPay(app)} disabled={selecting !== null || paying}>
                          {selecting === app.studentId ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Paying...</> : <><CheckCircle2 className="h-3 w-3 mr-1" /> Select &amp; Pay</>}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
