import { EventItem, CertificateTemplate, Participant, GeneratedCertificate, AppSettings, UserProfile } from '../types';

export const mockUsers: UserProfile[] = [
  {
    id: 'u-1',
    name: 'Super Admin CertFlow',
    email: 'superadmin@certflow.ai',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-2',
    name: 'Admin Event Organizer',
    email: 'admin@organizer.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-3',
    name: 'Operator Staff',
    email: 'operator@certflow.ai',
    role: 'Operator',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
  }
];

export const mockEvents: EventItem[] = [
  {
    id: 'evt-1',
    name: 'National Digital Transformation Webinar 2026',
    organizer: 'Kementerian Komunikasi dan Informatika',
    date: '2026-06-15',
    location: 'Online via Zoom',
    certificatePrefix: 'KOM/DT/2026',
    description: 'Webinar nasional membahas implementasi AI di bidang administrasi perkantoran modern.',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'evt-2',
    name: 'Full Stack Web Development Workshop 2026',
    organizer: 'CertFlow Academy x Dicoding',
    date: '2026-07-01',
    location: 'Bandung Creative Hub & Hybrid',
    certificatePrefix: 'CF/FSWD/WORK/VII',
    description: 'Pelatihan intensif 3 hari membangun aplikasi web full stack modern dengan React dan Node.js.',
    createdAt: '2026-06-20T08:30:00Z',
  },
  {
    id: 'evt-3',
    name: 'Seminar Nasional Artificial Intelligence & IoT',
    organizer: 'Universitas Indonesia Tech Club',
    date: '2026-07-10',
    location: 'Balairung UI Depok',
    certificatePrefix: 'UI/UI-TC/SEMINAR/AI-IOT',
    description: 'Seminar tahunan mengeksplorasi tren AI Generative terbaru, IoT Edge, dan aplikasinya di industri.',
    createdAt: '2026-07-01T09:00:00Z',
  }
];

export const mockTemplates: CertificateTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Classic Emerald (Gold Seal & Borders)',
    backgroundUrl: 'classic-emerald',
    paperType: 'A4',
    orientation: 'landscape',
    logo1Url: '',
    logo2Url: '',
    logo3Url: '',
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
      logo1: { x: 14, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo2: { x: 24, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo3: { x: 34, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
    },
    canvasWidth: 1200,
    canvasHeight: 848, // Standard A4 Aspect Ratio: 1.414 (1200x848)
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'tpl-2',
    name: 'Modern Corporate Charcoal',
    backgroundUrl: 'modern-corporate',
    paperType: 'A4',
    orientation: 'landscape',
    logo1Url: '',
    logo2Url: '',
    logo3Url: '',
    primaryColor: '#1e293b',
    secondaryColor: '#0F5132',
    accentColor: '#FFFFFF',
    placeholders: {
      nama: { x: 50, y: 45, fontSize: 38, color: '#1e293b', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
      nomor: { x: 14, y: 20, fontSize: 14, color: '#6b7280', bold: false, italic: false, align: 'left', uppercase: false, enabled: true },
      instansi: { x: 50, y: 53, fontSize: 18, color: '#4b5563', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      event: { x: 50, y: 66, fontSize: 22, color: '#0F5132', bold: true, italic: false, align: 'center', uppercase: true, enabled: true },
      tanggal: { x: 25, y: 80, fontSize: 15, color: '#4b5563', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      jabatan: { x: 50, y: 59, fontSize: 16, color: '#4b5563', bold: false, italic: true, align: 'center', uppercase: false, enabled: true },
      nilai: { x: 50, y: 80, fontSize: 15, color: '#111827', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
      qr: { x: 80, y: 76, fontSize: 12, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: true, qrSize: 80 },
      logo1: { x: 14, y: 10, fontSize: 50, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo2: { x: 22, y: 10, fontSize: 50, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo3: { x: 30, y: 10, fontSize: 50, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
    },
    canvasWidth: 1200,
    canvasHeight: 848,
    createdAt: '2026-06-20T08:30:00Z',
  },
  {
    id: 'tpl-3',
    name: 'Royal Blue Elegant (Golden Ornaments)',
    backgroundUrl: 'royal-blue',
    paperType: 'A4',
    orientation: 'landscape',
    logo1Url: '',
    logo2Url: '',
    logo3Url: '',
    primaryColor: '#1e40af',
    secondaryColor: '#eab308',
    accentColor: '#FAF9F6',
    placeholders: {
      nama: { x: 50, y: 46, fontSize: 36, color: '#1e40af', bold: true, italic: false, align: 'center', uppercase: true, enabled: true },
      nomor: { x: 50, y: 16, fontSize: 16, color: '#eab308', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
      instansi: { x: 50, y: 55, fontSize: 18, color: '#4b5563', bold: false, italic: true, align: 'center', uppercase: false, enabled: true },
      event: { x: 50, y: 68, fontSize: 24, color: '#1e2937', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
      tanggal: { x: 30, y: 82, fontSize: 15, color: '#4b5563', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      jabatan: { x: 50, y: 61, fontSize: 16, color: '#374151', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      nilai: { x: 70, y: 82, fontSize: 15, color: '#4b5563', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      qr: { x: 86, y: 16, fontSize: 12, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: true, qrSize: 90 },
      logo1: { x: 14, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo2: { x: 24, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo3: { x: 34, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
    },
    canvasWidth: 1200,
    canvasHeight: 848,
    createdAt: '2026-07-09T05:00:00Z',
  },
  {
    id: 'tpl-4',
    name: 'Art Deco Terracotta (Modern Minimalist)',
    backgroundUrl: 'art-deco',
    paperType: 'A4',
    orientation: 'portrait',
    logo1Url: '',
    logo2Url: '',
    logo3Url: '',
    primaryColor: '#c2410c',
    secondaryColor: '#292524',
    accentColor: '#FFFDF9',
    placeholders: {
      nama: { x: 50, y: 44, fontSize: 34, color: '#c2410c', bold: true, italic: false, align: 'center', uppercase: true, enabled: true },
      nomor: { x: 50, y: 15, fontSize: 15, color: '#292524', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
      instansi: { x: 50, y: 52, fontSize: 16, color: '#57534e', bold: false, italic: true, align: 'center', uppercase: false, enabled: true },
      event: { x: 50, y: 64, fontSize: 22, color: '#292524', bold: true, italic: false, align: 'center', uppercase: false, enabled: true },
      tanggal: { x: 50, y: 78, fontSize: 14, color: '#57534e', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      jabatan: { x: 50, y: 58, fontSize: 15, color: '#57534e', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      nilai: { x: 50, y: 72, fontSize: 14, color: '#78716c', bold: false, italic: false, align: 'center', uppercase: false, enabled: true },
      qr: { x: 50, y: 88, fontSize: 12, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: true, qrSize: 85 },
      logo1: { x: 50, y: 8, fontSize: 50, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo2: { x: 38, y: 8, fontSize: 50, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
      logo3: { x: 62, y: 8, fontSize: 50, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false },
    },
    canvasWidth: 848,
    canvasHeight: 1200,
    createdAt: '2026-07-09T05:05:00Z',
  }
];

export const mockParticipants: Participant[] = [
  {
    id: 'part-1',
    eventId: 'evt-1',
    name: 'Ahmad Fauzi, S.Kom.',
    email: 'ahmadfauzi@gmail.com',
    instansi: 'Universitas Indonesia',
    nilai: 'Sangat Memuaskan',
    jabatan: 'Peserta Utama',
    certificateNumber: 'KOM/DT/2026/0001',
    status: 'generated',
  },
  {
    id: 'part-2',
    eventId: 'evt-1',
    name: 'Siti Rahmawati, M.T.',
    email: 'siti.rahma@yahoo.com',
    instansi: 'Institut Teknologi Bandung',
    nilai: 'Dengan Pujian',
    jabatan: 'Narasumber',
    certificateNumber: 'KOM/DT/2026/0002',
    status: 'generated',
  },
  {
    id: 'part-3',
    eventId: 'evt-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    instansi: 'PT Inovasi Teknologi',
    nilai: 'Memuaskan',
    jabatan: 'Peserta',
    certificateNumber: 'KOM/DT/2026/0003',
    status: 'pending',
  },
  {
    id: 'part-4',
    eventId: 'evt-2',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@gmail.com',
    instansi: 'PT Solusi Bangun Sejahtera',
    nilai: 'Lulus - 94/100',
    jabatan: 'Peserta',
    certificateNumber: 'CF/FSWD/WORK/VII/001',
    status: 'generated',
  },
  {
    id: 'part-5',
    eventId: 'evt-2',
    name: 'Rian Hidayat',
    email: 'rian.hidayat@outlook.com',
    instansi: 'Universitas Gadjah Mada',
    nilai: 'Lulus - 88/100',
    jabatan: 'Peserta',
    certificateNumber: 'CF/FSWD/WORK/VII/002',
    status: 'pending',
  }
];

export const mockCertificates: GeneratedCertificate[] = [
  {
    id: 'cf-cert-e109d',
    eventId: 'evt-1',
    eventName: 'National Digital Transformation Webinar 2026',
    templateId: 'tpl-1',
    participantId: 'part-1',
    participantName: 'Ahmad Fauzi, S.Kom.',
    participantEmail: 'ahmadfauzi@gmail.com',
    certificateNumber: 'KOM/DT/2026/0001',
    downloadPdfUrl: '#',
    downloadPngUrl: '#',
    verificationUrl: '', // generated dynamically
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=cf-cert-e109d',
    generatedAt: '2026-06-15T15:30:22Z',
    status: 'Emailed',
  },
  {
    id: 'cf-cert-f8312',
    eventId: 'evt-1',
    eventName: 'National Digital Transformation Webinar 2026',
    templateId: 'tpl-1',
    participantId: 'part-2',
    participantName: 'Siti Rahmawati, M.T.',
    participantEmail: 'siti.rahma@yahoo.com',
    certificateNumber: 'KOM/DT/2026/0002',
    downloadPdfUrl: '#',
    downloadPngUrl: '#',
    verificationUrl: '',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=cf-cert-f8312',
    generatedAt: '2026-06-15T15:32:05Z',
    status: 'Emailed',
  },
  {
    id: 'cf-cert-a8412',
    eventId: 'evt-2',
    eventName: 'Full Stack Web Development Workshop 2026',
    templateId: 'tpl-2',
    participantId: 'part-4',
    participantName: 'Dewi Lestari',
    participantEmail: 'dewi.lestari@gmail.com',
    certificateNumber: 'CF/FSWD/WORK/VII/001',
    downloadPdfUrl: '#',
    downloadPngUrl: '#',
    verificationUrl: '',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=cf-cert-a8412',
    generatedAt: '2026-07-01T17:45:11Z',
    status: 'Generated',
  }
];

export const defaultSettings: AppSettings = {
  appName: 'CERTFLOW AI',
  tagline: 'Import Data Sekali, Ribuan Sertifikat Langsung Jadi.',
  smtpHost: 'smtp.gmail.com',
  smtpEmail: 'sertifikat@certflow.ai',
  smtpUser: 'CertFlow Mailer Daemon',
  smtpPort: 465,
  smtpPass: 'demo_password_123',
  emailSubject: 'Sertifikat Digital Anda: {{event}} - {{nama}}',
  emailBody: `Yth. {{nama}},

Selamat! Sertifikat Anda untuk kegiatan {{event}} telah berhasil diterbitkan oleh {{organizer}}.

Berikut adalah detail sertifikat Anda:
Nama: {{nama}}
Nomor Sertifikat: {{nomor}}
Sebagai: {{jabatan}}
Instansi: {{instansi}}

Anda dapat mengunduh sertifikat digital dalam lampiran email ini. Untuk melakukan verifikasi keabsahan sertifikat, silakan memindai QR Code yang terdapat pada sertifikat atau mengunjungi halaman verifikasi kami.

Terima kasih atas partisipasi Anda.

Salam hangat,
{{organizer}}`,
  waGatewayUrl: 'https://kintun.kobarpay.com/send-message',
  waApiKey: 'ws_key_live_kintun_demo',
  waSenderNumber: '6288812345678',
  waFooterText: 'Dikirim otomatis melalui WhatsApp Gateway CertFlow',
  waMessageTemplate: `Halo {{nama}},

Selamat! Sertifikat Anda untuk kegiatan *{{event}}* telah diterbitkan.

*Detail Sertifikat:*
Nama: {{nama}}
Nomor: {{nomor}}
Sebagai: {{jabatan}}

Silakan unduh sertifikat resmi Anda di tautan berikut:
{{link}}

Terima kasih atas partisipasi Anda!`,
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1N_gBf5P1V8mWh1g7m_2v0X4pG_q6kR7_3A1v8VvXm80/edit#gid=0',
  googleSheetId: '1N_gBf5P1V8mWh1g7m_2v0X4pG_q6kR7_3A1v8VvXm80',
  googleSheetRange: 'Peserta!A:G',
  googleSheetsStatus: 'connected',
  autoSendEmail: true,
  autoSendWa: false,
  defaultSignatureName: 'Dr. Ir. Heru Sutadi, M.Kom.',
  defaultSignatureTitle: 'Ketua Pelaksana & Penasihat Digital Kominfo',
  defaultSignatureUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch%27s_Signature.png',
};
