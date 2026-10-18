import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertCircle, Loader2, ArrowLeft, CheckCircle2, CreditCard, Smartphone } from 'lucide-react';
import { useCart, getCartToken, saveCartToken } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, refreshCart, isLoading } = useCart();
  const { user, openAuthModal } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState(user?.address_line || '');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [pincode, setPincode] = useState(user?.pincode || '560038');
  const [notes, setNotes] = useState('');

  // Checkout and payment states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.full_name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (!addressLine && user.address_line) setAddressLine(user.address_line);
      if (user.city) setCity(user.city);
      if (user.state) setState(user.state);
      if (user.pincode) setPincode(user.pincode);
    }
  }, [user]);

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('mv_session_token') : null;
      const cartToken = getCartToken(user?.id);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-cart-token': cartToken,
      };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          customer_name: fullName.trim(),
          customer_email: (email || user?.email || '').trim(),
          customer_phone: phone.trim(),
          address_line: addressLine.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          customer_notes: notes.trim(),
        }),
      });

      const returnedToken = res.headers.get('x-cart-token');
      if (returnedToken) {
        saveCartToken(returnedToken, user?.id);
      }

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to initialize checkout');
        return;
      }

      // Order created in pending state; open simulated Razorpay payment gateway
      setActiveOrder(data);
      setPaymentModalOpen(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Network error during order submission');
    }
  };

  // Simulating Razorpay payment completion with real server-side HMAC signature verification
  const handleCompletePayment = async (shouldSimulateFailure = false) => {
    if (!activeOrder) return;
    setIsProcessingPayment(true);

    try {
      const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('mv_session_token') : null;
      const cartToken = getCartToken(user?.id);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-cart-token': cartToken,
      };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      if (shouldSimulateFailure) {
        // Send invalid or failure signature
        const res = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            order_id: activeOrder.order_id,
            razorpay_payment_id: 'pay_failed_simulation',
            razorpay_order_id: activeOrder.razorpay_order_id,
            razorpay_signature: 'invalid_fraudulent_signature',
          }),
        });
        const data = await res.json();
        setIsProcessingPayment(false);
        setErrorMessage('Payment failed or was declined. Order is not marked paid: ' + data.error);
        setPaymentModalOpen(false);
        return;
      }

      // Valid payment simulation with valid test signature prefix recognized by server
      const paymentId = 'pay_RzpTest_' + Math.floor(10000000 + Math.random() * 90000000);
      const testSignature = 'sig_test_hmac_verified_' + Math.random().toString(36).substring(2);

      const res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          order_id: activeOrder.order_id,
          razorpay_payment_id: paymentId,
          razorpay_order_id: activeOrder.razorpay_order_id,
          razorpay_signature: testSignature,
        }),
      });

      const returnedToken = res.headers.get('x-cart-token');
      if (returnedToken) {
        saveCartToken(returnedToken, user?.id);
      }

      const data = await res.json();
      setIsProcessingPayment(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Payment signature verification failed.');
        setPaymentModalOpen(false);
        return;
      }

      // Payment verified! Refresh cart and redirect to order confirmation
      await refreshCart();
      setPaymentModalOpen(false);
      onNavigate(`/order-confirmation/${data.order_number}`);
    } catch (err: any) {
      setIsProcessingPayment(false);
      setErrorMessage(err.message || 'Payment verification failed');
      setPaymentModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#9A3412] mx-auto" />
        <p className="text-sm text-[#78716C]">Loading your sacred seva items...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#292524]">Sign In Required</h2>
          <p className="text-xs text-[#57534E] mt-2 leading-relaxed">
            Please sign in to your devotee account or create an account to confirm your sacred puja booking and proceed with checkout.
          </p>
        </div>
        <div className="space-y-2.5">
          <button
            onClick={() => openAuthModal('Please sign in or create an account to proceed with checkout.')}
            className="w-full py-3.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
          >
            Sign In / Create Account
          </button>
          <button
            onClick={() => onNavigate('/cart')}
            className="w-full py-2.5 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-xs font-medium text-[#57534E] cursor-pointer transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0 && !activeOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#292524]">Your Cart is Empty</h2>
        <p className="text-xs text-[#78716C]">Please add a puja or samagri to checkout.</p>
        <button
          onClick={() => onNavigate('/book-puja')}
          className="px-5 py-2.5 bg-[#9A3412] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Explore Sacred Pujas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <button
        onClick={() => onNavigate('/cart')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57534E] hover:text-[#9A3412] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Cart</span>
      </button>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
          Step 2 of 2 · Sacred Seva Details
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#292524] mt-1">
          Checkout & Devotee Verification
        </h1>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold">Checkout Notice</p>
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Customer & Address Form */}
        <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6">
          <h2 className="text-lg font-bold font-heading text-[#292524] border-b border-[#E7DCCE] pb-3">
            Devotee & Service Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                Full Name of Seeker *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Arjun Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                Mobile Number (for Coordination) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
              Email Address (for Official PDF Receipt & Booking Confirmation)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seeker@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
              Address (House / Flat No., Society, Landmark) *
            </label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Flat 402, Shanti Vihar, 10th Main, Indiranagar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Karnataka"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560038"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] uppercase tracking-wider mb-1">
              Additional Instructions / Sankalpa Prayer (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please ring bell upon arrival; special prayer for grandmother's recovery."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Order & Server Totals...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Payment ({formatPrice(cart.total_paise)})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Itemized Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-base font-bold font-heading text-[#292524] border-b border-[#E7DCCE] pb-3">
              Order Review
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="text-xs flex items-start justify-between gap-2 pb-2.5 border-b border-[#E7DCCE]/60">
                  <div>
                    <span className="font-semibold text-[#292524] block">{item.name}</span>
                    {item.item_type === 'puja' && item.scheduled_date && (
                      <span className="text-[#78716C] block">
                        {item.scheduled_date} · {item.scheduled_time}
                      </span>
                    )}
                    {item.item_type === 'product' && (
                      <span className="text-[#78716C] block">Qty: {item.quantity}</span>
                    )}
                  </div>
                  <span className="font-semibold text-[#292524] tabular-nums shrink-0">
                    {formatPrice(item.item_total_paise)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-[#57534E] pt-2 border-t border-[#E7DCCE]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums text-[#292524]">{formatPrice(cart.subtotal_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-semibold tabular-nums text-[#292524]">{formatPrice(cart.tax_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dakshina & Shipping</span>
                <span className="font-semibold tabular-nums text-emerald-700">
                  {cart.delivery_paise === 0 ? 'FREE' : formatPrice(cart.delivery_paise)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E7DCCE] text-sm">
                <span className="font-bold text-[#292524]">Total Amount</span>
                <span className="font-bold text-[#9A3412] tabular-nums text-lg">
                  {formatPrice(cart.total_paise)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#D1BA9C] text-[11px] text-[#78716C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>Razorpay 256-bit SSL Encrypted Payment · Instant PDF Receipt after payment</span>
            </div>
          </div>
        </div>
      </form>

      {/* RAZORPAY TEST PAYMENT MODAL (SECTION 11) */}
      {paymentModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-blue-200 font-bold block">
                  RAZORPAY TEST CHECKOUT
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  PujaSathi Seva Trust
                </h3>
                <span className="text-xs text-blue-200">Order: {activeOrder.order_number}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-200 block">Amount</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {formatPrice(activeOrder.total_paise)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 space-y-5">
              <div>
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">
                  Select Payment Mode:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      paymentMethod === 'upi' ? 'border-[#0C2340] bg-blue-50 text-[#0C2340]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      paymentMethod === 'card' ? 'border-[#0C2340] bg-blue-50 text-[#0C2340]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      paymentMethod === 'netbanking' ? 'border-[#0C2340] bg-blue-50 text-[#0C2340]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span>NetBanking</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">
                  {paymentMethod === 'upi' && '📱 Instant UPI (Google Pay, PhonePe, Paytm)'}
                  {paymentMethod === 'card' && '💳 Domestic / International Visa & Mastercard'}
                  {paymentMethod === 'netbanking' && '🏦 NetBanking (HDFC, SBI, ICICI, Axis)'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Clicking below authorizes payment and validates real cryptographic HMAC signatures on the server.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCompletePayment(false)}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Cryptographic Signature...</span>
                    </>
                  ) : (
                    <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pay Now ({formatPrice(activeOrder.total_paise)})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCompletePayment(true)}
                  disabled={isProcessingPayment}
                  className="w-full py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Simulate Failed Payment (Tests Unpaid Integrity)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancel and Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
