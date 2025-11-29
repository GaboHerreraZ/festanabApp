import { Component, inject, OnDestroy } from '@angular/core';
import { Table } from '../../shared/components/table/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableSettings } from '../../core/models/table-setting';
import { ICustomer } from '../../core/models/customer';
import { CustomerService } from './customer.service';
import { BehaviorSubject, catchError, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-customer',
    templateUrl: './customer.html',
    standalone: true,
    imports: [Table, FormsModule, CommonModule, ButtonModule, ConfirmDialogModule, ToolbarModule, InputTextModule, ToastModule, DialogModule, ReactiveFormsModule],
    providers: [MessageService, ConfirmationService]
})
export class Customer implements OnDestroy {
    confirmationService = inject(ConfirmationService);
    customerService = inject(CustomerService);
    destroy$ = new Subject<void>();
    refresh$ = new BehaviorSubject<void>(undefined);
    form!: FormGroup;
    customerList$ = this.refresh$.pipe(
        switchMap(() =>
            this.customerService.getAllCustomers().pipe(
                takeUntil(this.destroy$),
                map((data: any) => data.data),
                catchError((e) => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de clientes.' });
                    return of([]);
                })
            )
        )
    );
    customers = toSignal(this.customerList$, { initialValue: [] });
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
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteCustomer(rowData.item)
            }
        ]
    };

    constructor(
        private service: MessageService,
        private fb: FormBuilder
    ) {
        this.setForm();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNew(row: any = null) {
        if (row) {
            const { name, nit, _id } = row.item;
            this.form.setValue({ _id, name, nit });
        }
        this.customerDialog = true;
    }

    hideDialog() {
        this.customerDialog = false;
    }

    saveCustomer() {
        const { name, nit, _id } = this.form.value;
        const customer: ICustomer = {
            name,
            nit,
            _id
        };

        this.customerService
            .addEditCustomer(customer)
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
                    this.customerDialog = false;
                }
            });
    }

    private deleteCustomer(customer: ICustomer) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el cliente: ' + customer.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.customerService
                    .deleteCustomer(customer._id!)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.service.add({ severity: 'success', summary: 'Successful', detail: 'Cliente eliminado correctamente', life: 3000 });
                        this.refresh$.next();
                    });
            }
        });
    }

    private setForm() {
        this.form = this.fb.group({
            _id: [''],
            name: ['', Validators.required],
            nit: ['', Validators.required]
        });
    }
}
