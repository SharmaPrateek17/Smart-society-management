import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ResidentPortal } from './portals/ResidentPortal';
import { AdminPortal } from './portals/AdminPortal';
import { VendorPortal } from './portals/VendorPortal';
import { SuperAdminPortal } from './portals/SuperAdminPortal';
import {
  Sparkles,
  Users,
  Building2,
  Wrench,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Handshake,
  CheckCircle2,
  Layers,
  Megaphone
} from 'lucide-react';

function AppContent() {
  const { user, loading, demoAccounts, demoLogin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#272221] flex flex-col items-center justify-center font-sans">
        <div className="size-14 rounded-2xl bg-[#F08C1E] border-2 border-[#272221] shadow-[3px_3px_0_0_#272221] flex items-center justify-center animate-bounce">
          <span className="font-display text-2xl font-black text-[#272221]">N</span>
        </div>
        <p className="mt-4 text-sm font-bold text-[#1D7753] uppercase tracking-wider">
          Starting Society Command — Nivaas OS...
        </p>
      </div>
    );
  }

  // Not logged in landing screen (Styled with exact warm editorial Nivaas OS design system)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#272221] flex flex-col font-sans selection:bg-[#F08C1E]/20">
        {/* Landing Header */}
        <header className="border-b-2 border-[#272221] px-6 py-4 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-[#F08C1E] text-base font-bold text-[#272221] border-2 border-[#272221] shadow-[2px_2px_0_0_#272221]">
              N
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-display tracking-tight text-[#272221]">
                  Nivaas OS
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1D7753] text-[#FAF7F0] font-bold border border-[#272221]">
                  Society Command
                </span>
              </div>
              <span className="text-[11px] block font-semibold text-[#1D7753] uppercase tracking-wider">
                Residential Operations & Collective Procurement
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#272221] bg-[#F08C1E] px-5 py-2 text-xs font-bold text-[#272221] shadow-[3px_3px_0_0_#272221] hover:-translate-y-0.5 transition-transform"
            >
              Sign In / Register
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1D7753]/15 border-2 border-[#1D7753] text-[#1D7753] text-xs font-bold mb-6">
            <Sparkles className="size-3.5" />
            <span>Collective Procurement & Smart Demand Aggregation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight max-w-4xl leading-tight text-[#272221]">
            Pool Society Service Needs. <br />
            <span className="text-[#1D7753] underline decoration-[#F08C1E] decoration-4 underline-offset-8">
              Negotiate Unbeatable Bulk Rates.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#272221]/80 max-w-2xl leading-relaxed font-normal">
            A clear operations dashboard for residential society administrators, residents, and service contractors. Group flat requirements, invite verified vendor bids, and slash maintenance expenses.
          </p>

          {/* Quick Demo Evaluation Personas */}
          <div className="mt-10 w-full max-w-3xl rounded-xl border-2 border-[#272221] bg-[#FAF7F0] p-6 shadow-[6px_6px_0_0_#272221] text-left">
            <div className="flex items-center justify-between mb-4 border-b-2 border-[#272221]/15 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D7753]">
                  1-Click Instant Evaluation Personas
                </span>
                <p className="text-xs text-[#272221]/70 mt-0.5">
                  Click any role to test the live platform without typing passwords:
                </p>
              </div>
              <span className="rounded-full bg-[#F08C1E] px-2.5 py-0.5 text-[10px] font-bold border border-[#272221]">
                Interactive Demo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {demoAccounts.slice(0, 4).map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => demoLogin(acc.id)}
                  className="p-3.5 rounded-xl border-2 border-[#272221] bg-[#FAF7F0] hover:bg-[#1D7753]/10 shadow-[2px_2px_0_0_#272221] transition-all text-xs group hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#272221] group-hover:text-[#1D7753]">
                      {acc.role === 'ADMIN' ? 'Society Admin' : acc.role}
                    </span>
                    <ArrowRight className="size-3.5 text-[#272221] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="font-bold text-[#272221] truncate">{acc.name}</p>
                  <p className="text-[11px] text-[#272221]/60 mt-0.5 truncate">
                    {acc.flatNumber ? `Flat ${acc.flatNumber}` : acc.businessName || acc.societyName || 'Sunrise Heights'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </main>

        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  // Logged In Application View
  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans selection:bg-[#F08C1E]/20 text-[#272221]">
      <main className="flex-1">
        {user.role === 'ADMIN' && <AdminPortal />}
        {user.role === 'RESIDENT' && <ResidentPortal />}
        {user.role === 'VENDOR' && <VendorPortal />}
        {user.role === 'SUPER_ADMIN' && <SuperAdminPortal />}
      </main>

      {/* Persistent Bottom Persona Bar for effortless evaluation across all roles */}
      <footer className="border-t-2 border-[#272221] bg-[#272221] text-[#FAF7F0] py-2 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="size-2 rounded-full bg-[#F08C1E] animate-ping" />
            <span className="text-[#FAF7F0]/70 font-medium">Logged in as:</span>
            <span className="text-[#F08C1E] font-bold">{user.name} ({user.role})</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px]">
            <span className="text-[#FAF7F0]/60 mr-1">Switch Persona:</span>
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => demoLogin(acc.id)}
                className={`px-2.5 py-0.5 rounded-full border transition-all ${
                  user.id === acc.id
                    ? 'bg-[#F08C1E] text-[#272221] font-bold border-[#272221]'
                    : 'bg-white/10 hover:bg-white/20 text-[#FAF7F0] border-white/20'
                }`}
              >
                {acc.role === 'ADMIN' ? 'Society Admin (R. Anand)' : acc.role === 'SUPER_ADMIN' ? 'SuperAdmin' : acc.role === 'VENDOR' ? 'Vendor' : `Res (${acc.flatNumber || '1'})`}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
