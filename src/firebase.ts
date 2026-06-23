import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { Product, SiteSettings } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyBixc-qwtayr86ozUjVwnN_dGgTM4VIEdg",
  authDomain: "cheongchunfilm-mobile.firebaseapp.com",
  projectId: "cheongchunfilm-mobile",
  storageBucket: "cheongchunfilm-mobile.firebasestorage.app",
  messagingSenderId: "1095212470598",
  appId: "1:1095212470598:web:8fefe44ad11f9da1d1d547"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-78bb095a-5794-4c53-9761-b553ff6cf2a7");
export const auth = getAuth(app);

// Initial sample accessories requested by the user
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Daily Silver Ring",
    price: 18000,
    category: "Ring",
    material: "925 Sterling Silver",
    size: "9호, 11호, 13호, 15호",
    color: "Silver",
    description: "매일매일 일상 속에서 자연스럽게 레이어링하기 좋은 심플하고 슬림한 느낌의 925 실버 링입니다. 미니멀한 두께감으로 편안한 착용감을 선사합니다.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: true,
    isBest: false,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "Pearl Mood Necklace",
    price: 24000,
    category: "Necklace",
    material: "淡水 Pearl (담수진주), Brass (Gold Plated)",
    size: "42cm (+ 여유체인 5cm)",
    color: "Pearl White",
    description: "자연스러운 은은한 광택감이 돋보이는 고품질 담수진주 목걸이입니다. 캐주얼한 티셔츠부터 드레시한 블라우스까지 은은하게 매치하여 감성 가득한 무드를 더해줍니다.",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: true,
    isBest: true,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Soft Chain Bracelet",
    price: 19500,
    category: "Bracelet",
    material: "Surgical Steel 316L",
    size: "16cm (+ 3cm 여유 줄)",
    color: "Silver, Warm Gold",
    description: "써지컬 스틸 소재로 알러지 걱정 없이 오랫동안 매끄러운 텍스처를 선사하는 체인 팔찌입니다. 빛의 각도에 따라 잔잔하게 반짝이는 유려한 링크 디자인입니다.",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: false,
    isBest: true,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "Mini Heart Earrings",
    price: 15000,
    category: "Earrings",
    material: "925 Sterling Silver, White Gold Plating",
    size: "가로 6mm * 세로 5mm",
    color: "Silver, Rose Gold",
    description: "한 듯 안 한 듯 작고 귀여운 미니멀한 입체 하트 귀걸이입니다. 매일 착용해도 부담 없는 초소형 크기감과 사랑스러운 쉐입으로 데일리 소장 가치가 높습니다.",
    imageUrl: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: false,
    isBest: false,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "Vintage Keyring",
    price: 12000,
    category: "Keyring",
    material: "Brass / Acrylic / Leather",
    size: "총 길이 약 8.5cm",
    color: "Antique Gold, Dark Forest",
    description: "시간의 흔적과 고풍스러운 무드를 고스란히 담아낸 빈티지 참 황동 키링입니다. 에어팟, 백팩, 차 키 등에 걸었을 때 따뜻하고 유니크한 가을의 풍경을 연출할 수 있습니다.",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: true,
    isBest: false,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    name: "Couple Ring Set",
    price: 38000,
    category: "Ring",
    material: "925 Sterling Silver (두께 조절 무광 피니시)",
    size: "Free (조절 가능한 오픈링 타입, 남녀 공용)",
    color: "Matt Silver",
    description: "무광 실버 특유의 은은하고 포근한 감성으로 제작된 투 톤 오픈링 커플 반지 세트입니다. 뒷면이 트여있는 조절식 오픈형 쉐입으로 누구나 정교한 피팅감을 가집니다.",
    imageUrl: "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: false,
    isBest: true,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  id: "main",
  heroTitle: "Everyday Accessories for Your Mood",
  heroSubtitle: "Peaknic은 심플함 속에 녹아든 따뜻한 일상의 순간들을 아름다운 감성으로 포착합니다. 고요하게 빛나는 우리들만의 장식품.",
  heroImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop",
  instagramUrl: "https://instagram.com/peaknic_archive",
  noticeText: "• 한시적 무료 배송 프로모션 진행 중 (3만원 이상 구매 시)\n• 전 제품 환경 호르몬 및 알러지 방지 처리\n• 주문 제작 상품은 영업일 기준 평균 3~5일 소요됩니다."
};

export async function initializeDefaultDataIfNeeded() {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    if (productsSnapshot.empty) {
      console.log("No products found in Firestore. Seeding default accessory catalog...");
      const batch = writeBatch(db);
      SAMPLE_PRODUCTS.forEach((prod) => {
        const docRef = doc(collection(db, "products"), prod.id);
        batch.set(docRef, prod);
      });
      await batch.commit();
      console.log("Default catalog seeded successfully.");
    }

    const settingsDoc = doc(db, "siteSettings", "main");
    const settingsSnapshot = await getDocs(collection(db, "siteSettings"));
    if (settingsSnapshot.empty) {
      console.log("No siteSettings found. Seeding default typography layout...");
      await setDoc(settingsDoc, DEFAULT_SETTINGS);
      console.log("Default site settings seeded successfully.");
    }
  } catch (error) {
    console.warn("Could not seed initial data. It could be due to permission settings or cold startup:", error);
  }
}
