import React, { useState, useEffect } from 'react';
import { 
  mockEvents, 
  mockTemplates, 
  mockParticipants, 
  mockCertificates, 
  defaultSettings, 
  mockUsers 
} from './data/mockData';
import { EventItem, CertificateTemplate, GeneratedCertificate, AppSettings, UserRole, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import EventsManager from './components/EventsManager';
import TemplateBuilder from './components/TemplateBuilder';
import ImportGenerate from './components/ImportGenerate';
import HistoryViewer from './components/HistoryViewer';
import VerificationPage from './components/VerificationPage';
import SystemSettings from './components/SystemSettings';
import WhatsappAiCopywriter from './components/WhatsappAiCopywriter';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';

import { 
  Award, 
  LayoutDashboard, 
  Calendar, 
  Layers, 
  Play, 
  History, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  User, 
  Menu, 
  X,
  Sparkles,
  ChevronRight,
  Info,
  Home,
  Lock,
  LogOut
} from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStandaloneVerify, setIsStandaloneVerify] = useState(false);

  // Core App States
  const [events, setEvents] = useState<EventItem[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [certificates, setCertificates] = useState<GeneratedCertificate[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  // User Authentication Simulation
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cf_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const stored = localStorage.getItem('cf_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return mockUsers[0];
      }
    }
    return mockUsers[0];
  });
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  // Verification helper state
  const [verifyTargetId, setVerifyTargetId] = useState<string | null>(null);

  // Initialize from LocalStorage or Fallback Mock Data
  useEffect(() => {
    const storedEvents = localStorage.getItem('cf_events');
    const storedTemplates = localStorage.getItem('cf_templates');
    const storedCerts = localStorage.getItem('cf_certificates');
    const storedSettings = localStorage.getItem('cf_settings');

    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      setEvents(mockEvents);
      localStorage.setItem('cf_events', JSON.stringify(mockEvents));
    }

    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      setTemplates(mockTemplates);
      localStorage.setItem('cf_templates', JSON.stringify(mockTemplates));
    }

    if (storedCerts) {
      setCertificates(JSON.parse(storedCerts));
    } else {
      setCertificates(mockCertificates);
      localStorage.setItem('cf_certificates', JSON.stringify(mockCertificates));
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(defaultSettings);
      localStorage.setItem('cf_settings', JSON.stringify(defaultSettings));
    }
  }, []);

  // Listen for standalone verification params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyCode = params.get('verify') || params.get('code');
    const tabParam = params.get('tab');
    if (tabParam === 'verify' || verifyCode) {
      setIsStandaloneVerify(true);
      setCurrentTab('verify');
      if (verifyCode) {
        setVerifyTargetId(verifyCode);
      }
    }
  }, [certificates]);

  // Sync state modifications to local storage helper with auto-recovery for QuotaExceededError
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Storage quota exceeded!", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        if (key === 'cf_certificates' && Array.isArray(data)) {
          console.warn("Storage quota exceeded. Progressively pruning old certificate image data to recover space...");
          
          // Make a deep-enough copy of certificates to avoid direct mutating issues
          let pruned = data.map(item => ({ ...item }));

          // Step 1: Strip image base64 strings from older certificates (indices >= 12)
          let strippedCount = 0;
          for (let i = pruned.length - 1; i >= 12; i--) {
            if (pruned[i].downloadPngUrl || pruned[i].downloadPdfUrl) {
              pruned[i].downloadPngUrl = "";
              pruned[i].downloadPdfUrl = "";
              strippedCount++;
            }
          }

          if (strippedCount > 0) {
            console.warn(`Stripped images from ${strippedCount} older certificates (kept first 12 with images).`);
            try {
              localStorage.setItem('cf_certificates', JSON.stringify(pruned));
              setCertificates(pruned);
              return;
            } catch (retryErr) {
              console.error("Still exceeded quota after stripping older than 12. Stripping more...", retryErr);
            }
          }

          // Step 2: Strip images from certificates starting from index 5
          strippedCount = 0;
          for (let i = pruned.length - 1; i >= 5; i--) {
            if (pruned[i].downloadPngUrl || pruned[i].downloadPdfUrl) {
              pruned[i].downloadPngUrl = "";
              pruned[i].downloadPdfUrl = "";
              strippedCount++;
            }
          }

          if (strippedCount > 0) {
            console.warn(`Stripped images from ${strippedCount} older certificates (kept first 5 with images).`);
            try {
              localStorage.setItem('cf_certificates', JSON.stringify(pruned));
              setCertificates(pruned);
              return;
            } catch (retryErr) {
              console.error("Still exceeded quota. Doing hard slice of total records...", retryErr);
            }
          }

          // Step 3: Keep only the latest 15 total records (with stripped images)
          if (pruned.length > 15) {
            const hardPruned = pruned.slice(0, 15);
            try {
              localStorage.setItem('cf_certificates', JSON.stringify(hardPruned));
              setCertificates(hardPruned);
              console.warn("Successfully saved hard-pruned list of latest 15 records.");
              return;
            } catch (retryErr) {
              console.error("Still failing after hard-pruning to 15. Trying 5...", retryErr);
            }
          }

          // Step 4: Keep only the latest 5 total records
          const ultraPruned = pruned.slice(0, 5);
          try {
            localStorage.setItem('cf_certificates', JSON.stringify(ultraPruned));
            setCertificates(ultraPruned);
            console.warn("Successfully saved ultra-pruned list of latest 5 records.");
            return;
          } catch (retryErr) {
            console.error("Could not free enough space even with 5 records.", retryErr);
          }
        } else {
          alert("Peringatan: Penyimpanan browser (LocalStorage) penuh! Gambar latar belakang kustom, logo, atau tanda tangan yang diunggah sebelumnya berukuran terlalu besar. Silakan hapus beberapa template atau gunakan berkas gambar dengan resolusi lebih kecil.");
        }
      }
    }
  };

  // 1. Events Handlers
  const handleAddEvent = (newEvent: Omit<EventItem, 'id' | 'createdAt'>) => {
    const item: EventItem = {
      ...newEvent,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const next = [item, ...events];
    setEvents(next);
    saveToLocalStorage('cf_events', next);
  };

  const handleUpdateEvent = (updated: EventItem) => {
    const next = events.map(e => e.id === updated.id ? updated : e);
    setEvents(next);
    saveToLocalStorage('cf_events', next);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus event ini? Seluruh rancangan nomor urut terkait akan ikut terhapus.')) {
      const next = events.filter(e => e.id !== id);
      setEvents(next);
      saveToLocalStorage('cf_events', next);
      if (activeEventId === id) setActiveEventId(null);
    }
  };

  // 2. Templates Handlers
  const handleSaveTemplate = (updated: CertificateTemplate) => {
    const next = templates.map(t => t.id === updated.id ? updated : t);
    setTemplates(next);
    saveToLocalStorage('cf_templates', next);
  };

  const handleAddTemplate = (name: string, backgroundUrl: string) => {
    const item: CertificateTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      backgroundUrl,
      primaryColor: '#0F5132',
      secondaryColor: '#d97706',
      accentColor: '#FCFBF7',
      placeholders: {
        nama: { x: 50, y: 46, fontSize: 36, color: '#0F5132', bold: true, italic: false, align: 'center', uppercase: true, enabled: true },
        nomor: { x: 50, y: 16, fontSize: 16, color: '#d97706', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
        instansi: { x: 50, y: 55, fontSize: 18, color: '#4b5563', bold: false, italic: true, align: 'center', uppercase: false, enabled: true },
        event: { x: 50, y: 68, fontSize: 24, color: '#1f2937', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
        tanggal: { x: 30, y: 82, fontSize: 15, color: '#4b5563', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
        jabatan: { x: 50, y: 61, fontSize: 16, color: '#374151', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
        nilai: { x: 70, y: 82, fontSize: 15, color: '#4b5563', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
        qr: { x: 86, y: 16, fontSize: 12, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: true, qrSize: 90 },
      },
      canvasWidth: 1200,
      canvasHeight: 848,
      createdAt: new Date().toISOString()
    };
    const next = [...templates, item];
    setTemplates(next);
    saveToLocalStorage('cf_templates', next);
  };

  // 3. Certificates Handlers
  const handleAddCertificates = (newCerts: GeneratedCertificate[]) => {
    const next = [...newCerts, ...certificates];
    setCertificates(next);
    saveToLocalStorage('cf_certificates', next);
  };

  const handleDeleteCertificate = (id: string) => {
    if (confirm('Hapus catatan sertifikat ini dari riwayat penerbitan?')) {
      const next = certificates.filter(c => c.id !== id);
      setCertificates(next);
      saveToLocalStorage('cf_certificates', next);
    }
  };

  const handleVerifyCertificateAction = (id: string) => {
    setVerifyTargetId(id);
    setCurrentTab('verify');
  };

  // 4. Settings Handler
  const handleSaveSettings = (updated: AppSettings) => {
    setSettings(updated);
    saveToLocalStorage('cf_settings', updated);
  };

  // Set selected Event
  useEffect(() => {
    if (events.length > 0 && !activeEventId) {
      setActiveEventId(events[0].id);
    }
  }, [events, activeEventId]);

  // Sidebar Menu Items definitions
  const menuItems = [
    { id: 'landing', label: 'Tentang FinCert AI', icon: Home, roles: ['Super Admin', 'Admin', 'Operator'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Operator'] },
    { id: 'events', label: 'Manajemen Event', icon: Calendar, roles: ['Super Admin', 'Admin'] },
    { id: 'templates', label: 'Template Builder', icon: Layers, roles: ['Super Admin', 'Admin'] },
    { id: 'generate', label: 'Generate Massal', icon: Play, roles: ['Super Admin', 'Admin', 'Operator'] },
    { id: 'whatsapp-copywriter', label: 'Asisten Copywriter WA', icon: Sparkles, roles: ['Super Admin', 'Admin', 'Operator'] },
    { id: 'history', label: 'Riwayat Cetak', icon: History, roles: ['Super Admin', 'Admin', 'Operator'] },
    { id: 'verify', label: 'Verifikasi Publik', icon: ShieldCheck, roles: ['Super Admin', 'Admin', 'Operator'] },
    { id: 'settings', label: 'Pengaturan Sistem', icon: SettingsIcon, roles: ['Super Admin'] },
  ];

  const allowedTabs = menuItems
    .filter(item => item.roles.includes(currentUser.role))
    .map(item => item.id);

  const handleTabChange = (tabId: string) => {
    if (allowedTabs.includes(tabId)) {
      setCurrentTab(tabId);
      setMobileMenuOpen(false);
    }
  };

  if (isStandaloneVerify) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-natural to-hijau-soft/30 text-dark-green font-sans antialiased flex flex-col">
        {/* Simple Standalone Public Header */}
        <header className="bg-hijau-botol text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-emas stroke-[2.5]" />
            <div>
              <h1 className="font-extrabold text-base tracking-wider text-white">FINCERT <span className="text-emas">AI by FINORA</span></h1>
              <p className="text-[10px] text-hijau-soft font-semibold -mt-0.5 uppercase tracking-wider">Sistem Verifikasi Sertifikat Resmi</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsStandaloneVerify(false);
              setCurrentTab('dashboard');
              window.history.pushState({}, '', window.location.origin);
            }}
            className="text-xs font-bold text-emas border border-emas/30 hover:bg-emas hover:text-hijau-botol px-3.5 py-1.5 rounded-lg transition"
          >
            Masuk Portal Utama
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col justify-center">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Verifikasi Keabsahan Dokumen</h2>
            <p className="text-xs text-gray-500 mt-1">Layanan publik untuk memvalidasi keaslian sertifikat digital secara instan dan aman.</p>
          </div>
          
          <VerificationPage 
            certificates={certificates}
            templates={templates}
            initialVerifyId={verifyTargetId}
            onClearInitialVerifyId={() => setVerifyTargetId(null)}
          />

          <footer className="mt-12 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-4">
            <p>© {new Date().getFullYear()} FinCert AI by FINORA GROUP. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="mt-0.5 text-gray-400/80">Secured with Google Cloud Platform & SHA256 Cryptography Verification</p>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-natural text-dark-green font-sans flex flex-col md:flex-row antialiased">
      
      {/* MOBILE HEADER TOPBAR */}
      <header className="md:hidden bg-hijau-botol text-white px-4 py-3.5 flex items-center justify-between border-b border-hijau-botol/30 shadow-sm z-50">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-emas stroke-[2.5]" />
          <span className="font-extrabold text-lg tracking-wider text-white">FINCERT <span className="text-emas">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          {/* Simple Mobile Role Selector icon trigger */}
          <button 
            onClick={() => {
              const currentIdx = mockUsers.findIndex(u => u.id === currentUser.id);
              const nextUser = mockUsers[(currentIdx + 1) % mockUsers.length];
              setCurrentUser(nextUser);
              if (!menuItems.find(m => m.id === currentTab)?.roles.includes(nextUser.role)) {
                setCurrentTab('dashboard');
              }
            }}
            className="text-[10px] bg-hijau-botol/70 text-emas font-bold px-2.5 py-1.5 rounded border border-hijau-botol uppercase"
            title="Ganti Peran Pengguna"
          >
            {currentUser.role.split(' ')[0]}
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-hijau-soft hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-hijau-botol/95 z-40 pt-16 flex flex-col justify-between p-4">
          <nav className="space-y-1.5 pt-4">
            {menuItems.map((item) => {
              const isAllowed = item.roles.includes(currentUser.role);
              if (!isAllowed) return null;
              const isSelected = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                    isSelected 
                      ? 'bg-emas text-hijau-botol' 
                      : 'text-hijau-soft hover:bg-hijau-botol/50 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User profile bottom details in mobile menu */}
          <div className="border-t border-hijau-botol/30 pt-4 flex items-center gap-3">
            <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-hijau-botol/20" />
            <div className="text-left">
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <span className="text-[10px] text-emas font-semibold uppercase">{currentUser.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP PERMANENT ACCENT SIDEBAR */}
      <aside className="hidden md:flex md:w-64 bg-hijau-botol text-white flex-col justify-between border-r border-hijau-botol/20 shadow-md flex-shrink-0 z-30">
        <div className="p-5 space-y-6">
          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <Award className="w-7 h-7 text-emas stroke-[2.5]" />
            <div>
              <h1 className="font-black text-lg tracking-wider text-white">FINCERT AI</h1>
              <p className="text-[9px] text-emas uppercase font-bold tracking-tight -mt-1">by FINORA GROUP</p>
            </div>
          </div>

          {/* Nav menu links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isAllowed = item.roles.includes(currentUser.role);
              if (!isAllowed) return null;
              const isSelected = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition uppercase tracking-wide ${
                    isSelected 
                      ? 'bg-emas text-hijau-botol shadow-sm font-black' 
                      : 'text-hijau-soft hover:bg-hijau-botol/60 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile with simple instant role switcher */}
        <div className="p-4 border-t border-hijau-botol/30 bg-hijau-botol/50 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img 
                    src={currentUser.avatar} 
                    alt="User profile avatar" 
                    className="w-10 h-10 rounded-full border border-hijau-botol object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <span className="text-[9px] bg-hijau-botol/80 text-emas font-bold px-1.5 py-0.5 rounded uppercase block mt-0.5 w-fit">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    localStorage.removeItem('cf_auth');
                    localStorage.removeItem('cf_current_user');
                    setCurrentTab('landing');
                  }}
                  className="p-2 text-hijau-soft hover:text-white hover:bg-hijau-botol/60 rounded-lg transition cursor-pointer"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Quick role-switching bar */}
              <div className="bg-hijau-botol/40 p-2 rounded-lg border border-hijau-botol/50 space-y-1">
                <span className="text-[9px] text-hijau-soft opacity-75 font-bold block uppercase tracking-wider">Demo: Ganti Peran</span>
                <div className="grid grid-cols-3 gap-1">
                  {mockUsers.map(u => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          localStorage.setItem('cf_current_user', JSON.stringify(u));
                          // Fallback tab if current is forbidden under new role
                          const menuObj = menuItems.find(m => m.id === currentTab);
                          if (menuObj && !menuObj.roles.includes(u.role)) {
                            setCurrentTab('dashboard');
                          }
                        }}
                        className={`text-[9px] py-1 rounded font-extrabold uppercase transition cursor-pointer ${
                          isSelected 
                            ? 'bg-emas text-hijau-botol' 
                            : 'bg-hijau-botol/80 text-hijau-soft hover:bg-hijau-botol'
                        }`}
                      >
                        {u.role.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-black/25 p-3 rounded-xl border border-white/5">
                <Lock className="w-5 h-5 text-emas" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">Halaman Admin</p>
                  <span className="text-[9px] text-hijau-soft font-semibold">Terkunci (Belum Masuk)</span>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="w-full text-center bg-emas hover:bg-emas/90 text-hijau-botol text-xs font-extrabold py-2 px-3 rounded-lg uppercase tracking-wide transition shadow cursor-pointer"
              >
                Masuk Admin Portal
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT PANELS */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Dynamic header / breadcrumbs indicator */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>SaaS FinCert AI by FINORA GROUP</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-hijau-botol">{currentTab}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-hijau-soft text-hijau-botol text-[11px] font-bold px-3 py-1.5 rounded-lg border border-hijau-botol/15 shadow-inner">
            <Info className="w-3.5 h-3.5" /> Database terhubung ke Google Sheets
          </div>
        </div>

        {/* View Routing Render */}
        <div className="transition duration-200 ease-in-out">
          {!isAuthenticated && currentTab !== 'landing' && currentTab !== 'verify' ? (
            <LoginPage 
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setIsAuthenticated(true);
                localStorage.setItem('cf_auth', 'true');
                localStorage.setItem('cf_current_user', JSON.stringify(user));
              }}
              onBackToLanding={() => {
                setCurrentTab('landing');
              }}
            />
          ) : (
            <>
              {currentTab === 'landing' && (
                <LandingPage 
                  onEnterApp={() => handleTabChange('dashboard')}
                  onNavigateToTab={handleTabChange}
                  stats={{
                    eventsCount: events.length,
                    templatesCount: templates.length,
                    certsCount: certificates.length
                  }}
                />
              )}

              {currentTab === 'dashboard' && (
                <Dashboard 
                  events={events} 
                  templates={templates} 
                  certificates={certificates}
                  onNavigate={handleTabChange}
                  onCreateEventClick={() => handleTabChange('events')}
                />
              )}

              {currentTab === 'events' && (
                <EventsManager 
                  events={events}
                  activeEventId={activeEventId}
                  onSetActiveEvent={setActiveEventId}
                  onAddEvent={handleAddEvent}
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              )}

              {currentTab === 'templates' && (
                <TemplateBuilder 
                  templates={templates}
                  onSaveTemplate={handleSaveTemplate}
                  onAddTemplate={handleAddTemplate}
                />
              )}

              {currentTab === 'generate' && (
                <ImportGenerate 
                  events={events}
                  templates={templates}
                  activeEventId={activeEventId}
                  onAddCertificates={handleAddCertificates}
                  settings={settings}
                />
              )}

              {currentTab === 'whatsapp-copywriter' && (
                <WhatsappAiCopywriter
                  events={events}
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                />
              )}

              {currentTab === 'history' && (
                <HistoryViewer 
                  certificates={certificates}
                  events={events}
                  templates={templates}
                  onDeleteCertificate={handleDeleteCertificate}
                  onVerifyCertificate={handleVerifyCertificateAction}
                />
              )}

              {currentTab === 'verify' && (
                <VerificationPage 
                  certificates={certificates}
                  templates={templates}
                  initialVerifyId={verifyTargetId}
                  onClearInitialVerifyId={() => setVerifyTargetId(null)}
                />
              )}

              {currentTab === 'settings' && (
                <SystemSettings 
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
