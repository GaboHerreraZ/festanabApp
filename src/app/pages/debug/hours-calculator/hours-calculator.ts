import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { EventsService } from '../../events/events.service';

interface ResultRow {
    label: string;
    value: number;
    type: 'number' | 'currency';
}

@Component({
    selector: 'app-hours-calculator',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DatePickerModule, InputNumberModule, ToastModule],
    providers: [MessageService],
    templateUrl: './hours-calculator.html'
})
export class HoursCalculator implements OnDestroy {
    private destroy$ = new Subject<void>();
    private fb = inject(FormBuilder);
    private eventService = inject(EventsService);
    private messageService = inject(MessageService);

    loading = signal(false);
    result = signal<ResultRow[] | null>(null);
    total = signal<number | null>(null);

    today: Date = (() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
    })();

    form: FormGroup = this.fb.group({
        startTime: [this.defaultStart(), Validators.required],
        endTime: [this.defaultEnd(), Validators.required],
        hourPrice: [50000, [Validators.required, Validators.min(0)]]
    });

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    calculate() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { startTime, endTime, hourPrice } = this.form.getRawValue();

        const payload = {
            startTime: this.toIsoWithOffset(startTime),
            endTime: this.toIsoWithOffset(endTime),
            hourPrice: Number(hourPrice)
        };

        this.loading.set(true);
        this.eventService
            .debugClassifyHours(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.loading.set(false);
                    this.applyResult(res?.data);
                },
                error: () => {
                    this.loading.set(false);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo calcular las horas.', life: 3000 });
                }
            });
    }

    private applyResult(data: any) {
        if (!data) {
            this.result.set([]);
            this.total.set(0);
            return;
        }

        const rows: ResultRow[] = [
            { label: 'Horas Ordinarias', value: data.hrsOrd ?? 0, type: 'number' },
            { label: 'Valor Horas Ordinarias', value: data.valHrsOrd ?? 0, type: 'currency' },
            { label: 'Horas Extras Diurnas', value: data.hrsExtDia ?? 0, type: 'number' },
            { label: 'Valor Horas Extras Diurnas', value: data.valExtDia ?? 0, type: 'currency' },
            { label: 'Horas Nocturnas Ordinarias', value: data.hrsNoc ?? 0, type: 'number' },
            { label: 'Valor Horas Nocturnas Ordinarias', value: data.valHrsNoc ?? 0, type: 'currency' },
            { label: 'Horas Extras Nocturnas', value: data.hrsExtNoc ?? 0, type: 'number' },
            { label: 'Valor Horas Extras Nocturnas', value: data.valExtNoc ?? 0, type: 'currency' },
            { label: 'Horas Diurnas Dominicales', value: data.hrsDomDia ?? 0, type: 'number' },
            { label: 'Valor Horas Diurnas Dominicales', value: data.valDomDia ?? 0, type: 'currency' },
            { label: 'Horas Extra Diurnas Dominicales', value: data.hrsExtDomDia ?? 0, type: 'number' },
            { label: 'Valor Horas Extra Diurnas Dominicales', value: data.valExtDomDia ?? 0, type: 'currency' },
            { label: 'Horas Nocturnas Dominicales', value: data.hrsDomNoc ?? 0, type: 'number' },
            { label: 'Valor Horas Nocturnas Dominicales', value: data.valDomNoc ?? 0, type: 'currency' },
            { label: 'Horas Extras Nocturnas Dominicales', value: data.hrsExtDomNoc ?? 0, type: 'number' },
            { label: 'Valor Horas Extras Nocturnas Dominicales', value: data.valExtDomNoc ?? 0, type: 'currency' },
            { label: 'Auxilio Transporte', value: data.auxiliaryTrasport ?? 0, type: 'currency' }
        ];

        this.result.set(rows);
        this.total.set(data.total ?? 0);
    }

    private toIsoWithOffset(date: Date | string): string {
        const d = new Date(date);
        const tzOffsetMin = -d.getTimezoneOffset();
        const sign = tzOffsetMin >= 0 ? '+' : '-';
        const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
        const offsetH = pad(tzOffsetMin / 60);
        const offsetM = pad(tzOffsetMin % 60);

        const yyyy = d.getFullYear();
        const MM = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mm = pad(d.getMinutes());
        const ss = pad(d.getSeconds());

        return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${sign}${offsetH}:${offsetM}`;
    }

    private defaultStart(): Date {
        const d = new Date();
        d.setHours(8, 0, 0, 0);
        return d;
    }

    private defaultEnd(): Date {
        const d = new Date();
        d.setHours(17, 0, 0, 0);
        return d;
    }
}
