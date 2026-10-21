import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, MapPin, Download, Package, ShieldCheck, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

interface AccountPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, logout, getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'all_orders' | 'profile'>('bookings');

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch('/api/orders/my-orders', {
        headers: getAuthHeaders(),
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleDownloadReceipt = (orderNumber: string) => {
    const downloadUrl = `/api/orders/${orderNumber}/receipt`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `mandirveda_receipt_${orderNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FEF3C7] border border-[#D1BA9C] flex items-center justify-center text-[#9A3412]">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading text-[#292524]">
            Devotee Account
          </h1>
          <p className="text-xs text-[#57534E]">
            Please sign in to view your scheduled Vedic pujas, samagri orders, and download verified PDF receipts.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Filter orders that have puja bookings
  const pujaBookings = orders.filter((o) =>
    o.items?.some((item) => item.item_type === 'puja')
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Devotee Header Banner */}
      <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#9A3412] to-[#D97706] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold font-heading text-[#292524]">
                {user.full_name}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#9A3412] border border-[#F59E0B]/30">
                {user.role === 'admin' ? '🛡️ Administrator' : '👤 Devotee'}
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">{user.email} · {user.phone || 'Phone not set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
          {user.role === 'admin' && (
            <button
              onClick={() => onNavigate('/admin')}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🛡️ Admin Portal →</span>
            </button>
          )}
          <button
            onClick={() => logout()}
            className="px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-xs font-medium text-[#57534E] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7DCCE] pb-2 text-xs overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'bookings'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          Sacred Puja Bookings ({pujaBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('all_orders')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'all_orders'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          All Orders & Samagri ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          Devotee Profile Details
        </button>
      </div>

      {/* TAB 1: SACRED PUJA BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-[#78716C]">Loading bookings...</div>
          ) : pujaBookings.length === 0 ? (
            <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-10 text-center text-[#78716C] space-y-3">
              <Calendar className="w-8 h-8 mx-auto text-[#B45309]" />
              <p className="text-sm font-semibold text-[#292524]">No Puja Bookings Yet</p>
              <p className="text-xs">Schedule an auspicious Vedic puja to view your ceremony details here.</p>
              <button
                onClick={() => onNavigate('/book-puja')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#9A3412] text-white text-xs font-semibold cursor-pointer"
              >
                Book a Vedic Puja
              </button>
            </div>
          ) : (
            pujaBookings.map((order) => (
              <div
                key={order.id}
                className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E7DCCE] pb-3">
                  <div>
                    <span className="text-xs text-[#78716C]">Order Reference: </span>
                    <strong className="text-xs font-bold text-[#9A3412]">{order.order_number}</strong>
                    <span className="text-xs text-[#78716C] ml-3">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      order.booking_status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.booking_status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : order.booking_status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      Booking: {order.booking_status.toUpperCase()}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      Payment: {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Items in this booking */}
                <div className="space-y-3">
                  {order.items
                    ?.filter((i) => i.item_type === 'puja')
                    .map((item) => (
                      <div key={item.id} className="p-3.5 bg-white rounded-xl border border-[#D1BA9C] space-y-1 text-xs">
                        <h4 className="text-sm font-bold font-heading text-[#292524]">{item.item_name}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[#57534E] pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                            <strong>{item.scheduled_date}</strong>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                            <span>{item.scheduled_time}</span>
                          </span>
                          {item.pujari_name && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-[#78350F] font-semibold">
                                <User className="w-3.5 h-3.5" />
                                <span>{item.pujari_name}</span>
                              </span>
                            </>
                          )}
                          {item.service_location && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
                                <span>{item.service_location}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Bottom Row */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#78716C]">Total Amount: </span>
                    <strong className="text-sm font-bold text-[#9A3412] tabular-nums">{formatPrice(order.total_paise)}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(order.order_number)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-[#292524] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span>Download Receipt (PDF)</span>
                    </button>
                    <button
                      onClick={() => onNavigate(`/order-confirmation/${order.order_number}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#9A3412] text-white font-semibold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ALL ORDERS & SAMAGRI */}
      {activeTab === 'all_orders' && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E7DCCE] pb-3 text-xs">
                <div>
                  <strong className="text-sm font-bold text-[#9A3412]">{order.order_number}</strong>
                  <span className="text-[#78716C] ml-3">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                    order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {order.items?.map((it) => (
                  <div key={it.id} className="flex justify-between text-[#57534E]">
                    <span>{it.item_name} × {it.quantity}</span>
                    <span className="font-semibold text-[#292524] tabular-nums">{formatPrice(it.price_paise * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E7DCCE] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#78716C]">Total: </span>
                  <strong className="text-sm font-bold text-[#9A3412] tabular-nums">{formatPrice(order.total_paise)}</strong>
                </div>
                <button
                  onClick={() => handleDownloadReceipt(order.order_number)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-[#292524] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#9A3412]" />
                  <span>Download Receipt (PDF)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DEVOTEE PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 sm:p-8 max-w-2xl space-y-5">
          <h2 className="text-lg font-bold font-heading text-[#292524]">
            Devotee Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-[#D1BA9C]">
              <span className="text-[#78716C] block mb-1">Full Name</span>
              <strong className="text-sm text-[#292524]">{user.full_name}</strong>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#D1BA9C]">
              <span className="text-[#78716C] block mb-1">Email</span>
              <strong className="text-sm text-[#292524]">{user.email}</strong>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#D1BA9C]">
              <span className="text-[#78716C] block mb-1">Mobile</span>
              <strong className="text-sm text-[#292524]">{user.phone || 'Not configured'}</strong>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#D1BA9C]">
              <span className="text-[#78716C] block mb-1">Service City / State</span>
              <strong className="text-sm text-[#292524]">{user.city || 'Bengaluru'}, {user.state || 'Karnataka'}</strong>
            </div>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#D1BA9C] text-xs">
            <span className="text-[#78716C] block mb-1">Saved Address Line</span>
            <p className="text-[#292524]">{user.address_line || 'Flat 402, Shanti Vihar, Indiranagar'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
