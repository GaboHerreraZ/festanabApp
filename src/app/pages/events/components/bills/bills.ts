import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FooterValues, TableSettings } from '../../../../core/models/table-setting';
import { Bill } from '../../../../core/models/bill';
import { ActivatedRoute } from '@angular/router';
import { Table } from '../../../../shared/components/table/table';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { EventsService } from '../../events.service';

@Component({
    selector: 'app-bills',
    imports: [ButtonModule, FormsModule, Table, CheckboxModule, CommonModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule, DialogModule, ToastModule, InputNumberModule, ConfirmDialogModule, ToolbarModule],
    standalone: true,
    templateUrl: './bills.html',
    providers: [MessageService, ConfirmationService]
})
export class Bills implements OnInit {
    submitted: boolean = false;
    eventId = signal<string>('');

    billDialog: boolean = false;

    bills = signal<Bill[]>([]);
    bill = {
        date: new Date(),
        value: 0,
        conciliation: false
    } as Bill;

    footerValues: Signal<FooterValues> = computed(() => {
        const footer: FooterValues = {} as FooterValues;
        const total = this.bills().reduce((acc, bill) => acc + (bill.value || 0), 0);
        footer.size = '2';
        footer.values = [
            { id: 'total', value: total, pipe: 'price' },
            { id: 'empty1', value: 0, pipe: 'number' },
            { id: 'empty2', value: 0, pipe: 'number' },
            { id: 'empty3', value: 0, pipe: 'number' },
            { id: 'empty4', value: 0, pipe: 'number' },
            { id: 'empty5', value: 0, pipe: 'number' },
            { id: 'empty6', value: 0, pipe: 'number' }
        ];
        return footer;
    });

    paymentTypes = [
        {
            key: 'Efectivo',
            value: 'Efectivo'
        },
        {
            key: 'Transferencia',
            value: 'Transferencia'
        }
    ];

    billType = [
        {
            key: 'Administración',
            value: 'Administración'
        },
        {
            key: 'Transporte',
            value: 'Transporte'
        },
        {
            key: 'Alimentación',
            value: 'Alimentación'
        },
        {
            key: 'Imprevistos',
            value: 'Imprevistos'
        }
    ];

    paymentCompany = [
        {
            key: 'Bancolombia',
            value: 'Bancolombia'
        },
        {
            key: 'Nequi',
            value: 'Nequi'
        }
    ];

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'date', header: 'Fecha' },
            { field: 'name', header: 'Concepto' },
            { field: 'value', header: 'Valor' },
            { field: 'paymentType', header: 'Tipo de Pago' },
            { field: 'paymentCompany', header: 'Medio de Pago' },
            { field: 'observations', header: 'Observaciones' },
            { field: 'conciliation', header: 'Conciliación' },
            { field: 'billType', header: 'Tipo de Gasto' }
        ],
        globalFiltes: ['name', 'observations', 'paymentType', 'paymentCompany'],
        header: [
            {
                pipe: 'date',
                id: 'date',
                title: 'Fecha',
                size: '16rem'
            },
            {
                pipe: null,
                id: 'name',
                title: 'Concepto',
                size: '16rem'
            },
            {
                pipe: 'price',
                id: 'value',
                title: 'Valor',
                size: '10rem'
            },
            {
                pipe: null,
                id: 'paymentType',
                title: 'Tipo de Pago',
                size: '12rem'
            },
            {
                pipe: null,
                id: 'paymentCompany',
                title: 'Medio de Pago',
                size: '12rem'
            },
            {
                pipe: null,
                id: 'observations',
                title: 'Observaciones',
                size: '20rem'
            },
            {
                pipe: null,
                id: 'conciliation',
                title: 'Conciliación',
                size: '10rem',
                type: 'boolean'
            },
            {
                pipe: null,
                id: 'billType',
                title: 'Tipo de Gasto',
                size: '10rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (rowData: any) => this.openNew(rowData.item)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteItem(rowData.item)
            }
        ]
    };

    activeRoute = inject(ActivatedRoute);
    eventService = inject(EventsService);

    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    constructor() {
        effect(() => {
            this.getBills();
        });
    }

    ngOnInit(): void {
        this.loadDetail();
    }

    openNew(item: any) {
        this.billDialog = true;
        if (item) {
            this.bill = {
                ...item,
                date: new Date(item.date)
            } as Bill;
        }
    }

    deleteItem(item: Bill) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el gasto: ' + item.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService.deleteBill(item._id).subscribe({
                    next: (data: any) => {
                        const billDeleted = data.data;

                        this.bills.update((bills: Bill[]) => {
                            return bills.filter((bill) => bill._id !== billDeleted._id);
                        });

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Item eliminado correctamente',
                            life: 3000
                        });

                        this.eventService.eventId$.set('');
                        this.eventService.eventId$.set(this.eventId());
                    }
                });
            }
        });
    }

    hideDialog() {
        this.billDialog = false;
    }

    saveItem() {
        this.submitted = true;
        if (!this.bill.date || !this.bill.value || !this.bill.name || !this.bill.paymentType || (this.bill.paymentType === 'Transferencia' && !this.bill.paymentCompany) || this.bill.value === 0) {
            return;
        }

        this.bill = {
            ...this.bill,
            eventId: this.eventId()
        };

        this.eventService.addEditBill(this.bill).subscribe({
            next: (data: any) => {
                const bill = data.data;
                this.bills.update((bills: Bill[]) => {
                    const billServer = bills.find((b) => b._id === bill._id);
                    if (billServer) {
                        return bills.map((b) => (b._id === bill._id ? bill : b));
                    }

                    bills = [...bills, bill];

                    return bills;
                });

                this.billDialog = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Gasto guardado correctamente.',
                    life: 3000
                });

                this.bill = {
                    date: new Date(),
                    value: 0,
                    conciliation: false
                } as Bill;

                this.eventService.eventId$.set('');
                this.eventService.eventId$.set(this.eventId());
            }
        });
    }

    private loadDetail() {
        this.activeRoute.parent?.params.subscribe((params) => {
            this.eventId.set(params['id'] || '');
        });
    }

    private getBills() {
        this.eventService.getBills(this.eventId()).subscribe({
            next: (data: any) => {
                this.bills.set(data.data || []);
            }
        });
    }
}
