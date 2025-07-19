import { Column } from './column';

interface TableHeader {
    title: string;
    size: string;
    id: string;
    pipe: 'price' | 'date' | 'time' | null;
    type?: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'icon' | 'link';
}

interface TableAction {
    id: string;
    icon: string;
    action: (rowData: any) => void;
}

export interface TableSettings {
    includesTotal: boolean;
    columns: Column[];
    globalFiltes: string[];
    header: TableHeader[];
    actions: TableAction[];
}

export interface FooterValues {
    size: string;
    values: {
        id: string;
        value: number;
        pipe: 'price' | 'number';
    }[];
}
