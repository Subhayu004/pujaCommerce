import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Check, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { Product } from '../types';
import { ProductArt } from '../components/SpiritualArt';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailPageProps {
  product: Product | null;
  slug?: string;
  onNavigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product: initialProduct,
  slug,
  onNavigate,
}) => {
  const { addProductToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [isLoading, setIsLoading] = useState(!initialProduct && !!slug);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setIsLoading(false);
    } else if (slug) {
      setIsLoading(true);
      fetch(`/api/products/${slug}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (data.product) setProduct(data.product);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [initialProduct, slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#9A3412] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#78716C]">Loading sacred puja samagri item...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#292524]">Product Not Found</h2>
        <button
          onClick={() => onNavigate('/puja-shop')}
          className="mt-4 px-4 py-2 bg-[#9A3412] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Back to Puja Shop
        </button>
      </div>
    );
  }

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN');
  };

  const handleAddToCart = async () => {
    if (!user) {
      openAuthModal('Please sign in or create an account to add items to your cart.', () => {
        addProductToCart(product.id, quantity);
      });
      return;
    }
    setIsAdding(true);
    const res = await addProductToCart(product.id, quantity);
    setIsAdding(false);
    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <button
        onClick={() => onNavigate('/puja-shop')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57534E] hover:text-[#9A3412] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Puja Shop</span>
      </button>

      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Product Artwork Container */}
        <div className="md:col-span-6 bg-[#F5EFE6] border border-[#E7DCCE] rounded-2xl p-8 flex items-center justify-center min-h-[350px]">
          <ProductArt type={product.image} className="w-full max-w-sm h-72 object-contain" />
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="md:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B45309]">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#292524] mt-1">
              {product.name}
            </h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#9A3412] tabular-nums">
                {formatPrice(product.price_paise)}
              </span>
              <span className="text-xs text-[#78716C]">Inclusive of all taxes</span>
            </div>
          </div>

          <p className="text-sm text-[#44403C] leading-relaxed">
            {product.description}
          </p>

          {/* Stock info */}
          <div className="text-xs">
            {product.stock > 0 ? (
              <span className="text-emerald-700 font-semibold">
                ✓ Available in Stock ({product.stock} units ready for immediate dispatch)
              </span>
            ) : (
              <span className="text-rose-700 font-semibold">
                ✕ Currently Out of Stock
              </span>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E7DCCE] space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                Quantity:
              </label>
              <div className="flex items-center border border-[#D1BA9C] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-sm text-[#57534E] hover:bg-[#F5EFEB] cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-semibold text-[#292524] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3.5 py-1.5 text-sm text-[#57534E] hover:bg-[#F5EFEB] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock <= 0}
                className="w-full py-3.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart ({formatPrice(product.price_paise * quantity)})</span>
                  </>
                )}
              </button>

              <button
                onClick={async () => {
                  if (!user) {
                    openAuthModal('Please sign in or create an account to view and manage your cart.', async () => {
                      await addProductToCart(product.id, quantity);
                      onNavigate('/cart');
                    });
                    return;
                  }
                  setIsAdding(true);
                  await addProductToCart(product.id, quantity);
                  setIsAdding(false);
                  onNavigate('/cart');
                }}
                disabled={isAdding || product.stock <= 0}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-[#292524] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                Go to Cart
              </button>
            </div>
          </div>

          {/* Delivery & Trust highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#57534E] pt-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCCE]">
              <Truck className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>Free delivery on ₹999+</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCCE]">
              <ShieldCheck className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>100% Shastric Pure</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DCCE]">
              <RefreshCcw className="w-4 h-4 text-[#9A3412] shrink-0" />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
