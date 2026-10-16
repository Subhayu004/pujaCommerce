import React, { useState } from 'react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '918450002545',
  defaultMessage = 'Namaste PujaSathi, I would like to inquire about booking a puja or samagri essentials.',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <aside
      aria-label="WhatsApp Support Contact"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group"
    >
      {/* Tooltip badge */}
      <div
        className={`hidden sm:flex items-center gap-2 bg-white text-[#1C1917] px-3 py-1.5 rounded-full shadow-md border border-[#E7DCCE] text-[11px] font-medium transition-all duration-300 pointer-events-none select-none ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Chat with us on WhatsApp</span>
      </div>

      {/* Floating Button with uploaded WhatsApp icon */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with PujaSathi on WhatsApp (+91 84500 02545)"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
      >
        <img
          src="/whatsapp.svg"
          alt="WhatsApp"
          className="w-full h-full object-contain filter drop-shadow-md"
          width="48"
          height="48"
        />
        {/* Mobile online ping indicator */}
        <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
        </span>
      </a>
    </aside>
  );
};
