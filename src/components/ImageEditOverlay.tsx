import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Camera, Edit3, X, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageEditOverlayProps {
  collectionName: "products" | "siteSettings" | string;
  docId: string;
  fieldName: string;
  currentValue: string;
  onUpdateSuccess?: (newUrl: string) => void;
  className?: string;
  label?: string;
}

const PRESET_IMAGES = [
  {
    title: "실버 링 (Ring)",
    url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "실버 목걸이 (Necklace)",
    url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "체인 팔찌 (Bracelet)",
    url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "젬스톤 이어링 (Earrings)",
    url: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "로즈 골드 링 (Rose Ring)",
    url: "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "라이프스타일 에디토리얼",
    url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "미니멀 주얼리 무드",
    url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "어텀 실트 에스테틱",
    url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop",
  },
];

export default function ImageEditOverlay({
  collectionName,
  docId,
  fieldName,
  currentValue,
  onUpdateSuccess,
  className = "",
  label = "이미지 변경",
}: ImageEditOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageUrl(currentValue);
    setFeedbackMsg("");
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!imageUrl.trim()) {
      setFeedbackMsg("올바른 이미지 주소를 입력하거나 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg("");

    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [fieldName]: imageUrl.trim(),
        updatedAt: new Date().toISOString(),
      });

      setFeedbackMsg("성공적으로 저장되었습니다!");
      if (onUpdateSuccess) {
        onUpdateSuccess(imageUrl.trim());
      }
      
      // Close after short success animation
      setTimeout(() => {
        setIsOpen(false);
      }, 900);
    } catch (err) {
      console.error("Failed to update image in Firestore:", err);
      setFeedbackMsg("이미지를 수정할 권한이 없거나 에러가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPreset = (url: string) => {
    setImageUrl(url);
  };

  return (
    <>
      {/* Absolute Admin Edit Action Trigger */}
      <div className={`absolute top-4 right-4 z-30 ${className}`}>
        <button
          onClick={handleOpen}
          type="button"
          className="flex items-center space-x-1.5 rounded-full bg-stone-900/95 px-3.5 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-stone-850 hover:scale-[1.03] border border-white/20"
        >
          <Camera className="h-3 w-3 text-amber-400" />
          <span>{label}</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
            {/* Modal card backdrop closer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={handleClose}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-[#FAF9F6] p-6 shadow-2xl z-10 text-stone-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-stone-100 p-1.5 text-stone-800">
                    <Edit3 className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-stone-900">이미지 실시간 변경</h3>
                    <p className="text-[10px] text-stone-400 font-mono tracking-tight uppercase">Admin Real-time Image Tool</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Preview Frame */}
                <div className="flex flex-col items-center">
                  <span className="self-start text-[11px] font-medium text-stone-500 mb-1.5">새 이미지 미리보기</span>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-stone-100 border border-stone-200/60">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback check
                          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                        <ImageIcon className="h-8 w-8 text-stone-300 stroke-1 mb-1 block" />
                        <span>이미지 주소를 입력해 주십시오</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">직접 이미지 웹 주소 (URL) 입력</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... 주소를 붙여넣으세요"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs focus:border-stone-850 focus:outline-hidden"
                  />
                </div>

                {/* Or presets category selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-stone-500">Peaknic 감성 프리셋 선택</span>
                    <span className="text-[9px] text-amber-700 bg-amber-50 rounded-md px-1.5 py-0.5 flex items-center font-semibold">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Quick Selection
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.title}
                        type="button"
                        onClick={() => selectPreset(img.url)}
                        className={`group relative aspect-square overflow-hidden rounded-md border-2 transition-all duration-150 ${
                          imageUrl === img.url ? "border-amber-600 scale-[0.98]" : "border-transparent hover:border-stone-300"
                        }`}
                        title={img.title}
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 bg-stone-900/70 py-0.5 text-[9px] text-white text-center truncate">
                          {img.title.split(" ")[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback or Actions */}
                {feedbackMsg && (
                  <p className="text-center text-xs font-medium text-amber-700 bg-amber-50 rounded-lg p-2 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    {feedbackMsg}
                  </p>
                )}

                <div className="flex justify-end space-x-2.5 pt-2 border-t border-stone-200/60">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-1.5 rounded-lg bg-stone-900 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>저장 중...</span>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>저장하기</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
