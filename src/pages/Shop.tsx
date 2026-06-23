import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import { Filter, SlidersHorizontal, RefreshCcw, Search, Sparkles } from "lucide-react";

type SortOption = "latest" | "price-asc" | "price-desc";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search input and category settings
  const selectedCategory = searchParams.get("category") || "All";
  const selectedSort = (searchParams.get("sort") as SortOption) || "latest";
  const onlyBest = searchParams.get("filter") === "best";
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Ring", "Necklace", "Bracelet", "Earrings", "Keyring"];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        setProducts(fetched);
      } catch (err) {
        console.error("Error retrieving products catalog from db:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter & sort logic whenever dependency changes
  useEffect(() => {
    let result = [...products];

    // 1. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Best Filter
    if (onlyBest) {
      result = result.filter((p) => p.isBest);
    }

    // 3. Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 4. Sort Ordering
    if (selectedSort === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (selectedSort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedSort, onlyBest, searchQuery]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setSearchParams(params);
  };

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    setSearchParams(params);
  };

  const toggleBestFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (onlyBest) {
      params.delete("filter");
    } else {
      params.set("filter", "best");
    }
    setSearchParams(params);
  };

  const resetAllFilters = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Title banner */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4.5xl tracking-wide text-stone-900">The Catalog</h1>
        <div className="mx-auto h-[1px] w-12 bg-stone-900/60 mt-3.5 mb-2.5" />
        <p className="text-xs tracking-widest text-stone-400 uppercase mt-2.5">
          Pure metallic strings and elements forged for you
        </p>
      </div>

      {/* Toolbar Options Grid */}
      <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between border-y border-stone-200/60 py-6 mb-10 text-stone-700">
        
        {/* Categories Tab Pill slider */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 hover:bg-stone-200/70 text-stone-650"
              }`}
            >
              {cat === "All" ? "전체 상품" : cat}
            </button>
          ))}
        </div>

        {/* Dynamic Controls Bar */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Search Engine */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="컬렉션을 검색해보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full bg-stone-100 border border-stone-200 pl-9 pr-4 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800 w-[180px] sm:w-[220px]"
            />
          </div>

          {/* Best Sellers check button */}
          <button
            onClick={toggleBestFilter}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              onlyBest
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Best Sellers</span>
          </button>

          {/* Sort selection dropdown */}
          <div className="relative flex items-center space-x-1.5 bg-stone-100 rounded-full px-4 py-2 border border-stone-200">
            <SlidersHorizontal className="h-3 w-3 text-stone-500" />
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="bg-transparent text-xs font-medium focus:outline-none border-none text-stone-700 cursor-pointer"
            >
              <option value="latest">최신순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
            </select>
          </div>

          {/* Reset Filters Icon */}
          <button
            onClick={resetAllFilters}
            title="필터 초기화"
            className="p-2 border border-stone-200 hover:border-stone-800 hover:bg-stone-50 rounded-full transition-all text-stone-500"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Main product display stream section */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="bg-stone-200 rounded-xl aspect-square mb-4" />
              <div className="h-4 bg-stone-200 rounded-sm w-3/4 mb-2" />
              <div className="h-3 bg-stone-200 rounded-sm w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div>
          <div className="text-xs text-stone-400 font-semibold tracking-wider uppercase mb-5">
            showing {filteredProducts.length} beautiful items
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-stone-100 rounded-2xl">
          <Filter className="h-10 w-10 text-stone-300 mb-4" />
          <h3 className="font-serif text-lg text-stone-850 font-semibold">등록된 상품이 없습니다.</h3>
          <p className="text-xs text-stone-500 mt-2 font-normal">
            선택하신 필터 조건에 부합하는 액세서리 상품이 유효하지 않습니다.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-6 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 transition-colors"
          >
            전체 상품 목록으로 필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
