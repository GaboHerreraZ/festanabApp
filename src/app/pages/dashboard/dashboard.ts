import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { Subject, takeUntil } from 'rxjs';
import { DashboardCards, DashboardChart } from '../../core/models/dashboard';
import { DashboardService } from './dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ChartModule, SelectModule, SkeletonModule],
    templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);

    private destroy$ = new Subject<void>();

    cards = signal<DashboardCards | null>(null);

    monthLabel = signal<string>('');

    monthlyEventsData = signal<any>(null);

    monthlyUtilityData = signal<any>(null);

    monthlyHoursData = signal<any>(null);

    loadingCards = signal<boolean>(false);

    loadingMonthlyEvents = signal<boolean>(false);

    loadingMonthlyUtility = signal<boolean>(false);

    loadingMonthlyHours = signal<boolean>(false);

    barOptions: any;

    mixedOptions: any;

    lineOptions: any;

    selectedYear!: number;

    selectedMonth!: number;

    yearOptions: { label: string; value: number }[] = [];

    monthOptions = [
        { label: 'Enero', value: 1 },
        { label: 'Febrero', value: 2 },
        { label: 'Marzo', value: 3 },
        { label: 'Abril', value: 4 },
        { label: 'Mayo', value: 5 },
        { label: 'Junio', value: 6 },
        { label: 'Julio', value: 7 },
        { label: 'Agosto', value: 8 },
        { label: 'Septiembre', value: 9 },
        { label: 'Octubre', value: 10 },
        { label: 'Noviembre', value: 11 },
        { label: 'Diciembre', value: 12 }
    ];

    ngOnInit(): void {
        const now = new Date();
        this.selectedYear = now.getFullYear();
        this.selectedMonth = now.getMonth() + 1;

        for (let y = this.selectedYear - 5; y <= this.selectedYear + 1; y++) {
            this.yearOptions.push({ label: `${y}`, value: y });
        }

        this.initChartOptions();
        this.loadDashboard();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadDashboard(): void {
        this.loadCards();
        this.loadMonthlyEvents();
        this.loadMonthlyUtility();
        this.loadMonthlyHours();
    }

    private loadCards(): void {
        this.loadingCards.set(true);
        this.dashboardService
            .getCards(this.selectedYear, this.selectedMonth)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.cards.set(response.data);
                    this.monthLabel.set(response.data.period.monthLabel);
                    this.loadingCards.set(false);
                },
                error: () => this.loadingCards.set(false)
            });
    }

    private loadMonthlyEvents(): void {
        this.loadingMonthlyEvents.set(true);
        this.dashboardService
            .getMonthlyEvents(this.selectedYear, this.selectedMonth)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.monthlyEventsData.set(this.toChartData(response.data));
                    this.loadingMonthlyEvents.set(false);
                },
                error: () => this.loadingMonthlyEvents.set(false)
            });
    }

    private loadMonthlyUtility(): void {
        this.loadingMonthlyUtility.set(true);
        this.dashboardService
            .getMonthlyUtility(this.selectedYear, this.selectedMonth)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.monthlyUtilityData.set(this.toChartData(response.data));
                    this.loadingMonthlyUtility.set(false);
                },
                error: () => this.loadingMonthlyUtility.set(false)
            });
    }

    private loadMonthlyHours(): void {
        this.loadingMonthlyHours.set(true);
        this.dashboardService
            .getMonthlyHours(this.selectedYear, this.selectedMonth)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const chart = response.data;
                    this.monthlyHoursData.set({
                        labels: chart.labels,
                        datasets: chart.datasets.map((d) => ({ ...d, fill: false, tension: 0.4 }))
                    });
                    this.loadingMonthlyHours.set(false);
                },
                error: () => this.loadingMonthlyHours.set(false)
            });
    }

    private toChartData(chart: DashboardChart): any {
        return { labels: chart.labels, datasets: chart.datasets };
    }

    private initChartOptions(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');
        const borderColor = documentStyle.getPropertyValue('--surface-border');

        const baseOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: {
                    ticks: { color: textMutedColor },
                    grid: { color: 'transparent', borderColor: 'transparent' }
                },
                y: {
                    ticks: { color: textMutedColor },
                    grid: { color: borderColor, borderColor: 'transparent', drawTicks: false }
                }
            }
        };

        this.barOptions = JSON.parse(JSON.stringify(baseOptions));
        this.mixedOptions = JSON.parse(JSON.stringify(baseOptions));
        this.lineOptions = JSON.parse(JSON.stringify(baseOptions));
    }
}
