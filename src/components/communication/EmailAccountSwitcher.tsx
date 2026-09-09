import React from 'react';
import { Mail, ChevronDown, Plus } from 'lucide-react';
import { EmailAccountConfig } from '../../types';

interface EmailAccountSwitcherProps {
  accounts: EmailAccountConfig[];
  activeId: string;
  onChange: (id: string) => void;
  onCreateNew?: () => void;
}

export const EmailAccountSwitcher: React.FC<EmailAccountSwitcherProps> = ({
  accounts,
  activeId,
  onChange,
  onCreateNew,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md">
      <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
      <select
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent text-sm text-neutral-800 outline-none"
      >
        {accounts.length === 0 ? (
          <option value="">Nenhuma conta configurada</option>
        ) : (
          accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName || account.email}
            </option>
          ))
        )}
      </select>
      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 pointer-events-none" />
      {onCreateNew && (
        <button
          type="button"
          onClick={onCreateNew}
          className="ml-1 inline-flex items-center justify-center w-7 h-7 rounded-md border border-neutral-200 hover:bg-white text-neutral-500 hover:text-[#0F8A4B]"
          title="Adicionar nova conta"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};