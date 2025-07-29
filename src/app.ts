import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Loading } from './app/shared/components/loading/loading';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, Loading],
    template: `
        <app-loading />
        <router-outlet></router-outlet>
    `
})
export class App {}
