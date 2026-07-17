import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Municipio } from '../../models/municipio';
import { MunicipioService } from '../../services/municipio.service';

@Component({
  selector: 'app-municipios',
  standalone: true,
  imports: [TableModule],
  templateUrl: './municipios.component.html',
  styleUrl: './municipios.component.css',
})
export class MunicipiosComponent implements OnInit {

  private readonly municipioService = inject(MunicipioService);
  private readonly cdr = inject(ChangeDetectorRef);

  municipios: Municipio[] = [];
  cargando: boolean = true;
  
  ngOnInit(): void {
    this.cargarMunicipios();
  }

  cargarMunicipios(): void {
    this.municipioService.getAll().subscribe({
      next: (response) => {
        // this.municipios = [];
        this.municipios = response.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar municipios', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}