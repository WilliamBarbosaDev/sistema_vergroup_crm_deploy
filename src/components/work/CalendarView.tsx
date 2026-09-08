import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export const CalendarView: React.FC = () => {
  const {
    calendarEvents,
    tasks,
    users,
    currentUser,
    filterByBU,
    setQuickCreateType,
    updateEventStatus
  } = useApp();

  const filteredEvents = filterByBU(calendarEvents);
  const filteredTasks = filterByBU(tasks).filter(t => t.dueDate);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('agenda');
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Utilities for Date Math
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getMonthDisplay = () => {
    return currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const handleRsvp = (eventId: string, status: 'accepted' | 'declined' | 'tentative') => {
    updateEventStatus(eventId, currentUser.id, status);
  };

  return (
    <div id="calendar-view" className="p-4 md:p-6 max-w-full space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner border border-indigo-100">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Agenda Corporativa</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-slate-500 uppercase tracking-wider">
                {filteredEvents.length} Eventos
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Gestão de tempo, reuniões presenciais, encontros online e deadlines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
          {/* Navigation */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs shrink-0">
            <button onClick={prevPeriod} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-slate-700 min-w-[120px] text-center tracking-tight truncate">
              {getMonthDisplay()}
            </span>
            <button onClick={nextPeriod} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0">
            {(['agenda', 'day', 'week', 'month'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === mode ? 'bg-white shadow-xs border border-slate-200 text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode === 'agenda' ? 'Lista' : mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setQuickCreateType('event')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-900/10 cursor-pointer shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Reunião</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Calendar Area */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[70vh] min-h-[600px]">
          
          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                {daysOfWeek.map((day) => (
                  <div key={day} className="py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-5">
                {Array.from({ length: 35 }).map((_, i) => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const firstDay = getFirstDayOfMonth(year, month);
                  const daysInMonth = getDaysInMonth(year, month);
                  
                  const dayNum = i - firstDay + 1;
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                  const isToday = isCurrentMonth && dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                  // Find events for this day
                  const dayEvents = isCurrentMonth ? filteredEvents.filter(evt => {
                    const d = new Date(evt.start);
                    return d.getDate() === dayNum && d.getMonth() === month && d.getFullYear() === year && evt.status !== 'cancelled';
                  }) : [];

                  return (
                    <div key={i} className={`border-b border-r border-slate-100 p-1.5 flex flex-col gap-1 transition-colors ${
                      isCurrentMonth ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/30'
                    }`}>
                      {isCurrentMonth && (
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-700'
                          }`}>
                            {dayNum}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                        {dayEvents.map(evt => (
                          <div key={evt.id} className={`text-[10px] font-bold px-1.5 py-1 rounded-md truncate cursor-pointer transition-colors ${
                            evt.modality === 'online' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`} title={evt.title}>
                            {new Date(evt.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {evt.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AGENDA VIEW */}
          {viewMode === 'agenda' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <CalendarIcon className="w-12 h-12 text-slate-200" />
                  <p className="text-sm font-bold">Nenhum compromisso agendado.</p>
                </div>
              ) : (
                filteredEvents
                  .filter(e => e.status !== 'cancelled')
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .map(evt => {
                    const start = new Date(evt.start);
                    const end = new Date(evt.end);
                    const organizer = users.find(u => u.id === evt.organizerId);
                    
                    // My RSVP status
                    const myAttendeeRecord = evt.attendees.find(a => a.userId === currentUser.id);
                    const isOrganizer = evt.organizerId === currentUser.id;
                    const rsvpStatus = myAttendeeRecord?.status || 'pending';

                    return (
                      <div key={evt.id} className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all shadow-xs hover:shadow-md flex flex-col md:flex-row gap-5">
                        
                        {/* Date Left Box */}
                        <div className="flex flex-col items-center justify-center min-w-[70px] shrink-0 bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {start.toLocaleString('pt-BR', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-black text-slate-900 leading-none my-1">
                            {start.getDate()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {start.toLocaleString('pt-BR', { weekday: 'short' })}
                          </span>
                        </div>

                        {/* Middle Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded uppercase tracking-wider text-[9px] font-black ${
                              evt.modality === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {evt.modality === 'online' ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                              {evt.modality === 'online' ? 'Online' : 'Presencial'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider">
                              {evt.type}
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-900 truncate mb-2">{evt.title}</h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {evt.modality === 'online' ? <LinkIcon className="w-4 h-4 text-blue-400" /> : <MapPin className="w-4 h-4 text-emerald-400" />}
                              <span className="truncate max-w-[200px]">{evt.modality === 'online' ? (evt.meetingLink || 'Link pendente') : (evt.location || 'Local pendente')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            <div className="flex -space-x-2">
                              {evt.attendees.map(a => {
                                const u = users.find(user => user.id === a.userId);
                                if (!u) return null;
                                return <UserAvatar key={u.id} name={u.name} avatarUrl={u.avatar} size="xs" showStatus={false} className="border-2 border-white rounded-full" />;
                              })}
                            </div>
                            <span className="text-slate-400 font-semibold ml-1">
                              Organizado por {organizer?.name}
                            </span>
                          </div>
                        </div>

                        {/* Right Actions / RSVP */}
                        <div className="flex flex-col justify-center items-end shrink-0 gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                          {isOrganizer ? (
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Você é o organizador
                            </span>
                          ) : (
                            <div className="w-full">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 text-right">Seu Status</div>
                              {rsvpStatus === 'pending' ? (
                                <div className="flex gap-2">
                                  <button onClick={() => handleRsvp(evt.id, 'accepted')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                                    <CheckCircle2 className="w-4 h-4" /> Aceitar
                                  </button>
                                  <button onClick={() => handleRsvp(evt.id, 'declined')} className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                                    <XCircle className="w-4 h-4" /> Recusar
                                  </button>
                                </div>
                              ) : rsvpStatus === 'accepted' ? (
                                <span className="inline-flex w-full md:w-auto justify-end text-xs font-black text-emerald-600 items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" /> Presença Confirmada
                                </span>
                              ) : (
                                <span className="inline-flex w-full md:w-auto justify-end text-xs font-black text-rose-600 items-center gap-1.5">
                                  <XCircle className="w-4 h-4" /> Recusado
                                </span>
                              )}
                            </div>
                          )}

                          {evt.modality === 'online' && evt.meetingLink && (rsvpStatus === 'accepted' || isOrganizer) && (
                            <a href={evt.meetingLink} target="_blank" rel="noreferrer" className="w-full text-center mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-900/10 cursor-pointer">
                              Entrar na Reunião
                            </a>
                          )}
                        </div>

                      </div>
                    )
                  })
              )}
            </div>
          )}

          {/* DAY / WEEK VIEWS FALLBACK */}
          {(viewMode === 'day' || viewMode === 'week') && (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3 bg-slate-50/50">
              <CalendarIcon className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold max-w-sm text-center">
                A visão detalhada de timeline {viewMode === 'day' ? 'diária' : 'semanal'} está em construção. Por enquanto, utilize a visão Lista ou Mês.
              </p>
              <button onClick={() => setViewMode('agenda')} className="mt-2 text-indigo-600 font-bold text-xs hover:underline cursor-pointer">
                Voltar para Lista
              </button>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Deadlines de Tarefas
            </h2>
            
            {filteredTasks.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium text-center py-4">Nenhuma tarefa com prazo pendente.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {filteredTasks.slice(0, 5).map(task => {
                  const dueDate = new Date(task.dueDate!);
                  const isLate = dueDate < new Date() && task.status !== 'completed';
                  return (
                    <div key={task.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className={`w-1 shrink-0 rounded-full ${isLate ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-slate-800 truncate">{task.title}</h4>
                        <div className={`text-[10px] font-bold mt-1 ${isLate ? 'text-rose-600' : 'text-slate-500'}`}>
                          Prazo: {dueDate.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            <h2 className="text-sm font-black flex items-center gap-2 mb-2 relative z-10">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Inteligência de Agenda
            </h2>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed relative z-10 mb-4">
              O VERGROUP identifica conflitos de horário automaticamente ao agendar reuniões com a sua equipe, respeitando o isolamento entre Unidades de Negócio.
            </p>
            <div className="text-[10px] text-indigo-300 font-bold bg-indigo-950/50 p-2.5 rounded-lg border border-indigo-500/30">
              Integração oficial Google Calendar em breve.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
