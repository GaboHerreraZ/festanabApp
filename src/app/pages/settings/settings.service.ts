import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Module } from '../../core/models/module';
import { Setting } from '../../core/models/setting';

@Injectable({
    providedIn: 'root'
})
export class SettingService {
    readonly PATH_UTIL = 'util';

    readonly PATH_SETTING = 'setting';

    apiService = inject(ApiService);

    constructor() {}

    getAllModule() {
        return this.apiService.get<Module[]>(`${this.PATH_UTIL}/module/all`);
    }

    addEditModule(module: Module) {
        return this.apiService.post<Module>(`${this.PATH_UTIL}/module/add-edit-module`, {
            _id: module._id || undefined,
            module: module.module
        });
    }

    getSettings() {
        return this.apiService.get<any>(`${this.PATH_SETTING}/setting`);
    }

    updateSettings(settings: Setting) {
        return this.apiService.post(`${this.PATH_SETTING}/setting`, { ...settings });
    }
}
