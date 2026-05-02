import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api';
import { DashboardCardsResponse, DashboardChartResponse } from '../../core/models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    readonly PATH = 'event/dashboard';

    private apiService = inject(ApiService);

    getCards(year: number, month: number): Observable<DashboardCardsResponse> {
        return this.apiService.get<DashboardCardsResponse>(`${this.PATH}/cards`, { year, month }, true);
    }

    getMonthlyEvents(year: number, month: number): Observable<DashboardChartResponse> {
        return this.apiService.get<DashboardChartResponse>(`${this.PATH}/monthly-events`, { year, month }, true);
    }

    getMonthlyUtility(year: number, month: number): Observable<DashboardChartResponse> {
        return this.apiService.get<DashboardChartResponse>(`${this.PATH}/monthly-utility`, { year, month }, true);
    }

    getMonthlyHours(year: number, month: number): Observable<DashboardChartResponse> {
        return this.apiService.get<DashboardChartResponse>(`${this.PATH}/monthly-hours`, { year, month }, true);
    }
}
