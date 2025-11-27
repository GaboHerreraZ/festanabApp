import { Component, computed, effect, inject, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { IHour } from '../../../../core/models/hour';
import { FooterValues, TableSettings } from '../../../../core/models/table-setting';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../events.service';
import { Table } from '../../../../shared/components/table/table';
import { EmployeeService } from '../../../employee/employee.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { IEmployee } from '../../../../core/models/employee';
import { BehaviorSubject, filter, map, Subject, switchMap, take, takeLast, takeUntil } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-labour',
    imports: [ButtonModule, AutoCompleteModule, FormsModule, Table, CommonModule, DatePickerModule, InputTextModule, DatePickerModule, DialogModule, ToastModule, ConfirmDialogModule, ToolbarModule, InputNumberModule, ReactiveFormsModule],
    templateUrl: './labour.html',
    standalone: true,
    providers: [MessageService, ConfirmationService]
})
export class Labour implements OnInit, OnDestroy {
    refresh$ = new BehaviorSubject<void>(undefined);

    activeRoute = inject(ActivatedRoute);
    destroy$ = new Subject<void>();

    eventService = inject(EventsService);
    messageService = inject(MessageService);

    employeeService = inject(EmployeeService);

    confirmationService = inject(ConfirmationService);
    detailTitle: string = '';
    currentDate = new Date();
    submitted: boolean = false;
    eventId = signal<any>(null);
    form!: FormGroup;

    employees = toSignal(
        this.employeeService.getAllEmployee().pipe(
            takeUntil(this.destroy$),
            map((data: any) => data.data)
        ),
        { initialValue: [] }
    );

    timeDialog: boolean = false;

    eventId$ = toObservable(this.eventId);

    dateSignal!: Signal<Date | null>;
    minDateSignal = computed(() => {
        const date = this.dateSignal();
        if (!date) return null;
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    maxDateSignal = computed(() => {
        const date = this.dateSignal();
        if (!date) return null;
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    });

    hoursList$ = this.refresh$.pipe(
        switchMap(() =>
            this.eventId$.pipe(
                filter((id) => !!id),
                switchMap((id) => this.eventService.getHoursByEventId(id).pipe(map((data: any) => data.data)))
            )
        )
    );

    hours = toSignal(this.hoursList$, { initialValue: [] });

    employeeSearch: IEmployee[] = [];

    hasErrorTime: boolean = false;

    footerValues: Signal<FooterValues> = computed(() => {
        const footer: FooterValues = {} as FooterValues;
        const totaHrsOrd = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsOrd || 0), 0);
        const valTotaHrsOrd = this.hours().reduce((acc: any, bill: any) => acc + (bill.valHrsOrd || 0), 0);
        const hrsExtDia = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsExtDia || 0), 0);
        const valExtDia = this.hours().reduce((acc: any, bill: any) => acc + (bill.valExtDia || 0), 0);
        const hrsNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsNoc || 0), 0);
        const valHrsNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.valHrsNoc || 0), 0);

        const hrsExtNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsExtNoc || 0), 0);
        const valExtNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.valExtNoc || 0), 0);

        const hrsDomDia = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsDomDia || 0), 0);
        const valDomDia = this.hours().reduce((acc: any, bill: any) => acc + (bill.valDomDia || 0), 0);

        const hrsExtDomDia = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsExtDomDia || 0), 0);
        const valExtDomDia = this.hours().reduce((acc: any, bill: any) => acc + (bill.valExtDomDia || 0), 0);

        const hrsDomNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsDomNoc || 0), 0);
        const valDomNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.valDomNoc || 0), 0);

        const hrsExtDomNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.hrsExtDomNoc || 0), 0);
        const valExtDomNoc = this.hours().reduce((acc: any, bill: any) => acc + (bill.valExtDomNoc || 0), 0);

        const total = this.hours().reduce((acc: any, bill: any) => acc + (bill.total || 0), 0);
        const auxTotal = this.hours().reduce((acc: any, bill: any) => acc + (bill.auxiliaryTrasport || 0), 0);

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

    constructor(private fb: FormBuilder) {
        this.setForm();

        effect(() => {
            const newDate = this.dateSignal();
            if (!newDate) return;

            const start = this.form.get('startTime')!.value;
            const end = this.form.get('endTime')!.value;

            if (start) {
                const updatedStart = this.mergeDateAndTime(newDate, start);
                this.form.get('startTime')!.setValue(updatedStart, { emitEvent: false });
            }

            if (end) {
                const updatedEnd = this.mergeDateAndTime(newDate, end);
                this.form.get('endTime')!.setValue(updatedEnd, { emitEvent: false });
            }
        });
    }

    ngOnInit(): void {
        this.loadDetail();
        this.getAllEmployees();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNew(item: any) {
        this.detailTitle = 'Nuevo Registro';

        this.timeDialog = true;
        if (item) {
            this.detailTitle = 'Editar Registro';

            this.form.patchValue({ ...item, date: new Date(item.date), startTime: new Date(item.startTime), endTime: new Date(item.endTime) });
        }
    }

    onSelectEmployee(employee: AutoCompleteSelectEvent) {
        const {
            value: { name, cc, hourPrice, _id }
        } = employee;

        this.form.patchValue({ cc, employee: name, hourPrice, employeeId: _id });
    }

    deleteItem(item: IHour) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el registro de hora ' + item.employee + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService
                    .deleteHour(item._id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Registro eliminado correctamente',
                                life: 3000
                            });

                            this.refresh$.next();
                        }
                    });
            }
        });
    }

    saveItem() {
        let { _id, ...res } = this.form.getRawValue();

        const item: IHour = {
            ...this.form.getRawValue()
        };

        const hasHour = this.employeeHasAuxTransportInDate(res.employeeId, res.date, _id);

        console.log('hasHour', hasHour);

        if (!_id) {
            this.eventService
                .addNewHour({ ...res, hasHour, auxiliaryTrasport: hasHour ? 0 : res.auxiliaryTrasport })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Hora guardada correctamente', life: 3000 });
                        this.timeDialog = false;
                        this.resetForm();

                        this.refresh$.next();
                    },
                    error: (error: any) => {
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

        this.eventService
            .editHour({ ...item, hasHour, auxiliaryTrasport: hasHour ? 0 : item.auxiliaryTrasport })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Hora actualizada correctamente', life: 3000 });
                    this.refresh$.next();
                    this.timeDialog = false;
                    this.resetForm();
                }
            });
    }

    search(event: AutoCompleteCompleteEvent) {
        this.employeeSearch = this.employees().filter((item: any) => item.name?.includes(event.query));
    }

    private loadDetail() {
        this.activeRoute.parent?.params.subscribe((params) => {
            this.eventId.set(params['id'] || '');
            this.form.patchValue({ eventId: this.eventId() });
        });
    }

    private getAllEmployees() {
        this.employeeService.getAllEmployee().pipe(
            takeUntil(this.destroy$),
            map((data: any) => data.data)
        );
    }

    private resetForm() {
        const todayAt6AM = new Date();
        todayAt6AM.setHours(6, 0, 0, 0);
        this.form.reset({ date: new Date(), startTime: todayAt6AM, endTime: todayAt6AM, eventId: this.eventId() });
    }

    private setForm() {
        const todayAt6AM = new Date();
        todayAt6AM.setHours(6, 0, 0, 0);
        this.form = this.fb.group(
            {
                _id: [''],
                employee: ['', Validators.required],
                cc: [{ value: '', disabled: true }],
                hourPrice: [{ value: '', disabled: true }],
                date: [new Date()],
                startTime: [todayAt6AM, Validators.required],
                endTime: [todayAt6AM],
                employeeId: [''],
                eventId: [this.eventId()],
                hrsOrd: [0],
                valHrsOrd: [0],
                hrsExtDia: [0],
                valExtDia: [0],
                hrsNoc: [0],
                valHrsNoc: [0],
                hrsExtNoc: [0],
                valExtNoc: [0],
                hrsDomDia: [0],
                valDomDia: [0],
                hrsExtDomDia: [0],
                valExtDomDia: [0],
                hrsDomNoc: [0],
                valDomNoc: [0],
                hrsExtDomNoc: [0],
                valExtDomNoc: [0],
                auxiliaryTrasport: [0],
                total: [0]
            },
            { validators: this.startBeforeEndValidator }
        );

        const dateCtrl = this.form.get('date')!;

        this.dateSignal = toSignal(dateCtrl.valueChanges, {
            initialValue: dateCtrl.value
        });
    }

    private startBeforeEndValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        const start = group.get('startTime')?.value;
        const end = group.get('endTime')?.value;

        if (!start || !end) return null;

        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();

        return startTime > endTime ? { startAfterEnd: true } : null;
    };

    private mergeDateAndTime(date: Date, time: Date): Date {
        const d = new Date(date);

        d.setHours(time.getHours());
        d.setMinutes(time.getMinutes());
        d.setSeconds(0);
        d.setMilliseconds(0);

        return d;
    }

    private employeeHasAuxTransportInDate(employeeId: string, date: string | Date, currentRecordId?: string): boolean {
        const target = new Date(date);

        const matches = this.hours().filter((h: any) => {
            if (h.employeeId !== employeeId) return false;
            if (h._id === currentRecordId) return false; // <-- NO contar el registro actual

            const d = new Date(h.date);
            const sameDay = d.getDate() === target.getDate() && d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();

            return sameDay && h.auxiliaryTrasport !== 0;
        });

        // Si existe algún *otro* registro con auxiliaryTransport !== 0, entonces ya tiene
        return matches.length > 0;
    }
}
