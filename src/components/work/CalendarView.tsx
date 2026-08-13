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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';

export const CalendarView: React.FC = () => {
  const {
    calendarEvents,
    tasks,
    users,
    filterByBU,
    setQuickCreateType,
  } = useApp();

  const filteredEvents = filterByBU(calendarEvents);
  const filteredTasks = filterByBU(tasks);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('agenda');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div id="calendar-view" className="p-4 md:p-6 max-w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#17212B]">Agenda & Reuniões Corporativas</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#F7F9FA] border border-[#DDE3E8] rounded text-[#5F6B76]">
                {filteredEvents.length} eventos agendados
              </span>
            </div>
            <p className="text-xs text-[#5F6B76] mt-0.5">
              Reuniões com clientes, reuniões operacionais e prazos de entrega integrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-[#F7F9FA] border border-[#DDE3E8] rounded-md p-0.5 text-xs">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                viewMode === 'agenda' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
              }`}
            >
              Lista / Agenda
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white shadow-2xs text-[#0F8A4B]' : 'text-[#5F6B76]'
              }`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={() => setQuickCreateType('event')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* AGENDA / LIST VIEW */}
      {viewMode === 'agenda' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Events List */}
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
              Próximos Compromissos
            </h2>

            {filteredEvents.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-[#DDE3E8] text-center text-xs text-[#5F6B76]">
                Nenhum evento agendado para o período.
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const organizer = users.find((u) => u.id === evt.organizerId);
                const startDate = new Date(evt.start);

                return (
                  <div
                    key={evt.id}
                    className="bg-white p-4 rounded-xl border border-[#DDE3E8] hover:border-[#0F8A4B] shadow-xs transition-all space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-[#ECF8F1] text-[#0F8A4B] rounded-lg text-center min-w-[54px] shrink-0">
                        <span className="block text-[10px] font-bold uppercase">
                          {startDate.toLocaleString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="block text-base font-extrabold leading-none mt-0.5">
                          {startDate.getDate()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-[#17212B]">{evt.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5F6B76]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#0F8A4B]" />
                            {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3 text-blue-600" />
                            {evt.location || 'Google Meet'}
                          </span>
                          <span>Org: {organizer?.name.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href="https://meet.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Entrar na Sala</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Side: Deadlines from Tasks */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
              Prazos de Entregas & Tarefas
            </h2>
            <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs space-y-3">
              {filteredTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="text-xs pb-2.5 border-b border-[#F0F4F7] last:border-b-0 last:pb-0">
                  <p className="font-semibold text-[#17212B] line-clamp-1">{task.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#5F6B76] mt-1">
                    <span>Vence: <strong className="text-[#17212B]">{task.dueDate}</strong></span>
                    <span className="bg-[#F7F9FA] px-1.5 py-0.2 rounded font-semibold border border-[#DDE3E8]">
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* MONTH GRID VIEW */
        <div className="bg-white rounded-xl border border-[#DDE3E8] p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#17212B]">
              {currentMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonthDate(new Date(currentMonthDate.setMonth(currentMonthDate.getMonth() - 1)))}
                className="p-1 border border-[#DDE3E8] rounded hover:bg-[#F7F9FA]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date(currentMonthDate.setMonth(currentMonthDate.getMonth() + 1)))}
                className="p-1 border border-[#DDE3E8] rounded hover:bg-[#F7F9FA]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#DDE3E8] rounded-lg overflow-hidden border border-[#DDE3E8]">
            {daysOfWeek.map((d) => (
              <div key={d} className="bg-[#F7F9FA] p-2 text-center text-xs font-bold text-[#5F6B76]">
                {d}
              </div>
            ))}

            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = ((i % 31) + 1);
              const hasEvents = filteredEvents.filter(e => new Date(e.start).getDate() === dayNum);

              return (
                <div key={i} className="bg-white p-2 min-h-[90px] text-xs flex flex-col justify-between hover:bg-[#F7F9FA]">
                  <span className="font-semibold text-[#5F6B76]">{dayNum}</span>
                  <div className="space-y-1 mt-1">
                    {hasEvents.map((e) => (
                      <div key={e.id} className="p-1 bg-[#ECF8F1] text-[#0F8A4B] text-[10px] font-bold rounded truncate">
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
