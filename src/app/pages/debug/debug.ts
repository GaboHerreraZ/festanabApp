import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
    selector: 'app-debug',
    standalone: true,
    imports: [CommonModule, TabsModule, RouterModule],
    templateUrl: './debug.html'
})
export class Debug {
    tabs = [{ route: 'hours-calculator', label: 'Cálculo de Horas', icon: 'pi pi-calculator' }];
}
