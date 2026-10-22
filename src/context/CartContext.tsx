import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartData, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartData;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addPujaToCart: (data: {
    puja_id: string;
    date: string;
    time_slot: string;
    service_location?: string;
    preferred_language?: string;
    pujari_id?: string;
    additional_notes?: string;
    essentials?: { product_id: string; quantity: number }[];
  }) => Promise<{ success: boolean; error?: string; added_item_id?: string }>;
  addProductToCart: (productId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (itemId: string) => Promise<void>;
  clearCartState: () => void;
  showUpsellModal: boolean;
  setShowUpsellModal: (show: boolean) => void;
  lastAddedPujaName: string;
}

const emptyCart: CartData = {
  items: [],
  item_count: 0,
  subtotal_paise: 0,
  delivery_paise: 0,
  tax_paise: 0,
  discount_paise: 0,
  total_paise: 0,
};

export function saveCartToken(token: string, userId?: string | null): void {
  if (typeof window === 'undefined' || !token) return;
  localStorage.setItem('mv_cart_token', token);
  if (userId) {
    localStorage.setItem(`mv_cart_token_${userId}`, token);
  } else {
    localStorage.setItem('mv_cart_token_guest', token);
  }
}

export function getCartToken(userId?: string | null): string {
  if (typeof window === 'undefined') return '';
  // Check user token first, then shared/guest token to preserve items upon login
  let token = userId ? localStorage.getItem(`mv_cart_token_${userId}`) : null;
  if (!token) {
    token = localStorage.getItem('mv_cart_token') || localStorage.getItem('mv_cart_token_guest');
  }
  if (!token) {
    token = 'cart_' + (userId ? 'usr_' : 'gst_') + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  localStorage.setItem('mv_cart_token', token);
  if (userId) {
    localStorage.setItem(`mv_cart_token_${userId}`, token);
  } else {
    localStorage.setItem('mv_cart_token_guest', token);
  }
  return token;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartData>(emptyCart);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUpsellModal, setShowUpsellModal] = useState<boolean>(false);
  const [lastAddedPujaName, setLastAddedPujaName] = useState<string>('');

  const getHeaders = () => {
    const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('mv_session_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-cart-token': getCartToken(user?.id),
    };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    return headers;
  };

  const refreshCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: getHeaders(),
        credentials: 'include',
      });
      const returnedToken = res.headers.get('x-cart-token');
      if (returnedToken) {
        saveCartToken(returnedToken, user?.id);
      }
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-synchronize cart whenever the active user changes
  useEffect(() => {
    setIsLoading(true);
    refreshCart();
  }, [user?.id, user?.role]);

  const clearCartState = () => {
    setCart(emptyCart);
    if (typeof window !== 'undefined') {
      const key = user ? `mv_cart_token_${user.id}` : 'mv_cart_token_guest';
      localStorage.removeItem(key);
      localStorage.removeItem('mv_cart_token');
      localStorage.removeItem('mv_cart_token_guest');
    }
  };

  // MANDATORY STEP 2 & 3: Validate and Add to Cart before showing upsell modal
  const addPujaToCart = async (bookingData: {
    puja_id: string;
    date: string;
    time_slot: string;
    service_location?: string;
    preferred_language?: string;
    pujari_id?: string;
    additional_notes?: string;
    essentials?: { product_id: string; quantity: number }[];
  }) => {
    try {
      const res = await fetch('/api/cart/add-puja', {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(bookingData),
      });

      const returnedToken = res.headers.get('x-cart-token');
      if (returnedToken) {
        saveCartToken(returnedToken, user?.id);
      }

      const result = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: result.error || 'Unable to reserve this puja slot. Please verify date and time.',
        };
      }

      // Cart addition confirmed by server!
      setCart(result.cart);
      const addedItem = result.cart.items.find((i: CartItem) => i.id === result.added_item_id);
      setLastAddedPujaName(addedItem ? addedItem.name : 'Sacred Puja');

      // Only display upsell modal if devotee didn't already choose essentials during booking
      const hasChosenEssentials = bookingData.essentials && bookingData.essentials.length > 0;
      if (!hasChosenEssentials) {
        setShowUpsellModal(true);
      }

      return {
        success: true,
        added_item_id: result.added_item_id,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while adding to cart' };
    }
  };

  const addProductToCart = async (productId: string, quantity: number = 1) => {
    try {
      const res = await fetch('/api/cart/add-product', {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const returnedToken = res.headers.get('x-cart-token');
      if (returnedToken) {
        saveCartToken(returnedToken, user?.id);
      }
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to add item to cart' };
      }
      setCart(result.cart);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/item/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
      const returnedToken = res.headers.get('x-cart-token');
      if (returnedToken) {
        saveCartToken(returnedToken, user?.id);
      }
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to update quantity' };
      }
      setCart(result.cart);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
      });
      const returnedToken = res.headers.get('x-cart-token');
      if (returnedToken) {
        saveCartToken(returnedToken, user?.id);
      }
      if (res.ok) {
        const result = await res.json();
        setCart(result.cart);
      }
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        refreshCart,
        addPujaToCart,
        addProductToCart,
        updateQuantity,
        removeItem,
        clearCartState,
        showUpsellModal,
        setShowUpsellModal,
        lastAddedPujaName,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
