"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import {
  GraduationCap, Code2, Briefcase, AlertCircle, Loader2,
  LogIn, UserPlus, Sparkles, CheckCircle2
} from "lucide-react";

type Tab = "signin" | "register";

export default function StudentAuthPage() {
  const router = useRouter();
  const setStudent = useAppStore((s) => s.setStudent);
  const [tab, setTab] = useState<Tab>("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign in form
  const [signInEmail, setSignInEmail] = useState("");

  // Register form
  const [form, setForm] = useState({
    name: "", email: "", university: "", department: "",
    country: "", year: "", gpa: "", githubUrl: "", linkedinUrl: ""
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login-student", email: signInEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign in failed"); setLoading(false); return; }
      setStudent(data.student);
      router.push("/student/browse");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register-student", ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      setStudent(data.student);
      router.push("/student/browse");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl animate-pulse-glow mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(0.6 0.22 280), oklch(0.55 0.25 310))" }}>
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Student Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Access exclusive treats & scholarships from sponsors
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
              background: "linear-gradient(135deg, oklch(0.6 0.22 280), oklch(0.55 0.25 310))"
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
              background: "linear-gradient(135deg, oklch(0.6 0.22 280), oklch(0.55 0.25 310))"
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
                Enter your university email to continue
              </p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">University Email</Label>
                <Input
                  type="email"
                  placeholder="you@university.edu"
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
              <Button type="submit" className="w-full h-11 btn-glow text-white border-0" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</> : <><LogIn className="h-4 w-4 mr-2" /> Sign In</>}
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
              <h2 className="text-lg font-bold mb-1">Create your account ✨</h2>
              <p className="text-sm text-muted-foreground">
                A valid university email is required to verify your student status
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Full Name *</Label>
                <Input placeholder="John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">University Email *</Label>
                <Input type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => update("email", e.target.value)} required className="h-11" />
                <p className="text-xs text-muted-foreground">Must end with .edu, .edu.tr, .ac.uk, etc.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">University *</Label>
                  <Input placeholder="MIT" value={form.university} onChange={(e) => update("university", e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Department *</Label>
                  <Input placeholder="CS" value={form.department} onChange={(e) => update("department", e.target.value)} required className="h-11" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Country *</Label>
                  <Input placeholder="Turkey" value={form.country} onChange={(e) => update("country", e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Year *</Label>
                  <Input type="number" min="1" max="6" placeholder="3" value={form.year} onChange={(e) => update("year", e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">GPA</Label>
                  <Input type="number" step="0.1" min="0" max="4" placeholder="3.5" value={form.gpa} onChange={(e) => update("gpa", e.target.value)} className="h-11" />
                </div>
              </div>

              {/* Optional section */}
              <div className="border border-border/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="neon-badge text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />Optional
                  </Badge>
                  <span className="text-xs text-muted-foreground">Boost your AI match score</span>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Code2 className="h-4 w-4" /> GitHub Profile
                  </Label>
                  <Input placeholder="https://github.com/username" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Briefcase className="h-4 w-4" /> LinkedIn Profile
                  </Label>
                  <Input placeholder="https://linkedin.com/in/username" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} className="h-11" />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              )}
              <Button type="submit" className="w-full h-11 btn-glow text-white border-0" disabled={loading}>
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
