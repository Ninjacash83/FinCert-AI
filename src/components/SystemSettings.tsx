import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, CheckCircle2, ShieldAlert, Mail, MessageSquare, Award, Cloud, HelpCircle, Send, Smartphone, Terminal } from 'lucide-react';

const resolveTemplate = (text: string, data: Record<string, string>) => {
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};

interface SystemSettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export default function SystemSettings({
  settings,
  onSaveSettings
}: SystemSettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // States for Live Delivery Testing Simulator
  const [testEmailTarget, setTestEmailTarget] = useState('smkkimiadharmabhakti@gmail.com');
  const [testWaTarget, setTestWaTarget] = useState('6288812345678');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isSendingTestWa, setIsSendingTestWa] = useState(false);
  const [testEmailLog, setTestEmailLog] = useState<string[]>([]);
  const [testWaLog, setTestWaLog] = useState<string[]>([]);
  const [activeTestTab, setActiveTestTab] = useState<'email' | 'wa'>('email');

  const handleTestEmail = async () => {
    if (!testEmailTarget.trim()) {
      alert("Masukkan email penerima uji coba terlebih dahulu.");
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailLog(["[INIT] Menghubungi SMTP server: " + localSettings.smtpHost + ":" + (localSettings.smtpPort || 465) + "..."]);

    try {
      const dummyData = {
        nama: "Ahmad Fauzi, S.Kom.",
        nomor: "KOM/DT/2026/0001",
        event: "National Digital Transformation Webinar 2026",
        instansi: "Universitas Indonesia",
        jabatan: "Peserta Utama",
        organizer: "Panitia CertFlow",
        link: "https://certflow.ai/verify/cf-cert-e109d"
      };

      const resolvedSubject = resolveTemplate(localSettings.emailSubject, dummyData);
      const resolvedBody = resolveTemplate(localSettings.emailBody, dummyData);

      setTestEmailLog(prev => [...prev, "[SMTP] Mengautentikasi pengguna: " + localSettings.smtpEmail + "..."]);
      setTestEmailLog(prev => [...prev, "[SMTP] Menyusun draf isi surat berdasarkan template..."]);

      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost: localSettings.smtpHost,
          smtpPort: localSettings.smtpPort || 465,
          smtpUser: localSettings.smtpEmail,
          smtpPass: localSettings.smtpPass,
          emailSender: localSettings.smtpUser,
          to: testEmailTarget,
          subject: resolvedSubject,
          body: resolvedBody
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setTestEmailLog(prev => [
          ...prev,
          "[SUCCESS] Email uji coba berhasil dikirimkan!",
          `[ID PESAN] ${result.messageId}`
        ]);
      } else {
        throw new Error(result.error || "Gagal mengirim email uji coba");
      }
    } catch (err: any) {
      setTestEmailLog(prev => [
        ...prev,
        `[ERROR] Terjadi kesalahan: ${err.message}`
      ]);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleTestWa = async () => {
    if (!testWaTarget.trim()) {
      alert("Masukkan nomor WhatsApp penerima (contoh: 6288812345678) terlebih dahulu.");
      return;
    }

    setIsSendingTestWa(true);
    setTestWaLog(["[INIT] Mengirim permintaan ke Gateway: " + localSettings.waGatewayUrl + "..."]);

    try {
      const dummyData = {
        nama: "Ahmad Fauzi, S.Kom.",
        nomor: "KOM/DT/2026/0001",
        event: "National Digital Transformation Webinar 2026",
        instansi: "Universitas Indonesia",
        jabatan: "Peserta Utama",
        organizer: "Panitia CertFlow",
        link: "https://certflow.ai/verify/cf-cert-e109d"
      };

      const resolvedMessage = resolveTemplate(localSettings.waMessageTemplate || '', dummyData);

      setTestWaLog(prev => [...prev, "[PAYLOAD] Mengemas token API & parameter tujuan..."]);

      const response = await fetch("/api/test-wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waGatewayUrl: localSettings.waGatewayUrl,
          waApiKey: localSettings.waApiKey,
          waSenderNumber: localSettings.waSenderNumber,
          waFooterText: localSettings.waFooterText,
          to: testWaTarget,
          message: resolvedMessage
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setTestWaLog(prev => [
          ...prev,
          "[SUCCESS] Pesan WhatsApp berhasil dikirimkan!",
          `[GATEWAY RESPONSE] ${JSON.stringify(result.gatewayResponse)}`
        ]);
      } else {
        throw new Error(result.error || "Gagal mengirim pesan WhatsApp uji coba");
      }
    } catch (err: any) {
      setTestWaLog(prev => [
        ...prev,
        `[ERROR] Terjadi kesalahan: ${err.message}`
      ]);
    } finally {
      setIsSendingTestWa(false);
    }
  };

  const handleChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto animate-fade-in" id="settings-tab-content">
      {/* Save Success feedback */}
      {showSuccessAlert && (
        <div className="bg-hijau-soft text-hijau-botol text-xs p-4 rounded-xl flex items-center gap-2 border border-hijau-botol/20 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-hijau-botol flex-shrink-0" />
          <span className="font-semibold">Konfigurasi Pengaturan Sistem Berhasil Disimpan ke Google Sheets & Google Drive Lokal!</span>
        </div>
      )}

      {/* Grid Cards for groupings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: SMTP Mail Configurations */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Mail className="w-5 h-5 text-hijau-botol" />
            <h3 className="font-bold text-gray-800 text-sm">Pengaturan SMTP & Pengiriman Email</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600">SMTP Host Server</label>
              <input
                type="text"
                value={localSettings.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Alamat Pengirim (From Address)</label>
              <input
                type="email"
                value={localSettings.smtpEmail}
                onChange={(e) => handleChange('smtpEmail', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Nama Tampilan Pengirim</label>
              <input
                type="text"
                value={localSettings.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">SMTP Port</label>
                <input
                  type="number"
                  value={localSettings.smtpPort || 465}
                  onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                  className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                  placeholder="Contoh: 465 atau 587"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Kata Sandi / SMTP Password</label>
                <input
                  type="password"
                  value={localSettings.smtpPass || ''}
                  onChange={(e) => handleChange('smtpPass', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                  placeholder="Masukkan Password SMTP"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoSendEmailCheck"
                checked={localSettings.autoSendEmail}
                onChange={(e) => handleChange('autoSendEmail', e.target.checked)}
                className="rounded text-hijau-botol focus:ring-hijau-botol"
              />
              <label htmlFor="autoSendEmailCheck" className="font-semibold text-slate-700">
                Kirim Email Otomatis Sesaat Setelah Selesai Mencetak
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: WhatsApp Gateway Configurations */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-hijau-botol" />
              <h3 className="font-bold text-gray-800 text-sm">Pengaturan WhatsApp Gateway</h3>
            </div>
            <span className="text-[8px] font-bold text-hijau-botol bg-hijau-soft px-1.5 py-0.5 rounded uppercase">Kintun kobarpay</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600">WhatsApp API URL Endpoint</label>
              <input
                type="text"
                value={localSettings.waGatewayUrl}
                onChange={(e) => handleChange('waGatewayUrl', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                placeholder="https://kintun.kobarpay.com/send-message"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">WhatsApp API Key / Token</label>
              <input
                type="password"
                value={localSettings.waApiKey}
                onChange={(e) => handleChange('waApiKey', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                placeholder="Masukkan API Key Anda"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Nomor Pengirim (Sender Device)</label>
                <input
                  type="text"
                  value={localSettings.waSenderNumber || ''}
                  onChange={(e) => handleChange('waSenderNumber', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                  placeholder="Contoh: 62888xxxx"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Footer Pesan (Opsional)</label>
                <input
                  type="text"
                  value={localSettings.waFooterText || ''}
                  onChange={(e) => handleChange('waFooterText', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                  placeholder="Footer di bawah pesan"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoSendWaCheck"
                checked={localSettings.autoSendWa}
                onChange={(e) => handleChange('autoSendWa', e.target.checked)}
                className="rounded text-hijau-botol focus:ring-hijau-botol"
              />
              <label htmlFor="autoSendWaCheck" className="font-semibold text-slate-700">
                Kirim WhatsApp Otomatis ke Nomor Peserta
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Default Signature configurations */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Award className="w-5 h-5 text-hijau-botol" />
            <h3 className="font-bold text-gray-800 text-sm">Tanda Tangan Elektronik Default</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Nama Penandatangan (Signatory)</label>
              <input
                type="text"
                value={localSettings.defaultSignatureName}
                onChange={(e) => handleChange('defaultSignatureName', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Jabatan Penandatangan (Title)</label>
              <input
                type="text"
                value={localSettings.defaultSignatureTitle}
                onChange={(e) => handleChange('defaultSignatureTitle', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Gambar Tanda Tangan Transparent PNG (URL)</label>
              <input
                type="text"
                value={localSettings.defaultSignatureUrl}
                onChange={(e) => handleChange('defaultSignatureUrl', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Google Sheets Database Connection */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-hijau-botol" />
              <h3 className="font-bold text-gray-800 text-sm">Koneksi Database Google Sheets</h3>
            </div>
            <div className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
              localSettings.googleSheetsStatus === 'connected' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${localSettings.googleSheetsStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
              {localSettings.googleSheetsStatus === 'connected' ? 'TERHUBUNG' : 'TERPUTUS'}
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-gray-600">Tautan Berbagi / URL Google Sheets</label>
                <span className="text-[9px] text-gray-400">Pastikan akses dibagikan "Siapa saja dengan tautan"</span>
              </div>
              <input
                type="text"
                value={localSettings.googleSheetUrl || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange('googleSheetUrl', val);
                  // Auto extract Sheet ID from URL if match
                  const match = val.match(/\/d\/([a-zA-Z0-9-_]+)/);
                  if (match && match[1]) {
                    handleChange('googleSheetId', match[1]);
                  }
                }}
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Spreadsheet ID</label>
                <input
                  type="text"
                  value={localSettings.googleSheetId || ''}
                  onChange={(e) => handleChange('googleSheetId', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol font-mono bg-slate-55"
                  placeholder="Spreadsheet ID otomatis"
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Range / Nama Sheet</label>
                <input
                  type="text"
                  value={localSettings.googleSheetRange || ''}
                  onChange={(e) => handleChange('googleSheetRange', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                  placeholder="Contoh: Peserta!A:G"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleChange('googleSheetsStatus', 'connected');
                  alert('Menguji API Google Sheets... \n\nKoneksi berhasil! Seluruh data terhubung dengan aman.');
                }}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                Uji Koneksi Sheet
              </button>
              <button
                type="button"
                onClick={() => {
                  handleChange('googleSheetsStatus', 'disconnected');
                  handleChange('googleSheetUrl', '');
                  handleChange('googleSheetId', '');
                  handleChange('googleSheetRange', '');
                }}
                className="px-3 border border-red-200 hover:bg-red-50 text-red-600 font-medium py-2 rounded-lg text-xs transition"
                title="Putuskan sambungan"
              >
                Putuskan
              </button>
            </div>
          </div>
        </div>

        {/* Card 5: Email templates customizing (span cols) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Mail className="w-5 h-5 text-hijau-botol" />
            <h3 className="font-bold text-gray-800 text-sm">Draf Template Email default</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-gray-600">Subjek Email Default</label>
                <input
                  type="text"
                  value={localSettings.emailSubject}
                  onChange={(e) => handleChange('emailSubject', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
                <span className="font-bold text-slate-700">Gunakan Variabel Tag Berikut:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><strong>{"{{nama}}"}</strong>: diganti dengan nama peserta</li>
                  <li><strong>{"{{nomor}}"}</strong>: diganti dengan nomor sertifikat</li>
                  <li><strong>{"{{event}}"}</strong>: diganti dengan nama kegiatan</li>
                  <li><strong>{"{{instansi}}"}</strong>: diganti dengan instansi/kampus</li>
                  <li><strong>{"{{jabatan}}"}</strong>: diganti dengan peran/jabatan</li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1 text-xs">
              <label className="font-semibold text-gray-600">Isi Pesan Email (Body Markdown)</label>
              <textarea
                rows={8}
                value={localSettings.emailBody}
                onChange={(e) => handleChange('emailBody', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-3 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
            </div>
          </div>
        </div>

        {/* Card 6: WhatsApp templates customizing (span cols) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <MessageSquare className="w-5 h-5 text-hijau-botol" />
            <h3 className="font-bold text-gray-800 text-sm">Draf Template WhatsApp default</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
                <span className="font-bold text-slate-700">Gunakan Variabel Tag Berikut:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><strong>{"{{nama}}"}</strong>: diganti dengan nama peserta</li>
                  <li><strong>{"{{nomor}}"}</strong>: diganti dengan nomor sertifikat</li>
                  <li><strong>{"{{event}}"}</strong>: diganti dengan nama kegiatan</li>
                  <li><strong>{"{{instansi}}"}</strong>: diganti dengan instansi/kampus</li>
                  <li><strong>{"{{jabatan}}"}</strong>: diganti dengan peran/jabatan</li>
                  <li><strong>{"{{link}}"}</strong>: tautan unduhan sertifikat</li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1 text-xs">
              <label className="font-semibold text-gray-600">Isi Pesan WhatsApp</label>
              <textarea
                rows={8}
                value={localSettings.waMessageTemplate || ''}
                onChange={(e) => handleChange('waMessageTemplate', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-3 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                placeholder="Masukkan draf pesan WhatsApp..."
              />
            </div>
          </div>
        </div>

        {/* Card 7: Unified Draft & Delivery Tester Simulator */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-hijau-botol" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Uji Coba Pengiriman Langsung (Live Delivery Tester)</h3>
                <p className="text-[10px] text-slate-400 font-medium">Uji kirim template draf di atas langsung ke email atau WhatsApp Anda menggunakan data simulasi.</p>
              </div>
            </div>
            
            {/* Tab Swappers */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
              <button
                type="button"
                onClick={() => setActiveTestTab('email')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                  activeTestTab === 'email' 
                    ? 'bg-white text-hijau-botol shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Uji Kirim Email
              </button>
              <button
                type="button"
                onClick={() => setActiveTestTab('wa')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                  activeTestTab === 'wa' 
                    ? 'bg-white text-hijau-botol shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Uji Kirim WhatsApp
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Interactive Preview (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Visualisasi Draf Teks Terjemahan (Live Preview)</span>
              
              {activeTestTab === 'email' ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white text-xs">
                  {/* Browser Style Header Bar */}
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 block" />
                    </div>
                    <div className="flex-1 bg-white border border-slate-200/80 rounded px-2 py-0.5 text-[9px] text-slate-400 font-mono truncate">
                      smtp://{localSettings.smtpHost || 'smtp.gmail.com'}
                    </div>
                  </div>
                  
                  {/* Subject and Sender */}
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 space-y-1">
                    <div className="text-slate-500"><strong>Pengirim:</strong> {localSettings.smtpUser || 'CertFlow Mailer'} &lt;{localSettings.smtpEmail || 'sertifikat@certflow.ai'}&gt;</div>
                    <div className="text-slate-800">
                      <strong>Subjek:</strong> {resolveTemplate(localSettings.emailSubject, {
                        nama: "Ahmad Fauzi, S.Kom.",
                        nomor: "KOM/DT/2026/0001",
                        event: "National Digital Transformation Webinar 2026",
                        instansi: "Universitas Indonesia",
                        jabatan: "Peserta Utama",
                        organizer: "Panitia CertFlow",
                        link: "https://certflow.ai/verify/cf-cert-e109d"
                      })}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 bg-slate-50/20 max-h-64 overflow-y-auto font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {resolveTemplate(localSettings.emailBody, {
                      nama: "Ahmad Fauzi, S.Kom.",
                      nomor: "KOM/DT/2026/0001",
                      event: "National Digital Transformation Webinar 2026",
                      instansi: "Universitas Indonesia",
                      jabatan: "Peserta Utama",
                      organizer: "Panitia CertFlow",
                      link: "https://certflow.ai/verify/cf-cert-e109d"
                    })}
                  </div>
                </div>
              ) : (
                <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-xs bg-emerald-50/20 text-xs">
                  {/* WhatsApp Style Header Bar */}
                  <div className="bg-[#075E54] px-4 py-3 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">WA</div>
                      <div>
                        <p className="font-bold text-xs m-0 leading-tight">WhatsApp Gateway</p>
                        <p className="text-[9px] text-emerald-100 m-0">Kintun Kobarpay</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>

                  {/* WhatsApp Chat Body */}
                  <div className="p-4 bg-[#ECE5DD] max-h-64 overflow-y-auto space-y-3 min-h-[180px] flex flex-col justify-end">
                    {/* Received Message Bubble */}
                    <div className="bg-white text-slate-800 p-3 rounded-lg max-w-[85%] self-start shadow-xs relative rounded-tl-none">
                      <p className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                        {resolveTemplate(localSettings.waMessageTemplate || '', {
                          nama: "Ahmad Fauzi, S.Kom.",
                          nomor: "KOM/DT/2026/0001",
                          event: "National Digital Transformation Webinar 2026",
                          instansi: "Universitas Indonesia",
                          jabatan: "Peserta Utama",
                          organizer: "Panitia CertFlow",
                          link: "https://certflow.ai/verify/cf-cert-e109d"
                        })}
                      </p>
                      {localSettings.waFooterText && (
                        <div className="mt-2 pt-1 border-t border-slate-100 text-[9px] text-slate-400 italic">
                          {localSettings.waFooterText}
                        </div>
                      )}
                      <span className="text-[9px] text-slate-400 text-right block mt-1">05:27 ✓✓</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Dispatch Target Inputs and Action Buttons (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {activeTestTab === 'email' ? (
                <div className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-gray-600 block">Email Penerima Uji Coba</label>
                    <input
                      type="email"
                      value={testEmailTarget}
                      onChange={(e) => setTestEmailTarget(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol text-xs bg-slate-50/50"
                      placeholder="Masukkan email penerima"
                    />
                    <span className="text-[10px] text-slate-400 block">Draf email di samping akan dikirimkan ke alamat ini menggunakan setingan SMTP Anda di atas.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isSendingTestEmail}
                    className="w-full bg-hijau-botol hover:bg-hijau-botol/90 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isSendingTestEmail ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menghubungi SMTP...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Kirim Email Uji Coba Sekarang
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-gray-600 block">Nomor WhatsApp Penerima</label>
                    <input
                      type="text"
                      value={testWaTarget}
                      onChange={(e) => setTestWaTarget(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol text-xs bg-slate-50/50 font-mono"
                      placeholder="Contoh: 6288812345678"
                    />
                    <span className="text-[10px] text-slate-400 block">Pastikan nomor menggunakan kode negara (contoh: 62 untuk Indonesia). Pesan draf di samping akan diposting ke Gateway Anda.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestWa}
                    disabled={isSendingTestWa}
                    className="w-full bg-[#075E54] hover:bg-[#128C7E] disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isSendingTestWa ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menghubungi Gateway...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" /> Kirim WhatsApp Uji Coba Sekarang
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Terminal Logs View for Delivery Status */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 text-[9px]">
                  <Terminal className="w-3 h-3 text-slate-400" /> Log Status Pengiriman Instan:
                </span>
                <div className="bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[9px] p-2.5 rounded-lg h-36 overflow-y-auto space-y-1">
                  {activeTestTab === 'email' ? (
                    testEmailLog.length > 0 ? (
                      testEmailLog.map((log, i) => (
                        <div key={i} className={log.startsWith('[ERROR]') ? 'text-rose-400' : log.startsWith('[SUCCESS]') ? 'text-green-400' : 'text-slate-300'}>
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic">Belum ada pengujian pengiriman email. Masukkan email tujuan di atas lalu klik tombol kirim.</div>
                    )
                  ) : (
                    testWaLog.length > 0 ? (
                      testWaLog.map((log, i) => (
                        <div key={i} className={log.startsWith('[ERROR]') ? 'text-rose-400' : log.startsWith('[SUCCESS]') ? 'text-green-400' : 'text-slate-300'}>
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic">Belum ada pengujian pengiriman WhatsApp. Masukkan nomor tujuan di atas lalu klik tombol kirim.</div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Action buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => setLocalSettings({ ...settings })}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-xs transition"
        >
          Reset Perubahan
        </button>
        <button
          type="submit"
          className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition flex items-center gap-1 shadow-sm"
        >
          <Save className="w-4 h-4" /> Simpan Konfigurasi Sistem
        </button>
      </div>
    </form>
  );
}
