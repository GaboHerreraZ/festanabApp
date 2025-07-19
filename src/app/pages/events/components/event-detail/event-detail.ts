import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { EventsService } from '../../events.service';
import { EventTotal } from '../../../../core/models/event-total';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-event-detail',
    imports: [TabsModule, RouterModule, CommonModule, ButtonModule],
    standalone: true,
    templateUrl: './event-detail.html'
})
export class EventDetail implements OnInit {
    activeRoute = inject(ActivatedRoute);

    eventService = inject(EventsService);

    router = inject(Router);

    totalEvent: EventTotal = {
        _id: '',
        date: new Date(),
        description: '',
        name: '',
        owner: '',
        phoneNumber: 0,
        time: new Date(),
        totalBillValue: 0,
        totalCostPrice: 0,
        totalHourCost: 0,
        totalRentalPrice: 0
    };

    tabs = [
        { route: 'quote', label: 'Cotización', icon: 'pi pi-calculator' },
        { route: 'labour', label: 'Registro de Horas', icon: 'pi pi-calendar-clock' },
        { route: 'bills', label: 'Gastos', icon: 'pi pi-receipt' }
    ];

    constructor() {
        effect(() => {
            const id = this.eventService.eventId$();
            this.getEventDetail(id);
        });
    }

    ngOnInit(): void {
        this.router.navigate(['quote'], { relativeTo: this.activeRoute });
        this.activeRoute.params.subscribe((params) => {
            const { id } = params;
            this.eventService.eventId$.set(id);
        });
    }

    goClientQuote() {}

    private getEventDetail(id: string) {
        if (!id) {
            return;
        }

        return this.eventService.getTotalsByEventId(id).subscribe((totals: any) => {
            this.totalEvent = totals.data;
        });
    }
}
