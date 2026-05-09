import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Table as TablePrime, TableModule } from 'primeng/table';
import { FooterValues, TableSettings } from '../../../core/models/table-setting';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-table',
    templateUrl: './table.html',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, RadioButtonModule, FormsModule, IconFieldModule, InputIconModule, InputTextModule, CheckboxModule, TooltipModule]
})
export class Table {
    @Input() data: any[] = [];

    @Input() parentId!: string;

    @Input() title!: string;

    @Input() tableSettings!: TableSettings;

    @Input() footerValues?: FooterValues;

    @Input() hideActions: boolean = false;

    @Output() search = new EventEmitter<string>();

    onGlobalFilter(table: TablePrime, event: Event) {
        const value = (event.target as HTMLInputElement).value;

        if (this.search.observed) {
            this.search.emit(value);
            return;
        }

        table.filterGlobal(value, 'contains');
    }

    getSeverity(rowData: any): string {
        if (this.tableSettings.events?.getSeverity) {
            return this.tableSettings.events.getSeverity(rowData);
        }
        return '';
    }

    getSeverityLabel(rowData: any): string {
        if (this.tableSettings.events?.getSeverityLabel) {
            return this.tableSettings.events.getSeverityLabel(rowData);
        }
        return '';
    }
}
