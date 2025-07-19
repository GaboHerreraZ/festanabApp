import { FooterValues } from './table-setting';

export interface EventDetail {
    _id: string;
    eventId: string;
    section: Section[];
}

export interface Section {
    _id: string;
    name: string;
    type: string;
    items: Item[];
    footer?: FooterValues;
}

export interface Item {
    _id: string;
    description: string;
    rentalPrice: number;
    costPrice: number;
    owner: 'Propio' | 'Tercero';
}
