import { Component, forwardRef, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ComunidadAutonoma } from '../../models/comunidadautonoma';
import { ComunidadautonomaService } from '../../services/comunidadautonoma.service';
import { Provincia } from '../../models/provincia';
import { ProvinciaService } from '../../services/provincia.service';
import { MunicipioService } from '../../services/municipio.service';
import { Municipio } from '../../models/municipio';


@Component({
  standalone: true,
  selector: 'app-select-municipio',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select-provincia.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectMunicipioComponent),
      multi: true
    }
  ]
})
export class SelectMunicipioComponent implements ControlValueAccessor, OnInit {

  private readonly service = inject(MunicipioService);
  private readonly destroyRef = inject(DestroyRef);

  municipios: Municipio[] = [];
  cargandoMunicipios = true;
  disabled = signal<boolean>(false);
  value: any = null;
  filtros = { activo: true };

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    this.cargarProvincias();
  }

	// Cuando el usuario elige una opción en el select
  private cargarProvincias(): void {
    this.service.getAll(this.filtros)
		.pipe(takeUntilDestroyed(this.destroyRef))
		.subscribe({
			next: (response: any) => {
				this.municipios = response.data || [];
				this.cargandoMunicipios = false;
			},
      error: () => this.cargandoMunicipios = false
    });
  }
  
  // Cuando el usuario elige una opción en el select
  seleccionar(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

   // Cuando el formulario le dice al componente qué valor tener (ej. al hacer patchValue)
  writeValue(value: any): void {
    this.value = value;
  }

  // Registrar el cambio
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  // Registrar el toque (para validaciones)																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																											  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
