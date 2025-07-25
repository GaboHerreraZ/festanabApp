import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Festanab',
                items: [
                    { label: 'Eventos', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/pages/events'] },
                    { label: 'Inventario', icon: 'pi pi-fw pi-warehouse', routerLink: ['/pages/inventory'] },
                    { label: 'Parametrización', icon: 'pi pi-fw pi-cog', routerLink: ['/pages/settings'] },
                    { label: 'Empleados', icon: 'pi pi-fw pi-users', routerLink: ['/pages/employees'] },
                    { label: 'Clientes', icon: 'pi pi-fw pi-address-book', routerLink: ['/pages/customers'] }
                ]
            }
        ];
    }
}
