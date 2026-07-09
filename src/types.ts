export interface EventItem {
  id: string;
  name: string;
  organizer: string;
  date: string;
  location: string;
  certificatePrefix: string;
  description: string;
  createdAt: string;
}

export interface PlaceholderStyle {
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
  fontSize: number; // in pixels (for standard canvas size e.g. 1200x800)
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  uppercase: boolean;
  enabled: boolean;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundUrl: string; // prebuilt template selection or custom upload base64
  paperType?: 'A4' | 'F4';
  orientation?: 'landscape' | 'portrait';
  logo1Url?: string;
  logo2Url?: string;
  logo3Url?: string;
  sig1Name?: string;
  sig1Title?: string;
  sig1Url?: string;
  sig2Name?: string;
  sig2Title?: string;
  sig2Url?: string;
  primaryColor?: string; // Customizable theme color
  secondaryColor?: string; // Customizable secondary theme color
  accentColor?: string; // Customizable background/accent color
  placeholders: {
    nama: PlaceholderStyle;
    nomor: PlaceholderStyle;
    instansi: PlaceholderStyle;
    event: PlaceholderStyle;
    tanggal: PlaceholderStyle;
    jabatan: PlaceholderStyle;
    nilai: PlaceholderStyle;
    qr: PlaceholderStyle & { qrSize: number };
    logo1?: PlaceholderStyle;
    logo2?: PlaceholderStyle;
    logo3?: PlaceholderStyle;
  };
  canvasWidth: number;
  canvasHeight: number;
  createdAt: string;
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  email: string;
  wa?: string;
  instansi: string;
  nilai: string;
  jabatan: string;
  certificateNumber: string;
  status: 'pending' | 'valid' | 'invalid' | 'generated' | 'failed';
  errorMessage?: string;
}

export interface GeneratedCertificate {
  id: string; // unique hash or number
  eventId: string;
  eventName: string;
  templateId: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  certificateNumber: string;
  downloadPdfUrl: string;
  downloadPngUrl: string;
  verificationUrl: string;
  qrCodeUrl: string;
  generatedAt: string;
  status: 'Generated' | 'Emailed' | 'Failed';
}

export interface AppSettings {
  appName: string;
  tagline: string;
  smtpHost: string;
  smtpEmail: string;
  smtpUser: string;
  smtpPort?: number;
  smtpPass?: string;
  emailSubject: string;
  emailBody: string;
  waGatewayUrl: string;
  waApiKey: string;
  waSenderNumber?: string; // Number of your device
  waFooterText?: string; // Footer under message
  waMessageTemplate?: string; // Template for WhatsApp message
  googleSheetUrl?: string; // Google Sheets Sharing/API URL
  googleSheetId?: string; // Google Sheets Spreadsheet ID
  googleSheetRange?: string; // Range (e.g., "Sheet1!A:G")
  googleSheetsStatus?: 'connected' | 'disconnected'; // Connection status
  autoSendEmail: boolean;
  autoSendWa: boolean;
  defaultSignatureName: string;
  defaultSignatureTitle: string;
  defaultSignatureUrl: string;
}

export type UserRole = 'Super Admin' | 'Admin' | 'Operator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}
