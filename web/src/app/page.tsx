"use client";

import Link from "next/link";
import { GraduationCap, Coffee, Bot, ArrowRight, Shield, Zap, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 px-4 py-8">
      {/* Hero */}
      <div className="text-center space-y-6 pt-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center animate-float animate-pulse-glow">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Scholar<span className="gradient-text">Treat</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
          Sponsor a student anywhere in the world.<br />
          Buy them coffee, fund their education — <span className="text-violet-400 font-semibold">settled instantly on Stellar.</span>
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto">
          AI-powered matching. Blockchain transparency. No middlemen.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          {[
            { icon: Bot, label: "AI Agent", color: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300" },
            { icon: Zap, label: "Stellar", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300" },
            { icon: Shield, label: "x402", color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300" },
            { icon: Globe, label: "Global", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300" },
          ].map((b) => (
            <span key={b.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-gradient-to-r ${b.color}`}>
              <b.icon className="h-3 w-3" /> {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/auth/student">
          <div className="glass-card glow-border group rounded-2xl p-6 space-y-4 cursor-pointer transition-all hover:scale-[1.02]">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold">I&apos;m a Student</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Register with your .edu email. Browse treats and scholarships from sponsors worldwide. Let AI match you.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground/80">
              <p className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> University email verification</p>
              <p className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> Optional GitHub &amp; LinkedIn</p>
              <p className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> Receive USDC to your wallet</p>
            </div>
            <div className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm">
              Get Started <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link href="/auth/sponsor">
          <div className="glass-card glow-border group rounded-2xl p-6 space-y-4 cursor-pointer transition-all hover:scale-[1.02]">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Coffee className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold">I&apos;m a Sponsor</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Treat students to coffee, lunch, books — or fund scholarships. AI finds the most deserving match.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground/80">
              <p className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> Individual or company</p>
              <p className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> Set your criteria</p>
              <p className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span> On-chain transparency</p>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5">
              Start Sponsoring <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* How it works */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground/70 mt-2">Four steps. Zero friction.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Sponsor Creates", desc: "Coffee, scholarship, books — you pick", icon: Coffee, gradient: "from-blue-500 to-cyan-500" },
            { step: "02", title: "Students Apply", desc: "Verified students browse and apply", icon: GraduationCap, gradient: "from-violet-500 to-purple-500" },
            { step: "03", title: "AI Matches", desc: "Gemini analyzes and recommends", icon: Sparkles, gradient: "from-fuchsia-500 to-pink-500" },
            { step: "04", title: "Stellar Pays", desc: "USDC sent instantly, on-chain", icon: Zap, gradient: "from-emerald-500 to-green-500" },
          ].map((item) => (
            <div key={item.step} className="glass-card rounded-2xl p-5 text-center space-y-3 hover:scale-[1.03] transition-transform">
              <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-mono text-muted-foreground/70">{item.step}</span>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-xs text-muted-foreground/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">Built with Stellar Ecosystem</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { tool: "Stellar SDK", use: "Wallet & USDC transfers", color: "border-blue-500/20" },
            { tool: "x402 Protocol", use: "Agentic micropayments", color: "border-emerald-500/20" },
            { tool: "Gemini 2.5 Flash", use: "Student profile analysis", color: "border-violet-500/20" },
            { tool: "Circle USDC", use: "Stablecoin payments", color: "border-cyan-500/20" },
            { tool: "Friendbot", use: "Testnet funding", color: "border-amber-500/20" },
            { tool: "Stellar.Expert", use: "TX verification", color: "border-pink-500/20" },
          ].map((t) => (
            <div key={t.tool} className={`p-3 rounded-xl bg-muted border ${t.color}`}>
              <p className="font-semibold text-sm">{t.tool}</p>
              <p className="text-xs text-muted-foreground/70">{t.use}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/50 pb-8">
        ScholarTreat &mdash; Build On Stellar Hackathon IBW 2026 &bull; Agentic Track
      </p>
    </div>
  );
}
