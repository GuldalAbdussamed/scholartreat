"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { truncateAddress } from "@/lib/stellar";
import { AgentRankingResult, RankedApplicant } from "@/lib/gemini";
import {
  Bot, CheckCircle2, Loader2, ExternalLink, Coffee, GraduationCap,
  User, ArrowLeft, Sparkles, Send, Trophy, AlertTriangle, Zap,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Offer, Application } from "@/lib/types";

function OfferDetailContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("id");
  const sponsor = useAppStore((s) => s.sponsor);
  const addPayment = useAppStore((s) => s.addPayment);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [txResult, setTxResult] = useState<{
    txHash: string; stellarExpertUrl: string; studentName: string; amount: number;
    asset?: string; note?: string;
  } | null>(null);

  // Per-applicant AI analysis (old single-analyze feature)
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, { score: number; summary: string; strengths: string[]; recommendation: string }>>({});

  // Agent ranking state
  const [agentCommand, setAgentCommand] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentRankingResult | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 max-w-sm">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto">
            <Bot className="h-7 w-7 text-violet-400" />
          </div>
          <h2 className="text-xl font-bold">Please log in first</h2>
          <Link href="/auth/sponsor">
            <Button className="btn-glow text-white border-0 w-full">Go to Sponsor Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAnalyze = async (app: Application) => {
    setAnalyzing(app.studentId);
    try {
      const studentForAnalysis = {
        id: app.studentId, name: app.studentName, email: app.studentEmail,
        university: app.university, department: "", country: app.country,
        year: 2, verified: true, walletAddress: "", createdAt: "",
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

  const handleAgentRank = async () => {
    if (!agentCommand.trim() || !offer) return;
    setAgentLoading(true);
    setAgentResult(null);
    try {
      const res = await fetch("/api/agent-select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: agentCommand, applicants: offer.applicants || [], offer }),
      });
      const data = await res.json();
      if (data.result) setAgentResult(data.result);
    } catch { /* fallback */ }
    setAgentLoading(false);
  };

  const handleSelectAndPay = async (app: Application) => {
    if (!offer) return;
    setSelecting(app.studentId);
    setPaying(true);

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorId: sponsor.id,
          studentId: app.studentId,
          offerId: offer.id,
          amount: offer.amount,
          memo: `ScholarTreat: ${offer.title.slice(0, 20)}`,
        }),
      });

      const data = await res.json();

      if (data.success && data.txHash) {
        const payment = {
          offerId: offer.id,
          studentId: app.studentId,
          amount: offer.amount,
          txHash: data.txHash,
          stellarExpertUrl: data.stellarExpertUrl || `https://stellar.expert/explorer/testnet/tx/${data.txHash}`,
          timestamp: new Date().toISOString(),
        };
        addPayment(payment);
        setTxResult({
          txHash: data.txHash,
          stellarExpertUrl: payment.stellarExpertUrl,
          studentName: app.studentName,
          amount: offer.amount,
          asset: data.asset || "USDC",
          note: data.note,
        });
      } else {
        console.error("[pay] API error:", data.error);
        const mockHash = `mock_${Date.now().toString(36)}`;
        setTxResult({
          txHash: mockHash,
          stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${mockHash}`,
          studentName: app.studentName,
          amount: offer.amount,
          asset: "demo",
          note: `Demo mode: ${data.error || "Payment API error"}`,
        });
      }
    } catch (e) {
      console.error("[pay] Network error:", e);
      const mockHash = `mock_${Date.now().toString(36)}`;
      setTxResult({
        txHash: mockHash,
        stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${mockHash}`,
        studentName: app.studentName,
        amount: offer.amount,
        asset: "demo",
        note: "Demo mode: Network error",
      });
    }

    setPaying(false);
    setSelecting(null);
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-bold">Offer not found</h2>
          <Link href="/sponsor/dashboard">
            <Button className="btn-glow text-white border-0 w-full">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (txResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="glass-card rounded-2xl p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, oklch(0.6 0.22 150), oklch(0.55 0.25 180))" }}>
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Payment Sent! 🎉</h2>
            <p className="text-muted-foreground text-sm">
              <strong>{txResult.amount} USDC</strong> has been sent to <strong>{txResult.studentName}</strong> via Stellar testnet.
            </p>
            <div className="text-left space-y-2 rounded-xl p-4 text-sm border border-border/40"
              style={{ background: "oklch(0.15 0.02 280 / 50%)" }}>
              <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-semibold">{txResult.studentName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold text-green-400">{txResult.amount} {txResult.asset || "USDC"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span className="font-semibold">Stellar Testnet</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TX Hash</span><span className="font-mono text-xs">{truncateAddress(txResult.txHash)}</span></div>
            </div>
            {txResult.note && (
              <p className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
                ⚠ {txResult.note}
              </p>
            )}
            <a href={txResult.stellarExpertUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 hover:underline transition-colors">
              View on Stellar.Expert <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex gap-3">
            <Link href="/sponsor/dashboard" className="flex-1">
              <Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" /> Dashboard</Button>
            </Link>
            <Link href="/sponsor/create" className="flex-1">
              <Button className="w-full btn-glow text-white border-0">Create Another</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const applicants = offer.applicants || [];

  const rankedMap: Record<string, RankedApplicant> = {};
  if (agentResult) {
    agentResult.rankedApplicants.forEach((r) => { rankedMap[r.studentId] = r; });
  }

  const displayApplicants = agentResult
    ? [...applicants].sort((a, b) => {
        const ra = rankedMap[a.studentId]?.rank ?? 999;
        const rb = rankedMap[b.studentId]?.rank ?? 999;
        return ra - rb;
      })
    : applicants;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/sponsor/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{
                background: offer.type === "treat"
                  ? "linear-gradient(135deg, oklch(0.6 0.22 200), oklch(0.55 0.25 240))"
                  : "linear-gradient(135deg, oklch(0.6 0.22 280), oklch(0.55 0.25 310))"
              }}>
              {offer.type === "treat"
                ? <Coffee className="h-6 w-6 text-white" />
                : <GraduationCap className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h1 className="text-xl font-bold">{offer.title}</h1>
              <p className="text-sm text-muted-foreground">{offer.amount} USDC • {offer.type}</p>
            </div>
          </div>
          <Badge variant={offer.status === "open" ? "default" : "secondary"}
            className="capitalize">{offer.status}</Badge>
        </div>
        {offer.description && (
          <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/40">
            {offer.description}
          </p>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border/40">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.25 310), oklch(0.6 0.22 280))" }}>
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base gradient-text">AI Selection Agent</h2>
              <p className="text-xs text-muted-foreground">Tell the agent who to pick — in plain language</p>
            </div>
            <div className="ml-auto">
              <span className="neon-badge px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Zap className="h-3 w-3" /> Gemini Powered
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              "Pick the most motivated applicant",
              "Find someone from Turkey",
              "Select the earliest applicant",
              "Choose the one with the best message",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setAgentCommand(example)}
                className="text-xs px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:border-violet-500/40 hover:text-foreground transition-all"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  applicants.length === 0
                    ? "No applicants yet..."
                    : 'e.g. "Pick the student with highest GPA" or "Find someone from Europe"'
                }
                value={agentCommand}
                onChange={(e) => setAgentCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAgentRank()}
                disabled={applicants.length === 0 || agentLoading}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-transparent text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 disabled:opacity-50 transition-all"
              />
            </div>
            <Button
              onClick={handleAgentRank}
              disabled={!agentCommand.trim() || applicants.length === 0 || agentLoading}
              className="btn-glow text-white border-0 px-4"
            >
              {agentLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {applicants.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Waiting for students to apply before the agent can run.
            </p>
          )}
        </div>

        {agentResult && (
          <div className="border-t border-border/40 p-5 space-y-3"
            style={{ background: "oklch(0.15 0.04 310 / 30%)" }}>
            <div className="flex items-start gap-2">
              <Bot className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-violet-300">
                  Interpreted: &ldquo;{agentResult.commandInterpreted}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">{agentResult.agentSummary}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">
            Applicants
            <span className="text-muted-foreground font-normal text-sm ml-2">({applicants.length})</span>
          </h2>
          {agentResult && (
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
              <Trophy className="h-3 w-3 mr-1" /> Agent ranked
            </Badge>
          )}
        </div>

        {applicants.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No applications yet. Students will appear here once they apply.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayApplicants.map((app) => {
              const ranked = rankedMap[app.studentId];
              const analysis = analyses[app.studentId];
              const isTopPick = agentResult?.topPickId === app.studentId;
              const isExpanded = expandedCards.has(app.studentId);

              return (
                <div
                  key={app.studentId}
                  className={`glass-card rounded-2xl overflow-hidden transition-all duration-200 ${
                    isTopPick ? "ring-2 ring-violet-500/50" : ""
                  }`}
                >
                  {isTopPick && (
                    <div className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-yellow-300"
                      style={{ background: "linear-gradient(135deg, oklch(0.4 0.15 70 / 40%), oklch(0.35 0.12 50 / 30%))" }}>
                      <Trophy className="h-3.5 w-3.5" />
                      AI TOP PICK — Agent recommends this student
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {ranked && (
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{
                              background: ranked.rank === 1
                                ? "linear-gradient(135deg, oklch(0.7 0.2 70), oklch(0.65 0.25 50))"
                                : ranked.rank === 2
                                ? "linear-gradient(135deg, oklch(0.6 0.05 280), oklch(0.55 0.08 280))"
                                : "linear-gradient(135deg, oklch(0.55 0.1 30), oklch(0.5 0.12 20))"
                            }}>
                            #{ranked.rank}
                          </div>
                        )}
                        {!ranked && (
                          <div className="h-9 w-9 rounded-full bg-muted/40 flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground">{app.university} • {app.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {ranked && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: ranked.score >= 70 ? "oklch(0.3 0.1 150 / 40%)" : ranked.score >= 40 ? "oklch(0.3 0.1 70 / 40%)" : "oklch(0.3 0.1 25 / 40%)",
                              color: ranked.score >= 70 ? "oklch(0.7 0.2 150)" : ranked.score >= 40 ? "oklch(0.7 0.2 70)" : "oklch(0.7 0.2 25)",
                              border: `1px solid ${ranked.score >= 70 ? "oklch(0.5 0.15 150 / 30%)" : ranked.score >= 40 ? "oklch(0.5 0.15 70 / 30%)" : "oklch(0.5 0.15 25 / 30%)"}`,
                            }}>
                            {ranked.score}/100
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">{app.status}</Badge>
                      </div>
                    </div>

                    {ranked && (
                      <div>
                        <button
                          onClick={() => toggleCard(app.studentId)}
                          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          <Bot className="h-3 w-3" />
                          Agent reasoning
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 rounded-xl p-3 space-y-2 text-xs border border-violet-500/20"
                            style={{ background: "oklch(0.15 0.04 280 / 40%)" }}>
                            <p className="text-violet-200">{ranked.reasoning}</p>
                            {ranked.strengths.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {ranked.strengths.map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/20">
                                    ✓ {s}
                                  </span>
                                ))}
                              </div>
                            )}
                            {ranked.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {ranked.concerns.map((c) => (
                                  <span key={c} className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 flex items-center gap-1">
                                    <AlertTriangle className="h-2.5 w-2.5" />{c}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {app.message && !ranked && (
                      <p className="text-sm text-muted-foreground">{app.message}</p>
                    )}

                    {analysis && !ranked && (
                      <div className="rounded-xl p-3 space-y-1 text-xs border border-violet-500/20"
                        style={{ background: "oklch(0.15 0.04 280 / 40%)" }}>
                        <div className="flex items-center gap-2 font-semibold text-violet-300">
                          <Bot className="h-3.5 w-3.5" /> AI Analysis
                          <Badge className="bg-violet-500/20 text-violet-300 text-xs">{analysis.score}/100</Badge>
                        </div>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                        <p className="font-medium text-violet-200">{analysis.recommendation}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      {!analysis && !ranked && (
                        <Button variant="outline" size="sm"
                          onClick={() => handleAnalyze(app)}
                          disabled={analyzing === app.studentId}
                          className="text-xs">
                          {analyzing === app.studentId
                            ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Analyzing...</>
                            : <><Bot className="h-3 w-3 mr-1" /> AI Analyze</>}
                        </Button>
                      )}
                      {offer.status === "open" && (
                        <Button
                          size="sm"
                          onClick={() => handleSelectAndPay(app)}
                          disabled={selecting !== null || paying}
                          className={`text-xs text-white border-0 ${isTopPick ? "btn-glow" : ""}`}
                          style={isTopPick ? {} : {
                            background: "linear-gradient(135deg, oklch(0.5 0.15 280), oklch(0.45 0.18 310))"
                          }}
                        >
                          {selecting === app.studentId
                            ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Paying...</>
                            : <><CheckCircle2 className="h-3 w-3 mr-1" /> Select &amp; Pay</>}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OfferDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <OfferDetailContent />
    </Suspense>
  );
}
