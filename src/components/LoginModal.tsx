import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Shield, User, LogIn, Sparkles, Check, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginAdmin, loginMember } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"member" | "admin">("member");
  
  // Member States
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  
  // Admin States
  const [passcode, setPasscode] = useState("");
  
  // Feedback states
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!memberName.trim()) {
      setErrorMsg("성함을 입력해주세요.");
      return;
    }
    if (!memberEmail.trim()) {
      setErrorMsg("이메일 주소를 입력해주세요.");
      return;
    }

    loginMember(memberName.trim(), memberEmail.trim());
    setSuccessMsg(`${memberName}님, 반갑고 고요한 첫걸음을 환영합니다.`);
    
    setTimeout(() => {
      setSuccessMsg("");
      setMemberName("");
      setMemberEmail("");
      onClose();
    }, 1200);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const isSuccess = loginAdmin(passcode);
    if (isSuccess) {
      setSuccessMsg("관리자(Admin Mode) 인증에 성공하였습니다.");
      setTimeout(() => {
        setSuccessMsg("");
        setPasscode("");
        onClose();
      }, 1200);
    } else {
      setErrorMsg("비밀번호가 일치하지 않습니다. 올바른 열쇠를 입력해 주십시오.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          {/* Backdrop click closer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-[#FAF9F6] p-6 shadow-2xl z-10 text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Title / Mood Header */}
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-mono">PEAKNIC MEMORANDUM</span>
              <h2 className="font-serif text-xl font-normal text-stone-900 mt-1">로그인 서비스</h2>
              <p className="text-xs text-stone-500 font-serif italic mt-0.5">Everyday comfort and beautiful accessories</p>
            </div>

            {/* Custom Tab Toggles */}
            <div className="flex border-b border-stone-200 mb-5 text-sm font-medium">
              <button
                onClick={() => {
                  setActiveTab("member");
                  setErrorMsg("");
                }}
                className={`flex-1 pb-2.5 text-center transition-all ${
                  activeTab === "member"
                    ? "border-b-2 border-stone-800 text-stone-900 font-semibold"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                일반 회원 로그인
              </button>
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setErrorMsg("");
                }}
                className={`flex-1 pb-2.5 text-center transition-all ${
                  activeTab === "admin"
                    ? "border-b-2 border-stone-800 text-stone-900 font-semibold"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                관리자 세션 로그인
              </button>
            </div>

            {/* Form Panels container */}
            <div className="min-h-[190px]">
              {activeTab === "member" ? (
                /* Member/Customer Mode login Form */
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">성 성함 또는 별칭</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-400">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="이름을 입력해 주십시오 (예: 홍길동)"
                        className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3.5 py-2 text-xs focus:border-stone-850 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">이메일 주소</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-400">
                        <LogIn className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="email"
                        required
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3.5 py-2 text-xs focus:border-stone-850 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-stone-800 transition-colors"
                  >
                    일반 로그인 완료하기
                  </button>
                </form>
              ) : (
                /* Admin/Passcode Mode login Form */
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">마스터 보안 키 (Admin Passcode)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-400">
                        <Shield className="h-3.5 w-3.5 text-amber-600" />
                      </span>
                      <input
                        type="password"
                        required
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="보안 패스코드를 입력해 주십시오"
                        className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3.5 py-2 text-xs focus:border-stone-850 focus:outline-hidden text-center tracking-widest font-mono"
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-stone-400 flex items-center">
                      <HelpCircle className="h-3 w-3 mr-1 text-stone-400" />
                      관리용 보안 마스터 패스코드는 <span className="font-semibold text-amber-700 ml-1">peaknic123</span> 입니다.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-stone-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    <span>관리자 자격 인증</span>
                  </button>
                </form>
              )}
            </div>

            {/* Error Feedback alerts */}
            {errorMsg && (
              <p className="mt-4 text-xs font-medium text-red-600 bg-red-50 rounded-lg p-2.5 text-center">
                {errorMsg}
              </p>
            )}

            {/* Success Feedback alerts */}
            {successMsg && (
              <div className="mt-4 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg p-2.5 flex items-center justify-center text-center">
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600 stroke-[3]" />
                <span>{successMsg}</span>
              </div>
            )}
            
            {/* Visual bottom subtle frame info */}
            <div className="mt-6 border-t border-stone-150 pt-4 text-[10px] text-stone-400 text-center">
              주얼리 라이프스타일 큐레이션숍 · Peaknic 2026
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
