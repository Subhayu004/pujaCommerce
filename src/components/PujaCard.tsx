import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Puja } from '../types';
import { RudrabhishekArt, GrihaPraveshArt, SatyanarayanArt, LakshmiKuberArt } from './SpiritualArt';

interface PujaCardProps {
  puja: Puja;
  onBook: (puja: Puja) => void;
  onViewDetails: (slug: string) => void;
}

export const PujaCard: React.FC<PujaCardProps> = ({ puja, onBook, onViewDetails }) => {
  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN');
  };

  const renderArt = (img: string) => {
    if (!img) return <GrihaPraveshArt className="w-full h-full object-cover" />;

    if (
      img.startsWith('http://') ||
      img.startsWith('https://') ||
      img.startsWith('data:image/') ||
      img.startsWith('/uploads/') ||
      img.startsWith('/')
    ) {
      return (
        <img
          src={img}
          alt={puja.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    switch (img.toLowerCase()) {
      case 'rudra':
      case 'shiva':
        return <RudrabhishekArt className="w-full h-full object-cover" />;
      case 'griha':
      case 'vastu':
        return <GrihaPraveshArt className="w-full h-full object-cover" />;
      case 'satyanarayan':
      case 'vishnu':
        return <SatyanarayanArt className="w-full h-full object-cover" />;
      case 'lakshmi':
      case 'kuber':
        return <LakshmiKuberArt className="w-full h-full object-cover" />;
      case 'mahamrityunjaya':
        return <RudrabhishekArt className="w-full h-full object-cover" />;
      default:
        return <GrihaPraveshArt className="w-full h-full object-cover" />;
    }
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
      {/* Visual Slot */}
      <div 
        onClick={() => onViewDetails(puja.slug)}
        className="h-48 sm:h-52 w-full relative overflow-hidden cursor-pointer"
      >
        {renderArt(puja.image)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-[#FDE68A]">
            {puja.deity}
          </span>
          <span className="text-xs flex items-center gap-1 text-white/90">
            <Clock className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>~{puja.duration_mins} min</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <button
            onClick={() => onViewDetails(puja.slug)}
            className="text-left group-hover:text-[#9A3412] transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-bold font-heading text-[#292524] line-clamp-1">
              {puja.name}
            </h3>
          </button>
          <p className="text-xs text-[#57534E] line-clamp-2 mt-1.5 leading-relaxed">
            {puja.short_description}
          </p>
        </div>

        {/* Clean unboxed metadata with dot separators */}
        <div className="text-xs text-[#78716C] flex items-center gap-2">
          <span>Vedic Vidhi</span>
          <span aria-hidden="true">·</span>
          <span>Certified Acharya</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-700 font-medium">Samagri Included</span>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#E7DCCE] flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase text-[#78716C] tracking-wider block">Dakshina</span>
            <span className="text-base sm:text-lg font-bold text-[#9A3412] tabular-nums block truncate">
              {formatPrice(puja.price_paise)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onViewDetails(puja.slug)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-[#44403C] hover:bg-white border border-transparent hover:border-[#D1BA9C] transition-colors cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onBook(puja)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Puja</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
