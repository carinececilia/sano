import React from 'react';
import sanoIconUrl from '../assets/images/sano_app_icon_1786997684644.jpg';

interface SanoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  className?: string;
}

export const SanoLogo: React.FC<SanoLogoProps> = ({
  size = 'md',
  showText = false,
  textClassName = '',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative shrink-0 overflow-hidden shadow-xs border border-indigo-100/60 bg-white ${sizeMap[size]}`}>
        <img
          src={sanoIconUrl}
          alt="Sano Ícone"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <span className={`font-extrabold tracking-tight text-slate-800 ${textClassName || 'text-xl'}`}>
          Sano
        </span>
      )}
    </div>
  );
};
