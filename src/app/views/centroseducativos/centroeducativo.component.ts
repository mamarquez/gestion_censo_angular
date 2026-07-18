import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { CentroEducativo } from '../../models/centroeducativo';
import { CentroEducativoService } from '../../services/centroeducativo.service';

@Component({
  selector: 'app-centroseducativos',
  imports: [TableModule],
  templateUrl: './centroeducativo.component.html',
  styleUrl: './centroeducativo.component.css',
})
export class CentroEducativoComponent implements OnInit {

  private readonly service = inject(CentroEducativoService);
  private readonly cdr = inject(ChangeDetectorRef);

  centrosEducativos: CentroEducativo [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.centrosEducativos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar características', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
