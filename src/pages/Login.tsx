import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Shield, User, LogIn, Check, HelpCircle, ArrowLeft, 
  Sparkles, KeyRound, ChevronDown, ChevronUp, ClipboardCheck, UserPlus 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Login() {
  const { signInUser, signUpUser, loginUser, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to find if there is a redirection target
  const from = (location.state as any)?.from?.pathname || "/mypage";
  
  // UI Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Form States
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [agreeConsent, setAgreeConsent] = useState(false);
  const [showConsentDetail, setShowConsentDetail] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Feedback states
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // If already logged in, redirect immediately
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [currentUser, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setErrorMsg("이메일 주소를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMsg("비밀번호를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    if (activeTab === "register") {
      if (!trimmedName) {
        setErrorMsg("성함 또는 닉네임을 입력해주세요.");
        setIsLoading(false);
        return;
      }
      if (!agreeConsent) {
        setErrorMsg("개인정보 수집 및 이용 동의가 필요합니다.");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (activeTab === "register") {
        await signUpUser(trimmedEmail, password, trimmedName);
        setSuccessMsg("피크닉 아틀리에 회원가입을 축하드립니다! 반갑습니다.");
      } else {
        await signInUser(trimmedEmail, password);
        setSuccessMsg("인증에 성공하여 안전하게 로그인되었습니다.");
      }
      
      setTimeout(() => {
        setSuccessMsg("");
        setEmail("");
        setPassword("");
        setName("");
        setAgreeConsent(false);
        
        // Redirect based on role
        if (trimmedEmail === "peaknic.official@gmail.com" || trimmedEmail === "admin@peaknic.com" || password === "lch04141!!") {
          navigate("/admin");
        } else {
          navigate(from);
        }
      }, 1200);
    } catch (err: any) {
      console.error("Authentication error details:", err);
      setErrorMsg(err.message || "인증 오류가 발생했습니다. 다시 시도해 주십시오.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6]" id="login-page-container">
      <motion.div 
         initial={{ opacity: 0, y: 15 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         className="w-full max-w-md space-y-6"
      >
        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center space-x-2 text-xs text-stone-500 hover:text-stone-900 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-stone-100/50"
          id="btn-back-to-previous"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>이전 페이지로 돌아가기</span>
        </button>

        {/* Elegant unified card container */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-8 shadow-xl text-stone-900" id="login-card">
          
          {/* Logo & Mood Header */}
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-mono">PEAKNIC INTEGRATED PORTAL</span>
            <h2 className="font-serif text-2xl font-normal text-stone-900 mt-2 tracking-wide">
              {activeTab === "login" ? "로그인" : "회원가입"}
            </h2>
            <p className="text-xs text-stone-400 font-serif italic mt-1">Everyday comfort and beautiful accessories</p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-stone-100 rounded-xl" id="login-tabs">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "login" 
                  ? "bg-white text-stone-900 shadow-sm" 
                  : "text-stone-500 hover:text-stone-900"
              }`}
              id="tab-login-btn"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>로그인</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "register" 
                  ? "bg-white text-stone-900 shadow-sm" 
                  : "text-stone-500 hover:text-stone-900"
              }`}
              id="tab-register-btn"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>회원가입</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="unified-login-form">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                이메일 주소 <span className="text-amber-600 font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <LogIn className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs focus:border-stone-800 focus:bg-white focus:outline-hidden transition-all shadow-inner"
                  id="input-login-email"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                비밀번호 <span className="text-amber-600 font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-stone-400">
                  <KeyRound className="h-4 w-4 text-stone-450" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자 이상)"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs focus:border-stone-800 focus:bg-white focus:outline-hidden transition-all shadow-inner font-mono tracking-widest"
                  id="input-login-password"
                />
              </div>
            </div>

            {/* Name field (Only visible in Register mode) */}
            <AnimatePresence initial={false}>
              {activeTab === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden space-y-1.5"
                >
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-1">
                    성함 / 닉네임 <span className="text-amber-600 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-stone-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required={activeTab === "register"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="아틀리에 서비스용 닉네임"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs focus:border-stone-800 focus:bg-white focus:outline-hidden transition-all shadow-inner"
                      id="input-login-name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agreement & Information Consent Panel (Only visible in Register mode) */}
            <AnimatePresence initial={false}>
              {activeTab === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden space-y-2 pt-2 border-t border-stone-100"
                  id="privacy-consent-panel"
                >
                  <div className="flex items-start space-x-2.5">
                    <input
                      type="checkbox"
                      id="checkbox-privacy-consent"
                      checked={agreeConsent}
                      onChange={(e) => setAgreeConsent(e.target.checked)}
                      className="mt-1 h-3.5 w-3.5 rounded-sm border-stone-300 text-stone-900 focus:ring-stone-500"
                    />
                    <label 
                      htmlFor="checkbox-privacy-consent" 
                      className="text-[11px] text-stone-600 select-none cursor-pointer leading-tight font-medium"
                    >
                      개인정보 수집 및 이용약관에 동의합니다 <span className="text-amber-600 font-semibold">(필수)</span>
                    </label>
                  </div>

                  {/* Consent policy detail toggle accordian */}
                  <div className="bg-stone-50/80 border border-stone-200/60 rounded-xl p-2.5">
                    <button
                      type="button"
                      onClick={() => setShowConsentDetail(!showConsentDetail)}
                      className="w-full flex justify-between items-center text-[10px] font-semibold text-stone-500 uppercase tracking-wide hover:text-stone-800 transition-colors"
                    >
                      <span className="flex items-center space-x-1">
                        <ClipboardCheck className="h-3 w-3 text-stone-400" />
                        <span>개인정보 수집 이용 안내 전문</span>
                      </span>
                      {showConsentDetail ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <AnimatePresence>
                      {showConsentDetail && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[9.5px] text-stone-500 leading-relaxed mt-2 space-y-1.5 border-t border-stone-200/50 pt-2 font-light"
                        >
                          <p><strong>1. 수집하는 개인정보 항목</strong><br />• 필수항목: 이메일 주소, 비밀번호, 성함/닉네임, 프로필 이미지 정보</p>
                          <p><strong>2. 수집 및 이용 목적</strong><br />• 피크닉 아틀리에 회원 가입 및 관리<br />• 제작 요청, 위시리스트, 주문 이력 추적 및 배송 관리 서비스 제공</p>
                          <p><strong>3. 개인정보의 보유 및 이용 기간</strong><br />• 회원의 개인정보는 회원 탈퇴 시 또는 서비스 종료 즉시 안전하게 파기 처리됩니다.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart Instructions Box for Login Mode */}
            {activeTab === "login" && (
              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 text-[10px] text-stone-500 leading-relaxed space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-stone-700 uppercase tracking-wider mb-1">
                  <HelpCircle className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>안내사항</span>
                </div>
                <p>• 가입하신 이메일과 비밀번호를 사용하여 로그인할 수 있습니다.</p>
                <p>• 계정이 없는 경우, <span className="font-semibold text-stone-800 underline cursor-pointer" onClick={() => setActiveTab("register")}>회원가입 탭</span>을 클릭하여 간편하게 가입하세요.</p>
                <p>• 관리자 이메일과 자격 증명을 입력하면 관리자 대시보드로 진입합니다.</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (activeTab === "register" && !agreeConsent)}
              className="w-full rounded-xl bg-stone-900 py-3 text-xs font-semibold text-white shadow-md hover:bg-stone-800 active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              id="btn-unified-submit"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>
                {isLoading 
                  ? "처리 중..." 
                  : activeTab === "login" 
                    ? "로그인하기" 
                    : "동의하고 가입하기"
                }
              </span>
            </button>
          </form>

          {/* Feedback Alerts */}
          <div className="relative min-h-[40px] mt-4">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium text-red-600 bg-red-50 rounded-xl p-3 text-center border border-red-150"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-xl p-3 flex items-center justify-center text-center border border-emerald-150"
              >
                <Check className="h-4 w-4 mr-2 text-emerald-600 stroke-[3] shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </div>
          
          {/* Brand Info Footnote */}
          <div className="mt-6 border-t border-stone-100 pt-4 text-[10px] text-stone-400 text-center">
            비즈 쥬얼리 및 홈메이드 소품 아틀리에 · Peaknic 2026
          </div>
        </div>
      </motion.div>
    </div>
  );
}
