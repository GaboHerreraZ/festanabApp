import { Routes } from '@angular/router';
import { Inventory } from './inventory/inventory';
import { Employee } from './employee/employee';
import { Settings } from './settings/settings';
import { Events } from './events/events';
import { EventDetail } from './events/components/event-detail/event-detail';
import { Quote } from './events/components/quote/quote';
import { Bills } from './events/components/bills/bills';
import { Labour } from './events/components/labour/labour';
import { Customer } from './customer/customer';
import { CustomerQuote } from './events/components/customer-quote/customer-quote';

export default [
    { path: 'inventory', component: Inventory },
    { path: 'employees', component: Employee },
    { path: 'customers', component: Customer },
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
            },
            {
                path: 'customer-quote',
                component: CustomerQuote
            }
        ]
    },

    { path: '**', redirectTo: '/notfound' }
] as Routes;
