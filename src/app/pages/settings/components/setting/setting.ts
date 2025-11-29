import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Setting as Model } from '../../../../core/models/setting';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SettingService } from '../../settings.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BehaviorSubject, catchError, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-setting',
    imports: [CommonModule, IconFieldModule, InputTextModule, InputNumberModule, FormsModule, ButtonModule, ToastModule, ReactiveFormsModule],
    standalone: true,
    templateUrl: './setting.html',
    providers: [MessageService]
})
export class Setting implements OnInit, OnDestroy {
    refresh$ = new BehaviorSubject<void>(undefined);
    messageService = inject(MessageService);

    settingService = inject(SettingService);

    settings$ = this.refresh$.pipe(
        switchMap(() =>
            this.settingService.getSettings().pipe(
                takeUntil(this.destroy$),
                map((data) => data.data),
                tap((data) => {
                    const { _v, ...rest } = data;
                    this.form.patchValue({ ...rest });
                }),
                catchError(() => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error cargando porcentajes' });
                    return of([]);
                })
            )
        )
    );
    settings = toSignal(this.settings$, { initialValue: [] });
    form!: FormGroup;

    destroy$ = new Subject<void>();

    constructor(private fb: FormBuilder) {
        this.setForm();
        effect(() => {
            this.settings();
        });
    }

    ngOnInit(): void {
        this.refresh$.next();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    saveSettings() {
        const data = this.form.getRawValue();

        this.settingService
            .updateSettings(data)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.refresh$.next();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Horas guardadas correctamente'
                    });
                }
            });
    }

    private setForm() {
        this.form = this.fb.group({
            daytimeOvertimeHour: [0, [Validators.required, Validators.min(0)]],
            regularNighttimeHour: [0, [Validators.required, Validators.min(0)]],
            nighttimeOvertimeHour: [0, [Validators.required, Validators.min(0)]],
            sundayAndHolidayHour: [0, [Validators.required, Validators.min(0)]],
            daytimeOvertimeSundayHoliday: [0, [Validators.required, Validators.min(0)]],
            nighttimeOvertimeSundayHoliday: [0, [Validators.required, Validators.min(0)]],
            nightWorkSundayHoliday: [0, [Validators.required, Validators.min(0)]],
            auxiliaryTrasport: [0, [Validators.required, Validators.min(0)]],
            _id: ['']
        });
    }
}
