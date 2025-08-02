import { Component, computed } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule, ImageModule, ProgressBarModule],
    template: `
        <div *ngIf="isLoading()" class="fixed top-0  left-0 right-0 z-[1200] bg-black bg-opacity-50 h-screen  flex flex-col  items-center justify-center">
            <p-image src="assets/images/festanab.png" alt="Festanab" width="250" />
            <p-progressbar mode="indeterminate" class="mt-4" [style]="{ height: '6px', width: '250px' }" />
        </div>
    `
})
export class Loading {
    isLoading = computed(() => this.loadingService.isLoading());

    constructor(private loadingService: LoadingService) {}
}
