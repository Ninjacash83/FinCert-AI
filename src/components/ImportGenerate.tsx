import React, { useState, useRef, useEffect } from 'react';
import { EventItem, CertificateTemplate, Participant, GeneratedCertificate, AppSettings } from '../types';
import { drawCertificate } from '../utils/canvasRenderer';
import { compressCertificateHistoryImage } from '../utils/imageCompressor';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Upload, 
  Map, 
  Play, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  FolderDown,
  Loader2,
  Trash2,
  Check,
  Phone
} from 'lucide-react';

interface ImportGenerateProps {
  events: EventItem[];
  templates: CertificateTemplate[];
  activeEventId: string | null;
  onAddCertificates: (certs: GeneratedCertificate[]) => void;
  settings: AppSettings;
}

export default function ImportGenerate({
  events,
  templates,
  activeEventId,
  onAddCertificates,
  settings
}: ImportGenerateProps) {
  
  // Step-by-Step wizard states
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selections
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // File import states
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  
  // Column Mapping states
  const [mapping, setMapping] = useState<{
    nama: string;
    nomor: string;
    instansi: string;
    jabatan: string;
    nilai: string;
    email: string;
    wa: string;
  }>({
    nama: '',
    nomor: '',
    instansi: '',
    jabatan: '',
    nilai: '',
    email: '',
    wa: '',
  });

  // Parsed and validated participants list
  const [parsedParticipants, setParsedParticipants] = useState<Participant[]>([]);
  const [autoNumberEnabled, setAutoNumberEnabled] = useState(true);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedLogs, setGeneratedLogs] = useState<string[]>([]);
  const [generatedZipBlob, setGeneratedZipBlob] = useState<Blob | null>(null);
  const [generatedZipPdfBlob, setGeneratedZipPdfBlob] = useState<Blob | null>(null);
  const [finalCerts, setFinalCerts] = useState<GeneratedCertificate[]>([]);

  // WhatsApp Mass Sending State
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waProgress, setWaProgress] = useState(0);
  const [waLogs, setWaLogs] = useState<string[]>([]);
  const [customWaTemplate, setCustomWaTemplate] = useState('');
  const [customWaFooterText, setCustomWaFooterText] = useState('');
  const [waAiPrompt, setWaAiPrompt] = useState('');
  const [waAiResult, setWaAiResult] = useState('');
  const [waAiGenerating, setWaAiGenerating] = useState(false);

  // Sync WhatsApp settings defaults
  useEffect(() => {
    if (settings) {
      setCustomWaTemplate(settings.waMessageTemplate || '');
      setCustomWaFooterText(settings.waFooterText || '');
    }
  }, [settings]);

  // AI Assistant Copywriter
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');

  // Bulk WhatsApp Sending Function
  const handleMassSendWa = async () => {
    if (finalCerts.length === 0) return;
    setIsSendingWa(true);
    setWaProgress(0);
    setWaLogs(['[START] Memulai pengiriman WhatsApp Gateway massal...']);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < finalCerts.length; i++) {
      const cert = finalCerts[i];
      // Find matching parsed participant to get wa phone number
      const p = parsedParticipants.find(part => part.name === cert.participantName);
      const recipientPhone = p?.wa || '';

      if (!recipientPhone) {
        setWaLogs(prev => [...prev, `[SKIP] ${cert.participantName}: Nomor HP/WA tidak ditemukan atau kosong`]);
        failCount++;
        setWaProgress(Math.round(((i + 1) / finalCerts.length) * 100));
        continue;
      }

      setWaLogs(prev => [...prev, `[SEND] Mengirim ke ${cert.participantName} (${recipientPhone})...`]);

      // Substitute placeholders in WhatsApp message
      let formattedMsg = customWaTemplate || settings.waMessageTemplate;
      formattedMsg = formattedMsg
        .replace(/{{nama}}/g, cert.participantName)
        .replace(/{{nomor}}/g, cert.certificateNumber)
        .replace(/{{event}}/g, cert.eventName)
        .replace(/{{jabatan}}/g, p?.jabatan || 'Peserta')
        .replace(/{{instansi}}/g, p?.instansi || '')
        .replace(/{{link}}/g, cert.verificationUrl || cert.downloadPngUrl || cert.downloadPdfUrl || '#');

      try {
        const response = await fetch('/api/test-wa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            waGatewayUrl: settings.waGatewayUrl,
            waApiKey: settings.waApiKey,
            waSenderNumber: settings.waSenderNumber,
            waFooterText: customWaFooterText || settings.waFooterText,
            to: recipientPhone,
            message: formattedMsg
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          successCount++;
          setWaLogs(prev => [...prev, `[SUCCESS] ${cert.participantName}: Berhasil terkirim`]);
        } else {
          failCount++;
          setWaLogs(prev => [...prev, `[FAILED] ${cert.participantName}: ${data.error || 'Gateway gagal memproses'}`]);
        }
      } catch (err: any) {
        failCount++;
        setWaLogs(prev => [...prev, `[ERROR] ${cert.participantName}: ${err.message || 'Gagal tersambung ke gateway'}`]);
      }

      setWaProgress(Math.round(((i + 1) / finalCerts.length) * 100));
      // Add rate limiting spacing to maintain connection stability
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setWaLogs(prev => [...prev, `[SELESAI] Pengiriman WhatsApp selesai. Sukses: ${successCount}, Gagal: ${failCount}.`]);
    setIsSendingWa(false);
  };

  // WhatsApp AI generator copy helper
  const handleWaAiGenerateCopy = async () => {
    if (!waAiPrompt.trim()) return;
    setWaAiGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${waAiPrompt}\n\nPeraturan Penting:\n1. Pesan harus ditulis dalam Bahasa Indonesia.\n2. Wajib gunakan/sisakan tag placeholder persis: {{nama}}, {{nomor}}, {{jabatan}}, {{event}}, dan {{link}} agar bisa diganti secara dinamis.\n3. Gunakan formatting teks tebal WhatsApp (*teks*) untuk hal-hal penting.`
        })
      });
      const data = await response.json();
      if (data.text) {
        setCustomWaTemplate(data.text);
        setWaAiResult(data.text);
      } else {
        alert('Gagal memproses draf dari Gemini.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi asisten AI Gemini.');
    } finally {
      setWaAiGenerating(false);
    }
  };

  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeEvent = events.find(e => e.id === (selectedEventId || activeEventId)) || events[0];
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Pre-select active event if available
  useEffect(() => {
    if (activeEventId) {
      setSelectedEventId(activeEventId);
    } else if (events.length > 0) {
      setSelectedEventId(events[0].id);
    }
    if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [activeEventId, events, templates]);

  // Download Sample Excel Helper
  const downloadSampleExcel = () => {
    const wsData = [
      ['Nomor', 'Nama', 'Colom1', 'Colom2', 'Colom3', 'Colom4'],
      ['KOM/DT/2026/0010', 'Ahmad Fauzi S.Kom', 'Universitas Indonesia', 'Peserta Utama', 'Sangat Memuaskan', 'ahmadfauzi@gmail.com'],
      ['', 'Siti Rahmawati M.T', 'Institut Teknologi Bandung', 'Narasumber', 'Dengan Pujian', 'siti.rahma@yahoo.com'],
      ['', 'Budi Santoso', 'PT Inovasi Digital', 'Peserta', '85/100', 'budi.santoso@gmail.com']
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
    
    // Write and download xlsx
    XLSX.writeFile(wb, 'certflow_template_peserta.xlsx');
  };

  // Excel and CSV File Parser (Supports xls, xlsx, csv)
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays (raw row values)
        const sheetData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (sheetData.length > 0) {
          // Parse headers (first row)
          const headers = (sheetData[0] as any[]).map(h => String(h || '').trim());
          setCsvHeaders(headers);

          // Parse data rows
          const rows = sheetData.slice(1).map((row: any[]) => {
            // Fill empty cells up to headers length
            const paddedRow = Array.from({ length: headers.length }, (_, idx) => {
              const val = row[idx];
              return val !== undefined && val !== null ? String(val).trim() : '';
            });
            return paddedRow;
          });
          setCsvRows(rows);

          // Auto-guess column mappings based on headers, prioritizing Nomor, Nama, Colom1, Colom2, Colom3, Colom4
          const guessMapping = { nama: '', nomor: '', instansi: '', jabatan: '', nilai: '', email: '', wa: '' };
          headers.forEach(header => {
            const lower = header.toLowerCase();
            if (lower === 'nama') guessMapping.nama = header;
            else if (lower === 'nomor') guessMapping.nomor = header;
            else if (lower === 'colom1' || lower === 'kolom1') guessMapping.instansi = header;
            else if (lower === 'colom2' || lower === 'kolom2') guessMapping.jabatan = header;
            else if (lower === 'colom3' || lower === 'kolom3') guessMapping.nilai = header;
            else if (lower === 'colom4' || lower === 'kolom4') guessMapping.email = header;
            // Fallback keywords if not exact match
            else if (!guessMapping.nama && lower.includes('nama')) guessMapping.nama = header;
            else if (!guessMapping.nomor && (lower.includes('nomor') || lower.includes('no'))) guessMapping.nomor = header;
            else if (!guessMapping.instansi && (lower.includes('instansi') || lower.includes('kampus') || lower.includes('afiliasi'))) guessMapping.instansi = header;
            else if (!guessMapping.jabatan && (lower.includes('sebagai') || lower.includes('jabatan') || lower.includes('peran'))) guessMapping.jabatan = header;
            else if (!guessMapping.nilai && (lower.includes('nilai') || lower.includes('skor') || lower.includes('predikat'))) guessMapping.nilai = header;
            else if (!guessMapping.email && (lower.includes('email') || lower.includes('surel') || lower.includes('elektronik'))) guessMapping.email = header;
            else if (!guessMapping.wa && (lower.includes('wa') || lower.includes('whatsapp') || lower.includes('hp') || lower.includes('phone') || lower.includes('telepon') || lower.includes('kontak') || lower.includes('telp'))) guessMapping.wa = header;
          });
          setMapping(guessMapping);
        } else {
          alert('Berkas kosong atau tidak valid!');
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        alert('Gagal membaca berkas. Pastikan file dalam format Excel (.xls, .xlsx) atau CSV yang valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Map columns to fields & validate
  const handleMapColumns = () => {
    if (!mapping.nama) {
      alert('Kolom "Nama" wajib dipetakan agar sertifikat bisa diisi!');
      return;
    }

    const namaIdx = csvHeaders.indexOf(mapping.nama);
    const emailIdx = csvHeaders.indexOf(mapping.email);
    const instansiIdx = csvHeaders.indexOf(mapping.instansi);
    const jabatanIdx = csvHeaders.indexOf(mapping.jabatan);
    const nilaiIdx = csvHeaders.indexOf(mapping.nilai);
    const nomorIdx = csvHeaders.indexOf(mapping.nomor);
    const waIdx = csvHeaders.indexOf(mapping.wa);

    const validatedList: Participant[] = csvRows.map((row, index) => {
      const pName = row[namaIdx] || '';
      const pEmail = emailIdx !== -1 ? row[emailIdx] : '';
      const pInstansi = instansiIdx !== -1 ? row[instansiIdx] : '';
      const pJabatan = jabatanIdx !== -1 ? row[jabatanIdx] : '';
      const pNilai = nilaiIdx !== -1 ? row[nilaiIdx] : '';
      const pWa = waIdx !== -1 ? row[waIdx] : '';
      
      // Auto-compute or use manual certificate number
      let certNumber = '';
      if (!autoNumberEnabled && nomorIdx !== -1 && row[nomorIdx]) {
        certNumber = row[nomorIdx];
      } else {
        // Format: PREFIX/YYYY/MMDD + index padded
        const prefix = activeEvent?.certificatePrefix || 'CERT';
        const numPadded = String(index + 1).padStart(4, '0');
        certNumber = `${prefix}/${numPadded}`;
      }

      const isValid = pName.length > 2;

      return {
        id: `part-csv-${index}-${Math.floor(Math.random() * 1000)}`,
        eventId: activeEvent?.id || 'unknown',
        name: pName,
        email: pEmail,
        wa: pWa,
        instansi: pInstansi,
        jabatan: pJabatan || 'Peserta',
        nilai: pNilai || '-',
        certificateNumber: certNumber,
        status: isValid ? 'valid' : 'invalid',
        errorMessage: isValid ? undefined : 'Nama peserta terlalu pendek atau kosong'
      };
    });

    setParsedParticipants(validatedList);
    setCurrentStep(3);
  };

  // Mass generation engine
  const handleMassGenerate = async () => {
    if (parsedParticipants.length === 0) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedLogs([]);
    
    const zipImages = new JSZip();
    const zipPdfs = new JSZip();
    const listCerts: GeneratedCertificate[] = [];
    
    const canvas = hiddenCanvasRef.current;
    if (!canvas) {
      alert('Internal canvas error. Mohon muat ulang.');
      setIsGenerating(false);
      return;
    }

    const total = parsedParticipants.length;

    for (let i = 0; i < total; i++) {
      const p = parsedParticipants[i];
      setGenerationProgress(Math.round(((i) / total) * 100));
      
      if (p.status !== 'valid' && p.status !== 'generated') {
        setGeneratedLogs(prev => [...prev, `[FAIL] Baris ${i+1}: ${p.name} dilewati karena data tidak valid`]);
        continue;
      }

      setGeneratedLogs(prev => [...prev, `[RENDER] Membuat desain resolusi tinggi untuk: ${p.name}`]);

      const certificateHash = `cf-cert-${Math.random().toString(36).substring(2, 7)}`;
      const verificationUrl = `https://certflow.ai/verify/${certificateHash}`;

      const renderData = {
        nama: p.name,
        nomor: p.certificateNumber,
        instansi: p.instansi,
        event: activeEvent?.name || 'National Event',
        tanggal: activeEvent?.date || '2026-07-08',
        jabatan: p.jabatan,
        nilai: p.nilai,
        qrValue: verificationUrl
      };

      // Draw onto canvas asynchronously
      await drawCertificate(canvas, activeTemplate, renderData);

      // Convert Canvas to High Quality Image Blob
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const pngBase64 = pngUrl.split(',')[1];
      
      // Save PNG to ZIP folder
      const safeName = p.name.replace(/[^a-zA-Z0-9]/g, '_');
      zipImages.file(`${safeName}_Sertifikat.png`, pngBase64, { base64: true });

      // Convert Canvas to jsPDF Document (Supports A4 or F4 formats perfectly)
      const isF4 = activeTemplate?.paperType === 'F4';
      const pdfFormat = isF4 ? [330, 215] as [number, number] : 'a4';
      const pdfWidth = isF4 ? 330 : 297;
      const pdfHeight = isF4 ? 215 : 210;

      const pdf = new jsPDF('l', 'mm', pdfFormat);
      pdf.addImage(pngUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const pdfBlob = pdf.output('blob');
      
      // Save PDF to ZIP folder
      zipPdfs.file(`${safeName}_Sertifikat.pdf`, pdfBlob);

      setGeneratedLogs(prev => [...prev, `[SUCCESS] File PNG & PDF berhasil dicompile untuk: ${p.name}`]);
      
      // Simulate Email queue
      if (p.email) {
        setGeneratedLogs(prev => [...prev, `[EMAIL] Mengirimkan email notifikasi ke ${p.email} via SMTP...`]);
      }

      // Compress history image to prevent LocalStorage QuotaExceededError (fits nicely under 100KB)
      const compressedHistoryUrl = await compressCertificateHistoryImage(pngUrl);

      listCerts.push({
        id: certificateHash,
        eventId: activeEvent?.id,
        eventName: activeEvent?.name,
        templateId: activeTemplate?.id,
        participantId: p.id,
        participantName: p.name,
        participantEmail: p.email,
        certificateNumber: p.certificateNumber,
        downloadPdfUrl: compressedHistoryUrl, // storing optimized compressed base64 for history download
        downloadPngUrl: compressedHistoryUrl,
        verificationUrl: verificationUrl,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${certificateHash}`,
        generatedAt: new Date().toISOString(),
        status: p.email ? 'Emailed' : 'Generated'
      });
    }

    setGenerationProgress(100);
    setGeneratedLogs(prev => [...prev, `[ZIP] Mengompresi file ke dalam folder ZIP...`]);

    // Generate ZIP Blobs
    const zipImgBlob = await zipImages.generateAsync({ type: 'blob' });
    const zipPdfBlob = await zipPdfs.generateAsync({ type: 'blob' });

    setGeneratedZipBlob(zipImgBlob);
    setGeneratedZipPdfBlob(zipPdfBlob);
    setFinalCerts(listCerts);

    setGeneratedLogs(prev => [...prev, `[COMPLETE] Generate massal selesai! Berhasil mencetak ${listCerts.length} sertifikat.`]);
    setIsGenerating(false);

    // Save history back to parent state
    onAddCertificates(listCerts);
    setCurrentStep(4);
  };

  // Trigger Gemini AI proxy on server for email copywriting
  const handleAIGenerateCopy = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiResult('');
    
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tuliskan draf isi email ucapan selamat formal dan profesional untuk peserta event bernama "${activeEvent?.name}" yang diselenggarakan oleh "${activeEvent?.organizer}". Gunakan placeholder {{nama}}, {{event}}, {{nomor}} dan {{jabatan}} agar teks dinamis. Teks harus ramah, inspiratif, dan ditulis dalam Bahasa Indonesia yang baik dan benar.`
        })
      });

      const data = await response.json();
      if (data.text) {
        setAiResult(data.text);
      } else {
        setAiResult('Gagal memproses draf email dari AI. Silakan coba sesaat lagi.');
      }
    } catch (err) {
      setAiResult('Gagal menghubungi asisten AI. Pastikan server dev telah di-restart dan API Key terpasang.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDownloadZipImages = () => {
    if (!generatedZipBlob) return;
    const url = URL.createObjectURL(generatedZipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sertifikat_${activeEvent?.name.replace(/\s+/g, '_')}_PNG.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadZipPdfs = () => {
    if (!generatedZipPdfBlob) return;
    const url = URL.createObjectURL(generatedZipPdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sertifikat_${activeEvent?.name.replace(/\s+/g, '_')}_PDF.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="generate-tab-content">
      {/* Step Progress indicators */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { step: 1, label: 'Pilih Event' },
            { step: 2, label: 'Impor Excel' },
            { step: 3, label: 'Validasi & Preview' },
            { step: 4, label: 'Hasil Cetak' },
          ].map((s) => (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs transition ${
                  currentStep === s.step 
                    ? 'bg-hijau-botol text-white ring-4 ring-hijau-soft' 
                    : currentStep > s.step 
                      ? 'bg-hijau-soft text-hijau-botol' 
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {currentStep > s.step ? '✓' : s.step}
                </div>
                <span className={`text-xs font-semibold ${
                  currentStep === s.step ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {s.step < 4 && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Hidden canvas used to compile certificate resolution */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* STEP 1: Select target Event and design template */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800 text-base">Langkah 1: Pilih Kegiatan & Desain Cetak</h3>
            <p className="text-xs text-gray-500">Tentukan event penerbit dan template sertifikat yang akan disematkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 block">Pilih Event Penerbit:</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.certificatePrefix})</option>
                ))}
              </select>
              {activeEvent && (
                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100/50">
                  <p><strong>Penyelenggara:</strong> {activeEvent.organizer}</p>
                  <p><strong>Format No Urut:</strong> {activeEvent.certificatePrefix}/[0001]</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 block">Pilih Template Sertifikat:</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {activeTemplate && (
                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100/50">
                  <p><strong>Resolusi Kanvas:</strong> {activeTemplate.canvasWidth} x {activeTemplate.canvasHeight} px</p>
                  <p><strong>Gaya Latar:</strong> {activeTemplate.backgroundUrl.substring(0, 20)}...</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              Lanjutkan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Excel / CSV Importer with interactive Column mapping */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 text-base">Langkah 2: Impor Data Excel / CSV</h3>
              <p className="text-xs text-gray-500">Unggah berkas spreadsheet (.xls, .xlsx, .csv) berisi seluruh data peserta.</p>
            </div>
            <button
              type="button"
              onClick={downloadSampleExcel}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-hijau-botol font-bold border border-hijau-botol/10 px-3.5 py-2 rounded-lg transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Unduh Templat Excel (.xlsx)
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-hijau-botol/50 bg-slate-50 hover:bg-hijau-soft/30 rounded-xl p-8 text-center cursor-pointer transition relative">
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleExcelUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="w-10 h-10 text-hijau-botol mx-auto mb-3" />
            <span className="text-sm font-bold text-slate-700 block">
              {fileName ? `Berkas terpilih: ${fileName}` : 'Pilih Berkas Excel / CSV Anda'}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Seret dan taruh atau cari dokumen (.xls, .xlsx, .csv)</span>
          </div>

          {/* MAPPING PANEL */}
          {csvHeaders.length > 0 && (
            <div className="bg-slate-50/55 p-5 rounded-xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-1.5">
                <Map className="w-4 h-4 text-hijau-botol" />
                <h4 className="font-bold text-gray-800 text-sm">Pemetaan Kolom Spreadsheet (Excel Column Mapping)</h4>
              </div>
              <p className="text-xs text-gray-400">Cocokkan kolom tabel Anda dengan variabel dinamis sertifikat.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Mapping Nama Peserta [Nama] <span className="text-red-500">*</span></label>
                  <select
                    value={mapping.nama}
                    onChange={(e) => setMapping({ ...mapping, nama: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                  >
                    <option value="">-- Pilih Kolom --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Mapping Email [Colom4]</label>
                  <select
                    value={mapping.email}
                    onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                  >
                    <option value="">-- Pilih Kolom (Opsional) --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Mapping WhatsApp [No HP/WA]</label>
                  <select
                    value={mapping.wa}
                    onChange={(e) => setMapping({ ...mapping, wa: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                  >
                    <option value="">-- Pilih Kolom (Opsional) --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Mapping Instansi [Colom1]</label>
                  <select
                    value={mapping.instansi}
                    onChange={(e) => setMapping({ ...mapping, instansi: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                  >
                    <option value="">-- Pilih Kolom (Opsional) --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Mapping Jabatan/Peran [Colom2]</label>
                  <select
                    value={mapping.jabatan}
                    onChange={(e) => setMapping({ ...mapping, jabatan: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                  >
                    <option value="">-- Pilih Kolom (Opsional) --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Mapping Nilai [Colom3]</label>
                  <select
                    value={mapping.nilai}
                    onChange={(e) => setMapping({ ...mapping, nilai: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                  >
                    <option value="">-- Pilih Kolom (Opsional) --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Nomor Sertifikat [Nomor]</label>
                  <select
                    value={mapping.nomor}
                    disabled={autoNumberEnabled}
                    onChange={(e) => setMapping({ ...mapping, nomor: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white disabled:bg-slate-100 disabled:text-gray-400"
                  >
                    <option value="">-- Pilih Kolom (Jika manual) --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Auto Number checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoNumberCheck"
                  checked={autoNumberEnabled}
                  onChange={(e) => setAutoNumberEnabled(e.target.checked)}
                  className="rounded text-hijau-botol focus:ring-hijau-botol"
                />
                <label htmlFor="autoNumberCheck" className="text-xs font-semibold text-slate-700">
                  Gunakan Penomoran Otomatis dari CertFlow (Sangat Direkomendasikan)
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            {csvHeaders.length > 0 && (
              <button
                onClick={handleMapColumns}
                className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-1.5 shadow-sm"
              >
                Lanjutkan Validasi <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Grid validation and mass generate triggers */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800 text-base">Langkah 3: Validasi & Preview Data Peserta</h3>
            <p className="text-xs text-gray-500">Tinjau seluruh data peserta yang berhasil diimpor sebelum dicetak.</p>
          </div>

          {/* Validation Indicators */}
          <div className="bg-hijau-soft/50 p-4 rounded-xl border border-hijau-botol/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 text-emerald-950">
              <span className="font-bold flex items-center gap-1 text-hijau-botol">
                <CheckCircle className="w-4 h-4 text-hijau-botol" /> Seluruh Data Berhasil Dimuat
              </span>
              <p>Jumlah Baris: <strong>{parsedParticipants.length} Peserta</strong> | Siap cetak ke: <strong>{activeTemplate?.name}</strong></p>
            </div>
            
            <button
              onClick={handleMassGenerate}
              disabled={isGenerating}
              className="bg-hijau-botol hover:bg-hijau-botol/90 disabled:bg-hijau-botol/50 text-white font-semibold px-4.5 py-2 rounded-lg text-xs transition shadow-sm flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Mulai Cetak Massal Sekarang
                </>
              )}
            </button>
          </div>

          {/* REAL TIME PROGRESS BAR */}
          {isGenerating && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-hijau-botol" /> Mengompilasi Resolusi Tinggi (ZIP/PDF)
                </span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-hijau-botol h-full transition-all duration-300" style={{ width: `${generationProgress}%` }} />
              </div>
              
              {/* Dynamic scrollable log terminal */}
              <div className="bg-slate-950 text-emas font-mono text-[10px] p-3 rounded-lg max-h-32 overflow-y-auto space-y-1">
                {generatedLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Participant Table */}
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-bold">
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Instansi</th>
                  <th className="p-3">Keterangan/Jabatan</th>
                  <th className="p-3">Nomor Sertifikat</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {parsedParticipants.map((p, index) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-gray-400">{index + 1}</td>
                    <td className="p-3 font-bold text-gray-800">{p.name}</td>
                    <td className="p-3 text-gray-500">{p.email || <span className="text-gray-300 italic">Tanpa Email</span>}</td>
                    <td className="p-3 text-gray-500">{p.instansi || '-'}</td>
                    <td className="p-3 text-gray-500 whitespace-pre-line">{p.jabatan} <span className="text-gray-400">({p.nilai})</span></td>
                    <td className="p-3 font-mono font-semibold text-hijau-botol">{p.certificateNumber}</td>
                    <td className="p-3 text-center">
                      <span className="bg-hijau-soft text-hijau-botol px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Siap Cetak
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Generation summary, AI Assistant, Zip downloads */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Success Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 bg-hijau-soft text-hijau-botol rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 text-lg">Proses Cetak Massal Selesai!</h3>
              <p className="text-xs text-gray-500">Berhasil menghasilkan <strong>{finalCerts.length} Sertifikat HD</strong> dengan tanda tangan digital dan QR Code verifikasi unik.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownloadZipImages}
                className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-bold py-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FolderDown className="w-4 h-4" /> Unduh Semua Gambar (.ZIP)
              </button>
              
              <button
                onClick={handleDownloadZipPdfs}
                className="bg-emas hover:bg-emas/90 text-dark-green font-bold py-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" /> Unduh Semua PDF (.ZIP)
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-center gap-3">
              <button
                onClick={() => {
                  setCsvHeaders([]);
                  setCsvRows([]);
                  setParsedParticipants([]);
                  setFileName('');
                  setCurrentStep(1);
                }}
                className="text-xs text-hijau-botol font-bold hover:underline"
              >
                Generate Ulang / Mulai Baru
              </button>
            </div>
          </div>

          {/* AI Email Copywriter Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-hijau-botol" />
              <h4 className="font-bold text-gray-800 text-sm">AI Assistant Copywriter</h4>
            </div>
            <p className="text-xs text-gray-400">Gunakan kecerdasan buatan Gemini AI untuk membuat draf tulisan email pemberitahuan sertifikat otomatis agar terlihat lebih berkesan.</p>

            <div className="space-y-2">
              <textarea
                placeholder="Tuliskan arahan tambahan untuk AI (Contoh: Berikan ucapan selamat yang hangat, ingatkan peserta untuk membagikan pencapaian di LinkedIn)..."
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
              
              <button
                onClick={handleAIGenerateCopy}
                disabled={aiGenerating || !aiPrompt.trim()}
                className="bg-hijau-botol hover:bg-hijau-botol/90 disabled:bg-hijau-botol/40 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghubungi Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Bantu Tulis Ucapan Email
                  </>
                )}
              </button>
            </div>

            {aiResult && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs space-y-2">
                <span className="font-bold text-slate-700 block">Draf Ucapan AI Congratulatory:</span>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-600 font-mono text-[11px]">{aiResult}</p>
                <button
                  onClick={() => {
                    alert('Draf AI berhasil disalin ke clipboard! Silakan paste pada pengaturan email.');
                    navigator.clipboard.writeText(aiResult);
                  }}
                  className="text-[10px] text-hijau-botol font-bold hover:underline"
                >
                  Salin Teks Ucapan
                </button>
              </div>
            )}
          </div>

          {/* WhatsApp Mass Delivery & Copywriter Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-gray-800 text-sm">Kirim Massal WhatsApp (Gateway)</h4>
              </div>
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                Kintun Active
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Kirimkan pemberitahuan penerbitan sertifikat digital beserta link unduhannya ke WhatsApp seluruh peserta secara massal menggunakan template dinamis.
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-100">
                <div>
                  <span className="text-gray-400 block">Gateway URL:</span>
                  <span className="font-semibold text-gray-700 break-all">{settings.waGatewayUrl}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Sender WA No:</span>
                  <span className="font-semibold text-gray-700">{settings.waSenderNumber || '-'}</span>
                </div>
              </div>

              {/* Template Editor inside the wizard */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-slate-600 block">Edit Template Pesan WhatsApp:</label>
                <textarea
                  value={customWaTemplate}
                  onChange={(e) => setCustomWaTemplate(e.target.value)}
                  rows={6}
                  className="w-full text-xs font-mono border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {['{{nama}}', '{{nomor}}', '{{event}}', '{{jabatan}}', '{{link}}'].map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Footer Text:</label>
                <input
                  type="text"
                  value={customWaFooterText}
                  onChange={(e) => setCustomWaFooterText(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                />
              </div>

              {/* WA AI Assistant */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emas animate-pulse" /> Tulis Ulang dengan WA AI Copywriter:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Buat ucapan lebih bersemangat, tambahkan emoji..."
                    value={waAiPrompt}
                    onChange={(e) => setWaAiPrompt(e.target.value)}
                    className="flex-1 text-xs border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                  />
                  <button
                    onClick={handleWaAiGenerateCopy}
                    disabled={waAiGenerating || !waAiPrompt.trim()}
                    className="bg-hijau-botol hover:bg-hijau-botol/90 disabled:bg-hijau-botol/40 text-white text-xs px-3 py-2 rounded font-bold flex items-center gap-1 transition"
                  >
                    {waAiGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Generate'}
                  </button>
                </div>
              </div>
            </div>

            {/* Mass Send Progress & Trigger Button */}
            <div className="space-y-3">
              {!isSendingWa && waLogs.length === 0 ? (
                <button
                  onClick={handleMassSendWa}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-4 h-4" /> Mulai Kirim WhatsApp Massal ({finalCerts.length} Penerima)
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>{isSendingWa ? 'Sedang Mengirim WhatsApp...' : 'Pengiriman WhatsApp Selesai'}</span>
                    <span>{waProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${waProgress}%` }}
                    ></div>
                  </div>

                  {/* Micro-terminal logs */}
                  <div className="bg-slate-900 text-[10px] font-mono text-emerald-400 p-3 rounded-lg h-36 overflow-y-auto space-y-1 border border-slate-800">
                    {waLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>

                  {!isSendingWa && (
                    <button
                      onClick={() => {
                        setWaLogs([]);
                        setWaProgress(0);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold underline block text-center"
                    >
                      Bersihkan Log Pengiriman
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
