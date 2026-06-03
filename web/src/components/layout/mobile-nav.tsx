"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { GraduationCap, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  const role = useAppStore((s) => s.role);

  return (
    <header className="md:hidden flex items-center justify-between border-b p-3 bg-background">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
          <GraduationCap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-bold">Scholar<span className="text-violet-500">Treat</span></span>
      </Link>
      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center rounded-lg h-9 w-9 hover:bg-muted">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <nav className="flex flex-col gap-2 mt-8">
            <Link href="/" className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Home</Link>
            {role === "student" && <Link href="/student/browse" className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Browse Offers</Link>}
            {role === "sponsor" && (
              <>
                <Link href="/sponsor/dashboard" className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Dashboard</Link>
                <Link href="/sponsor/create" className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Create Offer</Link>
              </>
            )}
            {role === "none" && (
              <>
                <Link href="/auth/student" className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Student Login</Link>
                <Link href="/auth/sponsor" className="px-3 py-2 rounded-lg hover:bg-muted text-sm">Sponsor Login</Link>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
