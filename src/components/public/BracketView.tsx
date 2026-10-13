import React, { useState } from 'react';
import { Match } from '../../types';
import { Trophy, CheckCircle, ChevronRight, Edit3, Sparkles } from 'lucide-react';

interface BracketViewProps {
  tournamentId: string;
  matches: Match[];
  isAdmin?: boolean;
  onEditMatch?: (match: Match) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({
  tournamentId,
  matches,
  isAdmin = false,
  onEditMatch,
}) => {
  const tournamentMatches = matches.filter((m) => m.tournamentId === tournamentId);

  // Group rounds dynamically
  const roundNumbers = Array.from(new Set(tournamentMatches.map((m) => m.round))).sort(
    (a, b) => a - b
  );

  const maxRound = roundNumbers.length > 0 ? Math.max(...roundNumbers) : 1;
  const finalMatch = tournamentMatches.find((m) => m.round === maxRound);
  const championName =
    finalMatch && finalMatch.status === 'selesai' ? finalMatch.winnerName : null;

  return (
    <div className="space-y-6">
      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1426] p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Hijau: Tim Pemenang Lolos</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            <span>Biru: Lolos Otomatis (BYE)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Kuning: Format Game (BO1/BO3/BO5/BO7)</span>
          </div>
        </div>

        {isAdmin && (
          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Klik kartu pertandingan untuk memasukkan skor</span>
          </div>
        )}
      </div>

      {tournamentMatches.length === 0 ? (
        <div className="p-16 text-center bg-[#0c1426] rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h4 className="font-heading font-black text-white text-lg">Bagan Bracket Belum Dibuat</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bagan pertandingan akan dibuat otomatis oleh panitia turnamen setelah kuota peserta diverifikasi.
          </p>
        </div>
      ) : (
        /* Visual Tree Bracket with smooth horizontal scroll */
        <div className="overflow-x-auto pb-6 pt-2">
          <div className="min-w-[900px] flex items-stretch gap-6 px-2">
            {roundNumbers.map((r, rIdx) => {
              const roundMatches = tournamentMatches
                .filter((m) => m.round === r)
                .sort((a, b) => a.matchNumber - b.matchNumber);

              const isGrandFinal = r === maxRound;
              const roundTitle =
                roundMatches[0]?.roundName ||
                (isGrandFinal ? 'Grand Final' : r === maxRound - 1 ? 'Semifinal' : `Babak ${r}`);

              return (
                <React.Fragment key={r}>
                  {/* Round Column */}
                  <div className="flex-1 flex flex-col min-w-[260px] max-w-[340px]">
                    {/* Round Header */}
                    <div className="text-center pb-3 border-b border-slate-800 mb-4 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
                      <div className="font-heading font-black text-sm tracking-wider text-amber-400 uppercase">
                        {roundTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {roundMatches[0]?.boFormat || 'BO3'} • {roundMatches.length} Pertandingan
                      </div>
                    </div>

                    {/* Round Matches Column */}
                    <div className="flex-1 flex flex-col justify-around gap-4">
                      {roundMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          isFinal={isGrandFinal}
                          isAdmin={isAdmin}
                          onEditMatch={onEditMatch}
                        />
                      ))}
                    </div>

                    {/* Grand Champion Box if this is final round and champion is decided */}
                    {isGrandFinal && championName && (
                      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500/25 via-slate-900 to-[#0c1426] border border-amber-400/50 text-center animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 mx-auto flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40 mb-2">
                          <Trophy className="w-6 h-6 fill-slate-950" />
                        </div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>JUARA TURNAMEN</span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        </div>
                        <div className="font-heading font-black text-2xl text-white tracking-wide mt-1">
                          {championName}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow Connector between rounds */}
                  {rIdx < roundNumbers.length - 1 && (
                    <div className="flex items-center justify-center text-slate-600 px-1">
                      <ChevronRight className="w-6 h-6 text-slate-600 shrink-0" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface MatchCardProps {
  match: Match;
  isFinal?: boolean;
  isAdmin?: boolean;
  onEditMatch?: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isFinal, isAdmin, onEditMatch }) => {
  const isTeam1Winner = match.winnerName && match.winnerName === match.team1Name;
  const isTeam2Winner = match.winnerName && match.winnerName === match.team2Name;

  const canEdit =
    isAdmin &&
    !match.isBye &&
    match.status !== 'menunggu_lawan' &&
    match.team1Name &&
    match.team2Name &&
    !match.team1Name.includes('Pemenang') &&
    !match.team2Name.includes('Pemenang');

  return (
    <div
      onClick={() => canEdit && onEditMatch && onEditMatch(match)}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden relative shadow-md ${
        canEdit
          ? 'cursor-pointer hover:border-amber-400 hover:shadow-amber-500/10 hover:scale-[1.01]'
          : ''
      } ${
        isFinal
          ? 'bg-gradient-to-b from-[#14203a] to-[#0c1426] border-amber-500/40'
          : match.isBye
          ? 'bg-[#0d1627] border-blue-900/60'
          : 'bg-[#0c1324] border-slate-800'
      }`}
    >
      {/* Top Header info */}
      <div className="px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-slate-300 font-bold">#{match.matchNumber}</span>
          <span>•</span>
          <span className="font-bold text-amber-400 font-mono">{match.boFormat}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {match.isBye ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
              Lolos Otomatis (BYE)
            </span>
          ) : match.status === 'selesai' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5" /> Selesai
            </span>
          ) : match.status === 'menunggu_lawan' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
              Menunggu Lawan
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {match.scheduledTime || 'Terjadwal'}
            </span>
          )}

          {canEdit && (
            <span className="p-1 rounded bg-slate-800 text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-colors ml-1" title="Input Skor">
              <Edit3 className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Teams and Scores list */}
      <div className="p-2.5 space-y-1.5">
        {/* Team 1 Slot */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
            isTeam1Winner
              ? 'bg-emerald-950/50 border border-emerald-600/50 text-emerald-200 font-bold'
              : 'bg-slate-900/60 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isTeam1Winner ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            ></span>
            <span className="truncate text-xs font-semibold">
              {match.team1Name || 'TBD'}
            </span>
          </div>

          {!match.isBye && (
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black ${
                isTeam1Winner
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {match.team1Score ?? 0}
            </span>
          )}
        </div>

        {/* Team 2 Slot */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
            isTeam2Winner
              ? 'bg-emerald-950/50 border border-emerald-600/50 text-emerald-200 font-bold'
              : match.isBye
              ? 'bg-blue-950/20 border border-blue-900/30 text-blue-300 italic'
              : 'bg-slate-900/60 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isTeam2Winner
                  ? 'bg-emerald-400 animate-pulse'
                  : match.isBye
                  ? 'bg-blue-400'
                  : 'bg-slate-600'
              }`}
            ></span>
            <span className="truncate text-xs font-semibold">
              {match.team2Name || 'TBD'}
            </span>
          </div>

          {!match.isBye && (
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black ${
                isTeam2Winner
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {match.team2Score ?? 0}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
