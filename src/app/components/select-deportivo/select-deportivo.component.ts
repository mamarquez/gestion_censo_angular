import { Component, DestroyRef, forwardRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { TipoInstalacion } from '../../models/tipo-instalacion';
import { TipoInstalacionService } from '../../services/tipo-instalacion.service';

@Component({
  standalone: true,
  selector: 'app-select-deportivo',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select-deportivo.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDeportivoComponent),
      multi: true
    }
  ]
})
export class SelectDeportivoComponent implements ControlValueAccessor, OnInit {
  private readonly service = inject(TipoInstalacionService);
  private readonly destroyRef = inject(DestroyRef);

  tiposInstalaciones = signal<TipoInstalacion[]>([]);
  cargando = signal<boolean>(true);
  disabled = signal<boolean>(false);

  value: any = null;
  filtros = { activo: true };

  onChange: (value: any) => void = () => {
  };
  onTouched: () => void = () => {
  };

  ngOnInit(): void {
    this.cargarTiposInstalaciones();
  }

  private cargarTiposInstalaciones(): void {
    this.service.getAll(this.filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.tiposInstalaciones.set(response.data || []);
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
