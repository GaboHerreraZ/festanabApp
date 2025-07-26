import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Customer } from '../../core/models/customer';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    readonly PATH = 'customer';

    apiService = inject(ApiService);

    constructor() {}

    getAllCustomers() {
        return this.apiService.get<Customer[]>(`${this.PATH}/get-customers`);
    }

    addEditCustomer(customer: Customer) {
        return this.apiService.post<Customer>(`${this.PATH}/add-edit-customer`, {
            _id: customer._id || undefined,
            name: customer.name,
            nit: customer.nit
        });
    }

    getCustomerByName(name: string) {
        return this.apiService.get<Customer[]>(`${this.PATH}/get-customer-by-name/${encodeURIComponent(name)}`);
    }
}
