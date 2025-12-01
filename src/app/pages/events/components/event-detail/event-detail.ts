import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { EventsService } from '../../events.service';
import { EventTotal } from '../../../../core/models/event-total';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Clipboard } from '@angular/cdk/clipboard';
import { TooltipModule } from 'primeng/tooltip';
import { exportToExcel } from '../../../../shared/utils/export-event';
import { MaskPipe } from '../../../../shared/pipes/hide-maks';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-event-detail',
    imports: [TabsModule, RouterModule, CommonModule, ConfirmDialogModule, ButtonModule, TooltipModule, MaskPipe, SelectModule, FormsModule, ToastModule],
    providers: [MessageService, ConfirmationService],
    standalone: true,
    templateUrl: './event-detail.html'
})
export class EventDetail implements OnInit {
    activeRoute = inject(ActivatedRoute);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    status: string = 'inQuote';

    eventStatus = [
        {
            key: 'inQuote',
            value: 'En Cotización'
        },
        {
            key: 'pending',
            value: 'Por Liquidar'
        },
        {
            key: 'completed',
            value: 'Finalizado'
        }
    ];
    eventService = inject(EventsService);
    utility = signal<number>(0);

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
        totalRentalPrice: 0,
        status: ''
    };

    tabs = [
        { route: 'quote', label: 'Cotización', icon: 'pi pi-calculator' },
        { route: 'bills', label: 'Gastos', icon: 'pi pi-receipt' },
        { route: 'work-record', label: 'Registro de Trabajo', icon: 'pi pi-calendar-clock' },
        { route: 'customer-quote', label: 'Historial Cotizaciones Cliente', icon: 'pi receipt' }
    ];

    showTotals = {
        totalRentalPrice: false,
        totalHourCost: false,
        totalBillValue: false,
        utility: false
    };

    constructor(private clipboard: Clipboard) {
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

    deleteEvent() {
        const self = this;
        this.confirmationService.confirm({
            message: 'Se eliminarán todos los datos relacionados al evento, horas, gastos y cotizaciones ¿Está seguro de eliminar el evento: ' + self.totalEvent.description + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService.deleteEventById(this.eventService.eventId$()).subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Evento eliminado correctamente',
                        life: 3000
                    });
                    this.router.navigate(['/pages/events']);
                });
            }
        });
    }

    exportEvent() {
        this.eventService.getEventById(this.eventService.eventId$()).subscribe((event: any) => {
            const exportData = {
                description: this.totalEvent.description,
                date: this.totalEvent.date,
                time: this.totalEvent.time,
                owner: this.totalEvent.owner,
                sections: event.data.section.filter((s: any) => s.type === 'client')
            };

            exportToExcel(exportData as any);
        });
    }

    toggle(event: boolean, total: 'totalRentalPrice' | 'totalHourCost' | 'totalBillValue' | 'utility') {
        this.showTotals = {
            ...this.showTotals,
            [total]: event
        };
    }

    updateStatus(status: SelectChangeEvent) {
        this.eventService.updateEventStatusById(this.eventService.eventId$(), status.value).subscribe(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Cotización eliminada correctamente',
                life: 3000
            });
        });
    }

    private getEventDetail(id: string) {
        if (!id) {
            return;
        }

        return this.eventService.getTotalsByEventId(id).subscribe((totals: any) => {
            this.totalEvent = totals.data;
            this.totalEvent.status = this.totalEvent.status || 'inQuote';
            this.utility.set(this.totalEvent.totalRentalPrice - this.totalEvent.totalHourCost - this.totalEvent.totalBillValue);
        });
    }
}
