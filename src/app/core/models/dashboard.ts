export interface DashboardPeriod {
    year: number;
    month: number;
    monthLabel: string;
    start: string;
    end: string;
}

export interface DashboardCards {
    period: DashboardPeriod;
    totalEvents: number;
    eventsInQuote: number;
    eventsApproved: number;
    eventsCompleted: number;
    eventsPending: number;
    totalHoursWorked: number;
    totalHourCost: number;
    totalRevenue: number;
    totalCost: number;
    totalUtility: number;
}

export interface DashboardChartDataset {
    type?: string;
    label: string;
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
    tension?: number;
    data: number[];
}

export interface DashboardChart {
    labels: string[];
    datasets: DashboardChartDataset[];
}

export interface DashboardCardsResponse {
    data: DashboardCards;
}

export interface DashboardChartResponse {
    data: DashboardChart;
}
