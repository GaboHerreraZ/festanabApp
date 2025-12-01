import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { IModule } from '../../core/models/module';
import { Setting } from '../../core/models/setting';
import { IService } from '../../core/models/service';

@Injectable({
    providedIn: 'root'
})
export class SettingService {
    readonly PATH_UTIL = 'util';

    readonly PATH_SETTING = 'setting';

    apiService = inject(ApiService);

    getAllModule() {
        return this.apiService.get<IModule[]>(`${this.PATH_UTIL}/module/all`);
    }

    getAllServices() {
        return this.apiService.get<IModule[]>(`${this.PATH_UTIL}/services/all`);
    }

    addEditModule(module: IModule) {
        return this.apiService.post<IModule>(`${this.PATH_UTIL}/module/add-edit-module`, {
            _id: module._id || undefined,
            module: module.module
        });
    }

    addEditService(service: IService) {
        return this.apiService.post<IService>(`${this.PATH_UTIL}/services/add-edit-service`, service);
    }

    getSettings() {
        return this.apiService.get<any>(`${this.PATH_SETTING}/setting`);
    }

    updateSettings(settings: Setting) {
        return this.apiService.post(`${this.PATH_SETTING}/setting`, { ...settings });
    }

    deleteModule(moduleId: string) {
        return this.apiService.delete<{ message: string }>(`${this.PATH_UTIL}/module/delete-module/${moduleId}`);
    }

    deleteService(serviceId: string) {
        return this.apiService.delete<{ message: string }>(`${this.PATH_UTIL}/services/delete-service/${serviceId}`);
    }
}
