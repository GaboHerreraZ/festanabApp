import { Column } from './column';

interface TableHeader {
    title: string;
    size: string;
    id: string;
    pipe: 'price' | 'date' | 'time' | null;
    type?: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'icon' | 'link' | 'tag';
    disbabled?: boolean;
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
    events?: {
        getSeverity: (rowData: any) => string;
        getSeverityLabel: (rowData: any) => string;
    };
}

export interface FooterValues {
    size: string;
    values: {
        id: string;
        value: number;
        pipe: 'price' | 'number';
    }[];
}
