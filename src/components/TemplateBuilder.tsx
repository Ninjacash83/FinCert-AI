import React, { useState, useEffect, useRef } from 'react';
import { CertificateTemplate, PlaceholderStyle } from '../types';
import { drawCertificate } from '../utils/canvasRenderer';
import { compressImage } from '../utils/imageCompressor';
import { 
  Sliders, 
  Upload, 
  Settings, 
  CheckCircle, 
  Type, 
  Maximize2, 
  Save, 
  HelpCircle,
  FileImage,
  Sparkles,
  RefreshCw,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface TemplateBuilderProps {
  templates: CertificateTemplate[];
  onSaveTemplate: (template: CertificateTemplate) => void;
  onAddTemplate: (name: string, backgroundUrl: string) => void;
}

export default function TemplateBuilder({
  templates,
  onSaveTemplate,
  onAddTemplate
}: TemplateBuilderProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  
  // Working local copy of active template configuration
  const [localPlaceholders, setLocalPlaceholders] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('fields'); // fields, background
  const [activeFieldKey, setActiveFieldKey] = useState<string>('nama'); // nama, nomor, instansi, event, dll
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  // Sample data to preview on canvas
  const [sampleNama, setSampleNama] = useState('BUDI SETIAWAN, S.T.');
  const [sampleNomor, setSampleNomor] = useState('KOM/DT/2026/0891');
  const [sampleInstansi, setSampleInstansi] = useState('PT Solusi Teknologi Indonesia');
  const [sampleJabatan, setSampleJabatan] = useState('Peserta Terbaik');
  const [sampleEvent, setSampleEvent] = useState('National Digital Transformation Seminar');
  const [sampleTanggal, setSampleTanggal] = useState('Jakarta, 15 Juni 2026');
  const [sampleNilai, setSampleNilai] = useState('Lulus dengan predikat Cum Laude (A+)');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgImageElement, setBgImageElement] = useState<HTMLImageElement | undefined>(undefined);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Sync state with active template change
  useEffect(() => {
    if (activeTemplate) {
      const phs = JSON.parse(JSON.stringify(activeTemplate.placeholders));
      // Ensure logo placeholders are initialized if not exist
      if (!phs.logo1) {
        phs.logo1 = { x: 14, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false };
      }
      if (!phs.logo2) {
        phs.logo2 = { x: 24, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false };
      }
      if (!phs.logo3) {
        phs.logo3 = { x: 34, y: 14, fontSize: 60, color: '#000000', bold: false, italic: false, align: 'center', uppercase: false, enabled: false };
      }
      setLocalPlaceholders(phs);
      // Reset custom background image element
      setBgImageElement(undefined);
    }
  }, [selectedTemplateId, activeTemplate]);

  // Redraw canvas on placeholder style / sample content change
  useEffect(() => {
    if (!canvasRef.current || !activeTemplate || !localPlaceholders) return;
    
    const render = async () => {
      const canvas = canvasRef.current!;
      const data = {
        nama: sampleNama,
        nomor: sampleNomor,
        instansi: sampleInstansi,
        event: sampleEvent,
        tanggal: sampleTanggal,
        jabatan: sampleJabatan,
        nilai: sampleNilai,
        qrValue: 'cf-cert-sample-verify'
      };

      // Create a temporary updated template with current slider values
      const previewTemplate: CertificateTemplate = {
        ...activeTemplate,
        placeholders: localPlaceholders
      };

      await drawCertificate(canvas, previewTemplate, data, bgImageElement);
    };

    render();
  }, [
    localPlaceholders, 
    activeTemplate, 
    sampleNama, 
    sampleNomor, 
    sampleInstansi, 
    sampleEvent, 
    sampleTanggal, 
    sampleJabatan, 
    sampleNilai,
    bgImageElement
  ]);

  if (!activeTemplate || !localPlaceholders) {
    return (
      <div className="py-12 text-center text-gray-400">
        Menyiapkan Workspace Template...
      </div>
    );
  }

  // Update specific style attribute for current active field placeholder
  const updateStyle = (key: string, value: any) => {
    setLocalPlaceholders((prev: any) => {
      const next = { ...prev };
      next[activeFieldKey] = {
        ...next[activeFieldKey],
        [key]: value
      };
      return next;
    });
  };

  // Drag and drop / Canvas click handling to easily position placeholders
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !localPlaceholders) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate click coordinates in percentage of canvas size
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Update X, Y of active placeholder
    setLocalPlaceholders((prev: any) => {
      const next = { ...prev };
      next[activeFieldKey] = {
        ...next[activeFieldKey],
        x: clickX,
        y: clickY
      };
      return next;
    });
  };

  // Custom Background Upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      // Compress to maximum 1200x848 resolution and convert to jpeg to save massive space
      const compressedBase64 = await compressImage(base64, 1200, 848, true, 0.85);
      
      // Load image into element to draw immediately
      const img = new Image();
      img.src = compressedBase64;
      img.onload = () => {
        setBgImageElement(img);
        // Save the backgroundUrl string as base64 data url inside template
        onSaveTemplate({
          ...activeTemplate,
          backgroundUrl: compressedBase64,
          placeholders: localPlaceholders
        });
      };
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (index: 1 | 2 | 3, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      // Compress logo keeping PNG transparency, with max size 300x300
      const compressedBase64 = await compressImage(base64, 300, 300, false);
      const urlKey = index === 1 ? 'logo1Url' : index === 2 ? 'logo2Url' : 'logo3Url';
      onSaveTemplate({
        ...activeTemplate,
        [urlKey]: compressedBase64,
        placeholders: localPlaceholders
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (index: 1 | 2 | 3) => {
    const urlKey = index === 1 ? 'logo1Url' : index === 2 ? 'logo2Url' : 'logo3Url';
    onSaveTemplate({
      ...activeTemplate,
      [urlKey]: '',
      placeholders: localPlaceholders
    });
  };

  const handleSignatureUpload = (index: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      // Compress signature keeping PNG transparency, with max size 350x150
      const compressedBase64 = await compressImage(base64, 350, 150, false);
      const urlKey = index === 1 ? 'sig1Url' : 'sig2Url';
      onSaveTemplate({
        ...activeTemplate,
        [urlKey]: compressedBase64,
        placeholders: localPlaceholders
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = (index: 1 | 2) => {
    const urlKey = index === 1 ? 'sig1Url' : 'sig2Url';
    onSaveTemplate({
      ...activeTemplate,
      [urlKey]: '',
      placeholders: localPlaceholders
    });
  };

  const handleSignatureTextChange = (index: 1 | 2, field: 'Name' | 'Title', val: string) => {
    const key = `sig${index}${field}` as 'sig1Name' | 'sig1Title' | 'sig2Name' | 'sig2Title';
    onSaveTemplate({
      ...activeTemplate,
      [key]: val,
      placeholders: localPlaceholders
    });
  };

  const handleSaveConfig = () => {
    onSaveTemplate({
      ...activeTemplate,
      placeholders: localPlaceholders
    });
    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 3000);
  };

  const handlePaperAndOrientationChange = (type: 'A4' | 'F4', orient: 'landscape' | 'portrait') => {
    let width = 1200;
    let height = 848;
    if (type === 'A4') {
      if (orient === 'landscape') {
        width = 1200;
        height = 848;
      } else {
        width = 848;
        height = 1200;
      }
    } else {
      if (orient === 'landscape') {
        width = 1200;
        height = 782;
      } else {
        width = 782;
        height = 1200;
      }
    }
    onSaveTemplate({
      ...activeTemplate,
      paperType: type,
      orientation: orient,
      canvasWidth: width,
      canvasHeight: height,
      placeholders: localPlaceholders
    });
  };

  const handleCreateCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    
    // Create new custom blank template (classic style background preset first)
    onAddTemplate(newTemplateName, 'classic-emerald');
    setNewTemplateName('');
  };

  // Quick preset palette colors
  const colorPresets = [
    '#0F5132', // Bottle Green
    '#0284c7', // Sky Blue
    '#1e293b', // Slate Charcoal
    '#d97706', // Gold Amber
    '#dc2626', // Crimson Red
    '#4f46e5', // Royal Indigo
    '#000000', // Pitch Black
  ];

  return (
    <div className="space-y-6" id="templates-tab-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Visual Template Builder & Designer</h2>
          <p className="text-xs text-gray-500">Atur posisi tulisan (X, Y), ukuran font, warna, gaya huruf secara live pada kanvas sertifikat digital.</p>
        </div>
        
        {/* Template Selector dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">Pilih Desain:</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol text-gray-700"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Visual Interactive Canvas Preview (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs bg-hijau-soft text-hijau-botol font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> Tips: Klik posisi di gambar untuk memindahkan teks terpilih secara langsung!
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {activeTemplate.canvasWidth}x{activeTemplate.canvasHeight} px ({activeTemplate.paperType || 'A4'})
              </span>
            </div>

            {/* Canvas viewport container */}
            <div className="overflow-auto border border-gray-100 rounded-lg bg-slate-900/5 flex items-center justify-center p-4 relative group max-h-[580px]">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full h-auto shadow-md rounded border border-gray-200 cursor-crosshair bg-white transition hover:ring-2 hover:ring-hijau-botol/10"
                style={{
                  width: activeTemplate.orientation === 'portrait' ? 'auto' : '100%',
                  maxHeight: activeTemplate.orientation === 'portrait' ? '460px' : 'none',
                  aspectRatio: activeTemplate.orientation === 'portrait'
                    ? (activeTemplate.paperType === 'F4' ? '0.6517' : '0.7067')
                    : (activeTemplate.paperType === 'F4' ? '1.5345' : '1.4151')
                }}
              />
            </div>

            {/* Fast Field Selector indicators for easy editing */}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(localPlaceholders).map((key) => {
                const isSelected = activeFieldKey === key;
                const isEnabled = localPlaceholders[key].enabled;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveFieldKey(key)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                      isSelected 
                        ? 'bg-hijau-botol text-white' 
                        : isEnabled 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-gray-50 text-gray-400 border border-dashed border-gray-100'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>{key.toUpperCase()}</span>
                    {!isEnabled && <span className="text-[9px] opacity-75">(nonaktif)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Sandbox Inputs (To test live data rendering) */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-800 text-sm">Sandbox Data Preview</h4>
            <p className="text-[11px] text-gray-400">Masukkan teks contoh untuk memvisualisasikan rendering sertifikat:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-gray-400">Nama Lengkap</label>
                <input type="text" value={sampleNama} onChange={(e) => setSampleNama(e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-gray-400">Nomor Sertifikat</label>
                <input type="text" value={sampleNomor} onChange={(e) => setSampleNomor(e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-gray-400">Instansi / Kampus</label>
                <input type="text" value={sampleInstansi} onChange={(e) => setSampleInstansi(e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-gray-400">Sebagai / Jabatan</label>
                <textarea rows={2} value={sampleJabatan} onChange={(e) => setSampleJabatan(e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none resize-none" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-gray-400">Nama Event</label>
                <textarea rows={2} value={sampleEvent} onChange={(e) => setSampleEvent(e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none resize-none" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-semibold text-gray-400">Kota, Tanggal Terbit</label>
                <input type="text" value={sampleTanggal} onChange={(e) => setSampleTanggal(e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Designer Control Center (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Action Tabs: Fields vs Background vs Signatures */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('fields')}
                className={`py-3 text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                  activeTab === 'fields' 
                    ? 'border-b-2 border-hijau-botol text-hijau-botol bg-hijau-soft/10' 
                    : 'text-gray-500 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-hijau-botol" /> Tata Letak
              </button>
              <button
                onClick={() => setActiveTab('background')}
                className={`py-3 text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                  activeTab === 'background' 
                    ? 'border-b-2 border-hijau-botol text-hijau-botol bg-hijau-soft/10' 
                    : 'text-gray-500 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-hijau-botol" /> Gambar & Logo
              </button>
              <button
                onClick={() => setActiveTab('signatures')}
                className={`py-3 text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                  activeTab === 'signatures' 
                    ? 'border-b-2 border-hijau-botol text-hijau-botol bg-hijau-soft/10' 
                    : 'text-gray-500 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-hijau-botol" /> TTD (2 Kolom)
              </button>
            </div>

            {/* TAB 1: Fields Controls */}
            {activeTab === 'fields' && (
              <div className="p-5 space-y-5">
                {/* Paper Type & Orientation Selector */}
                <div className="p-3.5 bg-gradient-to-r from-hijau-soft/30 to-slate-50 rounded-lg border border-slate-100 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        Jenis Ukuran Kertas
                      </label>
                      <span className="text-[10px] font-bold text-hijau-botol bg-hijau-soft px-2 py-0.5 rounded">
                        {(activeTemplate.paperType || 'A4')} Layout
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePaperAndOrientationChange('A4', activeTemplate.orientation || 'landscape')}
                        className={`py-1.5 px-2.5 text-[11px] font-bold rounded-lg border transition text-center ${
                          (activeTemplate.paperType || 'A4') === 'A4'
                            ? 'bg-hijau-botol text-white border-hijau-botol shadow-sm'
                            : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
                        }`}
                      >
                        Kertas A4
                        <span className="block text-[9px] font-normal opacity-80">297 x 210 mm</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaperAndOrientationChange('F4', activeTemplate.orientation || 'landscape')}
                        className={`py-1.5 px-2.5 text-[11px] font-bold rounded-lg border transition text-center ${
                          activeTemplate.paperType === 'F4'
                            ? 'bg-hijau-botol text-white border-hijau-botol shadow-sm'
                            : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
                        }`}
                      >
                        Kertas F4 / Folio
                        <span className="block text-[9px] font-normal opacity-80">330 x 215 mm</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        Orientasi Kertas
                      </label>
                      <span className="text-[10px] font-bold text-hijau-botol bg-hijau-soft px-2 py-0.5 rounded capitalize">
                        {(activeTemplate.orientation || 'landscape')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePaperAndOrientationChange(activeTemplate.paperType || 'A4', 'landscape')}
                        className={`py-1.5 px-2.5 text-[11px] font-bold rounded-lg border transition text-center ${
                          (activeTemplate.orientation || 'landscape') === 'landscape'
                            ? 'bg-hijau-botol text-white border-hijau-botol shadow-sm'
                            : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
                        }`}
                      >
                        Landscape (Mendatar)
                        <span className="block text-[9px] font-normal opacity-80">Horizontal Layout</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaperAndOrientationChange(activeTemplate.paperType || 'A4', 'portrait')}
                        className={`py-1.5 px-2.5 text-[11px] font-bold rounded-lg border transition text-center ${
                          activeTemplate.orientation === 'portrait'
                            ? 'bg-hijau-botol text-white border-hijau-botol shadow-sm'
                            : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
                        }`}
                      >
                        Portrait (Tegak)
                        <span className="block text-[9px] font-normal opacity-80">Vertical Layout</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Mengedit: {activeFieldKey.toUpperCase()}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={localPlaceholders[activeFieldKey].enabled}
                        onChange={(e) => updateStyle('enabled', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-hijau-botol"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">Gunakan toggle untuk mengaktifkan / menonaktifkan pencetakan kolom ini di sertifikat.</p>
                </div>

                {localPlaceholders[activeFieldKey].enabled ? (
                  <div className="space-y-4">
                    {/* Position Sliders */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>Koordinat Horizontal (X)</span>
                        <span className="text-hijau-botol">{localPlaceholders[activeFieldKey].x}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={localPlaceholders[activeFieldKey].x}
                        onChange={(e) => updateStyle('x', parseInt(e.target.value))}
                        className="w-full accent-hijau-botol"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>Koordinat Vertikal (Y)</span>
                        <span className="text-hijau-botol">{localPlaceholders[activeFieldKey].y}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={localPlaceholders[activeFieldKey].y}
                        onChange={(e) => updateStyle('y', parseInt(e.target.value))}
                        className="w-full accent-hijau-botol"
                      />
                    </div>

                    {/* Font Size Slider */}
                    {activeFieldKey !== 'qr' && !activeFieldKey.startsWith('logo') && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                           <span>Ukuran Huruf (Font Size)</span>
                          <span className="text-hijau-botol">{localPlaceholders[activeFieldKey].fontSize} px</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="80" 
                          value={localPlaceholders[activeFieldKey].fontSize}
                          onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
                          className="w-full accent-hijau-botol"
                        />
                      </div>
                    )}

                    {/* Logo Size Slider */}
                    {activeFieldKey.startsWith('logo') && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                          <span>Ukuran Logo (Logo Size)</span>
                          <span className="text-hijau-botol">{localPlaceholders[activeFieldKey].fontSize || 60} px</span>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="250" 
                          value={localPlaceholders[activeFieldKey].fontSize || 60}
                          onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
                          className="w-full accent-hijau-botol"
                        />
                      </div>
                    )}

                    {/* QR Specific: Size */}
                    {activeFieldKey === 'qr' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                          <span>Ukuran QR Code (Square Size)</span>
                          <span className="text-hijau-botol">{localPlaceholders[activeFieldKey].qrSize || 80} px</span>
                        </div>
                        <input 
                          type="range" 
                          min="40" 
                          max="180" 
                          value={localPlaceholders[activeFieldKey].qrSize || 80}
                          onChange={(e) => updateStyle('qrSize', parseInt(e.target.value))}
                          className="w-full accent-hijau-botol"
                        />
                      </div>
                    )}

                    {/* Styling presets */}
                    {activeFieldKey !== 'qr' && !activeFieldKey.startsWith('logo') && (
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-600 block">Tipe & Format Tulisan</label>
                        <div className="flex flex-wrap gap-2">
                          {/* Bold */}
                          <button
                            type="button"
                            onClick={() => updateStyle('bold', !localPlaceholders[activeFieldKey].bold)}
                            className={`p-2 rounded border transition ${
                              localPlaceholders[activeFieldKey].bold 
                                ? 'bg-hijau-soft text-hijau-botol border-hijau-botol' 
                                : 'bg-white text-gray-500 border-gray-200'
                            }`}
                            title="Tebal"
                          >
                            <Bold className="w-4 h-4" />
                          </button>

                          {/* Italic */}
                          <button
                            type="button"
                            onClick={() => updateStyle('italic', !localPlaceholders[activeFieldKey].italic)}
                            className={`p-2 rounded border transition ${
                              localPlaceholders[activeFieldKey].italic 
                                ? 'bg-hijau-soft text-hijau-botol border-hijau-botol' 
                                : 'bg-white text-gray-500 border-gray-200'
                            }`}
                            title="Miring"
                          >
                            <Italic className="w-4 h-4" />
                          </button>

                          {/* Uppercase Toggle */}
                          <button
                            type="button"
                            onClick={() => updateStyle('uppercase', !localPlaceholders[activeFieldKey].uppercase)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded border transition ${
                              localPlaceholders[activeFieldKey].uppercase 
                                ? 'bg-hijau-soft text-hijau-botol border-hijau-botol' 
                                : 'bg-white text-gray-500 border-gray-200'
                            }`}
                          >
                            HURUF BESAR
                          </button>
                        </div>

                        {/* Text Alignments */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-gray-400 font-medium">Penjajaran Teks (Alignment)</label>
                          <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 max-w-fit">
                            {(['left', 'center', 'right'] as const).map((alignVal) => (
                              <button
                                key={alignVal}
                                type="button"
                                onClick={() => updateStyle('align', alignVal)}
                                className={`p-1.5 rounded transition ${
                                  localPlaceholders[activeFieldKey].align === alignVal
                                    ? 'bg-white text-hijau-botol shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {alignVal === 'left' && <AlignLeft className="w-4 h-4" />}
                                {alignVal === 'center' && <AlignCenter className="w-4 h-4" />}
                                {alignVal === 'right' && <AlignRight className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Colors Palette */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-gray-400 font-medium">Palet Warna Presisi</label>
                          <div className="flex flex-wrap gap-1.5">
                            {colorPresets.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateStyle('color', color)}
                                className={`w-6 h-6 rounded-full border transition-transform ${
                                  localPlaceholders[activeFieldKey].color === color 
                                    ? 'scale-110 ring-2 ring-hijau-botol/20 border-white' 
                                    : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {/* Color Picker input */}
                            <input 
                              type="color" 
                              value={localPlaceholders[activeFieldKey].color || '#000000'}
                              onChange={(e) => updateStyle('color', e.target.value)}
                              className="w-6 h-6 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs border border-dashed border-gray-100 rounded-lg">
                    Kolom ini sedang dinonaktifkan.
                  </div>
                )}

                {/* Save button */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="w-full bg-hijau-botol hover:bg-hijau-botol/90 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Simpan Posisi & Gaya
                  </button>
                </div>

                {showSaveAlert && (
                  <div className="bg-hijau-soft text-hijau-botol text-xs p-3 rounded-lg flex items-center gap-2 border border-hijau-botol/20 shadow-sm animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-hijau-botol flex-shrink-0" />
                    <span>Konfigurasi posisi placeholder berhasil disimpan secara permanen!</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Upload Background Custom Desain */}
            {activeTab === 'background' && (
              <div className="p-5 space-y-5">
                {/* Prebuilt Background & Color Customizer */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gray-800">Desain & Tema Warna Background</h5>
                    <p className="text-[10px] text-gray-400">Pilih gaya background default dan sesuaikan kombinasi warna tema sesuai keinginan Anda.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gaya Background Default</label>
                      <select
                        value={activeTemplate.backgroundUrl.startsWith('data:') ? 'custom' : activeTemplate.backgroundUrl}
                        onChange={(e) => {
                          if (e.target.value !== 'custom') {
                            onSaveTemplate({
                              ...activeTemplate,
                              backgroundUrl: e.target.value,
                              placeholders: localPlaceholders
                            });
                          }
                        }}
                        className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white font-semibold text-slate-700"
                      >
                        <option value="classic-emerald">Classic Emerald (Gold Seal & Borders)</option>
                        <option value="modern-corporate">Modern Corporate Charcoal</option>
                        <option value="royal-blue">Royal Blue Elegant (Golden Ornaments)</option>
                        <option value="art-deco">Art Deco Terracotta (Modern Minimalist)</option>
                        {activeTemplate.backgroundUrl.startsWith('data:') && <option value="custom">Custom (Gambar Unggahan)</option>}
                      </select>
                    </div>

                    {/* Theme Color Customization Input fields */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kustomisasi Tema Warna</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block">Utama</label>
                          <div className="flex flex-col gap-1 items-center">
                            <input
                              type="color"
                              value={activeTemplate.primaryColor || '#0F5132'}
                              onChange={(e) => {
                                onSaveTemplate({
                                  ...activeTemplate,
                                  primaryColor: e.target.value,
                                  placeholders: localPlaceholders
                                });
                              }}
                              className="w-full h-8 p-0.5 border border-slate-200 rounded cursor-pointer"
                            />
                            <span className="text-[8px] font-mono font-bold text-slate-500">{(activeTemplate.primaryColor || '#0F5132').toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block">Sekunder</label>
                          <div className="flex flex-col gap-1 items-center">
                            <input
                              type="color"
                              value={activeTemplate.secondaryColor || '#d97706'}
                              onChange={(e) => {
                                onSaveTemplate({
                                  ...activeTemplate,
                                  secondaryColor: e.target.value,
                                  placeholders: localPlaceholders
                                });
                              }}
                              className="w-full h-8 p-0.5 border border-slate-200 rounded cursor-pointer"
                            />
                            <span className="text-[8px] font-mono font-bold text-slate-500">{(activeTemplate.secondaryColor || '#d97706').toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block">Latar</label>
                          <div className="flex flex-col gap-1 items-center">
                            <input
                              type="color"
                              value={activeTemplate.accentColor || '#FCFBF7'}
                              onChange={(e) => {
                                onSaveTemplate({
                                  ...activeTemplate,
                                  accentColor: e.target.value,
                                  placeholders: localPlaceholders
                                });
                              }}
                              className="w-full h-8 p-0.5 border border-slate-200 rounded cursor-pointer"
                            />
                            <span className="text-[8px] font-mono font-bold text-slate-500">{(activeTemplate.accentColor || '#FCFBF7').toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-gray-800">Unggah Desain Custom (.JPG/PNG)</h5>
                  <p className="text-[10px] text-gray-400">Atau pilih berkas template sertifikat kosongan Anda sendiri (Rekomendasi rasio A4 horizontal: 1200x848 piksel).</p>
                </div>

                {/* File Upload drag area */}
                <div className="border-2 border-dashed border-slate-200 hover:border-hijau-botol/50 bg-slate-50 hover:bg-hijau-soft/30 rounded-xl p-6 text-center cursor-pointer transition relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleBackgroundUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileImage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-700 block">Pilih Gambar Kosongan Baru</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Mengganti background default di atas</span>
                </div>

                {/* Logo Uploads Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gray-800">Unggah Logo Instansi / Kegiatan</h5>
                    <p className="text-[10px] text-gray-400">Unggah hingga 3 berkas logo transparan (.PNG) untuk diletakkan di sertifikat secara fleksibel.</p>
                  </div>

                  <div className="space-y-2">
                    {([1, 2, 3] as const).map((num) => {
                      const logoUrl = num === 1 ? activeTemplate.logo1Url : num === 2 ? activeTemplate.logo2Url : activeTemplate.logo3Url;
                      return (
                        <div key={num} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {logoUrl ? (
                              <img src={logoUrl} alt={`Logo ${num}`} className="w-10 h-10 object-contain rounded border border-white bg-white shadow-sm flex-shrink-0" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 rounded border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold flex-shrink-0">
                                LOGO {num}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <span className="text-[11px] font-bold text-slate-700 block">T LOGO {num}</span>
                              <span className="text-[9px] text-slate-400 block truncate">
                                {logoUrl ? 'Terunggah' : 'Belum ada berkas logo'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {logoUrl ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveLogo(num)}
                                className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition"
                              >
                                Hapus
                              </button>
                            ) : (
                              <label className="text-[10px] font-bold text-hijau-botol hover:text-white bg-hijau-soft hover:bg-hijau-botol px-2 py-1 rounded transition cursor-pointer relative">
                                Unggah
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg"
                                  onChange={(e) => handleLogoUpload(num, e)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Template Preset details */}
                <div className="bg-amber-50/50 border border-amber-200/50 p-3.5 rounded-lg text-[11px] text-amber-950 space-y-1.5">
                  <span className="font-bold flex items-center gap-1 text-amber-900">
                    <HelpCircle className="w-3.5 h-3.5" /> Panduan Ukuran & Resolusi
                  </span>
                  <p className="leading-relaxed">
                    Sistem CertFlow menggunakan teknologi HTML5 Canvas yang mengkompresi data gambar secara lossless saat diunduh. Pastikan desain sertifikat kosongan yang diunggah tidak memiliki tulisan nama dan nomor peserta karena sistem akan menaruh tulisan di atasnya secara dinamis.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Signatures (Penandatangan 2 Kolom) */}
            {activeTab === 'signatures' && (
              <div className="p-5 space-y-5">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-gray-800">Pengaturan Penandatangan (2 Kolom)</h5>
                  <p className="text-[10px] text-gray-400">Sesuaikan Nama, Jabatan, dan Tanda Tangan Digital yang akan ditampilkan di bagian bawah sertifikat.</p>
                </div>

                {/* PENANDATANGAN 1 (KIRI / UTAMA) */}
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/50 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-hijau-botol flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-hijau-soft text-hijau-botol flex items-center justify-center font-bold text-[10px]">1</span>
                      Penandatangan 1 (Kiri)
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">Primary Signee</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        value={activeTemplate.sig1Name || ''}
                        placeholder="Contoh: Dr. Ir. Heru Sutadi, M.Kom."
                        onChange={(e) => handleSignatureTextChange(1, 'Name', e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jabatan / Otoritas</label>
                      <input
                        type="text"
                        value={activeTemplate.sig1Title || ''}
                        placeholder="Contoh: Ketua Pelaksana CertFlow AI"
                        onChange={(e) => handleSignatureTextChange(1, 'Title', e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                      />
                    </div>

                    {/* TTD Image Upload */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Berkas Tanda Tangan (.PNG Transparan)</label>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {activeTemplate.sig1Url ? (
                            <img src={activeTemplate.sig1Url} alt="TTD 1" className="w-12 h-8 object-contain rounded border border-gray-100 bg-slate-50 p-0.5 flex-shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-12 h-8 rounded border border-dashed border-gray-300 bg-slate-50 flex items-center justify-center text-[8px] text-gray-400 font-bold flex-shrink-0">
                              KOSONG
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-gray-700 block">TTD Digital 1</span>
                            <span className="text-[8px] text-gray-400 block truncate">
                              {activeTemplate.sig1Url ? 'Terunggah' : 'Gunakan guratan default'}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {activeTemplate.sig1Url ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveSignature(1)}
                              className="text-[9px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded transition"
                            >
                              Hapus
                            </button>
                          ) : (
                            <label className="text-[9px] font-bold text-hijau-botol hover:text-white bg-hijau-soft hover:bg-hijau-botol px-2 py-1 rounded transition cursor-pointer relative">
                              Unggah
                              <input
                                type="file"
                                accept="image/png"
                                onChange={(e) => handleSignatureUpload(1, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PENANDATANGAN 2 (KANAN) */}
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/50 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-hijau-botol flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-hijau-soft text-hijau-botol flex items-center justify-center font-bold text-[10px]">2</span>
                      Penandatangan 2 (Kanan)
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">Secondary Signee</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        value={activeTemplate.sig2Name || ''}
                        placeholder="Contoh: Ir. Budi Setiawan, M.T."
                        onChange={(e) => handleSignatureTextChange(2, 'Name', e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jabatan / Otoritas</label>
                      <input
                        type="text"
                        value={activeTemplate.sig2Title || ''}
                        placeholder="Contoh: Direktur FINORA Digital"
                        onChange={(e) => handleSignatureTextChange(2, 'Title', e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white"
                      />
                    </div>

                    {/* TTD Image Upload */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Berkas Tanda Tangan (.PNG Transparan)</label>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {activeTemplate.sig2Url ? (
                            <img src={activeTemplate.sig2Url} alt="TTD 2" className="w-12 h-8 object-contain rounded border border-gray-100 bg-slate-50 p-0.5 flex-shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-12 h-8 rounded border border-dashed border-gray-300 bg-slate-50 flex items-center justify-center text-[8px] text-gray-400 font-bold flex-shrink-0">
                              KOSONG
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-bold text-gray-700 block">TTD Digital 2</span>
                            <span className="text-[8px] text-gray-400 block truncate">
                              {activeTemplate.sig2Url ? 'Terunggah' : 'Gunakan guratan default'}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {activeTemplate.sig2Url ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveSignature(2)}
                              className="text-[9px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded transition"
                            >
                              Hapus
                            </button>
                          ) : (
                            <label className="text-[9px] font-bold text-hijau-botol hover:text-white bg-hijau-soft hover:bg-hijau-botol px-2 py-1 rounded transition cursor-pointer relative">
                              Unggah
                              <input
                                type="file"
                                accept="image/png"
                                onChange={(e) => handleSignatureUpload(2, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create New Custom Template style */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-800 text-xs">Buat Blueprint Template Baru</h4>
            <p className="text-[10px] text-gray-400">Tambahkan konfigurasi template baru ke database lokal:</p>
            <form onSubmit={handleCreateCustomTemplate} className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: Template Wisuda / Pelatihan"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
              />
              <button
                type="submit"
                className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-bold text-xs px-3 py-2 rounded transition"
              >
                Tambah
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
