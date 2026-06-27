import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { Product, Order } from "../types";
import { 
  User, Mail, Calendar, ShoppingCart, Heart, ShoppingBag, 
  Trash2, LogOut, Edit2, Check, Camera, ArrowRight, Gift, PackageCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MyPage() {
  const { currentUser, logout, updateProfile, removeFromWishlist, removeFromCart } = useAuth();
  const navigate = useNavigate();
  
  // Local UI States
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Available beautiful profile avatars
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop"
  ];

  // Protect route - Redirect to Login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    } else {
      setNewName(currentUser.name);
      setSelectedAvatar(currentUser.profileImage);
    }
  }, [currentUser, navigate]);

  // Load products to resolve wishlist & cart details
  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const prodList: Product[] = [];
        querySnapshot.forEach((doc) => {
          prodList.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(prodList);
      } catch (err) {
        console.error("Error fetching products in MyPage:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  if (!currentUser) {
    return null;
  }

  // Filter wishlist & cart products
  const wishlistProducts = products.filter(p => currentUser.wishlist?.includes(p.id));
  
  const cartItemsDetailed = (currentUser.cart || []).map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter(item => item.product !== undefined);

  // Handle Profile Name Update
  const handleSaveName = async () => {
    if (!newName.trim()) return;
    try {
      await updateProfile({ name: newName.trim() });
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err);
    }
  };

  // Handle Profile Avatar Update
  const handleSelectAvatar = async (avatarUrl: string) => {
    try {
      await updateProfile({ profileImage: avatarUrl });
      setSelectedAvatar(avatarUrl);
      setShowAvatarSelector(false);
    } catch (err) {
      console.error("Failed to update avatar:", err);
    }
  };

  const handleCheckoutCartItem = (item: any) => {
    const params = new URLSearchParams();
    params.set("productId", item.productId);
    params.set("productName", item.product.name);
    params.set("price", item.product.price.toString());
    if (item.size) params.set("size", item.size);
    if (item.color) params.set("color", item.color);
    
    navigate(`/order?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-stone-900" id="mypage-container">
      {/* Page Title Header */}
      <div className="border-b border-stone-200 pb-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-stone-900">My Atelier Page</h1>
          <p className="text-xs font-mono tracking-widest uppercase text-stone-400 mt-1">
            manage your selections, wishlist and artisan orders
          </p>
        </div>
        
        <button
          onClick={logout}
          className="mt-4 sm:mt-0 flex items-center space-x-1.5 border border-stone-200 hover:border-red-200 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-full px-4 py-1.5 text-xs transition-all duration-300"
          id="btn-logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>로그아웃</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: Profile & Account Information Card */}
        <div className="lg:col-span-1 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          {/* Subtle light overlay decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FAF9F6] rounded-bl-full opacity-60 pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            {/* Avatar Profile frame */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-stone-100 shadow-inner bg-stone-50">
                <img 
                  src={selectedAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                className="absolute bottom-0 right-0 bg-stone-900 text-white rounded-full p-1.5 hover:bg-stone-800 transition-colors shadow-md"
                title="프로필 이미지 변경"
                id="btn-change-avatar"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Avatar Selector Panel */}
            <AnimatePresence>
              {showAvatarSelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full border-t border-dashed border-stone-200 pt-3 flex flex-wrap justify-center gap-2"
                >
                  {avatars.map((avUrl, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectAvatar(avUrl)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        selectedAvatar === avUrl ? "border-stone-900 scale-105" : "border-transparent hover:border-stone-300"
                      }`}
                    >
                      <img src={avUrl} alt="avatar option" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name editor */}
            <div className="w-full pt-2">
              {isEditingName ? (
                <div className="flex items-center justify-center space-x-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border border-stone-300 rounded-lg px-3 py-1 text-xs w-2/3 focus:outline-hidden focus:border-stone-800 bg-stone-50"
                    id="input-edit-name"
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-stone-900 text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                    id="btn-save-name"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-1.5">
                  <h3 className="font-serif text-xl font-medium text-stone-800">{currentUser.name}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-stone-400 hover:text-stone-900 transition-colors"
                    id="btn-edit-name"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-600 bg-amber-50 rounded-full px-2.5 py-0.5 mt-2 inline-block font-semibold">
                {currentUser.role === "admin" ? "Artisan Admin" : "Boutique Member"}
              </span>
            </div>

            {/* General Info list */}
            <div className="w-full border-t border-stone-100 pt-4 text-left text-xs space-y-3 text-stone-600">
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-stone-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                <span>가입일: {currentUser.createdAt || "최근 가입"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Bento Layout for Cart, Wishlist, Order History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: 장바구니 (Cart) */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-lg font-light text-stone-950 flex items-center mb-4 tracking-wide border-b border-stone-100 pb-3">
              <ShoppingCart className="h-4 w-4 text-stone-500 mr-2" />
              <span>나의 장바구니</span>
              <span className="text-xs font-sans text-stone-400 font-normal ml-2">({cartItemsDetailed.length}개 상품)</span>
            </h2>

            {cartItemsDetailed.length === 0 ? (
              <div className="text-center py-10 bg-stone-50/50 rounded-xl border border-dashed border-stone-200/50">
                <p className="text-stone-400 text-xs">장바구니에 담긴 비즈 공예품이 없습니다.</p>
                <Link to="/shop" className="text-xs text-stone-800 underline font-medium mt-2 inline-block hover:text-stone-900">
                  아름다운 컬렉션 둘러보기 <ArrowRight className="h-3 w-3 inline ml-0.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItemsDetailed.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-50 border border-stone-150 shrink-0">
                        <img 
                          src={item.product?.imageUrl} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <Link to={`/product/${item.productId}`} className="text-xs font-semibold hover:underline text-stone-900 line-clamp-1">
                          {item.product?.name}
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.size && (
                            <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm">
                              사이즈: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm">
                              컬러: {item.color}
                            </span>
                          )}
                          <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-sm font-semibold">
                            수량: {item.quantity}개
                          </span>
                        </div>
                        <span className="text-xs font-serif font-medium text-stone-950 mt-1 block">
                          {(item.product?.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCheckoutCartItem(item)}
                        className="bg-stone-900 text-white rounded-full px-3.5 py-1.5 text-[10px] font-medium hover:bg-stone-800 transition-colors shadow-sm"
                      >
                        주문하기
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-stone-350 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-stone-50"
                        title="장바구니에서 제거"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: 찜한 상품 (Wishlist) */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-lg font-light text-stone-955 flex items-center mb-4 tracking-wide border-b border-stone-100 pb-3">
              <Heart className="h-4 w-4 text-red-500 mr-2 fill-red-500" />
              <span>나의 찜한 상품</span>
              <span className="text-xs font-sans text-stone-400 font-normal ml-2">({wishlistProducts.length}개 상품)</span>
            </h2>

            {wishlistProducts.length === 0 ? (
              <div className="text-center py-10 bg-stone-50/50 rounded-xl border border-dashed border-stone-200/50">
                <p className="text-stone-400 text-xs">찜한 비즈 액세서리가 아직 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {wishlistProducts.map((prod) => (
                  <div key={prod.id} className="group relative border border-stone-100 rounded-xl overflow-hidden bg-[#FAF9F6]/45 hover:shadow-md transition-all duration-300">
                    <div className="aspect-square w-full overflow-hidden bg-stone-50 border-b border-stone-100 relative">
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => removeFromWishlist(prod.id)}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-md rounded-full p-1.5 text-red-500 shadow-xs hover:bg-red-50 transition-colors"
                        title="찜 해제"
                      >
                        <Heart className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                    <div className="p-3">
                      <Link to={`/product/${prod.id}`} className="text-xs font-semibold text-stone-900 block truncate group-hover:underline">
                        {prod.name}
                      </Link>
                      <span className="text-xs font-serif font-medium text-stone-950 mt-1 block">
                        {prod.price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: 주문 내역 (Order History) */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-lg font-light text-stone-955 flex items-center mb-4 tracking-wide border-b border-stone-100 pb-3">
              <ShoppingBag className="h-4 w-4 text-stone-550 mr-2" />
              <span>나의 주문 내역</span>
              <span className="text-xs font-sans text-stone-400 font-normal ml-2">({(currentUser.orders || []).length}건)</span>
            </h2>

            {(!currentUser.orders || currentUser.orders.length === 0) ? (
              <div className="text-center py-10 bg-stone-50/50 rounded-xl border border-dashed border-stone-200/50">
                <p className="text-stone-400 text-xs">주문하신 내역이 존재하지 않습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentUser.orders.map((order: any, idx: number) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200/50 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-stone-200/40 pb-2">
                      <span className="font-mono text-[10px] text-stone-450 uppercase">ORDER ID: {order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.status === "배송완료" ? "bg-emerald-100 text-emerald-800" :
                        order.status === "취소" ? "bg-red-100 text-red-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {order.status || "접수"}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-450">상품명</span>
                        <span className="font-semibold text-stone-900">{order.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-450">결제 금액</span>
                        <span className="font-serif font-medium text-stone-900">{(order.price).toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-450">수령인</span>
                        <span className="text-stone-700">{order.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-450">주소</span>
                        <span className="text-stone-700 truncate max-w-[240px]">{order.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-450">주문일</span>
                        <span className="text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
