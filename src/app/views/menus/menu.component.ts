import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Menu } from '../../models/menu';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menus',
  imports: [TableModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {

  private readonly service = inject(MenuService);
  private readonly cdr = inject(ChangeDetectorRef);

  menus: Menu [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.menus = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar menús', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
