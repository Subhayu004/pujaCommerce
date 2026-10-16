import React from 'react';

interface PujaSathiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const PujaSathiLogo: React.FC<PujaSathiLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="PujaSathi Logo"
        className={`${sizeClasses[size]} object-contain rounded-full shadow-xs shrink-0 select-none`}
        referrerPolicy="no-referrer"
      />
      {showText && (
        <span className="font-bold font-heading tracking-tight text-[#292524] text-xl sm:text-2xl">
          PujaSathi
        </span>
      )}
    </div>
  );
};
