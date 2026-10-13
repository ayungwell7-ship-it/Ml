import {
  AdminUser,
  Tournament,
  Registration,
  Match,
  Standing,
  ActivityLog,
  WebsiteSettings,
} from '../types';

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-super-syahrul',
    name: 'Syahrul Gunawan',
    username: 'Syahrul Gunawan',
    email: 'ayungwell7@gmail.com',
    password: 'Arul_070608',
    role: 'super_admin',
    status: 'active',
    phone: '081234567890',
    createdAt: new Date().toISOString().split('T')[0],
  },
];

// All tournaments, registrations, matches, and standings are empty for production publish
export const INITIAL_TOURNAMENTS: Tournament[] = [];
export const INITIAL_REGISTRATIONS: Registration[] = [];
export const INITIAL_MATCHES: Match[] = [];
export const INITIAL_STANDINGS: Standing[] = [];
export const INITIAL_ACTIVITIES: ActivityLog[] = [];

export const INITIAL_SETTINGS: WebsiteSettings = {
  id: 'global',
  siteName: 'ML TOURNAMENT',
  tagline: 'Platform Turnamen Mobile Legends Resmi & Terpercaya',
  heroDescription: 'Platform turnamen esports Mobile Legends profesional. Daftar tim secara langsung, ikuti pertandingan kompetitif, dan raih prestasi di Land of Dawn!',
  contactEmail: 'ayungwell7@gmail.com',
  contactWhatsApp: '',
  discordUrl: '',
  globalNotice: '',
};
