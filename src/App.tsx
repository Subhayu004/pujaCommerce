import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
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
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [pujas, setPujas] = useState<Puja[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pujaris, setPujaris] = useState<Pujari[]>([]);

  // Modals
  const [bookingPuja, setBookingPuja] = useState<Puja | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

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

  // Re-fetch catalog data whenever route changes or admin updates
  const refreshCatalog = () => {
    fetch('/api/pujas')
      .then((res) => res.json())
      .then((data) => {
        if (data.pujas) setPujas(data.pujas);
      })
      .catch((err) => console.error(err));

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((err) => console.error(err));

    fetch('/api/pujaris')
      .then((res) => res.json())
      .then((data) => {
        if (data.pujaris) setPujaris(data.pujaris);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    refreshCatalog();
  }, [currentRoute]);

  // Booking initiation: opens BookingModal directly without intrusive prompt dialog
  const handleInitiateBookPuja = (puja: Puja) => {
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
      return <ProductDetailPage product={singleProduct} onNavigate={navigate} />;
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
      return <AccountPage onNavigate={navigate} onOpenAuth={() => setAuthModalOpen(true)} />;
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
        onOpenAuth={() => setAuthModalOpen(true)}
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
        onClose={() => setAuthModalOpen(false)}
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
