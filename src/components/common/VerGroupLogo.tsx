import React from 'react';

interface VerGroupLogoProps {
  variant?: 'white' | 'green' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const VerGroupLogo: React.FC<VerGroupLogoProps> = ({
  variant = 'white',
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const logoSrc = variant === 'green' ? '/vergroup-logo-green.png' : '/vergroup-logo-white.png';

  const heightClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <img
        src={logoSrc}
        alt="VERGROUP Logo"
        className={`${heightClasses[size]} w-auto object-contain drop-shadow-sm`}
        onError={(e) => {
          // Fallback if image fails to render
          e.currentTarget.style.display = 'none';
        }}
      />
      {showSubtitle && (
        <span className={`text-[10px] font-extrabold tracking-widest uppercase mt-1 ${
          variant === 'white' ? 'text-emerald-200' : 'text-[#0F8A4B]'
        }`}>
          Sistema Integrado ERP & CRM
        </span>
      )}
    </div>
  );
};
