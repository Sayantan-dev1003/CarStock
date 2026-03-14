export type PaymentMode = 'CASH' | 'UPI' | 'CARD';
export type BillStatus = 'PAID' | 'PENDING';

export interface BillItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface BillItemDetail {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: {
    name: string;
  };
}

export interface Bill {
  id: string;
  billNumber: string;
  customerId: string;
  customer?: {
    name: string;
    mobile: string;
  };
  items: BillItemDetail[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  total: number;
  paymentMode: PaymentMode;
  status: BillStatus;
  pdfUrl?: string;
  emailSent: boolean;
  whatsappSent: boolean;
  createdAt: string;
}

export interface CreateBillPayload {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMode: PaymentMode;
  status?: BillStatus;
  discount: number;
  vehicleId?: string;
}

export interface BillDeliveryStatus {
  emailSent: boolean;
  whatsappSent: boolean;
  pdfUrl: string | null;
}
