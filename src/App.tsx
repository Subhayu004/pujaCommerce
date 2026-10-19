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

  // Initialize from cache and custom items for instant render
  const [pujas, setPujas] = useState<Puja[]>(() => {
    try {
      const cached = localStorage.getItem('pujasathi_cached_pujas');
      const custom = localStorage.getItem('pujasathi_custom_pujas');
      const base: Puja[] = cached ? JSON.parse(cached) : [];
      const extra: Puja[] = custom ? JSON.parse(custom) : [];
      const merged = [...base];
      for (const item of extra) {
        const idx = merged.findIndex((p) => p.id === item.id || p.slug === item.slug);
        if (idx >= 0) merged[idx] = item;
        else merged.unshift(item);
      }
      return merged;
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('pujasathi_cached_products');
      const custom = localStorage.getItem('pujasathi_custom_products');
      const base: Product[] = cached ? JSON.parse(cached) : [];
      const extra: Product[] = custom ? JSON.parse(custom) : [];
      const merged = [...base];
      for (const item of extra) {
        const idx = merged.findIndex((p) => p.id === item.id || p.slug === item.slug);
        if (idx >= 0) merged[idx] = item;
        else merged.unshift(item);
      }
      return merged;
    } catch {
      return [];
    }
  });

  const [pujaris, setPujaris] = useState<Pujari[]>(() => {
    try {
      const cached = localStorage.getItem('pujasathi_cached_pujaris');
      const custom = localStorage.getItem('pujasathi_custom_pujaris');
      const base: Pujari[] = cached ? JSON.parse(cached) : [];
      const extra: Pujari[] = custom ? JSON.parse(custom) : [];
      const merged = [...base];
      for (const item of extra) {
        const idx = merged.findIndex((p) => p.id === item.id || p.slug === item.slug);
        if (idx >= 0) merged[idx] = item;
        else merged.unshift(item);
      }
      return merged;
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

  // Re-fetch catalog data and seamlessly blend custom items
  const refreshCatalog = () => {
    fetch('/api/pujas', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.pujas && Array.isArray(data.pujas)) {
          let customPujas: Puja[] = [];
          try {
            const raw = localStorage.getItem('pujasathi_custom_pujas');
            if (raw) customPujas = JSON.parse(raw);
          } catch {}

          let deletedPujas: string[] = [];
          try {
            const rawDel = localStorage.getItem('pujasathi_deleted_pujas');
            if (rawDel) deletedPujas = JSON.parse(rawDel);
          } catch {}

          const combined = [...data.pujas];
          for (const cp of customPujas) {
            const idx = combined.findIndex((p) => p.id === cp.id || p.slug === cp.slug);
            if (idx >= 0) combined[idx] = cp;
            else combined.unshift(cp);
          }

          const filtered = combined.filter((p) => !deletedPujas.includes(p.id) && !deletedPujas.includes(p.slug));
          setPujas(filtered);
          try {
            localStorage.setItem('pujasathi_cached_pujas', JSON.stringify(filtered));
          } catch {}
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          let customProducts: Product[] = [];
          try {
            const raw = localStorage.getItem('pujasathi_custom_products');
            if (raw) customProducts = JSON.parse(raw);
          } catch {}

          let deletedProducts: string[] = [];
          try {
            const rawDel = localStorage.getItem('pujasathi_deleted_products');
            if (rawDel) deletedProducts = JSON.parse(rawDel);
          } catch {}

          const combined = [...data.products];
          for (const cp of customProducts) {
            const idx = combined.findIndex((p) => p.id === cp.id || p.slug === cp.slug);
            if (idx >= 0) combined[idx] = cp;
            else combined.unshift(cp);
          }

          const filtered = combined.filter((p) => !deletedProducts.includes(p.id) && !deletedProducts.includes(p.slug));
          setProducts(filtered);
          try {
            localStorage.setItem('pujasathi_cached_products', JSON.stringify(filtered));
          } catch {}
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/pujaris', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.pujaris && Array.isArray(data.pujaris)) {
          let customPujaris: Pujari[] = [];
          try {
            const raw = localStorage.getItem('pujasathi_custom_pujaris');
            if (raw) customPujaris = JSON.parse(raw);
          } catch {}

          let deletedPujaris: string[] = [];
          try {
            const rawDel = localStorage.getItem('pujasathi_deleted_pujaris');
            if (rawDel) deletedPujaris = JSON.parse(rawDel);
          } catch {}

          const combined = [...data.pujaris];
          for (const cp of customPujaris) {
            const idx = combined.findIndex((p) => p.id === cp.id || p.slug === cp.slug);
            if (idx >= 0) combined[idx] = cp;
            else combined.unshift(cp);
          }

          const filtered = combined.filter((p) => !deletedPujaris.includes(p.id) && !deletedPujaris.includes(p.slug));
          setPujaris(filtered);
          try {
            localStorage.setItem('pujasathi_cached_pujaris', JSON.stringify(filtered));
          } catch {}
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    refreshCatalog();
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
    };

    window.addEventListener('catalogUpdated', handleCatalogUpdate);
    return () => window.removeEventListener('catalogUpdated', handleCatalogUpdate);
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
      const singlePuja = pujas.find((p) => p.slug === slug) || null;
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
      const singleProduct = products.find((p) => p.slug === slug) || null;
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
