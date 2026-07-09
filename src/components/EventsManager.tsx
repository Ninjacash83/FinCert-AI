import React, { useState } from 'react';
import { EventItem } from '../types';
import { Calendar, MapPin, Tag, Plus, Edit2, Trash2, Search, Check, AlertCircle } from 'lucide-react';

interface EventsManagerProps {
  events: EventItem[];
  activeEventId: string | null;
  onSetActiveEvent: (id: string) => void;
  onAddEvent: (event: Omit<EventItem, 'id' | 'createdAt'>) => void;
  onUpdateEvent: (event: EventItem) => void;
  onDeleteEvent: (id: string) => void;
  showAddFormInitially?: boolean;
}

export default function EventsManager({
  events,
  activeEventId,
  onSetActiveEvent,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  showAddFormInitially = false
}: EventsManagerProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(showAddFormInitially);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [prefix, setPrefix] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.organizer.toLowerCase().includes(search.toLowerCase()) ||
    e.certificatePrefix.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setOrganizer('');
    setDate('');
    setLocation('');
    setPrefix('');
    setDescription('');
    setError('');
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleEdit = (event: EventItem) => {
    setEditingEvent(event);
    setName(event.name);
    setOrganizer(event.organizer);
    setDate(event.date);
    setLocation(event.location);
    setPrefix(event.certificatePrefix);
    setDescription(event.description);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !organizer || !date || !prefix) {
      setError('Harap isi semua kolom wajib (Nama, Penyelenggara, Tanggal, & Format Penomoran).');
      return;
    }

    if (editingEvent) {
      onUpdateEvent({
        ...editingEvent,
        name,
        organizer,
        date,
        location,
        certificatePrefix: prefix,
        description
      });
    } else {
      onAddEvent({
        name,
        organizer,
        date,
        location,
        certificatePrefix: prefix,
        description
      });
    }
    resetForm();
  };

  return (
    <div className="space-y-6" id="events-tab-content">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manajemen Event & Kegiatan</h2>
          <p className="text-xs text-gray-500">Kelola semua kegiatan terdaftar yang memerlukan pembuatan sertifikat otomatis.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Event Baru
          </button>
        )}
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-base">
            {editingEvent ? 'Edit Detail Event' : 'Buat Event Baru'}
          </h3>
          
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Nama Event / Kegiatan <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Contoh: Webinar Digital Marketing 2026"
                rows={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Penyelenggara / Organizer <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Contoh: CertFlow Academy"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Tanggal Pelaksanaan <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Lokasi / Media Kegiatan</label>
              <input
                type="text"
                placeholder="Contoh: Online via Zoom atau Bandung Creative Hub"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-600">
                Prefix / Format Penomoran Sertifikat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: KOM/DT/2026 (Nanti nomor urut otomatis: KOM/DT/2026/0001)"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol"
              />
              <p className="text-[11px] text-gray-400">Setiap sertifikat yang dicetak akan diberikan nomor serial unik otomatis menggunakan format ini.</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Deskripsi / Detail Tambahan</label>
              <textarea
                placeholder="Tulis ringkasan kegiatan..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-hijau-botol hover:bg-hijau-botol/90 text-white font-medium px-4 py-2 rounded-lg text-xs transition"
            >
              {editingEvent ? 'Simpan Perubahan' : 'Simpan Event'}
            </button>
          </div>
        </form>
      )}

      {/* List Events */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari event, penyelenggara, atau format penomoran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol"
          />
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => {
            const isActive = activeEventId === event.id;
            return (
              <div 
                key={event.id}
                className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between ${
                  isActive ? 'border-hijau-botol ring-2 ring-hijau-botol/10' : 'border-gray-100'
                }`}
              >
                {isActive && (
                  <span className="absolute top-4 right-4 bg-hijau-soft text-hijau-botol text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Event Aktif
                  </span>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] bg-hijau-soft/40 text-hijau-botol border border-hijau-botol/10 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                    {event.certificatePrefix}
                  </span>
                  <h4 className="font-bold text-gray-800 text-base leading-tight pr-14 whitespace-pre-line">{event.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">Penyelenggara: {event.organizer}</p>
                  
                  {event.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{event.description}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> {event.date}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {event.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
                  {!isActive ? (
                    <button
                      onClick={() => onSetActiveEvent(event.id)}
                      className="bg-hijau-soft hover:bg-hijau-soft/85 text-hijau-botol font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Pilih Sebagai Event Aktif
                    </button>
                  ) : (
                    <span className="text-xs text-hijau-botol font-semibold flex items-center gap-1">
                      Siap Diproses
                    </span>
                  )}

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1.5 text-gray-400 hover:text-hijau-botol hover:bg-gray-50 rounded-lg transition"
                      title="Edit Event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-lg transition"
                      title="Hapus Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="col-span-full bg-slate-50 border border-dashed border-gray-200 rounded-xl py-12 text-center text-gray-400 text-sm space-y-2">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <p>Tidak ada kegiatan yang ditemukan.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="text-xs text-hijau-botol font-bold hover:underline"
              >
                Buat event pertama Anda sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
