"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { Plus, Coffee, GraduationCap, Users, Loader2 } from "lucide-react";
import { Offer } from "@/lib/types";

export default function SponsorDashboardPage() {
  const sponsor = useAppStore((s) => s.sponsor);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sponsor) return;
    fetch("/api/offers").then((r) => r.json()).then((data) => {
      setOffers((data.offers || []).filter((o: Offer) => o.sponsorId === sponsor.id));
      setLoading(false);
    });
  }, [sponsor]);

  if (!sponsor) return (<div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4"><h2 className="text-xl font-bold">Please log in first</h2><Link href="/auth/sponsor"><Button>Go to Sponsor Login</Button></Link></div>);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Sponsor Dashboard</h1><p className="text-sm text-muted-foreground">Welcome, {sponsor.company || sponsor.name}</p></div>
        <Link href="/sponsor/create"><Button><Plus className="h-4 w-4 mr-2" /> New Offer</Button></Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : offers.length === 0 ? (
        <Card><CardContent className="py-12 text-center space-y-4"><Coffee className="h-12 w-12 mx-auto text-muted-foreground" /><h3 className="font-semibold">No offers yet</h3><p className="text-sm text-muted-foreground">Create your first scholarship or treat to start supporting students</p><Link href="/sponsor/create"><Button><Plus className="h-4 w-4 mr-2" /> Create Offer</Button></Link></CardContent></Card>
      ) : (
        <div className="space-y-3">{offers.map((offer) => (
          <Link key={offer.id} href={`/sponsor/offer?id=${offer.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><div className="flex items-center justify-between"><div className="flex items-center gap-2">{offer.type === "treat" ? <Coffee className="h-4 w-4 text-blue-500" /> : <GraduationCap className="h-4 w-4 text-violet-500" />}<CardTitle className="text-base">{offer.title}</CardTitle></div><Badge variant={offer.status === "open" ? "default" : "secondary"}>{offer.status}</Badge></div></CardHeader>
              <CardContent><div className="flex items-center justify-between text-sm"><div className="flex items-center gap-4 text-muted-foreground"><span className="font-semibold text-foreground">{offer.amount} USDC</span>{offer.treatDetails && <span>{offer.treatDetails}</span>}<span className="flex items-center gap-1"><Users className="h-3 w-3" />{offer.applicants?.length || 0} applicants</span></div></div></CardContent>
            </Card>
          </Link>
        ))}</div>
      )}
    </div>
  );
}
