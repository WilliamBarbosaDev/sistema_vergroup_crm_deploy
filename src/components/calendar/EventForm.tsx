import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent, MeetingModality } from '../../types';
import { Calendar, Clock, MapPin, Users, Video, Link as LinkIcon, Building2, Search, X, Check, AlertCircle } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface EventFormProps {
  onClose: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ onClose }) => {
  const { currentUser, users, addCalendarEvent, checkAvailability, businessUnits } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<'meeting' | 'event' | 'task' | 'reminder'>('meeting');
  const [modality, setModality] = useState<MeetingModality>('online');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [businessUnitId, setBusinessUnitId] = useState(currentUser.primaryBusinessUnitId);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([currentUser.id]);
  const [searchQuery, setSearchQuery] = useState('');

  // Availability Check
  const startIso = date && startTime ? new Date(`${date}T${startTime}`).toISOString() : '';
  const endIso = date && endTime ? new Date(`${date}T${endTime}`).toISOString() : '';
  
  const availabilityStatus = (startIso && endIso && selectedUserIds.length > 0) 
    ? checkAvailability(selectedUserIds, startIso, endIso) 
    : 'unknown';

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleGenerateMeet = () => {
    // Mocking Google Meet Link Generation
    setMeetingLink(`https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;

    if (availabilityStatus === 'busy') {
      const confirm = window.confirm('Existe um conflito total de agenda para os participantes neste horário. Deseja agendar mesmo assim?');
      if (!confirm) return;
    }

    addCalendarEvent({
      businessUnitId,
      title,
      description,
      start: startIso,
      end: endIso,
      type,
      modality,
      location: modality === 'presential' ? location : undefined,
      meetingLink: modality === 'online' ? meetingLink : undefined,
      organizerId: currentUser.id,
      attendees: selectedUserIds.map(uid => ({
        userId: uid,
        status: uid === currentUser.id ? 'accepted' : 'pending' // Organizer auto-accepts
      })),
      reminders: [15],
      status: 'scheduled',
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[85vh] custom-scrollbar bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Details */}
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Detalhes Principais</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Ex: Reunião de Planejamento Q3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  >
                    <option value="meeting">Reunião</option>
                    <option value="event">Evento</option>
                    <option value="task">Compromisso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Unit</label>
                  <select
                    value={businessUnitId}
                    onChange={(e) => setBusinessUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  >
                    {businessUnits.map(bu => (
                      <option key={bu.id} value={bu.id}>{bu.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Descrição (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Pauta da reunião, observações importantes..."
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Data e Horário</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Data *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Início *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Término *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Availability Indicator */}
            {date && startTime && endTime && selectedUserIds.length > 0 && (
              <div className={`mt-4 p-3 rounded-xl border flex items-start gap-3 ${
                availabilityStatus === 'available' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                availabilityStatus === 'partial' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs font-medium leading-relaxed">
                  {availabilityStatus === 'available' && <strong>Todos os participantes estão livres.</strong>}
                  {availabilityStatus === 'partial' && <strong>Alguns participantes possuem conflito de agenda neste horário.</strong>}
                  {availabilityStatus === 'busy' && <strong>Conflito total! Todos os convidados estão ocupados.</strong>}
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Modalidade</h3>
            
            <div className="flex gap-4 mb-4">
              <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                modality === 'online' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'
              }`}>
                <input type="radio" name="modality" value="online" checked={modality === 'online'} onChange={() => setModality('online')} className="sr-only" />
                <Video className={`w-6 h-6 ${modality === 'online' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${modality === 'online' ? 'text-blue-900' : 'text-slate-600'}`}>Online</span>
              </label>
              
              <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                modality === 'presential' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200'
              }`}>
                <input type="radio" name="modality" value="presential" checked={modality === 'presential'} onChange={() => setModality('presential')} className="sr-only" />
                <Building2 className={`w-6 h-6 ${modality === 'presential' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${modality === 'presential' ? 'text-emerald-900' : 'text-slate-600'}`}>Presencial</span>
              </label>
            </div>

            {modality === 'presential' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Localização *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    placeholder="Ex: Sala de Reunião 01, Cliente X..."
                  />
                </div>
              </div>
            )}

            {modality === 'online' && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleGenerateMeet} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-200 transition flex items-center gap-2">
                    <Video className="w-4 h-4" /> Gerar Link Google Meet
                  </button>
                  <span className="text-xs text-slate-400 font-medium">ou</span>
                </div>
                
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Cole o link da reunião aqui..."
                  />
                </div>
                {!meetingLink && <p className="text-[10px] text-slate-500">A integração oficial com o Google Calendar criará este link automaticamente no futuro.</p>}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Attendees */}
        <div className="space-y-4">
          <section className="bg-slate-50 rounded-2xl p-5 border border-slate-200 h-full flex flex-col">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Convidados ({selectedUserIds.length})
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar colaboradores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {filteredUsers.map(user => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div 
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="relative">
                      <UserAvatar name={user.name} avatarUrl={user.avatar} size="sm" showStatus={false} />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user.name} {user.id === currentUser.id && '(Você)'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{user.jobTitle}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <p className="text-[10px] text-slate-500 mt-4 text-center">
              Os convidados receberão uma notificação no sistema para confirmar presença (RSVP).
            </p>
          </section>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-900/20 transition flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          Agendar Compromisso
        </button>
      </div>
    </form>
  );
};
