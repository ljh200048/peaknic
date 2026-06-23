import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Product, SiteSettings } from "../types";
import ProductCard from "../components/ProductCard";
import { ArrowRight, Gift, Sparkles, Heart, Award, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import ImageEditOverlay from "../components/ImageEditOverlay";

// Fallback images for category thumbnails
const CATEGORY_THUMBS: { [key: string]: string } = {
  Ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
  Necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
  Bracelet: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
  Earrings: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop",
  Keyring: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600&auto=format&fit=crop",
};

// Emotional Instagram feed templates to mimic the brand image aesthetics
const INSTA_POSTS = [
  { id: 1, url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=500&auto=format&fit=crop", likes: "142" },
  { id: 2, url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500&auto=format&fit=crop", likes: "328" },
  { id: 3, url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500&auto=format&fit=crop", likes: "511" },
  { id: 4, url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=500&auto=format&fit=crop", likes: "209" },
  { id: 5, url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=500&auto=format&fit=crop", likes: "419" },
  { id: 6, url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop", likes: "313" },
];

export default function Home() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Settings
        const settingsDoc = await getDoc(doc(db, "siteSettings", "main"));
        if (settingsDoc.exists()) {
          setSettings({ id: "main", ...settingsDoc.data() } as SiteSettings);
        } else {
          // Fallback settings
          setSettings({
            id: "main",
            heroTitle: "Everyday Accessories for Your Mood",
            heroSubtitle: "Peaknic은 심플함 속에 녹아든 따뜻한 일상의 순간들을 아름다운 감성으로 포착합니다. 고요하게 빛나는 우리들만의 장식품.",
            heroImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop",
            instagramUrl: "https://instagram.com/peaknic_archive",
            noticeText: "• 한시적 무료 배송 프로모션 진행 중 (3만원 이상 구매 시)"
          });
        }

        // Fetch Products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching homepage Firestore objects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const newProducts = products.filter((p) => p.isNew && !p.isSoldOut).slice(0, 4);
  const bestProducts = products.filter((p) => p.isBest).slice(0, 4);
  
  // Custom filter for gifts: Ring, Necklace or products matching typical gifting premium items
  const giftProducts = products
    .filter((p) => p.category === "Necklace" || p.name.includes("Heart") || p.name.includes("Couple"))
    .slice(0, 4);

  const heroImage = settings?.heroImageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop";

  return (
    <div className="w-full">
      {/* 1. Brand Intro Hero Section */}
      <section className="relative min-h-[82vh] w-full flex items-center justify-center overflow-hidden bg-stone-100 px-4 py-20">
        {/* Ambient background with parallax slide effect */}
        <div className="absolute inset-0 z-0 opacity-80">
          <img
            src={heroImage}
            alt="Peaknic Editorial Background"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover filtering brightness-[0.88] contrast-[1.02]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 via-stone-900/20 to-stone-900/40" />
        </div>

        {/* Dynamic cover photo changer for logged-in admin mode */}
        {isAdmin && (
          <ImageEditOverlay
            collectionName="siteSettings"
            docId="main"
            fieldName="heroImageUrl"
            currentValue={heroImage}
            onUpdateSuccess={(newUrl) => {
              setSettings((prev) =>
                prev
                  ? { ...prev, heroImageUrl: newUrl }
                  : {
                      id: "main",
                      heroTitle: "Everyday Accessories for Your Mood",
                      heroSubtitle: "Peaknic은 심플함 속에 녹아든 따뜻한 일상의 순간들을 아름다운 감성으로 포착합니다. 고요하게 빛나는 우리들만의 장식품.",
                      heroImageUrl: newUrl,
                      instagramUrl: "https://instagram.com/peaknic_archive",
                      noticeText: "• 한시적 무료 배송 프로모션 진행 중 (3만원 이상 구매 시)",
                    }
              );
            }}
            label="메인 배경 이미지 변경"
            className="absolute top-6 right-6"
          />
        )}

        <div className="relative z-10 mx-auto max-w-4xl text-center text-white px-4 md:px-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <span className="mb-4 text-xs font-bold uppercase tracking-[0.45em] text-stone-200 flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-stone-300" />
              PEAKNIC CRAFT STUDIO
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-wide leading-tight text-[#FAF9F6] mb-6">
              {settings?.heroTitle || "Everyday Accessories for Your Mood"}
            </h1>
            <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-stone-200/90 font-light mb-10">
              {settings?.heroSubtitle || "심플함 속에 녹아든 따뜻한 일상을 고풍스럽고 가치 있는 주얼리 형태로 선사합니다. 남녀 모두 부담 없이 감상할 수 있는 미니멀 에스테틱."}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
              <Link
                to="/shop"
                className="group inline-flex items-center justify-center rounded-full bg-white text-stone-900 font-medium text-sm px-8 py-3.5 shadow-lg transition-all duration-300 hover:bg-stone-900 hover:text-white"
              >
                <span>Scent of peaknic</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#categories"
                className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/10 text-white font-medium text-sm px-6 py-3.5 backdrop-blur-xs transition-colors hover:bg-white/20"
              >
                <span>Category</span>
                <ArrowDown className="h-4 w-4 ml-1.5 animate-bounce" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        {/* Brand Notice Section */}
        {settings?.noticeText && (
          <div className="mx-auto max-w-4xl bg-stone-50 border border-stone-200/60 rounded-xl p-5 mb-16 text-xs text-stone-600 font-medium">
            <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-stone-800 mb-2.5 flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
              Peaknic Notice & Announcement
            </h4>
            <div className="whitespace-pre-line leading-relaxed space-y-1">
              {settings.noticeText}
            </div>
          </div>
        )}

        {/* 2. Brand Category Grid Overview section */}
        <section id="categories" className="py-12 scroll-mt-24">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3.5xl tracking-wide text-stone-900">
              Sensory Categories
            </h2>
            <div className="mx-auto h-[1px] w-12 bg-stone-900/60 mt-3.5 mb-2" />
            <p className="text-xs tracking-widest text-stone-400 uppercase mt-2 font-mono">
              explore items by emotional categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {Object.keys(CATEGORY_THUMBS).map((cat, idx) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="relative group rounded-xl overflow-hidden aspect-square border border-stone-100 bg-stone-100 shadow-xs"
              >
                <img
                  src={CATEGORY_THUMBS[cat]}
                  alt={`${cat} category`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-950/25 transition-opacity group-hover:bg-stone-950/35 duration-300" />
                <Link
                  to={`/shop?category=${cat}`}
                  className="absolute inset-0 flex flex-col items-center justify-center text-white"
                >
                  <span className="font-serif text-lg sm:text-xl font-medium tracking-widest mb-1 shadow-xs">
                    {cat}
                  </span>
                  <span className="text-[9px] font-mono tracking-widest opacity-80 uppercase bg-black/20 border border-white/20.5 rounded-full px-2 py-0.5 mt-1 sm:mt-1.5">
                    View list
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. NEW ARRIVALS Section */}
        <section className="py-16">
          <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-stone-200/50 pb-5 mb-10">
            <div>
              <span className="text-xs font-bold text-stone-400 font-mono uppercase tracking-[0.2em] flex items-center mb-1">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Just Landed
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-stone-900">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?sort=newest"
              className="mt-3 sm:mt-0 text-stone-500 hover:text-stone-900 text-xs font-bold tracking-widest uppercase flex items-center space-x-1 group border-b border-stone-300 hover:border-stone-900 pb-0.5 transition-colors"
            >
              <span>View all new drops</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col">
                  <div className="bg-stone-200 rounded-lg aspect-square mb-4" />
                  <div className="h-4 bg-stone-200 rounded-sm w-3/4 mb-2" />
                  <div className="h-3 bg-stone-200 rounded-sm w-1/2" />
                </div>
              ))}
            </div>
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 border border-stone-100 rounded-xl">
              <p className="text-sm text-stone-500 font-serif">등록된 신상품이 없습니다.</p>
            </div>
          )}
        </section>

        {/* 4. BEST SELLERS Section */}
        <section className="py-12">
          <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-stone-200/50 pb-5 mb-10">
            <div>
              <span className="text-xs font-bold text-stone-400 font-mono uppercase tracking-[0.2em] flex items-center mb-1">
                <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
                Most Loved
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-stone-900">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/shop?filter=best"
              className="mt-3 sm:mt-0 text-stone-500 hover:text-stone-900 text-xs font-bold tracking-widest uppercase flex items-center space-x-1 group border-b border-stone-300 hover:border-stone-900 pb-0.5 transition-colors"
            >
              <span>View best sellers</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col">
                  <div className="bg-stone-200 rounded-lg aspect-square mb-4" />
                  <div className="h-4 bg-stone-200 rounded-sm w-3/4 mb-2" />
                  <div className="h-3 bg-stone-200 rounded-sm w-1/2" />
                </div>
              ))}
            </div>
          ) : bestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {bestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 border border-stone-100 rounded-xl">
              <p className="text-sm text-stone-500 font-serif">등록된 추천 베스트 상품이 없습니다.</p>
            </div>
          )}
        </section>

        {/* Brand Editorial philosophy highlight poster */}
        <section className="my-16 grid grid-cols-1 md:grid-cols-2 gap-12 bg-stone-50 rounded-2xl overflow-hidden border border-stone-200/40 p-8 md:p-12 items-center">
          <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-stone-150">
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"
              alt="Peaknic Editorial Atmosphere"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-900/10" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold text-stone-400 font-mono tracking-widest uppercase mb-2">Our Story</span>
            <h3 className="font-serif text-2xl sm:text-3.5xl tracking-wide text-stone-900 leading-tight mb-5">
              소소하고 영원히 흔들릴 일 없는 마음의 소풍
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed font-light mb-6">
              Peaknic은 바쁜 도심의 피로를 벗어던지고 자연 속에 앉아 햇살을 머금었을 때의 포근한 온기를 모티브로 삼은 에스테틱 라이프 레이블입니다. 일상에서 매일 꺼내 볼 수 있을 만큼 감성적이면서도 담백하고, 자연스럽게 녹아드는 반지, 목걸이, 키링을 선보입니다.
            </p>
            <Link
              to="/about"
              className="self-start text-xs font-bold tracking-widest text-stone-900 uppercase border-b-2 border-stone-900 pb-0.5 duration-200 hover:text-stone-600 hover:border-stone-600"
            >
              Learn our values
            </Link>
          </div>
        </section>

        {/* 5. GIFT RECOMMENDATIONS (선물 추천 상품) */}
        <section className="py-12">
          <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-stone-200/50 pb-5 mb-10">
            <div>
              <span className="text-xs font-bold text-stone-400 font-mono uppercase tracking-[0.2em] flex items-center mb-1">
                <Gift className="h-3.5 w-3.5 mr-1 text-rose-500" />
                For Your Loved Ones
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-stone-900">
                선물 추천 상품
              </h2>
            </div>
            <Link
              to="/shop?category=Necklace"
              className="mt-3 sm:mt-0 text-stone-500 hover:text-stone-900 text-xs font-bold tracking-widest uppercase flex items-center space-x-1 group border-b border-stone-300 hover:border-stone-900 pb-0.5 transition-colors"
            >
              <span>See more gifts</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col">
                  <div className="bg-stone-200 rounded-lg aspect-square mb-4" />
                  <div className="h-4 bg-stone-200 rounded-sm w-3/4 mb-2" />
                  <div className="h-3 bg-stone-200 rounded-sm w-1/2" />
                </div>
              ))}
            </div>
          ) : giftProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {giftProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 border border-stone-100 rounded-xl">
              <p className="text-sm text-stone-500 font-serif">등록된 선물 추천 상품이 없습니다.</p>
            </div>
          )}
        </section>

        {/* 6. INSTAGRAM FEELINGS ARCHIVE SECTION */}
        <section className="py-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-wide text-stone-900">
              Peaknic Archive
            </h2>
            <div className="mx-auto h-[1px] w-12 bg-stone-900/60 mt-3.5 mb-2.5" />
            <a
              href={settings?.instagramUrl || "https://instagram.com/peaknic_archive"}
              target="_blank"
              rel="noreferrer"
              className="text-stone-550 hover:text-stone-900 text-xs font-mono tracking-widest uppercase hover:underline"
            >
              @peaknic_archive
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 sm:gap-4.5">
            {INSTA_POSTS.map((post) => (
              <div
                key={post.id}
                className="relative group rounded-xl overflow-hidden aspect-square shadow-xs bg-stone-100"
              >
                <img
                  src={post.url}
                  alt={`Peaknic mood snapshot ${post.id}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Micro hover overlay mimicking likes counts and instagram overlay details */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white text-xs font-semibold tracking-wide">
                  <div className="flex items-center space-x-1 uppercase">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500 mr-1" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
