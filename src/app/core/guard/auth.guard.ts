import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const AuthGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.restoreSession();

    const token = authService.accessToken();

    if (token) {
        return true;
    }

    router.navigate(['/auth/login']);
    return false;
};
