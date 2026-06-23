export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Ring' | 'Necklace' | 'Bracelet' | 'Earrings' | 'Keyring';
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
}
