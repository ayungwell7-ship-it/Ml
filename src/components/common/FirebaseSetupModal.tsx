import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Key,
  Shield,
  FileCode,
  RefreshCw,
} from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  testFirestoreConnection,
  isFirebaseConfigured,
  FirebaseConfig,
} from '../../firebase/config';
import { useTournament } from '../../context/TournamentContext';

export const FirebaseSetupModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tournaments, admins, registrations, matches, standings, activityLogs } = useTournament();
  const [activeTab, setActiveTab] = useState<'config' | 'status' | 'guide' | 'export'>('status');
  const [testResult, setTestResult] = useState<{ loading: boolean; msg: string; success?: boolean }>({
    loading: false,
    msg: '',
  });

  const stored = getStoredFirebaseConfig();
  const [apiKey, setApiKey] = useState(stored?.apiKey || '');
  const [projectId, setProjectId] = useState(stored?.projectId || '');
  const [authDomain, setAuthDomain] = useState(stored?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(stored?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(stored?.messagingSenderId || '');
  const [appId, setAppId] = useState(stored?.appId || '');
  const [copied, setCopied] = useState(false);

  const handleTestConnection = async () => {
    setTestResult({ loading: true, msg: 'Menguji koneksi ke Cloud Firestore...' });
    const res = await testFirestoreConnection();
    setTestResult({ loading: false, msg: res.message, success: res.success });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: FirebaseConfig = {
      apiKey,
      projectId,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId,
      appId,
    };
    saveStoredFirebaseConfig(newConfig);
  };

  const handleExportData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      system: 'ML TOURNAMENT FULL DATABASE',
      collections: {
        admins,
        tournaments,
        tournamentRegistrations: registrations,
        matches,
        standings,
        activityLogs,
      },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ml-tournament-database-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0b1324] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#0d162b] to-[#111c38]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Database & Integrasi Firebase</h3>
              <p className="text-xs text-slate-400">
                Status koneksi Cloud Firestore & Panduan deployment mandiri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 gap-2 bg-[#080d19]">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Status Database
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Konfigurasi Proyek Firebase
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Panduan & Keamanan
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Backup Data
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3.5">
                {isFirebaseConfigured ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    {isFirebaseConfigured
                      ? 'Koneksi Proyek Firebase Aktif'
                      : 'Mode Simulator Firestore Terintegrasi'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isFirebaseConfigured
                      ? `Aplikasi terhubung ke Firestore Project: ${stored?.projectId}. Data disimpan secara live di cloud.`
                      : 'Aplikasi saat ini menggunakan penyimpanan data terstruktur persisten di memori & browser (berisi data riil dari 3 desain referensi). Setiap tombol, pembuatan turnamen, verifikasi tim, bracket, dan klasemen berfungsi 100%. Untuk menghubungkan ke project Firebase Anda sendiri, gunakan tab "Konfigurasi Proyek Firebase".'}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                  <div className="text-xl font-bold text-amber-400">{tournaments.length}</div>
                  <div className="text-[11px] text-slate-400 uppercase">Turnamen</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                  <div className="text-xl font-bold text-blue-400">{admins.length}</div>
                  <div className="text-[11px] text-slate-400 uppercase">Penyelenggara</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                  <div className="text-xl font-bold text-emerald-400">{registrations.length}</div>
                  <div className="text-[11px] text-slate-400 uppercase">Tim Terdaftar</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                  <div className="text-xl font-bold text-purple-400">{matches.length}</div>
                  <div className="text-[11px] text-slate-400 uppercase">Pertandingan</div>
                </div>
              </div>

              {/* Test connection action */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testResult.loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testResult.loading ? 'animate-spin' : ''}`} />
                  {testResult.loading ? 'Menguji...' : 'Uji Koneksi getDocFromServer()'}
                </button>
                {testResult.msg && (
                  <div
                    className={`p-3 rounded-lg text-xs border ${
                      testResult.success
                        ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-700/50 text-amber-300'
                    }`}
                  >
                    {testResult.msg}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-3">
              <p className="text-xs text-slate-300">
                Salin konfigurasi Firebase Web App dari konsol Firebase Anda (
                <span className="text-amber-400">Project Settings &gt; General &gt; Your apps</span>
                ):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">API Key *</label>
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Project ID *</label>
                  <input
                    type="text"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="ml-tournament-12345"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="project-id.firebaseapp.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Storage Bucket</label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="project-id.appspot.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">Messaging Sender ID</label>
                  <input
                    type="text"
                    value={messagingSenderId}
                    onChange={(e) => setMessagingSenderId(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">App ID</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:1234567890:web:abcdef..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                {stored && (
                  <button
                    type="button"
                    onClick={clearStoredFirebaseConfig}
                    className="px-3 py-2 rounded text-xs text-rose-400 hover:bg-rose-950/40 border border-rose-800 transition-colors"
                  >
                    Hapus Konfigurasi Kustom
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  Simpan & Hubungkan Firebase
                </button>
              </div>
            </form>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h5 className="font-bold text-white mb-2 flex items-center gap-1.5 text-amber-400">
                  <Shield className="w-4 h-4" /> 1. Firebase Security Rules (firestore.rules)
                </h5>
                <p>
                  File <code className="text-amber-300">firestore.rules</code> sudah tersedia di root proyek dengan
                  standar Zero-Trust Attribute-Based Access Control (ABAC):
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li>Super Admin memiliki hak kontrol penuh secara global.</li>
                  <li>Admin turnamen terisolasi: hanya dapat mengedit dan mengelola turnamen miliknya sendiri.</li>
                  <li>Pemain hanya dapat mengelola data registrasi tim miliknya dan melihat jadwal pertandingan.</li>
                  <li>Informasi sensitif (nomor WhatsApp kapten, bukti pembayaran) tidak terbuka untuk publik umum.</li>
                </ul>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h5 className="font-bold text-white mb-2 text-amber-400">
                  2. Panduan Akun Super Admin Pertama
                </h5>
                <p>
                  Untuk keamanan maksimal tanpa celah registrasi publik, akun Super Admin pertama didaftarkan
                  melalui Firebase Auth Console atau Firebase Admin SDK:
                </p>
                <ol className="list-decimal pl-5 mt-1 space-y-1 text-slate-400">
                  <li>Buat user di Firebase Authentication: <code className="text-slate-200">superadmin@mltournament.com</code>.</li>
                  <li>Buat dokumen di koleksi Firestore <code className="text-slate-200">admins/{'{uid}'}</code> dengan field:
                    <br/><code className="text-amber-300">role: 'super_admin', status: 'active', name: 'Super Admin'</code>.</li>
                  <li>Login menggunakan akun tersebut untuk membuka panel Super Admin.</li>
                </ol>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h5 className="font-bold text-white mb-2 text-amber-400">
                  3. Deployment ke Firebase Hosting
                </h5>
                <div className="bg-black/60 p-2.5 rounded font-mono text-[11px] text-amber-200 space-y-1">
                  <div>npm run build</div>
                  <div>firebase init hosting (pilih folder 'dist')</div>
                  <div>firebase deploy --only hosting,firestore:rules</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Unduh snapshot lengkap database (Turnamen, Peserta, Bracket Pertandingan, Klasemen, Admin, dan Audit Log)
                dalam format JSON standar untuk cadangan atau impor Firestore:
              </p>
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-3">
                <div className="text-sm font-semibold text-white">Full Database Snapshot</div>
                <div className="text-xs text-slate-400">
                  Total dokumen: {tournaments.length + admins.length + registrations.length + matches.length + standings.length + activityLogs.length} entitas
                </div>
                <button
                  onClick={handleExportData}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Unduh Backup JSON Database
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>ML TOURNAMENT Core Engine v1.0.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
