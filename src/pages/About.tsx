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
            Everyday warmth hand-woven in beads.
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed font-light text-justify">
            Peaknic(피크닉)이라는 매력적인 단어는 드넓은 풀밭 위에서 온전한 햇빛을 누리며 얻는 나긋나긋한 평온을 선물합니다. 
            우리는 그 보석 같은 휴식과 고유한 향기를 다채로운 천연석 비즈, 영롱한 무라노 글라스, 우아한 담수진주에 정성껏 엮어내어, 언제 어디서든 따뜻한 무드를 꺼내 입을 수 있도록 연구합니다.
          </p>
          <blockquote className="border-l-2 border-stone-850 pl-4 py-1 text-xs sm:text-sm text-stone-700 font-serif italic">
            "가장 단순하고 자연스러운 소재일 때 우리는 스스로의 선율을 보다 명확하고 깊게 들여다볼 수 있습니다."
          </blockquote>
        </div>
      </div>

      {/* Pillar Values columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-stone-200/60 pt-16 mb-20 text-stone-700">
        <div className="space-y-3">
          <Compass className="h-6 w-6 text-stone-450" />
          <h3 className="font-serif text-lg text-stone-900 font-medium">Sensory Handcrafted</h3>
          <p className="text-xs font-light text-stone-550 leading-relaxed">
            한 알 한 알 손끝으로 고른 프리미엄 비즈의 섬세한 배치와 편안하고 영롱한 조화 만을 생각합니다. 어떠한 데일리 룩에든 완벽하게 물들어 조력하는 수제 팔찌입니다.
          </p>
        </div>

        <div className="space-y-3">
          <Leaf className="h-6 w-6 text-stone-450" />
          <h3 className="font-serif text-lg text-stone-900 font-medium">Nature-derived Quality</h3>
          <p className="text-xs font-light text-stone-550 leading-relaxed">
            살결에 오랜 시간 닿는 팔찌의 특성을 고려해 최고급 TOHO 유리 비즈, 고탄성 프리미엄 우레탄사, 천연석 원석과 천연 담수진주만을 선별하여 정교하게 손 제작합니다.
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
