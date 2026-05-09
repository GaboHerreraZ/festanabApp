import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject, takeUntil } from 'rxjs';
import { EventsService } from '../events/events.service';
import { IEmployeeEvent, IEmployeeEventHour } from '../../core/models/hour';

@Component({
    selector: 'app-employee-hours-record',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        AccordionModule,
        TableModule,
        TagModule,
        ToastModule,
        DialogModule,
        DatePickerModule,
        TooltipModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './employee-hours-record.html'
})
export class EmployeeHoursRecord implements OnDestroy {
    private destroy$ = new Subject<void>();
    private eventService = inject(EventsService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);

    cc = signal<string>('');
    loading = signal<boolean>(false);
    searched = signal<boolean>(false);
    events = signal<IEmployeeEvent[]>([]);
    employeeName = signal<string>('');
    employeeId = signal<string>('');

    hourDialog = false;
    dialogTitle = 'Agregar Horas';
    today: Date = (() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
    })();
    selectedEvent: IEmployeeEvent | null = null;
    editingHourId: string | null = null;
    form!: FormGroup;

    constructor() {
        this.setForm();
    }

    search() {
        const value = this.cc().trim();
        if (!value) {
            this.messageService.add({ severity: 'warn', summary: 'Cédula requerida', detail: 'Ingresa tu número de cédula para continuar.', life: 3000 });
            return;
        }

        this.loading.set(true);
        this.eventService
            .getEmployeeEventsByCc(value)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    const list: IEmployeeEvent[] = res?.data ?? [];
                    this.events.set(list);
                    this.employeeName.set(list[0]?.employee ?? '');
                    this.employeeId.set(list[0]?.employeeId ?? '');
                    this.searched.set(true);
                    this.loading.set(false);
                },
                error: () => {
                    this.events.set([]);
                    this.searched.set(true);
                    this.loading.set(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los eventos. Verifica tu cédula.',
                        life: 3000
                    });
                }
            });
    }

    eventTotalHours(ev: IEmployeeEvent): number {
        return ev.hours.reduce((acc, h) => acc + this.diffHours(h.startTime, h.endTime), 0);
    }

    diffHours(start: string | Date, end: string | Date): number {
        if (!start || !end) return 0;
        const ms = new Date(end).getTime() - new Date(start).getTime();
        return Math.max(0, ms / (1000 * 60 * 60));
    }

    getHourSeverity(hour: IEmployeeEventHour): 'success' | 'danger' | 'warn' {
        if (hour.approved) return 'success';
        if (!hour.approved && hour.approvedAt) return 'danger';
        return 'warn';
    }

    getHourLabel(hour: IEmployeeEventHour): string {
        if (hour.approved) return 'Aprobada';
        if (!hour.approved && hour.approvedAt) return 'Rechazada';
        return 'Pendiente';
    }

    getEventStatusLabel(status: string): string {
        const map: Record<string, string> = {
            inQuote: 'En Cotización',
            pending: 'Por Liquidar',
            completed: 'Finalizado'
        };
        return map[status] || status;
    }

    getEventStatusSeverity(status: string): 'info' | 'warn' | 'success' {
        if (status === 'completed') return 'success';
        if (status === 'pending') return 'warn';
        return 'info';
    }

    openNew(ev: IEmployeeEvent) {
        this.selectedEvent = ev;
        this.editingHourId = null;
        this.dialogTitle = 'Agregar Horas';
        this.resetForm(ev);
        this.hourDialog = true;
    }

    openEdit(ev: IEmployeeEvent, hour: IEmployeeEventHour) {
        this.selectedEvent = ev;
        this.editingHourId = hour._id ?? (hour as any).id ?? null;
        this.dialogTitle = 'Editar Horas';
        this.form.reset({
            startTime: hour.startTime ? new Date(hour.startTime) : null,
            endTime: hour.endTime ? new Date(hour.endTime) : null
        });
        this.hourDialog = true;
    }

    canEdit(hour: IEmployeeEventHour): boolean {
        return !hour.approved && !!hour.observations?.trim();
    }

    canDelete(hour: IEmployeeEventHour): boolean {
        return !hour.approved;
    }

    deleteHour(hour: IEmployeeEventHour) {
        const id = hour._id ?? (hour as any).id;
        if (!id) return;

        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar este registro de hora?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService
                    .deleteHour(id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado correctamente', life: 3000 });
                            this.search();
                        },
                        error: () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro', life: 3000 });
                        }
                    });
            }
        });
    }

    closeDialog() {
        this.hourDialog = false;
        this.selectedEvent = null;
        this.editingHourId = null;
    }

    save() {
        if (!this.selectedEvent || this.form.invalid) return;

        const raw = this.form.getRawValue();
        const ev = this.selectedEvent;

        if (this.hasOverlap(ev, raw.startTime, raw.endTime)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Horas solapadas',
                detail: 'Las horas registradas se solapan con otro registro del mismo día.',
                life: 4000
            });
            return;
        }

        const startDate = raw.startTime ? new Date(raw.startTime) : new Date();
        const dateOnly = new Date(startDate);
        dateOnly.setHours(0, 0, 0, 0);

        const hasHour = this.employeeHasAuxTransportInDate(ev, dateOnly);

        const payload: any = {
            eventId: ev.eventId,
            employeeId: ev.employeeId,
            employee: ev.employee,
            cc: ev.cc,
            hourPrice: ev.hourPrice ?? 0,
            date: dateOnly,
            startTime: raw.startTime,
            endTime: raw.endTime,
            hasHour
        };

        const isEdit = !!this.editingHourId;
        const request$ = isEdit
            ? this.eventService.editHour({ ...payload, _id: this.editingHourId } as any)
            : this.eventService.addNewHour(payload);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: isEdit ? 'Hora actualizada correctamente' : 'Hora guardada correctamente',
                    life: 3000
                });
                this.closeDialog();
                this.search();
            },
            error: (error: any) => {
                const { message } = error?.error?.error || {};
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: message || 'No se pudo guardar la hora',
                    life: 3000
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setForm() {
        const start = new Date();
        start.setHours(6, 0, 0, 0);
        const end = new Date();
        end.setHours(7, 0, 0, 0);

        this.form = this.fb.group(
            {
                startTime: [start, Validators.required],
                endTime: [end, Validators.required]
            },
            { validators: this.startBeforeEndValidator }
        );
    }

    private resetForm(_ev: IEmployeeEvent) {
        const start = new Date();
        start.setHours(6, 0, 0, 0);
        const end = new Date();
        end.setHours(7, 0, 0, 0);
        this.form.reset({ startTime: start, endTime: end });
    }

    private startBeforeEndValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        const start = group.get('startTime')?.value;
        const end = group.get('endTime')?.value;
        if (!start || !end) return null;
        return new Date(start).getTime() > new Date(end).getTime() ? { startAfterEnd: true } : null;
    };


    private hasOverlap(ev: IEmployeeEvent, start: Date | string, end: Date | string): boolean {
        const newStart = new Date(start).getTime();
        const newEnd = new Date(end).getTime();
        if (!newStart || !newEnd || newStart >= newEnd) return false;

        return ev.hours.some((h: IEmployeeEventHour) => {
            const hourId = h._id ?? (h as any).id;
            if (this.editingHourId && hourId === this.editingHourId) return false;

            const existingStart = new Date(h.startTime).getTime();
            const existingEnd = new Date(h.endTime).getTime();
            if (!existingStart || !existingEnd) return false;

            return newStart < existingEnd && existingStart < newEnd;
        });
    }

    private employeeHasAuxTransportInDate(ev: IEmployeeEvent, date: string | Date): boolean {
        const target = new Date(date);
        return ev.hours.some((h: any) => {
            const d = new Date(h.startTime);
            const sameDay = d.getDate() === target.getDate() && d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
            return sameDay && h.auxiliaryTrasport && h.auxiliaryTrasport !== 0;
        });
    }
}
