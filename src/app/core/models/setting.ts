export interface Setting {
    _id: string;
    daytimeOvertimeHour: number; // Recargo Hora Extra Diurna
    regularNighttimeHour: number; // Recargo Hora Nocturna Ordinaria
    nighttimeOvertimeHour: number; // Recargo Hora Extra Nocturna
    sundayAndHolidayHour: number; // Recargo Hora Dominicales y Festivos
    daytimeOvertimeSundayHoliday: number; // Recargo Hora Extra Diurna Dominicales y Festivos
    nighttimeOvertimeSundayHoliday: number; // Recargo Hora Extra Nocturna Dominicales y Festivos
    nightWorkSundayHoliday: number; // Recargo Hora Nocturna Dominical o Festivo
    auxiliaryTrasport: number; // Auxilio de transporte
}
