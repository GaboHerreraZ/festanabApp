import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { Product } from '../../core/models/product';

export async function exportInventoryToExcel(products: Product[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    // === Encabezado ===
    const headerTitles = ['Nombre', 'Cantidad', 'Precio Alquiler', 'Descripción'];
    const headerRow = worksheet.addRow(headerTitles);

    headerTitles.forEach((_, colIndex) => {
        const cell = headerRow.getCell(colIndex + 1);
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF5B9BD5' } // Celeste
        };
    });

    // === Productos ===
    products.forEach((product) => {
        const row = worksheet.addRow([product.name ?? '', product.quantity ?? 0, product.rentalPrice ?? 0, product.description ?? '']);
        row.getCell(3).numFmt = '"$"#,##0';
    });

    // Ajustar ancho de columnas
    worksheet.columns = [{ width: 40 }, { width: 12 }, { width: 18 }, { width: 50 }];

    // Exportar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fecha = new Date().toISOString().slice(0, 10);
    FileSaver.saveAs(blob, `Inventario_${fecha}.xlsx`);
}
