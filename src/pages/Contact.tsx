import { Mail, Phone, MapPin, Instagram, Bookmark, Send } from "lucide-react";
import React, { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", msg: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.msg) return;
    setSubmitted(true);
    setFormData({ name: "", email: "", msg: "" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      
      {/* Intro Header */}
      <div className="text-center mb-16">
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-stone-900">
          Contact Peaknic
        </h1>
        <div className="mx-auto h-[1px] w-12 bg-stone-900/60 mt-4 mb-3" />
        <p className="text-xs uppercase tracking-[0.3em] font-mono text-stone-400">
          Connect with the founders of Peaknic
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-start">
        
        {/* Info Col */}
        <div className="space-y-8 text-stone-700">
          <div>
            <h3 className="font-serif text-xl text-stone-900 font-medium mb-3">Inquiries & Feedback</h3>
            <p className="text-xs text-stone-550 leading-relaxed font-light">
              Peaknic은 열린 소통과 정교한 피드백을 수용하여 한 걸음씩 보완해나갑니다. 브랜드 입점 제안, 협업 문의, 대량 선물 제작 오더, 또는 기타 서비스 이용 관련 불편사항은 메일 또는 인스타그램을 이용해주시면 24시간 내에 친절한 수신을 지원합니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <Mail className="h-4.5 w-4.5 mr-3 text-stone-450 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-stone-855 tracking-wider uppercase mb-0.5">Email ADDRESS</h5>
                <p className="text-xs text-stone-600">peaknic.official@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <Instagram className="h-4.5 w-4.5 mr-3 text-stone-450 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-stone-855 tracking-wider uppercase mb-0.5">INSTAGRAM DIGITAL ATELIER</h5>
                <a href="https://instagram.com/peaknic_archive" target="_blank" rel="noreferrer" className="text-xs text-stone-605 underline hover:text-stone-900">
                  @peaknic_archive
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-4.5 w-4.5 mr-3 text-stone-450 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-stone-855 tracking-wider uppercase mb-0.5">HEAD OFFICE & SHOWROOM</h5>
                <p className="text-xs text-stone-600">서울특별시 종로구 주얼리 타운 서라로 5길 12, Peaknic 아틀리에</p>
              </div>
            </div>
          </div>

          <div className="p-4.5 bg-stone-50 border border-stone-200/50 rounded-xl text-xs">
            <h5 className="font-bold text-stone-800 mb-1">Showroom Guidelines</h5>
            <p className="text-stone-550 font-light leading-relaxed">
              * 오프라인 쇼룸은 100% 네이버 사전 예약제로 프라이빗하게 운영되고 있습니다. 예약 없이 내방하시는 경우 입장 및 제품 수령에 시간이 소요될 수 있는 점 양해 부탁드립니다.
            </p>
          </div>
        </div>

        {/* Email Form Col */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h4 className="font-serif text-lg text-stone-900 font-medium mb-6">Leave us a direct trace</h4>
          
          {submitted ? (
            <div className="text-center py-12">
              <Bookmark className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
              <h5 className="font-bold text-stone-850">문의가 정갈하게 전달되었습니다</h5>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                피크닉의 아틀리에 담당자가 등록된 이메일 계정을 통하여 빠른 답변(영업일 기준 24시간 내)을 보내드리겠습니다. 소중한 의견 진심으로 감사합니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">NAMES (이름)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="성함을 입력하세요"
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">EMAIL ADDRESS (이메일)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="답변 받으실 이메일을 입력하세요"
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">MESSAGE DESCRIPTION (문의 내용)</label>
                <textarea
                  rows={4}
                  required
                  value={formData.msg}
                  onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                  placeholder="브랜드에 전하고 싶은 메시지나 제품 문의를 입력하세요"
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center rounded-full bg-stone-900 border border-stone-900 font-medium text-xs text-white tracking-widest uppercase p-3 hover:bg-stone-800 transition-all duration-200"
              >
                <Send className="h-3 w-3 mr-1.5" />
                <span>Submit inquiry</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
