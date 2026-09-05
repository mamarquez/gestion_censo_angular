import { Component, DestroyRef, forwardRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { Caracteristica } from '../../models/caracteristica';
import { CaracteristicaService } from '../../services/caracteristica.service';

@Component({
  standalone: true,
  selector: 'app-select-caracteristica',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select-caracteristica.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectCaracteristicaComponent),
      multi: true
    }
  ]
})
export class SelectCaracteristicaComponent implements ControlValueAccessor, OnInit {
  private readonly service = inject(CaracteristicaService);
  private readonly destroyRef = inject(DestroyRef);

  caracteristicas = signal<Caracteristica[]>([]);
  cargando = signal<boolean>(true);
  disabled = signal<boolean>(false);

  value: any = null;
  filtros = { activo: true };

  onChange: (value: any) => void = () => {
  };
  onTouched: () => void = () => {
  };

  ngOnInit(): void {
    this.cargarCaracteristicas();
  }

  private cargarCaracteristicas(): void {
    this.service.getAll(this.filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.caracteristicas.set(response.data || []);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false)
      });
  }

  seleccionar(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
