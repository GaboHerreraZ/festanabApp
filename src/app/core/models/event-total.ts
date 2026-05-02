export type EventStatus = 'inQuote' | 'pending' | 'completed';

export interface IEventTotal {
    _id: string;
    customerId?: string;
    owner: string;
    description: string;
    nit?: string;
    location?: string;
    date: Date;
    time: Date;
    status: EventStatus | string;
    totalRentalPrice: number;
    totalCostPrice: number;
    totalBillValue: number;
    totalHourCost: number;
    name?: string;
    phoneNumber?: number;
}

export type EventTotal = IEventTotal;
