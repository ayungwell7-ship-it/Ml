import React, { useState } from 'react';
import { Trophy, Mail, Phone, MessageSquare, ShieldCheck, Lock } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { AdminLoginModal } from './AdminLoginModal';

export const Footer: React.FC = () => {
  const { setCurrentView, settings, currentAdmin } = useTournament();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleAdminPanelClick = (targetRole: 'super_admin' | 'tournament_admin') => {
    if (currentAdmin) {
      if (currentAdmin.role === 'super_admin') {
        setCurrentView('superadmin');
      } else {
        setCurrentView('tournament_admin');
      }
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      {loginModalOpen && <AdminLoginModal onClose={() => setLoginModalOpen(false)} />}

      <footer className="bg-[#050811] border-t border-slate-800/80 text-slate-400 text-xs mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand & Tagline */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center border border-amber-300/40">
                  <Trophy className="w-5 h-5 text-slate-950 fill-slate-950" />
                </div>
                <div className="font-heading font-extrabold text-lg text-white">
                  ML <span className="text-amber-400">TOURNAMENT</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {settings.heroDescription ||
                  'Platform turnamen esports Mobile Legends profesional dengan integrasi bracket otomatis, live score, dan manajemen tim terstruktur.'}
              </p>
              <div className="flex items-center gap-3 pt-1">
                {settings.discordUrl && (
                  <a
                    href={settings.discordUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                    title="Discord Server"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
                {settings.contactWhatsApp && (
                  <a
                    href={`https://wa.me/${settings.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                    title="WhatsApp Panitia"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {settings.contactEmail && (
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                    title="Email Dukungan"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Col 2: Navigasi Cepat */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Navigasi Turnamen
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentView('public_home')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Beranda
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('public_tournaments')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Semua Turnamen
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('public_tournaments')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    Pendaftaran Dibuka
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Informasi Penyelenggara */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Penyelenggara & Format
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>Single Elimination (Bo3 & Bo5)</li>
                <li>Double Elimination Bracket</li>
                <li>Round Robin & Group Stage</li>
                <li>Custom Draft Pick 5v5 Mode</li>
                <li>Pendaftaran Langsung & Cepat</li>
              </ul>
            </div>

            {/* Col 4: Akses Khusus Admin */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Panel Pengelola
              </h4>
              <p className="text-slate-400">
                Akses khusus administrator dan panitia turnamen resmi:
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => handleAdminPanelClick('super_admin')}
                  className="w-full text-left py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-amber-300 font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Dashboard Super Admin</span>
                  </span>
                  {!currentAdmin && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                </button>
                <button
                  onClick={() => handleAdminPanelClick('tournament_admin')}
                  className="w-full text-left py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-amber-300 font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Dashboard Admin Turnamen</span>
                  </span>
                  {!currentAdmin && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © {new Date().getFullYear()} ML TOURNAMENT. Seluruh hak cipta dilindungi. Mobile Legends: Bang Bang adalah merek dagang Moonton.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Server: ID-Jakarta</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Sistem Berjalan Normal</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
