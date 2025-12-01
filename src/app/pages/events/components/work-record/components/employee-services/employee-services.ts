import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { IHour } from '../../../../../../core/models/hour';
import { TableSettings } from '../../../../../../core/models/table-setting';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../../../events.service';
import { Table } from '../../../../../../shared/components/table/table';
import { EmployeeService } from '../../../../../employee/employee.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { IEmployee } from '../../../../../../core/models/employee';
import { BehaviorSubject, filter, map, Subject, switchMap, takeUntil } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SettingService } from '../../../../../settings/settings.service';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { IEmployeeService } from '../../../../../../core/models/employee-service';

@Component({
    selector: 'app-employee-services',
    imports: [
        ButtonModule,
        AutoCompleteModule,
        SelectModule,
        FormsModule,
        Table,
        CommonModule,
        DatePickerModule,
        InputTextModule,
        DatePickerModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        ToolbarModule,
        InputNumberModule,
        TextareaModule,
        ReactiveFormsModule
    ],
    templateUrl: './employee-services.html',
    standalone: true,
    providers: [MessageService, ConfirmationService]
})
export class EmployeeServices implements OnDestroy {
    refresh$ = new BehaviorSubject<void>(undefined);

    activeRoute = inject(ActivatedRoute);

    destroy$ = new Subject<void>();

    eventService = inject(EventsService);

    settingService = inject(SettingService);

    messageService = inject(MessageService);

    employeeService = inject(EmployeeService);

    confirmationService = inject(ConfirmationService);

    detailTitle: string = '';

    eventId = input<string>();

    form!: FormGroup;

    services = toSignal(this.settingService.getAllServices().pipe(map((data: any) => data.data)), { initialValue: [] });

    employees = input<IEmployee[]>([]);

    timeDialog: boolean = false;

    eventId$ = toObservable(this.eventId);

    employeeServicesList$ = this.refresh$.pipe(
        switchMap(() =>
            this.eventId$.pipe(
                filter((id) => !!id),
                switchMap((id) => this.eventService.getEmployeeServiceByEventId(id!).pipe(map((data: any) => data.data)))
            )
        )
    );

    employeeServices = toSignal(this.employeeServicesList$, { initialValue: [] });

    employeeSearch: IEmployee[] = [];

    hasErrorTime: boolean = false;

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'employee', header: 'Empleado' },
            { field: 'cc', header: 'Cédula' },
            { field: 'date', header: 'Fecha' },
            { field: 'quantity', header: 'Cantidad' },
            { field: 'service', header: 'Servicio' },
            { field: 'servicePrice', header: 'Precio Servicio' },
            { field: 'total', header: 'Total a Pagar' },
            { field: 'observations', header: 'Observaciones' }
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
            const id = this.eventId();
            if (id) {
                this.form.patchValue({ eventId: id });
            }
        });
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

    onServiceChange(event: SelectChangeEvent) {
        const { _id, service, price } = event.value;
        const { quantity } = this.form.getRawValue();
        this.form.patchValue({ serviceId: _id, servicePrice: price, total: price * quantity, service });
    }

    onSelectEmployee(employee: AutoCompleteSelectEvent) {
        const {
            value: { name, cc, hourPrice, _id }
        } = employee;

        this.form.patchValue({ cc, employee: name, hourPrice, employeeId: _id });
    }

    deleteItem(item: IEmployeeService) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el registro de hora ' + item.employee + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService
                    .deleteEmployeeService(item._id)
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
        console.log('event', this.eventId());

        const item: IEmployeeService = {
            ...res,
            eventId: this.eventId()
        };

        if (!_id) {
            this.eventService
                .addEmployeeService({ ...item })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Servicio guardado correctamente', life: 3000 });
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
            .editEmployeeService({ ...item, _id })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Servicio actualizado correctamente', life: 3000 });
                    this.refresh$.next();
                    this.timeDialog = false;
                    this.resetForm();
                }
            });
    }

    search(event: AutoCompleteCompleteEvent) {
        this.employeeSearch = this.employees().filter((item: any) => item.name?.includes(event.query));
    }

    private resetForm() {
        this.form.reset({ date: new Date(), eventId: this.eventId() });
    }

    private setForm() {
        this.form = this.fb.group({
            _id: [''],
            employee: ['', Validators.required],
            quantity: [1, Validators.required],
            cc: [{ value: '', disabled: true }],
            service: ['', Validators.required],
            serviceId: ['', Validators.required],
            servicePrice: [{ value: '', disabled: true }],
            date: [new Date()],
            employeeId: [''],
            observations: [''],
            eventId: [this.eventId()],
            total: [0]
        });

        this.form.controls['quantity'].valueChanges.subscribe((value) => {
            const servicePrice = this.form.controls['servicePrice'].value || 0;
            this.form.controls['total'].setValue(value * servicePrice);
        });
    }
}
