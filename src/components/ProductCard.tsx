import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { ProductArt } from './SpiritualArt';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addProductToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN');
  };

  const handleAddToCart = async () => {
    if (!user) {
      openAuthModal('Please sign in or create an account to add sacred puja essentials to your cart.', () => {
        addProductToCart(product.id, 1);
      });
      return;
    }
    setIsAdding(true);
    const res = await addProductToCart(product.id, 1);
    setIsAdding(false);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
      {/* Product Image Area */}
      <div 
        onClick={() => onViewDetails(product.slug)}
        className="h-44 sm:h-48 w-full bg-[#F5EFE6] relative overflow-hidden flex items-center justify-center cursor-pointer p-4"
      >
        <ProductArt type={product.image} className="w-full h-full max-h-40 object-contain group-hover:scale-105 transition-transform duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category in clean unboxed metadata */}
          <span className="text-[11px] uppercase tracking-wider text-[#B45309] font-medium block">
            {product.category}
          </span>

          <button
            onClick={() => onViewDetails(product.slug)}
            className="text-left group-hover:text-[#9A3412] transition-colors cursor-pointer mt-1"
          >
            <h3 className="text-base font-bold font-heading text-[#292524] line-clamp-1">
              {product.name}
            </h3>
          </button>
          <p className="text-xs text-[#57534E] line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Stock status in unboxed text */}
        <div className="text-xs text-[#78716C] flex items-center gap-2">
          {product.stock > 0 ? (
            <span className="text-emerald-700 font-medium">In Stock ({product.stock} available)</span>
          ) : (
            <span className="text-rose-700 font-medium">Temporarily Out of Stock</span>
          )}
          <span aria-hidden="true">·</span>
          <span>100% Pure</span>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-2 border-t border-[#E7DCCE] flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-bold text-[#9A3412] tabular-nums block truncate">
              {formatPrice(product.price_paise)}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => onViewDetails(product.slug)}
              className="hidden sm:inline-flex px-2 py-1.5 rounded-lg text-xs font-medium text-[#57534E] hover:bg-white border border-transparent hover:border-[#D1BA9C] transition-colors cursor-pointer"
            >
              Info
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock <= 0}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
                justAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#9A3412] hover:bg-[#7C2D12] text-white hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
