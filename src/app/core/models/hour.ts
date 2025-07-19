export interface Hour {
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
}
