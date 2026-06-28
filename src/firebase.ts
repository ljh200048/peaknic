import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { Product, SiteSettings } from "./types";

export const firebaseConfig = {
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
    name: "데이지 가든 비즈 팔찌 (Daisy Garden)",
    price: 11000,
    category: "Beaded Bracelets",
    material: "Premium TOHO Glass Seed Beads, Polyurethane Thread",
    size: "기본 둘레 약 15.5cm (신축성 우수)",
    color: "Daisy Yellow & Peach Multi",
    description: "자연스러운 무드의 데이지 꽃 패턴을 한 땀 한 땀 영롱하게 엮어낸 수공예 비즈 팔찌입니다. 잔잔한 파스텔 피치 톤과 데이지 옐로우의 조화가 매력적입니다.",
    imageUrl: "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: true,
    isBest: false,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "오라 쿼츠 천연석 비즈 팔찌 (Aura Quartz)",
    price: 19800,
    category: "Beaded Bracelets",
    material: "Natural Madagascan Rose Quartz, Aura Crystal, 925 Silver Accent",
    size: "기본 둘레 약 16cm (우레탄 줄)",
    color: "Milky Pink & Aurora-translucent",
    description: "은은한 복숭아 빛 천연 피치 원석과 빛 반사에 따라 홀로그램을 자아내는 아우라 쿼츠 비즈를 배합한 로맨틱 꿀조합입니다. 햇살 아래에서 볼 때 더욱 눈부십니다.",
    imageUrl: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: true,
    isBest: true,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "프렌치 쁘띠 담수진주 비즈 팔찌",
    price: 18500,
    category: "Beaded Bracelets",
    material: "Natural Freshwater Pearl (담수진주 3mm), 14K Gold Filled Beads",
    size: "총 길이 15.5cm (+ 여유체인 3cm)",
    color: "Natural Creamy White & Gold",
    description: "정형화되지 않은 우아한 미가 돋보이는 천연 초소형 담수진주와 영롱한 14K 골드필드 볼을 레이어링한 작품입니다. 레이스 블라우스나 니트에 탁월한 매칭.",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: false,
    isBest: true,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "소다 캔디 글라스 비즈 팔찌 (Soda Candy)",
    price: 12000,
    category: "Beaded Bracelets",
    material: "Italian Murano Glass Beads, Matte Frost Seed Beads",
    size: "기본 둘레 약 16cm (고탄성 실리콘사)",
    color: "Soda Ocean Blue & Lime Green",
    description: "맑고 투명한 무라노 글라스 데코 비즈와 포슬포슬한 질감의 매트 무광 씨드 비즈를 센스 있게 교차한 여름 청량 에디션입니다. 데일리 포인트에 이상적입니다.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop"
    ],
    isNew: false,
    isBest: false,
    isSoldOut: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "어텀 바이브 비즈 팔찌 키링 Set",
    price: 14000,
    category: "Beaded Bracelets",
    material: "Vintage Wood Beads, Acrylic Resin Beads, Brass Charm",
    size: "비즈 밴드 약 14cm (링포함 총 18cm)",
    color: "Warm Amber & Vintage Khaki",
    description: "고풍스럽고 앤티크한 무드를 연출하는 빈티지 우드 비즈와 영롱한 앰버 글라스 비즈를 레토르 매칭한 가을 햇살 머금은 키링 겸 팔찌 시리즈입니다.",
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
    name: "라벤더 자수정 레이어드 2줄 세트",
    price: 22000,
    category: "Couples/Friends",
    material: "Amethyst (천연 자수정), Milky Chalcedony Gemstone, Cord",
    size: "자유 매듭 조절식 (Free)",
    color: "Soft Lavender & Milky Mist",
    description: "천연 자수정의 포근한 라벤더 보라색และ 은은한 우윳빛 칼세도니 원석을 감성 매듭으로 배합한 2개 세트 구성 상품입니다. 레이어링 및 단독 착용에 최적화.",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
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
  heroTitle: "Handcrafted Beaded Bracelets",
  heroSubtitle: "Peaknic(피크닉)은 천연석 비즈, 맑은 무라노 글라스, 담수진주를 오가닉하게 엮어내어 일상 한구석에 편안하게 녹아드는 수제 비즈 팔찌를 직접 디자인합니다.",
  heroImageUrl: "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=1600&auto=format&fit=crop",
  instagramUrl: "https://instagram.com/peaknic_archive",
  noticeText: "• 한시적 무료 배송 프로모션 진행 중 (3만원 이상 구매 시)\n• 최고급 신축성 우레탄사 사용으로 알러지 걱정 없는 편안함\n• 100% 핸드메이드 방식으로 주문 제작 시 평균 2~4 영업일이 소요됩니다.",
  storyImageUrl: "/src/assets/images/regenerated_image_1782598633749.jpg",
  aboutImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
  archiveImageUrl1: "/src/assets/images/regenerated_image_1782598322380.jpg",
  archiveImageUrl2: "/src/assets/images/regenerated_image_1782598323303.jpg",
  archiveImageUrl3: "/src/assets/images/regenerated_image_1782598324452.jpg",
  archiveImageUrl4: "/src/assets/images/regenerated_image_1782598325682.jpg",
  archiveImageUrl5: "/src/assets/images/regenerated_image_1782598326794.jpg",
  archiveImageUrl6: "/src/assets/images/regenerated_image_1782598327726.jpg",
  categoryBeadedImageUrl: "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=600&auto=format&fit=crop",
  categoryCouplesImageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
};

export async function initializeDefaultDataIfNeeded() {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    // We only perform an overhaul wipe if there are absolutely no new beaded products, to preserve custom edits
    let hasNewBeadedProducts = false;
    productsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (
        data.category === "Beaded Bracelets" ||
        data.category === "Couples/Friends"
      ) {
        hasNewBeadedProducts = true;
      }
    });

    const isOldTheme = !productsSnapshot.empty && !hasNewBeadedProducts;

    if (productsSnapshot.empty || isOldTheme) {
      console.log("Empty or old jewelry database detected. Re-seeding Beaded Bracelet collection...");
      const batch = writeBatch(db);
      
      // Delete old products if any
      productsSnapshot.docs.forEach((d) => {
        batch.delete(d.ref);
      });

      SAMPLE_PRODUCTS.forEach((prod) => {
        const docRef = doc(collection(db, "products"), prod.id);
        batch.set(docRef, prod);
      });
      await batch.commit();
      console.log("Beads bracelet catalog seeded.");
    }

    const settingsDoc = doc(db, "siteSettings", "main");
    const settingsSnapshot = await getDocs(collection(db, "siteSettings"));
    
    let isOldSettings = false;
    settingsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.heroTitle === "Everyday Accessories for Your Mood") {
        isOldSettings = true;
      }
    });

    if (settingsSnapshot.empty || isOldSettings) {
      console.log("Re-seeding brand identity to Beads Bracelet studio...");
      await setDoc(settingsDoc, DEFAULT_SETTINGS);
      console.log("Default settings initialized.");
    }

    // Self-healing check for broken Unsplash URLs in existing documents
    const updatedProductsSnapshot = await getDocs(collection(db, "products"));
    const repairBatch = writeBatch(db);
    let needsRepair = false;

    updatedProductsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      let docNeedsUpdate = false;
      let imgUrl = data.imageUrl || "";
      let imgs = data.images || [];
      let category = data.category || "Beaded Bracelets";

      if (imgUrl.includes("photo-1618403088890-3d9ff6f4c8da")) {
        imgUrl = "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=800&auto=format&fit=crop";
        docNeedsUpdate = true;
      }

      const repairedImgs = imgs.map((url: string) => {
        if (url && url.includes("photo-1618403088890-3d9ff6f4c8da")) {
          docNeedsUpdate = true;
          return "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=800&auto=format&fit=crop";
        }
        return url;
      });

      if (
        category === "Seed Beads" ||
        category === "Gemstone Beads" ||
        category === "Pearl Beads" ||
        category === "Bead Keyrings"
      ) {
        category = "Beaded Bracelets";
        docNeedsUpdate = true;
      }

      if (docNeedsUpdate) {
        repairBatch.update(docSnap.ref, {
          imageUrl: imgUrl,
          images: repairedImgs,
          category: category
        });
        needsRepair = true;
      }
    });

    const settingsDocSnap = await getDocs(collection(db, "siteSettings"));
    settingsDocSnap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const updates: any = {};
      let settingsNeedsUpdate = false;

      if (data.heroImageUrl && data.heroImageUrl.includes("photo-1618403088890-3d9ff6f4c8da")) {
        updates.heroImageUrl = "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=1600&auto=format&fit=crop";
        settingsNeedsUpdate = true;
      }

      if (!data.storyImageUrl || data.storyImageUrl.includes("photo-1535632066927-ab7c9ab60908") || data.storyImageUrl.includes("regenerated_image_1782598321238.jpg")) {
        updates.storyImageUrl = "/src/assets/images/regenerated_image_1782598633749.jpg";
        settingsNeedsUpdate = true;
      }

      if (!data.aboutImageUrl) {
        updates.aboutImageUrl = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop";
        settingsNeedsUpdate = true;
      }

      if (!data.archiveImageUrl1 || data.archiveImageUrl1.includes("photo-1515562141207-7a88fb7ce338")) {
        updates.archiveImageUrl1 = "/src/assets/images/regenerated_image_1782598322380.jpg";
        settingsNeedsUpdate = true;
      }
      if (!data.archiveImageUrl2 || data.archiveImageUrl2.includes("photo-1535632066927-ab7c9ab60908")) {
        updates.archiveImageUrl2 = "/src/assets/images/regenerated_image_1782598323303.jpg";
        settingsNeedsUpdate = true;
      }
      if (!data.archiveImageUrl3 || data.archiveImageUrl3.includes("photo-1599643478518-a784e5dc4c8f")) {
        updates.archiveImageUrl3 = "/src/assets/images/regenerated_image_1782598324452.jpg";
        settingsNeedsUpdate = true;
      }
      if (!data.archiveImageUrl4 || data.archiveImageUrl4.includes("photo-1603561591411-07134e71a2a9")) {
        updates.archiveImageUrl4 = "/src/assets/images/regenerated_image_1782598325682.jpg";
        settingsNeedsUpdate = true;
      }
      if (!data.archiveImageUrl5 || data.archiveImageUrl5.includes("photo-1602751584552-8ba73aad10e1")) {
        updates.archiveImageUrl5 = "/src/assets/images/regenerated_image_1782598326794.jpg";
        settingsNeedsUpdate = true;
      }
      if (!data.archiveImageUrl6 || data.archiveImageUrl6.includes("photo-1611591437281-460bfbe1220a")) {
        updates.archiveImageUrl6 = "/src/assets/images/regenerated_image_1782598327726.jpg";
        settingsNeedsUpdate = true;
      }
      if (!data.categoryBeadedImageUrl) {
        updates.categoryBeadedImageUrl = "https://images.unsplash.com/photo-1611085583191-a3b1a3029a2a?q=80&w=600&auto=format&fit=crop";
        settingsNeedsUpdate = true;
      }
      if (!data.categoryCouplesImageUrl) {
        updates.categoryCouplesImageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop";
        settingsNeedsUpdate = true;
      }

      if (settingsNeedsUpdate) {
        repairBatch.update(docSnap.ref, updates);
        needsRepair = true;
      }
    });

    if (needsRepair) {
      console.log("Healing database: replacing broken Unsplash URLs...");
      await repairBatch.commit();
      console.log("Database repair complete.");
    }
  } catch (error) {
    console.warn("Could not seed initial data:", error);
  }
}
