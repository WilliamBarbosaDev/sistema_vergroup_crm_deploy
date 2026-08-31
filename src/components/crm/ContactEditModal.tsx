import React, { useState, useEffect } from 'react';
import { Users, X, Plus, Trash2, Check, Building2, Phone, Mail, Globe, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Contact, ContactPhone, ContactEmail, ContactRoleType } from '../../types';

interface ContactEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export const ContactEditModal: React.FC<ContactEditModalProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  const { companies, users, updateContact } = useApp();

  const [name, setName] = useState(contact.name || '');
  const [salutation, setSalutation] = useState(contact.salutation || '');
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [document, setDocument] = useState(contact.document || '');
  const [jobTitle, setJobTitle] = useState(contact.jobTitle || '');
  const [companyId, setCompanyId] = useState(contact.companyId || '');
  const [city, setCity] = useState(contact.city || '');
  const [birthDate, setBirthDate] = useState(contact.birthDate || '');
  const [assignedUserId, setAssignedUserId] = useState(contact.assignedUserId || '');
  const [tagsText, setTagsText] = useState((contact.tags || []).join(', '));
  const [notes, setNotes] = useState(contact.notes || '');

  // Digital channels
  const [whatsapp, setWhatsapp] = useState(contact.digitalChannels?.whatsapp || contact.phone || '');
  const [linkedin, setLinkedin] = useState(contact.digitalChannels?.linkedin || '');
  const [instagram, setInstagram] = useState(contact.digitalChannels?.instagram || '');
  const [website, setWebsite] = useState(contact.digitalChannels?.website || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const parsedTags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateContact(contact.id, {
      name: name.trim(),
      salutation: salutation.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      document: document.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      companyId: companyId || undefined,
      city: city.trim() || undefined,
      birthDate: birthDate || undefined,
      assignedUserId: assignedUserId || contact.assignedUserId,
      tags: parsedTags,
      notes: notes.trim() || undefined,
      digitalChannels: {
        whatsapp: whatsapp.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-[#E2E6EA] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E6EA] flex items-center justify-between bg-[#F8FAFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ECF8F1] text-[#0B6B3A] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-display">
                Editar / Completar Ficha do Contato
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                {contact.name} • {contact.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
          
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Saudação</label>
              <input
                type="text"
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                placeholder="Ex: Sr., Dr., Prezado"
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block font-semibold text-slate-700">Nome Completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 font-medium outline-none focus:border-[#0F8A4B]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">E-mail Principal *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Telefone / WhatsApp *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Documento (CPF/RG)</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Ex: 000.000.000-00"
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Cargo / Função</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Diretor de TI, Gerente Financeiro"
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Empresa Principal</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              >
                <option value="">Nenhuma empresa vinculada</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tradeName} ({c.corporateName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Cidade / UF</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Manaus, AM"
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Responsável Interno</label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Canais Digitais */}
          <div className="pt-2 border-t border-[#E2E6EA] space-y-2">
            <span className="block font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Canais Digitais & Redes
            </span>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn URL (ex: linkedin.com/in/usuario)"
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              />
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram handle (ex: @usuario)"
                className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Tags (Separadas por vírgula)</label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Ex: DECISOR, CLIENTE, VIP, VERADS"
              className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B]"
            />
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Observações Cadastrais</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anotações gerais sobre o perfil do contato..."
              className="w-full px-3 py-1.5 border border-[#E2E6EA] rounded-lg bg-white text-slate-900 outline-none focus:border-[#0F8A4B] resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E6EA] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Salvar Cadastro
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
