import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <select [(ngModel)]="value" (change)="onChange($event)" [disabled]="disabled" class="p-inputtext">
      <option [ngValue]="null" disabled>{{ placeholder }}</option>
      <option *ngFor="let item of options" [ngValue]="item.value">
        {{ item.label }}
      </option>
    </select>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GenericSelectComponent),
    multi: true
  }]
})
export class GenericSelectComponent implements ControlValueAccessor {
  @Input() options: { label: string, value: any }[] = [];
  @Input() placeholder: string = 'Seleccione una opción';
  
  value: any;
  disabled: boolean = false;

  // Funciones para comunicar cambios al formulario
  onChange = (_: any) => {};
  onTouch = () => {};

  writeValue(obj: any): void { this.value = obj; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouch = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}