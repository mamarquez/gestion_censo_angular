import { Component, forwardRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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

  private service = inject(ComunidadautonomaService);

  comunidades: ComunidadAutonoma[] = [];
  cargandoComunidades = true;

  // El valor interno del select
  value: any = null;

  filtros = { activo: true };

  // Funciones que Angular nos obliga a tener
  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    this.cargarComunidades();
  }

  private cargarComunidades(): void {
    this.service.getAll(this.filtros).subscribe({
      next: (response: any) => {
        this.comunidades = response.data || [];
        this.cargandoComunidades = false;
      },
      error: () => this.cargandoComunidades = false
    });
  }

  // Cuando el usuario elige una opción en el select
  seleccionar(event: any): void {
    this.value = event.value;
    this.onChange(this.value); // Avisar al formulario del cambio
    this.onTouched();
  }

  // Cuando el formulario le dice al componente qué valor tener (ej. al hacer patchValue)
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
}
