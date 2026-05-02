import { Component, computed, input, output, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table } from '../../../../../../../../shared/components/table/table';
import { FooterValues, TableSettings } from '../../../../../../../../core/models/table-setting';
import { IEmployeeHours, IHour } from '../../../../../../../../core/models/hour';

@Component({
    selector: 'app-employee-hours',
    standalone: true,
    imports: [CommonModule, Table],
    templateUrl: './employee-hours.html'
})
export class EmployeeHours {
    employeeData = input.required<IEmployeeHours>();
    hideActions = input<boolean>(false);

    edit = output<IHour>();
    delete = output<IHour>();
    approve = output<IHour>();
    reject = output<IHour>();

    hours = computed(() => this.employeeData().horas ?? []);

    footerValues: Signal<FooterValues> = computed(() => {
        const list = this.hours();
        const sum = (key: string) => list.reduce((acc: number, h: any) => acc + (h[key] || 0), 0);

        const footer: FooterValues = {} as FooterValues;
        footer.size = '7';
        footer.values = [
            { id: 'totaHrsOrd', value: sum('hrsOrd'), pipe: 'number' },
            { id: 'valTotaHrsOrd', value: sum('valHrsOrd'), pipe: 'price' },
            { id: 'hrsExtDia', value: sum('hrsExtDia'), pipe: 'number' },
            { id: 'valExtDia', value: sum('valExtDia'), pipe: 'price' },
            { id: 'hrsNoc', value: sum('hrsNoc'), pipe: 'number' },
            { id: 'valHrsNoc', value: sum('valHrsNoc'), pipe: 'price' },
            { id: 'hrsExtNoc', value: sum('hrsExtNoc'), pipe: 'number' },
            { id: 'valExtNoc', value: sum('valExtNoc'), pipe: 'price' },
            { id: 'hrsDomDia', value: sum('hrsDomDia'), pipe: 'number' },
            { id: 'valDomDia', value: sum('valDomDia'), pipe: 'price' },
            { id: 'hrsExtDomDia', value: sum('hrsExtDomDia'), pipe: 'number' },
            { id: 'valExtDomDia', value: sum('valExtDomDia'), pipe: 'price' },
            { id: 'hrsDomNoc', value: sum('hrsDomNoc'), pipe: 'number' },
            { id: 'valDomNoc', value: sum('valDomNoc'), pipe: 'price' },
            { id: 'hrsExtDomNoc', value: sum('hrsExtDomNoc'), pipe: 'number' },
            { id: 'valExtDomNoc', value: sum('valExtDomNoc'), pipe: 'price' },
            { id: 'auxTotal', value: sum('auxiliaryTrasport'), pipe: 'price' },
            { id: 'total', value: sum('total'), pipe: 'price' },
            { id: 'empty1', value: 0, pipe: 'number' }
        ];
        return footer;
    });

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'approvalStatus', header: 'Estado' },
            { field: 'observations', header: 'Observaciones' },
            { field: 'date', header: 'Fecha' },
            { field: 'startTime', header: 'Hora Inicio' },
            { field: 'endTime', header: 'Hora Fin' },
            { field: 'hourPrice', header: 'Precio Hora' },

            { field: 'hrsOrd', header: 'Horas Ordinarias' },
            { field: 'valHrsOrd', header: 'Valor Horas Ordinarias' },

            { field: 'hrsExtDia', header: 'Horas Extras Diurnas' },
            { field: 'valExtDia', header: 'Valor Horas Extras Diurnas' },

            { field: 'hrsNoc', header: 'Horas Nocturnas Ordinarias' },
            { field: 'valHrsNoc', header: 'Valor Hora Nocturna Ordinaria' },

            { field: 'hrsExtNoc', header: 'Horas Extras Nocturnas Ordinarias' },
            { field: 'valExtNoc', header: 'Valor Horas Extras Nocturnas Ordinarias' },

            { field: 'hrsDomDia', header: 'Horas Diurnas Dominicales' },
            { field: 'valDomDia', header: 'Valor Horas Diurnas Dominicales' },

            { field: 'hrsExtDomDia', header: 'Horas Extra Diurnas Dominicales' },
            { field: 'valExtDomDia', header: 'Valor Horas Extra Diurnas Dominicales' },

            { field: 'hrsDomNoc', header: 'Horas Nocturnas Dominicales' },
            { field: 'valDomNoc', header: 'Valor Horas Nocturnas Dominicales' },

            { field: 'hrsExtDomNoc', header: 'Horas Extras Nocturnas Dominicales' },
            { field: 'valExtDomNoc', header: 'Valor Horas Extras Nocturnas Dominicales' },
            { field: 'auxiliaryTrasport', header: 'Auxilio Transporte' },
            { field: 'total', header: 'Total a Pagar' }
        ],
        globalFiltes: [],
        header: [
            { pipe: null, id: 'approvalStatus', title: 'Estado', size: '10rem', type: 'tag' },
            { pipe: null, id: 'observations', title: 'Observaciones', size: '16rem' },
            { pipe: 'date', id: 'date', title: 'Fecha', size: '14rem' },
            { pipe: 'time', id: 'startTime', title: 'Hora Inicio', size: '10rem' },
            { pipe: 'time', id: 'endTime', title: 'Hora Fin', size: '10rem' },
            { pipe: 'price', id: 'hourPrice', title: 'Precio Hora', size: '10rem' },

            { pipe: null, id: 'hrsOrd', title: 'Horas Ordinarias', size: '10rem' },
            { pipe: 'price', id: 'valHrsOrd', title: 'Valor Horas Ordinarias', size: '12rem' },

            { pipe: null, id: 'hrsExtDia', title: 'Horas Extras Diurnas', size: '10rem' },
            { pipe: 'price', id: 'valExtDia', title: 'Valor Horas Extras Diurnas', size: '12rem' },

            { pipe: null, id: 'hrsNoc', title: 'Horas Nocturnas Ordinarias', size: '10rem' },
            { pipe: 'price', id: 'valHrsNoc', title: 'Valor Hora Nocturna Ordinaria', size: '12rem' },

            { pipe: null, id: 'hrsExtNoc', title: 'Horas Extras Nocturnas Ordinarias', size: '10rem' },
            { pipe: 'price', id: 'valExtNoc', title: 'Valor Horas Extras Nocturnas Ordinarias', size: '12rem' },

            { pipe: null, id: 'hrsDomDia', title: 'Horas Diurnas Dominicales', size: '10rem' },
            { pipe: 'price', id: 'valDomDia', title: 'Valor Horas Diurnas Dominicales', size: '12rem' },

            { pipe: null, id: 'hrsExtDomDia', title: 'Horas Extra Diurnas Dominicales', size: '10rem' },
            { pipe: 'price', id: 'valExtDomDia', title: 'Valor Horas Extra Diurnas Dominicales', size: '12rem' },

            { pipe: null, id: 'hrsDomNoc', title: 'Horas Nocturnas Dominicales', size: '10rem' },
            { pipe: 'price', id: 'valDomNoc', title: 'Valor Horas Nocturnas Dominicales', size: '12rem' },

            { pipe: null, id: 'hrsExtDomNoc', title: 'Horas Extras Nocturnas Dominicales', size: '10rem' },
            { pipe: 'price', id: 'valExtDomNoc', title: 'Valor Horas Extras Nocturnas Dominicales', size: '12rem' },
            { pipe: 'price', id: 'auxiliaryTrasport', title: 'Auxilio Transporte', size: '12rem' },
            { pipe: 'price', id: 'total', title: 'Total a Pagar', size: '12rem' }
        ],
        actions: [
            {
                id: 'approve',
                icon: 'pi pi-check',
                tooltip: 'Aprobar',
                severity: 'success',
                hide: (item: any) => item?.approved === true,
                action: (rowData: any) => this.approve.emit(rowData.item)
            },
            {
                id: 'reject',
                icon: 'pi pi-times',
                tooltip: 'Rechazar',
                severity: 'danger',
                hide: (item: any) => item?.approved === false && !!item?.approvedAt,
                action: (rowData: any) => this.reject.emit(rowData.item)
            },
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                tooltip: 'Editar',
                action: (rowData: any) => this.edit.emit(rowData.item)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                tooltip: 'Eliminar',
                severity: 'danger',
                action: (rowData: any) => this.delete.emit(rowData.item)
            }
        ],
        events: {
            getSeverity: (item: any) => {
                if (item?.approved) return 'success';
                if (!item?.approved && item?.approvedAt) return 'danger';
                return 'warn';
            },
            getSeverityLabel: (item: any) => {
                if (item?.approved) return 'Aprobada';
                if (!item?.approved && item?.approvedAt) return 'Rechazada';
                return 'Pendiente';
            }
        }
    };
}
