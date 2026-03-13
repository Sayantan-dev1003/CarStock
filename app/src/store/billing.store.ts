import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BillItem, PaymentMode } from '../types/billing.types';

interface BillingState {
  items: BillItem[];
  customerId: string | null;
  customerName: string | null;
  vehicleId: string | null;
  discount: number;
  paymentMode: PaymentMode | null;
  addItem: (item: BillItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  setCustomer: (id: string, name: string) => void;
  setVehicle: (id: string | null) => void;
  setDiscount: (amount: number) => void;
  setPaymentMode: (mode: PaymentMode) => void;
  getSubtotal: () => number;
  getTotal: () => number;
  clearBill: () => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      customerName: null,
      vehicleId: null,
      discount: 0,
      paymentMode: null,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, qty) => {
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        });
      },

      setCustomer: (id, name) => set({ customerId: id, customerName: name }),

      setVehicle: (id) => set({ vehicleId: id }),

      setDiscount: (amount) => set({ discount: amount }),

      setPaymentMode: (mode) => set({ paymentMode: mode }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discountedAmount = subtotal - get().discount;
        const cgst = discountedAmount * 0.09;
        const sgst = discountedAmount * 0.09;
        return discountedAmount + cgst + sgst;
      },

      clearBill: () =>
        set({
          items: [],
          customerId: null,
          customerName: null,
          vehicleId: null,
          discount: 0,
          paymentMode: null,
        }),
    }),
    {
      name: 'billing-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
