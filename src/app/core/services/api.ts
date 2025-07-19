import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private baseUrl = environment.festanabApi;

    constructor(private http: HttpClient) {}

    get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params }).pipe(catchError(this.handleError));
    }

    post<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, { headers }).pipe(catchError(this.handleError));
    }

    delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { headers }).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        console.error('API error:', error);
        return throwError(() => error);
    }
}
