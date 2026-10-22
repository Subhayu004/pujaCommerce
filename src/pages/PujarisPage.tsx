import React, { useState, useMemo } from 'react';
import { Search, Star, Languages, MapPin, Award } from 'lucide-react';
import { Pujari, Puja } from '../types';
import { PujariAvatar } from '../components/SpiritualArt';

interface PujarisPageProps {
  pujaris: Pujari[];
  pujas?: Puja[];
  onBookWithPujari?: (puja: Puja, pujari: Pujari) => void;
  onNavigate: (route: string) => void;
}

export const PujarisPage: React.FC<PujarisPageProps> = ({
  pujaris,
  pujas,
  onBookWithPujari,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const filteredPujaris = useMemo(() => {
    return (pujaris || [])
      .filter((p) => {
        const name = p.name || '';
        const bio = p.bio || '';
        const specializations = p.specializations || '';
        const service_areas = p.service_areas || '';
        const languages = p.languages || '';
        const q = (search || '').toLowerCase();

        const matchesSearch =
          name.toLowerCase().includes(q) ||
          bio.toLowerCase().includes(q) ||
          specializations.toLowerCase().includes(q) ||
          service_areas.toLowerCase().includes(q);

        const matchesLang =
          selectedLanguage === 'all' || languages.toLowerCase().includes(selectedLanguage.toLowerCase());

        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [pujaris, search, selectedLanguage]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
          Parampara & Tapasya
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#292524]">
          Our Verified Temple Acharyas
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E]">
          Experienced Vedic scholars certified from Varanasi, Tirupati, and Maharashtra Veda Pathashalas. Experts in Sanskrit pronunciation and traditional rituals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A8A29E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scholar name, ritual specialization, or city..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Languages className="w-4 h-4 text-[#78716C] shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-medium text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            >
              <option value="all">All Languages Spoken</option>
              <option value="Hindi">Hindi</option>
              <option value="Sanskrit">Sanskrit</option>
              <option value="English">English</option>
              <option value="Marathi">Marathi</option>
              <option value="Telugu">Telugu</option>
              <option value="Tamil">Tamil</option>
              <option value="Malayalam">Malayalam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pujari Profiles Grid */}
      {filteredPujaris.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-8 sm:p-12 text-center text-[#78716C]">
          <p className="text-base font-semibold text-[#292524]">No pujaris found</p>
          <p className="text-xs mt-1">Try clearing your search query or selecting All Languages.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredPujaris.map((pujari) => (
            <div
              key={pujari.id}
              className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <PujariAvatar code={pujari.photo} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-bold font-heading text-[#292524]">
                        {pujari.name}
                      </h2>
                      <div className="flex items-center gap-1 text-xs text-[#B45309] font-medium bg-[#FEF3C7] px-2 py-0.5 rounded-lg border border-[#F59E0B]/30">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="tabular-nums font-bold">{pujari.rating}</span>
                        <span className="text-[#78716C]">({pujari.review_count})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#78716C] mt-1">
                      <Award className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span>{pujari.experience_years} Years Shastric Experience</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#57534E] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span>{pujari.service_areas}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#44403C] mt-4 leading-relaxed">
                  {pujari.bio}
                </p>

                {/* Specializations and Languages */}
                <div className="mt-4 pt-3 border-t border-[#E7DCCE] space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-[#78350F]">Specializations: </span>
                    <span className="text-[#57534E]">{pujari.specializations}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#78350F]">Languages: </span>
                    <span className="text-[#57534E]">{pujari.languages}</span>
                  </div>
                </div>
              </div>

              {/* Acharya Verification status */}
              <div className="pt-3 border-t border-[#E7DCCE] flex items-center justify-between gap-3">
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>Verified Scholar</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
