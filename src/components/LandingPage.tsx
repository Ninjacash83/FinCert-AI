import React from 'react';
import { 
  Award, 
  ArrowRight, 
  Sparkles, 
  FileSpreadsheet, 
  Layers, 
  PenTool, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Download, 
  Image as ImageIcon, 
  Tv, 
  Database, 
  BarChart3, 
  Users, 
  Building2, 
  Globe, 
  Smartphone,
  Compass,
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigateToTab: (tab: string) => void;
  stats: {
    eventsCount: number;
    templatesCount: number;
    certsCount: number;
  };
}

export default function LandingPage({ onEnterApp, onNavigateToTab, stats }: LandingPageProps) {
  // Rotate or list alternative taglines
  const alternatiftaglines = [
    "Create. Verify. Certify.",
    "AI-Powered Certificate Platform.",
    "One Click. Unlimited Certificates.",
    "Professional Certificates Made Easy.",
    "Trusted Digital Certification Ecosystem."
  ];

  // Map requested features to icons and descriptions
  const features = [
    { 
      icon: Sparkles, 
      title: "AI Certificate Generator", 
      desc: "Rancang tata letak cerdas dan gunakan asisten AI Copywriter untuk menghasilkan deskripsi & pesan WhatsApp penyerahan sertifikat secara otomatis.",
      badge: "AI Powered" 
    },
    { 
      icon: FileSpreadsheet, 
      title: "Import Excel, CSV & Google Sheets", 
      desc: "Unggah data peserta langsung dari file Excel (XLSX), CSV, atau hubungkan dengan database Google Sheets untuk cetak massal instan.",
      badge: "Google Sheets Sync" 
    },
    { 
      icon: Layers, 
      title: "Drag & Drop Template Designer", 
      desc: "Atur posisi placeholder nama, nomor, instansi, QR Code secara visual dengan piksel presisi dan pilihan palet warna kustom." 
    },
    { 
      icon: PenTool, 
      title: "Digital Signature", 
      desc: "Sematkan tanda tangan digital & stempel basah institusi secara otomatis pada koordinat yang ditentukan untuk keabsahan resmi." 
    },
    { 
      icon: ShieldCheck, 
      title: "QR Code Verification", 
      desc: "Setiap sertifikat dilengkapi QR Code verifikasi unik dengan kode pengaman kriptografis SHA256 untuk memvalidasi keaslian dokumen secara publik." 
    },
    { 
      icon: Mail, 
      title: "Email Certificate", 
      desc: "Kirim sertifikat PDF berkualitas tinggi langsung ke kotak masuk email peserta secara otomatis dengan integrasi server mail SMTP." 
    },
    { 
      icon: MessageSquare, 
      title: "WhatsApp Certificate Sender", 
      desc: "Kirim pesan penyerahan sertifikat personal lewat WhatsApp API secara real-time dengan asisten penyusun pesan AI." 
    },
    { 
      icon: Download, 
      title: "PDF HD Export", 
      desc: "Unduh seluruh sertifikat yang telah digenerasi dalam bentuk file PDF resolusi tinggi (High Definition) siap cetak." 
    },
    { 
      icon: ImageIcon, 
      title: "PNG HD Export", 
      desc: "Ekspor sertifikat dalam format gambar PNG kualitas prima yang cocok untuk diunggah di portofolio LinkedIn peserta." 
    },
    { 
      icon: Tv, 
      title: "Digital Badge", 
      desc: "Generasi lencana digital (Digital Badge) kustom yang menawan sebagai pelengkap apresiasi pencapaian peserta." 
    },
    { 
      icon: Database, 
      title: "Cloud Storage & Google Sheets", 
      desc: "Penyimpanan otomatis riwayat cetak serta integrasi tangguh dengan Google Sheets milik akun Anda untuk menjamin kedaulatan data." 
    },
    { 
      icon: BarChart3, 
      title: "Dashboard Analytics", 
      desc: "Pantau statistik cetak, tingkat pengiriman email, serta grafik perkembangan distribusi sertifikat secara real-time." 
    },
    { 
      icon: Users, 
      title: "Multi User (Simulasi Role)", 
      desc: "Simulasikan peran pengguna sebagai Super Admin, Admin, dan Operator dengan hak akses fitur yang tersegregasi aman." 
    },
    { 
      icon: Building2, 
      title: "Multi Organization", 
      desc: "Dukung manajemen multi-organisasi yang memisahkan data event untuk berbagai penyelenggara, divisi, atau institusi mitra." 
    },
    { 
      icon: Globe, 
      title: "Multi Language", 
      desc: "Antarmuka dan template penulisan sertifikat yang mendukung multibahasa untuk skala kegiatan nasional hingga internasional." 
    },
    { 
      icon: Smartphone, 
      title: "Mobile Friendly", 
      desc: "Sistem verifikasi publik, penampil sertifikat, serta halaman manajemen dirancang responsif sempurna untuk akses HP." 
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in" id="landing-portal">
      {/* Premium Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-hijau-botol via-dark-green to-[#081811] text-white p-8 md:p-14 shadow-xl border border-white/5">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Floating glowing orbs */}
        <div className="absolute top-10 right-20 w-72 h-72 bg-emas/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-hijau-soft/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Award className="w-4 h-4 text-emas" />
              <span className="text-xs font-bold uppercase tracking-wider text-emas">FinCert AI</span>
              <span className="text-xs text-white/60">| by FINORA GROUP</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">
                Smart Digital <span className="text-emas">Certification.</span>
              </h1>
              <p className="text-lg text-hijau-soft/90 max-w-xl font-light leading-relaxed">
                Platform SaaS berbasis Artificial Intelligence yang dirancang untuk mengotomatisasi pembuatan, pengelolaan, verifikasi, dan distribusi sertifikat digital secara cepat, aman, dan profesional.
              </p>
            </div>

            {/* Alternatif Tagline Pill Carousels */}
            <div className="flex flex-wrap gap-2 pt-2">
              {alternatiftaglines.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] md:text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-1.5 rounded-md border border-white/5 transition"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center justify-center gap-2.5 bg-emas hover:bg-emas/90 text-dark-green font-extrabold px-7 py-4 rounded-xl shadow-lg shadow-emas/10 transition-transform active:scale-95 text-sm uppercase tracking-wider"
              >
                Masuk Portal Aplikasi
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              
              <button
                onClick={() => onNavigateToTab('verify')}
                className="inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-4 rounded-xl border border-white/10 transition text-sm"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-emas" />
                Cek Verifikasi Sertifikat
              </button>
            </div>
          </div>

          {/* Mini Interactive Sandbox Widget */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emas" />
              Status Sinkronisasi Sistem
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-dark-green/60 p-3.5 rounded-xl border border-white/5">
                <span className="text-2xl font-black text-emas block">{stats.eventsCount}</span>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Event Aktif</span>
              </div>
              <div className="bg-dark-green/60 p-3.5 rounded-xl border border-white/5">
                <span className="text-2xl font-black text-emas block">{stats.templatesCount}</span>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Template</span>
              </div>
              <div className="bg-dark-green/60 p-3.5 rounded-xl border border-white/5">
                <span className="text-2xl font-black text-emas block">{stats.certsCount}</span>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Tercetak</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-hijau-soft/80">
              <div className="flex items-center justify-between p-2.5 bg-black/25 rounded-lg border border-white/5">
                <span className="font-medium text-slate-300">Database Engine:</span>
                <span className="font-mono text-[10px] bg-emas/20 text-emas font-bold px-2 py-0.5 rounded border border-emas/10">Google Sheets DB (Cloud Connected)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-black/25 rounded-lg border border-white/5">
                <span className="font-medium text-slate-300">Cryptographic Standard:</span>
                <span className="font-mono text-[10px] bg-white/10 text-white font-bold px-2 py-0.5 rounded">SHA256 & QR Code SECURE</span>
              </div>
            </div>

            <div className="p-3 bg-emas/5 rounded-xl border border-emas/10 text-xs text-emas/90 flex gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emas" />
              <div>
                <p className="font-bold">Sistem Siap Digunakan</p>
                <p className="text-[11px] opacity-80">Gunakan panel di sebelah kiri untuk mengelola event, mendesain template, dan melakukan generate massal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visi, Misi & Brand Positioning Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Brand Positioning Card */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-hijau-botol bg-hijau-soft px-3 py-1 rounded-full uppercase tracking-wider">
              Brand Positioning
            </span>
            <h2 className="text-xl font-extrabold text-slate-800 leading-snug">
              Mengapa Memilih FinCert AI?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              FinCert AI adalah platform SaaS berbasis Artificial Intelligence yang dirancang untuk mengotomatisasi pembuatan, pengelolaan, verifikasi, dan distribusi sertifikat digital secara cepat, aman, dan profesional.
            </p>
          </div>
          
          <div className="border-t border-gray-50 pt-4 mt-6">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Powered by
            </p>
            <p className="text-base font-extrabold text-slate-700">
              FINORA GROUP
            </p>
          </div>
        </div>

        {/* Visi & Misi Card */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          {/* Visi */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-hijau-botol">
              <Compass className="w-5 h-5 stroke-[2.5]" />
              <h3 className="font-bold text-base text-slate-800 uppercase tracking-wider">Visi Perusahaan</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic pl-7 border-l-2 border-emas">
              &ldquo;Menjadi platform sertifikasi digital berbasis AI terpercaya di Indonesia dan Asia Tenggara yang mendukung transformasi digital dunia pendidikan, pelatihan, dan organisasi.&rdquo;
            </p>
          </div>

          {/* Misi */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-hijau-botol">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <h3 className="font-bold text-base text-slate-800 uppercase tracking-wider">Misi Utama</h3>
            </div>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-7 text-xs font-semibold text-slate-700">
              <li className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="bg-hijau-botol text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                <span>Mengotomatisasi proses pembuatan sertifikat dengan AI.</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="bg-hijau-botol text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                <span>Menyediakan sistem verifikasi sertifikat berbasis QR Code.</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="bg-hijau-botol text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                <span>Mempermudah distribusi sertifikat melalui Email dan WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="bg-hijau-botol text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                <span>Menyediakan template profesional yang mudah dikustomisasi.</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 col-span-1 sm:col-span-2">
                <span className="bg-hijau-botol text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">5</span>
                <span>Mendukung berbagai institusi dengan sistem multi-organisasi yang aman dan terisolasi.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feature Bento-Grid Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">16 Fitur Unggulan FinCert AI</h2>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Sistem terlengkap untuk pembuatan, pengolahan, validasi, dan pengiriman sertifikat digital dalam satu klik.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, index) => (
            <div 
              key={index} 
              className="bg-white hover:border-hijau-botol/30 p-5 rounded-2xl shadow-sm border border-gray-100 transition duration-200 flex flex-col justify-between hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-hijau-soft text-hijau-botol flex items-center justify-center">
                  <feat.icon className="w-5 h-5 stroke-[2]" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-xs text-slate-800 tracking-tight">{feat.title}</h3>
                    {feat.badge && (
                      <span className="bg-emas/15 text-emas text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Workflow Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 text-base">Alur Kerja Instan 3 Langkah</h3>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-xs text-gray-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-5 h-5 bg-hijau-soft text-hijau-botol rounded-full flex items-center justify-center text-[10px]">1</span> 
              Pilih / Rancang Template
            </span>
            <span className="text-gray-300 hidden sm:inline">➔</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-5 h-5 bg-hijau-soft text-hijau-botol rounded-full flex items-center justify-center text-[10px]">2</span> 
              Import Data Excel / Sheets
            </span>
            <span className="text-gray-300 hidden sm:inline">➔</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-5 h-5 bg-hijau-soft text-hijau-botol rounded-full flex items-center justify-center text-[10px]">3</span> 
              Generate & Kirim Massal
            </span>
          </div>
        </div>
        
        <button
          onClick={onEnterApp}
          className="bg-hijau-botol hover:bg-dark-green text-white font-extrabold px-6 py-3.5 rounded-xl transition text-xs uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
        >
          Mulai Buat Sertifikat
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
