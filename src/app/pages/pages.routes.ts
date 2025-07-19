import { Routes } from '@angular/router';
import { Crud } from './crud/crud';
import { Inventory } from './inventory/inventory';
import { Employee } from './employee/employee';
import { Settings } from './settings/settings';
import { Events } from './events/events';
import { EventDetail } from './events/components/event-detail/event-detail';
import { Quote } from './events/components/quote/quote';
import { Bills } from './events/components/bills/bills';
import { Labour } from './events/components/labour/labour';

export default [
    { path: 'crud', component: Crud },
    { path: 'inventory', component: Inventory },
    { path: 'employees', component: Employee },
    { path: 'settings', component: Settings },
    {
        path: 'events',
        component: Events
    },
    {
        path: 'event-detail/:id',
        component: EventDetail,
        children: [
            {
                path: 'quote',
                component: Quote
            },
            {
                path: 'bills',
                component: Bills
            },
            {
                path: 'labour',
                component: Labour
            }
        ]
    },

    { path: '**', redirectTo: '/notfound' }
] as Routes;
