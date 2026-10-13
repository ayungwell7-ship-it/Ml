import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Users,
  Coins,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TournamentStatus } from '../../types';

export const HomePage: React.FC = () => {
  const { tournaments, setCurrentView, openTournamentDetail, settings } = useTournament();

  const publicTournaments = tournaments.filter((t) => t.isPublished);

  const getStatusLabel = (status: TournamentStatus) => {
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
    }
  };

  const getStatusBadgeStyle = (status: TournamentStatus) => {
    switch (status) {
      case 'pendaftaran_dibuka':
        return 'bg-emerald-500/90 text-slate-950 font-black';
      case 'sedang_berlangsung':
        return 'bg-amber-500/90 text-slate-950 font-black';
      case 'selesai':
        return 'bg-blue-600/90 text-white font-bold';
      case 'pendaftaran_ditutup':
        return 'bg-rose-600/90 text-white font-bold';
      case 'menunggu_pertandingan':
        return 'bg-purple-600/90 text-white font-bold';
      default:
        return 'bg-slate-700/90 text-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e172e] via-[#091022] to-[#070b14] border-b border-slate-800/80 pt-12 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-3 duration-500">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Platform Turnamen Esports Mobile Legends</span>
          </div>

          {/* Heading */}
          <div className="max-w-3xl space-y-4">
            <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-none">
              Tantang Batasmu di Setiap <span className="gold-gradient-text">Turnamen</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {settings.heroDescription ||
                'Platform turnamen Mobile Legends untuk semua tim. Daftar tim secara langsung tanpa ribet, bertanding secara sportif, dan raih hadiah jutaan rupiah!'}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setCurrentView('public_tournaments')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Lihat Turnamen</span>
            </button>
            <button
              onClick={() => setCurrentView('public_tournaments')}
              className="px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm tracking-wide transition-all"
            >
              Semua Turnamen
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED TOURNAMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
              Turnamen Unggulan
            </h2>
            <p className="text-xs text-slate-400">
              Pilihan turnamen resmi yang sedang membuka pendaftaran
            </p>
          </div>

          <button
            onClick={() => setCurrentView('public_tournaments')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>Semua Turnamen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {publicTournaments.length === 0 ? (
          <div className="p-16 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 space-y-3">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="font-bold text-white text-base">Belum Ada Turnamen yang Tersedia</h4>
            <p className="text-xs">
              Saat ini belum ada turnamen yang dipublikasikan oleh penyelenggara. Silakan cek kembali nanti!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicTournaments.map((tour) => {
              const remaining = Math.max(0, tour.maxSlots - tour.registeredCount);
              return (
                <div
                  key={tour.id}
                  onClick={() => openTournamentDetail(tour.slug)}
                  className="bg-[#0c1322] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-48 w-full relative overflow-hidden bg-slate-900">
                    <img
                      src={tour.posterUrl}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent"></div>

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider backdrop-blur-md shadow-md ${getStatusBadgeStyle(tour.status)}`}>
                        {getStatusLabel(tour.status)}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-slate-200 backdrop-blur-md border border-white/10">
                        Sisa {remaining} Slot
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="font-heading font-black text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {tour.title}
                      </h3>

                      <div className="text-xs text-slate-400">
                        Penyelenggara: <strong className="text-slate-300 font-semibold">{tour.organizerName}</strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Tanggal Pertandingan</span>
                          <span className="font-mono">{tour.startDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Batas Pendaftaran</span>
                          <span className="font-mono text-amber-300">{tour.regDeadline}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Biaya Pendaftaran</span>
                          <span className="font-semibold text-emerald-400">
                            {tour.entryFee === 0 ? 'Gratis' : `Rp ${tour.entryFee.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Hadiah</span>
                          <span className="font-bold text-amber-400 font-mono">
                            Rp {tour.prizePoolTotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTournamentDetail(tour.slug);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* COMMUNITY CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-amber-600/20 via-[#101b33] to-[#0d162a] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Turnamen Terverifikasi & Resmi
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Daftarkan Tim Mobile Legends Anda Sekarang
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bertanding secara adil tanpa joki, dapatkan e-certificate dan piala juara, serta rasakan keseruan kompetisi tingkat nasional.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('public_tournaments')}
            className="shrink-0 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
          >
            Lihat Semua Turnamen
          </button>
        </div>
      </section>
    </div>
  );
};
