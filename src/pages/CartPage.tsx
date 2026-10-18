import React from 'react';
import { Trash2, Calendar, Clock, MapPin, User, ArrowRight, ShoppingBag, ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductArt, RudrabhishekArt, GrihaPraveshArt, SatyanarayanArt, LakshmiKuberArt } from '../components/SpiritualArt';

interface CartPageProps {
  onNavigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const { user, openAuthModal } = useAuth();

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderThumbnail = (item: any) => {
    if (item.item_type === 'puja') {
      if (
        item.image &&
        (item.image.startsWith('http://') ||
          item.image.startsWith('https://') ||
          item.image.startsWith('data:') ||
          item.image.startsWith('/uploads/') ||
          item.image.startsWith('/'))
      ) {
        return <img src={item.image} alt={item.name} className="w-full h-full object-cover" />;
      }
      switch (item.image) {
        case 'rudra':
          return <RudrabhishekArt className="w-full h-full object-cover" />;
        case 'griha':
          return <GrihaPraveshArt className="w-full h-full object-cover" />;
        case 'satyanarayan':
          return <SatyanarayanArt className="w-full h-full object-cover" />;
        case 'lakshmi':
          return <LakshmiKuberArt className="w-full h-full object-cover" />;
        default:
          return <RudrabhishekArt className="w-full h-full object-cover" />;
      }
    } else {
      return <ProductArt type={item.image} className="w-full h-full object-contain p-2" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[#78716C]">
        <div className="w-8 h-8 mx-auto border-2 border-[#9A3412] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading your sacred cart...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FEF3C7] border border-[#D1BA9C] flex items-center justify-center text-[#9A3412]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#292524]">
            Your Sacred Cart is Empty
          </h1>
          <p className="text-sm text-[#57534E] max-w-md mx-auto">
            You haven't scheduled any Vedic pujas or added puja samagri yet. Begin by selecting an auspicious ceremony.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/book-puja')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Explore Sacred Pujas
          </button>
          <button
            onClick={() => onNavigate('/puja-shop')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-[#292524] text-xs font-semibold transition-colors cursor-pointer"
          >
            Shop Puja Samagri Essentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
          Review Seva & Samagri
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#292524] mt-1">
          Your Sacred Cart ({cart.item_count} items)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              {/* Thumbnail & Title */}
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#D1BA9C] shrink-0 relative">
                  {renderThumbnail(item)}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#9A3412] border border-[#F59E0B]/30">
                      {item.item_type === 'puja' ? 'Vedic Puja Booking' : 'Puja Samagri'}
                    </span>
                    {!item.in_stock && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                        Exceeds Stock
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-heading text-[#292524]">
                    {item.name}
                  </h3>

                  {/* Puja specific booking metadata */}
                  {item.item_type === 'puja' && (
                    <div className="text-xs text-[#57534E] space-y-1 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                        <span>Date: <strong className="text-[#292524]">{item.scheduled_date}</strong></span>
                        <span aria-hidden="true">·</span>
                        <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                        <span>{item.scheduled_time}</span>
                      </div>
                      {item.pujari_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#B45309]" />
                          <span>Acharya: {item.pujari_name}</span>
                        </div>
                      )}
                      {item.service_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
                          <span className="truncate max-w-sm">{item.service_location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {item.item_type === 'product' && (
                    <div className="text-xs font-semibold text-[#9A3412] pt-1">
                      {formatPrice(item.price_paise)} each
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Stepper (for Samagri only) & Removal */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E7DCCE]">
                <div className="text-right">
                  <span className="text-base font-bold text-[#292524] tabular-nums block">
                    {formatPrice(item.item_total_paise)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {item.item_type === 'product' && (
                    <div className="flex items-center border border-[#D1BA9C] rounded-xl bg-white overflow-hidden text-xs shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="px-3 py-1.5 text-sm font-bold text-[#57534E] hover:bg-[#F5EFEB] active:bg-[#E7DCCE] transition-colors cursor-pointer select-none"
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="px-3.5 py-1.5 font-bold tabular-nums text-[#292524] min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-sm font-bold text-[#57534E] hover:bg-[#F5EFEB] active:bg-[#E7DCCE] transition-colors cursor-pointer select-none"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-xl text-[#78716C] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add more items suggestion */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#57534E]">
            <button
              onClick={() => onNavigate('/book-puja')}
              className="text-[#9A3412] hover:underline font-semibold cursor-pointer"
            >
              + Add another Vedic Puja
            </button>
            <button
              onClick={() => onNavigate('/puja-shop')}
              className="text-[#9A3412] hover:underline font-semibold cursor-pointer"
            >
              + Add more Puja Essentials
            </button>
          </div>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl p-6 shadow-md space-y-5">
            <h2 className="text-lg font-bold font-heading text-[#292524]">
              Payment Summary
            </h2>

            <div className="space-y-3 text-xs text-[#57534E] py-2 border-y border-[#E7DCCE]">
              <div className="flex items-center justify-between">
                <span>Ritual & Samagri Subtotal</span>
                <span className="font-semibold text-[#292524] tabular-nums">
                  {formatPrice(cart.subtotal_paise)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>GST & Shastric Cess (5%)</span>
                <span className="font-semibold text-[#292524] tabular-nums">
                  {formatPrice(cart.tax_paise)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Dakshina & Shipping</span>
                <span className="font-semibold tabular-nums text-emerald-700">
                  {cart.delivery_paise === 0 ? 'FREE' : formatPrice(cart.delivery_paise)}
                </span>
              </div>

              {cart.discount_paise > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Festival Seva Discount</span>
                  <span className="font-semibold tabular-nums">- {formatPrice(cart.discount_paise)}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-xs font-semibold uppercase text-[#78716C] block">Total Payable</span>
                <span className="text-[11px] text-[#78716C]">INR Exact Paise Calculation</span>
              </div>
              <span className="text-2xl font-bold font-heading text-[#9A3412] tabular-nums">
                {formatPrice(cart.total_paise)}
              </span>
            </div>

            {!user && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Sign in required to confirm your booking</span>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('Please sign in or create an account to proceed to checkout.')}
                  className="underline font-semibold text-[#9A3412] shrink-0 hover:text-[#7C2D12] cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('Please sign in or create an account to proceed to checkout.', () => onNavigate('/checkout'));
                  return;
                }
                onNavigate('/checkout');
              }}
              className="w-full py-3.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{user ? 'Proceed to Checkout' : 'Sign In to Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 rounded-xl bg-white border border-[#D1BA9C] flex items-center gap-2.5 text-[11px] text-[#78716C]">
              <ShieldCheck className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>Razorpay Verified Gateway · Instant PDF Receipt generated after payment.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
