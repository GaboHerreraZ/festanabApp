import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, Table as TablePrime } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BehaviorSubject, catchError, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { SettingService } from '../../settings.service';
import { TableSettings } from '../../../../core/models/table-setting';
import { toSignal } from '@angular/core/rxjs-interop';
import { Table } from '../../../../shared/components/table/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IService } from '../../../../core/models/service';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-services',
    imports: [CommonModule, ButtonModule, Table, TextareaModule, InputTextModule, ConfirmDialogModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule, ReactiveFormsModule],
    standalone: true,
    templateUrl: './services.html',
    providers: [MessageService, ConfirmationService]
})
export class Services implements OnDestroy {
    confirmationService = inject(ConfirmationService);
    refresh$ = new BehaviorSubject<void>(undefined);
    destroy$ = new Subject<void>();

    settingService = inject(SettingService);
    service = inject(MessageService);
    form!: FormGroup;
    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'service', header: 'Servicio' },
            { field: 'price', header: 'Precio' },
            { field: 'description', header: 'Descripción' }
        ],
        globalFiltes: ['service'],
        header: [
            {
                pipe: null,
                id: 'service',
                title: 'Servicio',
                size: '16rem'
            },
            {
                pipe: 'price',
                id: 'price',
                title: 'Precio',
                size: '8rem'
            },
            {
                pipe: null,
                id: 'description',
                title: 'Descripción',
                size: '16rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (row: any) => this.editService(row)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteService(rowData.item)
            }
        ]
    };
    services$ = this.refresh$.pipe(
        switchMap(() =>
            this.settingService.getAllServices().pipe(
                takeUntil(this.destroy$),
                map((data: any) => data.data),
                catchError(() => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de servicios.' });
                    return of([]);
                })
            )
        )
    );
    services = toSignal(this.services$, { initialValue: [] });
    serviceDialog: boolean = false;

    constructor(private fb: FormBuilder) {
        this.setForm();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onGlobalFilter(table: TablePrime, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    saveService() {
        const data = this.form.getRawValue();

        this.settingService.addEditService(data).subscribe({
            next: () => {
                this.service.add({ severity: 'success', summary: 'Successful', detail: 'Servicio guardado correctamente.', life: 3000 });
                this.refresh$.next();
                this.serviceDialog = false;
                this.form.reset();
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el servicio.' });
            }
        });
    }

    newService() {
        this.serviceDialog = true;
        this.form.reset();
    }

    editService(service: any) {
        this.serviceDialog = true;
        const { item } = service;
        this.form.patchValue({ ...item });
    }

    private deleteService(service: IService) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el servicio: ' + service.service + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.settingService
                    .deleteService(service._id!)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.service.add({ severity: 'success', summary: 'Successful', detail: 'Servicio eliminado correctamente', life: 3000 });
                        this.refresh$.next();
                    });
            }
        });
    }

    private setForm() {
        this.form = this.fb.group({
            _id: [''],
            service: ['', Validators.required],
            price: [0, Validators.required],
            description: ['']
        });
    }
}
