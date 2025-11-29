import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Table as TablePrime, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Event as EventFesta } from '../../core/models/event';
import { BehaviorSubject, catchError, debounceTime, distinctUntilChanged, map, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { EventsService } from './events.service';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { Router } from '@angular/router';
import { ICustomer } from '../../core/models/customer';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomerService } from '../customer/customer.service';
import { TagModule } from 'primeng/tag';
import { Table } from '../../shared/components/table/table';
import { TableSettings } from '../../core/models/table-setting';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-events',
    imports: [
        CommonModule,
        Table,
        ButtonModule,
        InputTextModule,
        TagModule,
        AutoCompleteModule,
        TableModule,
        ToolbarModule,
        IconFieldModule,
        InputIconModule,
        InputNumberModule,
        DialogModule,
        FormsModule,
        ToastModule,
        DatePickerModule,
        TextareaModule,
        ReactiveFormsModule,
        SelectModule
    ],
    standalone: true,
    templateUrl: './events.html',
    providers: [MessageService]
})
export class Events {
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

    customerService = inject(CustomerService);

    service = inject(MessageService);

    destroy$ = new Subject<void>();

    refresh$ = new BehaviorSubject<string>('inQuote');

    private searchTerm$ = new Subject<string>();

    suggestions$ = this.searchTerm$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.fetchSuggestions(term))
    );

    suggestionsSignal = toSignal(this.suggestions$, { initialValue: [] });

    events$ = this.refresh$.pipe(
        switchMap((status: string) =>
            this.eventService.getAllEvents(status).pipe(
                takeUntil(this.destroy$),
                map((res: any) => res.data),
                map((res: any) =>
                    res.map((event: any) => {
                        const statusLabel = this.statusLabels[event.status] || 'En Cotización';
                        return { ...event, statusLabel };
                    })
                ),
                catchError((e) => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar las cotizaciones.' });
                    return of([]);
                })
            )
        )
    );

    events = toSignal(this.events$, { initialValue: [] });

    statusLabels: { [key: string]: string } = {
        pending: 'Por Liquidar',
        completed: 'Finalizado',
        inQuote: 'En Cotización'
    };

    form!: FormGroup;

    eventDialog: boolean = false;

    customerSearch: ICustomer[] = [];

    router = inject(Router);

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'status', header: 'Estado' },
            { field: 'name', header: 'Nombre' },
            { field: 'nit', header: 'Cédula / Nit' },
            { field: 'description', header: 'Tipo de Evento' },
            { field: 'location', header: 'Ubicación' },
            { field: 'date', header: 'Fecha Evento' },
            { field: 'time', header: 'Hora Evento' }
        ],
        globalFiltes: ['name', 'nit'],
        header: [
            {
                pipe: null,
                id: 'status',
                title: 'Estado',
                size: '10rem',
                type: 'tag'
            },
            {
                pipe: null,
                id: 'owner',
                title: 'Nombre',
                size: '16rem'
            },
            {
                pipe: null,
                id: 'nit',
                title: 'Cédula / Nit',
                size: '10rem'
            },
            {
                pipe: null,
                id: 'description',
                title: 'Tipo de Evento',
                size: '16rem'
            },
            {
                pipe: null,
                id: 'location',
                title: 'Ubicación',
                size: '16rem'
            },
            {
                pipe: 'date',
                id: 'date',
                title: 'Fecha Evento',
                size: '16rem'
            },
            {
                pipe: 'time',
                id: 'time',
                title: 'Hora Evento',
                size: '10rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (row: any) => this.editEvent(row.item)
            },
            {
                id: 'delete',
                icon: 'pi pi-pen-to-square',
                action: (rowData: any) => this.goEventDetail(rowData.item)
            },
            {
                id: 'delete',
                icon: 'pi pi-clone',
                action: (rowData: any) => this.clone(rowData.item)
            }
        ],
        events: {
            getSeverity: (rowData: any) => (rowData && this.getSeverity(rowData)) || 'info',
            getSeverityLabel: (rowData: any) => this.statusLabels[rowData] || 'En Cotización'
        }
    };

    constructor(private fb: FormBuilder) {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onFilterEvents(event: any) {
        console.log(event);
        this.refresh$.next(event.value);
    }

    onSelectCustomer(customer: AutoCompleteSelectEvent) {
        const { _id, name, nit } = customer.value;
        this.form.patchValue({
            customerId: _id,
            owner: name,
            nit: nit
        });
    }

    search(event: AutoCompleteCompleteEvent) {
        this.searchTerm$.next(event.query);
    }

    openNew() {
        this.eventDialog = true;
    }

    onGlobalFilter(table: TablePrime, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.eventDialog = false;
    }

    clone(event: EventFesta) {
        this.eventService
            .cloneEvent(event._id!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    const { data } = response;
                    this.goEventDetail(data);
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo clonar el evento.' });
                }
            });
    }

    saveEvent() {
        const event = this.form.getRawValue();

        this.eventService
            .addEditEvents(event)
            .pipe(
                takeUntil(this.destroy$),
                map((res: any) => res.data)
            )
            .subscribe({
                next: (data) => {
                    this.service.add({ severity: 'success', summary: 'Successful', detail: 'Evento guardado correctamente.', life: 3000 });
                    this.goEventDetail(data);
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el evento.' });
                },
                complete: () => {
                    this.eventDialog = false;
                }
            });
    }

    editEvent(event: EventFesta) {
        console.log('s', event);
        this.eventDialog = true;
        this.form.patchValue({ ...event, date: new Date(event.date!), time: event.time ? new Date(event.time) : undefined });
    }

    goEventDetail(event: EventFesta) {
        this.router.navigate(['/pages/event-detail', event._id]);
    }

    private loadData() {
        this.form = this.fb.group({
            _id: [null],
            owner: ['', Validators.required],
            nit: [{ value: '', disabled: true }, Validators.required],
            description: [''],
            location: [''],
            date: [null],
            time: [null],
            customerId: [null],
            status: ['inQuote']
        });
    }

    private fetchSuggestions(term: string) {
        if (!term || term.length < 3) {
            return of([]);
        }

        return this.customerService.getCustomerByName(term).pipe(map((data: any) => data.data));
    }

    getSeverity(status: string) {
        switch (status) {
            case 'pending':
                return 'danger';

            case 'completed':
                return 'success';

            case 'inQuote':
                return 'info';
        }

        return 'info';
    }
}
