import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Table as TableModel, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { IEmployee } from '../../core/models/employee';
import { BehaviorSubject, catchError, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { EmployeeService } from './employee.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TableSettings } from '../../core/models/table-setting';
import { Table } from '../../shared/components/table/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-employee',
    imports: [CommonModule, Table, ButtonModule, ConfirmDialogModule, InputTextModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule, ReactiveFormsModule],
    standalone: true,
    templateUrl: './employee.html',
    providers: [MessageService, ConfirmationService]
})
export class Employee implements OnInit, OnDestroy {
    form!: FormGroup;
    refresh$ = new BehaviorSubject<void>(undefined);
    employeeDialog: boolean = false;

    employeeService = inject(EmployeeService);
    confirmationService = inject(ConfirmationService);

    service = inject(MessageService);

    destroy$ = new Subject<void>();

    employeesList$ = this.refresh$.pipe(
        switchMap(() =>
            this.employeeService.getAllEmployee().pipe(
                takeUntil(this.destroy$),
                map((data: any) => data.data),
                catchError(() => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de empleados.' });
                    return of([]);
                })
            )
        )
    );
    employeesList = toSignal(this.employeesList$, { initialValue: [] });

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'name', header: 'Nombre' },
            { field: 'cc', header: 'Cédula / Nit' },
            { field: 'hourPrice', header: 'Precio Hora' }
        ],
        globalFiltes: ['name', 'cc', 'hourPrice'],
        header: [
            {
                pipe: null,
                id: 'name',
                title: 'Nombre',
                size: '16rem'
            },
            {
                pipe: null,
                id: 'cc',
                title: 'Cédula',
                size: '16rem'
            },
            {
                pipe: 'price',
                id: 'hourPrice',
                title: 'Precio Hora',
                size: '16rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (row: any) => this.editEmployee(row)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteEmployee(rowData.item)
            }
        ]
    };

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onGlobalFilter(table: TableModel, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    saveEmployee() {
        const { name, cc, hourPrice, _id } = this.form.value;

        const employee: IEmployee = {
            name,
            cc,
            hourPrice,
            _id
        };

        this.employeeService
            .addEditEmployee(employee)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.service.add({ severity: 'success', summary: 'Successful', detail: 'Empleado guardado correctamente.', life: 3000 });
                    this.refresh$.next();
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el Empleado.' });
                },
                complete: () => {
                    this.employeeDialog = false;
                }
            });
    }

    editEmployee(employee: any) {
        if (employee) {
            const { name, cc, hourPrice, _id } = employee.item;
            this.form.setValue({ _id, name, cc, hourPrice });
        }

        this.employeeDialog = true;
    }

    private loadData() {
        this.setForm();
    }

    private deleteEmployee(employee: IEmployee) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el empleado: ' + employee.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.employeeService
                    .deleteEmployee(employee._id!)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.service.add({ severity: 'success', summary: 'Successful', detail: 'Empleado eliminado correctamente', life: 3000 });
                        this.refresh$.next();
                    });
            }
        });
    }

    private setForm() {
        this.form = this.fb.group({
            _id: [''],
            name: ['', Validators.required],
            hourPrice: ['', Validators.required],
            cc: ['', Validators.required]
        });
    }
}
