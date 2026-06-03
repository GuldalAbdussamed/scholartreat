"use client";

import Link from "next/link";
import { GraduationCap, Coffee, Bot, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 px-4 py-8">
      <div className="text-center space-y-6 pt-8">
        <div className="flex justify-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Scholar<span className="text-violet-500">Treat</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Sponsor a student anywhere in the world. Buy them coffee, fund their education — settled instantly on Stellar.
        </p>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          AI-powered matching finds the right student. Blockchain ensures every cent is tracked. No middlemen, no delays.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100"><Bot className="h-3 w-3 mr-1" /> AI Agent</Badge>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Zap className="h-3 w-3 mr-1" /> Stellar</Badge>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><Shield className="h-3 w-3 mr-1" /> x402 Payments</Badge>
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Globe className="h-3 w-3 mr-1" /> Global</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/auth/student">
          <Card className="group cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all h-full">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-violet-600" />
              </div>
              <h2 className="text-xl font-semibold">I&apos;m a Student</h2>
              <p className="text-muted-foreground text-sm">Register with your university email (.edu), browse scholarships and treats from sponsors worldwide. Get matched by AI.</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>&#10003; University email required for verification</p>
                <p>&#10003; Optional GitHub &amp; LinkedIn for better AI matching</p>
                <p>&#10003; Receive USDC directly to your Stellar wallet</p>
              </div>
              <Button variant="outline" className="w-full group-hover:bg-violet-50">Register as Student <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/auth/sponsor">
          <Card className="group cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all h-full">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Coffee className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">I&apos;m a Sponsor</h2>
              <p className="text-muted-foreground text-sm">Create scholarships or treat students to coffee, lunch, books — anything. AI finds the most deserving student for you.</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>&#10003; Individual or company sponsorship</p>
                <p>&#10003; Set criteria: department, region, amount</p>
                <p>&#10003; On-chain transparency for every payment</p>
              </div>
              <Button variant="outline" className="w-full group-hover:bg-blue-50">Register as Sponsor <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Sponsor Creates", desc: "Define what you want to offer — coffee, scholarship, or books", icon: Coffee },
            { step: "2", title: "Students Apply", desc: "Verified students browse and apply with their profile", icon: GraduationCap },
            { step: "3", title: "AI Matches", desc: "Gemini AI analyzes profiles and recommends the best match", icon: Bot },
            { step: "4", title: "Stellar Pays", desc: "USDC is transferred instantly via Stellar — verifiable on-chain", icon: Zap },
          ].map((item) => (
            <Card key={item.step} className="text-center">
              <CardContent className="p-4 space-y-2">
                <div className="mx-auto h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">{item.step}</div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Built with Stellar Ecosystem</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { tool: "Stellar SDK", use: "Wallet & USDC transfers" },
              { tool: "x402 Protocol", use: "Agentic micropayments for AI scoring" },
              { tool: "Gemini 2.5 Flash", use: "Student profile analysis" },
              { tool: "Circle USDC", use: "Stablecoin payments" },
              { tool: "Friendbot", use: "Testnet funding" },
              { tool: "Stellar.Expert", use: "Transaction verification" },
            ].map((t) => (
              <div key={t.tool} className="p-2 rounded-lg bg-muted/50">
                <p className="font-medium">{t.tool}</p>
                <p className="text-xs text-muted-foreground">{t.use}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground pb-8">ScholarTreat &mdash; Build On Stellar Hackathon IBW 2026 &bull; Agentic Track</p>
    </div>
  );
}
