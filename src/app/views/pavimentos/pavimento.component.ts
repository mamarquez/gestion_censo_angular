import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Pavimento } from '../../models/pavimento';
import { PavimentoService } from '../../services/pavimento.service';

@Component({
  selector: 'app-auditorias',
  imports: [TableModule],
  templateUrl: './pavimento.component.html',
  styleUrl: './pavimento.component.css',
})
export class PavimentoComponent implements OnInit {

  private readonly service = inject(PavimentoService);
  private readonly cdr = inject(ChangeDetectorRef);

  pavimentos: Pavimento [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.pavimentos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pavimentos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
