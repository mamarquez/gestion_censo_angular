import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { NivelEducativo } from '../../models/niveleducativo';
import { NivelEducativoService } from '../../services/niveleducativo.service';

@Component({
  selector: 'app-niveleducativo',
  imports: [TableModule],
  templateUrl: './niveleducativo.component.html',
  styleUrl: './niveldotacion.component.css',
})
export class NivelEducativoComponent implements OnInit {

  private readonly service = inject(NivelEducativoService);
  private readonly cdr = inject(ChangeDetectorRef);

  nivelesEducativos: NivelEducativo [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.nivelesEducativos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar niveles educativos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
