export interface Bill {
    _id: string;
    eventId: string;
    date: Date;
    name: string;
    value: number;
    paymentType: 'Efectivo' | 'Transferencia';
    paymentCompany: 'Bancolombia' | 'Nequi' | 'Banco de Bogotá';
    observations: string;
    conciliation: boolean;
    billType: string;
}
