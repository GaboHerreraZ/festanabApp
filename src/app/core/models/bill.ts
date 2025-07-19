export interface Bill {
    _id: string;
    eventId: string;
    date: Date;
    name: string;
    value: number;
    paymentType: 'Efectivo' | 'Transferencia';
    paymentCompany: 'Bancolombia' | 'Nequi';
    observations: string;
    conciliation: boolean;
    billType: string;
}
