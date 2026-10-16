import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface PujaShopPageProps {
  products: Product[];
  onNavigate: (route: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Samagri' },
  { id: 'Puja Thalis & Vessels', label: 'Puja Thalis & Vessels' },
  { id: 'Brass Diyas & Lamps', label: 'Brass Diyas & Lamps' },
  { id: 'Diyas & Camphor', label: 'Cow Ghee Battis' },
  { id: 'Holy Water & Panchamrit', label: 'Gangajal & Holy Water' },
  { id: 'Incense & Dhoop', label: 'Incense & Dhoop' },
  { id: 'Kumkum & Sandalwood', label: 'Kumkum & Chandan' },
  { id: 'Sacred Attire & Vastra', label: 'Silk Dhotis & Vastra' },
  { id: 'Havan & Samagri Kits', label: 'Havan Kits' },
];

export const PujaShopPage: React.FC<PujaShopPageProps> = ({ products, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price_paise - b.price_paise;
        if (sortBy === 'price_desc') return b.price_paise - a.price_paise;
        if (sortBy === 'stock') return b.stock - a.stock;
        return b.featured - a.featured;
      });
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
          Pure Temple Essentials
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#292524]">
          Sacred Puja Samagri Store
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E]">
          Artisanal brass thalis, heavy akhand diyas, A2 Gir cow ghee wicks, and pure Gangajal delivered to your doorstep. Free delivery above ₹999.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A8A29E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search samagri, thali, ghee batti, incense..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#78716C] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs font-medium text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
            >
              <option value="featured">Featured Essentials</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock">Highest Stock</option>
            </select>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-[#9A3412] text-white shadow-xs'
                    : 'bg-white text-[#57534E] hover:bg-[#F5EFEB] border border-[#D1BA9C]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-8 sm:p-12 text-center text-[#78716C]">
          <p className="text-base font-semibold text-[#292524]">No samagri found</p>
          <p className="text-xs mt-1">Try searching for other items or selecting All Samagri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(slug) => onNavigate(`/puja-shop/${slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
