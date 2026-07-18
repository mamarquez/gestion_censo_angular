import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Auditoria } from '../../models/auditoria';
import { AuditoriaService } from '../../services/auditoria.service';

@Component({
  selector: 'app-auditorias',
  imports: [TableModule],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.css',
})
export class AuditoriaComponent implements OnInit {

  private readonly service = inject(AuditoriaService);
  private readonly cdr = inject(ChangeDetectorRef);

  auditorias: Auditoria [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.auditorias = response.data || [];
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
