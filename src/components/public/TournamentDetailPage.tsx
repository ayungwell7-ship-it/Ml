import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Share2,
  Copy,
  Check,
  Award,
  AlertCircle,
  FileText,
  MessageCircle,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BracketView } from './BracketView';
import { StandingsView } from './StandingsView';
import { TeamRegistrationModal } from './TeamRegistrationModal';

export const TournamentDetailPage: React.FC = () => {
  const {
    tournaments,
    selectedTournamentSlug,
    setCurrentView,
    registrations,
    matches,
    standings,
  } = useTournament();

  const [activeTab, setActiveTab] = useState<
    'tentang' | 'tim' | 'bracket' | 'jadwal' | 'klasemen' | 'skor' | 'hadiah'
  >('tentang');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Find tournament by slug or ID
  const tournament =
    tournaments.find(
      (t) => t.slug === selectedTournamentSlug || t.id === selectedTournamentSlug
    ) || tournaments[0];

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Turnamen Tidak Ditemukan</h3>
        <button
          onClick={() => setCurrentView('public_tournaments')}
          className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
        >
          Kembali ke Daftar Turnamen
        </button>
      </div>
    );
  }

  // Only approved teams are listed publicly!
  const approvedTeams = registrations.filter(
    (r) => r.tournamentId === tournament.id && r.status === 'approved'
  );

  const tournamentMatches = matches.filter((m) => m.tournamentId === tournament.id);
  const completedMatches = tournamentMatches.filter((m) => m.status === 'selesai');

  const remainingSlots = Math.max(0, tournament.maxSlots - tournament.registeredCount);
  const isRegistrationAvailable =
    tournament.status === 'pendaftaran_dibuka' && remainingSlots > 0;

  const handleCopyLink = () => {
    const url = window.location.origin + `#/turnamen/${tournament.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Ikuti turnamen Mobile Legends: ${tournament.title}! Total Hadiah Rp ${tournament.prizePoolTotal.toLocaleString('id-ID')}. Info pendaftaran: ${window.location.origin}#/turnamen/${tournament.slug}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'akan_dibuka':
        return 'Akan Dibuka';
      case 'pendaftaran_dibuka':
        return 'Pendaftaran Dibuka';
      case 'pendaftaran_ditutup':
        return 'Pendaftaran Ditutup';
      case 'menunggu_pertandingan':
        return 'Menunggu Pertandingan';
      case 'sedang_berlangsung':
        return 'Sedang Berlangsung';
      case 'selesai':
        return 'Selesai';
      default:
        return 'Pendaftaran Dibuka';
    }
  };

  const tabs = [
    { id: 'tentang', label: '1. Tentang' },
    { id: 'tim', label: `2. Daftar Tim (${approvedTeams.length})` },
    { id: 'bracket', label: '3. Bracket' },
    { id: 'jadwal', label: `4. Jadwal (${tournamentMatches.length})` },
    { id: 'klasemen', label: '5. Klasemen' },
    { id: 'skor', label: `6. Skor & Hasil (${completedMatches.length})` },
    { id: 'hadiah', label: '7. Hadiah' },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button onClick={() => setCurrentView('public_home')} className="hover:text-amber-400 transition-colors">
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => setCurrentView('public_tournaments')} className="hover:text-amber-400 transition-colors">
            Semua Turnamen
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-amber-400 font-medium truncate max-w-xs">{tournament.title}</span>
        </div>
      </div>

      {/* Tournament Banner Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-b from-[#111a31] to-[#0a1020]">
          {/* Banner Backdrop */}
          <div className="h-56 sm:h-72 w-full relative overflow-hidden">
            <img
              src={tournament.posterUrl}
              alt={tournament.title}
              className="w-full h-full object-cover opacity-30 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1020] via-[#0a1020]/80 to-transparent"></div>
          </div>

          {/* Banner Content Overlay */}
          <div className="relative -mt-32 sm:-mt-40 px-6 sm:px-10 pb-8 flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              {/* Poster */}
              <div className="w-32 h-44 sm:w-44 sm:h-56 rounded-xl overflow-hidden border-2 border-amber-400/40 shadow-2xl shrink-0 bg-slate-900">
                <img src={tournament.posterUrl} alt={tournament.title} className="w-full h-full object-cover" />
              </div>

              {/* Tournament Title & Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      tournament.status === 'pendaftaran_dibuka'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : tournament.status === 'selesai'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {getStatusLabel(tournament.status)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    Sisa Slot: <strong className="text-amber-400">{remainingSlots}</strong> / {tournament.maxSlots} Tim
                  </span>
                </div>

                <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wide">
                  {tournament.title}
                </h1>

                <div className="text-xs text-slate-300">
                  Penyelenggara: <strong className="text-amber-400">{tournament.organizerName}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>{tournament.startDate} - {tournament.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>{tournament.format} ({tournament.matchFormat})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>{tournament.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Prize & CTAs */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 items-stretch md:items-end">
              <div className="bg-slate-900/90 border border-amber-500/30 p-3 sm:px-6 rounded-xl text-center md:text-right shadow-lg">
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Hadiah</div>
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">
                  Rp {tournament.prizePoolTotal.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isRegistrationAvailable ? (
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex-1 md:flex-initial px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
                  >
                    Daftar Turnamen
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                  >
                    {remainingSlots === 0 ? 'Slot Penuh' : 'Pendaftaran Ditutup'}
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-400 transition-colors"
                  title="Salin Tautan"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-emerald-400 transition-colors"
                  title="Bagikan ke WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation 7 Tabs */}
          <div className="border-t border-slate-800 bg-[#090f1e] px-4 sm:px-8 flex overflow-x-auto gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* 1. TENTANG */}
        {activeTab === 'tentang' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0c1426] p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-heading font-bold text-lg text-white">Deskripsi Turnamen</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {tournament.description}
                </p>
              </div>

              <div className="bg-[#0c1426] p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" /> Peraturan & Juknis
                </h3>
                <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800 font-mono">
                  {tournament.rules}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#0c1426] p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-heading font-bold text-base text-white">Informasi Pendaftaran</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Biaya Pendaftaran:</span>
                    <strong className="text-emerald-400 font-bold">
                      {tournament.entryFee === 0 ? 'Gratis' : `Rp ${tournament.entryFee.toLocaleString('id-ID')} / Tim`}
                    </strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Batas Pendaftaran:</span>
                    <span className="text-white font-mono">{tournament.regDeadline}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Slot Terisi:</span>
                    <span className="text-white">{tournament.registeredCount} / {tournament.maxSlots} Tim</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">WhatsApp Panitia:</span>
                    <span className="text-amber-400 font-mono">{tournament.whatsappAdmin}</span>
                  </div>
                </div>

                {isRegistrationAvailable && (
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all mt-2"
                  >
                    Daftar Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. DAFTAR TIM (ONLY APPROVED TEAMS) */}
        {activeTab === 'tim' && (
          <div className="space-y-4">
            <div className="bg-[#0c1426] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Menampilkan <strong className="text-amber-400">{approvedTeams.length} tim resmi</strong> yang telah terverifikasi oleh panitia.
              </span>
              {isRegistrationAvailable && (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Daftarkan Tim
                </button>
              )}
            </div>

            {approvedTeams.length === 0 ? (
              <div className="p-12 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 text-xs">
                Belum ada tim yang disetujui untuk turnamen ini. Pendaftaran yang masuk akan diperiksa oleh admin.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedTeams.map((team, idx) => (
                  <div key={team.id} className="p-4 rounded-2xl bg-[#0c1426] border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs overflow-hidden">
                        {team.teamLogo ? (
                          <img src={team.teamLogo} alt={team.teamName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{team.teamName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{team.teamName}</div>
                        <div className="text-[11px] text-slate-400">Kapten: {team.captainName}</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2 text-[11px] space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Roster MLBB:</span>
                      <div className="grid grid-cols-2 gap-1 text-slate-300">
                        <div>• {team.mainPlayers.jungler} (Jgl)</div>
                        <div>• {team.mainPlayers.expLaner} (EXP)</div>
                        <div>• {team.mainPlayers.midLaner} (Mid)</div>
                        <div>• {team.mainPlayers.goldLaner} (Gold)</div>
                        <div>• {team.mainPlayers.roamer} (Roam)</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. BRACKET (REAL DATA) */}
        {activeTab === 'bracket' && (
          <BracketView tournamentId={tournament.id} matches={matches} />
        )}

        {/* 4. JADWAL (REAL DATA) */}
        {activeTab === 'jadwal' && (
          <div className="space-y-4">
            <div className="bg-[#0c1426] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">Jadwal Pertandingan</h3>
              <span className="text-xs text-slate-400">Format Waktu: WIB</span>
            </div>

            {tournamentMatches.length === 0 ? (
              <div className="p-12 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 text-xs">
                Jadwal belum tersedia. Pertandingan akan dijadwalkan oleh panitia setelah bagan bracket resmi dibuat.
              </div>
            ) : (
              <div className="space-y-3">
                {tournamentMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{m.roundName} ({m.boFormat})</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {m.scheduledTime || 'Waktu akan diumumkan panitia'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-semibold">
                      <span className="text-slate-200">{m.team1Name || 'TBD'}</span>
                      <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold">
                        {m.status === 'selesai' ? `${m.team1Score} - ${m.team2Score}` : 'VS'}
                      </span>
                      <span className="text-slate-200">{m.team2Name || 'TBD'}</span>
                    </div>

                    <div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          m.status === 'selesai'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {m.status === 'selesai' ? 'Selesai' : 'Belum Dimulai'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. KLASEMEN (REAL DATA) */}
        {activeTab === 'klasemen' && (
          <StandingsView tournamentId={tournament.id} standings={standings} matches={matches} />
        )}

        {/* 6. SKOR DAN HASIL (REAL CONFIRMED ONLY) */}
        {activeTab === 'skor' && (
          <div className="space-y-4">
            <div className="bg-[#0c1426] p-4 rounded-2xl border border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">Hasil Pertandingan Resmi</h3>
            </div>

            {completedMatches.length === 0 ? (
              <div className="p-12 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 text-xs">
                Belum ada pertandingan yang selesai. Skor resmi akan ditampilkan di sini begitu pertandingan diselesaikan oleh panitia.
              </div>
            ) : (
              <div className="space-y-3">
                {completedMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <span className="text-amber-400 font-bold">{m.roundName}</span>
                      <span className="text-slate-500 mx-2">•</span>
                      <span className="text-slate-400 font-mono">{m.boFormat}</span>
                    </div>

                    <div className="flex items-center gap-5 text-sm font-bold">
                      <span className={m.winnerName === m.team1Name ? 'text-amber-400' : 'text-slate-300'}>
                        {m.team1Name}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono">
                        {m.team1Score} - {m.team2Score}
                      </span>
                      <span className={m.winnerName === m.team2Name ? 'text-amber-400' : 'text-slate-300'}>
                        {m.team2Name}
                      </span>
                    </div>

                    <div className="text-[11px] text-emerald-400 font-semibold">
                      Pemenang: <strong className="text-white">{m.winnerName}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. HADIAH */}
        {activeTab === 'hadiah' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-[#0c1426] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Total Hadiah Resmi</span>
                <div className="font-heading font-black text-3xl text-white mt-1">
                  Rp {tournament.prizePoolTotal.toLocaleString('id-ID')}
                </div>
              </div>
              <Trophy className="w-14 h-14 text-amber-400/40" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tournament.prizes?.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0c1426] border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{p.rank}</h4>
                      <p className="text-[11px] text-slate-400">{p.rewardText}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    Rp {p.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <TeamRegistrationModal
          tournament={tournament}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
};
