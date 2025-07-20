import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { EventsService } from '../events/events.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-customer-quotation',
    imports: [CommonModule, PanelModule, DividerModule],
    standalone: true,
    templateUrl: './customer-quotation.html'
})
export class CustomerQuotation implements OnInit {
    eventService = inject(EventsService);
    activatedRoute = inject(ActivatedRoute);

    eventId = signal<string>('');

    event: any;
    sections: any;

    constructor() {
        effect(() => {
            const id = this.eventId();
            if (id) {
                this.getEventDetail(id);
            }
        });
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((params) => {
            const { id } = params;
            this.eventId.set(id);
        });
    }

    getEventDetail(id: string) {
        combineLatest([this.eventService.getEventById(id), this.eventService.getTotalsByEventId(id)]).subscribe(([detail, event]: [any, any]) => {
            console.log(detail);
            this.sections = detail.data.section.filter((item: any) => item.type === 'client');
            this.event = event.data;
        });
    }
}
