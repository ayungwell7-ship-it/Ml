import React, { useRef, useState } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadPickerProps {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  required?: boolean;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label,
  sublabel = 'Pilih foto dari galeri HP atau komputer (PNG, JPG, WebP. Maks 4MB)',
  value,
  onChange,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WebP.');
      return;
    }

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar. Maksimal ukuran gambar adalah 4MB.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
      setLoading(false);
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca gambar dari perangkat.');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-300">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {errorMsg && (
        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {value ? (
        /* Preview with Ganti & Hapus */
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
          <div className="h-44 w-full flex items-center justify-center bg-black/40">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              ✓ Foto berhasil dimuat
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Ganti Foto
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" /> Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone picker */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-400/50 transition-colors mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
            {loading ? 'Memproses gambar...' : 'Klik untuk Unggah dari Galeri / Komputer'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
            {sublabel}
          </div>
        </div>
      )}
    </div>
  );
};
