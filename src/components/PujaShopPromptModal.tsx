import React from 'react';
import { ShoppingBag, Calendar, X, Sparkles, Flame, CheckCircle } from 'lucide-react';
import { Puja } from '../types';

interface PujaShopPromptModalProps {
  puja: Puja | null;
  isOpen: boolean;
  onClose: () => void;
  onGoToShop: () => void;
  onContinueBooking: () => void;
}

export const PujaShopPromptModal: React.FC<PujaShopPromptModalProps> = ({
  puja,
  isOpen,
  onClose,
  onGoToShop,
  onContinueBooking,
}) => {
  if (!isOpen || !puja) return null;

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="puja-shop-prompt-title"
      >
        {/* Top saffron decorative gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#DC2626]" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#D1BA9C] text-[#78716C] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/40 flex items-center justify-center text-[#B45309] shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5 text-[#B45309]" />
          <span>Ritual Preparation · MandirVeda</span>
        </div>

        {/* Heading */}
        <h3 id="puja-shop-prompt-title" className="text-xl sm:text-2xl font-bold font-heading text-[#292524] mb-2">
          Would you like to buy anything from our Puja Shop?
        </h3>

        {/* Details & Context */}
        <p className="text-sm text-[#57534E] leading-relaxed mb-6 max-w-md mx-auto">
          You are booking <span className="font-semibold text-[#9A3412]">{puja.name}</span> ({formatPrice(puja.price_paise)}). Would you like to explore authentic puja items, pure A2 cow ghee, brass thalis, gangajal, or sacred dhoop from our temple store first?
        </p>

        {/* Quick Highlights */}
        <div className="bg-white/80 rounded-xl p-3 border border-[#E7DCCE] mb-6 text-xs text-[#78716C] flex items-center justify-around gap-2 text-left">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Pure Samagri</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Temple Blessed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Doorstep Delivery</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoToShop}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Yes, Visit Puja Shop</span>
          </button>

          <button
            onClick={onContinueBooking}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-[#292524] text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#78350F]" />
            <span>No, Continue to Book Puja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
