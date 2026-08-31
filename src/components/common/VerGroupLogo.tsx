import React, { useState } from 'react';

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
  const [imgError, setImgError] = useState(false);

  const logoSrc = variant === 'green' ? '/vergroup-logo-green.png' : '/vergroup-logo-white.png';

  const heightClasses = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const brandColor = variant === 'white' ? '#FFFFFF' : '#1F9B79';

  return (
    <div className={`flex flex-col items-start ${className}`}>
      {!imgError ? (
        <img
          src={logoSrc}
          alt="VERGROUP Logo"
          className={`${heightClasses[size]} w-auto object-contain drop-shadow-2xs transition-all`}
          onError={() => setImgError(true)}
        />
      ) : (
        /* High Resolution Vector Fallback Logo */
        <div className={`flex items-center gap-2 font-display ${heightClasses[size]}`}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 50 10 C 30 10 15 30 25 55 C 32 72 45 85 50 90 C 55 85 68 72 75 55 C 85 30 70 10 50 10 Z"
              fill={brandColor}
            />
            <path
              d="M 50 25 C 40 25 32 38 38 52 C 43 63 50 72 50 72 C 50 72 57 63 62 52 C 68 38 60 25 50 25 Z"
              fill={variant === 'white' ? '#0F493A' : '#FFFFFF'}
            />
          </svg>
          <div className="flex flex-col justify-center">
            <span
              className="font-bold tracking-tight leading-none"
              style={{
                color: brandColor,
                fontSize: size === 'sm' ? '18px' : size === 'md' ? '24px' : '32px',
              }}
            >
              vergroup
            </span>
          </div>
        </div>
      )}

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
