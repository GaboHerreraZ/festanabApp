import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Product } from '../../core/models/product';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    readonly PATH = 'inventory';

    apiService = inject(ApiService);

    constructor() {}

    getAllInventory() {
        return this.apiService.get<Product[]>(`${this.PATH}/get-inventory`);
    }

    addNewProduct(product: Product) {
        return this.apiService.post<Product>(`${this.PATH}/add-edit-item`, {
            _id: product._id || undefined,
            name: product.name,
            quantity: product.quantity,
            rentalPrice: product.rentalPrice
        });
    }
}
