import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'mask'
})
export class MaskPipe implements PipeTransform {
    transform(value: string | number, visible: boolean = false): string {
        if (value == null) return '';

        const strValue = value.toString();

        // si visible -> mostrar el valor normal
        if (visible) return strValue;

        // si no -> devolver asteriscos del mismo largo
        return '*'.repeat(strValue.length) + ' COP';
    }
}
