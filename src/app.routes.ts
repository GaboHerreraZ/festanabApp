import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/core/guard/auth.guard';
import { CustomerQuotation } from './app/pages/customer-quotation/customer-quotation';
import { EmployeeBilling } from './app/pages/employee-billing/employee-billing';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            {
                path: 'pages',
                canActivate: [AuthGuard],
                loadChildren: () => import('./app/pages/pages.routes')
            }
        ]
    },
    { path: 'customer-quotation/:id', component: CustomerQuotation },
    {
        path: 'employee-billing/:eventId/:employeeId',
        component: EmployeeBilling
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
