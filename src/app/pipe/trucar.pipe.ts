import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncar',
  standalone: true
})
export class Truncar implements PipeTransform {
  transform(value: string, limit = 100, trail = '...'): string {
    if (!value) return '';

    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
