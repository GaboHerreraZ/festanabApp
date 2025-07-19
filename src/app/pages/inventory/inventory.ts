import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InventoryService } from './inventory.service';
import { Subject, takeUntil } from 'rxjs';
import { Column } from '../../core/models/column';
import { Product } from '../../core/models/product';

@Component({
    selector: 'app-inventory',
    imports: [CommonModule, ButtonModule, InputTextModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule],
    standalone: true,
    templateUrl: './inventory.html',
    providers: [MessageService, ConfirmationService]
})
export class Inventory implements OnInit, OnDestroy {
    submitted: boolean = false;

    product!: Product;

    productDialog: boolean = false;

    products = signal<Product[]>([]);

    cols!: Column[];

    destroy$ = new Subject<void>();

    inventoryService = inject(InventoryService);

    constructor(
        private service: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadData();
        this.getAllInventory();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNew() {
        this.product = {};
        this.submitted = false;
        this.productDialog = true;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;
        let _products = this.products();
        if (!this.product.name?.trim() || !this.product.quantity || !this.product.rentalPrice) {
            return;
        }

        this.inventoryService.addNewProduct(this.product).subscribe({
            next: (data: any) => {
                this.service.add({ severity: 'success', summary: 'Successful', detail: 'Producto guardado correctamente.', life: 3000 });

                const exist = _products.some((item) => item._id === data.data._id);
                if (exist) {
                    _products = _products.map((item) => (item._id === data.data._id ? data.data : item));
                } else {
                    _products.push(data.data);
                }

                this.products.set([..._products]);
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el producto.' });
            },
            complete: () => {
                this.productDialog = false;
                this.product = {};
            }
        });
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.productDialog = true;
    }

    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: '¿Estas seguro de eliminar ' + product.name + '?',
            header: 'Confirmar',
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // this.products.set(this.products().filter((val) => val.id !== product.id));
                this.product = {};
                this.service.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Deleted',
                    life: 3000
                });
            }
        });
    }

    private loadData() {
        this.cols = [
            { field: 'name', header: 'Nombre' },
            { field: 'quantity', header: 'Cantidad' },
            { field: 'rentalPrice', header: 'Precio Alquiler' }
        ];
    }

    private getAllInventory() {
        this.inventoryService
            .getAllInventory()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    this.products.set(data.data);
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el inventario.' });
                }
            });
    }
}
