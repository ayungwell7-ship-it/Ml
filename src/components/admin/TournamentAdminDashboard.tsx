import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Users,
  Plus,
  Calendar,
  Gamepad2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  LogOut,
  AlertCircle,
  Trash2,
  Edit2,
  FileText,
  CreditCard,
  Award,
  Layers,
  Sparkles,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react';
import {
  Tournament,
  Registration,
  Match,
  TournamentFormat,
  MatchBoFormat,
  PaymentStatus,
} from '../../types';
import { ImageUploadPicker } from '../common/ImageUploadPicker';
import { BracketView } from '../public/BracketView';
import { StandingsView } from '../public/StandingsView';

export const TournamentAdminDashboard: React.FC = () => {
  const {
    tournaments,
    registrations,
    matches,
    standings,
    currentAdmin,
    createTournament,
    updateTournament,
    deleteTournament,
    verifyPayment,
    approveRegistration,
    rejectRegistration,
    generateBracket,
    inputMatchScore,
    scheduleMatch,
    selectedAdminTournamentId,
    openAdminTournamentDetail,
    backToAdminDashboard,
    logoutAdmin,
  } = useTournament();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Tournament Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPoster, setNewPoster] = useState('');
  const [newLogo, setNewLogo] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('Online');
  const [newStartDate, setNewStartDate] = useState('2025-05-15');
  const [newEndDate, setNewEndDate] = useState('2025-05-30');
  const [newRegDeadline, setNewRegDeadline] = useState('2025-05-10');
  const [newFormat, setNewFormat] = useState<TournamentFormat>('Single Elimination');
  const [newBo, setNewBo] = useState<MatchBoFormat>('Bo3');
  const [newMaxSlots, setNewMaxSlots] = useState(16);
  const [newEntryFee, setNewEntryFee] = useState(50000);
  const [newPrizePool, setNewPrizePool] = useState(5000000);
  const [newWhatsapp, setNewWhatsapp] = useState(currentAdmin?.phone || '081234567890');
  const [newRules, setNewRules] = useState(
    '1. Mode Custom Draft Pick 5v5.\n2. Ban Pick: 5 Hero ban per tim.\n3. Pause toleransi 5 menit untuk kendala teknis.\n4. Bukti transfer dikirimkan via WhatsApp panitia.'
  );
  const [createMsg, setCreateMsg] = useState('');

  // 10-Tab Detail State
  const [detailTab, setDetailTab] = useState<
    'ringkasan' | 'pendaftaran' | 'pembayaran' | 'peserta' | 'bracket' | 'jadwal' | 'skor' | 'klasemen' | 'hasil' | 'pengaturan'
  >('ringkasan');

  // Score Input State
  const [scoreModalMatch, setScoreModalMatch] = useState<Match | null>(null);
  const [inputScore1, setInputScore1] = useState(0);
  const [inputScore2, setInputScore2] = useState(0);
  const [scoreError, setScoreError] = useState('');

  // Schedule Match State
  const [schedModalMatch, setSchedModalMatch] = useState<Match | null>(null);
  const [schedTimeInput, setSchedTimeInput] = useState('');

  // Rejection modal
  const [rejectModalReg, setRejectModalReg] = useState<Registration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // View Roster modal
  const [rosterModalReg, setRosterModalReg] = useState<Registration | null>(null);

  // Delete Tournament Modal State
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string>('');

  // DATA ISOLATION: Only tournaments owned by this admin
  const myTournaments = tournaments.filter(
    (t) => t.adminId === currentAdmin?.id || t.organizerName === currentAdmin?.name
  );
  const myTourIds = myTournaments.map((t) => t.id);

  const myRegistrations = registrations.filter((r) => myTourIds.includes(r.tournamentId));
  const myMatches = matches.filter((m) => myTourIds.includes(m.tournamentId));

  // Dashboard Aggregates
  const totalMyTours = myTournaments.length;
  const totalMyRegs = myRegistrations.length;
  const pendingPayments = myRegistrations.filter(
    (r) => r.paymentStatus === 'menunggu_pembayaran' || r.paymentStatus === 'menunggu_konfirmasi'
  ).length;
  const approvedTeamsCount = myRegistrations.filter((r) => r.status === 'approved').length;
  const ongoingToursCount = myTournaments.filter((t) => t.status === 'sedang_berlangsung').length;

  // Selected tournament inside detail view
  const currentTour = tournaments.find((t) => t.id === selectedAdminTournamentId) || null;
  const currentTourRegs = registrations.filter((r) => r.tournamentId === currentTour?.id);
  const currentTourApproved = currentTourRegs.filter((r) => r.status === 'approved');
  const currentTourMatches = matches.filter((m) => m.tournamentId === currentTour?.id);

  const handleCreateTournamentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await createTournament({
      title: newTitle,
      posterUrl: newPoster || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      organizerLogo: newLogo || undefined,
      description: newDesc,
      location: newLocation,
      startDate: newStartDate,
      endDate: newEndDate,
      regDeadline: newRegDeadline,
      format: newFormat,
      matchFormat: newBo,
      maxSlots: newMaxSlots,
      entryFee: newEntryFee,
      prizePoolTotal: newPrizePool,
      whatsappAdmin: newWhatsapp,
      rules: newRules,
      status: 'pendaftaran_dibuka',
      isPublished: true,
    });

    setShowCreateModal(false);
    setCreateMsg('Turnamen berhasil dibuat dan dipublikasikan!');
    setTimeout(() => setCreateMsg(''), 4000);
    openAdminTournamentDetail(created.id);
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError('');
    if (!scoreModalMatch) return;

    if (inputScore1 === inputScore2) {
      setScoreError('Pertandingan Mobile Legends tidak boleh berakhir seri!');
      return;
    }

    const boFormat = scoreModalMatch.boFormat || 'Bo3';
    const targetWins = boFormat === 'Bo1' ? 1 : boFormat === 'Bo3' ? 2 : boFormat === 'Bo5' ? 3 : 4;

    const s1Wins = inputScore1 === targetWins && inputScore2 < targetWins;
    const s2Wins = inputScore2 === targetWins && inputScore1 < targetWins;

    if (!s1Wins && !s2Wins) {
      setScoreError(
        `Skor tidak valid untuk ${boFormat}! Pemenang harus mencapai tepat ${targetWins} game menang (contoh: ${
          boFormat === 'Bo1'
            ? '1-0 atau 0-1'
            : boFormat === 'Bo3'
            ? '2-0 atau 2-1'
            : boFormat === 'Bo5'
            ? '3-0, 3-1, atau 3-2'
            : '4-0, 4-1, 4-2, atau 4-3'
        }).`
      );
      return;
    }

    const winner = s1Wins ? scoreModalMatch.team1Name : scoreModalMatch.team2Name;
    await inputMatchScore(scoreModalMatch.id, inputScore1, inputScore2, winner);
    setScoreModalMatch(null);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedModalMatch || !schedTimeInput.trim()) return;
    await scheduleMatch(schedModalMatch.id, schedTimeInput);
    setSchedModalMatch(null);
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReg || !rejectionReason.trim()) return;
    await rejectRegistration(rejectModalReg.id, rejectionReason);
    setRejectModalReg(null);
    setRejectionReason('');
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
                <Trophy className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="font-heading font-black text-base text-white tracking-wider">
                  ADMIN <span className="text-amber-400">TURNAMEN</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  PANEL PENGELOLA
                </div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
              {currentAdmin?.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="font-bold text-white text-xs truncate">{currentAdmin?.name}</div>
              <div className="text-[10px] text-emerald-400">Penyelenggara Aktif</div>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => {
                backToAdminDashboard();
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                !selectedAdminTournamentId
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Dashboard Utama</span>
            </button>

            <button
              onClick={() => {
                setShowCreateModal(true);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-colors font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Turnamen</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors pt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar ke Publik</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Penyelenggara: {currentAdmin?.name}
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-[#0a0f1d] border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300">
              <Menu className="w-5 h-5" />
            </button>
            {selectedAdminTournamentId && (
              <button
                onClick={backToAdminDashboard}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Ringkasan</span>
              </button>
            )}
            <div className="font-heading font-bold text-sm text-white truncate max-w-sm">
              {currentTour ? currentTour.title : 'Dashboard Admin Turnamen'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Turnamen</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          {createMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{createMsg}</span>
            </div>
          )}

          {deleteNotice && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-700 text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deleteNotice}</span>
            </div>
          )}

          {/* VIEW 1: DASHBOARD UTAMA ADMIN */}
          {!currentTour ? (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-heading font-black text-2xl text-white">Ringkasan Turnamen Anda</h2>
                  <p className="text-xs text-slate-400">Pantau pendaftaran, verifikasi pembayaran, dan kelola pertandingan.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md"
                >
                  + Tambah Turnamen Baru
                </button>
              </div>

              {/* 5 KPI CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Turnamen Anda</div>
                  <div className="font-heading font-black text-3xl text-white">{totalMyTours}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Pendaftaran Masuk</div>
                  <div className="font-heading font-black text-3xl text-white">{totalMyRegs}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Menunggu Pembayaran</div>
                  <div className="font-heading font-black text-3xl text-amber-400">{pendingPayments}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tim Disetujui</div>
                  <div className="font-heading font-black text-3xl text-emerald-400">{approvedTeamsCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Sedang Berlangsung</div>
                  <div className="font-heading font-black text-3xl text-blue-400">{ongoingToursCount}</div>
                </div>
              </div>

              {/* Tournament List Cards */}
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-lg text-white">Turnamen yang Anda Kelola</h3>
                {myTournaments.length === 0 ? (
                  <div className="p-16 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 space-y-3">
                    <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                    <h4 className="font-bold text-white text-base">Belum Ada Turnamen yang Dibuat</h4>
                    <p className="text-xs">Klik tombol di bawah untuk membuat turnamen Mobile Legends pertama Anda.</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      + Tambah Turnamen Baru
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTournaments.map((tour) => (
                      <div
                        key={tour.id}
                        className="bg-[#0c1426] border border-slate-800 hover:border-amber-400/50 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="h-40 rounded-xl overflow-hidden relative">
                            <img src={tour.posterUrl} alt={tour.title} className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-amber-400 border border-white/10 uppercase">
                              {tour.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 className="font-heading font-black text-lg text-white line-clamp-1">{tour.title}</h3>
                          <div className="text-xs text-slate-400 space-y-1">
                            <div>Format: <strong className="text-slate-200">{tour.format} ({tour.matchFormat})</strong></div>
                            <div>Slot: <strong className="text-white">{tour.registeredCount} / {tour.maxSlots} Tim</strong></div>
                            <div>Hadiah: <strong className="text-amber-400 font-mono">Rp {tour.prizePoolTotal.toLocaleString('id-ID')}</strong></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => openAdminTournamentDetail(tour.id)}
                            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                          >
                            <span>Kelola Turnamen</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTournamentToDelete(tour)}
                            className="p-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white transition-colors flex items-center justify-center"
                            title="Hapus Turnamen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VIEW 2: DETAIL TURNAMEN DI DASHBOARD ADMIN (10 TABS REQUIRED) */
            <div className="space-y-6">
              {/* Detail Tournament Top Bar with Back and Delete Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a101f] p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={backToAdminDashboard}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Kembali ke Daftar Turnamen"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <div>
                    <h2 className="font-heading font-black text-xl text-white line-clamp-1">{currentTour.title}</h2>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="uppercase text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {currentTour.status.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{currentTour.format} ({currentTour.matchFormat})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTournamentToDelete(currentTour)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Turnamen</span>
                  </button>
                </div>
              </div>

              {/* 10 Navigation Tabs */}
              <div className="flex border-b border-slate-800 overflow-x-auto gap-2 bg-[#090f1d] p-1.5 rounded-2xl">
                {[
                  { id: 'ringkasan', label: '1. Ringkasan' },
                  { id: 'pendaftaran', label: `2. Pendaftaran Tim (${currentTourRegs.length})` },
                  { id: 'pembayaran', label: '3. Verifikasi Pembayaran' },
                  { id: 'peserta', label: `4. Daftar Peserta (${currentTourApproved.length})` },
                  { id: 'bracket', label: '5. Bracket' },
                  { id: 'jadwal', label: `6. Jadwal Pertandingan (${currentTourMatches.length})` },
                  { id: 'skor', label: '7. Input Skor' },
                  { id: 'klasemen', label: '8. Klasemen' },
                  { id: 'hasil', label: '9. Hasil Akhir' },
                  { id: 'pengaturan', label: '10. Pengaturan' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      detailTab === t.id
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: RINGKASAN */}
              {detailTab === 'ringkasan' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#0c1426] p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="font-heading font-bold text-xl text-white">{currentTour.title}</h3>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{currentTour.description}</p>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                      <div>Format: <strong className="text-white">{currentTour.format} ({currentTour.matchFormat})</strong></div>
                      <div>Status: <strong className="text-amber-400 uppercase">{currentTour.status.replace('_', ' ')}</strong></div>
                      <div>Tanggal: <span className="text-slate-300 font-mono">{currentTour.startDate} - {currentTour.endDate}</span></div>
                      <div>Batas Pendaftaran: <span className="text-slate-300 font-mono">{currentTour.regDeadline}</span></div>
                    </div>
                  </div>

                  <div className="bg-[#0c1426] p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="font-heading font-bold text-base text-white">Status Kuota</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tim Disetujui:</span>
                        <strong className="text-emerald-400 font-bold">{currentTourApproved.length} Tim</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Slot Maksimal:</span>
                        <strong className="text-white font-mono">{currentTour.maxSlots} Tim</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Hadiah:</span>
                        <strong className="text-amber-400 font-mono">Rp {currentTour.prizePoolTotal.toLocaleString('id-ID')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PENDAFTARAN TIM */}
              {detailTab === 'pendaftaran' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Semua Pendaftaran yang Masuk</span>
                    <span className="text-slate-400">{currentTourRegs.length} Pendaftar</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#090f1d] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Nama Tim</th>
                          <th className="py-3 px-4">Kapten & WhatsApp</th>
                          <th className="py-3 px-4">ID Game Kapten</th>
                          <th className="py-3 px-4">Waktu Daftar</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {currentTourRegs.map((reg) => (
                          <tr key={reg.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-bold text-white">{reg.teamName}</td>
                            <td className="py-3 px-4 text-slate-300">{reg.captainName} ({reg.captainPhone})</td>
                            <td className="py-3 px-4 font-mono text-amber-400">{reg.captainGameId}</td>
                            <td className="py-3 px-4 text-slate-400">{new Date(reg.createdAt).toLocaleDateString('id-ID')}</td>
                            <td className="py-3 px-4 text-center uppercase text-[10px] font-bold">
                              {reg.status}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`https://wa.me/${reg.captainPhone.replace(/[^0-9]/g, '').startsWith('0') ? '62' + reg.captainPhone.replace(/[^0-9]/g, '').slice(1) : reg.captainPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Kapten ${reg.captainName} dari tim ${reg.teamName}, mengenai pendaftaran ${currentTour.title}...`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-700/40 border border-emerald-600/50 hover:bg-emerald-600 text-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                  title="Chat WhatsApp Kapten"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>Chat WA</span>
                                </a>
                                <button
                                  onClick={() => setRosterModalReg(reg)}
                                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white"
                                >
                                  Lihat Detail Roster
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

              {/* TAB 3: VERIFIKASI PEMBAYARAN */}
              {detailTab === 'pembayaran' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-lg text-white">Verifikasi Pembayaran Peserta</h3>
                    <p className="text-xs text-slate-400">
                      Periksa screenshot bukti transfer yang dikirimkan peserta ke WhatsApp Anda ({currentTour.whatsappAdmin}) dan mutasi rekening.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#090f1d] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">ID Pendaftaran</th>
                          <th className="py-3 px-4">Nama Tim</th>
                          <th className="py-3 px-4">Kapten & WhatsApp</th>
                          <th className="py-3 px-4 text-center">Status Pembayaran</th>
                          <th className="py-3 px-4 text-right">Tindakan Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {currentTourRegs.map((reg) => (
                          <tr key={reg.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono font-bold text-amber-400">{reg.id}</td>
                            <td className="py-3 px-4 font-bold text-white">{reg.teamName}</td>
                            <td className="py-3 px-4 text-slate-300">{reg.captainName} ({reg.captainPhone})</td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  reg.paymentStatus === 'terverifikasi'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : reg.paymentStatus === 'ditolak'
                                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}
                              >
                                {reg.paymentStatus.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {reg.paymentStatus !== 'terverifikasi' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <a
                                    href={`https://wa.me/${reg.captainPhone.replace(/[^0-9]/g, '').startsWith('0') ? '62' + reg.captainPhone.replace(/[^0-9]/g, '').slice(1) : reg.captainPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Kapten ${reg.captainName} (${reg.teamName}), kami dari panitia ${currentTour.title}. Mohon kirimkan bukti transfer pendaftaran Anda...`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-700/40 border border-emerald-600/50 hover:bg-emerald-600 text-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                    title="Hubungi WhatsApp Kapten"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>Chat WA</span>
                                  </a>
                                  <button
                                    onClick={() => approveRegistration(reg.id)}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                                  >
                                    Verifikasi Pembayaran & Setujui Tim
                                  </button>
                                  <button
                                    onClick={() => setRejectModalReg(reg)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                                  >
                                    Tolak
                                  </button>
                                </div>
                              ) : (
                                <span className="text-emerald-400 font-bold text-[11px]">✓ Lunas & Terverifikasi</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: DAFTAR PESERTA (ONLY APPROVED) */}
              {detailTab === 'peserta' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">Daftar Peserta Resmi Turnamen</h3>
                      <p className="text-xs text-slate-400">
                        Hanya tim dengan pembayaran terverifikasi dan disetujui yang dapat mengikuti bagan bracket.
                      </p>
                    </div>
                    <span className="font-bold text-amber-400 text-xs">
                      {currentTourApproved.length} / {currentTour.maxSlots} Kuota Tim
                    </span>
                  </div>

                  {currentTourApproved.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Belum ada tim yang disetujui untuk menjadi peserta resmi.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentTourApproved.map((team, idx) => (
                        <div key={team.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{idx + 1}. {team.teamName}</span>
                            <span className="text-emerald-400 text-[10px] font-bold">Resmi</span>
                          </div>
                          <div className="text-[11px] text-slate-400">Kapten: {team.captainName} ({team.captainPhone})</div>
                          <div className="text-[10px] text-slate-500">
                            Roster: {team.mainPlayers.jungler}, {team.mainPlayers.expLaner}, {team.mainPlayers.midLaner}, {team.mainPlayers.goldLaner}, {team.mainPlayers.roamer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BRACKET */}
              {detailTab === 'bracket' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-white">Bagan Bracket Pertandingan</h3>
                      <p className="text-xs text-slate-400">
                        Format: <strong className="text-amber-400">{currentTour.format}</strong>. Dibuat khusus dari tim peserta resmi.
                      </p>
                    </div>

                    <button
                      onClick={() => generateBracket(currentTour.id, currentTour.format)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                    >
                      ⚡ Buat / Acak Bracket Resmi ({currentTourApproved.length} Tim)
                    </button>
                  </div>

                  <BracketView
                    tournamentId={currentTour.id}
                    matches={matches}
                    isAdmin={true}
                    onEditMatch={(m) => setScoreModalMatch(m)}
                  />
                </div>
              )}

              {/* TAB 6: JADWAL PERTANDINGAN */}
              {detailTab === 'jadwal' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="font-heading font-bold text-xl text-white">Atur Jadwal Pertandingan</h3>
                  {currentTourMatches.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Bagan bracket belum dibuat. Silakan buka tab "5. Bracket" dan klik "Buat / Acak Bracket Resmi".
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentTourMatches.map((m) => (
                        <div key={m.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-white text-sm">{m.roundName} ({m.boFormat})</div>
                            <div className="text-amber-400 font-mono text-[11px]">
                              {m.scheduledTime || 'Belum diatur jadwalnya'}
                            </div>
                          </div>

                          <div className="font-semibold text-slate-200 text-sm">
                            {m.team1Name} vs {m.team2Name}
                          </div>

                          <button
                            onClick={() => {
                              setSchedModalMatch(m);
                              setSchedTimeInput(m.scheduledTime || '15 Mei 2025 • 19:00 WIB');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 font-bold"
                          >
                            Atur Jadwal Jam Match
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: INPUT SKOR */}
              {detailTab === 'skor' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="font-heading font-bold text-xl text-white">Input Skor Pertandingan</h3>
                  {currentTourMatches.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Belum ada pertandingan aktif untuk diinputkan skor.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentTourMatches.map((m) => (
                        <div key={m.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-white">{m.roundName} ({m.boFormat})</div>
                            <div className="text-slate-400 font-mono text-[11px]">{m.scheduledTime || 'Matchday'}</div>
                          </div>

                          <div className="flex items-center gap-4 text-sm font-bold">
                            <span className={m.winnerName === m.team1Name ? 'text-amber-400' : 'text-white'}>
                              {m.team1Name}
                            </span>
                            <span className="px-3 py-1 rounded bg-black/60 border border-slate-700 text-amber-400 font-mono">
                              {m.status === 'selesai' ? `${m.team1Score} - ${m.team2Score}` : 'VS'}
                            </span>
                            <span className={m.winnerName === m.team2Name ? 'text-amber-400' : 'text-white'}>
                              {m.team2Name}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setScoreModalMatch(m);
                              setInputScore1(m.team1Score || 0);
                              setInputScore2(m.team2Score || 0);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md"
                          >
                            Input / Ubah Skor
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: KLASEMEN (ROUND ROBIN) */}
              {detailTab === 'klasemen' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="font-heading font-bold text-xl text-white">Klasemen Turnamen</h3>
                  <StandingsView tournamentId={currentTour.id} standings={standings} matches={matches} />
                </div>
              )}

              {/* TAB 9: HASIL AKHIR */}
              {detailTab === 'hasil' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-center">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                  <h3 className="font-heading font-black text-2xl text-white">Hasil Akhir & Juara</h3>
                  {currentTourMatches.filter((m) => m.bracketType === 'final' && m.status === 'selesai').length > 0 ? (
                    <div className="p-6 bg-gradient-to-r from-amber-500/20 via-slate-900 to-[#0c1426] border border-amber-500/40 rounded-2xl max-w-md mx-auto space-y-2">
                      <span className="text-[11px] text-amber-400 uppercase font-black tracking-widest">Juara 1 Turnamen</span>
                      <div className="font-heading font-black text-3xl text-white">
                        {currentTourMatches.find((m) => m.bracketType === 'final')?.winnerName}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Turnamen masih berlangsung. Hasil akhir dan pemenang akan otomatis tampil setelah babak final selesai.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 10: PENGATURAN */}
              {detailTab === 'pengaturan' && (
                <div className="bg-[#0c1426] border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl shadow-xl text-xs">
                  <h3 className="font-heading font-bold text-lg text-white">Pengaturan Status Turnamen</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Ubah Status Turnamen</label>
                      <select
                        value={currentTour.status}
                        onChange={async (e) => {
                          const val = e.target.value as any;
                          if (val === 'selesai') {
                            const title = currentTour.title;
                            await updateTournament(currentTour.id, { status: val });
                            backToAdminDashboard();
                            setDeleteNotice(`Turnamen "${title}" telah diselesaikan dan otomatis terhapus dari sistem.`);
                            setTimeout(() => setDeleteNotice(''), 5000);
                          } else {
                            await updateTournament(currentTour.id, { status: val });
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="akan_dibuka">Akan Dibuka</option>
                        <option value="pendaftaran_dibuka">Pendaftaran Dibuka</option>
                        <option value="pendaftaran_ditutup">Pendaftaran Ditutup</option>
                        <option value="menunggu_pertandingan">Menunggu Pertandingan</option>
                        <option value="sedang_berlangsung">Sedang Berlangsung</option>
                        <option value="selesai">Selesai (Otomatis Terhapus)</option>
                      </select>
                      <p className="text-[11px] text-amber-400 mt-1.5 leading-relaxed">
                        ⚠️ Sesuai ketentuan sistem: Mengubah status menjadi <strong>"Selesai"</strong> akan otomatis menghapus turnamen beserta datanya dari website.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-rose-400 font-bold">Zona Berbahaya</div>
                        <div className="text-[11px] text-slate-400">Hapus turnamen ini beserta seluruh data tim & jadwal</div>
                      </div>
                      <button
                        onClick={() => setTournamentToDelete(currentTour)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-950 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Turnamen Ini</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: INPUT SKOR */}
      {scoreModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1324] border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Input Skor Pertandingan</h4>
                <p className="text-xs text-slate-400">{scoreModalMatch.roundName} ({scoreModalMatch.boFormat})</p>
              </div>
              <button onClick={() => setScoreModalMatch(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {scoreError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {scoreError}
              </div>
            )}

            <form onSubmit={handleScoreSubmit} className="space-y-4">
              {/* BO Preset Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Pilihan Skor Cepat ({scoreModalMatch.boFormat}):</span>
                  <span className="text-amber-400 font-mono">
                    {scoreModalMatch.boFormat === 'Bo1'
                      ? 'Target: 1 Win'
                      : scoreModalMatch.boFormat === 'Bo3'
                      ? 'Target: 2 Win'
                      : scoreModalMatch.boFormat === 'Bo5'
                      ? 'Target: 3 Win'
                      : 'Target: 4 Win'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {scoreModalMatch.boFormat === 'Bo1' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(1);
                          setInputScore2(0);
                        }}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          inputScore1 === 1 && inputScore2 === 0
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        1 - 0 ({scoreModalMatch.team1Name} Menang)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(0);
                          setInputScore2(1);
                        }}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          inputScore1 === 0 && inputScore2 === 1
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        0 - 1 ({scoreModalMatch.team2Name} Menang)
                      </button>
                    </>
                  )}

                  {scoreModalMatch.boFormat === 'Bo3' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(2);
                          setInputScore2(0);
                        }}
                        className={`p-2 rounded-xl border text-center font-bold transition-all ${
                          inputScore1 === 2 && inputScore2 === 0
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        2 - 0 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(2);
                          setInputScore2(1);
                        }}
                        className={`p-2 rounded-xl border text-center font-bold transition-all ${
                          inputScore1 === 2 && inputScore2 === 1
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        2 - 1 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(1);
                          setInputScore2(2);
                        }}
                        className={`p-2 rounded-xl border text-center font-bold transition-all ${
                          inputScore1 === 1 && inputScore2 === 2
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        1 - 2 ({scoreModalMatch.team2Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(0);
                          setInputScore2(2);
                        }}
                        className={`p-2 rounded-xl border text-center font-bold transition-all ${
                          inputScore1 === 0 && inputScore2 === 2
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        0 - 2 ({scoreModalMatch.team2Name})
                      </button>
                    </>
                  )}

                  {scoreModalMatch.boFormat === 'Bo5' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(3);
                          setInputScore2(0);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 3 && inputScore2 === 0
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        3 - 0 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(3);
                          setInputScore2(1);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 3 && inputScore2 === 1
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        3 - 1 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(3);
                          setInputScore2(2);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 3 && inputScore2 === 2
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        3 - 2 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(0);
                          setInputScore2(3);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 0 && inputScore2 === 3
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        0 - 3 ({scoreModalMatch.team2Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(1);
                          setInputScore2(3);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 1 && inputScore2 === 3
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        1 - 3 ({scoreModalMatch.team2Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(2);
                          setInputScore2(3);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 2 && inputScore2 === 3
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        2 - 3 ({scoreModalMatch.team2Name})
                      </button>
                    </>
                  )}

                  {scoreModalMatch.boFormat === 'Bo7' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(4);
                          setInputScore2(0);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 4 && inputScore2 === 0
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        4 - 0 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(4);
                          setInputScore2(1);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 4 && inputScore2 === 1
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        4 - 1 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(4);
                          setInputScore2(2);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 4 && inputScore2 === 2
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        4 - 2 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(4);
                          setInputScore2(3);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 4 && inputScore2 === 3
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        4 - 3 ({scoreModalMatch.team1Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(0);
                          setInputScore2(4);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 0 && inputScore2 === 4
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        0 - 4 ({scoreModalMatch.team2Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(1);
                          setInputScore2(4);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 1 && inputScore2 === 4
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        1 - 4 ({scoreModalMatch.team2Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(2);
                          setInputScore2(4);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 2 && inputScore2 === 4
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        2 - 4 ({scoreModalMatch.team2Name})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputScore1(3);
                          setInputScore2(4);
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-bold ${
                          inputScore1 === 3 && inputScore2 === 4
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        3 - 4 ({scoreModalMatch.team2Name})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Custom Number Stepper / Inputs */}
              <div className="pt-2 border-t border-slate-800">
                <span className="block text-[11px] font-semibold text-slate-400 mb-2">
                  Atau masukkan skor per game manual:
                </span>
                <div className="grid grid-cols-2 gap-4 items-center text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-xs text-white truncate">{scoreModalMatch.team1Name}</div>
                    <input
                      type="number"
                      min={0}
                      max={7}
                      value={inputScore1}
                      onChange={(e) => setInputScore1(Number(e.target.value))}
                      className="w-16 mx-auto text-center py-1.5 bg-[#080d19] border border-slate-700 rounded-lg text-white font-mono font-black text-xl"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-xs text-white truncate">{scoreModalMatch.team2Name}</div>
                    <input
                      type="number"
                      min={0}
                      max={7}
                      value={inputScore2}
                      onChange={(e) => setInputScore2(Number(e.target.value))}
                      className="w-16 mx-auto text-center py-1.5 bg-[#080d19] border border-slate-700 rounded-lg text-white font-mono font-black text-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Live Winner Preview */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs">
                {inputScore1 !== inputScore2 ? (
                  <span>
                    Pemenang yang Lolos:{' '}
                    <strong className="text-amber-400 text-sm">
                      {inputScore1 > inputScore2 ? scoreModalMatch.team1Name : scoreModalMatch.team2Name}
                    </strong>
                  </span>
                ) : (
                  <span className="text-rose-400">Pilih skor akhir (tidak boleh seri).</span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScoreModalMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={inputScore1 === inputScore2}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  Simpan & Majukan Pemenang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATUR JADWAL MATCH */}
      {schedModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1324] border border-slate-700 w-full max-w-sm rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-white text-base">Atur Jadwal Match</h4>
            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tanggal dan Waktu Pertandingan</label>
                <input
                  type="text"
                  required
                  value={schedTimeInput}
                  onChange={(e) => setSchedTimeInput(e.target.value)}
                  placeholder="Contoh: 18 Mei 2025 • 19:30 WIB"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedModalMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TOLAK TIM DENGAN ALASAN */}
      {rejectModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1324] border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-white text-base">Alasan Penolakan Tim {rejectModalReg.teamName}</h4>
            <form onSubmit={handleRejectConfirm} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak valid atau nama kapten tidak sesuai..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Tolak Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL ROSTER LENGKAP */}
      {rosterModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1324] border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">Roster: {rosterModalReg.teamName}</h4>
              <button onClick={() => setRosterModalReg(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1 text-slate-300">
              <div>Kapten: <strong className="text-white">{rosterModalReg.captainName}</strong> ({rosterModalReg.captainPhone})</div>
              <div>ID Game MLBB Kapten: <strong className="text-amber-400 font-mono">{rosterModalReg.captainGameId}</strong></div>
            </div>
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px]">5 Pemain Utama:</span>
              <div>• Jungler: <strong className="text-white">{rosterModalReg.mainPlayers.jungler}</strong></div>
              <div>• EXP Laner: <strong className="text-white">{rosterModalReg.mainPlayers.expLaner}</strong></div>
              <div>• Mid Laner: <strong className="text-white">{rosterModalReg.mainPlayers.midLaner}</strong></div>
              <div>• Gold Laner: <strong className="text-white">{rosterModalReg.mainPlayers.goldLaner}</strong></div>
              <div>• Roamer: <strong className="text-white">{rosterModalReg.mainPlayers.roamer}</strong></div>
              {(rosterModalReg.subPlayers?.sub1 || rosterModalReg.subPlayers?.sub2) && (
                <div className="pt-1 text-slate-400">
                  Cadangan: {[rosterModalReg.subPlayers?.sub1, rosterModalReg.subPlayers?.sub2].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
            <button
              onClick={() => setRosterModalReg(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold mt-2"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH TURNAMEN BARU DENGAN IMAGE UPLOAD */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b1324] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-[#0d162b] to-[#121e3b]">
              <h3 className="font-heading font-bold text-lg text-white">Buat Turnamen Mobile Legends Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournamentSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Turnamen *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Mobile Legends Nusantara Cup Season 2"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
                />
              </div>

              {/* Real Image Upload Picker for Poster */}
              <ImageUploadPicker
                label="Poster Turnamen"
                sublabel="Pilih poster turnamen dari galeri HP atau komputer"
                value={newPoster}
                onChange={setNewPoster}
                required={true}
              />

              {/* Real Image Upload Picker for Organizer Logo */}
              <ImageUploadPicker
                label="Logo Penyelenggara (Opsional)"
                sublabel="Pilih logo komunitas / organizer dari galeri"
                value={newLogo}
                onChange={setNewLogo}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Format Turnamen</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Single Elimination">Single Elimination</option>
                    <option value="Double Elimination">Double Elimination</option>
                    <option value="Round Robin">Round Robin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Format Match</label>
                  <select
                    value={newBo}
                    onChange={(e) => setNewBo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Bo1">Bo1</option>
                    <option value="Bo3">Bo3</option>
                    <option value="Bo5">Bo5</option>
                    <option value="Bo7">Bo7</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Maksimal Slot Tim</label>
                  <select
                    value={newMaxSlots}
                    onChange={(e) => setNewMaxSlots(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value={8}>8 Tim</option>
                    <option value={16}>16 Tim</option>
                    <option value={32}>32 Tim</option>
                    <option value={64}>64 Tim</option>
                    <option value={128}>128 Tim</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batas Pendaftaran</label>
                  <input
                    type="date"
                    required
                    value={newRegDeadline}
                    onChange={(e) => setNewRegDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Biaya Pendaftaran per Tim (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Hadiah (Rp) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newPrizePool}
                    onChange={(e) => setNewPrizePool(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nomor WhatsApp Admin untuk Konfirmasi Pembayaran *
                </label>
                <input
                  type="text"
                  required
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Turnamen</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Jelaskan mengenai turnamen ini..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Peraturan & Ketentuan Turnamen</label>
                <textarea
                  rows={3}
                  value={newRules}
                  onChange={(e) => setNewRules(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                >
                  Publikasikan Turnamen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS TURNAMEN */}
      {tournamentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b1324] border border-rose-900/60 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-black text-lg text-white">Hapus Turnamen?</h4>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus turnamen{' '}
              <strong className="text-white">"{tournamentToDelete.title}"</strong>?
              Semua data pendaftaran tim, bagan bracket pertandingan, dan klasemen terkait akan dihapus secara permanen.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTournamentToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const title = tournamentToDelete.title;
                  const id = tournamentToDelete.id;
                  await deleteTournament(id);
                  setTournamentToDelete(null);
                  backToAdminDashboard();
                  setDeleteNotice(`Turnamen "${title}" berhasil dihapus.`);
                  setTimeout(() => setDeleteNotice(''), 4000);
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
