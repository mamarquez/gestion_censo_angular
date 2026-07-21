import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { Auditoria } from '../../models/auditoria';
import { AuditoriaService } from '../../services/auditoria.service';

@Component({
  selector: 'app-auditorias',
  imports: [TableModule, TagModule, DatePipe],
  templateUrl: './auditoria.component.html',
  styleUrl: './pavimento.component.css',
})
export class AuditoriaComponent implements OnInit {

  private readonly service = inject(AuditoriaService);
  private readonly cdr = inject(ChangeDetectorRef);

  auditorias: Auditoria[] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        const datosRaw = response.data || [];

        const datosFormateados = datosRaw.map((audit: any) => {
          if (audit.fecha && typeof audit.fecha === 'string' && audit.fecha.includes(' ')) {
            try {
              const [fechaParte, horaParte] = audit.fecha.split(' ');
              const [dia, mes, ano] = fechaParte.split('-');
              audit.fecha = `${ano}-${mes}-${dia}T${horaParte}`;
            } catch (e) {
              console.warn('No se pudo formatear la fecha de auditoría:', audit.fecha);
            }
          }
          return audit;
        });

        this.auditorias = datosFormateados.sort((a, b) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });

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

  getSeverity(operacion: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (operacion) {
      case 'INSERT':
        return 'success';
      case 'UPDATE':
        return 'warn';
      case 'DELETE':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
