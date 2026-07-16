import {
  Component,
  Input,
  forwardRef,
  inject, // 1. Importa inject
  ChangeDetectorRef // 2. Importa ChangeDetectorRef
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './auth-input.component.html',
  styleUrl: './auth-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuthInputComponent),
      multi: true
    }
  ]
})
export class AuthInputComponent implements ControlValueAccessor {

  // 3. Inyecta el detector de cambios de Angular
  private cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = ' ';
  @Input() error = '';

  value = '';
  disabled = false;
  showPassword = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
    // 4. Fuerza a Angular a pintar el nuevo valor (el campo vacío) en el HTML
    this.cdr.markForCheck(); 
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    // 5. Fuerza a Angular a aplicar el estado de bloqueo/desbloqueo en el HTML
    this.cdr.markForCheck();
  }

  update(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  blur(): void {
    this.onTouched();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get inputType(): string {
    if (this.type !== 'password') {
      return this.type;
    }
    return this.showPassword ? 'text' : 'password';
  }
}