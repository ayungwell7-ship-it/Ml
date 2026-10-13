import React, { useState } from 'react';
import { Standing, Match } from '../../types';
import { Trophy, CheckCircle, Award } from 'lucide-react';

interface StandingsViewProps {
  tournamentId: string;
  standings: Standing[];
  matches: Match[];
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  tournamentId,
  standings,
  matches,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'standings' | 'results'>('standings');

  const tourStandings = standings
    .filter((s) => s.tournamentId === tournamentId)
    .sort((a, b) => b.won - a.won || a.lost - b.lost);

  const completedMatches = matches.filter(
    (m) => m.tournamentId === tournamentId && m.status === 'selesai' && !m.isBye
  );

  return (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('standings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'standings'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Klasemen Tim (W / L)
        </button>
        <button
          onClick={() => setActiveSubTab('results')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'results'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Hasil Pertandingan Resmi ({completedMatches.length})
        </button>
      </div>

      {activeSubTab === 'standings' ? (
        tourStandings.length === 0 ? (
          <div className="p-12 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">Klasemen Belum Tersedia</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Belum ada hasil pertandingan resmi yang selesai. Klasemen dengan statistik W (Win) dan L (Lose) akan otomatis diperbarui begitu admin menyimpan skor pertandingan.
            </p>
          </div>
        ) : (
          <div className="bg-[#0c1426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Table Header Description */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0d162a] to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="font-heading font-black text-white text-base tracking-wide">
                  Tabel Klasemen Turnamen
                </h4>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <strong>W:</strong> Menang (Win)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <strong>L:</strong> Kalah (Lose)
                </span>
              </div>
            </div>

            {/* Clean Minimalist Table: 1. Posisi, 2. Nama Tim, 3. W, 4. L */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090f1d] text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 text-center w-16">Posisi</th>
                    <th className="py-3 px-4">Nama Tim</th>
                    <th className="py-3 px-6 text-center w-28 text-emerald-400 font-black">
                      W (Win)
                    </th>
                    <th className="py-3 px-6 text-center w-28 text-rose-400 font-black">
                      L (Lose)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tourStandings.map((row, idx) => {
                    const position = idx + 1;
                    return (
                      <tr
                        key={row.id || row.teamName}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          position === 1 ? 'bg-amber-500/[0.04]' : ''
                        }`}
                      >
                        {/* 1. Posisi */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                              position === 1
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                                : position === 2
                                ? 'bg-slate-300 text-slate-950'
                                : position === 3
                                ? 'bg-amber-700 text-amber-100'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {position}
                          </span>
                        </td>

                        {/* 2. Nama Tim */}
                        <td className="py-3.5 px-4 font-bold text-white text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs overflow-hidden shrink-0">
                              {row.teamLogo ? (
                                <img
                                  src={row.teamLogo}
                                  alt={row.teamName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{row.teamName.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <span className="truncate">{row.teamName}</span>
                            {position === 1 && (
                              <Award className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* 3. W (Win) */}
                        <td className="py-3.5 px-6 text-center font-mono font-black text-sm text-emerald-400">
                          {row.won}
                        </td>

                        {/* 4. L (Lose) */}
                        <td className="py-3.5 px-6 text-center font-mono font-bold text-sm text-rose-400">
                          {row.lost}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              * Posisi dihitung otomatis dari W (Win) dan L (Lose). Pertandingan BYE (lolos otomatis) tidak dihitung.
            </div>
          </div>
        )
      ) : (
        /* Results SubTab */
        <div className="space-y-3">
          {completedMatches.length === 0 ? (
            <div className="p-12 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Belum ada hasil pertandingan resmi yang selesai.
            </div>
          ) : (
            completedMatches.map((match) => (
              <div
                key={match.id}
                className="bg-[#0c1426] border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="text-xs text-slate-400 font-medium">
                  <span className="text-amber-400 font-bold">{match.roundName}</span>
                  <span className="mx-2">•</span>
                  <span className="font-mono text-slate-300">{match.boFormat}</span>
                  {match.scheduledTime && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{match.scheduledTime}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-6 font-semibold text-sm">
                  <div
                    className={`text-right ${
                      match.winnerName === match.team1Name
                        ? 'text-amber-400 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {match.team1Name}
                  </div>

                  <div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-black text-sm tracking-widest shadow-inner">
                    {match.team1Score} - {match.team2Score}
                  </div>

                  <div
                    className={`text-left ${
                      match.winnerName === match.team2Name
                        ? 'text-amber-400 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {match.team2Name}
                  </div>
                </div>

                <div className="text-xs flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/50">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Pemenang: {match.winnerName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
