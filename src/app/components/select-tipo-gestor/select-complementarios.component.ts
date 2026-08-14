import { Component, DestroyRef, forwardRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { TipoGestorPropiedad } from '../../models/tipogestorpropiedad';
import { ApiResponseWrapper } from '../../interface/api-response-wrapper.interface';
import { TipoGestorPropiedadService } from '../../services/tipogestorpropiedad.service';

@Component({
  standalone: true,
  selector: 'app-select-tipo-gestor',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select-complementarios.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectTiposGestoresComponent),
      multi: true
    }
  ]
})
export class SelectTiposGestoresComponent implements ControlValueAccessor, OnInit {
  private readonly service = inject(TipoGestorPropiedadService);
  private readonly destroyRef = inject(DestroyRef);

  tiposGestores = signal<TipoGestorPropiedad[]>([]);
  cargando = signal<boolean>(true);
  disabled = signal<boolean>(false);

  value: any = null;
  filtros = { activo: true };

  onChange: (value: any) => void = () => {
  };
  onTouched: () => void = () => {
  };

  ngOnInit(): void {
    this.cargarTiposGestores();
  }

  private cargarTiposGestores(): void {
    this.service.getAll(this.filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<TipoGestorPropiedad[]>) => {
          const opciones = response.data ?? [];
          const inicio: TipoGestorPropiedad = { id: undefined, nombre: 'Seleccione', mostrar: '', activo: true };
          this.tiposGestores.set([inicio, ...opciones]);
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
