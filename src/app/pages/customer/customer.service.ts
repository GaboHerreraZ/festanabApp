import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { ICustomer } from '../../core/models/customer';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    readonly PATH = 'customer';

    apiService = inject(ApiService);

    constructor() {}

    getAllCustomers() {
        return this.apiService.get<ICustomer[]>(`${this.PATH}/get-customers`);
    }

    addEditCustomer(customer: ICustomer) {
        return this.apiService.post<ICustomer>(`${this.PATH}/add-edit-customer`, {
            _id: customer._id || undefined,
            name: customer.name,
            nit: customer.nit
        });
    }

    getCustomerByName(name: string) {
        return this.apiService.get<ICustomer[]>(`${this.PATH}/get-customer-by-name/${encodeURIComponent(name)}`);
    }
}
