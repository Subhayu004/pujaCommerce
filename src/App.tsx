import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { UpsellModal } from './components/UpsellModal';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { BookPujaPage } from './pages/BookPujaPage';
import { PujaDetailPage } from './pages/PujaDetailPage';
import { PujaShopPage } from './pages/PujaShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PujarisPage } from './pages/PujarisPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { Puja, Product, Pujari } from './types';

export function AppContent() {
  const { user, authModalOpen, authPromptMessage, openAuthModal, closeAuthModal } = useAuth();

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Clean up any legacy localStorage override items so all devices are 100% in sync with the server database
  useEffect(() => {
    try {
      localStorage.removeItem('pujasathi_custom_pujas');
      localStorage.removeItem('pujasathi_deleted_pujas');
      localStorage.removeItem('pujasathi_custom_products');
      localStorage.removeItem('pujasathi_deleted_products');
      localStorage.removeItem('pujasathi_custom_pujaris');
      localStorage.removeItem('pujasathi_deleted_pujaris');
    } catch {}
  }, []);

  // Initialize from server cache for fast initial render
  const [pujas, setPujas] = useState<Puja[]>(() => {
    try {
      const cached = localStorage.getItem('pujasathi_cached_pujas');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('pujasathi_cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [pujaris, setPujaris] = useState<Pujari[]>(() => {
    try {
      const cached = localStorage.getItem('pujasathi_cached_pujaris');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [bookingPuja, setBookingPuja] = useState<Puja | null>(null);

  // Sync route with window popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
      setCurrentRoute(path);
      window.scrollTo(0, 0);
    }
  };

  // Re-fetch catalog data directly from server database (universal across all devices)
  const refreshCatalog = () => {
    fetch('/api/pujas', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.pujas && Array.isArray(data.pujas)) {
          setPujas(data.pujas);
          try {
            localStorage.setItem('pujasathi_cached_pujas', JSON.stringify(data.pujas));
          } catch {}
        }
      })
      .catch((err) => console.error('Error fetching pujas:', err));

    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          try {
            localStorage.setItem('pujasathi_cached_products', JSON.stringify(data.products));
          } catch {}
        }
      })
      .catch((err) => console.error('Error fetching products:', err));

    fetch('/api/pujaris', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.pujaris && Array.isArray(data.pujaris)) {
          setPujaris(data.pujaris);
          try {
            localStorage.setItem('pujasathi_cached_pujaris', JSON.stringify(data.pujaris));
          } catch {}
        }
      })
      .catch((err) => console.error('Error fetching pujaris:', err));
  };

  useEffect(() => {
    refreshCatalog();

    // Re-fetch when switching tabs, waking device, or window gets focus (seamless cross-device sync)
    const handleFocus = () => {
      refreshCatalog();
    };

    // Auto-polling every 3.5s to keep all devices automatically in sync with server changes
    const interval = setInterval(refreshCatalog, 3500);

    // Cross-tab / cross-window instant notification channel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('pujasathi_catalog_channel');
        bc.onmessage = () => {
          refreshCatalog();
        };
      }
    } catch {}

    const handleCatalogUpdate = (e?: any) => {
      if (e?.detail) {
        if (e.detail.type === 'puja' && e.detail.item) {
          setPujas((prev) => {
            const idx = prev.findIndex((p) => p.id === e.detail.item.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = e.detail.item;
              return copy;
            }
            return [e.detail.item, ...prev];
          });
        }
        if (e.detail.type === 'puja_delete') {
          setPujas((prev) => prev.filter((p) => p.id !== e.detail.id && p.slug !== e.detail.slug));
        }
        if (e.detail.type === 'product' && e.detail.item) {
          setProducts((prev) => {
            const idx = prev.findIndex((p) => p.id === e.detail.item.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = e.detail.item;
              return copy;
            }
            return [e.detail.item, ...prev];
          });
        }
        if (e.detail.type === 'product_delete') {
          setProducts((prev) => prev.filter((p) => p.id !== e.detail.id && p.slug !== e.detail.slug));
        }
        if (e.detail.type === 'pujari' && e.detail.item) {
          setPujaris((prev) => {
            const idx = prev.findIndex((p) => p.id === e.detail.item.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = e.detail.item;
              return copy;
            }
            return [e.detail.item, ...prev];
          });
        }
        if (e.detail.type === 'pujari_delete') {
          setPujaris((prev) => prev.filter((p) => p.id !== e.detail.id && p.slug !== e.detail.slug));
        }
      }
      refreshCatalog();
      try {
        bc?.postMessage('catalog_updated');
      } catch {}
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('catalogUpdated', handleCatalogUpdate);

    return () => {
      clearInterval(interval);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('catalogUpdated', handleCatalogUpdate);
    };
  }, [currentRoute]);

  // Booking initiation: requires devotee authentication to book a puja
  const handleInitiateBookPuja = (puja: Puja) => {
    if (!user) {
      openAuthModal('Please sign in or create an account to book your Vedic Puja ceremony.', () => {
        setBookingPuja(puja);
      });
      return;
    }
    setBookingPuja(puja);
  };

  // Route resolution
  const renderCurrentPage = () => {
    // 1. Management / Admin portal
    if (
      currentRoute === '/management' ||
      currentRoute === '/admin' ||
      currentRoute === '/admin-portal' ||
      currentRoute === '/admin/portal' ||
      currentRoute === '/admin/dashboard' ||
      currentRoute.startsWith('/admin') ||
      currentRoute.startsWith('/management')
    ) {
      return <AdminDashboardPage onNavigate={navigate} onCatalogUpdated={refreshCatalog} />;
    }

    // 2. Order confirmation
    if (currentRoute.startsWith('/order-confirmation/')) {
      const orderNumber = currentRoute.replace('/order-confirmation/', '');
      return <OrderConfirmationPage orderNumber={orderNumber} onNavigate={navigate} />;
    }

    // 3. Puja Detail
    if (currentRoute.startsWith('/book-puja/')) {
      const slug = currentRoute.replace('/book-puja/', '');
      const singlePuja = pujas.find((p) => p.slug === slug || p.id === slug) || null;
      return (
        <PujaDetailPage
          slug={slug}
          puja={singlePuja}
          onBookPuja={handleInitiateBookPuja}
          onNavigate={navigate}
        />
      );
    }

    // 4. Product Detail
    if (currentRoute.startsWith('/puja-shop/')) {
      const slug = currentRoute.replace('/puja-shop/', '');
      const singleProduct = products.find((p) => p.slug === slug || p.id === slug) || null;
      return <ProductDetailPage slug={slug} product={singleProduct} onNavigate={navigate} />;
    }

    // 5. Pujari Profile / Directory
    if (currentRoute.startsWith('/pujaris')) {
      return (
        <PujarisPage
          pujaris={pujaris}
          pujas={pujas}
          onBookWithPujari={(p) => handleInitiateBookPuja(p)}
          onNavigate={navigate}
        />
      );
    }

    // 6. Book Puja Catalog
    if (currentRoute === '/book-puja') {
      return (
        <BookPujaPage
          pujas={pujas}
          onBookPuja={handleInitiateBookPuja}
          onNavigate={navigate}
        />
      );
    }

    // 7. Puja Shop Store
    if (currentRoute === '/puja-shop') {
      return <PujaShopPage products={products} onNavigate={navigate} />;
    }

    // 8. Cart
    if (currentRoute === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    // 9. Checkout
    if (currentRoute === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }

    // 10. Account
    if (currentRoute === '/account' || currentRoute.startsWith('/account/')) {
      return <AccountPage onNavigate={navigate} onOpenAuth={() => openAuthModal()} />;
    }

    // Default: Homepage
    return (
      <HomePage
        pujas={pujas}
        products={products}
        pujaris={pujaris}
        onBookPuja={handleInitiateBookPuja}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#292524]">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenAuth={() => openAuthModal()}
      />

      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      <Footer onNavigate={navigate} />

      {/* Mandatory Step 4 & 5 Upsell Modal */}
      <UpsellModal onNavigate={navigate} />

      {/* Booking Customization Modal */}
      <BookingModal
        puja={bookingPuja}
        onClose={() => setBookingPuja(null)}
        onNavigate={navigate}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        promptMessage={authPromptMessage}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
