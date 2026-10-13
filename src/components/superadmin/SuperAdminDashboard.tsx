import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Users,
  Layers,
  Settings,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Plus,
  Shield,
  Eye,
  CreditCard,
  AlertTriangle,
  Menu,
  X,
  UserPlus,
} from 'lucide-react';
import { AdminUser, Tournament, Registration } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const {
    admins,
    tournaments,
    registrations,
    settings,
    createAdminAccount,
    toggleAdminStatus,
    deleteAdminAccount,
    deleteTournament,
    updateSettings,
    openTournamentDetail,
    logoutAdmin,
    currentAdmin,
  } = useTournament();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'admins' | 'tournaments' | 'registrations' | 'payments' | 'settings'
  >('dashboard');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchAdmin, setSearchAdmin] = useState('');

  // Create Admin Form
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [createMsg, setCreateMsg] = useState('');

  // Settings form
  const [siteName, setSiteName] = useState(settings.siteName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [heroDescription, setHeroDescription] = useState(settings.heroDescription);
  const [contactWhatsApp, setContactWhatsApp] = useState(settings.contactWhatsApp);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [globalNotice, setGlobalNotice] = useState(settings.globalNotice || '');
  const [settingsMsg, setSettingsMsg] = useState('');

  // View Roster modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  // Delete Tournament modal
  const [tourToDelete, setTourToDelete] = useState<Tournament | null>(null);

  // Aggregated Metrics
  const totalAdmins = admins.filter((a) => a.role === 'tournament_admin').length;
  const activeTournaments = tournaments.filter(
    (t) => t.status === 'pendaftaran_dibuka' || t.status === 'sedang_berlangsung'
  ).length;
  const completedTournaments = tournaments.filter((t) => t.status === 'selesai').length;
  const totalTeams = registrations.length;
  const pendingRegistrations = registrations.filter((r) => r.status === 'pending').length;
  const pendingPayments = registrations.filter(
    (r) => r.paymentStatus === 'menunggu_pembayaran' || r.paymentStatus === 'menunggu_konfirmasi'
  ).length;

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminUsername || !adminEmail) return;

    await createAdminAccount({
      name: adminName,
      username: adminUsername,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
    });

    setCreateMsg('Akun Admin Turnamen baru berhasil dibuat!');
    setAdminName('');
    setAdminUsername('');
    setAdminEmail('');
    setAdminPhone('');
    setAdminPassword('');
    setShowCreateAdmin(false);
    setTimeout(() => setCreateMsg(''), 4000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      siteName,
      tagline,
      heroDescription,
      contactWhatsApp,
      contactEmail,
      globalNotice,
    });
    setSettingsMsg('Pengaturan website berhasil disimpan!');
    setTimeout(() => setSettingsMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex text-slate-100 antialiased font-sans">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0f1d] border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <Shield className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="font-heading font-black text-base text-white tracking-wider">
                  SUPER <span className="text-amber-400">ADMIN</span>
                </div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  PANEL KENDALI
                </div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation 6 Menus */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Trophy },
              { id: 'admins', label: 'Kelola Admin', icon: Users, badge: totalAdmins },
              { id: 'tournaments', label: 'Semua Turnamen', icon: Layers, badge: tournaments.length },
              { id: 'registrations', label: 'Semua Pendaftaran', icon: Users, badge: pendingRegistrations || undefined },
              { id: 'payments', label: 'Pembayaran', icon: CreditCard, badge: pendingPayments || undefined },
              { id: 'settings', label: 'Pengaturan', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-400 text-[10px] font-mono">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}

            <button
              onClick={logoutAdmin}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors pt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Super Admin: {currentAdmin?.name}
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-[#0a0f1d] border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300">
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-heading font-bold text-sm text-white">Dashboard Super Administrator</div>
          </div>
          <button
            onClick={logoutAdmin}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </header>

        <main className="p-4 sm:p-8 space-y-8 flex-1">
          {createMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{createMsg}</span>
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h2 className="font-heading font-black text-2xl text-white">Ringkasan Sistem Platform</h2>
                <p className="text-xs text-slate-400">Pantau seluruh turnamen, admin, pendaftaran tim, dan status pembayaran.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Admin</div>
                  <div className="font-heading font-black text-3xl text-white">{totalAdmins}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Turnamen Aktif</div>
                  <div className="font-heading font-black text-3xl text-emerald-400">{activeTournaments}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Tim Masuk</div>
                  <div className="font-heading font-black text-3xl text-white">{totalTeams}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Menunggu Verifikasi</div>
                  <div className="font-heading font-black text-3xl text-amber-400">{pendingRegistrations}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Turnamen Selesai</div>
                  <div className="font-heading font-black text-3xl text-blue-400">{completedTournaments}</div>
                </div>
              </div>

              {/* Recent Tournaments */}
              <div className="bg-[#0c1426] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-bold text-base text-white">Turnamen Terkini</h3>
                  <button onClick={() => setActiveTab('tournaments')} className="text-xs text-amber-400 hover:text-amber-300 font-bold">
                    Lihat Semua
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#090f1d] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Nama Turnamen</th>
                        <th className="py-2.5 px-3">Penyelenggara</th>
                        <th className="py-2.5 px-3">Slot Tim</th>
                        <th className="py-2.5 px-3">Total Hadiah</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {tournaments.slice(0, 5).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-bold text-white">{t.title}</td>
                          <td className="py-3 px-3 text-slate-300">{t.organizerName}</td>
                          <td className="py-3 px-3">{t.registeredCount} / {t.maxSlots}</td>
                          <td className="py-3 px-3 text-amber-400 font-mono">Rp {t.prizePoolTotal.toLocaleString('id-ID')}</td>
                          <td className="py-3 px-3 uppercase text-[10px] font-bold">{t.status.replace('_', ' ')}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => openTournamentDetail(t.slug)}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: KELOLA ADMIN */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-heading font-black text-2xl text-white">Kelola Akun Admin Turnamen</h2>
                  <p className="text-xs text-slate-400">Buat akun penyelenggara, atur status aktif/nonaktif, dan pantau turnamen mereka.</p>
                </div>
                <button
                  onClick={() => setShowCreateAdmin(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md"
                >
                  <UserPlus className="w-4 h-4" /> Tambah Admin Baru
                </button>
              </div>

              <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090f1d] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Nama Admin</th>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {admins.filter((a) => a.role === 'tournament_admin').map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-white">{admin.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">@{admin.username}</td>
                        <td className="py-3 px-4 text-slate-400">{admin.email}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleAdminStatus(admin.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              admin.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {admin.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteAdminAccount(admin.id)}
                            className="p-1 rounded bg-rose-950/60 text-rose-400 hover:bg-rose-900 border border-rose-800"
                            title="Hapus Admin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SEMUA TURNAMEN */}
          {activeTab === 'tournaments' && (
            <div className="space-y-6">
              <h2 className="font-heading font-black text-2xl text-white">Semua Turnamen Global</h2>
              <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090f1d] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Turnamen</th>
                      <th className="py-3 px-4">Penyelenggara</th>
                      <th className="py-3 px-4">Slot</th>
                      <th className="py-3 px-4">Hadiah</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tournaments.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-white">{t.title}</td>
                        <td className="py-3 px-4 text-slate-300">{t.organizerName}</td>
                        <td className="py-3 px-4">{t.registeredCount} / {t.maxSlots}</td>
                        <td className="py-3 px-4 font-mono text-amber-400">Rp {t.prizePoolTotal.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold">{t.status.replace('_', ' ')}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openTournamentDetail(t.slug)}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                            >
                              Detail Publik
                            </button>
                            <button
                              onClick={() => setTourToDelete(t)}
                              className="p-1 rounded bg-rose-950/60 text-rose-400 border border-rose-800 hover:bg-rose-900"
                              title="Hapus Turnamen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SEMUA PENDAFTARAN */}
          {activeTab === 'registrations' && (
            <div className="space-y-6">
              <h2 className="font-heading font-black text-2xl text-white">Semua Pendaftaran Tim Masuk</h2>
              <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090f1d] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">ID / Tim</th>
                      <th className="py-3 px-4">Turnamen</th>
                      <th className="py-3 px-4">Kapten (WhatsApp)</th>
                      <th className="py-3 px-4">Status Tim</th>
                      <th className="py-3 px-4">Pembayaran</th>
                      <th className="py-3 px-4 text-right">Roster</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{reg.teamName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{reg.id}</div>
                        </td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">{reg.tournamentTitle}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {reg.captainName} ({reg.captainPhone})
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold">
                          {reg.status}
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold text-amber-300">
                          {reg.paymentStatus.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                          >
                            Detail Roster
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PEMBAYARAN */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="font-heading font-black text-2xl text-white">Status Pembayaran Semua Turnamen</h2>
              <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090f1d] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">ID Pendaftaran</th>
                      <th className="py-3 px-4">Nama Tim</th>
                      <th className="py-3 px-4">Turnamen</th>
                      <th className="py-3 px-4">Kapten & Kontak</th>
                      <th className="py-3 px-4">Status Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {registrations.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{r.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{r.teamName}</td>
                        <td className="py-3 px-4 text-slate-300">{r.tournamentTitle}</td>
                        <td className="py-3 px-4 text-slate-400">{r.captainName} ({r.captainPhone})</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.paymentStatus === 'terverifikasi'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : r.paymentStatus === 'ditolak'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {r.paymentStatus.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PENGATURAN */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto bg-[#0c1426] border border-slate-800 p-8 rounded-2xl space-y-4 shadow-xl">
              <h2 className="font-heading font-black text-2xl text-white">Pengaturan Global Platform</h2>
              {settingsMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs">
                  {settingsMsg}
                </div>
              )}
              <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Website</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deskripsi Hero</label>
                  <textarea
                    rows={3}
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">WhatsApp Admin</label>
                    <input
                      type="text"
                      value={contactWhatsApp}
                      onChange={(e) => setContactWhatsApp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Dukungan</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs mt-3"
                >
                  Simpan Pengaturan
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* CREATE ADMIN MODAL */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1324] border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Buat Akun Admin Turnamen Baru</h3>
              <button onClick={() => setShowCreateAdmin(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Penyelenggara *</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Contoh: Sari Gaming"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="sari99"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="sari@esports.id"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp Panitia</label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password Awal *</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs mt-2"
              >
                Simpan & Terbitkan Kredensial
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ROSTER MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1324] border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">Roster Tim: {selectedReg.teamName}</h4>
              <button onClick={() => setSelectedReg(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1 text-slate-300">
              <div>Kapten: <strong className="text-white">{selectedReg.captainName}</strong> ({selectedReg.captainPhone})</div>
              <div>ID Game Kapten: <strong className="text-amber-400 font-mono">{selectedReg.captainGameId}</strong></div>
            </div>
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <div className="font-bold text-slate-400 uppercase text-[10px]">5 Pemain Utama:</div>
              <div>• Jungler: <strong className="text-white">{selectedReg.mainPlayers.jungler}</strong></div>
              <div>• EXP Laner: <strong className="text-white">{selectedReg.mainPlayers.expLaner}</strong></div>
              <div>• Mid Laner: <strong className="text-white">{selectedReg.mainPlayers.midLaner}</strong></div>
              <div>• Gold Laner: <strong className="text-white">{selectedReg.mainPlayers.goldLaner}</strong></div>
              <div>• Roamer: <strong className="text-white">{selectedReg.mainPlayers.roamer}</strong></div>
            </div>
            <button
              onClick={() => setSelectedReg(null)}
              className="w-full py-2 rounded-lg bg-slate-800 text-slate-300 font-bold mt-2"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS TURNAMEN (SUPER ADMIN) */}
      {tourToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b1324] border border-rose-900/60 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-black text-lg text-white">Hapus Turnamen?</h4>
                <p className="text-xs text-slate-400">Tindakan ini akan menghapus seluruh data turnamen</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus turnamen{' '}
              <strong className="text-white">"{tourToDelete.title}"</strong>?
              Penyelenggara: <span className="text-amber-400">{tourToDelete.organizerName}</span>.
              Semua data peserta, bagan pertandingan, dan klasemen akan dihapus.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTourToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = tourToDelete.id;
                  await deleteTournament(id);
                  setTourToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/40"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
