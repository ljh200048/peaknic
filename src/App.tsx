import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { initializeDefaultDataIfNeeded } from "./firebase";
import { AuthProvider, useAuth } from "./context/AuthContext";

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

function AnimatedRoutes() {
  const location = useLocation();
  const { isAdmin, loginAdmin, logout } = useAuth();

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
                onLoginAdmin={() => loginAdmin("peaknic123")} 
                onLogoutAdmin={logout} 
              />
            } 
          />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  // Run initial seed checks on start
  useEffect(() => {
    initializeDefaultDataIfNeeded();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#FAF9F6] selection:bg-stone-200/60 selection:text-stone-900" id="peaknic-applet">
          {/* Sticky Global Top Header */}
          <Header />

          {/* Dynamic Route view with Motion transitions */}
          <AnimatedRoutes />

          {/* Global Boutique Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
