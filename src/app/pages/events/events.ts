import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Event as EventFesta } from '../../core/models/event';
import { Column } from '../../core/models/column';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { EventsService } from './events.service';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { Router } from '@angular/router';
import { Customer } from '../../core/models/customer';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomerService } from '../customer/customer.service';

@Component({
    selector: 'app-events',
    imports: [CommonModule, ButtonModule, InputTextModule, AutoCompleteModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule, DatePickerModule, TextareaModule],
    standalone: true,
    templateUrl: './events.html',
    providers: [MessageService]
})
export class Events {
    submitted: boolean = false;

    event!: EventFesta;

    eventDialog: boolean = false;

    events = signal<EventFesta[]>([]);
    customerSearch: Customer[] = [];
    customers = signal<Customer[]>([]);

    cols!: Column[];

    private searchTerm$ = new Subject<string>();

    destroy$ = new Subject<void>();

    eventService = inject(EventsService);
    customerService = inject(CustomerService);

    router = inject(Router);

    constructor(private service: MessageService) {
        const suggestions$ = this.searchTerm$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => this.fetchSuggestions(term))
        );

        const suggestionsSignal = toSignal(suggestions$, { initialValue: [] });
        effect(() => {
            this.customers.set(suggestionsSignal());
        });
    }

    ngOnInit() {
        this.loadData();
        this.getAllEvent();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSelectCustomer(customer: AutoCompleteSelectEvent) {
        this.event.customerId = customer.value._id;
        this.event.owner = customer.value.name;
        this.event.nit = customer.value.nit;
    }

    search(event: AutoCompleteCompleteEvent) {
        this.event.owner = event.query;
        this.searchTerm$.next(event.query);
    }

    openNew() {
        this.event = {};
        this.submitted = false;
        this.eventDialog = true;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.eventDialog = false;
        this.submitted = false;
    }

    clone(event: EventFesta) {
        this.eventService.cloneEvent(event._id!).subscribe({
            next: (response: any) => {
                const { data } = response;
                this.router.navigate(['/pages/event-detail', data.eventId]);
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo clonar el evento.' });
            }
        });
    }

    saveEvent() {
        this.submitted = true;
        let _events = this.events();

        if (!this.event.description || !this.event.owner || !this.event.date) {
            return;
        }

        this.eventService.addEditEvents(this.event).subscribe({
            next: (data: any) => {
                this.service.add({ severity: 'success', summary: 'Successful', detail: 'Evento guardado correctamente.', life: 3000 });

                const exist = _events.some((item) => item._id === data.data._id);
                if (exist) {
                    _events = _events.map((item) => (item._id === data.data._id ? data.data : item));
                } else {
                    _events.push(data.data);
                }

                this.events.set([..._events]);
            },
            error: () => {
                this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el evento.' });
            },
            complete: () => {
                this.eventDialog = false;
                this.submitted = false;
                this.event = {};
            }
        });
    }

    editEvent(event: EventFesta) {
        this.event = { ...event, date: new Date(event.date!), time: event.time ? new Date(event.time) : undefined };
        this.eventDialog = true;
    }

    goEventDetail(event: EventFesta) {
        this.router.navigate(['/pages/event-detail', event._id]);
    }

    private loadData() {
        this.cols = [
            { field: 'owner', header: 'Cliente' },
            { field: 'nit', header: 'Cédula/Nit' },
            { field: 'description', header: 'Tipo de Evento' },
            { field: 'location', header: 'Locación' },
            { field: 'date', header: 'Fecha' },
            { field: 'time', header: 'Hora' }
        ];
    }

    private fetchSuggestions(term: string) {
        if (!term || term.length < 2) {
            return of([]);
        }

        return this.customerService.getCustomerByName(term).pipe(map((data: any) => data.data));
    }

    private getAllEvent() {
        this.eventService
            .getAllEvents()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    this.events.set(data.data);
                },
                error: () => {
                    this.service.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar las cotizaciones.' });
                }
            });
    }
}
