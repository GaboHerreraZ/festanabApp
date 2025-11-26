import { Component, computed, effect, inject, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Hour } from '../../../../core/models/hour';
import { FooterValues, TableSettings } from '../../../../core/models/table-setting';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../events.service';
import { Table } from '../../../../shared/components/table/table';
import { EmployeeService } from '../../../employee/employee.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { IEmployee } from '../../../../core/models/employee';
import { Subject, takeUntil } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-labour',
    imports: [ButtonModule, AutoCompleteModule, FormsModule, Table, CommonModule, DatePickerModule, InputTextModule, DatePickerModule, DialogModule, ToastModule, ConfirmDialogModule, ToolbarModule, InputNumberModule],
    standalone: true,
    templateUrl: './labour.html',
    providers: [MessageService, ConfirmationService]
})
export class Labour implements OnInit, OnDestroy {
    currentDate = new Date();
    submitted: boolean = false;
    eventId = signal<string>('');

    timeDialog: boolean = false;

    hours = signal<Hour[]>([]);

    employeeSearch: IEmployee[] = [];
    employees = signal<IEmployee[]>([]);

    destroy$ = new Subject<void>();

    hasErrorTime: boolean = false;

    item: Hour = this.getEmptyHour();

    footerValues: Signal<FooterValues> = computed(() => {
        const footer: FooterValues = {} as FooterValues;
        const totaHrsOrd = this.hours().reduce((acc, bill) => acc + (bill.hrsOrd || 0), 0);
        const valTotaHrsOrd = this.hours().reduce((acc, bill) => acc + (bill.valHrsOrd || 0), 0);
        const hrsExtDia = this.hours().reduce((acc, bill) => acc + (bill.hrsExtDia || 0), 0);
        const valExtDia = this.hours().reduce((acc, bill) => acc + (bill.valExtDia || 0), 0);
        const hrsNoc = this.hours().reduce((acc, bill) => acc + (bill.hrsNoc || 0), 0);
        const valHrsNoc = this.hours().reduce((acc, bill) => acc + (bill.valHrsNoc || 0), 0);

        const hrsExtNoc = this.hours().reduce((acc, bill) => acc + (bill.hrsExtNoc || 0), 0);
        const valExtNoc = this.hours().reduce((acc, bill) => acc + (bill.valExtNoc || 0), 0);

        const hrsDomDia = this.hours().reduce((acc, bill) => acc + (bill.hrsDomDia || 0), 0);
        const valDomDia = this.hours().reduce((acc, bill) => acc + (bill.valDomDia || 0), 0);

        const hrsExtDomDia = this.hours().reduce((acc, bill) => acc + (bill.hrsExtDomDia || 0), 0);
        const valExtDomDia = this.hours().reduce((acc, bill) => acc + (bill.valExtDomDia || 0), 0);

        const hrsDomNoc = this.hours().reduce((acc, bill) => acc + (bill.hrsDomNoc || 0), 0);
        const valDomNoc = this.hours().reduce((acc, bill) => acc + (bill.valDomNoc || 0), 0);

        const hrsExtDomNoc = this.hours().reduce((acc, bill) => acc + (bill.hrsExtDomNoc || 0), 0);
        const valExtDomNoc = this.hours().reduce((acc, bill) => acc + (bill.valExtDomNoc || 0), 0);

        const total = this.hours().reduce((acc, bill) => acc + (bill.total || 0), 0);
        const auxTotal = this.hours().reduce((acc, bill) => acc + (bill.auxiliaryTrasport || 0), 0);

        footer.size = '7';
        footer.values = [
            { id: 'totaHrsOrd', value: totaHrsOrd, pipe: 'number' },
            { id: 'valTotaHrsOrd', value: valTotaHrsOrd, pipe: 'price' },
            { id: 'hrsExtDia', value: hrsExtDia, pipe: 'number' },
            { id: 'valExtDia', value: valExtDia, pipe: 'price' },
            { id: 'hrsNoc', value: hrsNoc, pipe: 'number' },
            { id: 'valHrsNoc', value: valHrsNoc, pipe: 'price' },

            { id: 'hrsExtNoc', value: hrsExtNoc, pipe: 'number' },
            { id: 'valExtNoc', value: valExtNoc, pipe: 'price' },

            { id: 'hrsDomDia', value: hrsDomDia, pipe: 'number' },
            { id: 'valDomDia', value: valDomDia, pipe: 'price' },

            { id: 'hrsExtDomDia', value: hrsExtDomDia, pipe: 'number' },
            { id: 'valExtDomDia', value: valExtDomDia, pipe: 'price' },

            { id: 'hrsDomNoc', value: hrsDomNoc, pipe: 'number' },
            { id: 'valDomNoc', value: valDomNoc, pipe: 'price' },

            { id: 'hrsExtDomNoc', value: hrsExtDomNoc, pipe: 'number' },
            { id: 'valExtDomNoc', value: valExtDomNoc, pipe: 'price' },
            { id: 'auxTotal', value: auxTotal, pipe: 'price' },

            { id: 'total', value: total, pipe: 'price' },
            { id: 'empty1', value: 0, pipe: 'number' }
        ];
        return footer;
    });

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'employee', header: 'Empleado' },
            { field: 'cc', header: 'Cédula' },
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
        globalFiltes: ['employee', 'cc'],
        header: [
            {
                pipe: null,
                id: 'employee',
                title: 'Empleado',
                size: '16rem'
            },
            {
                pipe: null,
                id: 'cc',
                title: 'Cédula',
                size: '12rem'
            },
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
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (rowData: any) => this.openNew(rowData.item)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteItem(rowData.item)
            }
        ]
    };

    activeRoute = inject(ActivatedRoute);

    eventService = inject(EventsService);
    messageService = inject(MessageService);

    employeeService = inject(EmployeeService);

    confirmationService = inject(ConfirmationService);

    constructor() {
        effect(() => {
            this.getHours();
        });
    }

    ngOnInit(): void {
        this.loadDetail();
        this.getAllEmployees();
    }

    getEmptyHour() {
        return {
            _id: '',
            employeeId: '',
            eventId: this.eventId(),
            employee: '',
            cc: '',
            hourPrice: 0,
            date: new Date(),
            startTime: new Date(this.currentDate.setHours(6, 0, 0, 0)),
            hrsOrd: 0,
            valHrsOrd: 0,
            hrsExtDia: 0,
            valExtDia: 0,
            hrsNoc: 0,
            valHrsNoc: 0,
            hrsExtNoc: 0,
            valExtNoc: 0,
            hrsDomDia: 0,
            valDomDia: 0,
            hrsExtDomDia: 0,
            valExtDomDia: 0,
            hrsDomNoc: 0,
            valDomNoc: 0,
            hrsExtDomNoc: 0,
            valExtDomNoc: 0,
            auxiliaryTrasport: 0,
            total: 0
        };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNew(item: any) {
        this.timeDialog = true;
        if (item) {
            this.item = {
                ...item,
                date: new Date(item.date),
                startTime: new Date(item.startTime),
                endTime: item.endTime ? new Date(item.endTime) : null
            };
        }
    }

    onSelectEmployee(employee: AutoCompleteSelectEvent) {
        const { value } = employee;
        this.item.employee = value.name || '';
        this.item.cc = value.cc || '';
        this.item.hourPrice = value.hourPrice || 0;
        this.item.employeeId = value._id || '';
    }

    deleteItem(item: Hour) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el registro de hora ' + item.employee + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService.deleteHour(item._id).subscribe({
                    next: (data: any) => {
                        const hourDeleted = data.data;

                        this.hours.update((hours: Hour[]) => {
                            return hours.filter((hour) => hour._id !== hourDeleted._id);
                        });

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Hora eliminada correctamente',
                            life: 3000
                        });

                        this.eventService.eventId$.set('');
                        this.eventService.eventId$.set(this.eventId());
                    }
                });
            }
        });
    }

    hideDialog() {
        this.timeDialog = false;
        this.item = this.getEmptyHour();
    }

    saveItem() {
        this.submitted = true;
        this.hasErrorTime = this.item && this.item.endTime && this.item.endTime ? this.item.endTime < this.item.startTime : false;
        if (!this.item.employee || this.item.hourPrice === 0 || !this.item.cc || !this.item.date || !this.item.startTime || this.hasErrorTime) {
            this.submitted = false;
            return;
        }

        this.hasErrorTime = false;
        this.item = {
            ...this.item,
            eventId: this.eventId()
        };

        if (!this.item._id) {
            this.eventService.addNewHour(this.item).subscribe({
                next: (data: any) => {
                    this.hours.update((prev) => {
                        const newItem = { ...data.data };
                        return [...prev, newItem];
                    });

                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Hora guardada correctamente', life: 3000 });
                    this.timeDialog = false;
                    this.eventService.eventId$.set('');
                    this.eventService.eventId$.set(this.eventId());
                    this.submitted = false;
                    this.item = this.getEmptyHour();
                },
                error: (error: any) => {
                    console.log('error', error);
                    const { message } = error.error.error || {};
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: message,
                        life: 3000
                    });
                }
            });

            return;
        }

        this.eventService.editHour(this.item).subscribe({
            next: (data: any) => {
                this.hours.update((prev) => {
                    const index = prev.findIndex((hour) => hour._id === data.data._id);
                    if (index !== -1) {
                        prev[index] = { ...data.data };
                    }

                    this.timeDialog = false;

                    return [...prev];
                });

                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Hora actualizada correctamente', life: 3000 });
                this.eventService.eventId$.set('');
                this.eventService.eventId$.set(this.eventId());
            }
        });
    }

    search(event: AutoCompleteCompleteEvent) {
        this.employeeSearch = this.employees().filter((item) => item.name?.includes(event.query));
    }

    private loadDetail() {
        this.activeRoute.parent?.params.subscribe((params) => {
            this.eventId.set(params['id'] || '');
        });
    }

    private getHours() {
        this.eventService.getHoursByEventId(this.eventId()).subscribe({
            next: (data: any) => {
                this.hours.set(data.data || []);
            }
        });
    }

    private getAllEmployees() {
        this.employeeService
            .getAllEmployee()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    this.employees.set(data.data);
                }
            });
    }
}
