import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { EventsService } from '../events/events.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageModule } from 'primeng/image';

@Component({
    selector: 'app-customer-quotation',
    imports: [CommonModule, PanelModule, DividerModule, ImageModule],
    standalone: true,
    templateUrl: './customer-quotation.html'
})
export class CustomerQuotation implements OnInit, OnDestroy {
    eventService = inject(EventsService);
    activatedRoute = inject(ActivatedRoute);

    eventId = signal<string>('');
    destroy$ = new Subject<void>();

    event: any;
    sections: any;

    constructor(private domsanitizer: DomSanitizer) {
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private getEventDetail(id: string) {
        this.eventService
            .getCustomerQuote(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
                const data = res.data;
                this.sections = data.detail.section.filter((item: any) => item.type === 'client');
                this.sections.forEach((section: any) => {
                    const newDescription = section.description.replace(/\n/g, '<br>');
                    section.description = this.domsanitizer.bypassSecurityTrustHtml(newDescription);
                });
                this.event = data;
            });
    }
}
