import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.html'
})
export class Dashboard {}

/*  <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div> */
