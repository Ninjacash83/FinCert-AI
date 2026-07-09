import React, { useState, useEffect } from 'react';
import { GeneratedCertificate, CertificateTemplate } from '../types';
import { jsPDF } from 'jspdf';
import { 
  ShieldCheck, 
  Search, 
  HelpCircle, 
  AlertTriangle, 
  Building, 
  Award, 
  Calendar, 
  Hash, 
  FileCheck, 
  Check, 
  Printer, 
  Image, 
  FileText, 
  FileDown 
} from 'lucide-react';

interface VerificationPageProps {
  certificates: GeneratedCertificate[];
  templates?: CertificateTemplate[];
  initialVerifyId?: string | null;
  onClearInitialVerifyId?: () => void;
}

export default function VerificationPage({
  certificates,
  templates = [],
  initialVerifyId = null,
  onClearInitialVerifyId
}: VerificationPageProps) {
  const [inputCode, setInputCode] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundCert, setFoundCert] = useState<GeneratedCertificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCertLink, setCopiedCertLink] = useState(false);

  const handleCopyGeneral = () => {
    const link = `${window.location.origin}?tab=verify`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCert = (id: string) => {
    const link = `${window.location.origin}?verify=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedCertLink(true);
    setTimeout(() => setCopiedCertLink(false), 2500);
  };

  const handleDownloadPng = (cert: GeneratedCertificate) => {
    const link = document.createElement('a');
    link.href = cert.downloadPngUrl;
    link.download = `Sertifikat_${cert.participantName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = (cert: GeneratedCertificate) => {
    // Find associated template to check orientation and paperType
    const template = templates.find(t => t.id === cert.templateId);
    const isPortrait = template?.orientation === 'portrait';
    const isF4 = template?.paperType === 'F4';
    
    const orientation = isPortrait ? 'p' : 'l';
    const pdfFormat = isF4 ? [330, 215] as [number, number] : 'a4';
    const pdfWidth = isPortrait ? (isF4 ? 215 : 210) : (isF4 ? 330 : 297);
    const pdfHeight = isPortrait ? (isF4 ? 330 : 297) : (isF4 ? 215 : 210);

    const pdf = new jsPDF(orientation, 'mm', pdfFormat);
    pdf.addImage(cert.downloadPngUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`Sertifikat_${cert.participantName.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrintSingle = (cert: GeneratedCertificate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up browser diperbolehkan.');
      return;
    }
    
    // Find associated template to check orientation
    const template = templates.find(t => t.id === cert.templateId);
    const isPortrait = template?.orientation === 'portrait';
    
    printWindow.document.write(`
      <html>
      <head>
        <title>Cetak Sertifikat - ${cert.participantName}</title>
        <style>
          @page {
            size: ${isPortrait ? 'portrait' : 'landscape'};
            margin: 0mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100vw;
            height: 100vh;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${cert.downloadPngUrl}" onload="window.print(); window.close();" />
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 2500);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Sync with click from history or external verifier
  useEffect(() => {
    if (initialVerifyId) {
      setInputCode(initialVerifyId);
      const matched = certificates.find(c => c.id === initialVerifyId);
      setFoundCert(matched || null);
      setSearched(true);
      if (onClearInitialVerifyId) onClearInitialVerifyId();
    }
  }, [initialVerifyId, certificates]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const codeClean = inputCode.trim();
    const matched = certificates.find(c => c.id === codeClean || c.certificateNumber === codeClean);
    
    setFoundCert(matched || null);
    setSearched(true);
  };

  // List some quick codes from mock data to let the tester try easily
  const quickDemoCodes = certificates.slice(0, 3).map(c => c.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto" id="verification-tab-content">
      {/* Search form box */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-hijau-soft text-hijau-botol rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-800">Sistem Verifikasi Keabsahan Sertifikat Digital</h2>
          <p className="text-xs text-gray-400">Masukkan Kode Hash Sertifikat unik atau Nomor Serial untuk memvalidasi keaslian dokumen.</p>
        </div>

        {/* Standalone general shareable link pill */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={handleCopyGeneral}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-hijau-botol bg-hijau-soft/60 hover:bg-hijau-soft border border-hijau-botol/20 rounded-full px-3 py-1.5 transition shadow-sm"
          >
            <span>{copiedLink ? '✓ Link Halaman Terpisah Tersalin!' : '🔗 Salin Link Halaman Verifikasi Mandiri'}</span>
          </button>
        </div>

        <form onSubmit={handleVerify} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Contoh: cf-cert-e109d atau KOM/DT/2026/0001"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
          />
          <button
            type="submit"
            className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition shadow-sm"
          >
            Verifikasi
          </button>
        </form>

        {/* Demo hints */}
        {quickDemoCodes.length > 0 && (
          <div className="pt-2 text-xs text-gray-400">
            <span>Kode Demo Cepat: </span>
            <div className="flex flex-wrap gap-1.5 justify-center mt-1">
              {quickDemoCodes.map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setInputCode(code);
                    const matched = certificates.find(c => c.id === code);
                    setFoundCert(matched || null);
                    setSearched(true);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded transition"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verification Result Display */}
      {searched && (
        <div className="animate-fade-in">
          {foundCert ? (
            /* Secure Verified Badge Panel */
            <div className="bg-gradient-to-b from-white to-hijau-soft/10 rounded-2xl border-2 border-hijau-botol/30 shadow-md p-6 relative overflow-hidden space-y-6">
              
              {/* Dynamic Watermark background logo */}
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
                <ShieldCheck className="w-80 h-80" />
              </div>

              {/* Status Header Badge */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-hijau-soft text-hijau-botol rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <span className="bg-hijau-soft text-hijau-botol text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Sistem Validasi Terpusat
                  </span>
                  <h3 className="text-hijau-botol font-black text-lg leading-tight tracking-tight">STATUS: ASLI & TERVERIFIKASI</h3>
                </div>
              </div>

              {/* Gambar Sertifikat Preview & Download Section */}
              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] block">Pratinjau Dokumen Resmi</span>
                    <h4 className="text-sm font-black text-slate-800 leading-tight">Berkas Digital Sertifikat</h4>
                  </div>
                  {foundCert.downloadPngUrl ? (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDownloadPng(foundCert)}
                        className="flex-1 sm:flex-initial bg-hijau-botol hover:bg-hijau-botol/95 text-white font-bold text-[11px] px-3.5 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Image className="w-3.5 h-3.5" /> Unduh PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(foundCert)}
                        className="flex-1 sm:flex-initial bg-emas hover:bg-emas/95 text-dark-green font-bold text-[11px] px-3.5 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" /> Unduh PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintSingle(foundCert)}
                        className="flex-1 sm:flex-initial border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold text-[11px] px-3.5 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full">Arsip Tanpa Gambar</span>
                  )}
                </div>
                
                <div className="relative border border-gray-100 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-3 group min-h-[150px]">
                  {foundCert.downloadPngUrl ? (
                    <>
                      <img 
                        src={foundCert.downloadPngUrl} 
                        alt="Pratinjau Sertifikat Resmi" 
                        className="max-h-[350px] w-auto object-contain rounded shadow-sm border border-gray-100/50"
                        referrerPolicy="no-referrer"
                      />
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownloadPng(foundCert)}
                          className="bg-white hover:bg-gray-100 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-lg shadow-md transition flex items-center gap-1.5"
                        >
                          <FileDown className="w-4 h-4 text-hijau-botol" /> Simpan PNG
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintSingle(foundCert)}
                          className="bg-white hover:bg-gray-100 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-lg shadow-md transition flex items-center gap-1.5"
                        >
                          <Printer className="w-4 h-4 text-emas" /> Cetak Langsung
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-black text-slate-500">Berkas gambar telah kedaluwarsa</p>
                      <p className="text-[10px] text-slate-400 max-w-[320px] mx-auto">Untuk menghemat penyimpanan browser lokal Anda, gambar sertifikat lama ini telah diarsipkan. Metadata keabsahan tetap 100% valid.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Recipient */}
                <div className="bg-white/60 p-4 rounded-xl border border-gray-100 space-y-1 shadow-sm flex items-start gap-2.5">
                  <Award className="w-5 h-5 text-hijau-botol flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Nama Penerima</span>
                    <p className="text-sm font-black text-slate-800">{foundCert.participantName}</p>
                    <p className="text-gray-400 font-medium">{foundCert.participantEmail || 'Penerbitan Offline'}</p>
                  </div>
                </div>

                {/* 2. Serial No */}
                <div className="bg-white/60 p-4 rounded-xl border border-gray-100 space-y-1 shadow-sm flex items-start gap-2.5">
                  <Hash className="w-5 h-5 text-hijau-botol flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Nomor Serial Sertifikat</span>
                    <p className="text-sm font-bold text-slate-800 font-mono">{foundCert.certificateNumber}</p>
                    <p className="text-gray-400 text-[11px] font-mono">HASHID: {foundCert.id}</p>
                  </div>
                </div>

                {/* 3. Event / Kegiatan */}
                <div className="bg-white/60 p-4 rounded-xl border border-gray-100 space-y-1 shadow-sm flex items-start gap-2.5 md:col-span-2">
                  <Building className="w-5 h-5 text-hijau-botol flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Nama Kegiatan (Event)</span>
                    <p className="text-sm font-black text-slate-800 leading-tight">{foundCert.eventName}</p>
                  </div>
                </div>

                {/* 4. Issue Date */}
                <div className="bg-white/60 p-4 rounded-xl border border-gray-100 space-y-1 shadow-sm flex items-start gap-2.5">
                  <Calendar className="w-5 h-5 text-hijau-botol flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Tanggal Penerbitan</span>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(foundCert.generatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                  </div>
                </div>

                {/* 5. Secure Seal Verification */}
                <div className="bg-white/60 p-4 rounded-xl border border-gray-100 space-y-1 shadow-sm flex items-start gap-2.5">
                  <FileCheck className="w-5 h-5 text-hijau-botol flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Otoritas Penerbit</span>
                    <p className="text-sm font-bold text-slate-800">CertFlow AI QR Cryptography</p>
                    <p className="text-gray-400">Algoritma SHA256 Integrity Secured</p>
                  </div>
                </div>
              </div>

              {/* Share standalone verification link action */}
              <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <p className="text-xs font-bold text-gray-700">Link Verifikasi Sertifikat Mandiri (Shareable)</p>
                  <p className="text-[10px] text-gray-400">Bagikan tautan verifikasi langsung khusus penerima ini.</p>
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}?verify=${foundCert.id}`} 
                    className="text-[10px] text-slate-500 bg-slate-50 font-mono border border-slate-200 rounded px-2.5 py-2 flex-1 sm:w-60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyCert(foundCert.id)}
                    className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition shadow-sm flex-shrink-0"
                  >
                    {copiedCertLink ? 'Tersalin!' : 'Salin Link'}
                  </button>
                </div>
              </div>

              {/* QR Code and verification assurance footer */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-hijau-botol text-white p-4 rounded-xl shadow-inner">
                <img 
                  src={foundCert.qrCodeUrl} 
                  alt="Verification QR Code" 
                  className="w-16 h-16 bg-white p-1 rounded-lg flex-shrink-0 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs space-y-1 text-center sm:text-left">
                  <p className="font-bold text-hijau-soft">Jaminan Keamanan Dokumen CertFlow AI</p>
                  <p className="text-hijau-soft/80 leading-relaxed text-[11px]">
                    Sertifikat ini dienkripsi menggunakan sistem Google Cloud. Metadata di atas cocok 100% dengan database asli penerbit acara. Modifikasi data apa pun akan merusak keabsahan verifikasi.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Warning Not Found Panel */
            <div className="bg-white p-6 rounded-2xl border-2 border-red-200 shadow-md text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-gray-800 text-base">Kode Sertifikat Tidak Ditemukan!</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Kode hash <strong>"{inputCode}"</strong> tidak terdaftar dalam pangkalan data kami atau sertifikat telah dicabut oleh pihak penyelenggara. Harap periksa kembali penulisan huruf besar dan kecil.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-50 flex justify-center gap-3">
                <span className="text-[10px] text-gray-400">Butuh bantuan? Silakan hubungi support@certflow.ai</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
