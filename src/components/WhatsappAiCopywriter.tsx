import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Send, RefreshCw, MessageSquare, AlertCircle, Check, Phone, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { EventItem, AppSettings } from '../types';

interface WhatsappAiCopywriterProps {
  events: EventItem[];
  settings: AppSettings;
  onSaveSettings: (updated: AppSettings) => void;
}

export default function WhatsappAiCopywriter({
  events,
  settings,
  onSaveSettings
}: WhatsappAiCopywriterProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [waTemplate, setWaTemplate] = useState<string>('');
  const [footerText, setFooterText] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0] || {
    name: 'Webinar Digital Transformation 2026',
    organizer: 'ICMI & CertFlow Finora',
    date: '2026-07-09',
    certificatePrefix: 'KOM/DT'
  };

  // Demo participant for mock smartphone preview
  const demoParticipant = {
    name: 'Siti Rahmawati, M.T.',
    nomor: `${activeEvent.certificatePrefix || 'KOM/DT'}/0042`,
    jabatan: 'Narasumber Utama',
    instansi: 'Institut Teknologi Bandung',
    link: 'https://certflow.ai/v/cf-cert-f8312'
  };

  // Preset tones to help the user trigger copywriting quickly
  const promptPresets = [
    {
      label: 'Formal & Profesional',
      prompt: 'Tulis pesan WhatsApp formal, profesional, menggunakan Bahasa Indonesia yang baik dan benar, sopan, melampirkan detail sertifikat {{nama}}, {{nomor}}, {{jabatan}}, dan link unduhan {{link}}.'
    },
    {
      label: 'Ramah & Ceria',
      prompt: 'Buat pesan WhatsApp santai, ramah, penuh semangat dan ceria untuk peserta event. Berikan selamat atas kelulusan mereka. Sertakan emotikon yang relevan dan tampilkan placeholder {{nama}}, {{nomor}}, {{jabatan}}, dan {{link}}.'
    },
    {
      label: 'Singkat & To-The-Point',
      prompt: 'Tulis pesan WhatsApp sangat singkat, padat, langsung menginfokan link unduhan sertifikat {{link}} untuk {{nama}} sebagai {{jabatan}} nomor {{nomor}}.'
    },
    {
      label: 'Gaya Komunitas Tech',
      prompt: 'Tulis pesan WhatsApp ala komunitas startup/IT keren (gunakan sapaan Kak, berikan selamat, ajak share ke LinkedIn/sosmed), sertakan {{nama}}, {{nomor}}, {{jabatan}}, dan tautan {{link}}.'
    }
  ];

  useEffect(() => {
    if (settings) {
      setWaTemplate(settings.waMessageTemplate || '');
      setFooterText(settings.waFooterText || '');
    }
  }, [settings]);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Request server-side Gemini API
  const handleGenerateAiCopy = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || aiPrompt;
    if (!targetPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${targetPrompt}\n\nPeraturan Penting:\n1. Teks harus ditulis dalam Bahasa Indonesia.\n2. Wajib gunakan/sisakan tag placeholder persis: {{nama}}, {{nomor}}, {{jabatan}}, {{event}}, dan {{link}} agar bisa diganti secara otomatis di backend.\n3. Gunakan formatting teks tebal WhatsApp (*teks*) untuk poin penting.\n4. Buat draf pesan WhatsApp yang menarik.`
        })
      });

      const data = await response.json();
      if (data.text) {
        setWaTemplate(data.text);
      } else {
        alert('Gagal memproses draf dari Gemini AI.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi asisten AI Copywriter.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToSettings = () => {
    const updated = {
      ...settings,
      waMessageTemplate: waTemplate,
      waFooterText: footerText
    };
    onSaveSettings(updated);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Parse text to simulate WhatsApp formatting (*bold* to <strong>, newlines to <br>)
  const renderFormattedWhatsAppText = (text: string) => {
    if (!text) return '';

    // Replace variables with demo data
    let parsed = text
      .replace(/{{nama}}/g, demoParticipant.name)
      .replace(/{{nomor}}/g, demoParticipant.nomor)
      .replace(/{{jabatan}}/g, demoParticipant.jabatan)
      .replace(/{{instansi}}/g, demoParticipant.instansi)
      .replace(/{{event}}/g, activeEvent.name)
      .replace(/{{link}}/g, demoParticipant.link);

    // Escape HTML characters safely
    parsed = parsed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Handle *bold* formatting in WhatsApp (e.g. *bold text* -> <strong>bold text</strong>)
    parsed = parsed.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    // Handle newlines
    parsed = parsed.replace(/\n/g, '<br>');

    return parsed;
  };

  return (
    <div className="space-y-6" id="whatsapp-ai-tab">
      <div className="bg-gradient-to-r from-hijau-botol to-emerald-900 text-white p-6 rounded-2xl shadow-sm border border-hijau-botol/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emas animate-pulse" />
            <h2 className="text-xl font-black tracking-tight text-white">WhatsApp AI Assistant Copywriter</h2>
          </div>
          <p className="text-xs text-hijau-soft max-w-2xl">
            Tulis salinan pesan notifikasi kelulusan sertifikasi yang persuasif dan profesional menggunakan Gemini AI. Pesan akan dikirimkan otomatis ke ribuan nomor WhatsApp peserta dalam sekali klik.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-800 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold text-emas">Gateway Terhubung (Kintun)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EDITOR & AI PROMPTER */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Generator Panel */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <Sparkles className="w-5 h-5 text-hijau-botol" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Tulis Salinan dengan Gemini AI</h3>
                <p className="text-[11px] text-gray-400">Pilih salah satu preset instan atau kustomisasikan sesuai keinginan Anda.</p>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Preset Gaya Bahasa:</span>
              <div className="grid grid-cols-2 gap-2">
                {promptPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAiPrompt(preset.prompt);
                      handleGenerateAiCopy(preset.prompt);
                    }}
                    disabled={isGenerating}
                    className="bg-slate-50 hover:bg-hijau-soft/40 hover:text-hijau-botol text-left p-3 rounded-lg border border-gray-100 text-xs font-semibold text-gray-700 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Box */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-gray-600 block">Arahan Kustom untuk AI:</label>
              <div className="relative">
                <textarea
                  placeholder="Tulis instruksi tambahan... (Contoh: Gunakan bahasa santai, sisipkan pesan terima kasih atas dukungan para mentor, ajak share sertifikat ke instagram story...)"
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-3 pr-10 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                />
                <button
                  onClick={() => handleGenerateAiCopy()}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="absolute bottom-3 right-3 bg-hijau-botol hover:bg-hijau-botol/90 disabled:bg-hijau-botol/40 text-white p-2 rounded-lg transition"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Manual Template Editor Panel */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emas" />
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Draf Template Pesan WhatsApp</h3>
                  <p className="text-[11px] text-gray-400">Hasil draf AI bisa diedit manual dan disimpan sebagai setelan bawaan.</p>
                </div>
              </div>
              <button
                onClick={handleSaveToSettings}
                className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Template
              </button>
            </div>

            {showSaveSuccess && (
              <div className="bg-emerald-50 text-hijau-botol p-3 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-2 animate-bounce">
                <Check className="w-4 h-4" /> Berhasil menyimpan draf WhatsApp ke pengaturan sistem!
              </div>
            )}

            {/* Template Variables Legend */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Placeholder Variabel Dinamis:</span>
              <div className="flex flex-wrap gap-1.5">
                {['{{nama}}', '{{nomor}}', '{{jabatan}}', '{{instansi}}', '{{event}}', '{{link}}'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setWaTemplate(prev => prev + ' ' + tag)}
                    className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">💡 Klik variabel di atas untuk menambahkannya secara otomatis ke posisi kursor teks.</p>
            </div>

            {/* Textarea editor */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Isi Pesan:</label>
              <textarea
                value={waTemplate}
                onChange={(e) => setWaTemplate(e.target.value)}
                rows={10}
                className="w-full text-xs font-mono border border-gray-200 rounded-lg p-3.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-slate-50/20"
                placeholder="Tulis pesan Anda disini..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Teks Footer WhatsApp:</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-hijau-botol"
                placeholder="Contoh: Dikirim otomatis oleh WhatsApp Gateway CertFlow"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SMARTPHONE RENDER PREVIEW */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full sticky top-6 space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-center">Live Preview Simulasi WhatsApp</span>
            
            {/* EVENT SELECTOR FOR PREVIEW */}
            <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-100 text-xs flex items-center justify-between gap-3 shadow-sm w-full">
              <span className="font-bold text-slate-700">Gunakan Variabel Event:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-hijau-botol bg-white font-medium text-slate-600"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>

            {/* REALISTIC SMARTPHONE FRAME */}
            <div className="w-full max-w-[340px] mx-auto bg-slate-900 rounded-[38px] p-3.5 shadow-xl border-4 border-slate-800 relative aspect-[9/18]">
              {/* Phone ear-speaker & camera notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-slate-900 h-5 w-28 rounded-b-xl z-20 flex items-center justify-center gap-1.5">
                <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
              </div>

              {/* Phone screen inner */}
              <div className="w-full h-full bg-[#efeae2] rounded-[28px] overflow-hidden flex flex-col relative border border-slate-700/50 z-10">
                {/* Whatsapp header bar */}
                <div className="bg-[#075e54] text-white px-4 pt-6 pb-2.5 flex items-center gap-2 shadow-sm flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center font-bold text-xs border border-emerald-600 text-emas">
                    CF
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold">CertFlow AI Finora</p>
                    <span className="text-[8px] text-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span> Online
                    </span>
                  </div>
                </div>

                {/* Whatsapp scrollable chat section */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3 flex flex-col justify-end bg-[#efeae2] relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>
                  
                  {/* WhatsApp Message Balloon */}
                  <div className="bg-white p-3 rounded-lg rounded-tr-none shadow-sm text-xs max-w-[85%] self-end relative animate-fade-in border border-slate-200">
                    {/* Message Bubble content */}
                    <div 
                      className="text-[11px] text-gray-800 leading-relaxed break-words font-sans space-y-1"
                      dangerouslySetInnerHTML={{ __html: renderFormattedWhatsAppText(waTemplate) || '<em>Tulis draf pesan WhatsApp di sebelah kiri...</em>' }}
                    />
                    
                    {/* Message footer text */}
                    {footerText && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-gray-400 italic">
                        {footerText}
                      </div>
                    )}

                    {/* Time watermark and single check */}
                    <div className="text-[8px] text-gray-400 text-right mt-1 font-semibold flex items-center justify-end gap-0.5">
                      <span>09:42</span>
                      <span className="text-blue-500 font-extrabold">✓✓</span>
                    </div>
                  </div>

                </div>

                {/* Phone Bottom Input simulator */}
                <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 border-t border-slate-200 flex-shrink-0">
                  <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-gray-400 text-left">
                    Ketik pesan...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#128c7e] flex items-center justify-center text-white">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
