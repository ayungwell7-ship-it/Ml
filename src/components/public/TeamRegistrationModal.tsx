import React, { useState } from 'react';
import { Tournament, Registration } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import {
  X,
  Trophy,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface TeamRegistrationModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const TeamRegistrationModal: React.FC<TeamRegistrationModalProps> = ({
  tournament,
  onClose,
}) => {
  const { registerTeamPublic } = useTournament();

  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdReg, setCreatedReg] = useState<Registration | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Form State: Data Tim
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainGameId, setCaptainGameId] = useState('');
  const [teamLogo, setTeamLogo] = useState('');

  // Form State: Roster 5 Main Nicknames & Optional 2 Subs
  const [jungler, setJungler] = useState('');
  const [expLaner, setExpLaner] = useState('');
  const [midLaner, setMidLaner] = useState('');
  const [goldLaner, setGoldLaner] = useState('');
  const [roamer, setRoamer] = useState('');
  const [sub1, setSub1] = useState('');
  const [sub2, setSub2] = useState('');

  // Agreement
  const [agreeRules, setAgreeRules] = useState(false);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!teamName.trim() || !captainName.trim() || !captainPhone.trim() || !captainGameId.trim()) {
      setErrorMsg('Harap lengkapi semua bidang bertanda bintang (*).');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!jungler.trim() || !expLaner.trim() || !midLaner.trim() || !goldLaner.trim() || !roamer.trim()) {
      setErrorMsg('Kelima nickname pemain utama (Jungler, EXP, Mid, Gold, Roamer) wajib diisi.');
      return;
    }
    setStep(3);
  };

  const handleSubmitRegistration = async () => {
    if (!agreeRules) {
      setErrorMsg('Anda wajib menyetujui peraturan turnamen untuk melanjutkan.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await registerTeamPublic(tournament.id, {
        teamName,
        captainName,
        captainPhone,
        captainGameId,
        teamLogo: teamLogo || undefined,
        mainPlayers: {
          jungler,
          expLaner,
          midLaner,
          goldLaner,
          roamer,
        },
        subPlayers: {
          sub1: sub1.trim() || undefined,
          sub2: sub2.trim() || undefined,
        },
      });

      if (res.success && res.registration) {
        setCreatedReg(res.registration);
        setStep('success');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Gagal mengirim pendaftaran. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp redirection
  const getWhatsAppUrl = () => {
    if (!createdReg) return '#';

    // Clean phone number: 081234 -> 6281234
    let cleanPhone = tournament.whatsappAdmin.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const message = `Halo Admin, saya ingin melakukan konfirmasi pembayaran pendaftaran turnamen.

Nama turnamen: ${tournament.title}
ID Pendaftaran: ${createdReg.id}
Nama tim: ${createdReg.teamName}
Nama kapten: ${createdReg.captainName}
Biaya pendaftaran: Rp${tournament.entryFee.toLocaleString('id-ID')}

Saya akan mengirimkan bukti transfer melalui chat ini. Mohon diperiksa. Terima kasih.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyRegId = () => {
    if (createdReg) {
      navigator.clipboard.writeText(createdReg.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0b1324] border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#0d162b] to-[#121e3b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Formulir Pendaftaran Tim</h3>
              <p className="text-xs text-amber-400 font-medium truncate max-w-sm">
                {tournament.title} • Biaya: {tournament.entryFee === 0 ? 'Gratis' : `Rp ${tournament.entryFee.toLocaleString('id-ID')}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper (if not in success screen) */}
        {step !== 'success' && (
          <div className="px-6 py-3 bg-[#080d19] border-b border-slate-800/80 flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800'}`}>1</span>
              <span>Data Tim</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-800"></div>

            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800'}`}>2</span>
              <span>Roster MLBB</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-800"></div>

            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800'}`}>3</span>
              <span>Konfirmasi</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: DATA TIM */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Tim Esports *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Contoh: Shadow Legends, Tiger Force"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Kapten Tim *</label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="Nama asli kapten"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp Kapten *</label>
                  <input
                    type="tel"
                    required
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="081234567890 (Untuk koordinasi match)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ID Game Mobile Legends Kapten *
                </label>
                <input
                  type="text"
                  required
                  value={captainGameId}
                  onChange={(e) => setCaptainGameId(e.target.value)}
                  placeholder="Contoh: 12345678"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Hanya kapten yang wajib menyertakan ID Game MLBB. Pemain lain cukup mengisi nickname.
                </span>
              </div>

              {/* Logo Tim Picker */}
              <ImageUploadPicker
                label="Logo Tim (Opsional)"
                sublabel="Pilih logo tim dari galeri HP atau komputer"
                value={teamLogo}
                onChange={setTeamLogo}
              />

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <span>Lanjut: Roster Pemain</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ROSTER PEMAIN (5 UTAMA DENGAN NICKNAME + 2 CADANGAN) */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>5 Pemain Utama (Nickname Mobile Legends) *</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Masukkan nickname akun Mobile Legends untuk masing-masing role:
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { role: 'Jungler', val: jungler, set: setJungler, placeholder: 'Nickname Jungler' },
                  { role: 'EXP Laner', val: expLaner, set: setExpLaner, placeholder: 'Nickname EXP Laner' },
                  { role: 'Mid Laner', val: midLaner, set: setMidLaner, placeholder: 'Nickname Mid Laner' },
                  { role: 'Gold Laner', val: goldLaner, set: setGoldLaner, placeholder: 'Nickname Gold Laner' },
                  { role: 'Roamer', val: roamer, set: setRoamer, placeholder: 'Nickname Roamer' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <span className="w-24 text-[11px] font-bold text-amber-400 shrink-0">
                      {idx + 1}. {item.role}
                    </span>
                    <input
                      type="text"
                      required
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      placeholder={item.placeholder}
                      className="flex-1 px-3 py-1.5 bg-[#080d19] border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <div className="font-bold text-slate-300 text-[11px]">Pemain Cadangan (Maksimal 2, Opsional):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sub1}
                    onChange={(e) => setSub1(e.target.value)}
                    placeholder="Nickname Cadangan 1 (Opsional)"
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={sub2}
                    onChange={(e) => setSub2(e.target.value)}
                    placeholder="Nickname Cadangan 2 (Opsional)"
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <span>Lanjut: Konfirmasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: KONFIRMASI DATA */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Turnamen:</span>
                  <strong className="text-white">{tournament.title}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Nama Tim:</span>
                  <strong className="text-amber-400">{teamName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Kapten:</span>
                  <span className="text-white">{captainName} ({captainPhone})</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ID Game Kapten:</span>
                  <span className="text-white font-mono">{captainGameId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Biaya Pendaftaran:</span>
                  <strong className="text-emerald-400">
                    {tournament.entryFee === 0 ? 'GRATIS' : `Rp ${tournament.entryFee.toLocaleString('id-ID')}`}
                  </strong>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  <strong className="text-slate-300 block mb-1">Roster Utama:</strong>
                  Jungler: {jungler} • EXP: {expLaner} • Mid: {midLaner} • Gold: {goldLaner} • Roamer: {roamer}
                  {(sub1 || sub2) && (
                    <span className="block mt-0.5 text-slate-500">
                      Cadangan: {[sub1, sub2].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="agreeRulesCheckbox"
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="agreeRulesCheckbox" className="text-slate-300 text-[11px] cursor-pointer select-none">
                  Saya dan seluruh anggota tim telah membaca, memahami, serta menyetujui seluruh{' '}
                  <strong className="text-amber-400">peraturan turnamen {tournament.title}</strong> dan bersedia bertanding secara sportif tanpa joki atau kecurangan.
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  type="button"
                  disabled={submitting || !agreeRules}
                  onClick={handleSubmitRegistration}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg ${
                    agreeRules && !submitting
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Mengirim Data...' : 'Kirim Pendaftaran Tim'}
                </button>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS & WHATSAPP PAYMENT INSTRUCTION */}
          {step === 'success' && createdReg && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-heading font-black text-xl text-white">Pendaftaran Berhasil Dikirim!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Status saat ini:{' '}
                  <span className="font-bold text-amber-400 uppercase tracking-wider">
                    Menunggu Pembayaran
                  </span>
                </p>
              </div>

              {/* Box Nomor Pendaftaran */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between max-w-sm mx-auto">
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ID Pendaftaran Anda</div>
                  <div className="font-mono font-bold text-amber-400 text-base">{createdReg.id}</div>
                </div>
                <button
                  onClick={handleCopyRegId}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 text-left space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>Instruksi Pembayaran:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>
                    Biaya pendaftaran tim adalah{' '}
                    <strong className="text-amber-400">
                      {tournament.entryFee === 0 ? 'Gratis' : `Rp ${tournament.entryFee.toLocaleString('id-ID')}`}
                    </strong>.
                  </li>
                  <li>
                    Klik tombol hijau di bawah untuk membuka chat WhatsApp Admin Turnamen ({tournament.whatsappAdmin}).
                  </li>
                  <li>Kirimkan bukti transfer screenshot langsung melalui WhatsApp kepada admin.</li>
                  <li>Admin akan memverifikasi mutasi dan menyetujui tim Anda menjadi peserta resmi turnamen.</li>
                </ol>
              </div>

              {/* Action: Open WhatsApp */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Bukti Pembayaran ke WhatsApp Admin</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
