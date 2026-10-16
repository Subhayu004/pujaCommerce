import React from 'react';

interface ArtProps {
  className?: string;
  name?: string;
}

export const TempleSanctumArt: React.FC<ArtProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 800 450" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#451A03" />
        <stop offset="45%" stopColor="#78350F" />
        <stop offset="85%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <radialGradient id="sunAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
        <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="goldBrass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="templeStone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#78350F" />
        <stop offset="100%" stopColor="#292524" />
      </linearGradient>
    </defs>
    {/* Spiritual dawn background */}
    <rect width="800" height="450" fill="url(#skyGrad)" />
    <circle cx="400" cy="180" r="220" fill="url(#sunAura)" />

    {/* Distant temple skyline */}
    <path d="M 0 380 L 120 340 L 160 380 L 250 320 L 320 380 L 480 380 L 550 320 L 640 380 L 680 340 L 800 380 L 800 450 L 0 450 Z" fill="#292524" opacity="0.6" />

    {/* Central Shikhara Temple Tower */}
    <g transform="translate(400, 190)">
      {/* Sacred Kalash & Dhwaja (Temple Flag) atop Shikhara */}
      <line x1="0" y1="-140" x2="0" y2="-100" stroke="#FDE68A" strokeWidth="3" />
      <path d="M 0 -140 Q 25 -135 15 -125 Q 0 -130 0 -120 Z" fill="#EF4444" />
      {/* Golden Kalash */}
      <circle cx="0" cy="-95" r="9" fill="url(#goldBrass)" />
      <ellipse cx="0" cy="-88" rx="14" ry="7" fill="url(#goldBrass)" />

      {/* Main Shikhara tiered superstructure */}
      <path d="M 0 -85 Q -35 -40 -60 20 L 60 20 Q 35 -40 0 -85 Z" fill="url(#templeStone)" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Horizontal amalaka tiers */}
      <line x1="-20" y1="-50" x2="20" y2="-50" stroke="#FBBF24" strokeWidth="2" opacity="0.8" />
      <line x1="-35" y1="-20" x2="35" y2="-20" stroke="#FBBF24" strokeWidth="2" opacity="0.8" />
      <line x1="-50" y1="10" x2="50" y2="10" stroke="#FBBF24" strokeWidth="2" opacity="0.8" />

      {/* Mandapa Pillars & Sanctum Arch */}
      <path d="M -90 20 L -90 190 L 90 190 L 90 20 Z" fill="#1C1917" stroke="#78350F" strokeWidth="2" />
      <path d="M -70 190 L -70 80 Q 0 40 70 80 L 70 190 Z" fill="#292524" />
      {/* Sanctum Glow */}
      <ellipse cx="0" cy="140" rx="45" ry="55" fill="#F59E0B" opacity="0.4" />
      <circle cx="0" cy="130" r="14" fill="#FEF08A" opacity="0.9" />

      {/* Flanking Ornate Pillars */}
      <rect x="-85" y="40" width="12" height="150" fill="url(#goldBrass)" rx="2" />
      <rect x="73" y="40" width="12" height="150" fill="url(#goldBrass)" rx="2" />
    </g>

    {/* Sacred Brass Oil Lamps (Diyas) on Steps */}
    <g transform="translate(180, 360)">
      <ellipse cx="0" cy="20" rx="45" ry="12" fill="#78350F" />
      <path d="M -30 20 Q 0 35 30 20 Q 25 10 0 10 Q -25 10 -30 20 Z" fill="url(#goldBrass)" />
      <ellipse cx="0" cy="8" rx="8" ry="18" fill="#FDE68A" />
      <ellipse cx="0" cy="5" rx="4" ry="10" fill="#EF4444" opacity="0.8" />
    </g>
    <g transform="translate(620, 360)">
      <ellipse cx="0" cy="20" rx="45" ry="12" fill="#78350F" />
      <path d="M -30 20 Q 0 35 30 20 Q 25 10 0 10 Q -25 10 -30 20 Z" fill="url(#goldBrass)" />
      <ellipse cx="0" cy="8" rx="8" ry="18" fill="#FDE68A" />
      <ellipse cx="0" cy="5" rx="4" ry="10" fill="#EF4444" opacity="0.8" />
    </g>

    {/* Auspicious Marigold Garlands and Foreground Steps */}
    <path d="M 0 400 L 800 400 L 800 450 L 0 450 Z" fill="#1C1917" />
    <line x1="0" y1="400" x2="800" y2="400" stroke="#F59E0B" strokeWidth="2" opacity="0.5" />
    <line x1="0" y1="425" x2="800" y2="425" stroke="#F59E0B" strokeWidth="1" opacity="0.3" />
  </svg>
);

export const RudrabhishekArt: React.FC<ArtProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#2A1B18" />
    <radialGradient id="shivaAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
      <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.15" />
      <stop offset="100%" stopColor="#2A1B18" stopOpacity="0" />
    </radialGradient>
    <circle cx="200" cy="150" r="130" fill="url(#shivaAura)" />

    {/* Trishul in background */}
    <g transform="translate(200, 70)" stroke="#D97706" strokeWidth="3" opacity="0.6">
      <line x1="0" y1="-30" x2="0" y2="120" />
      <path d="M -22 -15 Q -22 15 0 20 Q 22 15 22 -15" fill="none" />
      <line x1="-22" y1="-25" x2="-22" y2="-15" />
      <line x1="22" y1="-25" x2="22" y2="-15" />
      {/* Damru */}
      <path d="M -12 25 L 12 40 L -12 40 L 12 25 Z" fill="#92400E" stroke="#FDE68A" strokeWidth="1" />
    </g>

    {/* Sacred Lingam Platform (Yoni Peetham) */}
    <g transform="translate(200, 195)">
      {/* Base Peetham */}
      <path d="M -75 25 Q 0 45 75 25 L 110 32 Q 0 65 -110 32 Z" fill="#1C1917" stroke="#92400E" strokeWidth="2" />
      <ellipse cx="0" cy="15" rx="75" ry="20" fill="#292524" stroke="#D97706" strokeWidth="1.5" />
      <path d="M 50 12 L 120 18 Q 110 28 40 22 Z" fill="#1C1917" />

      {/* Shiva Lingam Cylinder */}
      <path d="M -35 15 L -35 -50 Q -35 -95 0 -95 Q 35 -95 35 -50 L 35 15 Z" fill="#171717" stroke="#44403C" strokeWidth="1.5" />
      {/* Tripundra (Three Sacred Ash Lines) & Vermilion Bindu */}
      <g transform="translate(0, -50)">
        <path d="M -18 -8 Q 0 -5 18 -8" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <path d="M -20 -4 Q 0 -1 20 -4" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <path d="M -18 0 Q 0 3 18 0" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="-4" r="3" fill="#DC2626" />
      </g>

      {/* Sacred Bilva Leaves */}
      <g transform="translate(0, -90)">
        <path d="M 0 0 Q -12 -18 0 -24 Q 12 -18 0 0 Z" fill="#15803D" />
        <path d="M 0 0 Q -24 -10 -22 4 Q -10 6 0 0 Z" fill="#16A34A" />
        <path d="M 0 0 Q 24 -10 22 4 Q 10 6 0 0 Z" fill="#16A34A" />
      </g>

      {/* White Jasmine Garland */}
      <circle cx="-32" cy="-20" r="5" fill="#FEF3C7" />
      <circle cx="-25" cy="-5" r="5.5" fill="#FFFFFF" />
      <circle cx="-12" cy="6" r="6" fill="#FEF3C7" />
      <circle cx="12" cy="6" r="6" fill="#FEF3C7" />
      <circle cx="25" cy="-5" r="5.5" fill="#FFFFFF" />
      <circle cx="32" cy="-20" r="5" fill="#FEF3C7" />
    </g>

    {/* Hanging Copper Abhishek Patra (Pouring holy water stream) */}
    <g transform="translate(200, 35)">
      <ellipse cx="0" cy="15" rx="20" ry="8" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M -20 15 Q -10 38 0 42 Q 10 38 20 15 Z" fill="#92400E" stroke="#D97706" strokeWidth="1.5" />
      {/* Holy Stream */}
      <line x1="0" y1="42" x2="0" y2="105" stroke="#BAE6FD" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <circle cx="0" cy="105" r="5" fill="#7DD3FC" opacity="0.9" />
    </g>

    {/* Brass Diyas at base */}
    <g transform="translate(70, 240)">
      <ellipse cx="0" cy="10" rx="18" ry="6" fill="#B45309" />
      <ellipse cx="0" cy="3" rx="4" ry="9" fill="#FDE68A" />
      <circle cx="0" cy="1" r="2" fill="#EF4444" />
    </g>
    <g transform="translate(330, 240)">
      <ellipse cx="0" cy="10" rx="18" ry="6" fill="#B45309" />
      <ellipse cx="0" cy="3" rx="4" ry="9" fill="#FDE68A" />
      <circle cx="0" cy="1" r="2" fill="#EF4444" />
    </g>
  </svg>
);

export const GrihaPraveshArt: React.FC<ArtProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#2E1810" />
    <radialGradient id="fireGlow" cx="50%" cy="60%" r="50%">
      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
      <stop offset="40%" stopColor="#DC2626" stopOpacity="0.3" />
      <stop offset="100%" stopColor="#2E1810" stopOpacity="0" />
    </radialGradient>
    <circle cx="200" cy="160" r="140" fill="url(#fireGlow)" />

    {/* Decorated Auspicious Entrance Doorframe Arch in Background */}
    <path d="M 60 270 L 60 70 Q 200 20 340 70 L 340 270" stroke="#B45309" strokeWidth="2.5" fill="none" opacity="0.4" />
    {/* Mango Leaf Toran */}
    <g stroke="#15803D" strokeWidth="2" opacity="0.8">
      <path d="M 70 85 Q 120 105 170 85 Q 220 105 270 85 Q 310 100 330 85" fill="none" stroke="#D97706" />
      <path d="M 100 93 L 100 115" stroke="#16A34A" strokeWidth="3" />
      <path d="M 140 95 L 140 118" stroke="#16A34A" strokeWidth="3" />
      <path d="M 190 94 L 190 120" stroke="#16A34A" strokeWidth="3" />
      <path d="M 240 95 L 240 118" stroke="#16A34A" strokeWidth="3" />
      <path d="M 285 93 L 285 115" stroke="#16A34A" strokeWidth="3" />
    </g>

    {/* Holy Havan Kund */}
    <g transform="translate(200, 200)">
      {/* Step 1 base */}
      <path d="M -110 35 L 110 35 L 85 50 L -85 50 Z" fill="#78350F" stroke="#D97706" strokeWidth="1" />
      {/* Step 2 */}
      <path d="M -90 20 L 90 20 L 110 35 L -110 35 Z" fill="#92400E" stroke="#F59E0B" strokeWidth="1" />
      {/* Kund Inner cavity */}
      <path d="M -70 5 L 70 5 L 90 20 L -90 20 Z" fill="#B45309" />
      <ellipse cx="0" cy="6" rx="65" ry="12" fill="#1C1917" stroke="#78350F" strokeWidth="1" />

      {/* Sacred Samidha Wood Sticks */}
      <line x1="-35" y1="2" x2="35" y2="-6" stroke="#451A03" strokeWidth="8" strokeLinecap="round" />
      <line x1="30" y1="2" x2="-30" y2="-6" stroke="#5F270B" strokeWidth="8" strokeLinecap="round" />

      {/* Sacred Agni (Flames of Havan) */}
      <path d="M -25 -2 Q -40 -35 0 -85 Q 40 -35 25 -2 Q 0 -25 -25 -2 Z" fill="#F59E0B" opacity="0.95" />
      <path d="M -15 -2 Q -25 -28 0 -65 Q 25 -28 15 -2 Q 0 -20 -15 -2 Z" fill="#EF4444" opacity="0.85" />
      <path d="M -8 -2 Q 0 -45 0 -50 Q 8 -25 8 -2 Z" fill="#FEF08A" opacity="0.9" />
    </g>

    {/* Sacred Copper Kalash with Coconut and Mango Leaves */}
    <g transform="translate(320, 180)">
      <ellipse cx="0" cy="30" rx="26" ry="10" fill="#78350F" />
      <path d="M -22 25 Q -32 -5 -15 -18 L 15 -18 Q 32 -5 22 25 Z" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Mango leaves */}
      <path d="M -15 -18 Q -30 -35 -20 -45 Q -8 -30 0 -18" fill="#15803D" />
      <path d="M 15 -18 Q 30 -35 20 -45 Q 8 -30 0 -18" fill="#15803D" />
      <path d="M 0 -18 Q 0 -48 0 -52 Q 10 -35 0 -18" fill="#16A34A" />
      {/* Sriphala (Coconut) */}
      <ellipse cx="0" cy="-30" rx="12" ry="16" fill="#78350F" stroke="#B45309" strokeWidth="1" />
    </g>

    {/* Auspicious Brass Offering Thali */}
    <g transform="translate(80, 200)">
      <ellipse cx="0" cy="15" rx="36" ry="12" fill="#B45309" stroke="#FDE68A" strokeWidth="1.5" />
      {/* Kumkum & Haldi bowls */}
      <circle cx="-12" cy="14" r="7" fill="#DC2626" />
      <circle cx="12" cy="14" r="7" fill="#F59E0B" />
      <circle cx="0" cy="12" r="5" fill="#FEF08A" />
    </g>
  </svg>
);

export const SatyanarayanArt: React.FC<ArtProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#201C16" />
    <radialGradient id="vishnuAura" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.5" />
      <stop offset="60%" stopColor="#D97706" stopOpacity="0.2" />
      <stop offset="100%" stopColor="#201C16" stopOpacity="0" />
    </radialGradient>
    <circle cx="200" cy="140" r="130" fill="url(#vishnuAura)" />

    {/* Sacred Shankha & Chakra Emblems */}
    <g transform="translate(130, 80)" stroke="#FDE68A" strokeWidth="1.5" opacity="0.8">
      {/* Sudarshana Chakra */}
      <circle cx="0" cy="0" r="22" stroke="#F59E0B" strokeWidth="2" fill="none" />
      <circle cx="0" cy="0" r="8" fill="#D97706" />
      <line x1="-22" y1="0" x2="22" y2="0" stroke="#FDE68A" />
      <line x1="0" y1="-22" x2="0" y2="22" stroke="#FDE68A" />
      <line x1="-15" y1="-15" x2="15" y2="15" stroke="#FDE68A" />
      <line x1="-15" y1="15" x2="15" y2="-15" stroke="#FDE68A" />
    </g>
    <g transform="translate(270, 80)" fill="#F8FAFC" opacity="0.85">
      {/* Panchajanya Shankha */}
      <path d="M 0 -15 Q 18 -15 22 5 Q 22 25 0 25 Q -15 25 -18 5 Q -18 -15 0 -15 Z" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      <path d="M 0 25 Q -5 32 0 38 Q 8 32 0 25 Z" fill="#E2E8F0" />
    </g>

    {/* Sacred Altar Chowki with Yellow Silk Pitambari */}
    <g transform="translate(200, 190)">
      <rect x="-110" y="0" width="220" height="20" rx="3" fill="#B45309" stroke="#F59E0B" strokeWidth="1" />
      <path d="M -115 15 L 115 15 L 125 60 L -125 60 Z" fill="#D97706" />
      <line x1="-125" y1="50" x2="125" y2="50" stroke="#FDE68A" strokeWidth="3" />

      {/* Shri Satyanarayan Holy Pothi (Sacred Scripture Book) */}
      <g transform="translate(0, -10)">
        <rect x="-45" y="-12" width="90" height="24" rx="2" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.5" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="#FEF08A" strokeWidth="2" />
        <circle cx="0" cy="0" r="4" fill="#FEF08A" />
      </g>

      {/* Tulsi Leaves Offering */}
      <path d="M -15 -25 Q -25 -35 -20 -40 Q -10 -35 -15 -25" fill="#15803D" />
      <path d="M 15 -25 Q 25 -35 20 -40 Q 10 -35 15 -25" fill="#15803D" />
      <path d="M 0 -30 Q 0 -45 5 -48 Q 10 -35 0 -30" fill="#16A34A" />

      {/* Brass Panchamrit & Sheera Prasad Katori */}
      <ellipse cx="-75" cy="5" rx="20" ry="7" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
      <ellipse cx="75" cy="5" rx="20" ry="7" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
      {/* Sheera prasad mound */}
      <ellipse cx="75" cy="2" rx="14" ry="5" fill="#F59E0B" />
    </g>

    {/* Twin Banana Stems Framing */}
    <path d="M 40 270 Q 30 150 45 60 Q 75 75 70 120" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M 360 270 Q 370 150 355 60 Q 325 75 330 120" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);

export const LakshmiKuberArt: React.FC<ArtProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#261014" />
    <radialGradient id="lakshmiGold" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
      <stop offset="50%" stopColor="#DC2626" stopOpacity="0.25" />
      <stop offset="100%" stopColor="#261014" stopOpacity="0" />
    </radialGradient>
    <circle cx="200" cy="150" r="140" fill="url(#lakshmiGold)" />

    {/* Auspicious Sri Yantra Geometry outline */}
    <g transform="translate(200, 110)" stroke="#FDE68A" strokeWidth="1" opacity="0.3" fill="none">
      <polygon points="0,-45 40,25 -40,25" />
      <polygon points="0,45 40,-25 -40,-25" />
      <polygon points="0,-35 32,18 -32,18" />
      <polygon points="0,35 32,-18 -32,-18" />
      <circle cx="0" cy="0" r="50" />
    </g>

    {/* Divine Blooming Pink Lotus Throne */}
    <g transform="translate(200, 190)">
      {/* Outer Lotus Petals */}
      <path d="M 0 10 Q -60 0 -90 -25 Q -65 -45 0 0 Q 65 -45 90 -25 Q 60 0 0 10" fill="#E11D48" opacity="0.8" />
      <path d="M 0 10 Q -45 -10 -65 -40 Q -40 -60 0 -10 Q 40 -60 65 -40 Q 45 -10 0 10" fill="#F43F5E" opacity="0.9" />
      {/* Center Petals */}
      <path d="M 0 10 Q -25 -20 -35 -65 Q 0 -80 0 -10 Q 0 -80 35 -65 Q 25 -20 0 10" fill="#FB7185" />
      {/* Golden Lotus Core */}
      <ellipse cx="0" cy="-5" rx="25" ry="8" fill="#FDE68A" />

      {/* Shower of Golden Coins (Dhan Varsha) */}
      <circle cx="-35" cy="-85" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      <circle cx="-15" cy="-105" r="8" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
      <circle cx="20" cy="-90" r="7.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      <circle cx="45" cy="-70" r="6.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
      <circle cx="-5" cy="-70" r="9" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="0" cy="-50" r="10" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
    </g>

    {/* Kuber Pot of Gold (Kalash of Jewels) */}
    <g transform="translate(320, 205)">
      <ellipse cx="0" cy="20" rx="28" ry="10" fill="#78350F" />
      <path d="M -24 16 Q -30 -10 -15 -20 L 15 -20 Q 30 -10 24 16 Z" fill="#D97706" stroke="#FDE68A" strokeWidth="1.5" />
      <ellipse cx="0" cy="-20" rx="15" ry="5" fill="#FDE68A" />
      <circle cx="-6" cy="-24" r="5" fill="#FBBF24" />
      <circle cx="6" cy="-25" r="6" fill="#FDE68A" />
      <circle cx="0" cy="-30" r="5" fill="#FBBF24" />
    </g>

    {/* Radiant Deepam */}
    <g transform="translate(80, 215)">
      <ellipse cx="0" cy="12" rx="24" ry="8" fill="#B45309" stroke="#FDE68A" strokeWidth="1" />
      <ellipse cx="0" cy="4" rx="5" ry="12" fill="#FDE68A" />
      <circle cx="0" cy="1" r="2.5" fill="#EF4444" />
    </g>
  </svg>
);

export const ProductArt: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-full h-full' }) => {
  if (
    type &&
    (type.startsWith('http://') ||
      type.startsWith('https://') ||
      type.startsWith('data:') ||
      type.startsWith('/uploads/') ||
      type.startsWith('/'))
  ) {
    return (
      <img
        src={type}
        alt=""
        className={`${className} object-cover rounded-lg`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  switch (type) {
    case 'thali':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          <ellipse cx="150" cy="130" rx="120" ry="60" fill="#D97706" stroke="#B45309" strokeWidth="2" />
          <ellipse cx="150" cy="128" rx="112" ry="54" fill="#FBBF24" />
          <ellipse cx="150" cy="126" rx="95" ry="44" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
          {/* Engraving circles */}
          <ellipse cx="150" cy="126" rx="70" ry="32" stroke="#B45309" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          {/* Center Diya on Thali */}
          <ellipse cx="150" cy="122" rx="18" ry="7" fill="#B45309" />
          <ellipse cx="150" cy="115" rx="4" ry="10" fill="#F59E0B" />
          <circle cx="150" cy="113" r="2" fill="#DC2626" />
          {/* Kumkum & Chandan bowls */}
          <ellipse cx="100" cy="128" rx="12" ry="6" fill="#DC2626" stroke="#B45309" strokeWidth="1" />
          <ellipse cx="200" cy="128" rx="12" ry="6" fill="#D97706" stroke="#B45309" strokeWidth="1" />
          {/* Ghanti (Bell) */}
          <path d="M 140 148 L 160 148 L 153 135 L 147 135 Z" fill="#92400E" />
          <line x1="150" y1="135" x2="150" y2="128" stroke="#92400E" strokeWidth="2" />
        </svg>
      );
    case 'diya':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Glass Enclosure Cylinder */}
          <rect x="110" y="60" width="80" height="100" rx="10" fill="#E2E8F0" opacity="0.4" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Heavy Brass Base */}
          <path d="M 90 190 L 210 190 L 190 160 L 110 160 Z" fill="#D97706" stroke="#B45309" strokeWidth="2" />
          <ellipse cx="150" cy="160" rx="40" ry="12" fill="#FBBF24" />
          {/* Akhand Flame */}
          <ellipse cx="150" cy="115" rx="10" ry="24" fill="#FDE68A" />
          <ellipse cx="150" cy="118" rx="5" ry="14" fill="#EF4444" opacity="0.8" />
          {/* Brass Top Crown */}
          <path d="M 120 60 L 180 60 L 165 40 L 135 40 Z" fill="#D97706" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="150" cy="35" r="6" fill="#FBBF24" />
        </svg>
      );
    case 'ghee':
    case 'ghee_wicks':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Box container */}
          <rect x="70" y="50" width="160" height="140" rx="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <rect x="80" y="60" width="140" height="120" rx="6" fill="#FFFBEB" />
          {/* Ghee batti rows */}
          <circle cx="110" cy="95" r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="110" y1="90" x2="110" y2="75" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

          <circle cx="150" cy="95" r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="150" y1="90" x2="150" y2="75" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

          <circle cx="190" cy="95" r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="190" y1="90" x2="190" y2="75" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

          <circle cx="130" cy="140" r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="130" y1="135" x2="130" y2="120" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

          <circle cx="170" cy="140" r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="170" y1="135" x2="170" y2="120" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'gangajal':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Copper Lota / Kalash vessel */}
          <ellipse cx="150" cy="180" rx="55" ry="18" fill="#78350F" />
          <path d="M 105 170 Q 75 110 115 85 L 185 85 Q 225 110 195 170 Z" fill="#B45309" stroke="#92400E" strokeWidth="2" />
          <path d="M 115 85 L 105 60 L 195 60 L 185 85 Z" fill="#D97706" />
          <ellipse cx="150" cy="60" rx="45" ry="12" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          {/* Sacred Ganga wave motif on belly */}
          <path d="M 115 130 Q 135 140 150 130 Q 165 120 185 130" stroke="#FEF08A" strokeWidth="2.5" fill="none" />
          <text x="150" y="115" textAnchor="middle" fill="#FEF08A" fontSize="16" fontWeight="bold">ॐ</text>
        </svg>
      );
    case 'dhoop':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Raw wood / stone base */}
          <rect x="80" y="160" width="140" height="25" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
          {/* 3 Dhoop Cones */}
          <polygon points="110,160 120,95 130,160" fill="#451A03" stroke="#292524" strokeWidth="1" />
          <polygon points="140,160 150,85 160,160" fill="#5F270B" stroke="#292524" strokeWidth="1" />
          <polygon points="170,160 180,100 190,160" fill="#451A03" stroke="#292524" strokeWidth="1" />
          {/* Glowing ember tips */}
          <circle cx="150" cy="85" r="2.5" fill="#EF4444" />
          <circle cx="120" cy="95" r="2" fill="#EF4444" />
          <circle cx="180" cy="100" r="2" fill="#EF4444" />
          {/* Aromatic smoke curls */}
          <path d="M 150 82 Q 135 60 160 45 Q 175 30 155 20" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      );
    case 'chandan':
    case 'tika':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Kumkum vessel */}
          <circle cx="110" cy="120" r="35" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
          <circle cx="110" cy="120" r="26" fill="#B91C1C" />
          {/* Sandalwood vessel */}
          <circle cx="190" cy="120" r="35" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          <circle cx="190" cy="120" r="26" fill="#D97706" />
          {/* Traditional peacock brass handle connector */}
          <path d="M 110 85 Q 150 60 190 85" stroke="#B45309" strokeWidth="4" fill="none" />
          <circle cx="150" cy="65" r="6" fill="#FBBF24" />
        </svg>
      );
    case 'vastra':
    case 'dhoti':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Folded Silk Vastra */}
          <rect x="75" y="70" width="150" height="100" rx="4" fill="#D97706" stroke="#B45309" strokeWidth="1.5" />
          <rect x="85" y="80" width="130" height="80" rx="2" fill="#F59E0B" />
          {/* Rich golden zari border */}
          <rect x="85" y="140" width="130" height="20" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
          <line x1="85" y1="145" x2="215" y2="145" stroke="#B45309" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="85" y1="155" x2="215" y2="155" stroke="#B45309" strokeWidth="1" strokeDasharray="3 2" />
          {/* Angavastram diagonal drape */}
          <path d="M 60 120 L 140 185 L 170 170 L 90 105 Z" fill="#DC2626" opacity="0.9" />
          <line x1="140" y1="185" x2="170" y2="170" stroke="#FDE68A" strokeWidth="3" />
        </svg>
      );
    case 'camphor':
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Pure brass camphor burner bowl */}
          <ellipse cx="150" cy="165" rx="75" ry="30" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          <ellipse cx="150" cy="160" rx="65" ry="24" fill="#D97706" />
          <ellipse cx="150" cy="155" rx="55" ry="18" fill="#FBBF24" />
          {/* White crystalline camphor tablets */}
          <rect x="125" y="130" width="22" height="22" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" transform="rotate(15 136 141)" />
          <rect x="150" y="128" width="22" height="22" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" transform="rotate(-10 161 139)" />
          {/* Divine clear blue/golden flame */}
          <path d="M 148 120 Q 140 85 150 65 Q 160 85 152 120 Z" fill="#38BDF8" opacity="0.8" />
          <path d="M 149 110 Q 145 90 150 75 Q 155 90 151 110 Z" fill="#FEF08A" />
        </svg>
      );
    case 'havan':
    case 'havan_kit':
    default:
      return (
        <svg viewBox="0 0 300 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="240" fill="#F5EFE6" />
          {/* Havan samagri box */}
          <rect x="75" y="65" width="150" height="110" rx="6" fill="#78350F" stroke="#451A03" strokeWidth="2" />
          <rect x="85" y="75" width="130" height="90" rx="4" fill="#92400E" />
          <ellipse cx="150" cy="120" rx="45" ry="25" fill="#451A03" />
          <circle cx="130" cy="115" r="8" fill="#FDE68A" />
          <circle cx="165" cy="118" r="9" fill="#15803D" />
          <circle cx="145" cy="125" r="7" fill="#DC2626" />
          <text x="150" y="100" textAnchor="middle" fill="#FEF08A" fontSize="12" fontWeight="bold">हवन सामग्री</text>
        </svg>
      );
  }
};

export const PujariAvatar: React.FC<{ code?: string; className?: string }> = ({ code, className = 'w-16 h-16' }) => {
  const isImage = code && (
    code.startsWith('http://') ||
    code.startsWith('https://') ||
    code.startsWith('data:image/') ||
    code.startsWith('/uploads/') ||
    code.startsWith('/')
  );

  return (
    <div className={`relative rounded-full overflow-hidden bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] border-2 border-[#D97706]/40 flex items-center justify-center shrink-0 shadow-sm ${className}`}>
      {isImage ? (
        <img
          src={code}
          alt="Acharya"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Saffron Angavastram on shoulders */}
          <path d="M 15 95 Q 50 70 85 95 L 85 100 L 15 100 Z" fill="#D97706" />
          <path d="M 30 80 Q 50 92 70 80 L 75 100 L 25 100 Z" fill="#B45309" />
          {/* Neck & Face */}
          <circle cx="50" cy="48" r="26" fill="#FBBF24" />
          <ellipse cx="50" cy="52" rx="22" ry="24" fill="#FDE68A" />
          {/* Shaven head with Sikha (traditional Vedic lock) */}
          <path d="M 47 16 Q 50 8 53 16 Q 50 14 47 16 Z" fill="#292524" />
          {/* Tilak (Urdhva Pundra or Tripundra) */}
          <path d="M 46 34 L 46 48 L 54 48 L 54 34 Z" fill="#DC2626" />
          <line x1="50" y1="32" x2="50" y2="52" stroke="#FEF08A" strokeWidth="2" />
          {/* Gentle smiling features */}
          <circle cx="41" cy="46" r="2.5" fill="#451A03" />
          <circle cx="59" cy="46" r="2.5" fill="#451A03" />
          <path d="M 44 58 Q 50 63 56 58" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          {/* Sacred Rudraksha Mala */}
          <ellipse cx="50" cy="74" rx="16" ry="6" fill="none" stroke="#78350F" strokeWidth="3" strokeDasharray="4 3" />
        </svg>
      )}
    </div>
  );
};
