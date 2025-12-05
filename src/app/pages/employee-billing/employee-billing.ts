import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventsService } from '../events/events.service';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { PanelModule } from 'primeng/panel';
import { TableSettings } from '../../core/models/table-setting';
import { Table } from '../../shared/components/table/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-employee-billing',
    templateUrl: './employee-billing.html',
    imports: [CommonModule, ImageModule, PanelModule, Table, ToastModule]
})
export class EmployeeBilling {
    activatedRoute = inject(ActivatedRoute);

    eventService = inject(EventsService);

    destroy$ = new Subject<void>();

    tableSettingsHours: TableSettings = {
        includesTotal: true,
        columns: [
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
            {
                pipe: 'date',
                id: 'date',
                title: 'Fecha',
                size: '14rem'
            },
            {
                pipe: 'time',
                id: 'startTime',
                title: 'Hora Inicio',
                size: '10rem'
            },
            {
                pipe: 'time',
                id: 'endTime',
                title: 'Hora Fin',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'hourPrice',
                title: 'Precio Hora',
                size: '10rem'
            },

            {
                pipe: null,
                id: 'hrsOrd',
                title: 'Horas Ordinarias',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valHrsOrd',
                title: 'Valor Horas Ordinarias',
                size: '12rem'
            },

            {
                pipe: null,
                id: 'hrsExtDia',
                title: 'Horas Extras Diurnas',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valExtDia',
                title: 'Valor Horas Extras Diurnas',
                size: '12rem'
            },

            {
                pipe: null,
                id: 'hrsNoc',
                title: 'Horas Nocturnas Ordinarias',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valHrsNoc',
                title: 'Valor Hora Nocturna Ordinaria',
                size: '12rem'
            },

            {
                pipe: null,
                id: 'hrsExtNoc',
                title: 'Horas Extras Nocturnas Ordinarias',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valExtNoc',
                title: 'Valor Horas Extras Nocturnas Ordinarias',
                size: '12rem'
            },

            {
                pipe: null,
                id: 'hrsDomDia',
                title: 'Horas Diurnas Dominicales',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valDomDia',
                title: 'Valor Horas Diurnas Dominicales',
                size: '12rem'
            },

            {
                pipe: null,
                id: 'hrsExtDomDia',
                title: 'Horas Extra Diurnas Dominicales',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valExtDomDia',
                title: 'Valor Horas Extra Diurnas Dominicales',
                size: '12rem'
            },

            {
                pipe: null,
                id: 'hrsDomNoc',
                title: 'Horas Nocturnas Dominicales',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valDomNoc',
                title: 'Valor Horas Nocturnas Dominicales',
                size: '12rem'
            },

            {
                pipe: null,
                id: 'hrsExtDomNoc',
                title: 'Horas Extras Nocturnas Dominicales',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'valExtDomNoc',
                title: 'Valor Horas Extras Nocturnas Dominicales',
                size: '12rem'
            },
            {
                pipe: 'price',
                id: 'auxiliaryTrasport',
                title: 'Auxilio Transporte',
                size: '12rem'
            },
            {
                pipe: 'price',
                id: 'total',
                title: 'Total a Pagar',
                size: '12rem'
            }
        ],
        actions: []
    };

    tableSettingsServices: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'date', header: 'Fecha' },
            { field: 'quantity', header: 'Cantidad' },
            { field: 'service', header: 'Servicio' },
            { field: 'servicePrice', header: 'Precio Servicio' },
            { field: 'total', header: 'Total a Pagar' },
            { field: 'observations', header: 'Observaciones' }
        ],
        globalFiltes: [],
        header: [
            {
                pipe: 'date',
                id: 'date',
                title: 'Fecha',
                size: '14rem'
            },
            {
                pipe: null,
                id: 'quantity',
                title: 'Cantidad',
                size: '14rem'
            },
            {
                pipe: null,
                id: 'service',
                title: 'Servicio',
                size: '14rem'
            },
            {
                pipe: 'price',
                id: 'servicePrice',
                title: 'Precio Servicio',
                size: '14rem'
            },
            {
                pipe: 'price',
                id: 'total',
                title: 'Total a Pagar',
                size: '12rem'
            },
            {
                pipe: null,
                id: 'observations',
                title: 'Descripción',
                size: '16rem'
            }
        ],
        actions: []
    };

    billingEmploye = toSignal(
        this.activatedRoute.params.pipe(
            takeUntil(this.destroy$),
            map((params) => {
                return {
                    employeeId: params['employeeId']!,
                    eventId: params['eventId']!
                };
            }),
            switchMap(({ eventId, employeeId }) =>
                !eventId || !employeeId
                    ? of(null)
                    : this.eventService.getEmployeeBilling(eventId, employeeId).pipe(
                          map((res: any) => {
                              const data = res.data[0];
                              const { event } = data;
                              const { billing, ...rest } = event;

                              const employeBilling = {
                                  ...rest,
                                  ...billing[0]
                              };

                              console.log('employeBilling', employeBilling);
                              return employeBilling;
                          })
                      )
            )
        ),
        { initialValue: { employeeId: '', eventId: '' } }
    );

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
