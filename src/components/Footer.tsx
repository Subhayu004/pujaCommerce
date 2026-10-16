import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1C1917] text-[#D6D3D1] border-t border-[#44403C]">
      {/* Sacred Scripture Banner */}
      <div className="bg-[#292524] py-8 px-4 border-b border-[#44403C]/60 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="font-heading text-lg sm:text-xl text-[#FDE68A] tracking-wide">
            पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति ।<br />
            तदहं भक्त्युपहृतमश्नामि प्रयतात्मनः ॥
          </p>
          <p className="text-xs text-[#A8A29E] italic max-w-xl mx-auto">
            "Whoever offers Me with devotion a leaf, a flower, a fruit, or water — that offering of love, made by a pure heart, I accept."
          </p>
          <p className="text-[11px] font-semibold tracking-widest text-[#D97706] uppercase">
            — Bhagavad Gita, Chapter 9, Verse 26
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="PujaSathi"
                className="w-9 h-9 rounded-full object-contain shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-bold font-heading text-white tracking-wide">PujaSathi</span>
            </div>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Preserving Vedic Sanatana Dharma with authenticity, Shastric precision, and pure devotion. Connecting devotees with certified temple Acharyas and sacred puja samagri pan-India.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#FDE68A]">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              <span>100% Certified Vedic Pandits & Pure Samagri</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Sacred Services</h4>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li>
                <button onClick={() => onNavigate('/book-puja')} className="hover:text-white transition-colors cursor-pointer">
                  Book Vedic Pujas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/puja-shop')} className="hover:text-white transition-colors cursor-pointer">
                  Shop Puja Samagri Essentials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pujaris')} className="hover:text-white transition-colors cursor-pointer">
                  Our Verified Acharyas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/cart')} className="hover:text-white transition-colors cursor-pointer">
                  Shopping & Booking Cart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/account')} className="hover:text-white transition-colors cursor-pointer">
                  Devotee Account & Past Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Trust & Policies</h4>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li>
                <span className="hover:text-white cursor-pointer">Terms & Conditions</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Privacy & Data Protection Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Cancellation & Full Refund Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Samagri Shipping & Delivery Rules</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Shastric Vidhi FAQ & Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Contact & Mandir Office */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact & Mandir Office</h4>
            <div className="space-y-2.5 text-xs text-[#A8A29E]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span>Temple Road, Sankat Mochan, Varanasi, Uttar Pradesh - 221001, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                <a href="tel:+918450002545" className="hover:text-white transition-colors">
                  +91 84500 02545 (9 AM - 8 PM IST)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D97706] shrink-0" />
                <a
                  href="mailto:pujasathisupport@gmail.com"
                  className="hover:text-white hover:underline transition-colors cursor-pointer"
                >
                  pujasathisupport@gmail.com
                </a>
              </div>
              <div className="text-[11px] text-[#78716C] pt-1">
                GSTIN: 09AABCU9603R1ZM · Razorpay Verified Merchant
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <p>© 2026 PujaSathi Seva Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Served with Shraddha & Vishwas</span>
            </span>
            <button
              onClick={() => onNavigate('/admin')}
              className="text-[#78716C] hover:text-[#A8A29E] transition-colors cursor-pointer text-[11px]"
              title="Portal for authorized temple administrators"
            >
              🛡️ Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
