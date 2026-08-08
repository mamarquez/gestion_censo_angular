import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-instalacion-geoposicion',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, FieldsetModule, FluidModule, InputTextModule],
  templateUrl: './geoposicion.component.html'
})
export class GeoPosicionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs/Outputs con señales
  codigoInstalacion = input<number | string>();
  datosIniciales = input<any>();
  
  guardar = output<any>();
  abrirMapaModal = output<void>();

  cargandoGeo = signal<boolean>(false);

  geoForm = this.fb.group({
    codigoInstalacion: [''],
    xy: this.fb.group({
      x: ['', Validators.required],
      y: ['', Validators.required],
      z: ['']
    }),
    nmea: this.fb.group({
      latitud: [''],
      longitud: ['']
    }),
    utm: this.fb.group({
      x: ['', Validators.required],
      y: ['', Validators.required],
      banda: ['', Validators.required],
      huso: ['', Validators.required]
    }),
    gms: this.fb.group({
      gradosLatitud: [''],
      minutosLatitud: [''],
      segundosLatitud: [''],
      gradosLongitud: [''],
      minutosLongitud: [''],
      segundosLongitud: [''],
      altitud: ['']
    })
  });

  ngOnInit(): void {
    if (this.codigoInstalacion()) {
      this.geoForm.patchValue({ codigoInstalacion: String(this.codigoInstalacion()) });
    }
    if (this.datosIniciales()) {
      this.geoForm.patchValue(this.datosIniciales());
    }
  }

  onSubmit(): void {
    if (this.geoForm.valid) {
      this.cargandoGeo.set(true);
      this.guardar.emit(this.geoForm.value);
    } else {
      this.geoForm.markAllAsTouched();
    }
  }
}
