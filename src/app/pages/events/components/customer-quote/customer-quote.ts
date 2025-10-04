import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { Table } from '../../../../shared/components/table/table';
import { TableSettings } from '../../../../core/models/table-setting';
import { CustomerQuote as CustomerQuoteModel } from '../../../../core/models/customer-quote';
import { EventsService } from '../../events.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-customer-quote',
    templateUrl: './customer-quote.html',
    standalone: true,
    imports: [ButtonModule, CommonModule, Table, ToolbarModule, ConfirmDialogModule, ToastModule],
    providers: [MessageService, ConfirmationService]
})
export class CustomerQuote implements OnInit, OnDestroy {
    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'createdAt', header: 'Fecha Creación' },
            { field: 'totalRentalPrice', header: 'Costo Total' },
            { field: 'totalHourCost', header: 'Total Mano de Obra' },
            { field: 'totalBillValue', header: 'Total Gastos' },
            { field: 'utility', header: 'Utilidad' }
        ],
        globalFiltes: ['employee', 'cc'],
        header: [
            {
                pipe: 'date',
                id: 'createdAt',
                title: 'Fecha Creación',
                size: '16rem'
            },
            {
                pipe: 'price',
                id: 'totalRentalPrice',
                title: 'Costo Total',
                size: '12rem'
            },
            {
                pipe: 'price',
                id: 'totalHourCost',
                title: 'Total Mano de Obra',
                size: '14rem'
            },
            {
                pipe: 'price',
                id: 'totalBillValue',
                title: 'Total Gastos',
                size: '14rem'
            },
            {
                pipe: 'price',
                id: 'utility',
                title: 'Utilidad',
                size: '14rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-eye',
                action: (rowData: any) => this.viewQuote(rowData.item)
            },
            {
                id: 'copy',
                icon: 'pi pi-copy',
                action: (rowData: any) => this.copyUrlQuote(rowData.item)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteQuote(rowData.item)
            }
        ]
    };

    activeRoute = inject(ActivatedRoute);
    eventService = inject(EventsService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    destroy$ = new Subject<void>();

    eventId = signal<string>('');
    quotes = signal<CustomerQuoteModel[]>([]);

    constructor(
        private clipboard: Clipboard,
        private router: Router
    ) {
        effect(() => {
            const id = this.eventId();
            if (id) {
                this.getAllCustomerQuotes(id);
            }
        });
    }

    ngOnInit(): void {
        this.getEventId();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    newQuote() {
        this.eventService
            .newCustomerQuote(this.eventId())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.quotes.update((quotes) => [res.data, ...quotes]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'OK',
                        detail: 'Cotización creada',
                        life: 3000
                    });
                },
                error: (err) => {
                    console.error(err);
                }
            });
    }

    private getEventId() {
        this.activeRoute.parent?.params.subscribe((params) => {
            this.eventId.set(params['id'] || '');
        });
    }

    private copyUrlQuote(quote: any) {
        const url = `${window.location.origin}/customer-quotation/${quote._id}`;
        this.clipboard.copy(url);
        this.messageService.add({
            severity: 'success',
            summary: 'OK',
            detail: 'URL copiada al portapapeles',
            life: 3000
        });
    }

    private viewQuote(quote: any) {
        const url = this.router.serializeUrl(this.router.createUrlTree([`/customer-quotation`, quote._id]));
        window.open(url, '_blank');
    }

    private getAllCustomerQuotes(eventId: string) {
        this.eventService
            .getAllCustomerQuotes(eventId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.quotes.set(res.data);
                },
                error: (err) => {
                    console.error(err);
                }
            });
    }

    private deleteQuote(item: CustomerQuoteModel) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar la cotización? ',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService
                    .deleteCustomerQuote(item._id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (data: any) => {
                            const quoteDelete = data.data;

                            this.quotes.update((quotes: CustomerQuoteModel[]) => {
                                return quotes.filter((quote) => quote._id !== quoteDelete._id);
                            });

                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Cotización eliminada correctamente',
                                life: 3000
                            });
                        }
                    });
            }
        });
    }
}
