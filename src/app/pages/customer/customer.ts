import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Table } from '../../shared/components/table/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableSettings } from '../../core/models/table-setting';
import { Customer as Model } from '../../core/models/customer';
import { CustomerService } from './customer.service';
import { Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-customer',
    imports: [Table, FormsModule, CommonModule, ButtonModule, ToolbarModule, InputTextModule, ToastModule, DialogModule],
    standalone: true,
    templateUrl: './customer.html',
    providers: [MessageService]
})
export class Customer implements OnInit, OnDestroy {
    customerService = inject(CustomerService);

    destroy$ = new Subject<void>();

    customers = signal<Model[]>([]);

    submitted: boolean = false;

    customer!: Model;

    customerDialog: boolean = false;

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'name', header: 'Nombre' },
            { field: 'nit', header: 'Cédula / Nit' }
        ],
        globalFiltes: ['name', 'nit'],
        header: [
            {
                pipe: null,
                id: 'name',
                title: 'Nombre',
                size: '16rem'
            },
            {
                pipe: null,
                id: 'nit',
                title: 'Cédula / Nit',
                size: '16rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (row: any) => this.openNew(row)
            }
        ]
    };

    constructor(private service: MessageService) {}

    ngOnInit(): void {
        this.getAllCustomer();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNew(row: any = null) {
        this.customer = {};
        this.submitted = false;
        if (row) {
            this.customer = { ...row.item };
        }
        this.customerDialog = true;
    }

    hideDialog() {
        this.customerDialog = false;
        this.submitted = false;
    }

    saveCustomer() {
        this.submitted = true;
        let _customers = this.customers();
        if (!this.customer.name?.trim() || !this.customer.nit?.trim()) {
            return;
        }

        this.customerService.addEditCustomer(this.customer).subscribe({
            next: (data: any) => {
                this.service.add({ severity: 'success', summary: 'Successful', detail: 'Empleado guardado correctamente.', life: 3000 });

                const exist = _customers.some((item) => item._id === data.data._id);
                if (exist) {
                    _customers = _customers.map((item) => (item._id === data.data._id ? data.data : item));
                } else {
                    _customers.push(data.data);
                }

                this.customers.set([..._customers]);
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el Empleado.' });
            },
            complete: () => {
                this.customerDialog = false;
                this.customer = {};
                this.submitted = false;
            }
        });
    }

    private getAllCustomer() {
        this.customerService
            .getAllCustomers()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    this.customers.set(data.data);
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de clientes.' });
                }
            });
    }
}
