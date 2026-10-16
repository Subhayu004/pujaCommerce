import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface UpsellModalProps {
  onNavigate: (route: string) => void;
}

export const UpsellModal: React.FC<UpsellModalProps> = ({ onNavigate }) => {
  const { showUpsellModal, setShowUpsellModal, lastAddedPujaName } = useCart();

  if (!showUpsellModal) return null;

  const handleYes = () => {
    setShowUpsellModal(false);
    // STEP 5A: Customer selects YES -> Navigate to /puja-shop, puja stays in cart
    onNavigate('/puja-shop');
  };

  const handleNo = () => {
    setShowUpsellModal(false);
    // STEP 5B: Customer selects NO -> Navigate directly to /cart, puja already in cart
    onNavigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upsell-modal-title"
      >
        {/* Subtle decorative Vedic saffron corner banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#DC2626]" />

        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-center justify-center text-[#B45309]">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="text-xs uppercase tracking-widest text-[#B45309] font-medium mb-1">
          Puja Added to Cart
        </div>

        <h3 id="upsell-modal-title" className="text-xl sm:text-2xl font-bold font-heading text-[#292524] mb-3">
          Would you like to add puja essentials to your booking?
        </h3>

        <p className="text-sm text-[#57534E] mb-6 max-w-md mx-auto leading-relaxed">
          <span className="font-semibold text-[#78350F]">{lastAddedPujaName}</span> has been securely saved in your cart. You can complement your ceremony with pure A2 cow ghee, brass thalis, gangajal, and sacred samagri.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleYes}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Yes, Explore Puja Essentials</span>
          </button>

          <button
            onClick={handleNo}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-[#292524] text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>No, Continue to Cart</span>
            <ArrowRight className="w-4 h-4 text-[#78350F]" />
          </button>
        </div>
      </div>
    </div>
  );
};
