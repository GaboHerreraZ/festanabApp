import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Employee } from '../../core/models/employee';

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    readonly PATH = 'employee';

    apiService = inject(ApiService);

    constructor() {}

    getAllEmployee() {
        return this.apiService.get<Employee[]>(`${this.PATH}/get-employees`);
    }

    addEditEmployee(employee: Employee) {
        return this.apiService.post<Employee>(`${this.PATH}/add-edit-employee`, {
            _id: employee._id || undefined,
            name: employee.name,
            hourPrice: employee.hourPrice,
            cc: employee.cc
        });
    }
}
