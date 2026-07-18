import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';


import { Provincia } from '../../models/provincia';
import { ProvinciaService } from '../../services/provincia.service';

@Component({
  selector: 'app-provincia',
  standalone: true,
  imports: [TableModule, ButtonModule],
  templateUrl: './provincia.component.html',
  styleUrl: './provincia.component.css',
})
export class ProvinciaComponent implements OnInit {

  private readonly service = inject(ProvinciaService);
  private readonly cdr = inject(ChangeDetectorRef);

  provincias: Provincia[] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.provincias = response.data || [];
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

  editarRegistro(provincia: any) {
      console.log('Editando:', provincia);
      // Tu lógica de edición aquí
  }
}
