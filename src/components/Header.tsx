import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, Sparkles, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  isAdmin: boolean;
  onLogoutAdmin: () => void;
}

export default function Header({ isAdmin, onLogoutAdmin }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/50 bg-[#FAF9F6]/90 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Navigation Links on Desktop */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`relative py-1 border-b-2 transition-colors duration-200 ${
                isActive(item.path)
                  ? "text-stone-900 border-stone-800"
                  : "text-stone-500 border-transparent hover:text-stone-900"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Center: Brand Logo Typeface */}
        <div className="flex flex-col items-center">
          <Link to="/" className="group flex flex-col items-center">
            {/* Elegant Arched Accented Logo Border similar to afterglow banner style */}
            <div className="relative flex flex-col items-center px-6">
              <svg
                className="absolute -top-1 left-0 w-full h-3 text-stone-300 transition-transform group-hover:scale-y-110"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path d="M0,8 Q50,0 100,8" fill="none" stroke="currentColor" strokeWidth="0.75" />
              </svg>
              <span className="font-serif text-2xl font-normal tracking-[0.25em] text-stone-900 transition-all duration-300 group-hover:tracking-[0.3em]">
                Peaknic
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.54em] text-stone-400 mt-0.5">
              emotional mood
            </span>
          </Link>
        </div>

        {/* Right Side: Admin Indicator + Actions */}
        <div className="flex items-center space-x-4">
          {isAdmin ? (
            <div className="hidden sm:flex items-center bg-stone-100/80 border border-stone-200 rounded-full px-3 py-1 text-xs text-stone-700">
              <Shield className="h-3 w-3 mr-1 text-amber-600" />
              <span className="font-medium mr-2">Admin Mode</span>
              <button
                onClick={onLogoutAdmin}
                className="hover:text-red-600 transition-colors duration-150 text-[10px] uppercase font-bold"
              >
                Logout
              </button>
            </div>
          ) : null}

          <Link
            to="/admin"
            className={`flex items-center space-x-1 border rounded-full px-3.5 py-1.5 text-xs transition-all duration-200 ${
              isActive("/admin")
                ? "bg-stone-900 border-stone-900 text-white"
                : "border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-lg p-2 text-stone-500 hover:text-stone-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full border-b border-stone-200 bg-[#FAF9F6] shadow-lg md:hidden"
          >
            <div className="space-y-1 px-4 py-4 sm:px-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-stone-100 text-stone-900"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {isAdmin && (
                <div className="border-t border-stone-200 pt-3 mt-3 flex items-center justify-between px-4">
                  <span className="text-xs text-stone-500 flex items-center font-medium">
                    <Shield className="h-3 w-3 mr-1 text-amber-600" />
                    Admin Mode Active
                  </span>
                  <button
                    onClick={() => {
                      onLogoutAdmin();
                      setIsOpen(false);
                    }}
                    className="text-xs text-red-500 underline"
                  >
                    Logout Admin
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
