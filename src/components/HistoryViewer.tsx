import React, { useState } from 'react';
import { GeneratedCertificate, EventItem, CertificateTemplate } from '../types';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { 
  Search, 
  Calendar, 
  Mail, 
  FileDown, 
  ShieldCheck, 
  Trash2, 
  ExternalLink, 
  HelpCircle,
  Printer,
  Download,
  CheckSquare,
  Square,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface HistoryViewerProps {
  certificates: GeneratedCertificate[];
  events: EventItem[];
  templates: CertificateTemplate[];
  onDeleteCertificate: (id: string) => void;
  onVerifyCertificate: (id: string) => void;
}

export default function HistoryViewer({
  certificates,
  events,
  templates,
  onDeleteCertificate,
  onVerifyCertificate
}: HistoryViewerProps) {
  const [search, setSearch] = useState('');
  const [filterEventId, setFilterEventId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const filteredCerts = certificates.filter((c) => {
    const matchesSearch = 
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      c.participantEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());

    const matchesEvent = filterEventId === '' || c.eventId === filterEventId;

    return matchesSearch && matchesEvent;
  });

  const handleDownloadSinglePng = (cert: GeneratedCertificate) => {
    const link = document.createElement('a');
    link.href = cert.downloadPngUrl;
    link.download = `Sertifikat_${cert.participantName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSinglePdf = (cert: GeneratedCertificate) => {
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

  const handlePrintMultiple = (certsToPrint: GeneratedCertificate[]) => {
    if (certsToPrint.length === 0) {
      alert('Tidak ada sertifikat yang dipilih untuk dicetak.');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up browser diperbolehkan.');
      return;
    }

    const firstTemplate = templates.find(t => t.id === certsToPrint[0].templateId);
    const isPortrait = firstTemplate?.orientation === 'portrait';

    printWindow.document.write(`
      <html>
      <head>
        <title>Cetak Massal Sertifikat (${certsToPrint.length} Dokumen)</title>
        <style>
          @page {
            size: ${isPortrait ? 'portrait' : 'landscape'};
            margin: 0mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .cert-page {
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100vw;
            height: 100vh;
            box-sizing: border-box;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        ${certsToPrint.map(c => `
          <div class="cert-page">
            <img src="${c.downloadPngUrl}" onload="window.loadedCount = (window.loadedCount || 0) + 1; if(window.loadedCount === ${certsToPrint.length}) { window.print(); window.close(); }" />
          </div>
        `).join('')}
        <script>
          window.loadedCount = 0;
          setTimeout(() => {
            window.print();
            window.close();
          }, Math.max(3000, ${certsToPrint.length} * 500));
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleBulkDownloadPng = async (certsToDownload: GeneratedCertificate[]) => {
    if (certsToDownload.length === 0) return;
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      certsToDownload.forEach((cert) => {
        const base64Data = cert.downloadPngUrl.split(',')[1];
        const safeName = cert.participantName.replace(/[^a-zA-Z0-9]/g, '_');
        zip.file(`${safeName}_Sertifikat.png`, base64Data, { base64: true });
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sertifikat_Massal_PNG_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Gagal mendownload ZIP.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleBulkDownloadPdf = async (certsToDownload: GeneratedCertificate[]) => {
    if (certsToDownload.length === 0) return;
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      
      for (const cert of certsToDownload) {
        const template = templates.find(t => t.id === cert.templateId);
        const isPortrait = template?.orientation === 'portrait';
        const isF4 = template?.paperType === 'F4';
        
        const orientation = isPortrait ? 'p' : 'l';
        const pdfFormat = isF4 ? [330, 215] as [number, number] : 'a4';
        const pdfWidth = isPortrait ? (isF4 ? 215 : 210) : (isF4 ? 330 : 297);
        const pdfHeight = isPortrait ? (isF4 ? 330 : 297) : (isF4 ? 215 : 210);

        const pdf = new jsPDF(orientation, 'mm', pdfFormat);
        pdf.addImage(cert.downloadPngUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        const pdfBlob = pdf.output('blob');
        
        const safeName = cert.participantName.replace(/[^a-zA-Z0-9]/g, '_');
        zip.file(`${safeName}_Sertifikat.pdf`, pdfBlob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sertifikat_Massal_PDF_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Gagal mendownload ZIP.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCerts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCerts.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-6" id="history-tab-content">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Riwayat Cetak & Pengiriman</h2>
        <p className="text-xs text-gray-500">Daftar lengkap seluruh sertifikat digital yang berhasil digenerate oleh sistem.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, nomor sertifikat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-hijau-botol"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Event:</label>
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol text-gray-700 w-full"
          >
            <option value="">Semua Event</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {filteredCerts.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="bg-hijau-soft text-hijau-botol p-2 rounded-lg border border-hijau-botol/15">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-800 uppercase tracking-wider">Cetak Massal & Unduh ZIP</p>
              <p className="text-[10px] text-gray-500 font-medium">
                {selectedIds.length > 0 
                  ? `Terpilih ${selectedIds.length} dari ${filteredCerts.length} sertifikat` 
                  : `Menampilkan semua ${filteredCerts.length} sertifikat (Centang untuk memilih tertentu)`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            {/* Bulk Print button */}
            <button
              onClick={() => {
                const target = selectedIds.length > 0 
                  ? filteredCerts.filter(c => selectedIds.includes(c.id))
                  : filteredCerts;
                handlePrintMultiple(target);
              }}
              className="flex-1 md:flex-initial bg-hijau-botol hover:bg-hijau-botol/90 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
              title="Cetak sertifikat langsung lewat printer browser"
            >
              <Printer className="w-3.5 h-3.5" /> 
              {selectedIds.length > 0 ? `Cetak Terpilih (${selectedIds.length})` : 'Cetak Semua (Print All)'}
            </button>
            
            {/* Bulk Download PNG ZIP */}
            <button
              onClick={() => {
                const target = selectedIds.length > 0 
                  ? filteredCerts.filter(c => selectedIds.includes(c.id))
                  : filteredCerts;
                handleBulkDownloadPng(target);
              }}
              disabled={isDownloadingZip}
              className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
              title="Unduh seluruh sertifikat sebagai arsip gambar PNG (.zip)"
            >
              <Download className="w-3.5 h-3.5" /> 
              {selectedIds.length > 0 ? 'Unduh Terpilih PNG' : 'Unduh Semua PNG'}
            </button>

            {/* Bulk Download PDF ZIP */}
            <button
              onClick={() => {
                const target = selectedIds.length > 0 
                  ? filteredCerts.filter(c => selectedIds.includes(c.id))
                  : filteredCerts;
                handleBulkDownloadPdf(target);
              }}
              disabled={isDownloadingZip}
              className="flex-1 md:flex-initial bg-emas hover:bg-emas/90 disabled:bg-yellow-300 text-dark-green font-bold text-xs px-4 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
              title="Unduh seluruh sertifikat sebagai berkas PDF cetak (.zip)"
            >
              <FileText className="w-3.5 h-3.5" /> 
              {selectedIds.length > 0 ? 'Unduh Terpilih PDF' : 'Unduh Semua PDF'}
            </button>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-bold">
                <th className="p-4 w-10 text-center">
                  <button 
                    type="button"
                    onClick={toggleSelectAll} 
                    className="text-slate-400 hover:text-hijau-botol transition flex items-center justify-center mx-auto"
                    title="Pilih/Batal Pilih Semua"
                  >
                    {selectedIds.length === filteredCerts.length && filteredCerts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-hijau-botol" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Kode Hash</th>
                <th className="p-4">Nama Penerima</th>
                <th className="p-4">Email</th>
                <th className="p-4">Nama Kegiatan</th>
                <th className="p-4">Nomor Sertifikat</th>
                <th className="p-4">Tanggal Terbit</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredCerts.map((cert) => (
                <tr key={cert.id} className={`hover:bg-slate-50/50 transition ${selectedIds.includes(cert.id) ? 'bg-hijau-soft/20' : ''}`}>
                  <td className="p-4 text-center">
                    <button 
                      type="button"
                      onClick={() => toggleSelectOne(cert.id)} 
                      className="text-slate-400 hover:text-hijau-botol transition flex items-center justify-center mx-auto"
                      title="Pilih baris ini"
                    >
                      {selectedIds.includes(cert.id) ? (
                        <CheckSquare className="w-4 h-4 text-hijau-botol" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-4 font-mono font-bold text-gray-400">{cert.id}</td>
                  <td className="p-4 font-bold text-gray-800">{cert.participantName}</td>
                  <td className="p-4 text-gray-500">{cert.participantEmail || <span className="text-gray-300 italic">offline</span>}</td>
                  <td className="p-4 max-w-xs truncate text-gray-600">{cert.eventName}</td>
                  <td className="p-4 font-mono font-semibold text-hijau-botol">{cert.certificateNumber}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(cert.generatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cert.status === 'Emailed' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                        : 'bg-hijau-soft text-hijau-botol border border-hijau-botol/20'
                    }`}>
                      {cert.status === 'Emailed' ? 'Teremail & Cetak' : 'Selesai Cetak'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Verification Gate */}
                      <button
                        onClick={() => onVerifyCertificate(cert.id)}
                        className="p-1.5 text-slate-400 hover:text-hijau-botol hover:bg-slate-50 rounded-lg transition"
                        title="Verifikasi Validasi Keabsahan"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>

                      {/* Download PNG */}
                      <button
                        onClick={() => cert.downloadPngUrl ? handleDownloadSinglePng(cert) : alert('Gambar sertifikat lama ini telah diarsipkan untuk menghemat ruang penyimpanan browser lokal Anda. Gunakan fitur Verifikasi untuk melihat metadata keabsahan resmi.')}
                        className={`p-1.5 rounded-lg transition ${
                          cert.downloadPngUrl 
                            ? 'text-slate-400 hover:text-hijau-botol hover:bg-slate-50' 
                            : 'text-slate-200 cursor-not-allowed'
                        }`}
                        title={cert.downloadPngUrl ? "Unduh PNG" : "Gambar Diarsipkan"}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => cert.downloadPngUrl ? handleDownloadSinglePdf(cert) : alert('Gambar sertifikat lama ini telah diarsipkan untuk menghemat ruang penyimpanan browser lokal Anda. Gunakan fitur Verifikasi untuk melihat metadata keabsahan resmi.')}
                        className={`p-1.5 rounded-lg transition ${
                          cert.downloadPngUrl 
                            ? 'text-slate-400 hover:text-hijau-botol hover:bg-slate-50' 
                            : 'text-slate-200 cursor-not-allowed'
                        }`}
                        title={cert.downloadPngUrl ? "Unduh PDF" : "Gambar Diarsipkan"}
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Print Single */}
                      <button
                        onClick={() => cert.downloadPngUrl ? handlePrintSingle(cert) : alert('Gambar sertifikat lama ini telah diarsipkan untuk menghemat ruang penyimpanan browser lokal Anda. Gunakan fitur Verifikasi untuk melihat metadata keabsahan resmi.')}
                        className={`p-1.5 rounded-lg transition ${
                          cert.downloadPngUrl 
                            ? 'text-slate-400 hover:text-hijau-botol hover:bg-slate-50' 
                            : 'text-slate-200 cursor-not-allowed'
                        }`}
                        title={cert.downloadPngUrl ? "Cetak Satuan" : "Gambar Diarsipkan"}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Delete from history */}
                      <button
                        onClick={() => onDeleteCertificate(cert.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCerts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-sm space-y-1.5">
                    <HelpCircle className="w-12 h-12 text-slate-200 mx-auto" />
                    <p>Tidak ada riwayat cetak ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
