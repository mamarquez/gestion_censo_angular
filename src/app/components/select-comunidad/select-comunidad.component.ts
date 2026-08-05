import { Component, forwardRef, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { ComunidadAutonoma } from '../../models/comunidadautonoma';
import { ComunidadautonomaService } from '../../services/comunidadautonoma.service';

@Component({
  standalone: true,
  selector: 'app-select-comunidad',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select-comunidad.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComunidadComponent),
      multi: true
    }
  ]
})
export class SelectComunidadComponent implements ControlValueAccessor, OnInit {
  private readonly service = inject(ComunidadautonomaService);
  private readonly destroyRef = inject(DestroyRef);

  comunidades = signal<ComunidadAutonoma[]>([]);
  cargandoComunidades = signal<boolean>(true);
  disabled = signal<boolean>(false);

  value: any = null;
  filtros = { activo: true };

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    this.cargarComunidades();
  }

  private cargarComunidades(): void {
    this.service.getAll(this.filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.comunidades.set(response.data || []);
          this.cargandoComunidades.set(false);
        },
        error: () => this.cargandoComunidades.set(false)
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