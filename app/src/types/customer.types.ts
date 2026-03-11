export interface Customer {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    tag: CustomerTag;
    totalSpend: number;
    createdAt: string;
    vehicles?: Vehicle[];
    bills?: any[]; // Defined in billing.types.ts
}

export type CustomerTag = 'VIP' | 'REGULAR' | 'INACTIVE';

export interface Vehicle {
    id: string;
    customerId: string;
    make: string;
    model: string;
    year?: number;
    fuelType?: string;
    regNumber: string;
    createdAt: string;
}

export interface MobileLookupResult {
    found: boolean;
    customer: Customer | null;
}
