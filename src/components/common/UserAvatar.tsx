import React from 'react';

export interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'active' | 'inactive' | 'absent' | 'offline' | 'blocked' | 'invited';
  badgeCount?: number;
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  status,
  badgeCount,
  showStatus = true,
  className = '',
  onClick,
}) => {
  // Generate uppercase initials fallback (e.g. "William Barbosa" -> "WB")
  const getInitials = (fullName: string) => {
    if (!fullName) return 'VG';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base',
  };

  const statusDotSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
  };

  const statusColor = status === 'active'
    ? 'bg-[#0F8A4B]'
    : status === 'absent'
      ? 'bg-amber-400'
      : 'bg-slate-400';

  const statusLabel = status === 'active'
    ? 'Ativo'
    : status === 'absent'
      ? 'Ausente'
      : status === 'offline'
        ? 'Offline'
        : status === 'inactive'
          ? 'Inativo'
          : status === 'invited'
            ? 'Convidado'
            : 'Bloqueado';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shadow-2xs`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-[#ECF8F1] border border-[#0F8A4B]/20 text-[#0B6B3A] font-black flex items-center justify-center tracking-wider shadow-2xs`}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Real Presence Status Dot */}
      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-white ${statusDotSizes[size]} ${statusColor}`}
          title={statusLabel}
        />
      )}

      {/* Discrete Notification Badge */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-2xs">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </div>
  );
};
