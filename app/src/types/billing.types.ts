export interface BillItem {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
}

export interface Bill {
    id: string;
    billNumber: string;
    customerId: string;
    customer?: any; // Defined in customer.types.ts
    items: BillItemDetail[];
    subtotal: number;
    discount: number;
    cgst: number;
    sgst: number;
    total: number;
    paymentMode: PaymentMode;
    pdfUrl?: string;
    emailSent: boolean;
    whatsappSent: boolean;
    createdAt: string;
}

export interface BillItemDetail {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    product: { name: string };
}

export type PaymentMode = 'CASH' | 'UPI' | 'CARD';

export interface CreateBillPayload {
    customerId: string;
    items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
    }>;
    paymentMode: PaymentMode;
    discount: number;
    vehicleId?: string;
}

export interface BillDeliveryStatus {
    emailSent: boolean;
    whatsappSent: boolean;
    pdfUrl: string | null;
}
