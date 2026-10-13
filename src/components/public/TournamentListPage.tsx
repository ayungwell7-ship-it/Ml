import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Search,
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  Clock,
  Coins,
} from 'lucide-react';
import { Tournament, TournamentStatus } from '../../types';

export const TournamentListPage: React.FC = () => {
  const { tournaments, openTournamentDetail } = useTournament();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const publicTournaments = tournaments.filter((t) => t.isPublished);

  const filtered = publicTournaments.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.organizerName.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-wide">
          Semua Turnamen Mobile Legends
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Pilih turnamen dan daftarkan tim Anda langsung tanpa perlu login. Konfirmasi pembayaran praktis melalui WhatsApp admin.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0c1426] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama turnamen atau penyelenggara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-semibold"
            >
              <option value="all">Semua Status Turnamen</option>
              <option value="akan_dibuka">Akan Dibuka</option>
              <option value="pendaftaran_dibuka">Pendaftaran Dibuka</option>
              <option value="pendaftaran_ditutup">Pendaftaran Ditutup</option>
              <option value="menunggu_pertandingan">Menunggu Pertandingan</option>
              <option value="sedang_berlangsung">Sedang Berlangsung</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Quick Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pendaftaran_dibuka', label: 'Pendaftaran Dibuka' },
            { id: 'sedang_berlangsung', label: 'Sedang Berlangsung' },
            { id: 'selesai', label: 'Selesai' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === pill.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
          <span className="text-[11px] text-slate-500 ml-auto font-mono">
            {filtered.length} Turnamen Ditemukan
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="font-bold text-white text-base">Belum Ada Turnamen yang Sesuai</h4>
          <p className="text-xs">
            Saat ini belum ada turnamen dengan status yang dipilih. Silakan cek kembali dalam waktu dekat atau reset filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tour) => {
            const remaining = Math.max(0, tour.maxSlots - tour.registeredCount);
            return (
              <div
                key={tour.id}
                onClick={() => openTournamentDetail(tour.slug)}
                className="bg-[#0c1322] border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                {/* Poster */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={tour.posterUrl}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent"></div>

                  {/* Status Chip */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider backdrop-blur-md shadow-md ${getStatusBadgeStyle(tour.status)}`}>
                      {getStatusLabel(tour.status)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-slate-200 backdrop-blur-md border border-white/10">
                      Sisa {remaining} Slot
                    </span>
                  </div>
                </div>

                {/* Body Details */}
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

                  {/* CTA Button */}
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
    </div>
  );
};
