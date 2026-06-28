import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, User, LogOut, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { isAdmin, currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Event", path: "/event" },
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
              beads craft studio
            </span>
          </Link>
        </div>

        {/* Right Side: Admin Indicator + Actions */}
        <div className="flex items-center space-x-3">
          {/* User Sign status or Login trigger */}
          {currentUser ? (
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                to="/mypage"
                className={`flex items-center space-x-1.5 border rounded-full px-3.5 py-1 text-xs transition-all duration-200 ${
                  isActive("/mypage")
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "bg-stone-100/70 border-stone-200/60 text-stone-700 hover:border-stone-400"
                }`}
                id="header-user-badge"
              >
                {currentUser.role === "admin" ? (
                  <Shield className="h-3 w-3 text-amber-600" />
                ) : (
                  <User className="h-3 w-3 text-stone-500" />
                )}
                <span className="font-medium">{currentUser.name}님 마이페이지</span>
              </Link>
              <button
                onClick={logout}
                className="text-stone-400 hover:text-red-500 transition-colors pl-1"
                title="로그아웃"
                id="header-logout-btn"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs text-stone-600 hover:text-stone-900 font-medium px-2.5 py-1 transition-all"
            >
              로그인
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center space-x-1 border rounded-full px-3.5 py-1.5 text-xs transition-all duration-200 ${
                isActive("/admin")
                  ? "bg-stone-900 border-stone-900 text-white"
                  : "border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900"
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>
          )}

          {/* Mobile Menu Hamburguer Toggle */}
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

              {/* Login option on Mobile Drawer */}
              <div className="border-t border-stone-200 pt-4 mt-4 px-4 flex flex-col space-y-3">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-700 flex items-center">
                        <User className="h-3.5 w-3.5 mr-1 text-stone-500" />
                        {currentUser.name} 님 로그인 중
                      </span>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="text-xs text-red-500 underline flex items-center"
                      >
                        <span>로그아웃</span>
                      </button>
                    </div>
                    <Link
                      to="/mypage"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center rounded-lg border border-stone-300 py-2 text-xs font-semibold text-stone-700 bg-stone-50 block hover:bg-stone-100"
                    >
                      마이페이지 가기
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center rounded-lg border border-stone-300 py-2.5 text-xs font-semibold text-stone-700 bg-white block"
                  >
                    로그인 및 회원가입
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center rounded-lg bg-stone-900 text-white py-2.5 text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                    <span>관리자 대시보드</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
