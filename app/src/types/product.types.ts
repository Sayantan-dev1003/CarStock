export type ProductCategory =
  | 'TYRES'
  | 'BATTERIES'
  | 'WIPERS'
  | 'BRAKES'
  | 'SEAT_COVERS'
  | 'LIGHTING'
  | 'AUDIO'
  | 'OILS'
  | 'ELECTRICAL'
  | 'OTHER';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  brand: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  category: ProductCategory;
}

export interface LowStockProduct {
  id: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  reorderLevel: number;
}

export interface StockLog {
  id: string;
  type: 'ADD' | 'REMOVE' | 'ADJUST';
  quantity: number;
  note?: string;
  createdAt: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
