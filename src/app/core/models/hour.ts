export interface IHour {
    _id: string;
    eventId: string;
    employee: string;
    cc: string;
    date: Date;
    startTime: Date;
    endTime?: Date;
    hourPrice: number; // Valor Hora
    hrsOrd: number; // Horas ordinarias
    valHrsOrd: number; // Valor horas ordinarias
    hrsExtDia: number; // Horas extras diurnas
    valExtDia: number; // Valor horas extras diurnas
    hrsNoc: number; // Horas nocturnas ordinarias
    valHrsNoc: number; // Valor hora nocturna ordinaria
    hrsExtNoc: number; // Horas extras nocturnas ordinarias
    valExtNoc: number; // Valor horas extras nocturnas ordinarias
    hrsDomDia: number; // Horas diurnas dominicales
    valDomDia: number; // Valor horas diurnas dominicales
    hrsExtDomDia: number; // Horas extra diurnas dominicales
    valExtDomDia: number; // Valor horas extra diurnas dominicales
    hrsDomNoc: number; // Horas nocturnas dominicales
    valDomNoc: number; // Valor horas nocturnas dominicales
    hrsExtDomNoc: number; // Horas extras nocturnas dominicales
    valExtDomNoc: number; // Valor horas extras nocturnas dominicales
    auxiliaryTrasport: number;
    total: number; // Total de horas

    employeeId: string; // ID del empleado
    hasHour?: boolean;
    approved?: boolean;
    approvedAt?: string | Date | null;
}

export interface IEmployeeHours {
    _id: string;
    employeeId: string;
    employee: string;
    cc: string;
    horas: IHour[];
}

export interface IEmployeeEventHour {
    _id?: string;
    startTime: string | Date;
    endTime: string | Date;
    approved: boolean;
    approvedAt?: string | Date | null;
    observations?: string;
}

export interface IEmployeeEvent {
    eventId: string;
    employeeId: string;
    employee: string;
    cc: string;
    owner: string;
    description: string;
    location: string;
    date: string | Date;
    status: string;
    hourPrice?: number;
    hours: IEmployeeEventHour[];
}
