"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import {
  Coffee, AlertCircle, Loader2,
  LogIn, UserPlus, CheckCircle2, Building2
} from "lucide-react";

type Tab = "signin" | "register";

export default function SponsorAuthPage() {
  const router = useRouter();
  const setSponsor = useAppStore((s) => s.setSponsor);
  const [tab, setTab] = useState<Tab>("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign in
  const [signInEmail, setSignInEmail] = useState("");

  // Register
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login-sponsor", email: signInEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign in failed"); setLoading(false); return; }
      setSponsor(data.sponsor);
      router.push("/sponsor/dashboard");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register-sponsor", ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      setSponsor(data.sponsor);
      router.push("/sponsor/dashboard");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="mx-auto h-16 w-16 rounded-2xl animate-pulse-glow mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.6 0.22 200), oklch(0.55 0.25 240))" }}
          >
            <Coffee className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Sponsor Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Support students with treats &amp; scholarships via Stellar
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="glass-card rounded-2xl p-1.5 flex gap-1.5 mb-6">
          <button
            onClick={() => { setTab("signin"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === "signin"
                ? "text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={tab === "signin" ? {
              background: "linear-gradient(135deg, oklch(0.6 0.22 200), oklch(0.55 0.25 240))"
            } : {}}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === "register"
                ? "text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={tab === "register" ? {
              background: "linear-gradient(135deg, oklch(0.6 0.22 200), oklch(0.55 0.25 240))"
            } : {}}
          >
            <UserPlus className="h-4 w-4" />
            Register
          </button>
        </div>

        {/* Sign In Card */}
        {tab === "signin" && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold mb-1">Welcome back! 👋</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email to access your sponsor dashboard
              </p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Must be the same email you registered with
                </p>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 text-white border-0"
                style={{ background: "linear-gradient(135deg, oklch(0.6 0.22 200), oklch(0.55 0.25 240))" }}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</>
                  : <><LogIn className="h-4 w-4 mr-2" /> Sign In</>}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button onClick={() => setTab("register")} className="text-primary font-semibold hover:underline">
                Register here
              </button>
            </p>
          </div>
        )}

        {/* Register Card */}
        {tab === "register" && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold mb-1">Start sponsoring ✨</h2>
              <p className="text-sm text-muted-foreground">
                Individual or company — support students in minutes
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Full Name *</Label>
                <Input
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="h-4 w-4" /> Company / Organization
                  <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  placeholder="Acme Corp"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  className="h-11"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 text-white border-0"
                style={{ background: "linear-gradient(135deg, oklch(0.6 0.22 200), oklch(0.55 0.25 240))" }}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Setting up your wallet...</>
                  : <><CheckCircle2 className="h-4 w-4 mr-2" /> Register &amp; Get Stellar Wallet</>}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => setTab("signin")} className="text-primary font-semibold hover:underline">
                Sign in here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
