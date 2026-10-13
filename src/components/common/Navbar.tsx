import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Trophy, LogIn, Shield, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { AdminLoginModal } from './AdminLoginModal';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, currentAdmin, logoutAdmin } = useTournament();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('public_home')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-300/40">
              <Trophy className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-xl tracking-wider text-white flex items-center gap-1.5">
                <span>ML</span>
                <span className="text-amber-400">TOURNAMENT</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1 group-hover:text-amber-400/80 transition-colors">
                Play • Compete • Win
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentView('public_home')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentView === 'public_home'
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setCurrentView('public_tournaments')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentView === 'public_tournaments'
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Semua Turnamen
            </button>
          </nav>

          {/* Right Header Action: Login for Admin / Super Admin */}
          <div className="flex items-center gap-3">
            {currentAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentView(
                      currentAdmin.role === 'super_admin' ? 'superadmin' : 'tournament_admin'
                    )
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Dashboard {currentAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </button>
                <button
                  onClick={logoutAdmin}
                  title="Keluar"
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wide shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#091021] border-b border-slate-800 px-4 py-3 space-y-2 text-xs font-bold">
            <button
              onClick={() => {
                setCurrentView('public_home');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg ${
                currentView === 'public_home' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-300'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => {
                setCurrentView('public_tournaments');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg ${
                currentView === 'public_tournaments'
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-300'
              }`}
            >
              Semua Turnamen
            </button>
          </div>
        )}
      </header>

      {/* Admin Login Modal */}
      {loginModalOpen && <AdminLoginModal onClose={() => setLoginModalOpen(false)} />}
    </>
  );
};
