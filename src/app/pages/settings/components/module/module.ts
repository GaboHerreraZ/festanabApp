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
import { Module as Model } from '../../../../core/models/module';
import { Column } from '../../../../core/models/column';
import { Subject, takeUntil } from 'rxjs';
import { SettingService } from '../../settings.service';

@Component({
    selector: 'app-module',
    imports: [CommonModule, ButtonModule, InputTextModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule],
    standalone: true,
    templateUrl: './module.html',
    providers: [MessageService]
})
export class Module implements OnInit, OnDestroy {
    submitted: boolean = false;

    module!: Model;

    moduleDialog: boolean = false;

    modules = signal<Model[]>([]);

    cols!: Column[];

    destroy$ = new Subject<void>();

    settingService = inject(SettingService);

    constructor(private service: MessageService) {}

    ngOnInit() {
        this.loadData();
        this.getAllModules();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNew() {
        this.module = {};
        this.submitted = false;
        this.moduleDialog = true;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.moduleDialog = false;
        this.submitted = false;
    }

    saveModule() {
        this.submitted = true;
        let _modules = this.modules();
        if (!this.module.module?.trim()) {
            return;
        }

        this.settingService.addEditModule(this.module).subscribe({
            next: (data: any) => {
                this.service.add({ severity: 'success', summary: 'Successful', detail: 'Módule guardado correctamente.', life: 3000 });

                const exist = _modules.some((item) => item._id === data.data._id);
                if (exist) {
                    _modules = _modules.map((item) => (item._id === data.data._id ? data.data : item));
                } else {
                    _modules.push(data.data);
                }

                this.modules.set([..._modules]);
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el módulo.' });
            },
            complete: () => {
                this.moduleDialog = false;
                this.module = {};
            }
        });
    }

    editModule(module: Model) {
        this.module = { ...module };
        this.moduleDialog = true;
    }

    private loadData() {
        this.cols = [{ field: 'module', header: 'Módulo' }];
    }

    private getAllModules() {
        this.settingService
            .getAllModule()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    this.modules.set(data.data);
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de módulos.' });
                }
            });
    }
}
