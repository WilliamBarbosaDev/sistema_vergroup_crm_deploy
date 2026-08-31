import React from 'react';
import greenLogoAsset from '../../assets/vergroup-logo-green.png';
import whiteLogoAsset from '../../assets/vergroup-logo-white.png';

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
  const logoSrc = variant === 'green' ? greenLogoAsset : whiteLogoAsset;

  const heightClasses = {
    sm: 'h-9 text-base',
    md: 'h-12 text-xl',
    lg: 'h-16 text-2xl',
    xl: 'h-24 text-4xl',
  };

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <img
        src={logoSrc}
        alt="VERGROUP Logo"
        className={`${heightClasses[size]} w-auto object-contain shrink-0`}
        style={{ maxHeight: size === 'sm' ? '36px' : size === 'md' ? '48px' : '64px' }}
      />
      {showSubtitle && (
        <span
          className={`text-[10px] font-extrabold tracking-widest uppercase mt-1 ${
            variant === 'white' ? 'text-emerald-200' : 'text-[#0F8A4B]'
          }`}
        >
          Sistema Integrado ERP & CRM
        </span>
      )}
    </div>
  );
};
