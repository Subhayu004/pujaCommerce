import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Puja } from '../types';
import { PujaCard } from '../components/PujaCard';

interface BookPujaPageProps {
  pujas: Puja[];
  onBookPuja: (puja: Puja) => void;
  onNavigate: (route: string) => void;
}

const DEITY_FILTERS = [
  { id: 'all', label: 'All Deities' },
  { id: 'Shiva', label: 'Lord Shiva' },
  { id: 'Vishnu', label: 'Lord Vishnu' },
  { id: 'Lakshmi', label: 'Maa Lakshmi' },
  { id: 'Ganesha', label: 'Vastu & Ganesha' },
  { id: 'Navagrahas', label: 'Planetary Deities' },
];

export const BookPujaPage: React.FC<BookPujaPageProps> = ({
  pujas,
  onBookPuja,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const filteredPujas = useMemo(() => {
    return pujas
      .filter((puja) => {
        const matchesSearch =
          puja.name.toLowerCase().includes(search.toLowerCase()) ||
          puja.description.toLowerCase().includes(search.toLowerCase()) ||
          puja.deity.toLowerCase().includes(search.toLowerCase());

        const matchesDeity =
          selectedDeity === 'all' || puja.deity.toLowerCase().includes(selectedDeity.toLowerCase());

        return matchesSearch && matchesDeity;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price_paise - b.price_paise;
        if (sortBy === 'price_desc') return b.price_paise - a.price_paise;
        if (sortBy === 'duration') return a.duration_mins - b.duration_mins;
        return b.featured - a.featured;
      });
  }, [pujas, search, selectedDeity, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
          Sanatana Dharma Seva
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#292524]">
          Book Sacred Vedic Pujas
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E]">
          Reserve auspicious ceremonies with learned temple scholars. All rituals include authentic samagri, customized sankalpa, and complete guidance.
        </p>
      </div>

      {/* Search, Filter Tabs & Sort Controls */}
      <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A8A29E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by puja name, deity (e.g. Shiva, Griha Pravesh)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#78716C] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-medium text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            >
              <option value="featured">Recommended & Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
        </div>

        {/* Deity Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs scrollbar-thin">
          {DEITY_FILTERS.map((f) => {
            const isSelected = selectedDeity === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedDeity(f.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'bg-white text-[#57534E] hover:bg-[#F5EFEB] border border-[#D1BA9C]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Pujas */}
      {filteredPujas.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-8 sm:p-12 text-center text-[#78716C]">
          <p className="text-base font-semibold text-[#292524]">No pujas found matching your criteria</p>
          <p className="text-xs mt-1">Try clearing your search query or choosing another deity filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDeity('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#9A3412] text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredPujas.map((puja) => (
            <PujaCard
              key={puja.id}
              puja={puja}
              onBook={onBookPuja}
              onViewDetails={(slug) => onNavigate(`/book-puja/${slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
