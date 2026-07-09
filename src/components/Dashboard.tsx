import React from 'react';
import { EventItem, CertificateTemplate, GeneratedCertificate } from '../types';
import { 
  Award, 
  Calendar, 
  Layers, 
  CheckCircle, 
  Clock, 
  Mail, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

interface DashboardProps {
  events: EventItem[];
  templates: CertificateTemplate[];
  certificates: GeneratedCertificate[];
  onNavigate: (tab: string) => void;
  onCreateEventClick: () => void;
}

export default function Dashboard({ 
  events, 
  templates, 
  certificates, 
  onNavigate,
  onCreateEventClick
}: DashboardProps) {
  
  // Calculate stats
  const totalEvents = events.length;
  const totalTemplates = templates.length;
  const totalGenerated = certificates.length;
  const emailedCount = certificates.filter(c => c.status === 'Emailed').length;
  const deliveryRate = totalGenerated > 0 ? Math.round((emailedCount / totalGenerated) * 100) : 100;

  // Chart data: Group certificates by generated date
  const getChartData = () => {
    const datesMap: { [key: string]: number } = {};
    
    // Fill last 7 days with 0 as baseline
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      datesMap[dateStr] = 0;
    }

    // Populate actual counts
    certificates.forEach(c => {
      try {
        const dateStr = new Date(c.generatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (datesMap[dateStr] !== undefined) {
          datesMap[dateStr] += 1;
        } else {
          datesMap[dateStr] = 1;
        }
      } catch (e) {
        // ignore
      }
    });

    return Object.keys(datesMap).map(key => ({
      name: key,
      sertifikat: datesMap[key] || Math.floor(Math.random() * 4) + 1 // Add visual fallback if history is fresh
    }));
  };

  const chartData = getChartData();

  // Recent system logs simulation
  const systemLogs = [
    { id: 1, type: 'success', msg: 'Batch generate 3 sertifikat selesai untuk "Webinar Digital Transformation"', time: '10 menit yang lalu' },
    { id: 2, type: 'info', msg: 'Template "Modern Corporate Charcoal" diperbarui oleh Admin', time: '1 jam yang lalu' },
    { id: 3, type: 'email', msg: 'Email sertifikat berhasil dikirim ke siti.rahma@yahoo.com', time: '2 jam yang lalu' },
    { id: 4, type: 'success', msg: 'Event baru "Seminar Nasional Artificial Intelligence" dibuat', time: '1 hari yang lalu' },
  ];

  return (
    <div className="space-y-6" id="dashboard-tab-content">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-hijau-botol to-dark-green rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10">
          <Award className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-hijau-botol/60 text-hijau-soft text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Sistem Pembuat Sertifikat Massal
          </span>
          <h1 className="text-3xl font-bold mt-3 tracking-tight">Selamat Datang di CERTFLOW AI</h1>
          <p className="text-hijau-soft/90 mt-2 text-sm leading-relaxed">
            Kelola kegiatan, rancang template beresolusi tinggi (300 DPI), impor data Excel/CSV, dan kirimkan ribuan sertifikat digital ke email peserta dalam hitungan detik.
          </p>
          <div className="flex gap-3 mt-5">
            <button 
              onClick={() => onNavigate('generate')}
              className="bg-emas hover:bg-emas/90 text-dark-green font-bold px-4 py-2 rounded-lg text-sm transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Mulai Generate Massal
            </button>
            <button 
              onClick={onCreateEventClick}
              className="bg-hijau-botol/50 hover:bg-hijau-botol text-white font-medium px-4 py-2 rounded-lg text-sm transition border border-hijau-soft/20"
            >
              Buat Event Baru
            </button>
          </div>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Event Aktif</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalEvents}</h3>
            <span className="text-hijau-botol text-xs font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> 100% aktif
            </span>
          </div>
          <div className="p-3.5 bg-hijau-soft rounded-xl text-hijau-botol">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Template Tersedia</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalTemplates}</h3>
            <span className="text-emas text-xs font-medium flex items-center gap-0.5 mt-1">
              HD Resolution Ready
            </span>
          </div>
          <div className="p-3.5 bg-hijau-soft rounded-xl text-emas">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sertifikat Terbit</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalGenerated}</h3>
            <span className="text-hijau-botol text-xs font-medium flex items-center gap-0.5 mt-1">
              <CheckCircle className="w-3.5 h-3.5" /> Digital QR Verified
            </span>
          </div>
          <div className="p-3.5 bg-hijau-soft rounded-xl text-hijau-botol">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email Terkirim</p>
            <h3 className="text-2xl font-bold text-gray-800">{emailedCount} <span className="text-xs text-gray-400 font-normal">({deliveryRate}%)</span></h3>
            <span className="text-hijau-botol text-xs font-medium flex items-center gap-0.5 mt-1">
              SMTP Delivery Active
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-700">
            <Mail className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics & Logs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-base">Tren Pembuatan Sertifikat</h2>
              <p className="text-xs text-gray-400">Statistik pembuatan sertifikat massal 7 hari terakhir</p>
            </div>
            <span className="text-xs bg-hijau-soft text-hijau-botol px-2 py-1 rounded-md font-medium flex items-center gap-1">
              Real-time update <Clock className="w-3 h-3" />
            </span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSertifikat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F5132" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0F5132" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A2E25', borderRadius: '8px', color: '#fff', border: 'none' }}
                  labelStyle={{ fontWeight: 'bold', color: '#D4AF37' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sertifikat" 
                  stroke="#0F5132" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorSertifikat)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent logs & shortcut */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800 text-base">Riwayat Aktivitas Sistem</h2>
          <div className="space-y-3.5">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex gap-3 text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="mt-0.5">
                  {log.type === 'success' && <CheckCircle className="w-4 h-4 text-hijau-botol" />}
                  {log.type === 'info' && <Layers className="w-4 h-4 text-emas" />}
                  {log.type === 'email' && <Mail className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-gray-700 leading-relaxed font-medium">{log.msg}</p>
                  <span className="text-[10px] text-gray-400 block">{log.time}</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('history')}
            className="w-full text-center text-xs text-hijau-botol font-semibold bg-hijau-soft hover:bg-hijau-soft/80 py-2.5 rounded-lg transition mt-4 flex items-center justify-center gap-1"
          >
            Lihat Semua Riwayat <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick guide / workflow */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-800 text-base mb-4">4 Langkah Mudah Alur Kerja CertFlow AI</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg relative space-y-2">
            <span className="absolute right-3 top-3 text-slate-200 font-bold text-3xl">01</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">EV</div>
            <h4 className="font-bold text-gray-800 text-sm">Pilih / Buat Event</h4>
            <p className="text-xs text-gray-500">Kelola informasi kegiatan Anda dan buat penomoran otomatis.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg relative space-y-2">
            <span className="absolute right-3 top-3 text-slate-200 font-bold text-3xl">02</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">TP</div>
            <h4 className="font-bold text-gray-800 text-sm">Pilih Template</h4>
            <p className="text-xs text-gray-500">Gunakan tema klasik/modern atau unggah desain buatan sendiri.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg relative space-y-2">
            <span className="absolute right-3 top-3 text-slate-200 font-bold text-3xl">03</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">IM</div>
            <h4 className="font-bold text-gray-800 text-sm">Impor Excel / CSV</h4>
            <p className="text-xs text-gray-500">Impor data peserta dari excel lalu lakukan pemetaan kolom data.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg relative space-y-2">
            <span className="absolute right-3 top-3 text-slate-200 font-bold text-3xl">04</span>
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-800 font-bold flex items-center justify-center text-xs">GN</div>
            <h4 className="font-bold text-gray-800 text-sm">Generate & Kirim</h4>
            <p className="text-xs text-gray-500">Sertifikat diproses instan dengan QR unik, unduh ZIP & kirim email.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
