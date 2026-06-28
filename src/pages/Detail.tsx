import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import { 
  Truck, RotateCcw, AlertTriangle, ArrowLeft, ShoppingCart, MessageCircle, 
  Ruler, Heart, Check, Star, Lock, Plus, Minus, ChevronDown, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import ImageEditOverlay from "../components/ImageEditOverlay";

const BRAND_STORY = {
  title: "정갈함과 시간의 숨결을 엮다",
  description: "Peaknic의 주얼리는 대량 생산되는 기성품과 달리 아틀리에의 따스한 자연광 아래에서 숙련된 크래프터가 엄선된 무착색 천연 원석과 정밀 시드 비즈를 한 땀 한 땀 엮어내는 비스포크 방식으로 제작됩니다.\n\n우리는 손끝의 감각과 오랜 시간이 주는 미학을 믿습니다. 일상에 잔잔한 물결처럼 깃드는 우아함과 계절의 자유로움을 당신만의 색채로 가득 채워보세요.",
  materials: [
    { name: "Silver 925 법정순은", desc: "인체에 자극이 없고 은은한 광택을 유지하는 순은 925 자재만을 채택하여 피부 자극을 최소화합니다." },
    { name: "Natural Gemstones", desc: "물빛 광채를 지닌 천연 담수 진주와 고유의 파동을 가진 원석들이 고아한 소장 가치를 더해줍니다." },
    { name: "Glass Beads", desc: "세계적으로 가장 사랑받는 명가 미유키(Miyuki) 사의 정밀 내마모 글래스 비즈만을 정성껏 사용합니다." }
  ]
};

const DEFAULT_REVIEWS = [
  { rating: 5, content: "색감이 사진보다 훨씬 여리여리하고 예뻐요! 어떤 데일리 룩에도 매치하기 편해서 요새 매일 차고 다닙니다. 💕", userName: "김지민", userId: "default_1", createdAt: "2026-06-25T14:30:00.000Z" },
  { rating: 5, content: "친구 생일 선물로 구매했는데 포장도 감동이고 엽서까지 같이 와서 너무 마음에 들어요! 왕 추천합니다.", userName: "이소희", userId: "default_2", createdAt: "2026-06-21T09:15:00.000Z" }
];

const DEFAULT_QNAS = [
  { title: "팔찌 길이 조절 가능한가요?", content: "손목 둘레가 15.5cm 정도인데 편안하게 착용 가능한지 궁금해요.", userName: "한지우", userId: "default_3", isPrivate: false, answer: "안녕하세요 Peaknic입니다! 기본 연장 체인이 3cm 내외로 포함되어 15~18cm 내외로 편안한 조절이 가능하십니다. 더 여유롭거나 타이트한 맞춤 제작을 희망하시면 주문서 작성 시 메모에 기재해 주시면 정성껏 맞춤 제작해 드립니다. 🌸", answeredAt: "2026-06-26T10:00:00.000Z", createdAt: "2026-06-25T08:00:00.000Z" }
];

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, currentUser, addToWishlist, removeFromWishlist, addToCart } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  // Selector states
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Tabs and lookbook
  const [activeTab, setActiveTab] = useState<'lookbook' | 'reviews' | 'qna' | 'shipping'>('lookbook');
  const [isLookbookExpanded, setIsLookbookExpanded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Reviews & QnA database states
  const [reviews, setReviews] = useState<any[]>([]);
  const [qnas, setQnas] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [qnasLoading, setQnasLoading] = useState(true);

  // Reviews submission
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Q&A submission
  const [qnaTitle, setQnaTitle] = useState("");
  const [qnaContent, setQnaContent] = useState("");
  const [qnaIsPrivate, setQnaIsPrivate] = useState(false);
  const [qnaSubmitting, setQnaSubmitting] = useState(false);
  const [qnaError, setQnaError] = useState("");

  // Admin reply states
  const [qnaReplies, setQnaReplies] = useState<{ [key: string]: string }>({});
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null);

  // Scroll tracking for mobile sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch product data
  useEffect(() => {
    async function fetchProductData() {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const prodData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(prodData);
          setSelectedImage(prodData.imageUrl);
          
          if (prodData.size) {
            const sizeArr = prodData.size.split(",").map(s => s.trim());
            if (sizeArr.length > 0) setSelectedSize(sizeArr[0]);
          }
          if (prodData.color) {
            const colorArr = prodData.color.split(",").map(c => c.trim());
            if (colorArr.length > 0) setSelectedColor(colorArr[0]);
          }

          // Fetch category-based Recommendations
          const recSnapshot = await getDocs(collection(db, "products"));
          const recList = recSnapshot.docs
            .map((d) => ({ id: d.id, ...d.data() } as Product))
            .filter((p) => p.id !== id && p.category === prodData.category);
          setRecommendations(recList.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [id]);

  // Sync wishlist status
  useEffect(() => {
    if (currentUser && currentUser.wishlist && product) {
      setIsWished(currentUser.wishlist.includes(product.id));
    } else {
      setIsWished(false);
    }
  }, [currentUser, product]);

  // Load reviews and Qnas
  const loadReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const reviewsRef = collection(db, "products", id, "reviews");
      const snap = await getDocs(reviewsRef);
      if (snap.empty) {
        // Seed default reviews for a lively look
        for (const rev of DEFAULT_REVIEWS) {
          await addDoc(reviewsRef, rev);
        }
        const refetched = await getDocs(reviewsRef);
        setReviews(refetched.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadQnas = async () => {
    if (!id) return;
    setQnasLoading(true);
    try {
      const qnasRef = collection(db, "products", id, "qna");
      const snap = await getDocs(qnasRef);
      if (snap.empty) {
        // Seed default QnA for a lively look
        for (const q of DEFAULT_QNAS) {
          await addDoc(qnasRef, q);
        }
        const refetched = await getDocs(qnasRef);
        setQnas(refetched.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setQnas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQnasLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadReviews();
      loadQnas();
    }
  }, [id]);

  if (loading || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        {loading ? (
          <>
            <div className="inline-block animate-spin h-8 w-8 border-4 border-stone-800 border-t-transparent rounded-full mb-3" />
            <p className="text-xs text-stone-500 font-mono">Drawing beautiful components...</p>
          </>
        ) : (
          <div className="mx-auto max-w-2xl text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-stone-300 mb-4" />
            <h2 className="font-serif text-xl font-bold text-stone-850">상품을 찾을 수 없습니다.</h2>
            <Link to="/shop" className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 text-xs font-semibold text-white tracking-widest uppercase hover:bg-stone-800">
              전체 상품 구경하러 가기
            </Link>
          </div>
        )}
      </div>
    );
  }

  const sizes = product.size ? product.size.split(",").map((s) => s.trim()) : [];
  const colors = product.color ? product.color.split(",").map((c) => c.trim()) : [];

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (isWished) {
      await removeFromWishlist(product.id);
      setIsWished(false);
    } else {
      await addToWishlist(product.id);
      setIsWished(true);
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate("/login", { state: { from: location } });
      return;
    }
    await addToCart(product.id, quantity, selectedSize || undefined, selectedColor || undefined);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2000);
  };

  const handleOrderRedirect = () => {
    const orderParams = new URLSearchParams();
    orderParams.set("productId", product.id);
    if (quantity > 1) {
      orderParams.set("productName", `${product.name} x ${quantity}`);
      orderParams.set("price", (product.price * quantity).toString());
    } else {
      orderParams.set("productName", product.name);
      orderParams.set("price", product.price.toString());
    }
    if (selectedSize) orderParams.set("size", selectedSize);
    if (selectedColor) orderParams.set("color", selectedColor);

    navigate(`/order?${orderParams.toString()}`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    if (!currentUser) return;
    if (reviewContent.trim().length < 5) {
      setReviewError("후기는 최소 5자 이상 작성해 주세요.");
      return;
    }
    setReviewSubmitting(true);
    try {
      const reviewsRef = collection(db, "products", id!, "reviews");
      await addDoc(reviewsRef, {
        rating: reviewRating,
        content: reviewContent.trim(),
        userName: currentUser.name,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      setReviewContent("");
      setReviewRating(5);
      await loadReviews();
    } catch (err) {
      console.error(err);
      setReviewError("오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("후기를 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "products", id!, "reviews", reviewId));
      await loadReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQna = async (e: React.FormEvent) => {
    e.preventDefault();
    setQnaError("");
    if (!currentUser) return;
    if (!qnaTitle.trim() || qnaContent.trim().length < 5) {
      setQnaError("제목과 최소 5자 이상의 내용을 작성해 주세요.");
      return;
    }
    setQnaSubmitting(true);
    try {
      const qnasRef = collection(db, "products", id!, "qna");
      await addDoc(qnasRef, {
        title: qnaTitle.trim(),
        content: qnaContent.trim(),
        isPrivate: qnaIsPrivate,
        userName: currentUser.name,
        userId: currentUser.uid,
        answer: "",
        answeredAt: "",
        createdAt: new Date().toISOString()
      });
      setQnaTitle("");
      setQnaContent("");
      setQnaIsPrivate(false);
      await loadQnas();
    } catch (err) {
      console.error(err);
      setQnaError("오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setQnaSubmitting(false);
    }
  };

  const handleDeleteQna = async (qnaId: string) => {
    if (!window.confirm("문의글을 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "products", id!, "qna", qnaId));
      await loadQnas();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminReply = async (qnaId: string) => {
    const reply = qnaReplies[qnaId];
    if (!reply || !reply.trim()) return;
    setReplySubmittingId(qnaId);
    try {
      await updateDoc(doc(db, "products", id!, "qna", qnaId), {
        answer: reply.trim(),
        answeredAt: new Date().toISOString()
      });
      setQnaReplies(prev => ({ ...prev, [qnaId]: "" }));
      await loadQnas();
    } catch (err) {
      console.error(err);
    } finally {
      setReplySubmittingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center text-xs font-bold tracking-widest text-stone-450 uppercase hover:text-stone-900 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          <span>목록으로 돌아가기</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start pb-16 border-b border-stone-200">
        <div className="flex flex-col space-y-4">
          <div className="relative overflow-hidden rounded-xl bg-stone-100 aspect-square border border-stone-100 shadow-sm">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.025]"
            />
            {product.isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F6]/80 backdrop-blur-[1px]">
                <div className="rounded-full bg-stone-900 text-white text-xs px-5 py-2 font-bold tracking-widest">
                  품절 (SOLD OUT)
                </div>
              </div>
            )}
            {isAdmin && (
              <ImageEditOverlay
                collectionName="products"
                docId={product.id}
                fieldName="imageUrl"
                currentValue={product.imageUrl}
                onUpdateSuccess={(newUrl) => {
                  setProduct(prev => prev ? { ...prev, imageUrl: newUrl } : null);
                  setSelectedImage(newUrl);
                }}
                label="대표 사진 변경"
                className="absolute top-4 right-4"
              />
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative rounded-lg overflow-hidden aspect-square w-16 sm:w-20 border-2 cursor-pointer transition-all ${
                    selectedImage === img ? "border-stone-850 opacity-100" : "border-stone-100 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="visual" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-6 sm:space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-wider text-stone-400">
                {product.category === "Beaded Bracelets" ? "비즈 팔찌" : "커플/우정 팔찌"} Collection
              </span>
              <div className="flex space-x-1.5">
                {product.isNew && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100">NEW</span>}
                {product.isBest && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100">BEST</span>}
              </div>
            </div>
            <h1 className="font-serif text-2.5xl sm:text-3.5xl font-light tracking-wide text-stone-900 mb-3.5">{product.name}</h1>
            <p className="font-sans text-xl sm:text-2xl font-semibold text-stone-850">{product.price.toLocaleString("ko-KR")}원</p>
          </div>

          <div className="border-t border-stone-200/60 pt-5">
            <dl className="grid grid-cols-4 gap-y-3.5 text-xs">
              <dt className="col-span-1 text-stone-450 font-bold tracking-wider uppercase">Material</dt>
              <dd className="col-span-3 text-stone-750 font-medium">{product.material || "미기재"}</dd>
              <dt className="col-span-1 text-stone-450 font-bold tracking-wider uppercase">Size</dt>
              <dd className="col-span-3 text-stone-750 font-medium">{product.size || "Free"}</dd>
              <dt className="col-span-1 text-stone-450 font-bold tracking-wider uppercase">Color</dt>
              <dd className="col-span-3 text-stone-750 font-medium">{product.color || "Silver"}</dd>
            </dl>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-200/60">
            {sizes.length > 1 && (
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-stone-450 tracking-wider">SIZE OPTION</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border duration-250 ${
                        selectedSize === s ? "bg-stone-900 border-stone-900 text-white" : "border-stone-200 text-stone-650 hover:border-stone-800"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 1 && (
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-stone-450 tracking-wider">COLOR OPTION</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border duration-250 ${
                        selectedColor === c ? "bg-stone-900 border-stone-900 text-white" : "border-stone-200 text-stone-650 hover:border-stone-800"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-stone-450 tracking-wider">QUANTITY</label>
              <div className="flex items-center w-28 border border-stone-200 rounded-lg overflow-hidden h-9 bg-white">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-full flex items-center justify-center hover:bg-stone-50 border-r border-stone-200 text-stone-550"
                  disabled={product.isSoldOut}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="flex-1 text-center text-xs font-mono font-medium text-stone-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-full flex items-center justify-center hover:bg-stone-50 border-l border-stone-200 text-stone-550"
                  disabled={product.isSoldOut}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {!product.isSoldOut && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500">총 상품 금액 (Subtotal)</p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                  {quantity}개 선택됨 {selectedSize ? ` / ${selectedSize}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="font-serif text-xl font-bold text-stone-900">{(product.price * quantity).toLocaleString("ko-KR")}원</span>
                <p className="text-[9px] text-emerald-600 mt-0.5">
                  {product.price * quantity >= 30000 ? "무료배송 적용" : "3만원 이상 무료배송 (배송비 3,000원)"}
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-stone-100 space-y-4">
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <button
                onClick={handleOrderRedirect}
                disabled={product.isSoldOut}
                className={`flex-2 flex items-center justify-center rounded-full font-medium text-xs px-6 py-3.5 shadow-sm transition-all duration-300 ${
                  product.isSoldOut ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                <span>{product.isSoldOut ? "품절된 상품" : "주문서 작성하기"}</span>
              </button>

              <button
                onClick={handleAddToCart}
                disabled={product.isSoldOut}
                className={`flex-1 flex items-center justify-center rounded-full font-medium text-xs px-6 py-3.5 border transition-all duration-300 ${
                  product.isSoldOut
                    ? "bg-transparent border-stone-200 text-stone-400 cursor-not-allowed"
                    : cartSuccess
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-white border-stone-300 text-stone-800 hover:border-stone-900"
                }`}
              >
                {cartSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
                    <span>장바구니 추가됨</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-1.5 text-stone-550" />
                    <span>장바구니 담기</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`rounded-full p-3.5 border transition-all duration-300 flex items-center justify-center ${
                  isWished ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-stone-300 text-stone-450 hover:border-stone-900"
                }`}
              >
                <Heart className={`h-4 w-4 ${isWished ? "fill-current text-red-500" : ""}`} />
              </button>
            </div>
            
            <div className="flex justify-end">
              <a href="https://instagram.com/peaknic_archive" target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline">
                <MessageCircle className="h-3.5 w-3.5 mr-1 text-stone-450" />
                <span>인스타그램으로 추가 제작 문의하기</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list row */}
      <div className="mt-16 sm:mt-24 border-b border-stone-200 flex overflow-x-auto">
        <div className="flex space-x-8 sm:space-x-12 pb-px">
          {[
            { id: 'lookbook', label: 'LOOKBOOK / 상세 설명' },
            { id: 'reviews', label: `REVIEWS / 후기 (${reviews.length})` },
            { id: 'qna', label: `Q&A / 문의 (${qnas.length})` },
            { id: 'shipping', label: '배송 / 교환 / 반품' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative pb-4 text-xs sm:text-sm font-medium tracking-wide transition-all ${
                activeTab === tab.id ? "text-stone-900 font-semibold" : "text-stone-400 hover:text-stone-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="py-10 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'lookbook' && (
              <div className="space-y-12">
                <div className={`relative ${!isLookbookExpanded ? "max-h-[500px] overflow-hidden" : ""}`}>
                  <div className="space-y-8 max-w-2xl mx-auto">
                    <img src={product.imageUrl} alt="lookbook" className="w-full rounded-xl object-cover" />
                    <div className="bg-stone-50 rounded-xl p-6 sm:p-10 border border-stone-200/40 text-center space-y-4">
                      <h4 className="font-serif text-lg sm:text-xl font-light text-stone-900">{BRAND_STORY.title}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-light whitespace-pre-line text-justify sm:text-center">{BRAND_STORY.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {BRAND_STORY.materials.map((mat, idx) => (
                        <div key={idx} className="bg-white p-4 border border-stone-150 rounded-xl">
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">Material {idx + 1}</span>
                          <h5 className="text-xs font-bold text-stone-800 mt-1 mb-1">{mat.name}</h5>
                          <p className="text-[11px] text-stone-550 font-light leading-relaxed">{mat.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
                        <Ruler className="h-4.5 w-4.5 text-stone-550" />
                        <h5 className="font-serif text-sm font-medium">Size Guide & wrist measurement</h5>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-stone-500 font-light min-w-[280px]">
                          <thead>
                            <tr className="border-b border-stone-150 bg-stone-50 text-[10px] font-bold">
                              <th className="py-2 px-3">사이즈</th>
                              <th className="py-2 px-3">맞춤 둘레</th>
                              <th className="py-2 px-3">권장 추천</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-stone-100">
                              <td className="py-2 px-3 font-semibold text-stone-800">S (Slim)</td>
                              <td className="py-2 px-3">14.0cm - 15.0cm</td>
                              <td className="py-2 px-3">일반 여성 표준체형</td>
                            </tr>
                            <tr className="border-b border-stone-100">
                              <td className="py-2 px-3 font-semibold text-stone-800">M (Standard)</td>
                              <td className="py-2 px-3">16.0cm - 17.0cm</td>
                              <td className="py-2 px-3">남성 얇은 체형 / 여성 루즈 핏</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-semibold text-stone-800">L (Comfort)</td>
                              <td className="py-2 px-3">18.0cm - 19.0cm</td>
                              <td className="py-2 px-3">남성 표준체형</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {!isLookbookExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-4">
                      <button
                        onClick={() => setIsLookbookExpanded(true)}
                        className="flex items-center space-x-2 bg-stone-900 text-white rounded-full px-5 py-2 text-xs font-semibold hover:bg-stone-850 shadow-md"
                      >
                        <span>상세 이미지 펼쳐보기</span>
                        <ChevronDown className="h-4 w-4 animate-bounce" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="bg-stone-50 border border-stone-200/65 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">Overall score</p>
                    <h4 className="text-4xl font-serif font-bold text-stone-900 mt-1">
                      {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0"}
                    </h4>
                    <div className="flex justify-center md:justify-start text-amber-500 space-x-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="text-xs text-stone-500 mt-2">총 {reviews.length}개의 실제 사용 후기</p>
                  </div>
                  <div className="flex-1 w-full max-w-xs space-y-1.5">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const num = 5 - idx;
                      const count = reviews.filter(r => r.rating === num).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : num === 5 ? 100 : 0;
                      return (
                        <div key={idx} className="flex items-center text-[10px]">
                          <span className="w-8 font-mono text-stone-500">{num} Star</span>
                          <div className="flex-1 h-1.5 bg-stone-200 rounded-full mx-2 overflow-hidden">
                            <div className="h-full bg-stone-700" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-right text-stone-400">{count}건</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                  <h5 className="font-serif text-sm font-medium border-b border-stone-100 pb-2">소중한 후기 작성</h5>
                  {currentUser ? (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-stone-500">평점:</span>
                        <div className="flex text-amber-400 space-x-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button key={i} type="button" onClick={() => setReviewRating(i + 1)}>
                              <Star className={`h-5 w-5 ${reviewRating >= i + 1 ? "fill-current text-amber-500" : "text-stone-200"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="착용 포인트나 소감을 남겨주세요 (최소 5자)"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-800"
                      />
                      {reviewError && <p className="text-xs text-red-600 font-light">{reviewError}</p>}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-stone-400">작성자: {currentUser.name}</span>
                        <button type="submit" disabled={reviewSubmitting} className="bg-stone-900 text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-stone-800 transition-colors">
                          후기 등록
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-stone-550 text-center py-2">
                      <Link to="/login" className="font-semibold text-stone-900 border-b border-stone-900">로그인</Link> 하시면 후기를 남기실 수 있습니다.
                    </p>
                  )}
                </div>

                <div className="space-y-4 divide-y divide-stone-150">
                  {reviewsLoading ? (
                    <div className="text-center py-4"><div className="inline-block animate-spin h-5 w-5 border-2 border-stone-800 border-t-transparent rounded-full" /></div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <div className="flex text-amber-500 space-x-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-2.5 w-2.5 ${rev.rating >= i + 1 ? "fill-current" : "text-stone-200"}`} />
                            ))}
                          </div>
                          <div className="text-stone-400 space-x-1">
                            <span>{rev.userName}님</span>
                            <span>|</span>
                            <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                            {(isAdmin || (currentUser && currentUser.uid === rev.userId)) && (
                              <button onClick={() => handleDeleteReview(rev.id)} className="text-red-500 hover:text-red-700 ml-1 font-bold">X</button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-stone-650 leading-relaxed font-light whitespace-pre-line text-justify">{rev.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'qna' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                  <h5 className="font-serif text-sm font-medium border-b border-stone-100 pb-2">새로운 상품 문의</h5>
                  {currentUser ? (
                    <form onSubmit={handleSubmitQna} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={qnaTitle}
                          onChange={(e) => setQnaTitle(e.target.value)}
                          placeholder="문의 제목을 기입하세요"
                          className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 focus:outline-none"
                        />
                        <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                          <input type="checkbox" checked={qnaIsPrivate} onChange={(e) => setQnaIsPrivate(e.target.checked)} className="rounded text-stone-900 focus:ring-stone-900" />
                          <span>비밀글로 문의 (비공개)</span>
                        </label>
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={qnaContent}
                        onChange={(e) => setQnaContent(e.target.value)}
                        placeholder="문의 사항을 구체적으로 남겨주세요 (최소 5자)"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-800"
                      />
                      {qnaError && <p className="text-xs text-red-600 font-light">{qnaError}</p>}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-stone-400">작성자: {currentUser.name}</span>
                        <button type="submit" disabled={qnaSubmitting} className="bg-stone-900 text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-stone-800">
                          문의 접수
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-stone-550 text-center py-2">
                      <Link to="/login" className="font-semibold text-stone-900 border-b border-stone-900">로그인</Link> 하시면 문의를 남기실 수 있습니다.
                    </p>
                  )}
                </div>

                <div className="space-y-4 divide-y divide-stone-150">
                  {qnasLoading ? (
                    <div className="text-center py-4"><div className="inline-block animate-spin h-5 w-5 border-2 border-stone-800 border-t-transparent rounded-full" /></div>
                  ) : (
                    qnas.map((q) => {
                      const access = isAdmin || (currentUser && currentUser.uid === q.userId);
                      return (
                        <div key={q.id} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center space-x-1.5 font-semibold text-stone-800">
                              {q.isPrivate && <Lock className="h-3 w-3 text-stone-400" />}
                              <span>{q.isPrivate && !access ? "비밀글입니다." : q.title}</span>
                              {q.answer ? (
                                <span className="bg-emerald-50 text-emerald-700 text-[8px] px-1 rounded border border-emerald-100">답변완료</span>
                              ) : (
                                <span className="bg-stone-100 text-stone-500 text-[8px] px-1 rounded border border-stone-200">답변대기</span>
                              )}
                            </div>
                            <div className="text-stone-400 space-x-1">
                              <span>{q.userName}</span>
                              <span>|</span>
                              <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                              {(isAdmin || (currentUser && currentUser.uid === q.userId)) && (
                                <button onClick={() => handleDeleteQna(q.id)} className="text-red-500 hover:text-red-700 ml-1 font-bold">X</button>
                              )}
                            </div>
                          </div>

                          {q.isPrivate && !access ? (
                            <p className="text-xs text-stone-400 font-light italic">비밀글입니다. 작성자와 관리자만 볼 수 있습니다.</p>
                          ) : (
                            <div className="bg-stone-50/70 p-3.5 rounded-lg border border-stone-100 space-y-3">
                              <p className="text-xs text-stone-600 font-light leading-relaxed whitespace-pre-line">{q.content}</p>
                              {q.answer ? (
                                <div className="border-t border-stone-200/50 pt-2.5 space-y-1">
                                  <span className="text-[10px] font-bold text-stone-800 block">A. Peaknic 아틀리에</span>
                                  <p className="text-xs text-stone-600 font-light leading-relaxed whitespace-pre-line text-justify bg-white/60 p-2.5 rounded border border-stone-100">{q.answer}</p>
                                </div>
                              ) : (
                                isAdmin && (
                                  <div className="border-t border-stone-200/50 pt-2.5 space-y-2">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={qnaReplies[q.id] || ""}
                                        onChange={(e) => setQnaReplies(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        placeholder="답변 내용을 작성해 주세요..."
                                        className="flex-1 text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                                      />
                                      <button onClick={() => handleAdminReply(q.id)} className="bg-stone-900 text-white rounded-lg px-3 py-1.5 text-xs hover:bg-stone-850 shrink-0">답변 등록</button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-stone-50 border border-stone-150 rounded-xl p-5 space-y-3">
                  <h5 className="font-serif text-xs font-semibold text-stone-900 flex items-center">
                    <Truck className="h-4 w-4 mr-1.5 text-stone-450" />
                    배송 안내 (Shipping)
                  </h5>
                  <div className="text-[11px] text-stone-550 leading-relaxed font-light space-y-2">
                    <p>• 기본 편도 운임 배송비는 3,000원입니다. (3만원 이상 주문 시 무료 자동 적용)</p>
                    <p>• 영업일 기준 2~5일 이내로 완벽하고 위생적이게 수제 포장되어 발송 보증서와 함께 자택으로 택배 이동됩니다.</p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-150 rounded-xl p-5 space-y-3">
                  <h5 className="font-serif text-xs font-semibold text-stone-900 flex items-center">
                    <RotateCcw className="h-4 w-4 mr-1.5 text-stone-450" />
                    교환 / 환불 안내 (Refund)
                  </h5>
                  <div className="text-[11px] text-stone-550 leading-relaxed font-light space-y-2">
                    <p>• 악세사리 특성상 미개봉 미착용에 한해 배송 완료 후 7일 이내 교환/반품 가능합니다.</p>
                    <p>• 단순변심에 의한 왕복 운임비는 소비자 본인이 부담하게 되며 불량 등의 배송은 자사가 부담합니다.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Recommended list */}
      {recommendations.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <div className="border-b border-stone-200 pb-4 mb-8">
            <h3 className="font-serif text-lg sm:text-xl text-stone-900 tracking-wide font-medium">You May Also Love</h3>
            <p className="text-[11px] font-mono tracking-widest uppercase text-stone-400 mt-1">Similar items recommended for you</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((prod) => <ProductCard key={prod.id} product={prod} />)}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-4 py-3 flex items-center justify-between sm:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 transform ${showSticky ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-stone-450 truncate max-w-[140px]">{product.name}</span>
          <span className="text-xs font-semibold text-stone-900">{(product.price * quantity).toLocaleString("ko-KR")}원</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={product.isSoldOut}
            className={`px-3 py-1.5 border rounded-full text-[11px] font-medium transition-all ${
              product.isSoldOut ? "bg-stone-100 text-stone-450 border-stone-200" : "bg-white border-stone-300 text-stone-800"
            }`}
          >
            장바구니
          </button>
          <button
            onClick={handleOrderRedirect}
            disabled={product.isSoldOut}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold text-white transition-all ${
              product.isSoldOut ? "bg-stone-200 text-stone-400" : "bg-stone-900"
            }`}
          >
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
}
