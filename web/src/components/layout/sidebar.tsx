"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Home, GraduationCap, Coffee, Search, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const STUDENT_NAV = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse Offers", href: "/student/browse", icon: Search },
];
const SPONSOR_NAV = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/sponsor/dashboard", icon: LayoutDashboard },
  { label: "Create Offer", href: "/sponsor/create", icon: PlusCircle },
];
const GUEST_NAV = [
  { label: "Home", href: "/", icon: Home },
  { label: "I'm a Student", href: "/auth/student", icon: GraduationCap },
  { label: "I'm a Sponsor", href: "/auth/sponsor", icon: Coffee },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAppStore((s) => s.role);
  const student = useAppStore((s) => s.student);
  const sponsor = useAppStore((s) => s.sponsor);
  const logout = useAppStore((s) => s.logout);

  const nav = role === "student" ? STUDENT_NAV : role === "sponsor" ? SPONSOR_NAV : GUEST_NAV;

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-border bg-sidebar p-4 gap-2 sticky top-0 h-screen overflow-y-auto">
      <Link href="/" className="flex items-center gap-2 px-2 py-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <GraduationCap className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="font-extrabold text-lg">
          Scholar<span className="gradient-text">Treat</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-violet-300 border border-violet-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <ThemeToggle />
      </div>

      {(student || sponsor) && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="px-3 text-xs">
            <p className="font-semibold text-foreground">{student?.name || sponsor?.name}</p>
            <p className="text-muted-foreground/70">{student?.email || sponsor?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400 border border-violet-500/20">
              {role}
            </span>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground/80 hover:bg-muted hover:text-red-400 transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      )}
    </aside>
  );
}
