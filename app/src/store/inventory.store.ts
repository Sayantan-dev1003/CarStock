import { create } from 'zustand';
import { ProductSearchResult } from '../types/product.types';

interface InventoryState {
    cachedProducts: ProductSearchResult[];
    lowStockCount: number;
    setCachedProducts: (products: ProductSearchResult[]) => void;
    updateProductQuantity: (productId: string, newQuantity: number) => void;
    setLowStockCount: (count: number) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    cachedProducts: [],
    lowStockCount: 0,

    setCachedProducts: (products) => {
        set({ cachedProducts: products });
    },

    updateProductQuantity: (productId, newQuantity) => {
        set((state) => ({
            cachedProducts: state.cachedProducts.map((p) =>
                p.id === productId ? { ...p, quantity: newQuantity } : p
            ),
        }));
    },

    setLowStockCount: (count) => {
        set({ lowStockCount: count });
    },
}));
