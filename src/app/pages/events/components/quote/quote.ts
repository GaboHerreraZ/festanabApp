import { Component, computed, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../settings/settings.service';
import { Module } from '../../../../core/models/module';
import { map, Subject, takeUntil } from 'rxjs';
import { EventsService } from '../../events.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EventDetail, Item, Section } from '../../../../core/models/event-detail.model';
import { ToastModule } from 'primeng/toast';
import { Table } from '../../../../shared/components/table/table';
import { FooterValues, TableSettings } from '../../../../core/models/table-setting';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { InventoryService } from '../../../inventory/inventory.service';
import { Product } from '../../../../core/models/product';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    selector: 'app-quote',
    imports: [CommonModule, Table, FormsModule, ButtonModule, ConfirmDialogModule, RadioButtonModule, ToolbarModule, DialogModule, SelectModule, SelectButtonModule, ToastModule, AutoCompleteModule, InputNumberModule],
    standalone: true,
    templateUrl: './quote.html',
    providers: [MessageService, ConfirmationService]
})
export class Quote implements OnInit {
    submitted: boolean = false;
    sections = signal<Module[]>([]);
    clientSections: Signal<Section[]> = computed(() => this.eventDetail().section.filter((s) => s.type === 'client'));
    adminSections: Signal<Section[]> = computed(() => this.eventDetail().section.filter((s) => s.type === 'admin'));

    inventory = signal<Product[]>([]);
    inventorySearch: Product[] = [];

    selectedSection!: Module;
    settingService = inject(SettingService);
    eventService = inject(EventsService);
    inventoryService = inject(InventoryService);
    activeRoute = inject(ActivatedRoute);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    destroy$ = new Subject<void>();

    eventDetail = signal<EventDetail>({
        _id: '',
        eventId: '',
        section: []
    } as EventDetail);

    eventId = signal<string>('');

    currentSectionId!: string;

    itemDialog: boolean = false;
    isItemDialogAdmin: boolean = false;
    ownerList = [
        { key: 'Propio', value: 'Propio' },
        { key: 'Tercero', value: 'Tercero' }
    ];

    item: Item = {
        _id: '',
        description: '',
        rentalPrice: 0,
        costPrice: 0,
        owner: 'Propio'
    };

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'description', header: 'Descripción' },
            { field: 'rentalPrice', header: 'Valor Alquiler' },
            { field: 'costPrice', header: 'Valor Costo' },
            { field: 'owner', header: 'Propietario' }
        ],
        globalFiltes: ['name', 'description'],
        header: [
            {
                pipe: null,
                id: 'description',
                title: 'Descripción',
                size: '16rem'
            },
            {
                pipe: 'price',
                id: 'rentalPrice',
                title: 'Valor Alquiler',
                size: '10rem'
            },
            {
                pipe: 'price',
                id: 'costPrice',
                title: 'Valor Costo',
                size: '10rem'
            },
            {
                pipe: null,
                id: 'owner',
                title: 'Propietario',
                size: '10rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (rowData: any) => this.openNew(rowData.sectionId, rowData.item)
            },
            {
                id: 'delete',
                icon: 'pi pi-trash',
                action: (rowData: any) => this.deleteItem(rowData.sectionId, rowData.item)
            }
        ]
    };

    tableAdminSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'description', header: 'Descripción' },
            { field: 'rentalPrice', header: 'Valor' }
        ],
        globalFiltes: ['name', 'description'],
        header: [
            {
                pipe: null,
                id: 'description',
                title: 'Descripción',
                size: '16rem'
            },
            {
                pipe: 'price',
                id: 'rentalPrice',
                title: 'Valor',
                size: '10rem'
            }
        ],
        actions: [
            {
                id: 'edit',
                icon: 'pi pi-pencil',
                action: (rowData: any) => this.openNew(rowData.sectionId, rowData.item, true)
            }
        ]
    };

    constructor() {
        effect(() => {
            const eventId = this.eventId();
            this.getEventId(eventId);
        });
    }

    ngOnInit(): void {
        this.getModules();
        this.loadDetail();
        this.getAllInventory();
    }

    deleteItem(_: string, item: any) {
        this.currentSectionId = _;
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar el item: ' + item.description + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.eventService.deleteItem(this.eventId(), this.currentSectionId, item._id).subscribe({
                    next: (data: any) => {
                        this.eventDetail.update((event: EventDetail) => {
                            const section = event.section.find((s) => s._id === this.currentSectionId);
                            if (section) {
                                const items = section.items.filter((i) => i._id !== data.data);
                                return {
                                    ...event,
                                    section: [...event.section.map((s) => (s._id === this.currentSectionId ? { ...s, items, footer: this.getFooterValues(items) } : s))]
                                };
                            }
                            return event;
                        });
                    }
                });

                this.eventService.eventId$.set('');
                this.eventService.eventId$.set(this.eventId());

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Item eliminado correctamente',
                    life: 3000
                });
            }
        });
    }

    saveItem() {
        this.submitted = true;
        if (!this.item.description || !this.item.rentalPrice || !this.item.owner) {
            return;
        }
        this.itemDialog = false;

        this.eventService.saveItemSection(this.eventId(), this.currentSectionId, this.item).subscribe({
            next: (data: any) => {
                this.item = {
                    owner: 'Propio'
                } as Item;

                this.eventDetail.update((event: EventDetail) => {
                    let section = event.section.find((s) => s._id === this.currentSectionId);
                    if (section) {
                        const itemToAdd = section.items.find((i) => i._id === data.data._id);
                        if (itemToAdd) {
                            const items = section.items.map((i) => (i._id === itemToAdd._id ? data.data : i));
                            section = {
                                ...section,
                                items,
                                footer: this.getFooterValues(items)
                            };
                        } else {
                            section = {
                                ...section,
                                footer: this.getFooterValues([...section.items, data.data]),
                                items: [...section.items, data.data]
                            };
                        }
                    }

                    return { ...event, section: [...event.section.map((s) => (s._id !== this.currentSectionId ? s : section!))] };
                });

                this.eventService.eventId$.set('');
                this.eventService.eventId$.set(this.eventId());

                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Se ha guardado el item correctamente.', life: 3000 });
            }
        });
    }

    saveSection() {
        this.eventService.saveSection(this.eventId(), this.selectedSection.module!).subscribe({
            next: (data: any) => {
                this.eventDetail.update((event: EventDetail) => {
                    const newSection = {
                        _id: data.data._id,
                        name: data.data.name,
                        type: data.data.type,
                        items: []
                    };
                    return {
                        ...event,
                        section: [...event.section, newSection]
                    };
                });

                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Se ha guardado la sección correctamente.',
                    life: 3000
                });
            }
        });
    }

    openNew(sectionId: string, item: any, isAdmin = false) {
        this.currentSectionId = sectionId;
        this.isItemDialogAdmin = isAdmin;
        this.itemDialog = true;
        if (item) {
            this.item = item;
        }
    }

    hideDialog() {
        this.itemDialog = false;
        this.item = {} as Item;
    }

    search(event: AutoCompleteCompleteEvent) {
        this.inventorySearch = this.inventory().filter((item) => item.name?.includes(event.query));
    }

    private getEventId(eventId: string) {
        this.eventService
            .getEventById(eventId)
            .pipe(
                map((data: any) => {
                    const event: EventDetail = data.data;
                    event.section = event.section.map((section: Section) => {
                        return {
                            ...section,
                            footer: this.getFooterValues(section.items)
                        };
                    });
                    return event;
                })
            )
            .subscribe({
                next: (data: EventDetail) => {
                    this.eventDetail.set(data);
                }
            });
    }

    private getModules() {
        this.settingService
            .getAllModule()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    this.sections.set(data.data);
                }
            });
    }

    private loadDetail() {
        this.activeRoute.parent?.params.subscribe((params) => {
            this.eventId.set(params['id'] || '');
        });
    }

    private getAllInventory() {
        this.inventoryService.getAllInventory().subscribe({
            next: (data: any) => {
                this.inventory.set(data.data);
            }
        });
    }

    private getFooterValues(items: Item[]) {
        const footer: FooterValues = {} as FooterValues;
        const totalRentalPrice = items.reduce((acc, item) => acc + item.rentalPrice, 0);
        const totalCostPrice = items.reduce((acc, item) => acc + item.costPrice, 0);
        footer.size = '1';
        footer.values = [
            { id: 'rentalPrice', value: totalRentalPrice, pipe: 'price' },
            { id: 'costPrice', value: totalCostPrice, pipe: 'price' },
            { id: 'empty1', value: 0, pipe: 'number' },
            { id: 'empty2', value: 0, pipe: 'number' }
        ];
        return footer;
    }
}
