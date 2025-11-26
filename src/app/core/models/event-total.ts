export interface EventTotal {
    _id: string;
    date: Date;
    description: string;
    name: string;
    owner: string;
    phoneNumber: number;
    time: Date;
    totalBillValue: number; // Total value of all bills
    totalCostPrice: number; // Total cost price of all items
    totalHourCost: number; // Total cost of hours worked
    totalRentalPrice: number; // Total rental price of items,
    status: string;
}
