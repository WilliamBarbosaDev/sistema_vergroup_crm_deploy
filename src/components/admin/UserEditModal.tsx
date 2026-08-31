import React, { useState } from 'react';
import { X, User as UserIcon, Phone, MapPin, Globe, Calendar, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose }) => {
  const { setUsers, addAuditLog, currentUser } = useApp();

  const [avatar, setAvatar] = useState(user.avatar || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [extensionPhone, setExtensionPhone] = useState(user.extensionPhone || '');
  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
  const [city, setCity] = useState(user.city || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [language, setLanguage] = useState(user.language || 'Português (Brasil)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              avatar,
              phone,
              extensionPhone,
              emergencyContact,
              city,
              birthDate,
              language,
            }
          : u
      )
    );

    addAuditLog('update', 'User', user.id, `Perfil de ${user.name} atualizado (Telefone, Ramal, Cidade, Contato Emergência)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserIcon className="w-5 h-5 text-[#0F8A4B]" />
            <div>
              <h2 className="text-sm font-black tracking-tight">Editar Dados Pessoais do Perfil</h2>
              <p className="text-xs text-slate-400 font-medium">{user.name} ({user.jobTitle})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1.5 text-xs font-extrabold text-slate-700">
            <label>URL da Foto de Perfil (Avatar)</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-extrabold text-slate-700">
            <div className="space-y-1.5">
              <label>Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label>Ramal Telefônico</label>
              <input
                type="text"
                value={extensionPhone}
                onChange={(e) => setExtensionPhone(e.target.value)}
                placeholder="Ex: 4002"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-extrabold text-slate-700">
            <label>Contato de Emergência</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Ex: +55 92 99111-0000 (Esposa)"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-extrabold text-slate-700">
            <div className="space-y-1.5">
              <label>Cidade / Localização</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Manaus, AM"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label>Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-extrabold text-slate-700">
            <label>Idioma Preferencial</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#0F8A4B] font-semibold text-slate-800 bg-white"
            >
              <option value="Português (Brasil)">Português (Brasil)</option>
              <option value="English (US)">English (US)</option>
              <option value="Español">Español</option>
            </select>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Campos organizacionais como Cargo, Departamento, Business Unit e Papel RBAC necessitam de permissão administrativa e devem ser alterados na Matriz RBAC.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F8A4B] hover:bg-[#0B6B3A] text-white rounded-xl text-xs font-black shadow-2xs cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
