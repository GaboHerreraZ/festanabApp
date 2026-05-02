import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { LoadingService } from '../../shared/services/loading.service';
import { catchError, finalize, from, of, switchMap } from 'rxjs';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const loadingService = inject(LoadingService);
    const skipLoading = req.context.get(SKIP_LOADING);

    if (!skipLoading) loadingService.show();

    return from(authService.sessionReady).pipe(
        switchMap(() => {
            const token = authService.accessToken();
            const authReq = token
                ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
                : req;

            return next(authReq);
        }),
        catchError((error) => {
            if (!skipLoading) loadingService.hide();
            return of(error);
        }),
        finalize(() => {
            if (!skipLoading) loadingService.hide();
        })
    );
};
