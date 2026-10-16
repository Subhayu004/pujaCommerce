import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Loader2, Plus, Minus, Sparkles } from 'lucide-react';
import { Puja, Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductArt } from './SpiritualArt';

interface BookingModalProps {
  puja: Puja | null;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

const TIME_SLOTS = [
  { id: '07:00 AM - 09:00 AM', label: '07:00 AM - 09:00 AM (Brahma Muhurta)' },
  { id: '09:30 AM - 11:30 AM', label: '09:30 AM - 11:30 AM (Morning Sandhya)' },
  { id: '04:00 PM - 06:00 PM', label: '04:00 PM - 06:00 PM (Pradosha Kala)' },
  { id: '06:30 PM - 08:30 PM', label: '06:30 PM - 08:30 PM (Evening Sandhya)' },
];

export const BookingModal: React.FC<BookingModalProps> = ({ puja, onClose, onNavigate }) => {
  const { addPujaToCart } = useCart();

  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(minDateStr);
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[1].id);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('');

  // Available essentials & quantity selection
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedEssentials, setSelectedEssentials] = useState<Record<string, number>>({});

  useEffect(() => {
    if (puja) {
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            setAvailableProducts(data.products.filter((p: Product) => p.is_active));
          }
        })
        .catch((err) => console.error('Failed to fetch puja essentials:', err));
    }
  }, [puja]);

  // Check availability when date or slot changes
  useEffect(() => {
    if (date && timeSlot) {
      fetch('/api/pujas/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time_slot: timeSlot }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.available) {
            setAvailabilityStatus('Reserved by another devotee. Please select a different slot.');
          } else {
            setAvailabilityStatus('Auspicious slot available');
          }
        })
        .catch(() => {});
    }
  }, [date, timeSlot]);

  if (!puja) return null;

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelectedEssentials((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  // Calculate dynamic totals
  const samagriTotalPaise = Object.entries(selectedEssentials).reduce((acc, [prodId, qty]) => {
    const prod = availableProducts.find((p) => p.id === prodId);
    return acc + (prod ? prod.price_paise * qty : 0);
  }, 0);

  const totalPaise = puja.price_paise + samagriTotalPaise;
  const totalSamagriItems = Object.values(selectedEssentials).reduce((a, b) => a + b, 0);

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const essentialsPayload = Object.entries(selectedEssentials)
      .filter(([_, qty]) => qty > 0)
      .map(([product_id, quantity]) => ({ product_id, quantity }));

    const result = await addPujaToCart({
      puja_id: puja.id,
      date,
      time_slot: timeSlot,
      service_location: 'Address specified at checkout',
      additional_notes: notes,
      essentials: essentialsPayload,
    });

    setIsSubmitting(false);

    if (result.success) {
      onClose();
      // If devotee selected essentials, navigate directly to cart to review booking & essentials
      if (essentialsPayload.length > 0 && onNavigate) {
        onNavigate('/cart');
      }
    } else {
      setErrorMessage(result.error || 'Failed to reserve booking. Please check requirements.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-4 sm:p-7 relative my-2 sm:my-6 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#D1BA9C] text-[#57534E] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#E7DCCE] pb-4 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B45309]">
            {puja.deity} Ritual Booking
          </span>
          <h2 className="text-2xl font-bold font-heading text-[#292524] mt-1">
            Book {puja.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C] mt-2">
            <span>Duration: ~{puja.duration_mins} mins</span>
            <span>·</span>
            <span className="text-base font-bold text-[#9A3412]">{formatPrice(puja.price_paise)}</span>
            <span>·</span>
            <span className="text-[#15803D] font-medium">All Vedic Ritual Samagri Included</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">Unable to reserve slot</p>
              <p className="text-xs mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                Select Auspicious Date *
              </label>
              <input
                type="date"
                min={minDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#B45309]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                Select Time Slot (Muhurta) *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#B45309]/30"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability live notice */}
          {availabilityStatus && (
            <div className={`text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 ${availabilityStatus.includes('Reserved') ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              <div className={`w-2 h-2 rounded-full ${availabilityStatus.includes('Reserved') ? 'bg-amber-600' : 'bg-emerald-600'}`} />
              <span>{availabilityStatus}</span>
            </div>
          )}

          {/* Sankalpa / Devotee Details */}
          <div>
            <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
              Sankalpa & Devotee Family Details (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Primary Seeker: Arjun Sharma, Gotra: Kashyapa, Nakshatra: Rohini, Purpose: Family peace and prosperity."
              className="w-full px-3.5 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 resize-none"
            />
          </div>

          {/* SECTION: ADD PUJA ESSENTIALS (SAMAGRI) WITH WORKING + - BUTTONS */}
          <div className="pt-2 border-t border-[#E7DCCE] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#292524] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B45309]" />
                  <span>Add Puja Essentials & Samagri (Optional)</span>
                </h3>
                <p className="text-[11px] text-[#57534E]">
                  Use the + and − buttons beside each item to add pure temple essentials.
                </p>
              </div>
              {totalSamagriItems > 0 && (
                <span className="text-xs font-bold text-[#9A3412] bg-[#FEF3C7] px-2.5 py-1 rounded-lg border border-[#F59E0B]/30">
                  {totalSamagriItems} added (+{formatPrice(samagriTotalPaise)})
                </span>
              )}
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {availableProducts.map((prod) => {
                const count = selectedEssentials[prod.id] || 0;
                return (
                  <div
                    key={prod.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      count > 0
                        ? 'bg-amber-50/70 border-[#D97706]'
                        : 'bg-white border-[#E7DCCE] hover:border-[#D1BA9C]'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-[#E7DCCE] shrink-0 p-1 flex items-center justify-center overflow-hidden">
                        <ProductArt type={prod.image} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#292524] truncate">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                          <span className="font-semibold text-[#9A3412]">{formatPrice(prod.price_paise)}</span>
                          <span>·</span>
                          <span className="truncate">{prod.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* + - Stepper beside samagri */}
                    <div className="flex items-center border border-[#D1BA9C] rounded-lg bg-white overflow-hidden shadow-2xs shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(prod.id, -1)}
                        disabled={count <= 0}
                        className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#57534E] hover:bg-[#F5EFEB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold tabular-nums text-[#292524] select-none">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(prod.id, 1)}
                        disabled={prod.stock <= count}
                        className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#57534E] hover:bg-[#F5EFEB] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Price Summary Bar */}
          <div className="p-4 rounded-xl bg-white border border-[#D1BA9C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 text-[#57534E] w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span>Puja Ritual Dakshina:</span>
                <span className="font-semibold text-[#292524]">{formatPrice(puja.price_paise)}</span>
              </div>
              {samagriTotalPaise > 0 && (
                <div className="flex items-center justify-between sm:justify-start gap-4 text-[#9A3412]">
                  <span>Puja Essentials ({totalSamagriItems} items):</span>
                  <span className="font-semibold">+{formatPrice(samagriTotalPaise)}</span>
                </div>
              )}
            </div>

            <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E7DCCE]">
              <span className="text-[10px] uppercase font-bold text-[#78716C] block">Total to Add to Cart</span>
              <span className="text-xl font-bold font-heading text-[#9A3412] tabular-nums block">
                {formatPrice(totalPaise)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-[#E7DCCE]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white hover:bg-[#F5EFEB] text-[#44403C] text-sm font-medium transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availabilityStatus.includes('Reserved')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating & Adding to Cart...</span>
                </>
              ) : (
                <span>Confirm & Add to Cart ({formatPrice(totalPaise)})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
