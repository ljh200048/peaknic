export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Beaded Bracelets' | 'Couples/Friends';
  material: string;
  size: string;
  color: string;
  description: string;
  imageUrl: string;
  images: string[];
  isNew: boolean;
  isBest: boolean;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  price: number;
  customerName: string;
  phone: string;
  address: string;
  depositorName: string;
  memo?: string;
  status: '접수' | '확인중' | '배송준비' | '배송완료' | '취소';
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  instagramUrl: string;
  noticeText: string;
  storyImageUrl?: string;
  aboutImageUrl?: string;
  archiveImageUrl1?: string;
  archiveImageUrl2?: string;
  archiveImageUrl3?: string;
  archiveImageUrl4?: string;
  archiveImageUrl5?: string;
  archiveImageUrl6?: string;
  categoryBeadedImageUrl?: string;
  categoryCouplesImageUrl?: string;
}
