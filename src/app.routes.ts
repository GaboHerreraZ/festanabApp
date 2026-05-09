import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/core/guard/auth.guard';
import { CustomerQuotation } from './app/pages/customer-quotation/customer-quotation';
import { EmployeeBilling } from './app/pages/employee-billing/employee-billing';
import { EmployeeHoursRecord } from './app/pages/employee-hours-record/employee-hours-record';
import { Debug } from './app/pages/debug/debug';
import { HoursCalculator } from './app/pages/debug/hours-calculator/hours-calculator';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard, canActivate: [AuthGuard] },
            {
                path: 'pages',
                canActivate: [AuthGuard],
                loadChildren: () => import('./app/pages/pages.routes')
            }
        ]
    },
    { path: 'customer-quotation/:id', component: CustomerQuotation },
    { path: 'employee-hours-record', component: EmployeeHoursRecord },
    {
        path: 'debug',
        component: Debug,
        children: [
            { path: '', redirectTo: 'hours-calculator', pathMatch: 'full' },
            { path: 'hours-calculator', component: HoursCalculator }
        ]
    },
    {
        path: 'employee-billing/:eventId/:employeeId',
        component: EmployeeBilling
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
