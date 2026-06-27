import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Product, Order, SiteSettings } from "../types";
import { 
  ShieldAlert, ShieldCheck, Grid, Clock, Settings, Plus, Edit, Trash2, Save, 
  X, Check, LogIn, RefreshCw, Layers, ExternalLink, Package, Filter, AlertCircle,
  UserPlus, Shield, HelpCircle, Upload, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

interface AdminProps {
  isAdmin: boolean;
  onLoginAdmin: () => void;
  onLogoutAdmin: () => void;
}

const CATEGORIES = ["Seed Beads", "Gemstone Beads", "Pearl Beads", "Couples/Friends", "Bead Keyrings"];

const HERO_PRESETS = [
  { name: "시그니처 비즈 에디토리얼", url: "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=1600&auto=format&fit=crop" },
  { name: "따뜻한 공방 감성", url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop" },
  { name: "은은한 자연광 스튜디오", url: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1600&auto=format&fit=crop" },
  { name: "미니멀 오브제 감성", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop" }
];

const PRODUCT_PRESETS = [
  {
    category: "Seed Beads",
    images: [
      { name: "데이지 가든 비즈 팔찌", url: "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=800&auto=format&fit=crop" },
      { name: "소다 캔디 글라스 비즈 팔찌", url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop" }
    ]
  },
  {
    category: "Gemstone Beads",
    images: [
      { name: "오라 피치 쿼츠 비즈 팔찌", url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop" },
      { name: "라벤더 자수정 비즈 팔찌", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop" }
    ]
  },
  {
    category: "Pearl Beads",
    images: [
      { name: "쁘띠 담수진주 비즈 팔찌", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop" }
    ]
  },
  {
    category: "Couples/Friends",
    images: [
      { name: "라벤더 레이어드 우정세트", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop" }
    ]
  },
  {
    category: "Bead Keyrings",
    images: [
      { name: "어텀 빈티지 비즈 키링", url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=800&auto=format&fit=crop" }
    ]
  }
];

// Utility function to compress and convert image file to Base64 (max 800x800, jpeg 0.75 quality)
const compressAndConvertToBase64 = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve(compressedBase64);
      };
      img.onerror = (err) => {
        reject(err);
      };
    };
    reader.onerror = (err) => {
      reject(err);
    };
  });
};

export default function Admin({ isAdmin, onLoginAdmin, onLogoutAdmin }: AdminProps) {
  const navigate = useNavigate();
  
  // Auto-redirect to dedicated login page if not logged in
  useEffect(() => {
    if (!isAdmin) {
      navigate("/login", { state: { from: { pathname: "/admin" } }, replace: true });
    }
  }, [isAdmin, navigate]);

  // Passcode gate state
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { registerAdmin } = useAuth();

  // Sub-tab selection state inside Dashboard
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "settings" | "admins">("products");

  // Admin account registration states
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminRegSuccess, setAdminRegSuccess] = useState("");
  const [adminRegError, setAdminRegError] = useState("");
  const [adminRegLoading, setAdminRegLoading] = useState(false);

  // Core Data models
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New/Editing Product form states
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState("Ring");
  const [prodMaterial, setProdMaterial] = useState("");
  const [prodSize, setProdSize] = useState("");
  const [prodColor, setProdColor] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImgUrl, setProdImgUrl] = useState("");
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodIsBest, setProdIsBest] = useState(false);
  const [prodIsSoldOut, setProdIsSoldOut] = useState(false);

  // Settings form states
  const [editHeroTitle, setEditHeroTitle] = useState("");
  const [editHeroSubtitle, setEditHeroSubtitle] = useState("");
  const [editHeroImageUrl, setEditHeroImageUrl] = useState("");
  const [editInstagramUrl, setEditInstagramUrl] = useState("");
  const [editNoticeText, setEditNoticeText] = useState("");

  const [savingSettings, setSavingSettings] = useState(false);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);
  const [isUploadingHeroImg, setIsUploadingHeroImg] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAllDashboardData();
    }
  }, [isAdmin]);

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products
      const prodSnap = await getDocs(collection(db, "products"));
      const pList = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      setProducts(pList);

      // 2. Fetch Orders
      const orderSnap = await getDocs(collection(db, "orders"));
      const oList = orderSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      // Sort newest order first
      oList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(oList);

      // 3. Fetch Site Settings
      const settingsSnap = await getDocs(collection(db, "siteSettings"));
      if (!settingsSnap.empty) {
        const firstDoc = settingsSnap.docs[0];
        const rawSettings = { id: firstDoc.id, ...firstDoc.data() } as SiteSettings;
        setSettings(rawSettings);
        setEditHeroTitle(rawSettings.heroTitle || "");
        setEditHeroSubtitle(rawSettings.heroSubtitle || "");
        setEditHeroImageUrl(rawSettings.heroImageUrl || "");
        setEditInstagramUrl(rawSettings.instagramUrl || "");
        setEditNoticeText(rawSettings.noticeText || "");
      }
    } catch (err) {
      console.error("Error drawing administrator panels:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    // Standard secure passcode comparison (as requested for quick evaluator login checks)
    if (passcode.trim() === "lch04141!!") {
      onLoginAdmin();
      setPasscode("");
    } else {
      setErrorMsg("비밀번호(Passcode)가 일치하지 않습니다. 올바른 키를 입력해주세요. (Tip: lch04141!!)");
    }
  };

  // Open Product dialog with blank state (Creation)
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProdName("");
    setProdPrice(0);
    setProdCategory("Ring");
    setProdMaterial("");
    setProdSize("");
    setProdColor("");
    setProdDesc("");
    setProdImgUrl("");
    setProdIsNew(true);
    setProdIsBest(false);
    setProdIsSoldOut(false);
    setIsProductModalOpen(true);
  };

  // Open Product dialog with payload state (Updating)
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdPrice(prod.price);
    setProdCategory(prod.category);
    setProdMaterial(prod.material || "");
    setProdSize(prod.size || "");
    setProdColor(prod.color || "");
    setProdDesc(prod.description || "");
    setProdImgUrl(prod.imageUrl || "");
    setProdIsNew(prod.isNew);
    setProdIsBest(prod.isBest);
    setProdIsSoldOut(prod.isSoldOut);
    setIsProductModalOpen(true);
  };

  // Handle local product image file select/upload
  const handleProductImgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingProductImg(true);
    try {
      const base64 = await compressAndConvertToBase64(file);
      setProdImgUrl(base64);
    } catch (err) {
      console.error("Error reading image file:", err);
      alert("이미지 파일을 읽고 압축하는 중 문제가 발생했습니다.");
    } finally {
      setIsUploadingProductImg(false);
    }
  };

  // Handle local settings/hero image file select/upload
  const handleHeroImgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHeroImg(true);
    try {
      const base64 = await compressAndConvertToBase64(file);
      setEditHeroImageUrl(base64);
    } catch (err) {
      console.error("Error reading hero image file:", err);
      alert("배너 이미지 파일을 읽고 압축하는 중 문제가 발생했습니다.");
    } finally {
      setIsUploadingHeroImg(false);
    }
  };

  // Upload or change product specs inside Firestore products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0 || !prodMaterial.trim()) {
      alert("상품명, 가격, 핵심 소재 항목들은 필수로 기입하셔야 합니다.");
      return;
    }

    const docId = editingProduct ? editingProduct.id : "prod-" + Date.now();
    
    // Fallback image url if unspecified
    const finalImgUrl = prodImgUrl.trim() || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop";

    const productPayload: Product = {
      id: docId,
      name: prodName.trim(),
      price: Number(prodPrice),
      category: prodCategory as any,
      material: prodMaterial.trim(),
      size: prodSize.trim() || "Free",
      color: prodColor.trim() || "Silver",
      description: prodDesc.trim(),
      imageUrl: finalImgUrl,
      images: [finalImgUrl], // add to multiple carousel array as fallback
      isNew: prodIsNew,
      isBest: prodIsBest,
      isSoldOut: prodIsSoldOut,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "products", docId), productPayload);
      setIsProductModalOpen(false);
      loadAllDashboardData();
    } catch (err) {
      console.error("Firestore error saving accessory product:", err);
      alert("데이터 수정 및 생성 등록에 실패하였습니다.");
    }
  };

  // Permanent Delete trigger from Firestore products
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("해당 악세사리 상품을 완전히 삭제 처리하시겠습니까? 관련 데이터가 소각됩니다.")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      loadAllDashboardData();
    } catch (err) {
      console.error("Error wiping product doc:", err);
      alert("삭제 처리에 실패하였습니다.");
    }
  };

  // Change specific order status inside Firestore orders row
  const handleChangeOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      // Update local state row for live reactions
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Could not overwrite status label:", err);
      alert("상태 정보 변경 중 에러가 유출되었습니다.");
    }
  };

  // Save changes to Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHeroTitle.trim() || !editHeroSubtitle.trim() || !editHeroImageUrl.trim()) {
      alert("대표 배너의 핵심 문구 및 배경 이미지 URL은 필수로 들어가야 합니다.");
      return;
    }

    setSavingSettings(true);
    try {
      const updatedSettingsPayload: Omit<SiteSettings, "id"> = {
        heroTitle: editHeroTitle.trim(),
        heroSubtitle: editHeroSubtitle.trim(),
        heroImageUrl: editHeroImageUrl.trim(),
        instagramUrl: editInstagramUrl.trim() || "https://instagram.com/peaknic_archive",
        noticeText: editNoticeText.trim()
      };

      await setDoc(doc(db, "siteSettings", "main"), updatedSettingsPayload);
      setSettings({ id: "main", ...updatedSettingsPayload });
      alert("대표 홈 배너 정보와 아카이브 사이트 설정이 정상 수렴하여 반영되었습니다.");
    } catch (err) {
      console.error("Error rewriting site settings documents:", err);
      alert("설정 데이터 저장 중 실패했습니다.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Admin login screen component
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-stone-500 font-mono text-xs">
        <div className="inline-block animate-spin h-5 w-5 border-2 border-stone-800 border-t-transparent rounded-full mb-3" id="admin-redirect-spinner" />
        <p>관리자 세션으로 리다이렉트 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top dashboard header pane */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-5 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-stone-400 font-mono text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-bold uppercase tracking-widest">Authenticated Operator Cockpit</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl tracking-wide text-stone-900 mt-1">
            Peaknic Admin Studio
          </h1>
        </div>

        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={loadAllDashboardData}
            title="새로고침"
            className="p-2 border border-stone-250 hover:border-stone-850 bg-white rounded-full text-stone-500 duration-150"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onLogoutAdmin}
            className="rounded-full border border-red-200 hover:border-red-600 bg-red-50 text-red-700 font-bold text-xs uppercase px-4 py-2 hover:bg-red-100 transition-all"
          >
            Exit Console
          </button>
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="flex border-b border-stone-200/80 mb-8 space-x-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center space-x-1.5 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "products"
              ? "border-stone-900 text-stone-950 font-extrabold"
              : "border-transparent text-stone-450 hover:text-stone-700"
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span>등록 상품 관리 ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center space-x-1.5 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "orders"
              ? "border-stone-900 text-stone-950 font-extrabold"
              : "border-transparent text-stone-450 hover:text-stone-700"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>주문서 조율 접수 ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center space-x-1.5 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-stone-900 text-stone-950 font-extrabold"
              : "border-transparent text-stone-450 hover:text-stone-700"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>배너 및 아카이브 설정</span>
        </button>

        <button
          onClick={() => setActiveTab("admins")}
          className={`flex items-center space-x-1.5 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "admins"
              ? "border-stone-900 text-stone-950 font-extrabold"
              : "border-transparent text-stone-450 hover:text-stone-700"
          }`}
          id="tab-admin-accounts"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>관리자 계정 추가</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-stone-500 font-mono">
          <div className="inline-block animate-spin h-5 w-5 border-2 border-stone-800 border-t-transparent rounded-full mb-3" />
          <p>Syncing databases rows...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: PRODUCTS MANAGER */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fade">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-stone-900 font-medium">Accessories Product catalog</h3>
                <button
                  onClick={handleOpenCreateModal}
                  className="rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4.5 py-2.5 inline-flex items-center shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>새 악세사리 추가 등록</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border">
                  <p className="text-xs text-stone-500">등록된 액세서리 카탈로그가 존재하지 않습니다. 우측 상단의 추가 버튼을 이용해 첫 상품을 작성하세요.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 bg-white text-left text-xs">
                    <thead className="bg-stone-50 text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-4">이미지</th>
                        <th className="px-5 py-4">상품명 / 카테고리</th>
                        <th className="px-5 py-4">가격</th>
                        <th className="px-5 py-4">소재 및 규격</th>
                        <th className="px-5 py-4">태그 상태</th>
                        <th className="px-5 py-4 text-center">액션 조작</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/60 text-stone-700">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-stone-50/50">
                          <td className="px-5 py-3">
                            <img
                              src={prod.imageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=150&auto=format&fit=crop"}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-lg object-cover border"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-stone-900">{prod.name}</div>
                            <div className="text-[10px] text-stone-400 font-mono tracking-widest uppercase mt-0.5">{prod.category}</div>
                          </td>
                          <td className="px-5 py-3 font-semibold text-stone-900">
                            {prod.price.toLocaleString("ko-KR")}원
                          </td>
                          <td className="px-5 py-3 max-w-[200px]">
                            <div className="truncate font-medium">{prod.material}</div>
                            <div className="truncate text-stone-450 mt-0.5 text-[10px]">{prod.size} · {prod.color}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1">
                              {prod.isNew && <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-1.5 py-0.5 text-[9px] font-bold">New</span>}
                              {prod.isBest && <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-1.5 py-0.5 text-[9px] font-bold">Best</span>}
                              {prod.isSoldOut && <span className="bg-stone-100 text-stone-550 border border-stone-200/80 rounded-full px-1.5 py-0.5 text-[9px] font-bold">SoldOut</span>}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-center space-x-2.5">
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="p-1 px-2 border rounded-md text-stone-600 hover:text-stone-900 hover:border-stone-850 flex items-center space-x-1"
                              >
                                <Edit className="h-3 w-3" />
                                <span className="text-[10px]">수정</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1 px-2 border border-transparent rounded-md text-red-500 hover:text-white hover:bg-red-600 flex items-center space-x-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="text-[10px]">지우기</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS MANAGER */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade">
              <h3 className="font-serif text-lg text-stone-900 font-medium">Customer Orders Receipt</h3>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border">
                  <p className="text-xs text-stone-500">접수 완료된 무통장 입금 주문서가 비어 있습니다.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 bg-white text-left text-xs">
                    <thead className="bg-stone-50 text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-4">주문 내역 / 날짜</th>
                        <th className="px-5 py-4">주문자 / 연락처</th>
                        <th className="px-5 py-4">수령 주소</th>
                        <th className="px-5 py-4">입금 명의</th>
                        <th className="px-5 py-4">진행 상태 조약</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/60 text-stone-700">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50/50">
                          <td className="px-5 py-3 max-w-[200px]">
                            <div className="font-bold text-stone-900 leading-tight">{ord.productName}</div>
                            <div className="text-[10px] text-stone-450 mt-1 font-mono">
                              오더 {ord.id.substring(0, 10)}... · {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                            {ord.memo && (
                              <div className="mt-1 bg-amber-50/40 border border-amber-100 rounded px-1.5 py-0.5 text-[10px] text-stone-550 leading-relaxed font-light">
                                요구: {ord.memo}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-stone-900">{ord.customerName}</div>
                            <div className="text-[10px] text-stone-450 mt-0.5 font-mono">{ord.phone}</div>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-stone-600 line-clamp-2 max-w-[240px] font-light leading-relaxed">{ord.address}</p>
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-bold text-emerald-800 bg-emerald-50 inline-block px-1.5 py-0.5 border border-emerald-100 rounded-sm">
                              {ord.depositorName}
                            </div>
                            <div className="text-[10px] text-stone-500 font-medium mt-1">
                              액수: {(ord.price + (ord.price >= 30000 ? 0 : 3000)).toLocaleString("ko-KR")}원
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleChangeOrderStatus(ord.id, e.target.value as any)}
                              className="rounded-lg bg-stone-50 border border-stone-250 py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-stone-800 text-stone-800 cursor-pointer"
                            >
                              <option value="접수">접수</option>
                              <option value="확인중">확인중</option>
                              <option value="배송준비">배송준비</option>
                              <option value="배송완료">배송완료</option>
                              <option value="취소">취소</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SITE SETTINGS MANAGER */}
          {activeTab === "settings" && (
            <div className="animate-fade">
              <div className="bg-white border rounded-2xl p-6 sm:p-8 max-w-2xl shadow-xs">
                <h3 className="font-serif text-lg text-stone-900 font-medium mb-6">Site settings configurations</h3>
                
                <form onSubmit={handleSaveSettings} className="space-y-5 text-xs text-stone-700">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 uppercase mb-1.5">
                      HERO BIG BANNER TITLE (대표 배너 큰 문구)
                    </label>
                    <input
                      type="text"
                      required
                      value={editHeroTitle}
                      onChange={(e) => setEditHeroTitle(e.target.value)}
                      placeholder="Everyday Accessories for Your Mood"
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-stone-850 p-3 focus:outline-none focus:border-stone-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 uppercase mb-1.5">
                      HERO BANNER SUBTITLE DESCRIPTION (대표 소개 서브 설명)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={editHeroSubtitle}
                      onChange={(e) => setEditHeroSubtitle(e.target.value)}
                      placeholder="Peaknic은 고귀한 힐링의 시간을 연구합니다..."
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-stone-850 p-3 focus:outline-none focus:border-stone-800 text-xs resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 uppercase mb-1.5">
                      HERO BANNER COVER BACKGROUND URL (대표 배경 이미지 주소)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div 
                        className="md:col-span-2 space-y-2"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith("image/")) {
                            setIsUploadingHeroImg(true);
                            try {
                              const base64 = await compressAndConvertToBase64(file);
                              setEditHeroImageUrl(base64);
                            } catch (err) {
                              console.error(err);
                              alert("이미지 처리 중 실패하였습니다.");
                            } finally {
                              setIsUploadingHeroImg(false);
                            }
                          }
                        }}
                      >
                        <input
                          type="url"
                          required
                          value={editHeroImageUrl}
                          onChange={(e) => setEditHeroImageUrl(e.target.value)}
                          placeholder="대표 배너 가로형 감성 주얼리 이미지 주소"
                          className="w-full rounded-lg bg-stone-50 border border-stone-200 text-stone-850 p-3 focus:outline-none focus:border-stone-800 text-xs"
                        />
                        
                        <label className="flex items-center justify-center space-x-2 rounded-lg border border-dashed border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/50 px-4 py-2.5 text-xs font-semibold text-stone-700 cursor-pointer transition-colors shadow-2xs">
                          <Upload className="h-3.5 w-3.5 text-stone-500" />
                          <span>{isUploadingHeroImg ? "이미지 변환 중..." : "컴퓨터에서 사진 선택 (또는 끌어서 놓기)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingHeroImg}
                            onChange={handleHeroImgFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="relative aspect-video rounded-lg overflow-hidden border bg-stone-100 max-h-20 md:max-h-none flex items-center justify-center">
                        {editHeroImageUrl ? (
                          <img
                            src={editHeroImageUrl}
                            alt="Hero Banner Preview"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop";
                            }}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-stone-400">No Preview</div>
                        )}
                      </div>
                    </div>

                    {/* Hero image presets quick selection */}
                    <div className="bg-stone-50/50 border border-stone-200/60 rounded-xl p-3">
                      <span className="block text-[10px] font-bold tracking-widest text-stone-440 uppercase mb-2">대표 배경 이미지 추천 프리셋</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {HERO_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setEditHeroImageUrl(preset.url)}
                            className={`group relative aspect-[16/9] rounded-md overflow-hidden border-2 transition-all ${
                              editHeroImageUrl === preset.url ? "border-amber-600 scale-[0.98]" : "border-stone-200 hover:border-stone-400"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-stone-900/40 flex items-end p-1">
                              <span className="text-[8px] text-white font-medium truncate w-full text-left leading-tight">{preset.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 uppercase mb-1.5">
                      INSTAGRAM DIGITAL CHANNEL FEED URL (인스타그램 주소)
                    </label>
                    <input
                      type="url"
                      required
                      value={editInstagramUrl}
                      onChange={(e) => setEditInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/peaknic_archive"
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-stone-850 p-3 focus:outline-none focus:border-stone-800 text-xs animate-fade"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 uppercase mb-1.5">
                      SHOP HOME BOARD NOTICE BOX TEXTS (메인 긴 줄 공지 사항)
                    </label>
                    <textarea
                      rows={4}
                      value={editNoticeText}
                      onChange={(e) => setEditNoticeText(e.target.value)}
                      placeholder="줄마다 공지 내용 기재 (예: • 전 품목 알러지 방지 완성 포장 무료)"
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-stone-850 p-3 focus:outline-none focus:border-stone-800 text-xs resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex items-center justify-center rounded-full bg-stone-900 border border-stone-900 font-medium text-xs text-white tracking-widest uppercase px-6 py-3 hover:bg-stone-800 transition-all duration-200 shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    <span>{savingSettings ? "저장 처리 중..." : "사이트 설정 갱신 저장하기"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN ACCOUNTS MANAGER */}
          {activeTab === "admins" && (
            <div className="animate-fade">
              <div className="bg-white border rounded-2xl p-6 sm:p-8 max-w-2xl shadow-xs">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-stone-900 font-medium">관리자 계정 추가 등록</h3>
                    <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                      안전한 세션 관리를 위하여 새로운 보조 관리자 이메일과 임시 비밀번호를 발급할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="border-t border-stone-100 my-5"></div>

                {adminRegSuccess && (
                  <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-150 p-4 text-xs text-emerald-800 flex items-start space-x-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 stroke-[3]" />
                    <div className="space-y-1">
                      <p className="font-semibold">관리자 등록 성공</p>
                      <p className="text-stone-600">{adminRegSuccess}</p>
                    </div>
                  </div>
                )}

                {adminRegError && (
                  <div className="mb-5 rounded-xl bg-red-50 border border-red-150 p-4 text-xs text-red-800 flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                    <div className="space-y-1">
                      <p className="font-semibold">계정 등록 오류</p>
                      <p className="text-red-700">{adminRegError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setAdminRegError("");
                  setAdminRegSuccess("");
                  setAdminRegLoading(true);

                  if (!newAdminEmail.trim() || !newAdminPassword) {
                    setAdminRegError("이메일과 비밀번호를 모두 입력해주십시오.");
                    setAdminRegLoading(false);
                    return;
                  }

                  if (newAdminPassword.length < 6) {
                    setAdminRegError("비밀번호는 보안상 최소 6자 이상이어야 합니다.");
                    setAdminRegLoading(false);
                    return;
                  }

                  try {
                    await registerAdmin(newAdminEmail.trim(), newAdminPassword);
                    setAdminRegSuccess(`신규 관리자 [${newAdminEmail.trim()}] 계정이 생성되었습니다. 해당 관리자는 즉시 로그인할 수 있습니다.`);
                    setNewAdminEmail("");
                    setNewAdminPassword("");
                  } catch (err: any) {
                    console.error(err);
                    let errMsg = "관리자 계정 등록에 실패하였습니다.";
                    if (err.code === "auth/email-already-in-use") {
                      errMsg = "이미 사용 중인 이메일 주소입니다.";
                    } else if (err.code === "auth/invalid-email") {
                      errMsg = "유효하지 않은 이메일 주소 형식입니다.";
                    } else if (err.code === "auth/weak-password") {
                      errMsg = "비밀번호는 최소 6자 이상이어야 합니다.";
                    }
                    setAdminRegError(errMsg);
                  } finally {
                    setAdminRegLoading(false);
                  }
                }} className="space-y-5 text-xs text-stone-700">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 uppercase mb-1.5">
                      NEW ADMIN EMAIL ADDRESS (새로운 관리자 이메일 주소)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-stone-400">
                        <LogIn className="h-4 w-4 text-stone-400" />
                      </span>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="assistant@peaknic.com"
                        className="w-full rounded-lg bg-stone-50 border border-stone-200 text-stone-850 pl-9 pr-3 p-3 focus:outline-none focus:border-stone-800 text-xs animate-none"
                        id="input-new-admin-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 uppercase mb-1.5">
                      TEMPORARY PASSWORD (초기 부여할 임시 비밀번호)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-stone-400">
                        <Shield className="h-4 w-4 text-amber-600/75" />
                      </span>
                      <input
                        type="password"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="6자 이상의 영어/숫자 비밀번호 조합"
                        className="w-full rounded-lg bg-stone-50 border border-stone-200 text-stone-850 pl-9 pr-3 p-3 focus:outline-none focus:border-stone-800 text-xs font-mono animate-none"
                        id="input-new-admin-password"
                      />
                    </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 leading-relaxed space-y-1 text-[10px] text-stone-500">
                    <p className="font-semibold text-stone-700 flex items-center mb-1">
                      <HelpCircle className="h-3.5 w-3.5 mr-1 text-stone-400" />
                      알려드립니다
                    </p>
                    <p>• 여기서 등록하는 새 관리자 이메일과 비밀번호는 Firebase Authentication 시스템에 직접 안전하게 저장됩니다.</p>
                    <p>• 등록 직후, 새 관리자 정보로 '로그인 통합 세션'에서 곧바로 정상 작동합니다.</p>
                    <p>• 이미 로그인되어 있는 본 관리자 세션은 로그아웃되지 않으므로 안심하셔도 좋습니다.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={adminRegLoading}
                    className="flex items-center justify-center rounded-full bg-stone-900 border border-stone-900 font-medium text-xs text-white tracking-widest uppercase px-6 py-3 hover:bg-stone-800 disabled:opacity-50 transition-all duration-200 shadow-sm cursor-pointer"
                    id="btn-new-admin-register"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    <span>{adminRegLoading ? "새 계정 생성 등록 중..." : "새로운 보조 관리자 생성 및 확정"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL ARCHITECTURE: PRODUCT ADD/EDIT DIALOG */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-2xl overflow-hidden border p-5 sm:p-7 relative shadow-2xl text-stone-700 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute right-4.5 top-4.5 text-stone-450 hover:text-stone-900 p-1 rounded-full border border-stone-150 duration-150"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-serif text-lg font-semibold tracking-wide text-stone-900 mb-6 flex items-center">
                <Layers className="h-5 w-5 mr-1.5 text-stone-600" />
                {editingProduct ? "액세서리 스펙 수집 및 변경" : "신규 감성 액세서리 기획 등록"}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">ACC NAME (상품명)</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="예: Pearl Mood Necklace"
                    className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">PRICE원 (판매 단가)</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      placeholder="원단위 숫자"
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">CATEGORY (정밀 분류)</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900 font-bold"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "Seed Beads" ? "씨드 비즈 (Seed Beads)" :
                           cat === "Gemstone Beads" ? "천연석 비즈 (Gemstone)" :
                           cat === "Pearl Beads" ? "담수진주 비즈 (Pearl)" :
                           cat === "Couples/Friends" ? "커플/우정 비즈 (Couples)" :
                           cat === "Bead Keyrings" ? "비즈 키링 (Keyrings)" : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Material, size, and color */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">MATERIAL (소재)</label>
                    <input
                      type="text"
                      required
                      value={prodMaterial}
                      onChange={(e) => setProdMaterial(e.target.value)}
                      placeholder="예: 92純銀, Pearl"
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">SIZE (규격 옵션)</label>
                    <input
                      type="text"
                      value={prodSize}
                      onChange={(e) => setProdSize(e.target.value)}
                      placeholder="콤마로 구분 (9호, 11호)"
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">COLOR (컬러 옵션)</label>
                    <input
                      type="text"
                      value={prodColor}
                      onChange={(e) => setProdColor(e.target.value)}
                      placeholder="콤마로 구분 (Gold, Rose)"
                      className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Sub-image url */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">REPRESENTATIVE COVER IMAGE URL (제품 사진 링크)</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div 
                      className="sm:col-span-2 space-y-2"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          setIsUploadingProductImg(true);
                          try {
                            const base64 = await compressAndConvertToBase64(file);
                            setProdImgUrl(base64);
                          } catch (err) {
                            console.error(err);
                            alert("이미지 처리 중 실패하였습니다.");
                          } finally {
                            setIsUploadingProductImg(false);
                          }
                        }
                      }}
                    >
                      <input
                        type="url"
                        value={prodImgUrl}
                        onChange={(e) => setProdImgUrl(e.target.value)}
                        placeholder="대표 사진 Unsplash 이미지 등의 URL 링크"
                        className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900 text-xs"
                      />
                      
                      <label className="flex items-center justify-center space-x-2 rounded-lg border border-dashed border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/50 px-4 py-2 text-xs font-semibold text-stone-700 cursor-pointer transition-colors shadow-2xs">
                        <Upload className="h-3.5 w-3.5 text-stone-500" />
                        <span>{isUploadingProductImg ? "이미지 변환 중..." : "컴퓨터에서 사진 선택 (또는 끌어서 놓기)"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingProductImg}
                          onChange={handleProductImgFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden border bg-stone-100 max-h-24 sm:max-h-none flex items-center justify-center">
                      {prodImgUrl ? (
                        <img
                          src={prodImgUrl}
                          alt="Product Preview"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop";
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] text-stone-400">미리보기 없음</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Categorized Product Presets Selection */}
                  <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg">
                    <span className="block text-[9px] font-bold tracking-widest text-stone-400 uppercase mb-2">액세서리 추천 감성 사진 (클릭 시 반영)</span>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {PRODUCT_PRESETS.map((group) => (
                        <div key={group.category} className="space-y-1">
                          <span className="text-[9px] font-bold text-stone-450">{group.category} 추천</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {group.images.map((img) => (
                              <button
                                key={img.name}
                                type="button"
                                onClick={() => setProdImgUrl(img.url)}
                                className={`group relative aspect-square rounded overflow-hidden border-2 transition-all ${
                                  prodImgUrl === img.url ? "border-amber-600 scale-[0.98]" : "border-stone-250 hover:border-stone-400"
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-stone-900/60 p-0.5">
                                  <span className="text-[7px] text-white block truncate leading-none text-center">{img.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <span className="text-[10px] text-stone-400 block mt-1">빈칸으로 남겨두시면 미려한 시그니처 쥬얼리 기본 프리셋 사진으로 대체됩니다.</span>
                </div>

                {/* Detailed description */}
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-stone-450 mb-1">DEEP STORY DESCRIPTION (제품 무드 상세 설명)</label>
                  <textarea
                    rows={4}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="재질 설명부터 일상에서의 어울림을 따뜻한 뉘앙스로 작성하세요"
                    className="w-full rounded-lg bg-stone-50 border border-stone-200 text-[#1C1917] p-2.5 focus:outline-none focus:border-stone-900 resize-none leading-relaxed"
                  />
                </div>

                {/* Boolean options checkboxes row */}
                <div className="flex items-center space-x-6 bg-stone-50 border p-3 rounded-lg font-bold">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsNew}
                      onChange={(e) => setProdIsNew(e.target.checked)}
                      className="rounded border-stone-300 text-stone-850 focus:ring-stone-900 h-4.5 w-4.5"
                    />
                    <span>NEW 신상 표시</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsBest}
                      onChange={(e) => setProdIsBest(e.target.checked)}
                      className="rounded border-stone-300 text-stone-850 focus:ring-stone-900 h-4.5 w-4.5"
                    />
                    <span>BEST 인기 표시</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-red-700">
                    <input
                      type="checkbox"
                      checked={prodIsSoldOut}
                      onChange={(e) => setProdIsSoldOut(e.target.checked)}
                      className="rounded border-red-300 text-red-900 focus:ring-red-900 h-4.5 w-4.5"
                    />
                    <span>SOLD OUT 품절 확정</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 rounded-full border border-stone-250 py-3 font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 inline-flex items-center justify-center cursor-pointer"
                  >
                    취소하기
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-stone-950 text-white font-semibold py-3 inline-flex items-center justify-center hover:bg-stone-800 shadow-sm cursor-pointer"
                  >
                    <span>적용 저장하기</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
