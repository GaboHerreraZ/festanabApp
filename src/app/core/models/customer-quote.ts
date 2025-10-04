export interface CustomerQuote {
    _id: string;
    eventId: string;
    customerId: string;
    owner: string;
    description: string;
    nit: string;
    location: string;
    date: string; // ISO date string
    time: string | null;
    __v: number;
    totalRentalPrice: number;
    totalCostPrice: number;
    totalBillValue: number;
    totalHourCost: number;
    utility: number;
    detail: Detail;
}

export interface Detail {
    _id: string;
    eventId: string;
    section: Section[];
    __v: number;
}

export interface Section {
    _id: string;
    name: string;
    description: string;
    type: 'admin' | 'client' | string;
    items: Item[];
}

export interface Item {
    _id: string;
    name: string;
    description: string;
    quantity: number;
    rentalPrice: number;
    costPrice: number;
    done: boolean;
    disabled: boolean;
    owner: string;
}
