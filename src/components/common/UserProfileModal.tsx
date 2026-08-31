import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  User,
  Shield,
  TrendingUp,
  Sparkles,
  Play,
  Pause,
  Mail,
  Phone,
  Building2,
  ThumbsUp,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, tasks } = useApp();
  const [activeTab, setActiveTab] = useState<'geral' | 'tarefas' | 'calendario' | 'eficiencia' | 'horas'>('eficiencia');
  const [isWorkdayPaused, setIsWorkdayPaused] = useState(false);
  const [workdaySeconds, setWorkdaySeconds] = useState(4418); // 01:13:38

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const userTasks = tasks.filter((t) => t.assignedUserId === currentUser.id);
  const completedCount = 67;
  const inProgressCount = 159;
  const noObjectionCount = 30;
  const efficiencyPercentage = 81;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-[#F7F9FA] rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[#DDE3E8] animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-[#17212B] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0F8A4B]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#0F8A4B] rounded-full ring-2 ring-[#17212B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded bg-[#0F8A4B]/20 text-[#0F8A4B] text-[10px] font-bold border border-[#0F8A4B]/40">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                {currentUser.jobTitle} • {currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workday Tracker Bar (Bitrix Style) */}
        <div className="bg-white px-6 py-3 border-b border-[#DDE3E8] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ECF8F1] text-[#0F8A4B]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6B76] tracking-wider block">
                Tempo de Trabalho Hoje
              </span>
              <span className="text-xl font-mono font-black text-[#17212B]">
                {formatTime(workdaySeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWorkdayPaused(!isWorkdayPaused)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isWorkdayPaused
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#F7F9FA] hover:bg-[#EAEFF3] text-[#17212B] border border-[#DDE3E8]'
              }`}
            >
              {isWorkdayPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isWorkdayPaused ? 'Continuar' : 'Pausar'}</span>
            </button>

            <button
              onClick={() => alert('Jornada de trabalho estendida com sucesso.')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>Estender / Finalizar</span>
            </button>
          </div>
        </div>

        {/* Bitrix Navigation Subtabs */}
        <div className="bg-white border-b border-[#DDE3E8] px-6 flex items-center gap-6 text-xs font-bold overflow-x-auto shadow-2xs">
          {[
            { id: 'geral', label: 'Geral' },
            { id: 'tarefas', label: 'Tarefas' },
            { id: 'calendario', label: 'Calendário' },
            { id: 'eficiencia', label: 'Eficiência' },
            { id: 'horas', label: 'Horas Trabalhadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#0F8A4B] text-[#0F8A4B]'
                  : 'border-transparent text-[#5F6B76] hover:text-[#17212B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: EFICIÊNCIA (Exact Bitrix layout from video 04:12) */}
          {activeTab === 'eficiencia' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-[#DDE3E8] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Radial Gauge */}
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#E2E8F0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#0F8A4B"
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * efficiencyPercentage) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-[#17212B] font-mono">
                        {efficiencyPercentage}%
                      </span>
                      <span className="text-[10px] font-bold text-[#5F6B76] uppercase">Eficiência</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#17212B]">Desempenho Geral do Colaborador</h3>
                    <p className="text-xs text-[#5F6B76] max-w-xs">
                      Cálculo automatizado do Bitrix24 baseado no cumprimento de prazos e checklists sem pendências.
                    </p>
                    <span className="inline-block text-[11px] text-[#0F8A4B] font-semibold underline cursor-pointer">
                      Como funciona?
                    </span>
                  </div>
                </div>

                {/* Stat pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
                  <div className="bg-[#ECF8F1] border border-[#0F8A4B]/20 p-3.5 rounded-xl text-center min-w-[110px]">
                    <span className="text-xs font-bold text-[#0F8A4B] block">Tarefas concluídas</span>
                    <span className="text-2xl font-black text-[#0F8A4B] font-mono">{completedCount}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center min-w-[110px]">
                    <span className="text-xs font-bold text-amber-800 block">Sem objeções</span>
                    <span className="text-2xl font-black text-amber-700 font-mono">{noObjectionCount}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-center min-w-[110px]">
                    <span className="text-xs font-bold text-blue-800 block">Em andamento</span>
                    <span className="text-2xl font-black text-blue-700 font-mono">{inProgressCount}</span>
                  </div>
                </div>
              </div>

              {/* Daily Efficiency Chart */}
              <div className="bg-white rounded-2xl border border-[#DDE3E8] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                    Eficiência Diária (Agosto 2026)
                  </h4>
                  <span className="text-xs text-[#5F6B76] font-medium">Média: 82%</span>
                </div>

                {/* SVG Line Chart */}
                <div className="h-44 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />

                    <path
                      d="M 20 50 Q 100 30, 180 35 T 340 25 T 480 30"
                      fill="none"
                      stroke="#0F8A4B"
                      strokeWidth="3"
                    />

                    {/* Data dots */}
                    {[
                      { cx: 20, cy: 50, label: '01 Ago', val: '78%' },
                      { cx: 100, cy: 30, label: '02 Ago', val: '85%' },
                      { cx: 180, cy: 35, label: '03 Ago', val: '82%' },
                      { cx: 260, cy: 40, label: '04 Ago', val: '80%' },
                      { cx: 340, cy: 25, label: '05 Ago', val: '88%' },
                      { cx: 480, cy: 30, label: '06 Ago', val: '84%' },
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.cx} cy={pt.cy} r="4" fill="#0F8A4B" stroke="#fff" strokeWidth="2" />
                        <text x={pt.cx} y="115" fontSize="9" fill="#5F6B76" textAnchor="middle">
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-[#DDE3E8] p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                  Informações de Contato e Cargo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#5F6B76] block">Nome Completo</span>
                    <span className="font-bold text-[#17212B] text-sm">William Barbosa</span>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block">Cargo</span>
                    <span className="font-bold text-[#17212B] text-sm">Web Designer / Diretor de Tecnologia</span>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block">E-mail Corporativo</span>
                    <span className="font-medium text-[#17212B]">william@verads.com.br</span>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block">Telefone</span>
                    <span className="font-medium text-[#17212B]">+55 92 98282-4592</span>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block">Departamento</span>
                    <span className="font-medium text-[#17212B]">
                      Gerência Geral, Comercial, Design, Tráfego
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5F6B76] block">Localização</span>
                    <span className="font-medium text-[#17212B]">Manaus, AM - Brasil</span>
                  </div>
                </div>
              </div>

              {/* Apreciações / Badges */}
              <div className="bg-white rounded-2xl border border-[#DDE3E8] p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                  Apreciações da Empresa
                </h3>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <div>
                      <span className="text-xs font-bold block">Livros e material eletrônico</span>
                      <span className="text-[10px] text-purple-600">Reconhecimento pela equipe</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-[#0F8A4B] border border-emerald-200 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5" />
                    <div>
                      <span className="text-xs font-bold block">Top Eficiência Q3</span>
                      <span className="text-[10px] text-emerald-600">81% de metas batidas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HORAS TRABALHADAS */}
          {activeTab === 'horas' && (
            <div className="bg-white rounded-2xl border border-[#DDE3E8] overflow-hidden shadow-xs animate-fade-in">
              <div className="p-4 border-b border-[#DDE3E8] flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#17212B] uppercase tracking-wider">
                  Registro Semanal de Horas (1 de Agosto - 31 de Agosto)
                </h4>
                <span className="text-xs font-bold text-[#0F8A4B]">Total da Semana: 40h 15m</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] text-[#5F6B76] font-semibold border-b border-[#DDE3E8]">
                  <tr>
                    <th className="p-3">Dia</th>
                    <th className="p-3">Entrada</th>
                    <th className="p-3">Intervalo</th>
                    <th className="p-3">Saída</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F7]">
                  {[
                    { dia: 'Seg, 03 Ago', in: '08:00', int: '12:00 - 13:00', out: '17:00', total: '08:00', status: 'Concluído' },
                    { dia: 'Ter, 04 Ago', in: '08:05', int: '12:00 - 13:00', out: '17:15', total: '08:10', status: 'Concluído' },
                    { dia: 'Qua, 05 Ago', in: '07:55', int: '12:00 - 13:00', out: '17:00', total: '08:05', status: 'Concluído' },
                    { dia: 'Qui, 06 Ago', in: '08:00', int: '12:00 - 13:00', out: '17:00', total: '08:00', status: 'Concluído' },
                    { dia: 'Sex, 07 Ago', in: '08:10', int: '12:00 - 13:00', out: '17:10', total: '08:00', status: 'Concluído' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#F7F9FA]">
                      <td className="p-3 font-bold text-[#17212B]">{row.dia}</td>
                      <td className="p-3 font-mono">{row.in}</td>
                      <td className="p-3 font-mono text-[#5F6B76]">{row.int}</td>
                      <td className="p-3 font-mono">{row.out}</td>
                      <td className="p-3 font-mono font-bold text-[#0F8A4B]">{row.total}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0F8A4B] text-[10px] font-bold">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
