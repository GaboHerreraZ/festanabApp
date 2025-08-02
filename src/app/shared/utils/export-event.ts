/* import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

interface Evento {
    description: string;
    date: string;
    time: string;
    owner: string;
    sections: {
        name: string;
        items: {
            name: string;
            description: string;
            quantity: number;
            owner: string;
        }[];
    }[];
}

export function exportarEventoAExcel(evento: Evento) {
    const datos: any[][] = [];

    // Información del evento
    datos.push(['Descripción del evento', evento.description]);
    datos.push(['Fecha', new Date(evento.date).toLocaleDateString()]);
    datos.push(['Hora', new Date(evento.time).toLocaleTimeString()]);
    datos.push(['Responsable', evento.owner]);
    datos.push([]); // línea en blanco

    const filasConEstilo: { fila: number; columnas: number[]; negrita: boolean }[] = [];

    // Agregar secciones
    let filaActual = datos.length;

    evento.sections.forEach((section) => {
        // Título de la sección
        datos.push([`Sección: ${section.name}`]);
        filasConEstilo.push({ fila: filaActual++, columnas: [0], negrita: true });

        // Encabezados
        datos.push(['Cantidad', 'Nombre del ítem', 'Descripción', 'Responsable']);
        filasConEstilo.push({ fila: filaActual++, columnas: [0, 1, 2, 3], negrita: true });

        // Ítems
        section.items.forEach((item) => {
            datos.push([item.quantity, item.name, item.description, item.owner]);
            filaActual++;
        });

        datos.push([]); // Línea en blanco entre secciones
        filaActual++;
    });

    // Crear hoja y aplicar estilos
    const ws = XLSX.utils.aoa_to_sheet(datos);

    // Aplicar ancho a las columnas
    ws['!cols'] = [
        { wch: 40 }, // Cantidad
        { wch: 40 }, // Nombre
        { wch: 40 }, // Descripción
        { wch: 40 } // Responsable
    ];

    // Aplicar negrita a celdas indicadas
    filasConEstilo.forEach(({ fila, columnas }) => {
        columnas.forEach((col) => {
            const celda = XLSX.utils.encode_cell({ r: fila, c: col });
            if (!ws[celda]) return;
            ws[celda].s = {
                font: { bold: true }
            };
        });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Evento');

    const nombreArchivo = `Evento_${evento.description.replace(/\s+/g, '_')}.xlsx`;
    const buffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true // importante para negrita
    });

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, nombreArchivo);
}
 */

import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

interface Evento {
    description: string;
    date: string;
    time: string;
    owner: string;
    sections: {
        name: string;
        items: {
            name: string;
            description: string;
            quantity: number;
            owner: string;
        }[];
    }[];
}

export async function exportToExcel(evento: Evento) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Evento');

    // === Información general del evento ===
    const infoGeneral = [
        ['Descripción del evento', evento.description],
        ['Fecha', new Date(evento.date).toLocaleDateString()],
        ['Hora', new Date(evento.time).toLocaleTimeString()],
        ['Responsable', evento.owner]
    ];

    infoGeneral.forEach((fila) => {
        const row = worksheet.addRow(fila);
        row.getCell(1).font = { bold: true }; // Solo el título en negrita
    });

    worksheet.addRow([]); // Línea en blanco

    // === Secciones ===
    evento.sections.forEach((section) => {
        worksheet.addRow([`Sección: ${section.name}`]);

        const headerTitles = ['Cantidad', 'Nombre del ítem', 'Descripción', 'Responsable'];
        const headerRow = worksheet.addRow(headerTitles);

        // Aplicar estilo solo a las celdas del header
        headerTitles.forEach((_, colIndex) => {
            const cell = headerRow.getCell(colIndex + 1);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF5B9BD5' } // Celeste
            };
        });

        // Agregar ítems
        section.items.forEach((item) => {
            worksheet.addRow([item.quantity, item.name, item.description, item.owner]);
        });

        worksheet.addRow([]); // Línea en blanco entre secciones
    });

    // Ajustar ancho de columnas
    worksheet.columns = [{ width: 40 }, { width: 40 }, { width: 40 }, { width: 40 }];

    // Exportar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const nombreArchivo = `Evento_${evento.description.replace(/\s+/g, '_')}.xlsx`;
    FileSaver.saveAs(blob, nombreArchivo);
}
