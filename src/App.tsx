import React, { useEffect, useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/public/HomePage';
import { TournamentListPage } from './components/public/TournamentListPage';
import { TournamentDetailPage } from './components/public/TournamentDetailPage';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { TournamentAdminDashboard } from './components/admin/TournamentAdminDashboard';
import { AdminLoginModal } from './components/common/AdminLoginModal';

function AppContent() {
  const {
    currentView,
    setCurrentView,
    openTournamentDetail,
    selectedTournamentSlug,
    settings,
    currentAdmin,
  } = useTournament();

  const [requireLoginModal, setRequireLoginModal] = useState(false);

  // Listen to browser URL hash changes for deep linking support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/turnamen/')) {
        const slug = hash.replace('#/turnamen/', '');
        if (slug) {
          openTournamentDetail(slug);
        }
      } else if (hash.startsWith('#/tournament/')) {
        const slug = hash.replace('#/tournament/', '');
        if (slug) {
          openTournamentDetail(slug);
        }
      } else if (hash === '#/superadmin') {
        if (currentAdmin?.role === 'super_admin') {
          setCurrentView('superadmin');
        } else {
          setRequireLoginModal(true);
        }
      } else if (hash === '#/tournament-admin' || hash === '#/admin') {
        if (currentAdmin) {
          setCurrentView(currentAdmin.role === 'super_admin' ? 'superadmin' : 'tournament_admin');
        } else {
          setRequireLoginModal(true);
        }
      } else if (hash === '#/tournaments' || hash === '#/turnamen') {
        setCurrentView('public_tournaments');
      } else if (hash === '#/' || hash === '' || hash === '#') {
        setCurrentView('public_home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentAdmin]);

  // Update hash when switching views for direct copy-paste URL sharing
  useEffect(() => {
    if (currentView === 'superadmin') {
      window.location.hash = '#/superadmin';
    } else if (currentView === 'tournament_admin') {
      window.location.hash = '#/tournament-admin';
    } else if (currentView === 'public_tournaments') {
      window.location.hash = '#/turnamen';
    } else if (currentView === 'public_detail') {
      if (selectedTournamentSlug) {
        window.location.hash = `#/turnamen/${selectedTournamentSlug}`;
      }
    } else if (currentView === 'public_home') {
      window.location.hash = '#/';
    }
  }, [currentView, selectedTournamentSlug]);

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col font-sans text-slate-100">
      {/* Require Login Modal when accessing protected hash directly */}
      {requireLoginModal && !currentAdmin && (
        <AdminLoginModal onClose={() => setRequireLoginModal(false)} />
      )}

      {/* Conditional Rendering based on current active view */}
      {currentView === 'superadmin' ? (
        <SuperAdminDashboard />
      ) : currentView === 'tournament_admin' ? (
        <TournamentAdminDashboard />
      ) : (
        /* Public Portal with Navbar & Footer (Direct access for visitors, no login required) */
        <div className="flex-1 flex flex-col">
          {/* Emergency Notice Banner if enabled */}
          {settings.globalNotice && (
            <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>{settings.globalNotice}</span>
            </div>
          )}

          <Navbar />

          <main className="flex-1">
            {currentView === 'public_home' && <HomePage />}
            {currentView === 'public_tournaments' && <TournamentListPage />}
            {currentView === 'public_detail' && <TournamentDetailPage />}
          </main>

          <Footer />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}
