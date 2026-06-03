"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Home, GraduationCap, Coffee, Search, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <aside className="hidden md:flex w-56 flex-col border-r bg-background p-4 gap-2">
      <Link href="/" className="flex items-center gap-2 px-2 py-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg">Scholar<span className="text-violet-500">Treat</span></span>
      </Link>
      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-violet-100 text-violet-700 font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          );
        })}
      </nav>
      {(student || sponsor) && (
        <div className="border-t pt-3 space-y-2">
          <div className="px-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{student?.name || sponsor?.name}</p>
            <p>{student?.email || sponsor?.email}</p>
            <p className="capitalize">{role}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Log out
          </Button>
        </div>
      )}
    </aside>
  );
}
