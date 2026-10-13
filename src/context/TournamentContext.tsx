import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminUser,
  Tournament,
  Registration,
  Match,
  Standing,
  ActivityLog,
  WebsiteSettings,
  TournamentStatus,
  TournamentFormat,
  MatchStatus,
  MatchBoFormat,
  PaymentStatus,
  RegistrationStatus,
  RoundBoConfig,
} from '../types';
import {
  INITIAL_ADMINS,
  INITIAL_TOURNAMENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_MATCHES,
  INITIAL_STANDINGS,
  INITIAL_ACTIVITIES,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { db, isFirebaseConfigured, auth } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

interface TournamentContextType {
  // Admin Authentication State
  currentAdmin: AdminUser | null;
  isAdminLoggedIn: boolean;
  loginAdmin: (identifier: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;

  // Collections
  admins: AdminUser[];
  tournaments: Tournament[];
  registrations: Registration[];
  matches: Match[];
  standings: Standing[];
  activityLogs: ActivityLog[];
  settings: WebsiteSettings;

  // Navigation
  currentView: 'public_home' | 'public_tournaments' | 'public_detail' | 'superadmin' | 'tournament_admin';
  selectedTournamentSlug: string | null;
  selectedAdminTournamentId: string | null;
  setCurrentView: (view: 'public_home' | 'public_tournaments' | 'public_detail' | 'superadmin' | 'tournament_admin') => void;
  openTournamentDetail: (slug: string) => void;
  openAdminTournamentDetail: (tournamentId: string) => void;
  backToAdminDashboard: () => void;

  // Public Actions
  registerTeamPublic: (
    tournamentId: string,
    formData: {
      teamName: string;
      captainName: string;
      captainPhone: string;
      captainGameId?: string;
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
    }
  ) => Promise<{ success: boolean; message: string; registration?: Registration }>;

  // Admin Actions (Strictly filtered by admin ownership or super admin)
  verifyPayment: (regId: string, paymentStatus: PaymentStatus, rejectionReason?: string) => Promise<void>;
  approveRegistration: (regId: string) => Promise<void>;
  rejectRegistration: (regId: string, reason: string) => Promise<void>;

  createTournament: (tournamentData: Partial<Tournament>) => Promise<Tournament>;
  updateTournament: (id: string, tournamentData: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;

  // Bracket & Match Progression Logic (BYE support, any team count >= 4)
  generateBracket: (tournamentId: string, format: TournamentFormat, customRoundConfigs?: any) => Promise<void>;
  inputMatchScore: (
    matchId: string,
    team1Score: number,
    team2Score: number,
    winnerName: string
  ) => Promise<void>;
  scheduleMatch: (matchId: string, scheduledTime: string) => Promise<void>;
  recalculateStandings: (tournamentId: string) => void;

  // Super Admin Management
  createAdminAccount: (data: { name: string; username: string; email: string; phone?: string; password?: string }) => Promise<AdminUser>;
  toggleAdminStatus: (adminId: string) => Promise<void>;
  deleteAdminAccount: (adminId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => Promise<void>;

  // Helpers
  addLog: (action: string, description: string, targetType: string, targetId?: string) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Purge legacy preview/demo data from browser storage for clean release
if (typeof window !== 'undefined') {
  try {
    const legacyPrefixes = ['ml_tour_v1_', 'ml_tour_v2_', 'ml_tournament_real_', 'ml_tournament_prod_release_'];
    legacyPrefixes.forEach((prefix) => {
      ['current_admin', 'admins', 'tournaments', 'registrations', 'matches', 'standings', 'logs', 'settings'].forEach((key) => {
        localStorage.removeItem(prefix + key);
      });
    });
  } catch (e) {
    // ignore in private browsing or disabled storage
  }
}

const STORAGE_KEY_PREFIX = 'ml_tour_syahrul_final_';

function loadStorage<T>(key: string, def: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Storage load error', e);
  }
  return def;
}

function saveStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication: Null initially unless logged in
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() =>
    loadStorage<AdminUser | null>('current_admin', null)
  );

  // Collections
  const [admins, setAdmins] = useState<AdminUser[]>(() =>
    loadStorage<AdminUser[]>('admins', INITIAL_ADMINS)
  );
  const [tournaments, setTournaments] = useState<Tournament[]>(() =>
    loadStorage<Tournament[]>('tournaments', INITIAL_TOURNAMENTS)
  );
  const [registrations, setRegistrations] = useState<Registration[]>(() =>
    loadStorage<Registration[]>('registrations', INITIAL_REGISTRATIONS)
  );
  const [matches, setMatches] = useState<Match[]>(() =>
    loadStorage<Match[]>('matches', INITIAL_MATCHES)
  );
  const [standings, setStandings] = useState<Standing[]>(() =>
    loadStorage<Standing[]>('standings', INITIAL_STANDINGS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadStorage<ActivityLog[]>('logs', INITIAL_ACTIVITIES)
  );
  const [settings, setSettings] = useState<WebsiteSettings>(() =>
    loadStorage<WebsiteSettings>('settings', INITIAL_SETTINGS)
  );

  // Navigation
  const [currentView, setCurrentView] = useState<'public_home' | 'public_tournaments' | 'public_detail' | 'superadmin' | 'tournament_admin'>('public_home');
  const [selectedTournamentSlug, setSelectedTournamentSlug] = useState<string | null>(null);
  const [selectedAdminTournamentId, setSelectedAdminTournamentId] = useState<string | null>(null);

  // Synchronize localStorage
  useEffect(() => saveStorage('current_admin', currentAdmin), [currentAdmin]);
  useEffect(() => saveStorage('admins', admins), [admins]);
  useEffect(() => saveStorage('tournaments', tournaments), [tournaments]);
  useEffect(() => saveStorage('registrations', registrations), [registrations]);
  useEffect(() => saveStorage('matches', matches), [matches]);
  useEffect(() => saveStorage('standings', standings), [standings]);
  useEffect(() => saveStorage('logs', activityLogs), [activityLogs]);
  useEffect(() => saveStorage('settings', settings), [settings]);

  // Firestore Live Listener
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    try {
      const unsubTournaments = onSnapshot(collection(db, 'tournaments'), (snap) => {
        if (!snap.empty) {
          const list: Tournament[] = [];
          snap.forEach((doc) => list.push(doc.data() as Tournament));
          setTournaments(list);
        }
      });

      const unsubRegistrations = onSnapshot(collection(db, 'tournamentRegistrations'), (snap) => {
        if (!snap.empty) {
          const list: Registration[] = [];
          snap.forEach((doc) => list.push(doc.data() as Registration));
          setRegistrations(list);
        }
      });

      const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => {
        if (!snap.empty) {
          const list: Match[] = [];
          snap.forEach((doc) => list.push(doc.data() as Match));
          setMatches(list);
        }
      });

      return () => {
        unsubTournaments();
        unsubRegistrations();
        unsubMatches();
      };
    } catch (e) {
      console.warn('Firestore live listener notice:', e);
    }
  }, []);

  const addLog = (action: string, description: string, targetType: string, targetId?: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      userId: currentAdmin?.id || 'guest',
      userName: currentAdmin?.name || 'Pengunjung Publik',
      role: currentAdmin?.role || 'guest',
      action,
      description,
      targetType,
      targetId,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'activityLogs', newLog.id), newLog).catch(console.error);
    }
  };

  // Login Admin
  const loginAdmin = async (identifier: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim().toLowerCase();

    // Check in admins list by username, name, or email
    const found = admins.find(
      (a) =>
        a.email.toLowerCase() === cleanId ||
        a.username.toLowerCase() === cleanId ||
        a.name.toLowerCase() === cleanId
    );

    if (!found) {
      return { success: false, message: 'Akun admin tidak ditemukan. Periksa email atau username.' };
    }

    if (found.status === 'inactive') {
      return { success: false, message: 'Akun admin ini sedang dinonaktifkan oleh Super Admin.' };
    }

    // Verify Password if set on account
    if (found.password && found.password !== pass.trim()) {
      return { success: false, message: 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.' };
    }

    setCurrentAdmin(found);
    if (found.role === 'super_admin') {
      setCurrentView('superadmin');
    } else {
      setCurrentView('tournament_admin');
    }
    addLog('login', `Admin ${found.name} berhasil masuk ke dashboard`, 'admin', found.id);
    return { success: true, message: 'Login berhasil!' };
  };

  const logoutAdmin = () => {
    if (currentAdmin) {
      addLog('logout', `Admin ${currentAdmin.name} keluar dari dashboard`, 'admin', currentAdmin.id);
    }
    setCurrentAdmin(null);
    setCurrentView('public_home');
    setSelectedAdminTournamentId(null);
  };

  const openTournamentDetail = (slug: string) => {
    setSelectedTournamentSlug(slug);
    setCurrentView('public_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAdminTournamentDetail = (tournamentId: string) => {
    setSelectedAdminTournamentId(tournamentId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToAdminDashboard = () => {
    setSelectedAdminTournamentId(null);
  };

  // Public Team Registration (NO LOGIN REQUIRED)
  const registerTeamPublic = async (
    tournamentId: string,
    formData: {
      teamName: string;
      captainName: string;
      captainPhone: string;
      captainGameId?: string;
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
    }
  ): Promise<{ success: boolean; message: string; registration?: Registration }> => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) {
      return { success: false, message: 'Turnamen tidak ditemukan.' };
    }

    if (tournament.status !== 'pendaftaran_dibuka') {
      return { success: false, message: 'Pendaftaran turnamen ini sedang ditutup atau belum dibuka.' };
    }

    if (tournament.registeredCount >= tournament.maxSlots) {
      return { success: false, message: 'Mohon maaf, slot pendaftaran turnamen ini sudah penuh.' };
    }

    // Check duplicate team name in this tournament
    const isDuplicate = registrations.some(
      (r) =>
        r.tournamentId === tournamentId &&
        r.teamName.trim().toLowerCase() === formData.teamName.trim().toLowerCase() &&
        r.status !== 'rejected'
    );

    if (isDuplicate) {
      return {
        success: false,
        message: `Nama tim "${formData.teamName}" sudah terdaftar pada turnamen ini. Gunakan nama tim lain.`,
      };
    }

    // Generate unique ID
    const regId = `REG-ML-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReg: Registration = {
      id: regId,
      tournamentId,
      tournamentTitle: tournament.title,
      adminId: tournament.adminId,
      teamName: formData.teamName.trim(),
      captainName: formData.captainName.trim(),
      captainPhone: formData.captainPhone.trim(),
      captainGameId: formData.captainGameId ? formData.captainGameId.trim() : undefined,
      teamLogo: formData.teamLogo,
      mainPlayers: formData.mainPlayers,
      subPlayers: formData.subPlayers,
      paymentStatus: 'menunggu_pembayaran',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [newReg, ...prev]);

    addLog(
      'register_team',
      `Tim ${newReg.teamName} (Kapten: ${newReg.captainName}) mendaftar pada ${tournament.title}`,
      'registration',
      regId
    );

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'tournamentRegistrations', regId), newReg).catch(console.error);
    }

    return {
      success: true,
      message: 'Pendaftaran berhasil dikirim! Silakan hubungi WhatsApp admin untuk konfirmasi pembayaran.',
      registration: newReg,
    };
  };

  // Admin: Verify Payment
  const verifyPayment = async (regId: string, paymentStatus: PaymentStatus, rejectionReason?: string) => {
    let target: Registration | undefined;

    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          target = {
            ...r,
            paymentStatus,
            rejectionReason: rejectionReason || r.rejectionReason,
            updatedAt: new Date().toISOString(),
          };
          return target;
        }
        return r;
      })
    );

    if (target) {
      addLog(
        'verify_payment',
        `Status pembayaran tim ${target.teamName} diubah menjadi "${paymentStatus.replace('_', ' ')}"`,
        'payment',
        regId
      );

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'tournamentRegistrations', regId), {
          paymentStatus,
          rejectionReason: rejectionReason || '',
          updatedAt: new Date().toISOString(),
        }).catch(console.error);
      }
    }
  };

  // Admin: Approve Registration (Tim resmi masuk turnamen)
  const approveRegistration = async (regId: string) => {
    let target: Registration | undefined;

    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          target = {
            ...r,
            status: 'approved',
            paymentStatus: 'terverifikasi',
            updatedAt: new Date().toISOString(),
          };
          return target;
        }
        return r;
      })
    );

    if (target) {
      // Increment tournament registeredCount
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === target!.tournamentId
            ? { ...t, registeredCount: t.registeredCount + 1 }
            : t
        )
      );

      addLog(
        'approve_team',
        `Tim ${target.teamName} disetujui menjadi peserta resmi pada ${target.tournamentTitle}`,
        'registration',
        regId
      );

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'tournamentRegistrations', regId), {
          status: 'approved',
          paymentStatus: 'terverifikasi',
          updatedAt: new Date().toISOString(),
        }).catch(console.error);
      }
    }
  };

  // Admin: Reject Registration
  const rejectRegistration = async (regId: string, reason: string) => {
    let target: Registration | undefined;

    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          target = {
            ...r,
            status: 'rejected',
            paymentStatus: 'ditolak',
            rejectionReason: reason,
            updatedAt: new Date().toISOString(),
          };
          return target;
        }
        return r;
      })
    );

    if (target) {
      // If was approved earlier, decrement count
      if (target.status === 'approved') {
        setTournaments((prev) =>
          prev.map((t) =>
            t.id === target!.tournamentId
              ? { ...t, registeredCount: Math.max(0, t.registeredCount - 1) }
              : t
          )
        );
      }

      addLog(
        'reject_team',
        `Tim ${target.teamName} ditolak pada ${target.tournamentTitle} (Alasan: ${reason})`,
        'registration',
        regId
      );

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'tournamentRegistrations', regId), {
          status: 'rejected',
          paymentStatus: 'ditolak',
          rejectionReason: reason,
          updatedAt: new Date().toISOString(),
        }).catch(console.error);
      }
    }
  };

  // Admin: Create Tournament
  const createTournament = async (data: Partial<Tournament>): Promise<Tournament> => {
    const id = 'tour-' + Date.now();
    const slug = (data.title || 'turnamen')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newTour: Tournament = {
      id,
      slug,
      title: data.title || 'Turnamen Baru',
      adminId: currentAdmin?.id || 'admin-rizky',
      organizerName: currentAdmin?.name || 'Admin Turnamen',
      organizerLogo: data.organizerLogo,
      posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      description: data.description || '',
      rules: data.rules || '1. Mode Custom Draft Pick 5v5.\n2. Taunting/toxic dilarang.',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      regDeadline: data.regDeadline || new Date().toISOString().split('T')[0],
      maxSlots: Number(data.maxSlots) || 16,
      format: data.format || 'Single Elimination',
      matchFormat: data.matchFormat || 'Bo3',
      entryFee: Number(data.entryFee) || 0,
      prizePoolTotal: Number(data.prizePoolTotal) || 0,
      prizes: data.prizes && data.prizes.length > 0 ? data.prizes : [
        { rank: 'Juara 1', amount: (Number(data.prizePoolTotal) || 5000000) * 0.5, rewardText: 'Juara 1' },
        { rank: 'Juara 2', amount: (Number(data.prizePoolTotal) || 5000000) * 0.3, rewardText: 'Juara 2' },
        { rank: 'Juara 3', amount: (Number(data.prizePoolTotal) || 5000000) * 0.2, rewardText: 'Juara 3' },
      ],
      location: data.location || 'Online',
      whatsappAdmin: data.whatsappAdmin || currentAdmin?.phone || '081234567890',
      status: data.status || 'pendaftaran_dibuka',
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTournaments((prev) => [newTour, ...prev]);

    // Increment admin tournament count
    setAdmins((prev) =>
      prev.map((a) => (a.id === currentAdmin?.id ? { ...a, tournamentsCount: (a.tournamentsCount || 0) + 1 } : a))
    );

    addLog('create_tournament', `Turnamen baru dibuat: ${newTour.title}`, 'tournament', newTour.id);

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'tournaments', newTour.id), newTour).catch(console.error);
    }

    return newTour;
  };

  const updateTournament = async (id: string, data: Partial<Tournament>) => {
    // Sesuai aturan: ketika status turnamen diubah menjadi selesai, turnamen otomatis terhapus
    if (data.status === 'selesai') {
      await deleteTournament(id);
      return;
    }

    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
    );

    const tour = tournaments.find((t) => t.id === id);
    addLog('update_tournament', `Turnamen diperbarui: ${tour?.title || id}`, 'tournament', id);

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'tournaments', id), { ...data, updatedAt: new Date().toISOString() }).catch(console.error);
    }
  };

  const deleteTournament = async (id: string) => {
    const tour = tournaments.find((t) => t.id === id);
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    setMatches((prev) => prev.filter((m) => m.tournamentId !== id));
    setRegistrations((prev) => prev.filter((r) => r.tournamentId !== id));
    setStandings((prev) => prev.filter((s) => s.tournamentId !== id));

    // Reset view if currently viewing deleted tournament
    setSelectedAdminTournamentId((prev) => (prev === id ? null : prev));
    setSelectedTournamentSlug((prev) => (prev === tour?.slug ? null : prev));

    addLog('delete_tournament', `Turnamen dihapus: ${tour?.title || id}`, 'tournament', id);

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'tournaments', id)).catch(console.error);
    }
  };

  // Standings Recalculator: Dynamically computes W & L from real completed matches (excluding BYE)
  const recalculateStandings = (tournamentId: string, specificMatches?: Match[]) => {
    const tourApproved = registrations.filter(
      (r) => r.tournamentId === tournamentId && r.status === 'approved'
    );
    const tourMatches = (specificMatches || matches).filter((m) => m.tournamentId === tournamentId);

    const statsMap = new Map<string, { won: number; lost: number; played: number; teamLogo?: string }>();
    tourApproved.forEach((t) => {
      statsMap.set(t.teamName, { won: 0, lost: 0, played: 0, teamLogo: t.teamLogo });
    });

    tourMatches.forEach((m) => {
      // Rule: BYE is NOT a played game and does not add W or L!
      if (m.status === 'selesai' && !m.isBye) {
        if (m.winnerName && statsMap.has(m.winnerName)) {
          const w = statsMap.get(m.winnerName)!;
          w.won += 1;
          w.played += 1;
        }
        const loserName = m.winnerName === m.team1Name ? m.team2Name : m.team1Name;
        if (loserName && statsMap.has(loserName) && loserName !== 'TBD' && !loserName.includes('BYE')) {
          const l = statsMap.get(loserName)!;
          l.lost += 1;
          l.played += 1;
        }
      }
    });

    const list: Standing[] = Array.from(statsMap.entries()).map(([teamName, s]) => ({
      id: `std-${tournamentId}-${teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      tournamentId,
      teamName,
      teamLogo: s.teamLogo,
      won: s.won,
      lost: s.lost,
      played: s.played,
      points: s.won * 3,
    }));

    // Sort by Win desc, then Lose asc
    list.sort((a, b) => b.won - a.won || a.lost - b.lost);
    list.forEach((item, idx) => {
      item.position = idx + 1;
    });

    setStandings((prev) => [
      ...prev.filter((s) => s.tournamentId !== tournamentId),
      ...list,
    ]);

    if (isFirebaseConfigured && db) {
      const firestoreDb = db;
      list.forEach((std) => {
        setDoc(doc(firestoreDb, 'standings', std.id), std).catch(console.error);
      });
    }
  };

  // Generate Bracket based on real approved teams only, supporting ANY team count >= 4 and BYE
  const generateBracket = async (
    tournamentId: string,
    format: TournamentFormat,
    customRoundConfigs?: RoundBoConfig[]
  ) => {
    const tour = tournaments.find((t) => t.id === tournamentId);
    if (!tour) return;

    // Check permission: Only tournament owner or Super Admin can generate bracket
    if (currentAdmin?.role !== 'super_admin' && tour.adminId !== currentAdmin?.id) {
      alert('Akses ditolak: Anda hanya dapat mengatur bracket untuk turnamen milik Anda sendiri.');
      return;
    }

    // Only approved teams are eligible!
    const approved = registrations.filter(
      (r) => r.tournamentId === tournamentId && r.status === 'approved'
    );

    if (approved.length < 4) {
      alert(`Minimal 4 tim yang disetujui (Approved) untuk membuat bagan bracket! Saat ini baru ada ${approved.length} tim.`);
      return;
    }

    const newMatches: Match[] = [];
    const teamCount = approved.length;

    // Smallest power of 2 >= teamCount (e.g. 4, 8, 16, 32, 64, 128)
    let bracketSize = 4;
    while (bracketSize < teamCount) {
      bracketSize *= 2;
    }

    const totalRounds = Math.log2(bracketSize);
    const round1Count = bracketSize / 2;
    const numByes = bracketSize - teamCount; // Number of teams receiving BYE in round 1

    const getBoForRound = (r: number): MatchBoFormat => {
      if (customRoundConfigs) {
        const found = customRoundConfigs.find((c) => c.round === r);
        if (found) return found.boFormat;
      }
      if (tour.roundConfigs) {
        const found = tour.roundConfigs.find((c) => c.round === r);
        if (found) return found.boFormat;
      }
      if (r === totalRounds) return 'Bo5';
      if (r === totalRounds - 1) return 'Bo3';
      return tour.matchFormat || 'Bo3';
    };

    const getRoundTitle = (r: number): string => {
      if (r === totalRounds) return 'Grand Final';
      if (r === totalRounds - 1) return 'Semifinal';
      if (r === totalRounds - 2) return 'Perempat Final';
      return `Babak ${r}`;
    };

    let matchCounter = 1;

    // 1. ROUND 1 GENERATION
    // The first numByes matches will have 1 team vs BYE
    // The remaining (round1Count - numByes) matches will have 2 teams
    const round1Matches: Match[] = [];

    for (let i = 0; i < round1Count; i++) {
      const isByeMatch = i < numByes;
      let team1: Registration | null = null;
      let team2: Registration | null = null;

      if (isByeMatch) {
        team1 = approved[i];
        team2 = null;
      } else {
        const offset = numByes + (i - numByes) * 2;
        team1 = approved[offset] || null;
        team2 = approved[offset + 1] || null;
      }

      const matchId = `m-${tournamentId}-r1-${i + 1}`;
      const bo = getBoForRound(1);

      round1Matches.push({
        id: matchId,
        tournamentId,
        adminId: tour.adminId,
        round: 1,
        roundName: getRoundTitle(1),
        matchNumber: matchCounter++,
        bracketType: 'upper',
        team1Id: team1?.id,
        team1Name: team1 ? team1.teamName : 'TBD',
        team1Logo: team1?.teamLogo,
        team1Score: 0,
        team2Id: team2?.id,
        team2Name: isByeMatch ? 'BYE (Lolos Otomatis)' : team2 ? team2.teamName : 'TBD',
        team2Logo: team2?.teamLogo,
        team2Score: 0,
        winnerId: isByeMatch ? team1?.id : undefined,
        winnerName: isByeMatch ? team1?.teamName : undefined,
        boFormat: bo,
        status: isByeMatch ? 'bye' : 'terjadwal',
        isBye: isByeMatch,
      });
    }

    newMatches.push(...round1Matches);

    // 2. SUBSEQUENT ROUNDS GENERATION (up to Grand Final)
    let prevRoundMatches = round1Matches;

    for (let r = 2; r <= totalRounds; r++) {
      const nextRoundCount = prevRoundMatches.length / 2;
      const currentRoundMatches: Match[] = [];
      const bo = getBoForRound(r);
      const roundName = getRoundTitle(r);
      const isLastRound = r === totalRounds;

      for (let i = 0; i < nextRoundCount; i++) {
        const matchId = `m-${tournamentId}-r${r}-${i + 1}`;
        const parent1 = prevRoundMatches[i * 2];
        const parent2 = prevRoundMatches[i * 2 + 1];

        if (parent1) parent1.nextMatchId = matchId;
        if (parent2) parent2.nextMatchId = matchId;

        // If parent match had a BYE winner already, propagate it directly!
        const t1Name = parent1?.winnerName || `Pemenang Match #${parent1?.matchNumber}`;
        const t1Id = parent1?.winnerId;
        const t2Name = parent2?.winnerName || `Pemenang Match #${parent2?.matchNumber}`;
        const t2Id = parent2?.winnerId;

        const bothTeamsKnown = Boolean(parent1?.winnerName && parent2?.winnerName);

        currentRoundMatches.push({
          id: matchId,
          tournamentId,
          adminId: tour.adminId,
          round: r,
          roundName,
          matchNumber: matchCounter++,
          bracketType: isLastRound ? 'final' : 'upper',
          team1Id: t1Id,
          team1Name: t1Name,
          team1Score: 0,
          team2Id: t2Id,
          team2Name: t2Name,
          team2Score: 0,
          boFormat: bo,
          status: bothTeamsKnown ? 'terjadwal' : 'menunggu_lawan',
          isBye: false,
        });
      }

      newMatches.push(...currentRoundMatches);
      prevRoundMatches = currentRoundMatches;
    }

    // Replace matches in state for this tournament
    setMatches((prev) => [
      ...prev.filter((m) => m.tournamentId !== tournamentId),
      ...newMatches,
    ]);

    // Initialize or recalculate standings (0 W, 0 L since BYEs are excluded)
    recalculateStandings(tournamentId, newMatches);

    // Update tournament status and round configs
    await updateTournament(tournamentId, {
      status: 'sedang_berlangsung',
      roundConfigs: customRoundConfigs || tour.roundConfigs,
    });

    addLog(
      'generate_bracket',
      `Bagan bracket resmi dibuat untuk turnamen ${tour.title} (${approved.length} tim, ${numByes} BYE, format ${format})`,
      'bracket',
      tournamentId
    );

    if (isFirebaseConfigured && db) {
      const firestoreDb = db;
      newMatches.forEach((m) => {
        setDoc(doc(firestoreDb, 'matches', m.id), m).catch(console.error);
      });
    }
  };

  // Admin: Input Match Score & Advance Bracket Winners
  const inputMatchScore = async (
    matchId: string,
    team1Score: number,
    team2Score: number,
    winnerName: string
  ) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    // Strict Authorization: Only tournament owner or Super Admin
    if (currentAdmin?.role !== 'super_admin' && targetMatch.adminId !== currentAdmin?.id) {
      console.warn('Akses ditolak: Hanya pemilik turnamen atau Super Admin yang dapat memasukkan skor.');
      return;
    }

    if (targetMatch.isBye) {
      console.warn('Pertandingan BYE tidak memerlukan input skor.');
      return;
    }

    if (team1Score === team2Score) {
      console.warn('Pertandingan Mobile Legends tidak boleh berakhir seri.');
      return;
    }

    const winnerId =
      winnerName === targetMatch.team1Name ? targetMatch.team1Id : targetMatch.team2Id;

    let updatedMatchesList: Match[] = [];

    setMatches((prev) => {
      const nextList = prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            team1Score,
            team2Score,
            winnerName,
            winnerId,
            status: 'selesai' as MatchStatus,
          };
        }
        return m;
      });

      // Advance winner to nextMatchId
      if (targetMatch.nextMatchId) {
        const nextId = targetMatch.nextMatchId;
        const parentMatches = nextList.filter((m) => m.nextMatchId === nextId);
        const isFirstFeeder = parentMatches[0]?.id === matchId;

        const updated = nextList.map((m) => {
          if (m.id === nextId) {
            let newT1Name = m.team1Name;
            let newT1Id = m.team1Id;
            let newT2Name = m.team2Name;
            let newT2Id = m.team2Id;

            if (isFirstFeeder) {
              newT1Name = winnerName;
              newT1Id = winnerId;
            } else {
              newT2Name = winnerName;
              newT2Id = winnerId;
            }

            const bothKnown =
              !newT1Name.includes('Pemenang') &&
              newT1Name !== 'TBD' &&
              !newT2Name.includes('Pemenang') &&
              newT2Name !== 'TBD';

            return {
              ...m,
              team1Name: newT1Name,
              team1Id: newT1Id,
              team2Name: newT2Name,
              team2Id: newT2Id,
              status: bothKnown ? ('terjadwal' as MatchStatus) : ('menunggu_lawan' as MatchStatus),
            };
          }
          return m;
        });

        updatedMatchesList = updated;
        return updated;
      }

      updatedMatchesList = nextList;
      return nextList;
    });

    // Recompute standings for this tournament immediately (W and L update automatically)
    setTimeout(() => {
      recalculateStandings(targetMatch.tournamentId, updatedMatchesList.length > 0 ? updatedMatchesList : matches);
    }, 50);

    addLog(
      'input_score',
      `Hasil pertandingan #${targetMatch.matchNumber} disimpan: ${targetMatch.team1Name} (${team1Score}) vs (${team2Score}) ${targetMatch.team2Name}. Pemenang: ${winnerName}`,
      'match',
      matchId
    );

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'matches', matchId), {
        team1Score,
        team2Score,
        winnerName,
        winnerId,
        status: 'selesai',
      }).catch(console.error);

      if (targetMatch.nextMatchId) {
        const nextM = updatedMatchesList.find((m) => m.id === targetMatch.nextMatchId);
        if (nextM) {
          await updateDoc(doc(db, 'matches', nextM.id), {
            team1Name: nextM.team1Name,
            team1Id: nextM.team1Id,
            team2Name: nextM.team2Name,
            team2Id: nextM.team2Id,
            status: nextM.status,
          }).catch(console.error);
        }
      }
    }
  };

  const scheduleMatch = async (matchId: string, scheduledTime: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    if (currentAdmin?.role !== 'super_admin' && target.adminId !== currentAdmin?.id) {
      console.warn('Akses ditolak: Hanya pemilik turnamen atau Super Admin yang dapat mengatur jadwal.');
      return;
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, scheduledTime } : m))
    );

    addLog('schedule_match', `Jadwal pertandingan #${target.matchNumber} diatur: ${scheduledTime}`, 'match', matchId);

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'matches', matchId), { scheduledTime }).catch(console.error);
    }
  };

  // Super Admin: Create Admin Account
  const createAdminAccount = async (data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    password?: string;
  }): Promise<AdminUser> => {
    const id = 'admin-' + Date.now();
    const newAdmin: AdminUser = {
      id,
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password || 'admin123',
      role: 'tournament_admin',
      status: 'active',
      tournamentsCount: 0,
      phone: data.phone || '081234567890',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAdmins((prev) => [newAdmin, ...prev]);

    addLog('create_admin', `Akun Admin Turnamen baru dibuat: ${newAdmin.name} (@${newAdmin.username})`, 'admin', id);

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'admins', id), newAdmin).catch(console.error);
    }

    return newAdmin;
  };

  const toggleAdminStatus = async (adminId: string) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a))
    );
    const adm = admins.find((a) => a.id === adminId);
    addLog('toggle_admin', `Status admin ${adm?.name} diubah`, 'admin', adminId);

    if (isFirebaseConfigured && db) {
      const nextStatus = adm?.status === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'admins', adminId), { status: nextStatus }).catch(console.error);
    }
  };

  const deleteAdminAccount = async (adminId: string) => {
    const adm = admins.find((a) => a.id === adminId);
    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    addLog('delete_admin', `Admin dihapus: ${adm?.name}`, 'admin', adminId);

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'admins', adminId)).catch(console.error);
    }
  };

  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addLog('update_settings', `Pengaturan website disimpan oleh Super Admin`, 'settings', 'global');

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'websiteSettings', 'global'), newSettings).catch(console.error);
    }
  };

  return (
    <TournamentContext.Provider
      value={{
        currentAdmin,
        isAdminLoggedIn: currentAdmin !== null,
        loginAdmin,
        logoutAdmin,
        admins,
        tournaments,
        registrations,
        matches,
        standings,
        activityLogs,
        settings,
        currentView,
        selectedTournamentSlug,
        selectedAdminTournamentId,
        setCurrentView,
        openTournamentDetail,
        openAdminTournamentDetail,
        backToAdminDashboard,
        registerTeamPublic,
        verifyPayment,
        approveRegistration,
        rejectRegistration,
        createTournament,
        updateTournament,
        deleteTournament,
        generateBracket,
        inputMatchScore,
        scheduleMatch,
        recalculateStandings,
        createAdminAccount,
        toggleAdminStatus,
        deleteAdminAccount,
        updateSettings,
        addLog,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
