import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenAuth }) => {
  const { cart } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Book Puja', path: '/book-puja' },
    { label: 'Puja Shop', path: '/puja-shop' },
    { label: 'Our Pujaris', path: '/pujaris' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7DCCE] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-6 lg:gap-8 h-16 sm:h-18">
          {/* Zone 1: Single text element wordmark with new PujaSathi Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 sm:gap-3 text-left text-lg sm:text-2xl font-bold font-heading tracking-tight text-[#292524] whitespace-nowrap shrink-0 hover:text-[#9A3412] transition-colors cursor-pointer group"
          >
            <img
              src="/logo.png"
              alt="PujaSathi"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-contain shadow-xs group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="font-heading font-bold text-[#292524] group-hover:text-[#9A3412] transition-colors">
              PujaSathi
            </span>
          </button>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#44403C]">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive ? 'text-[#9A3412] font-semibold' : 'hover:text-[#9A3412]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9A3412] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action area (Cart & Account) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live Cart Button */}
            <button
              onClick={() => handleNavClick('/cart')}
              className="relative p-2 sm:p-2.5 rounded-xl border border-[#D1BA9C] bg-white hover:bg-[#F5EFEB] text-[#292524] transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs"
              aria-label={`Cart with ${cart.item_count} items`}
            >
              <ShoppingBag className="w-4 h-4 text-[#9A3412]" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {cart.item_count > 0 && (
                <span className="px-1.5 py-0.2 text-[11px] font-bold bg-[#9A3412] text-white rounded-full tabular-nums">
                  {cart.item_count}
                </span>
              )}
            </button>

            {/* My Account */}
            {user ? (
              <button
                onClick={() => handleNavClick('/account')}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#F5EFEB] text-xs font-medium text-[#292524] flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#FEF3C7] text-[#9A3412] flex items-center justify-center font-bold text-[10px]">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.full_name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">My Account</span>
                <span className="inline xs:hidden sm:hidden">Sign In</span>
              </button>
            )}

            {/* Admin Portal Button */}
            {user?.role === 'admin' ? (
              <button
                onClick={() => handleNavClick('/admin')}
                className="px-3 py-2 rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                title="Open Temple Management Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Admin Portal</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('/admin')}
                className="hidden lg:flex px-2.5 py-2 rounded-xl border border-[#D1BA9C]/60 hover:bg-[#F5EFEB] text-[11px] font-medium text-[#78716C] items-center gap-1 transition-colors cursor-pointer"
                title="Management Portal"
              >
                <ShieldCheck className="w-3 h-3 text-[#78716C]" />
                <span>Admin</span>
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-[#D1BA9C] bg-white text-[#292524] hover:bg-[#F5EFEB] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7DCCE] bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === link.path ? 'bg-[#FEF3C7] text-[#9A3412] font-semibold' : 'text-[#44403C] hover:bg-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('/admin')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
          >
            🛡️ Management & Admin Portal
          </button>
          {user ? (
            <button
              onClick={() => handleNavClick('/account')}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#44403C] hover:bg-white"
            >
              My Account ({user.full_name})
            </button>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#9A3412] hover:bg-white"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};
