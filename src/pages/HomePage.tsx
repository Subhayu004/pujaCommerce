import React from 'react';
import { Calendar, Users, ShoppingBag, ArrowRight, ShieldCheck, Flame, BookOpen, Clock, Star } from 'lucide-react';
import { Puja, Product, Pujari } from '../types';
import { TempleSanctumArt, PujariAvatar } from '../components/SpiritualArt';
import { PujaCard } from '../components/PujaCard';
import { ProductCard } from '../components/ProductCard';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';

interface HomePageProps {
  pujas: Puja[];
  products: Product[];
  pujaris: Pujari[];
  onBookPuja: (puja: Puja) => void;
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  pujas,
  products,
  pujaris,
  onBookPuja,
  onNavigate,
}) => {
  const featuredPujas = pujas.slice(0, 3);
  const featuredProducts = products.slice(0, 4);
  const featuredPujaris = pujaris.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#24140E] text-white">
        {/* Background art with measured scrim */}
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity pointer-events-none">
          <TempleSanctumArt className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#24140E] via-[#24140E]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-14 sm:py-24 lg:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#78350F]/60 border border-[#F59E0B]/30 text-xs text-[#FDE68A] mb-5 sm:mb-6 backdrop-blur-xs">
            <Flame className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span className="truncate">Preserving Shastric Vidhi & Sanatana Dharma</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-white max-w-4xl text-balance">
            Book Sacred Hindu Rituals with Ease
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-[#E7DCCE] max-w-2xl text-balance leading-relaxed">
            Discover traditional pujas, connect with experienced pujaris, and prepare for your sacred ceremonies with certified Vedic scholars and authentic samagri.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('/book-puja')}
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Puja</span>
            </button>
            <button
              onClick={() => onNavigate('/pujaris')}
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Users className="w-4 h-4 text-[#FDE68A]" />
              <span>Explore Our Pujaris</span>
            </button>
          </div>

          {/* Trust strip */}
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-left w-full max-w-4xl">
            <div className="p-2 sm:p-0">
              <span className="text-lg sm:text-2xl font-bold font-heading text-[#FDE68A] block tabular-nums">100%</span>
              <span className="text-[11px] sm:text-xs text-[#D6D3D1]">Vedic Shastric Vidhi</span>
            </div>
            <div className="p-2 sm:p-0">
              <span className="text-lg sm:text-2xl font-bold font-heading text-[#FDE68A] block tabular-nums">50+</span>
              <span className="text-[11px] sm:text-xs text-[#D6D3D1]">Verified Temple Acharyas</span>
            </div>
            <div className="p-2 sm:p-0">
              <span className="text-lg sm:text-2xl font-bold font-heading text-[#FDE68A] block tabular-nums">4.95★</span>
              <span className="text-[11px] sm:text-xs text-[#D6D3D1]">Devotee Seva Satisfaction</span>
            </div>
            <div className="p-2 sm:p-0">
              <span className="text-lg sm:text-2xl font-bold font-heading text-[#FDE68A] block tabular-nums">Pan-India</span>
              <span className="text-[11px] sm:text-xs text-[#D6D3D1]">Home Visit & Temple Seva</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHENTIC BHAGAVAD GITA QUOTATIONS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-5 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF3C7]/40 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A3412] tracking-widest uppercase">
              <BookOpen className="w-4 h-4" />
              <span>Sacred Shastra Wisdom</span>
            </div>

            <p className="text-base sm:text-2xl font-heading font-bold text-[#78350F] leading-relaxed">
              पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति ।<br />
              तदहं भक्त्युपहृतमश्नामि प्रयतात्मनः ॥
            </p>

            <p className="text-xs sm:text-base text-[#44403C] italic leading-relaxed">
              "Whoever offers to Me with devotion a leaf, a flower, a fruit, or water — that offering made with love and a pure heart, I accept."
            </p>

            <div className="pt-1 text-xs font-medium text-[#78716C]">
              <span>Bhagavad Gita · Chapter 9, Verse 26</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PUJAS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
              Sacred Ceremonies
            </span>
            <h2 className="text-xl sm:text-3xl font-bold font-heading text-[#292524] mt-1">
              Featured Vedic Pujas
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1">
              Authentic ceremonies performed according to Rigveda, Yajurveda, and Samaveda Shastras.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/book-puja')}
            className="text-xs font-semibold text-[#9A3412] hover:text-[#7C2D12] flex items-center gap-1 transition-colors cursor-pointer group whitespace-nowrap"
          >
            <span>View All Pujas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredPujas.map((puja) => (
            <PujaCard
              key={puja.id}
              puja={puja}
              onBook={onBookPuja}
              onViewDetails={(slug) => onNavigate(`/book-puja/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* 4. PUJA ESSENTIALS & SAMAGRI STORE */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
              Pure Offerings
            </span>
            <h2 className="text-xl sm:text-3xl font-bold font-heading text-[#292524] mt-1">
              Puja Essentials & Sacred Samagri
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1">
              Pure Gir Cow Ghee, certified Haridwar Gangajal, brass vessels, and unstitched silk dhotis.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/puja-shop')}
            className="text-xs font-semibold text-[#9A3412] hover:text-[#7C2D12] flex items-center gap-1 transition-colors cursor-pointer group whitespace-nowrap"
          >
            <span>Explore Shop</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(slug) => onNavigate(`/puja-shop/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* 5. PUJARI INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
              Vedic Scholars
            </span>
            <h2 className="text-xl sm:text-3xl font-bold font-heading text-[#292524] mt-1">
              Meet Our Verified Acharyas
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1">
              Scholars trained at Varanasi, Tirupati, and Trimbakeshwar Gurukuls with decades of ritual tapasya.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/pujaris')}
            className="text-xs font-semibold text-[#9A3412] hover:text-[#7C2D12] flex items-center gap-1 transition-colors cursor-pointer group whitespace-nowrap"
          >
            <span>Explore All Pujaris</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredPujaris.map((pujari) => (
            <div
              key={pujari.id}
              className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <PujariAvatar code={pujari.photo} className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-base font-bold font-heading text-[#292524] truncate">
                    {pujari.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#B45309] font-medium mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="tabular-nums">{pujari.rating}</span>
                    <span className="text-[#78716C]">({pujari.review_count})</span>
                  </div>
                  <span className="text-xs text-[#57534E] block mt-1 truncate">
                    {pujari.experience_years} Years Experience
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#57534E] line-clamp-3 leading-relaxed">
                {pujari.bio}
              </p>

              <div className="pt-3 border-t border-[#E7DCCE] flex items-center justify-between text-xs">
                <span className="text-[#78716C] truncate max-w-[140px]">
                  {pujari.languages}
                </span>
                <button
                  onClick={() => onNavigate(`/pujaris/${pujari.slug}`)}
                  className="font-semibold text-[#9A3412] hover:text-[#7C2D12] cursor-pointer"
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#292524] mt-1">
            How PujaSathi Works
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] mt-2">
            Experience serene Hindu rituals with reliable scheduling, verified Acharyas, and official receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 relative">
            <span className="text-3xl font-heading font-bold text-[#D1BA9C] block mb-3">01</span>
            <h3 className="text-base font-bold text-[#292524] mb-2 font-heading">
              Choose Your Puja
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Select your desired ceremony (e.g., Rudrabhishek, Griha Pravesh, Satyanarayan), pick an auspicious date, choose a time slot, and specify your family sankalpa details.
            </p>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 relative">
            <span className="text-3xl font-heading font-bold text-[#D1BA9C] block mb-3">02</span>
            <h3 className="text-base font-bold text-[#292524] mb-2 font-heading">
              Add Optional Essentials
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Once added to your cart, easily choose pure puja essentials like brass thalis, desi cow ghee wicks, and pure Gangajal to complement your ceremony without losing your booking.
            </p>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 relative">
            <span className="text-3xl font-heading font-bold text-[#D1BA9C] block mb-3">03</span>
            <h3 className="text-base font-bold text-[#292524] mb-2 font-heading">
              Receive Confirmation & PDF Receipt
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Complete secure checkout via Razorpay UPI or Card. Receive instant SMS/email confirmation, assigned Acharya schedule, and download an official verified PDF receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Support Button */}
      <FloatingWhatsApp phoneNumber="+91 84500 02545" />
    </div>
  );
};
