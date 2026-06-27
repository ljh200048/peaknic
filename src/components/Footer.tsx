import { Link } from "react-router-dom";
import { Mail, Instagram, MapPin, Clock, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FAF9F6] border-t border-stone-200 mt-20 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-stone-200/65">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-1">
            <span className="font-serif text-xl tracking-[0.2em] text-stone-900 block mb-3">Peaknic</span>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              Everyday Beaded Bracelets for Your Mood. 천연석 비즈, 맑은 무라노 글라스, 담수진주를 오가닉하게 엮어내어 일상에 편안하게 녹아드는 수제 비즈 팔찌 전문 몰입니다. 
            </p>
          </div>

          {/* Col 2: Categories quick access */}
          <div>
            <h4 className="font-serif text-sm tracking-widest text-stone-900 uppercase mb-4">Categories</h4>
            <ul className="space-y-2.5 text-xs text-stone-500 font-medium">
              <li><Link to="/shop?category=Beaded Bracelets" className="hover:text-stone-900 transition-colors">Beaded Bracelets (비즈 팔찌)</Link></li>
              <li><Link to="/shop?category=Couples/Friends" className="hover:text-stone-900 transition-colors">Couples/Friends (커플/우정 팔찌)</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Inquiry details */}
          <div>
            <h4 className="font-serif text-sm tracking-widest text-stone-900 uppercase mb-4">Customer Support</h4>
            <ul className="space-y-3 text-xs text-stone-500">
              <li className="flex items-start">
                <Mail className="h-3.5 w-3.5 mr-2 text-stone-400 mt-0.5" />
                <span>CS 문의: peaknic.official@gmail.com</span>
              </li>
              <li className="flex items-start">
                <Instagram className="h-3.5 w-3.5 mr-2 text-stone-400 mt-0.5" />
                <a href="https://instagram.com/peaknic_archive" target="_blank" rel="noreferrer" className="underline hover:text-stone-900">
                  @peaknic_archive
                </a>
              </li>
              <li className="flex items-start">
                <Clock className="h-3.5 w-3.5 mr-2 text-stone-400 mt-0.5" />
                <span>CS 업무: Mon - Fri (11:00 - 17:00), Sat/Sun/Holiday off</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Shop guide notices */}
          <div>
            <h4 className="font-serif text-sm tracking-widest text-stone-900 uppercase mb-4">Shop Information</h4>
            <p className="text-[11px] text-stone-500 leading-relaxed mb-4">
              정밀하고 정성 어린 검수 프로세스를 거친 후 정갈한 크라프트 패키징에 담아 고객님께 배송됩니다. 선물하기 전용 쇼핑백 옵션은 상세페이지를 통해 체크하실 수 있습니다.
            </p>
            <div className="inline-flex items-center text-xs font-semibold text-stone-800 border-b border-stone-800 pb-0.5 cursor-default">
              <span>Peaknic, Everyday Warmth</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright and detail indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] text-stone-400 font-medium tracking-wider">
          <div>
            &copy; {currentYear} Peaknic. All Rights Reserved. Designed for minimalist daily mood.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="cursor-help hover:text-stone-600 transition-colors">이용안내 · Terms of Use</span>
            <span className="cursor-help hover:text-stone-600 transition-colors">개인정보처리방침 · Privacy Policy</span>
            <span className="cursor-help hover:text-stone-600 transition-colors">배송 및 귀금속 환불 규정</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
