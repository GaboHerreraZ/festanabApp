import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { EventsService } from './events.service';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { Router } from '@angular/router';

@Component({
    selector: 'app-events',
    imports: [CommonModule, ButtonModule, InputTextModule, TableModule, ToolbarModule, IconFieldModule, InputIconModule, InputNumberModule, DialogModule, FormsModule, ToastModule, DatePickerModule, TextareaModule],
    standalone: true,
    templateUrl: './events.html',
    providers: [MessageService]
})
export class Events {
    submitted: boolean = false;

    event!: EventFesta;

    eventDialog: boolean = false;

    events = signal<EventFesta[]>([]);

    cols!: Column[];

    destroy$ = new Subject<void>();

    eventService = inject(EventsService);
    router = inject(Router);

    constructor(private service: MessageService) {}

    ngOnInit() {
        this.loadData();
        this.getAllEvent();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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

    saveEvent() {
        this.submitted = true;
        let _events = this.events();

        if (!this.event.name?.trim() || !this.event.description || !this.event.date || !this.event.owner || !this.event.phoneNumber) {
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
                this.event = {};
            }
        });
    }

    editEvent(event: EventFesta) {
        this.event = { ...event, date: new Date(event.date!), time: new Date(event.time!) };
        this.eventDialog = true;
    }

    goEventDetail(event: EventFesta) {
        this.router.navigate(['/pages/event-detail', event._id]);
    }

    private loadData() {
        this.cols = [
            { field: 'name', header: 'Nombre' },
            { field: 'description', header: 'Descripción' },
            { field: 'date', header: 'Fecha evento' },
            { field: 'owner', header: 'Cliente' },
            { field: 'phoneNumber', header: 'Movil' }
        ];
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
