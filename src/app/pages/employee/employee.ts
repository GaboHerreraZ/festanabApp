import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Employee as Model } from '../../core/models/employee';
import { Column } from '../../core/models/column';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeService } from './employee.service';

@Component({
    selector: 'app-employee',
    imports: [CommonModule, ButtonModule, InputTextModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule],
    standalone: true,
    templateUrl: './employee.html',
    providers: [MessageService]
})
export class Employee implements OnInit, OnDestroy {
    submitted: boolean = false;

    employee!: Model;

    employeeDialog: boolean = false;

    employees = signal<Model[]>([]);

    cols!: Column[];

    destroy$ = new Subject<void>();

    employeeService = inject(EmployeeService);

    constructor(private service: MessageService) {}

    ngOnInit() {
        this.loadData();
        this.getAllEmployees();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNew() {
        this.employee = {};
        this.submitted = false;
        this.employeeDialog = true;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.employeeDialog = false;
        this.submitted = false;
    }

    saveEmployee() {
        this.submitted = true;
        let _employees = this.employees();
        if (!this.employee.name?.trim() || !this.employee.cc || !this.employee.hourPrice) {
            return;
        }

        this.employeeService.addEditEmployee(this.employee).subscribe({
            next: (data: any) => {
                this.service.add({ severity: 'success', summary: 'Successful', detail: 'Empleado guardado correctamente.', life: 3000 });

                const exist = _employees.some((item) => item._id === data.data._id);
                if (exist) {
                    _employees = _employees.map((item) => (item._id === data.data._id ? data.data : item));
                } else {
                    _employees.push(data.data);
                }

                this.employees.set([..._employees]);
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el Empleado.' });
            },
            complete: () => {
                this.employeeDialog = false;
                this.employee = {};
            }
        });
    }

    editEmployee(employee: Model) {
        this.employee = { ...employee };
        this.employeeDialog = true;
    }

    private loadData() {
        this.cols = [
            { field: 'name', header: 'Nombre' },
            { field: 'cc', header: 'Cédula' },
            { field: 'hourPrice', header: 'Precio Hora' }
        ];
    }

    private getAllEmployees() {
        this.employeeService
            .getAllEmployee()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    this.employees.set(data.data);
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de empleados.' });
                }
            });
    }
}
