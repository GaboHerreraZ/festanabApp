import { Component, computed, effect, inject, input, OnDestroy, Signal, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AccordionModule } from 'primeng/accordion';
import { IEmployeeHours, IHour } from '../../../../../../core/models/hour';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../../../events.service';
import { EmployeeService } from '../../../../../employee/employee.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IEmployee } from '../../../../../../core/models/employee';
import { BehaviorSubject, filter, map, Subject, switchMap, takeUntil } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EmployeeHours } from './components/employee-hours/employee-hours';

@Component({
    selector: 'app-labour',
    imports: [
        ButtonModule,
        AutoCompleteModule,
        FormsModule,
        CommonModule,
        DatePickerModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        ToolbarModule,
        AccordionModule,
        InputNumberModule,
        TextareaModule,
        ReactiveFormsModule,
        EmployeeHours
    ],
    templateUrl: './labour.html',
    standalone: true,
    providers: [MessageService, ConfirmationService]
})
export class Labour implements OnDestroy {
    refresh$ = new BehaviorSubject<void>(undefined);

    activeRoute = inject(ActivatedRoute);

    destroy$ = new Subject<void>();

    eventService = inject(EventsService);

    messageService = inject(MessageService);

    employeeService = inject(EmployeeService);

    confirmationService = inject(ConfirmationService);

    detailTitle: string = '';

    eventId = input<string>();

    employees = input<IEmployee[]>([]);

    form!: FormGroup;

    timeDialog: boolean = false;

    rejectDialog: boolean = false;
    rejectObservations: string = '';
    private rejectTarget: IHour | null = null;

    eventId$ = toObservable(this.eventId);

    dateSignal!: Signal<Date | null>;

    minDateSignal = computed(() => {
        const date = this.dateSignal();
        if (!date) return null;
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    maxDateSignal = computed(() => {
        const date = this.dateSignal();
        if (!date) return null;
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    });

    employeesHours$ = this.refresh$.pipe(
        switchMap(() =>
            this.eventId$.pipe(
                filter((id) => !!id),
                switchMap((id) => this.eventService.getHoursByEventId(id!).pipe(map((res: any) => res.data as IEmployeeHours[])))
            )
        )
    );

    employeesHours = toSignal(this.employeesHours$, { initialValue: [] as IEmployeeHours[] });

    eventTotal = computed(() => {
        return this.employeesHours().reduce((acc, emp) => acc + emp.horas.reduce((s, h) => s + (h.total || 0), 0), 0);
    });

    constructor(private fb: FormBuilder) {
        this.setForm();

        effect(() => {
            const newDate = this.dateSignal();
            if (!newDate) return;

            const start = this.form.get('startTime')!.value;
            const end = this.form.get('endTime')!.value;

            if (start) {
                const updatedStart = this.mergeDateAndTime(newDate, start);
                this.form.get('startTime')!.setValue(updatedStart, { emitEvent: false });
            }

            if (end) {
                const updatedEnd = this.mergeDateAndTime(newDate, end);
                this.form.get('endTime')!.setValue(updatedEnd, { emitEvent: false });
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    employeeTotalHours(emp: IEmployeeHours): number {
        return emp.horas.reduce((acc, h) => {
            const ord = h.hrsOrd || 0;
            const extDia = h.hrsExtDia || 0;
            const noc = h.hrsNoc || 0;
            const extNoc = h.hrsExtNoc || 0;
            const domDia = h.hrsDomDia || 0;
            const extDomDia = h.hrsExtDomDia || 0;
            const domNoc = h.hrsDomNoc || 0;
            const extDomNoc = h.hrsExtDomNoc || 0;
            return acc + ord + extDia + noc + extNoc + domDia + extDomDia + domNoc + extDomNoc;
        }, 0);
    }

    employeeTotalAmount(emp: IEmployeeHours): number {
        return emp.horas.reduce((acc, h) => acc + (h.total || 0), 0);
    }

    openNewForEmployee(emp: IEmployeeHours) {
        this.detailTitle = 'Nuevo Registro';
        this.timeDialog = true;
        this.resetForm();
        this.form.patchValue({
            employee: { name: emp.employee, cc: emp.cc },
            cc: emp.cc,
            employeeId: emp.employeeId,
            hourPrice: this.findEmployeeHourPrice(emp.employeeId)
        });
        this.form.get('employee')!.disable({ emitEvent: false });
    }

    openEdit(item: IHour, emp: IEmployeeHours) {
        this.detailTitle = 'Editar Registro';
        this.timeDialog = true;
        this.form.patchValue({
            ...item,
            employee: { name: emp.employee, cc: emp.cc },
            date: new Date(item.date),
            startTime: new Date(item.startTime),
            endTime: item.endTime ? new Date(item.endTime) : null
        });
        this.form.get('employee')!.disable({ emitEvent: false });
    }

    setHourApproval(item: IHour, approved: boolean) {
        if (!approved) {
            this.openRejectDialog(item);
            return;
        }
        this.callApproval(item, true);
    }

    openRejectDialog(item: IHour) {
        this.rejectTarget = item;
        this.rejectObservations = '';
        this.rejectDialog = true;
    }

    closeRejectDialog() {
        this.rejectDialog = false;
        this.rejectTarget = null;
        this.rejectObservations = '';
    }

    confirmReject() {
        if (!this.rejectTarget) return;
        const target = this.rejectTarget;
        const observations = this.rejectObservations.trim();
        this.callApproval(target, false, observations);
    }

    private callApproval(item: IHour, approved: boolean, observations?: string) {
        this.eventService
            .setHourApproval(item._id, approved, observations)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: approved ? 'Hora aprobada correctamente' : 'Hora rechazada correctamente',
                        life: 3000
                    });
                    if (!approved) this.closeRejectDialog();
                    this.refresh$.next();
                },
                error: (error: any) => {
                    const { message } = error?.error?.error || {};
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: message || 'No se pudo actualizar el estado',
                        life: 3000
                    });
                }
            });
    }

    deleteItem(item: IHour, emp: IEmployeeHours) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el registro de hora ' + emp.employee + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService
                    .deleteHour(item._id)
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

        const item: IHour = {
            ...this.form.getRawValue(),
            eventId: this.eventId()
        };

        const hasHour = this.employeeHasAuxTransportInDate(res.employeeId, res.date, _id);

        if (!_id) {
            this.eventService
                .addNewHour({ ...item, hasHour, auxiliaryTrasport: hasHour ? 0 : res.auxiliaryTrasport })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Hora guardada correctamente', life: 3000 });
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
            .editHour({ ...item, _id, hasHour, auxiliaryTrasport: hasHour ? 0 : item.auxiliaryTrasport })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Hora actualizada correctamente', life: 3000 });
                    this.refresh$.next();
                    this.timeDialog = false;
                    this.resetForm();
                }
            });
    }

    closeDialog() {
        this.timeDialog = false;
        this.form.get('employee')!.enable({ emitEvent: false });
    }

    private findEmployeeHourPrice(employeeId: string): number {
        const employee = this.employees().find((e: any) => e._id === employeeId);
        return (employee as any)?.hourPrice ?? 0;
    }

    private resetForm() {
        const todayAt6AM = new Date();
        todayAt6AM.setHours(6, 0, 0, 0);
        this.form.reset({ date: new Date(), startTime: todayAt6AM, endTime: todayAt6AM, eventId: this.eventId() });
        this.form.get('employee')!.enable({ emitEvent: false });
    }

    private setForm() {
        const todayAt6AM = new Date();
        todayAt6AM.setHours(6, 0, 0, 0);
        this.form = this.fb.group(
            {
                _id: [''],
                employee: ['', Validators.required],
                cc: [{ value: '', disabled: true }],
                hourPrice: [{ value: '', disabled: true }],
                date: [new Date()],
                startTime: [todayAt6AM, Validators.required],
                endTime: [todayAt6AM],
                employeeId: [''],
                eventId: [this.eventId()],
                hrsOrd: [0],
                valHrsOrd: [0],
                hrsExtDia: [0],
                valExtDia: [0],
                hrsNoc: [0],
                valHrsNoc: [0],
                hrsExtNoc: [0],
                valExtNoc: [0],
                hrsDomDia: [0],
                valDomDia: [0],
                hrsExtDomDia: [0],
                valExtDomDia: [0],
                hrsDomNoc: [0],
                valDomNoc: [0],
                hrsExtDomNoc: [0],
                valExtDomNoc: [0],
                auxiliaryTrasport: [0],
                total: [0]
            },
            { validators: this.startBeforeEndValidator }
        );

        const dateCtrl = this.form.get('date')!;

        this.dateSignal = toSignal(dateCtrl.valueChanges, {
            initialValue: dateCtrl.value
        });
    }

    private startBeforeEndValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        const start = group.get('startTime')?.value;
        const end = group.get('endTime')?.value;

        if (!start || !end) return null;

        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();

        return startTime > endTime ? { startAfterEnd: true } : null;
    };

    private mergeDateAndTime(date: Date, time: Date): Date {
        const d = new Date(date);

        d.setHours(time.getHours());
        d.setMinutes(time.getMinutes());
        d.setSeconds(0);
        d.setMilliseconds(0);

        return d;
    }

    private employeeHasAuxTransportInDate(employeeId: string, date: string | Date, currentRecordId?: string): boolean {
        const target = new Date(date);

        const allHours: IHour[] = this.employeesHours().flatMap((e) => e.horas);

        const matches = allHours.filter((h: any) => {
            if (h.employeeId !== employeeId) return false;
            if (h._id === currentRecordId) return false;

            const d = new Date(h.date);
            const sameDay = d.getDate() === target.getDate() && d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();

            return sameDay && h.auxiliaryTrasport !== 0;
        });

        return matches.length > 0;
    }
}
