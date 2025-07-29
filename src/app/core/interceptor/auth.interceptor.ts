import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { LoadingService } from '../../shared/services/loading.service';
import { finalize } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const loadingService = inject(LoadingService);
    const token = authService.accessToken();

    if (!token) return next(req);

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    loadingService.show();

    return next(authReq).pipe(finalize(() => loadingService.hide()));
};
