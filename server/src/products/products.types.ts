import { Product } from '@prisma/client';

export interface PaginatedProducts {
    data: Product[];
    total: number;
    page: number;
    limit: number;
}

export interface ProductSearchResult {
    id: string;
    name: string;
    sellingPrice: number;
    quantity: number;
    category: string;
}

export interface LowStockResult {
    id: string;
    name: string;
    category: string;
    quantity: number;
    reorderLevel: number;
}
