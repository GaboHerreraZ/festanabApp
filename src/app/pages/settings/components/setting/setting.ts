import { Component, inject, OnInit } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Setting as Model } from '../../../../core/models/setting';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SettingService } from '../../settings.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-setting',
    imports: [CommonModule, IconFieldModule, InputTextModule, InputNumberModule, FormsModule, ButtonModule, ToastModule],
    standalone: true,
    templateUrl: './setting.html',
    providers: [MessageService]
})
export class Setting implements OnInit {
    setting: Model = {
        _id: '', // This will be set when the settings are loaded
        daytimeOvertimeHour: 0, // Recargo Hora Extra Diurna
        regularNighttimeHour: 0, // Hora Nocturna Ordinaria
        nighttimeOvertimeHour: 0, // Hora Extra Nocturna
        sundayAndHolidayHour: 0, // Hora Dominicales y Festivos
        daytimeOvertimeSundayHoliday: 0, // Hora Extra Diurna Dominicales y Festivos
        nighttimeOvertimeSundayHoliday: 0, // Hora Extra Nocturna Dominicales y Festivos
        nightWorkSundayHoliday: 0, // Trabajo Nocturno Dominical o Festivo
        auxiliaryTrasport: 0
    };

    submitted: boolean = false;

    settingService = inject(SettingService);
    messageService = inject(MessageService);

    ngOnInit(): void {
        this.getSettings();
    }

    saveSettings() {
        this.submitted = true;

        // Validate the setting object before sending it to the server
        if (
            this.setting.daytimeOvertimeHour <= 0 ||
            this.setting.regularNighttimeHour <= 0 ||
            this.setting.nighttimeOvertimeHour <= 0 ||
            this.setting.sundayAndHolidayHour <= 0 ||
            this.setting.daytimeOvertimeSundayHoliday <= 0 ||
            this.setting.nighttimeOvertimeSundayHoliday <= 0 ||
            this.setting.nightWorkSundayHoliday <= 0
        ) {
            return; // Prevent submission if any value is invalid
        }

        this.settingService.updateSettings(this.setting).subscribe({
            next: (data: any) => {
                this.submitted = true;
                this.setting = data.data;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Horas guardadas correctamente'
                });
            }
        });
    }

    private getSettings() {
        this.settingService.getSettings().subscribe({
            next: (settings) => {
                this.setting = settings.data;
            }
        });
    }
}
