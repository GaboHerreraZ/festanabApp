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
import { IModule } from '../../../../core/models/module';
import { BehaviorSubject, catchError, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { SettingService } from '../../settings.service';
import { TableSettings } from '../../../../core/models/table-setting';
import { toSignal } from '@angular/core/rxjs-interop';
import { Table } from '../../../../shared/components/table/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-module',
    imports: [CommonModule, ButtonModule, Table, InputTextModule, ConfirmDialogModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule, ReactiveFormsModule],
    standalone: true,
    templateUrl: './module.html',
    providers: [MessageService, ConfirmationService]
})
export class Module implements OnDestroy {
    confirmationService = inject(ConfirmationService);
    refresh$ = new BehaviorSubject<void>(undefined);
    destroy$ = new Subject<void>();

    settingService = inject(SettingService);
    service = inject(MessageService);
    form!: FormGroup;
    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [{ field: 'module', header: 'Módulo' }],
        globalFiltes: ['module'],
        header: [
            {
                pipe: null,
                id: 'module',
                title: 'Módulo',
                size: '16rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (row: any) => this.editModule(row)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteModule(rowData.item)
            }
        ]
    };
    modules$ = this.refresh$.pipe(
        switchMap(() =>
            this.settingService.getAllModule().pipe(
                takeUntil(this.destroy$),
                map((data: any) => data.data),
                catchError(() => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de módulos.' });
                    return of([]);
                })
            )
        )
    );
    modules = toSignal(this.modules$, { initialValue: [] });
    moduleDialog: boolean = false;

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

    saveModule() {
        const data = this.form.getRawValue();

        this.settingService.addEditModule(data).subscribe({
            next: () => {
                this.service.add({ severity: 'success', summary: 'Successful', detail: 'Módule guardado correctamente.', life: 3000 });
                this.refresh$.next();
                this.moduleDialog = false;
                this.form.reset();
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el módulo.' });
            }
        });
    }

    newModule() {
        this.moduleDialog = true;
        this.form.reset();
    }

    editModule(module: any) {
        this.moduleDialog = true;
        const { item } = module;
        this.form.patchValue({ ...item });
    }

    private deleteModule(module: IModule) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el módulo: ' + module.module + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.settingService
                    .deleteModule(module._id!)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.service.add({ severity: 'success', summary: 'Successful', detail: 'Módulo eliminado correctamente', life: 3000 });
                        this.refresh$.next();
                    });
            }
        });
    }

    private setForm() {
        this.form = this.fb.group({
            _id: [''],
            module: ['', Validators.required]
        });
    }
}
