import React, { useState, useEffect } from 'react';
import { CheckCircle2, Download, Calendar, Clock, MapPin, User, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationPageProps {
  orderNumber: string;
  onNavigate: (route: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleDownloadReceipt = () => {
    setDownloading(true);
    // Direct link to the authenticated / authorized receipt endpoint
    const downloadUrl = `/api/orders/${orderNumber}/receipt`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `mandirveda_receipt_${orderNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1500);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-[#78716C]">
        <div className="w-8 h-8 mx-auto border-2 border-[#9A3412] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Fetching verified booking confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#292524]">Order Not Found</h2>
        <p className="text-xs text-[#78716C]">Could not locate order #{orderNumber}.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-[#9A3412] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Auspicious Confirmed Banner */}
      <div className="bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl p-4 sm:p-8 text-center space-y-4 relative overflow-hidden shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B45309]">
            Auspicious Ceremony & Seva Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#292524]">
            Thank You, {order.customer_name}!
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-lg mx-auto leading-relaxed">
            Your sacred ceremony and samagri order have been confirmed. A Vedic scholar has been reserved for your chosen auspicious muhurta.
          </p>
        </div>

        {/* Status badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-white border border-[#D1BA9C] font-semibold text-[#292524]">
            Order Ref: <strong className="text-[#9A3412]">{order.order_number}</strong>
          </span>
          <span className={`px-3 py-1 rounded-lg font-semibold ${isPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
            Payment Status: {isPaid ? 'PAID & VERIFIED' : 'PENDING'}
          </span>
          {order.payment_id && (
            <span className="px-3 py-1 rounded-lg bg-white border border-[#D1BA9C] text-[#57534E]">
              Razorpay ID: {order.payment_id}
            </span>
          )}
        </div>

        {/* Download Receipt CTA Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating PDF...' : 'Download Official PDF Receipt'}</span>
          </button>

          <button
            onClick={() => onNavigate('/account')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-[#292524] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#9A3412]" />
            <span>View in My Account</span>
          </button>
        </div>
      </div>

      {/* Itemized Order & Schedule Details */}
      <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-bold font-heading text-[#292524] border-b border-[#E7DCCE] pb-3">
          Reserved Rituals & Puja Samagri
        </h2>

        <div className="space-y-4">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-[#E7DCCE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A3412]">
                  {item.item_type === 'puja' ? 'Vedic Puja Seva' : 'Puja Samagri'}
                </span>
                <h3 className="text-sm font-bold font-heading text-[#292524]">
                  {item.item_name}
                </h3>

                {item.item_type === 'puja' && (
                  <div className="text-[#57534E] space-y-0.5 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Scheduled: <strong>{item.scheduled_date}</strong> at <strong>{item.scheduled_time}</strong></span>
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
                        <span>Location: {item.service_location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right">
                {item.item_type === 'product' && (
                  <span className="text-xs text-[#78716C] block">Qty: {item.quantity}</span>
                )}
                <span className="text-sm font-bold text-[#9A3412] tabular-nums">
                  {formatPrice(item.price_paise * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-[#E7DCCE] space-y-2 text-xs text-[#57534E]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-[#292524] tabular-nums">{formatPrice(order.subtotal_paise)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & GST (5%)</span>
            <span className="font-semibold text-[#292524] tabular-nums">{formatPrice(order.tax_paise)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dakshina & Shipping</span>
            <span className="font-semibold text-emerald-700 tabular-nums">
              {order.delivery_paise === 0 ? 'FREE' : formatPrice(order.delivery_paise)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E7DCCE] text-sm">
            <span className="font-bold text-[#292524]">Total Amount Paid</span>
            <span className="font-bold text-[#9A3412] tabular-nums text-base">
              {formatPrice(order.total_paise)}
            </span>
          </div>
        </div>

        {/* Address and Devotee Info */}
        <div className="pt-4 border-t border-[#E7DCCE] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#57534E]">
          <div>
            <span className="font-semibold text-[#292524] block mb-1">Service & Delivery Address:</span>
            <p>{order.address_line}</p>
            <p>{order.city}, {order.state} - {order.pincode}</p>
            <p>Phone: {order.customer_phone}</p>
          </div>
          <div>
            <span className="font-semibold text-[#292524] block mb-1">Sankalpa Instructions:</span>
            <p className="italic">{order.customer_notes || 'Standard Shastric Sankalpa with family Gotra & Nakshatra.'}</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A3412] hover:text-[#7C2D12] transition-colors cursor-pointer"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
