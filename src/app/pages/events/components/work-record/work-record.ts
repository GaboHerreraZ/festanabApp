import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Labour } from './components/labour/labour';
import { EmployeeServices } from './components/employee-services/employee-services';
import { EmployeeService } from '../../../employee/employee.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { EventsService } from '../../events.service';
import { MessageService } from 'primeng/api';
import { EventBilling } from './components/event-billing/event-billing';

@Component({
    selector: 'app-work-record',
    templateUrl: './work-record.html',
    imports: [TabsModule, RouterModule, CommonModule, Labour, EventBilling, EmployeeServices, ButtonModule],
    providers: [MessageService]
})
export class WorkRecord implements OnDestroy {
    tabs = [
        { route: 'hours', label: 'Registro de Horas', icon: 'pi pi-calendar-clock' },
        { route: 'employee-services', label: 'Registro de Servicios', icon: 'pi pi-receipt' },
        { route: 'settlement', label: 'Liquidación', icon: 'pi pi-calculator' }
    ];

    destroy$ = new Subject<void>();

    employeeService = inject(EmployeeService);

    messageService = inject(MessageService);

    eventService = inject(EventsService);

    employees = toSignal(
        this.employeeService.getAllEmployee().pipe(
            takeUntil(this.destroy$),
            map((data: any) => data.data)
        ),
        { initialValue: [] }
    );

    eventId = signal<string>('');

    constructor(private activeRoute: ActivatedRoute) {
        this.activeRoute.parent?.params.subscribe((params) => {
            this.eventId.set(params['id'] || '');
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    settleEvent() {
        this.eventService
            .setEventBilling(this.eventId())
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                console.log('data', data);
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento liquidado correctamente y disponible en pestaña Liquidación.' });
            });
    }
}
