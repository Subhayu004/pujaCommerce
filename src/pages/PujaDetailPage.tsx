import React from 'react';
import { Clock, Calendar, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Puja } from '../types';
import { RudrabhishekArt, GrihaPraveshArt, SatyanarayanArt, LakshmiKuberArt } from '../components/SpiritualArt';

interface PujaDetailPageProps {
  puja: Puja | null;
  onBookPuja: (puja: Puja) => void;
  onNavigate: (route: string) => void;
}

export const PujaDetailPage: React.FC<PujaDetailPageProps> = ({
  puja,
  onBookPuja,
  onNavigate,
}) => {
  if (!puja) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#292524]">Puja Not Found</h2>
        <button
          onClick={() => onNavigate('/book-puja')}
          className="mt-4 px-4 py-2 bg-[#9A3412] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Back to Puja Catalog
        </button>
      </div>
    );
  }

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN');
  };

  const renderArt = (img: string) => {
    if (!img) return <RudrabhishekArt className="w-full h-full object-cover" />;

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
          className="w-full h-full object-cover rounded-2xl"
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
      default:
        return <RudrabhishekArt className="w-full h-full object-cover" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/book-puja')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57534E] hover:text-[#9A3412] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Pujas</span>
      </button>

      {/* Grid: Details Left, Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Hero Art + In-depth Information) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden relative shadow-md border border-[#E7DCCE]">
            {renderArt(puja.image)}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FDE68A]">
                {puja.deity} Ritual
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading mt-1 text-white">
                {puja.name}
              </h1>
            </div>
          </div>

          {/* Shastric Description */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold font-heading text-[#292524]">
              About the Sacred Ritual
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              {puja.description}
            </p>
          </div>

          {/* Samagri Inclusions & Preparation */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold font-heading text-[#292524]">
              Required Materials & Samagri Provided
            </h2>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Our Vedic priests bring all necessary consecrated materials. You only need to provide clean altar space and fresh fruits.
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#D1BA9C] text-xs text-[#44403C] leading-relaxed">
              <span className="font-semibold text-[#9A3412] block mb-1">MandirVeda Samagri Inclusions:</span>
              {puja.required_materials}
            </div>
          </div>

          {/* Devotee Preparation & Booking Guidelines */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold font-heading text-[#292524]">
              Vidhi Guidelines & Preparation
            </h2>
            <div className="space-y-2.5 text-xs text-[#57534E]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <span>Perform morning snanam (holy bath) and wear traditional clean attire prior to priest arrival.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <span>Keep Sankalpa details ready: Name of Yajamana (seeker), Gotra, Nakshatra, and family names.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <span>Requirements: {puja.booking_requirements}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Sticky Purchase Module */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl p-6 shadow-md space-y-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#78716C] font-medium block">
                Total Dakshina (All-Inclusive)
              </span>
              <div className="text-3xl font-bold font-heading text-[#9A3412] mt-1 tabular-nums">
                {formatPrice(puja.price_paise)}
              </div>
              <span className="text-[11px] text-[#15803D] font-medium block mt-1">
                Zero hidden charges · GST & Pandit Dakshina Included
              </span>
            </div>

            <div className="space-y-3 py-4 border-y border-[#E7DCCE] text-xs text-[#44403C]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#57534E]">
                  <Clock className="w-4 h-4 text-[#9A3412]" />
                  <span>Estimated Duration</span>
                </span>
                <span className="font-semibold">{puja.duration_mins} Minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#57534E]">
                  <ShieldCheck className="w-4 h-4 text-[#9A3412]" />
                  <span>Vidhi Authenticity</span>
                </span>
                <span className="font-semibold">Rigveda & Yajurveda</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#57534E]">
                  <Calendar className="w-4 h-4 text-[#9A3412]" />
                  <span>Available Modes</span>
                </span>
                <span className="font-semibold">Home / Temple / Online</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => onBookPuja(puja)}
              className="w-full py-3.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Puja</span>
            </button>

            <p className="text-[11px] text-[#78716C] text-center leading-normal">
              Slot will be securely held in your cart upon date & time selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
