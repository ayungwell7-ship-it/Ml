export type UserRole = 'super_admin' | 'tournament_admin';

export type TournamentStatus =
  | 'akan_dibuka'
  | 'pendaftaran_dibuka'
  | 'pendaftaran_ditutup'
  | 'menunggu_pertandingan'
  | 'sedang_berlangsung'
  | 'selesai';

export type TournamentFormat =
  | 'Single Elimination'
  | 'Double Elimination'
  | 'Round Robin';

export type MatchBoFormat = 'Bo1' | 'Bo3' | 'Bo5' | 'Bo7';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus =
  | 'menunggu_pembayaran'
  | 'menunggu_konfirmasi'
  | 'terverifikasi'
  | 'ditolak';

export type MatchStatus =
  | 'menunggu_lawan'
  | 'terjadwal'
  | 'sedang_berlangsung'
  | 'selesai'
  | 'bye'
  | 'belum_dimulai';

export interface RoundBoConfig {
  round: number;
  roundName: string;
  boFormat: MatchBoFormat;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'tournament_admin';
  status: 'active' | 'inactive';
  tournamentsCount?: number;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface PlayerRosterItem {
  role: string; // Jungler, EXP Laner, Mid Laner, Gold Laner, Roamer
  nickname: string;
}

export interface PrizeBreakdown {
  rank: string; // "Juara 1", "Juara 2", "Juara 3", "MVP"
  amount: number;
  rewardText: string;
}

export interface Tournament {
  id: string;
  slug: string;
  title: string;
  adminId: string;
  organizerName: string;
  organizerLogo?: string;
  posterUrl: string;
  description: string;
  rules: string;
  startDate: string;
  endDate: string;
  regDeadline: string;
  maxSlots: number;
  format: TournamentFormat;
  matchFormat: MatchBoFormat; // Default format
  roundConfigs?: RoundBoConfig[]; // Format BO per babak
  entryFee: number; // 0 = Free
  prizePoolTotal: number;
  prizes?: PrizeBreakdown[];
  location: string; // "Online" or venue name
  whatsappAdmin: string; // Phone number for WA confirmation
  bankAccountInfo?: string; // Info rekening / e-wallet transfer
  status: TournamentStatus;
  isPublished: boolean;
  registeredCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Registration {
  id: string; // e.g. "REG-ML-8492"
  tournamentId: string;
  tournamentTitle: string;
  adminId: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  captainGameId?: string; // Opsional
  teamLogo?: string;
  mainPlayers: {
    jungler: string;
    expLaner: string;
    midLaner: string;
    goldLaner: string;
    roamer: string;
  };
  subPlayers?: {
    sub1?: string;
    sub2?: string;
  };
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  adminId: string;
  round: number;
  roundName: string;
  matchNumber: number;
  bracketType?: 'upper' | 'lower' | 'final' | 'round_robin';
  team1Id?: string;
  team1Name: string;
  team1Logo?: string;
  team1Score: number;
  team2Id?: string;
  team2Name: string;
  team2Logo?: string;
  team2Score: number;
  winnerId?: string;
  winnerName?: string;
  scheduledTime?: string;
  boFormat: MatchBoFormat;
  status: MatchStatus;
  isBye?: boolean;
  nextMatchId?: string;
  loserNextMatchId?: string; // For double elimination lower bracket
}

export interface Standing {
  id: string;
  tournamentId: string;
  group?: string;
  teamId?: string;
  teamName: string;
  teamLogo?: string;
  won: number; // W
  lost: number; // L
  played?: number;
  points?: number;
  scoreDiff?: number;
  position?: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  description: string;
  targetType: string;
  targetId?: string;
  createdAt: string;
}

export interface WebsiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  heroDescription: string;
  contactEmail: string;
  contactWhatsApp: string;
  discordUrl?: string;
  globalNotice?: string;
}
