"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { GraduationCap, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav() {
  const role = useAppStore((s) => s.role);

  return (
    <header className="md:hidden flex items-center justify-between border-b border-border p-3 bg-background">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-extrabold">
          Scholar<span className="gradient-text">Treat</span>
        </span>
      </Link>
      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center rounded-xl h-9 w-9 hover:bg-muted text-muted-foreground">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-64 bg-background border-border">
          <nav className="flex flex-col gap-1 mt-8">
            <Link href="/" className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground/80">Home</Link>
            {role === "student" && <Link href="/student/browse" className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground/80">Browse Offers</Link>}
            {role === "sponsor" && (
              <>
                <Link href="/sponsor/dashboard" className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground/80">Dashboard</Link>
                <Link href="/sponsor/create" className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground/80">Create Offer</Link>
              </>
            )}
            {role === "none" && (
              <>
                <Link href="/auth/student" className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground/80">Student Login</Link>
                <Link href="/auth/sponsor" className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-medium text-foreground/80">Sponsor Login</Link>
              </>
            )}
          </nav>
          <div className="mt-auto pb-4 px-1">
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
