import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { initializeDefaultDataIfNeeded } from "./firebase";

// Core Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Page Views
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Detail from "./pages/Detail";
import OrderPage from "./pages/Order";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Contact from "./pages/Contact";

import { motion, AnimatePresence } from "motion/react";

function AnimatedRoutes({ isAdmin, onLoginAdmin, onLogoutAdmin }: { 
  isAdmin: boolean; 
  onLoginAdmin: () => void; 
  onLogoutAdmin: () => void; 
}) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        className="flex-grow min-h-[75vh]"
        id="main-viewport"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<Detail />} />
          <Route path="/order" element={<OrderPage />} />
          <Route 
            path="/admin" 
            element={
              <Admin 
                isAdmin={isAdmin} 
                onLoginAdmin={onLoginAdmin} 
                onLogoutAdmin={onLogoutAdmin} 
              />
            } 
          />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  // Simple administrative authorization session persistence
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("peaknic_admin_session") === "true";
  });

  const handleLoginAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem("peaknic_admin_session", "true");
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem("peaknic_admin_session");
  };

  // Run initial seed checks on start
  useEffect(() => {
    initializeDefaultDataIfNeeded();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#FAF9F6] selection:bg-stone-200/60 selection:text-stone-900" id="peaknic-applet">
        {/* Sticky Global Top Header */}
        <Header isAdmin={isAdmin} onLogoutAdmin={handleLogoutAdmin} />

        {/* Dynamic Route view with Motion transitions */}
        <AnimatedRoutes 
          isAdmin={isAdmin} 
          onLoginAdmin={handleLoginAdmin} 
          onLogoutAdmin={handleLogoutAdmin} 
        />

        {/* Global Boutique Footer */}
        <Footer />
      </div>
    </Router>
  );
}
