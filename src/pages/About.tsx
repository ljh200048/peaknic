import { Leaf, Award, Compass, Heart } from "lucide-react";
import { motion } from "motion/react";

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      
      {/* Intro Header */}
      <div className="text-center mb-16">
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-stone-900">
          Our Brand Sentiment
        </h1>
        <div className="mx-auto h-[1px] w-12 bg-stone-900/60 mt-4 mb-3" />
        <p className="text-xs uppercase tracking-[0.3em] font-mono text-stone-400">
          Peaknic Craft Studio
        </p>
      </div>

      {/* Philosophy Block with side text */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-center mb-20">
        <div className="relative rounded-2xl overflow-hidden aspect-square border border-stone-100 bg-stone-150">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop"
            alt="Silver ring close up craft"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-6 sm:space-y-8">
          <span className="text-xs font-mono tracking-widest text-stone-400 uppercase font-semibold">
            01 / DESIGN MOTIF
          </span>
          <h2 className="font-serif text-2xl sm:text-3.5xl text-stone-900 tracking-wide font-light">
            Everyday warmth captured in metal.
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed font-light text-justify">
            Peaknic(피크닉)이라는 매력적인 단어는 드넓은 풀밭 위에서 온전한 햇빛을 누리며 얻는 나긋나긋한 평온을 선물합니다. 
            우리는 그 보석 같은 휴식과 고유한 향기를 간소화된 금속선과 단수 주얼리의 형태로 박제하여, 언제 어디서든 따뜻한 무드를 꺼내 입을 수 있도록 연구합니다.
          </p>
          <blockquote className="border-l-2 border-stone-850 pl-4 py-1 text-xs sm:text-sm text-stone-700 font-serif italic">
            "가장 심플할 때 우리는 스스로의 선율을 보다 명확하고 깊게 들여다볼 수 있습니다."
          </blockquote>
        </div>
      </div>

      {/* Pillar Values columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-stone-200/60 pt-16 mb-20 text-stone-700">
        <div className="space-y-3">
          <Compass className="h-6 w-6 text-stone-450" />
          <h3 className="font-serif text-lg text-stone-900 font-medium">Minimal & Modern</h3>
          <p className="text-xs font-light text-stone-550 leading-relaxed">
            과분한 장식을 배제하고 금속 고유의 담백한 곡선과 흠잡을 데 없는 실루엣 만으로 승부합니다. 어떠한 룩에든 완벽하게 물들어 조력하는 액세서리입니다.
          </p>
        </div>

        <div className="space-y-3">
          <Leaf className="h-6 w-6 text-stone-450" />
          <h3 className="font-serif text-lg text-stone-900 font-medium">Daily Hygiene Standard</h3>
          <p className="text-xs font-light text-stone-550 leading-relaxed">
            피부에 오랜 시간 밀착되는 주얼리 특성을 감안해 925 법정 순은, 써지컬 스틸 316L 등 무독성 알러지 방지 소재만을 고집하여 제작 기획을 운용합니다.
          </p>
        </div>

        <div className="space-y-3">
          <Heart className="h-6 w-6 text-stone-450" />
          <h3 className="font-serif text-lg text-stone-900 font-medium">Warm Package for Gift</h3>
          <p className="text-xs font-light text-stone-550 leading-relaxed">
            소중한 분에게 건네는 설레는 선물 카테고리를 고려해, 모든 발송 건에 정갈한 크라프트 파우치와 주얼리 보증 가이드를 고급스럽게 배합하여 무료 포장 제공합니다.
          </p>
        </div>
      </div>

    </div>
  );
}
