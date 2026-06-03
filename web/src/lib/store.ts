import { create } from "zustand";
import { Student, Sponsor, Offer, UserRole, PaymentResult } from "./types";

interface WalletState {
  publicKey: string;
  secretKey: string;
  network: string;
  balances: { xlm: string; usdc: string };
  source: "freighter" | "generated" | "none";
}

interface AppState {
  role: UserRole;
  student: Student | null;
  sponsor: Sponsor | null;
  wallet: WalletState;
  offers: Offer[];
  payments: PaymentResult[];

  setRole: (role: UserRole) => void;
  setStudent: (student: Student) => void;
  setSponsor: (sponsor: Sponsor) => void;
  setWallet: (wallet: WalletState) => void;
  setOffers: (offers: Offer[]) => void;
  addPayment: (payment: PaymentResult) => void;
  logout: () => void;
}

const emptyWallet: WalletState = {
  publicKey: "",
  secretKey: "",
  network: "",
  balances: { xlm: "0", usdc: "0" },
  source: "none",
};

export const useAppStore = create<AppState>((set) => ({
  role: "none",
  student: null,
  sponsor: null,
  wallet: emptyWallet,
  offers: [],
  payments: [],

  setRole: (role) => set({ role }),
  setStudent: (student) => set({ student, role: "student" }),
  setSponsor: (sponsor) => set({ sponsor, role: "sponsor" }),
  setWallet: (wallet) => set({ wallet }),
  setOffers: (offers) => set({ offers }),
  addPayment: (payment) =>
    set((s) => ({ payments: [...s.payments, payment] })),
  logout: () =>
    set({
      role: "none",
      student: null,
      sponsor: null,
      wallet: emptyWallet,
      offers: [],
      payments: [],
    }),
}));
