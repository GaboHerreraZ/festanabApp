import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Event } from '../../core/models/event';
import { Item } from '../../core/models/event-detail.model';
import { Bill } from '../../core/models/bill';
import { IHour } from '../../core/models/hour';
import { CustomerQuote } from '../../core/models/customer-quote';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    readonly PATH = 'event';

    public eventId$ = signal<string>('');

    apiService = inject(ApiService);

    getAllEvents() {
        return this.apiService.get<Event[]>(`${this.PATH}/get-events`);
    }

    getEvent(id: string) {
        return this.apiService.get<Event[]>(`${this.PATH}/get-event-by-id/${id}`);
    }

    addEditEvents(event: Event) {
        return this.apiService.post<Event>(`${this.PATH}/add-edit-event`, {
            _id: event._id || undefined,
            description: event.description,
            date: event.date,
            owner: event.owner,
            nit: event.nit,
            location: event.location,
            time: event.time,
            customerId: event.customerId
        });
    }

    getEventById(eventId: string) {
        return this.apiService.get(`${this.PATH}/event-detail/${eventId}`);
    }

    updateEventStatusById(eventId: string, status: string) {
        return this.apiService.post(`${this.PATH}/event-detail/update-status`, { _id: eventId, status });
    }

    saveSection(eventId: string, section: string) {
        return this.apiService.post(`${this.PATH}/event-detail/${eventId}/section`, { name: section });
    }

    saveItemSection(eventId: string, sectionId: string, item: Item) {
        return this.apiService.post(`${this.PATH}/event-detail/${eventId}/section/${sectionId}/item`, { ...item });
    }

    deleteItem(eventId: string, sectionId: string, itemId: string) {
        return this.apiService.delete(`${this.PATH}/event-detail/${eventId}/section/${sectionId}/item/${itemId}`);
    }

    getBills(eventId: string) {
        return this.apiService.get(`${this.PATH}/get-bills/${eventId}`);
    }

    addEditBill(bill: Bill) {
        return this.apiService.post(`${this.PATH}/add-edit-bill`, bill);
    }

    deleteBill(billId: string) {
        return this.apiService.delete(`${this.PATH}/delete-bill/${billId}`);
    }

    getHoursByEventId(eventId: string) {
        return this.apiService.get(`${this.PATH}/get-hours-by-event-id/${eventId}`);
    }

    addNewHour(hour: IHour) {
        return this.apiService.post(`${this.PATH}/add-hour`, hour);
    }

    editHour(hour: IHour) {
        return this.apiService.post(`${this.PATH}/edit-hour`, hour);
    }

    getTotalsByEventId(eventId: string) {
        return this.apiService.get(`${this.PATH}/get-totals-by-event/${eventId}`);
    }

    deleteHour(hourId: string) {
        return this.apiService.delete(`${this.PATH}/delete-hour/${hourId}`);
    }

    editSectionDescription(eventId: string, sectionId: string, description: string) {
        return this.apiService.post(`${this.PATH}/edit-section`, { eventId, sectionId, description });
    }

    updateAiuSection(sectionId: string, items: any[]) {
        return this.apiService.post(`${this.PATH}/update-aiu-section`, { sectionId, items });
    }

    deleteSection(eventId: string, sectionId: string) {
        return this.apiService.delete(`${this.PATH}/delete-section/${eventId}/${sectionId}`);
    }

    cloneEvent(eventId: string) {
        return this.apiService.get(`${this.PATH}/clone-event/${eventId}`);
    }

    newCustomerQuote(eventId: string): Observable<CustomerQuote> {
        return this.apiService.post<CustomerQuote>(`${this.PATH}/customer-quote/`, { eventId });
    }

    getAllCustomerQuotes(eventId: string): Observable<CustomerQuote[]> {
        return this.apiService.get<CustomerQuote[]>(`${this.PATH}/customer-quotes/${eventId}`);
    }

    deleteCustomerQuote(quoteId: string) {
        return this.apiService.delete(`${this.PATH}/delete-customer-quote/${quoteId}`);
    }

    getCustomerQuote(quoteId: string) {
        return this.apiService.get(`${this.PATH}/get-customer-quote/${quoteId}`);
    }
}
