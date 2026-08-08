import { Component, DestroyRef, forwardRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { Provincia } from '../../models/provincia';
import { ProvinciaService } from '../../services/provincia.service';

@Component({
  standalone: true,
  selector: 'app-select-provincia',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select-provincia.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectProvinciaComponent),
      multi: true
    }
  ]
})
export class SelectProvinciaComponent implements ControlValueAccessor, OnInit {

  private readonly service = inject(ProvinciaService);
  private readonly destroyRef = inject(DestroyRef);

  provincias: Provincia[] = [];
  cargandoProvincias = true;
  disabled = signal<boolean>(false);
  value: any = null;
  filtros = { activo: true };

  onChange: (value: any) => void = () => {
  };
  onTouched: () => void = () => {
  };

  ngOnInit(): void {
    this.cargarProvincias();
  }

  private cargarProvincias(): void {
    this.service.getAll(this.filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.provincias = response.data || [];
          this.cargandoProvincias = false;
        },
        error: () => this.cargandoProvincias = false
      });
  }

  // Cuando el usuario elige una opción en el select
  seleccionar(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  // Cuando el formulario le dice al componente qué valor tener
  writeValue(value: any): void {
    this.value = value;
  }

  // Registrar el cambio
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Registrar el toque (para validaciones)
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
