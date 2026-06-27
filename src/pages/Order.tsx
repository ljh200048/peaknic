import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Order } from "../types";
import { ShoppingBag, CheckCircle, AlertCircle, FileText, User, MapPin, Notebook, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();

  // Load product options from query params
  const productId = searchParams.get("productId") || "";
  const productName = searchParams.get("productName") || "";
  const productPrice = Number(searchParams.get("price")) || 0;
  const selectedSize = searchParams.get("size") || "";
  const selectedColor = searchParams.get("color") || "";

  // Input states
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [memo, setMemo] = useState("");

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Auto-fill from logged-in user session
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!depositorName) setDepositorName(currentUser.name);
    }
  }, [currentUser]);

  // Auto-fill depositor name with customer name for convenience
  useEffect(() => {
    if (!depositorName && customerName) {
      setDepositorName(customerName);
    }
  }, [customerName]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation checks - Guideline 9: "주문 입력값이 비어 있으면 안내 문구가 나오게 해줘"
    if (!productId || !productName || productPrice <= 0) {
      setErrorMsg("선택된 상품 정보가 유효하지 않습니다. 상품 상세 화면에서 주문을 시작해주세요.");
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg("주문자 성함(이름)을 입력하셔야 주문을 진행할 수 있습니다.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("연락처(전화번호)를 기입하셔야 물류 안내 문자를 받아보실 수 있습니다.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("정확한 배송지 주소가 기재되어야 오배송을 사전에 방지할 수 있습니다.");
      return;
    }
    if (!depositorName.trim()) {
      setErrorMsg("무통장 입금 확인을 위하여 정확한 입금자명을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const orderData: any = {
        productId,
        productName: productName + (selectedSize || selectedColor ? ` (${[selectedSize, selectedColor].filter(Boolean).join(" / ")})` : ""),
        price: productPrice,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        depositorName: depositorName.trim(),
        memo: memo.trim(),
        status: "접수", // default starting status
        createdAt: new Date().toISOString(),
        userId: currentUser?.uid || null
      };

      // Push to Firestore "orders" collection
      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      // Save order payload locally to render the successful receipt card
      const completeOrder: Order = {
        id: docRef.id,
        ...orderData,
      };

      // Update document on Firestore to keep ID synced inside the record (clean practice)
      await updateDoc(doc(db, "orders", docRef.id), { id: docRef.id });

      // If logged in, update user's orders history and clear their cart if they ordered from cart!
      if (currentUser) {
        const currentOrders = currentUser.orders || [];
        const updatedOrders = [...currentOrders, completeOrder];
        
        // Also remove from cart since the order has been placed
        const updatedCart = (currentUser.cart || []).filter(item => item.productId !== productId);
        
        await updateProfile({ 
          orders: updatedOrders,
          cart: updatedCart
        });
      }

      setOrderSuccess(completeOrder);
    } catch (err) {
      console.error("Critical error while uploading order to Firestore:", err);
      setErrorMsg("주문 데이터를 전송하는 도중 예상치 못한 서버 지연이 발생하였습니다. 잠시 후 감사히 다시 시도해 주십시오.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-10 shadow-lg text-stone-700"
        >
          <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-light text-stone-900 tracking-wide">
            주문이 접수되었습니다.
          </h1>
          <p className="text-xs text-stone-500 mt-2">
            Peaknic을 찾아 주셔서 고맙습니다. 정성껏 수작업을 거쳐 안전히 전달하겠습니다.
          </p>

          {/* Bank details for 1st MVP transfer */}
          <div className="my-6 bg-stone-50 border border-stone-200/40 rounded-xl p-4 text-xs text-left space-y-1.5">
            <h5 className="font-bold text-stone-800 flex items-center mb-1 bg-amber-50 text-[10px] text-amber-800 uppercase px-2 py-0.5 rounded-sm self-start inline-flex">
              무통장 입금 안내 계좌
            </h5>
            <div className="font-semibold text-stone-900 text-sm py-1">농협은행 302-1234-5678-01 (예금주: Peaknic)</div>
            <div className="text-stone-550 leading-relaxed font-light">
              • 입금하실 금액: <strong className="text-stone-900 font-bold">{(orderSuccess.price + (orderSuccess.price >= 30000 ? 0 : 3000)).toLocaleString("ko-KR")}원</strong> (배송비 포함)
              <br />
              • 입금 약속 기한: 주문 접수일 기준 48시간 이내 미입금 시 자동 취소됩니다.
              <br />
              • 입금자 성함: <strong className="text-stone-900 font-bold">{orderSuccess.depositorName}</strong>
            </div>
          </div>

          {/* Receipt details */}
          <div className="border-t border-stone-150 pt-5 text-left text-xs space-y-2">
            <h4 className="font-bold text-stone-900 tracking-wider text-[11px] uppercase mb-1.5 flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1 text-stone-500" />
              주문 상세 내역 (Receipt details)
            </h4>
            <div className="flex justify-between"><span className="text-stone-450">주문 접수 번호</span><span className="font-mono text-stone-700 text-[10px] font-bold uppercase">{orderSuccess.id}</span></div>
            <div className="flex justify-between"><span className="text-stone-450">주문 제품명</span><span className="font-semibold text-stone-900">{orderSuccess.productName}</span></div>
            <div className="flex justify-between"><span className="text-stone-450">주문자 및 수령인명</span><span className="text-stone-700 font-medium">{orderSuccess.customerName}</span></div>
            <div className="flex justify-between"><span className="text-stone-450">연락처</span><span className="text-stone-700 font-medium">{orderSuccess.phone}</span></div>
            <div className="flex justify-between"><span className="text-stone-450">배송지 주소</span><span className="text-stone-700 font-medium truncate max-w-[280px]">{orderSuccess.address}</span></div>
          </div>

          <div className="mt-8 flex flex-col space-y-3">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-full bg-stone-900 text-white font-medium text-xs px-6 py-3 shadow-md hover:bg-stone-800 duration-200"
            >
              <span>계속 쇼핑하기</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Editorial Title banner */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl tracking-wide text-stone-900">Checkout</h1>
        <div className="mx-auto h-[1px] w-12 bg-stone-900/60 mt-3 mb-2" />
        <p className="text-xs uppercase tracking-widest text-stone-400 font-mono">
          Enter details to draft your order form
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: Order Input Form (takes 2/3 space) */}
        <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="font-serif text-lg text-stone-900 font-medium mb-6 flex items-center">
            <ShoppingBag className="h-4.5 w-4.5 mr-2 text-stone-650" />
            주문자 정보 입력 (Deliver Details)
          </h2>

          {/* Validation Notice block */}
          {errorMsg && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-start">
              <AlertCircle className="h-4.5 w-4.5 mr-2 text-red-650 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            {/* Input Name */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1.5 flex items-center">
                <User className="h-3 w-3 mr-1 text-stone-400" />
                CUSTOMER NAME (이름) <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="홍길동"
                className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
              />
            </div>

            {/* Input Contact Number */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1.5 flex items-center">
                <Notebook className="h-3 w-3 mr-1 text-stone-400" />
                PHONE CONTACT (연락처) <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
              />
            </div>

            {/* Input Detailed Address */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1.5 flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-stone-400" />
                DELIVERY ADDRESS (수령지 주소) <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="서울특별시 종로구 주얼리가 12-4 3층 301호"
                className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
              />
            </div>

            {/* Input Depositor Details */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1.5 flex items-center">
                <CreditCard className="h-3 w-3 mr-1 text-stone-400" />
                DEPOSITOR NAME (입금자 성함) <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder="입금하실 통장 명의자 성함"
                className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3"
              />
              <span className="text-[10px] text-stone-400 font-medium">주문자 성함과 다른 경우 반드시 변경하여 설정해주세요.</span>
            </div>

            {/* Input Optional Memo */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-stone-450 mb-1.5 flex items-center">
                <span>MEMO & SPECIAL REQUESTS (배송 요청사항)</span>
              </label>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 부재 시 문 앞에 놓아주세요. / 안전하게 패키징 부탁드립니다."
                className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-stone-800 p-3 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 flex items-center justify-center rounded-full bg-stone-900 border border-stone-900 font-medium text-xs text-white tracking-widest uppercase p-4.5 hover:bg-stone-800 transition-all duration-200 shadow-md"
            >
              {submitting ? "주문을 처리중입니다..." : "주문서 제출 동의 및 주문하기"}
            </button>
          </form>
        </div>

        {/* Right Col: Checkout spec sidebar summary (1/3 space) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-serif text-sm tracking-wider font-semibold text-stone-900 mb-4 border-b border-stone-250 pb-2 uppercase">
              Order Summary
            </h3>

            {productId && productName ? (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Product list</span>
                  <span className="text-stone-850 font-serif text-sm font-semibold mt-1 leading-tight">{productName}</span>
                  {selectedSize || selectedColor ? (
                    <span className="text-[10px] text-stone-500 font-medium mt-1 bg-white border rounded px-1.5 py-0.5 self-start">
                      {[selectedSize, selectedColor].filter(Boolean).join(" / ")}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2 border-t border-stone-200/80 pt-4 text-xs font-semibold text-stone-605">
                  <div className="flex justify-between">
                    <span>원상품 판매가</span>
                    <span>{productPrice.toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송료</span>
                    <span>{productPrice >= 30000 ? "무료배송" : "3,000원"}</span>
                  </div>
                  <div className="flex justify-between text-stone-900 text-sm font-bold border-t border-stone-200/80 pt-3.5">
                    <span>최종 입금액</span>
                    <span>{(productPrice + (productPrice >= 30000 ? 0 : 3000)).toLocaleString("ko-KR")}원</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-stone-500 text-xs font-light">
                장바구니가 비어 있습니다. 목록에서 상품을 먼저 골라주세요.
              </div>
            )}
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 leading-relaxed font-light">
            <h4 className="font-bold text-stone-850 mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
              Peaknic Trust Commitment
            </h4>
            고객님의 결제 대기 상태는 정각 24시간 내에 은행 자동 장부 수신을 통해 상시 갱신 처리됩니다. 입금 완료 여부는 가치 있는 주얼리 완성 공정과 연동되기에 신속한 입금이 확인될수록 제작 소요일이 약 1~2일 추가 단축될 수 있습니다.
          </div>
        </div>

      </div>

    </div>
  );
}
