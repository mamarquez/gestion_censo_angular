import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Menu } from '../../models/menu';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-instalaciones',
  imports: [TableModule],
  templateUrl: './instalaciones.component.html',
  styleUrl: './instalaciones.component.css',
})
export class MenuComponent implements OnInit {

  private readonly menuService = inject(MenuService);
  private readonly cdr = inject(ChangeDetectorRef);

  menus: Menu [] = [];
  // menus = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarMenus();
  }

  cargarMenus(): void {
    this.menuService.getAll().subscribe({
      next: (response) => {
        // this.menus = [];
        this.menus = response.data;
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
