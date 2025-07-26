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
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { EventsService } from '../../events.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EventDetail, Item, Section } from '../../../../core/models/event-detail.model';
import { ToastModule } from 'primeng/toast';
import { Table } from '../../../../shared/components/table/table';
import { FooterValues, TableSettings } from '../../../../core/models/table-setting';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent, AutoCompleteUnselectEvent } from 'primeng/autocomplete';
import { InventoryService } from '../../../inventory/inventory.service';
import { Product } from '../../../../core/models/product';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-quote',
    imports: [CommonModule, Table, FormsModule, ButtonModule, ConfirmDialogModule, TextareaModule, RadioButtonModule, ToolbarModule, DialogModule, SelectModule, SelectButtonModule, ToastModule, AutoCompleteModule, InputNumberModule, InputTextModule],
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
    itemSelected!: Product;

    private searchTerm$ = new Subject<string>();

    eventDetail = signal<EventDetail>({
        _id: '',
        eventId: '',
        description: '',
        section: []
    } as EventDetail);

    eventId = signal<string>('');

    currentSectionId!: string;

    itemDialog: boolean = false;

    isUtilityItem = false;
    isItemDialogAdmin: boolean = false;
    ownerList = [
        { key: 'Propio', value: 'Propio' },
        { key: 'Tercero', value: 'Tercero' }
    ];

    item: Item = {
        _id: '',
        name: '',
        quantity: 1,
        rentalPrice: 0,
        costPrice: 0,
        owner: 'Propio'
    };

    tableSettings: TableSettings = {
        includesTotal: true,
        columns: [
            { field: 'name', header: 'Nombre' },
            { field: 'quantity', header: 'Cantidad' },
            { field: 'rentalPrice', header: 'Valor Alquiler' },
            { field: 'costPrice', header: 'Valor Costo' },
            { field: 'owner', header: 'Propietario' }
        ],
        globalFiltes: ['name', 'description'],
        header: [
            {
                pipe: null,
                id: 'name',
                title: 'Nombre',
                size: '16rem'
            },
            {
                pipe: null,
                id: 'quantity',
                title: 'Cantidad',
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
            { field: 'name', header: 'Descripción' },
            { field: 'rentalPrice', header: 'Valor' }
        ],
        globalFiltes: ['name', 'description'],
        header: [
            {
                pipe: null,
                id: 'name',
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

        const suggestions$ = this.searchTerm$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => this.fetchSuggestions(term))
        );

        const suggestionsSignal = toSignal(suggestions$, { initialValue: [] });
        effect(() => {
            this.inventory.set(suggestionsSignal());
        });
    }

    ngOnInit(): void {
        this.getModules();
        this.loadDetail();
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
                                    section: [...event.section.map((s) => (s._id === this.currentSectionId ? { ...s, items, footer: this.getFooterValues(items, s.type) } : s))]
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

    saveUtility() {
        this.submitted = true;
        if (!this.item.name || !this.item.rentalPrice) {
            return;
        }

        const aiuSection = this.eventDetail().section.find((s) => s._id === this.currentSectionId);
        const valuesItemsAiu = {
            admin: this.item.rentalPrice * 0.1,
            unexpected: this.item.rentalPrice * 0.1,
            management: this.item.rentalPrice * 0.1,
            accounting: this.item.rentalPrice * 0.05
        };

        const newSection = aiuSection?.items.map((item) => {
            if (item.name === 'Administración') item.rentalPrice = valuesItemsAiu.admin;
            if (item.name === 'Imprevistos') item.rentalPrice = valuesItemsAiu.unexpected;
            if (item.name === 'Contabilidad') item.rentalPrice = valuesItemsAiu.accounting;
            if (item.name === 'Gestión') item.rentalPrice = valuesItemsAiu.management;

            return item;
        });

        this.eventService.updateAiuSection(this.currentSectionId, newSection!).subscribe({
            next: (data: any) => {
                if (data) {
                    this.eventDetail.update((event: EventDetail) => {
                        const section = event.section.find((s) => s._id === this.currentSectionId);
                        if (section) {
                            return {
                                ...event,
                                section: [
                                    ...event.section.map((s) =>
                                        s._id === this.currentSectionId
                                            ? {
                                                  ...s,
                                                  items: newSection!,
                                                  footer: this.getFooterValues(newSection!, s.type)
                                              }
                                            : s
                                    )
                                ]
                            };
                        }
                        return event;
                    });

                    this.eventService.eventId$.set('');
                    this.eventService.eventId$.set(this.eventId());

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Sección AIU actualizada correctamente.',
                        life: 3000
                    });

                    this.isUtilityItem = false;
                    this.isItemDialogAdmin = false;
                    this.itemDialog = false;
                }
            }
        });
    }

    onSelectItem(item: AutoCompleteSelectEvent) {
        this.itemSelected = item.value;
        this.item.rentalPrice = item.value.rentalPrice;
    }
    onChangeQuantity(event: number) {
        this.item.quantity = event;
        this.item.rentalPrice = Math.round(event * (this.itemSelected.rentalPrice || 0));
    }

    saveItem() {
        this.submitted = true;
        if (!this.item.name || !this.item.rentalPrice || this.item.quantity < 1) {
            return;
        }
        this.itemDialog = false;

        this.eventService.saveItemSection(this.eventId(), this.currentSectionId, this.item).subscribe({
            next: (data: any) => {
                this.submitted = false;
                this.itemSelected = {} as Product;
                this.item = {
                    quantity: 1,
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
                                footer: this.getFooterValues(items, section.type)
                            };
                        } else {
                            section = {
                                ...section,
                                footer: this.getFooterValues([...section.items, data.data], section.type),
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
                        description: data.data.description,
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
            this.itemSelected = {
                rentalPrice: this.item.rentalPrice / this.item.quantity
            } as Product;
            this.isUtilityItem = item.name === 'Utilidad';
            return;
        }

        this.isUtilityItem = false;
    }

    hideDialog() {
        this.itemDialog = false;
        this.item = {} as Item;
    }

    search(event: AutoCompleteCompleteEvent) {
        this.item.name = event.query;
        this.searchTerm$.next(event.query);
    }

    saveDescription(sectionId: string, description: string) {
        this.eventService.editSectionDescription(this.eventId(), sectionId, description).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Descripción actualizada correctamente.',
                    life: 3000
                });
            }
        });
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
                            footer: this.getFooterValues(section.items, section.type)
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

    private fetchSuggestions(term: string) {
        if (!term || term.length < 2) {
            return of([]);
        }

        return this.inventoryService.getItemInventoryByName(term).pipe(map((data: any) => data.data));
    }

    private getFooterValues(items: Item[], type: string): FooterValues {
        const footer: FooterValues = {} as FooterValues;
        const isAdmin = type === 'admin';
        const totalRentalPrice = items.reduce((acc, item) => acc + item.rentalPrice, 0);
        const totalCostPrice = items.reduce((acc, item) => acc + item.costPrice, 0);
        footer.size = isAdmin ? '1' : '2';
        footer.values = [{ id: 'rentalPrice', value: totalRentalPrice, pipe: 'price' }];

        if (!isAdmin) {
            footer.values.push({ id: 'costPrice', value: totalCostPrice, pipe: 'price' }, { id: 'empty2', value: 0, pipe: 'number' }, { id: 'empty3', value: 0, pipe: 'number' });
        }

        if (isAdmin) {
            footer.values.push({ id: 'empty2', value: totalCostPrice, pipe: 'price' });
        }

        return footer;
    }
}
