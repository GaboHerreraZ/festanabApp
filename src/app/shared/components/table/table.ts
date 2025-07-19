import { Component, Input } from '@angular/core';
import { Table as TablePrime, TableModule } from 'primeng/table';
import { FooterValues, TableSettings } from '../../../core/models/table-setting';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-table',
    templateUrl: './table.html',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, FormsModule, IconFieldModule, InputIconModule, InputTextModule, CheckboxModule]
})
export class Table {
    @Input() data: any[] = [];
    @Input() parentId!: string;

    @Input() title!: string;

    @Input() tableSettings!: TableSettings;

    @Input() footerValues?: FooterValues;

    onGlobalFilter(table: TablePrime, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
