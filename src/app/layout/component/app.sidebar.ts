import { Component, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AppMenu } from './app.menu';
import { AuthService } from '../../core/services/auth';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, ButtonModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `
        <div class="layout-sidebar flex flex-col h-full">
            <div class="flex-1 overflow-y-auto">
                <app-menu></app-menu>
            </div>
            <div class="p-4 border-t border-gray-200">
                <p-button label="Cerrar Sesión" icon="pi pi-sign-out" severity="danger" [outlined]="true" styleClass="w-full" (onClick)="confirmLogout()" />
            </div>
        </div>
        <p-confirmdialog [style]="{ width: '420px' }" />
    `
})
export class AppSidebar {
    private confirmationService = inject(ConfirmationService);
    private authService = inject(AuthService);
    private router = inject(Router);

    constructor(public el: ElementRef) {}

    confirmLogout() {
        this.confirmationService.confirm({
            message: '¿Está seguro que desea cerrar sesión?',
            header: 'Cerrar Sesión',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, cerrar sesión',
            rejectLabel: 'Cancelar',
            accept: async () => {
                await this.authService.logout();
                this.router.navigate(['/auth/login']);
            }
        });
    }
}
