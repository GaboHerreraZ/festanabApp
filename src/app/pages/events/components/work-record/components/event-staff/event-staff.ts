import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BehaviorSubject, filter, map, Subject, switchMap, takeUntil } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EventsService } from '../../../../events.service';
import { Table } from '../../../../../../shared/components/table/table';
import { TableSettings } from '../../../../../../core/models/table-setting';
import { IEmployee } from '../../../../../../core/models/employee';

@Component({
    selector: 'app-event-staff',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, AutoCompleteModule, Table, ToolbarModule, ToastModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './event-staff.html'
})
export class EventStaff implements OnDestroy {
    private destroy$ = new Subject<void>();

    eventService = inject(EventsService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    eventId = input<string>();
    employees = input<IEmployee[]>([]);

    refresh$ = new BehaviorSubject<void>(undefined);

    eventId$ = toObservable(this.eventId);

    isApproved = computed(() => this.eventService.eventStatus$() === 'approved');

    selectedEmployee: IEmployee | null = null;
    employeeSearch: IEmployee[] = [];

    eventEmployees$ = this.refresh$.pipe(
        switchMap(() =>
            this.eventId$.pipe(
                filter((id) => !!id),
                switchMap((id) =>
                    this.eventService.getEventEmployees(id!).pipe(
                        map((res: any) =>
                            (res?.data ?? []).map((row: any) => ({
                                _id: row._id,
                                eventId: row.eventId,
                                employeeId: row.employeeId?._id,
                                employee: row.employeeId?.name,
                                cc: row.employeeId?.cc,
                                assignedAt: row.assignedAt
                            }))
                        )
                    )
                )
            )
        )
    );

    eventEmployees = toSignal(this.eventEmployees$, { initialValue: [] });

    tableSettings: TableSettings = {
        includesTotal: false,
        columns: [
            { field: 'employee', header: 'Empleado' },
            { field: 'cc', header: 'Cédula' },
            { field: 'assignedAt', header: 'Asignado el' }
        ],
        globalFiltes: ['employee', 'cc'],
        header: [
            { pipe: null, id: 'employee', title: 'Empleado', size: '20rem' },
            { pipe: null, id: 'cc', title: 'Cédula', size: '14rem' },
            { pipe: 'date', id: 'assignedAt', title: 'Asignado el', size: '16rem' }
        ],
        actions: [
            {
                id: 'delete',
                icon: 'pi pi-trash',
                tooltip: 'Eliminar',
                severity: 'danger',
                action: (rowData: any) => this.removeEmployee(rowData.item)
            }
        ]
    };

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    search(event: AutoCompleteCompleteEvent) {
        const query = (event.query || '').toLowerCase();
        const assignedIds = new Set(this.eventEmployees().map((e: any) => e.employeeId));
        this.employeeSearch = this.employees().filter((item: any) => !assignedIds.has(item._id) && item.name?.toLowerCase().includes(query));
    }

    onSelect(event: AutoCompleteSelectEvent) {
        this.selectedEmployee = event.value;
    }

    assign() {
        const eventId = this.eventId();
        if (!eventId || !this.selectedEmployee?._id) return;

        this.eventService
            .addEventEmployee(eventId, this.selectedEmployee._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empleado asignado correctamente', life: 3000 });
                    this.selectedEmployee = null;
                    this.refresh$.next();
                },
                error: (error: any) => {
                    const { message } = error?.error?.error || {};
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: message || 'No se pudo asignar el empleado', life: 3000 });
                }
            });
    }

    removeEmployee(item: any) {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar a ${item.employee} del evento?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService
                    .deleteEventEmployee(item._id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empleado eliminado correctamente', life: 3000 });
                            this.refresh$.next();
                        },
                        error: () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el empleado', life: 3000 });
                        }
                    });
            }
        });
    }
}
