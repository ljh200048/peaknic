import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { Sparkles, Eye, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  // Empty image placeholder logic as requested
  const displayImage = product.imageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-100 bg-[#FAF9F6] p-3 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Category header small and mini tags */}
      <div className="mb-2 flex items-center justify-between text-[11px] font-mono tracking-wider text-stone-400">
        <span>{product.category.toUpperCase()}</span>
        <div className="flex space-x-1.5">
          {product.isNew && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-emerald-700 font-sans border border-emerald-100">
              NEW
            </span>
          )}
          {product.isBest && (
            <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-amber-700 font-sans border border-amber-100">
              BEST
            </span>
          )}
        </div>
      </div>

      {/* Main Square Image Slot */}
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden rounded-lg bg-stone-100 aspect-square">
        <img
          src={displayImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center space-x-1 bg-[#FAF9F6]/90 shadow-md backdrop-blur-xs px-3.5 py-2 rounded-full text-xs text-stone-800 font-medium">
            <Eye className="h-3.5 w-3.5 mr-1" />
            <span>상세 보기</span>
          </span>
        </div>

        {/* Sold Out Stamp Overlay */}
        {product.isSoldOut && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF9F6]/80 backdrop-blur-[1px]">
            <div className="rounded-full bg-stone-900/90 text-[10px] text-white px-3.5 py-1.5 font-bold tracking-widest uppercase">
              SOLD OUT
            </div>
          </div>
        )}
      </Link>

      {/* Accessory Info Block */}
      <div className="mt-3.5 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="group-hover:text-stone-700 transition-colors">
          <h3 className="font-serif text-sm font-medium tracking-wide text-stone-900 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        {/* Secondary Info attributes */}
        <p className="mt-1 text-[11px] text-stone-500 font-normal line-clamp-1">
          {product.material} · {product.color}
        </p>

        {/* Price layout */}
        <div className="mt-2.5 flex items-baseline justify-between border-t border-stone-100 pt-2">
          <span className="font-serif text-xs font-bold text-stone-500 uppercase tracking-wider">
            Price
          </span>
          <span className="font-sans text-sm font-semibold text-stone-850">
            {product.price.toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>
    </motion.div>
  );
}
