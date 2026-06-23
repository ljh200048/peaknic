import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import { Truck, RotateCcw, AlertTriangle, ArrowLeft, ShoppingCart, MessageCircle, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import ImageEditOverlay from "../components/ImageEditOverlay";

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected Option States
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

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
          
          // Set initial defaults for options if listed and not blank
          if (prodData.size) {
            const sizeArr = prodData.size.split(",").map(s => s.trim());
            if (sizeArr.length > 0) setSelectedSize(sizeArr[0]);
          }
          if (prodData.color) {
            const colorArr = prodData.color.split(",").map(c => c.trim());
            if (colorArr.length > 0) setSelectedColor(colorArr[0]);
          }

          // Fetch Recommendations (same category up to 4 items)
          const q = query(
            collection(db, "products"),
            where("category", "==", prodData.category)
          );
          const recSnapshot = await getDocs(q);
          const recList = recSnapshot.docs
            .map((d) => ({ id: d.id, ...d.data() } as Product))
            .filter((p) => p.id !== id);
          
          setRecommendations(recList.slice(0, 4));
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error drawing product detail page:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-stone-800 border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-stone-500 font-mono">Drawing beautiful components...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-stone-300 mb-4" />
        <h2 className="font-serif text-xl font-bold text-stone-850">해당 상품을 찾을 수 없습니다.</h2>
        <p className="text-xs text-stone-550 mt-2.5 leading-relaxed">
          존재하지 않거나 삭제된 액세서리 상품입니다. 매력적인 다른 컬렉션들을 감상해보세요.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 text-xs font-semibold text-white tracking-widest uppercase hover:bg-stone-805"
        >
          전체 상품 구경하러 가기
        </Link>
      </div>
    );
  }

  const sizes = product.size ? product.size.split(",").map((s) => s.trim()) : [];
  const colors = product.color ? product.color.split(",").map((c) => c.trim()) : [];

  const handleOrderRedirect = () => {
    // Generate URL search parameters to pass selections dynamically to the order page
    const orderParams = new URLSearchParams();
    orderParams.set("productId", product.id);
    orderParams.set("productName", product.name);
    orderParams.set("price", product.price.toString());
    if (selectedSize) orderParams.set("size", selectedSize);
    if (selectedColor) orderParams.set("color", selectedColor);

    navigate(`/order?${orderParams.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Back to shop navigation row */}
      <div className="mb-8">
        <Link
          to="/shop"
          className="inline-flex items-center text-xs font-bold tracking-widest text-stone-450 uppercase hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          <span>목록으로 돌아가기</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start pb-16 border-b border-stone-200">
        
        {/* Left Col: Dynamic Big Hero Image & Multi Thumbnails */}
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

            {/* Dynamic Real-time Image Changer for Admin Mode */}
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

          {/* Sub-images thumbnails slider */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3.5 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative rounded-lg overflow-hidden aspect-square w-16 sm:w-20 border-2 cursor-pointer transition-all ${
                    selectedImage === img ? "border-stone-850 opacity-100" : "border-stone-100 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`${product.name} visual ${index}`} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Product Spec, Pricing, Options Selection and purchase trigger buttons */}
        <div className="flex flex-col space-y-6 sm:space-y-8">
          
          {/* Header Title block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold tracking-widest text-stone-400 uppercase">
                {product.category} Collection
              </span>
              <div className="flex space-x-1.5">
                {product.isNew && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                    NEW
                  </span>
                )}
                {product.isBest && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100">
                    BEST
                  </span>
                )}
              </div>
            </div>

            <h1 className="font-serif text-2.5xl sm:text-3.5xl font-light tracking-wide text-stone-900 mb-3.5">
              {product.name}
            </h1>

            <p className="font-sans text-xl sm:text-2xl font-semibold text-stone-850">
              {product.price.toLocaleString("ko-KR")}원
            </p>
          </div>

          {/* Material Attributes block */}
          <div className="border-t border-stone-200/60 pt-5">
            <dl className="grid grid-cols-4 gap-y-3.5 text-xs">
              <dt className="col-span-1 text-stone-450 font-bold tracking-wider uppercase">Material (소재)</dt>
              <dd className="col-span-3 text-stone-750 font-medium">{product.material || "미기재"}</dd>

              <dt className="col-span-1 text-stone-450 font-bold tracking-wider uppercase">Size (규격)</dt>
              <dd className="col-span-3 text-stone-750 font-medium">{product.size || "Free"}</dd>

              <dt className="col-span-1 text-stone-450 font-bold tracking-wider uppercase">Color (컬러)</dt>
              <dd className="col-span-3 text-stone-750 font-medium">{product.color || "Silver"}</dd>
            </dl>
          </div>

          {/* Option details picker */}
          <div className="space-y-4 pt-4 border-t border-stone-200/60">
            {/* Size Options Picker */}
            {sizes.length > 1 && (
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-stone-450 tracking-wider">OPTION SIZE</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border duration-200 ${
                        selectedSize === s
                          ? "bg-stone-900 border-stone-900 text-white"
                          : "border-stone-200 hover:border-stone-800 text-stone-650"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Options Picker */}
            {colors.length > 1 && (
              <div className="flex flex-col space-y-1.5 mt-2">
                <label className="text-xs font-bold text-stone-450 tracking-wider">OPTION COLOR</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium border duration-200 ${
                        selectedColor === c
                          ? "bg-stone-900 border-stone-900 text-white"
                          : "border-stone-200 hover:border-stone-800 text-stone-650"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Deep Description paragraph */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-450 tracking-wider uppercase mb-2">Description (상세 설명)</h4>
            <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed whitespace-pre-line text-justify">
              {product.description || "감성적인 느낌이 가득 담긴 Peaknic만의 시그니처 아이템입니다. 일상 속에 아름다운 포인트 레이어드를 위해 정성을 가해 제작되었습니다."}
            </p>
          </div>

          {/* Order Actions portal */}
          <div className="flex flex-col sm:flex-row space-y-3.5 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={handleOrderRedirect}
              disabled={product.isSoldOut}
              className={`flex-1 flex items-center justify-center rounded-full font-medium text-sm px-8 py-4 shadow-sm transition-all duration-300 ${
                product.isSoldOut
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-stone-900 text-white hover:bg-stone-800"
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span>{product.isSoldOut ? "품절된 상품입니다" : "주문서 작성하기"}</span>
            </button>

            <a
              href="https://instagram.com/peaknic_archive"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white text-stone-700 px-6 py-4 text-xs font-semibold hover:border-stone-900 hover:text-stone-900 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-1 text-stone-500" />
              <span>인스타그램 문의</span>
            </a>
          </div>

          {/* Policy specifications (Delivery & Return guides) */}
          <div className="bg-stone-50/70 border border-stone-200/50 rounded-xl p-4.5 space-y-4 text-stone-650 md:text-[11px] text-xs">
            <div className="flex items-start">
              <Truck className="h-4 w-4 text-stone-450 mr-2.5 mt-0.5 shrink-0" />
              <div>
                <h5 className="font-bold text-stone-800 mb-0.5">배송 안내 (Delivery Info)</h5>
                <p className="leading-relaxed text-stone-550 font-light">
                  기본 배송비 3,000원 (3만원 이상 구매 시 무료 배송). 한진택배 또는 우체국택배로 집계되며, 영업일 기준 2~5일 이내에 포근하게 포장되어 완성 보증서와 함께 도착합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <RotateCcw className="h-4 w-4 text-stone-450 mr-2.5 mt-0.5 shrink-0" />
              <div>
                <h5 className="font-bold text-stone-800 mb-0.5">교환/환불 안내 (Refund Policy)</h5>
                <p className="leading-relaxed text-stone-550 font-light">
                  악세사리 특성상 미착용 한 미개봉 및 하자 상품에 한하여 상품 수령 후 7일 이내에 교환 및 반품이 가능합니다. 단, 사용자 오용에 따른 스크래치나 파손 건은 반품이 제한될 수 있습니다.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recommended similar listings */}
      {recommendations.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <div className="border-b border-stone-200 pb-4 mb-8">
            <h3 className="font-serif text-lg sm:text-xl text-stone-900 tracking-wide font-medium">
              You May Also Love
            </h3>
            <p className="text-[11px] font-mono tracking-widest uppercase text-stone-400 mt-1">
              similar accessories found for your mood
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
