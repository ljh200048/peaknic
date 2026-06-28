import React, { useState } from "react";
import { Calendar, Users, MapPin, Sparkles, Send, CheckCircle2, ArrowRight } from "lucide-react";

interface PicnicEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  status: "예약가능" | "마감임박" | "종료";
  description: string;
  capacity: string;
  price: string;
}

export default function EventPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "atelier_class",
    msg: ""
  });

  const upcomingEvents: PicnicEvent[] = [
    {
      id: "ev-01",
      title: "프라이빗 비즈 아틀리에 클래스 (Private Beads Craft Atelier)",
      subtitle: "나만의 원석 & 시드 비즈 주얼리 제작 클래스",
      date: "매주 금, 토, 일",
      time: "14:00 - 16:00 / 17:00 - 19:00",
      location: "종로 Peaknic 아틀리에 쇼룸",
      status: "예약가능",
      description: "정밀하게 선별된 70여 가지 아카이브 비즈와 천연 원석을 조합하여 나만의 시그니처 브레이슬릿, 네클리스, 스마트폰 스트랩을 제작하는 비스포크 원데이 클래스입니다.",
      capacity: "정원 4명 (프라이빗 100% 예약제)",
      price: "65,000 KRW (음료 및 포장 패키지 포함)"
    },
    {
      id: "ev-02",
      title: "한여름 밤의 시티 피크닉 (Midsummer City Peaknic)",
      subtitle: "여름 바람과 비즈 공예가 함께하는 야외 루프탑 워크숍",
      date: "2026. 07. 18 (토)",
      time: "18:30 - 21:00",
      location: "북촌 테라스 팝업 루프탑",
      status: "마감임박",
      description: "한옥 지붕 사이로 지는 시티 노을을 바라보며 시원한 웰컴 티와 함께 여름 무드의 투명 비즈 패키지를 엮어보는 특별 콜라보 피크닉 세션입니다.",
      capacity: "정원 12명",
      price: "85,000 KRW"
    },
    {
      id: "ev-03",
      title: "브랜드 콜라보 비즈 가드닝 (Beads Gardening Atelier)",
      subtitle: "식물 아틀리에와 Peaknic의 리미티드 여름 가드닝 테마",
      date: "2026. 06. 14 (일)",
      time: "13:00 - 15:30",
      location: "서촌 보태니컬 온실 스튜디오",
      status: "종료",
      description: "도심 속 온실 가든에서 어우러지는 플라워 링 & 비즈 주얼리 복합 원데이 세션입니다. 그리너리 무드의 리미티드 비즈 참 키트가 한정 제공되었습니다.",
      capacity: "정원 8명",
      price: "75,000 KRW"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.msg) return;
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      eventType: "atelier_class",
      msg: ""
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20" id="event-page-container">
      
      {/* Intro Header */}
      <div className="text-center mb-16 sm:mb-24">
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-stone-900" id="event-title">
          Atelier & Pop-up Events
        </h1>
        <div className="mx-auto h-[1px] w-12 bg-stone-900/60 mt-4 mb-3" />
        <p className="text-xs uppercase tracking-[0.3em] font-mono text-stone-400">
          Peaknic Craft Experience
        </p>
        <p className="mt-4 text-xs sm:text-sm text-stone-500 font-light max-w-xl mx-auto leading-relaxed">
          피크닉 아카이브 아틀리에에서는 섬세하고 정갈한 손끝의 집중을 경험하는 프라이빗 크래프트 클래스부터 야외에서 즐기는 오가닉 테마의 팝업 워크숍까지, 브랜드 철학을 직접 교감하는 특별한 순간들을 정기적으로 오픈합니다.
        </p>
      </div>

      {/* Grid of Events & Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start" id="event-grid">
        
        {/* Left Col: Upcoming Events List (7 cols) */}
        <div className="lg:col-span-7 space-y-8" id="events-list-section">
          <div className="border-b border-stone-200 pb-4">
            <h3 className="font-serif text-2xl text-stone-900 font-normal">Active & Past Sessions</h3>
            <p className="text-xs text-stone-400 mt-1 font-mono tracking-wider uppercase">Current Schedules</p>
          </div>

          <div className="space-y-6">
            {upcomingEvents.map((ev) => (
              <div 
                key={ev.id}
                className={`bg-white border rounded-2xl p-6 transition-all duration-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-md ${
                  ev.status === "종료" ? "border-stone-200 bg-stone-50/60 opacity-75" : "border-stone-200/90"
                }`}
                id={`event-card-${ev.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                    ev.status === "예약가능" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                      : ev.status === "마감임박"
                      ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                      : "bg-stone-100 text-stone-450 border border-stone-200"
                  }`}>
                    {ev.status}
                  </span>
                  
                  <div className="flex items-center text-stone-400 text-xs font-mono">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{ev.date}</span>
                  </div>
                </div>

                <h4 className="font-serif text-lg text-stone-900 font-medium tracking-tight mb-1">
                  {ev.title}
                </h4>
                <p className="text-xs text-stone-500 font-light mb-4">
                  {ev.subtitle}
                </p>

                <p className="text-xs text-stone-600 leading-relaxed font-light mb-5 bg-stone-50/70 p-3.5 rounded-lg border border-stone-100">
                  {ev.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-stone-100 pt-4 text-stone-500">
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-stone-400" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-stone-400" />
                    <span>{ev.capacity}</span>
                  </div>
                </div>

                {ev.status !== "종료" && (
                  <div className="mt-4 pt-3 flex justify-between items-center border-t border-stone-100/50 text-xs">
                    <span className="font-mono text-stone-400">참가 비용</span>
                    <span className="font-serif font-medium text-stone-900 text-sm">{ev.price}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4.5 bg-stone-50 border border-stone-200/50 rounded-2xl text-xs space-y-1.5">
            <h5 className="font-bold text-stone-850 flex items-center">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 mr-1" />
              단체 오더 및 프라이빗 클래스 제안
            </h5>
            <p className="text-stone-500 font-light leading-relaxed">
              가정 내 소규모 홈파티 체험, 소모임 클래스, 기업 사내 힐링 워크숍 등 인원수와 장소에 맞는 맞춤형 출강 가이드를 제공합니다. 우측 신청 폼을 통해 편하게 문의해 주시면 정밀 기획안을 송부드립니다.
            </p>
          </div>
        </div>

        {/* Right Col: Booking/Inquiry Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]" id="event-booking-section">
          <h4 className="font-serif text-xl text-stone-900 font-medium mb-1">Reservation & Request</h4>
          <p className="text-xs text-stone-400 font-light mb-6">참가 예약 및 맞춤 클래스 문의 접수</p>
          
          {submitted ? (
            <div className="text-center py-12" id="submitted-success-view">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 stroke-[1.5]" />
              <h5 className="font-serif text-lg text-stone-900 font-medium">신청이 정갈하게 전달되었습니다</h5>
              <p className="text-xs text-stone-500 mt-2.5 leading-relaxed font-light">
                피크닉 아틀리에 담당자가 기재해주신 이메일 및 전화번호를 통해 빠른 안내(영업일 기준 24시간 내)를 지원해 드리겠습니다. Peaknic에 대한 따스한 관심에 감사드립니다.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 inline-flex items-center text-xs text-stone-600 hover:text-stone-900 font-semibold border-b border-stone-600 pb-0.5 hover:border-stone-900 transition-colors"
              >
                <span>새로운 예약/문의 작성</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="event-reservation-form">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">이름 (Name)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예약하시는 분 성함"
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">연락처 (Phone)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="안내 수신 가능한 휴대폰 번호"
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">이메일 주소 (Email)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="예약 확인 메일을 받으실 주소"
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">체험 / 문의 유형 (Selection)</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
                >
                  <option value="atelier_class">1:1 프라이빗 비즈 아틀리에 클래스</option>
                  <option value="city_picnic">한여름 밤의 시티 피크닉 야외 워크숍</option>
                  <option value="corporate_bulk">기업 제휴 / 대량 비스포크 오더 클래스</option>
                  <option value="general">기타 브랜드 협업 및 제안</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1">메시지 및 예약 일시 (Message)</label>
                <textarea
                  rows={4}
                  required
                  value={formData.msg}
                  onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                  placeholder="희망 일시, 참여 인원, 또는 구체적인 제안 내용을 작성해 주세요."
                  className="w-full rounded-lg bg-stone-50/70 border border-stone-200/70 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center rounded-full bg-stone-900 border border-stone-900 font-medium text-xs text-white tracking-widest uppercase p-3 hover:bg-stone-800 transition-all duration-200"
              >
                <Send className="h-3 w-3 mr-1.5" />
                <span>Submit RSVP / Inquiry</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
