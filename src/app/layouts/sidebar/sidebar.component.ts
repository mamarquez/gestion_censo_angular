import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Output() enlaceSeleccionado = new EventEmitter<void>();

  // Delegación de eventos: solo notifica al pulsar/activar un enlace real (no el <summary> de un submenú)
  onNavClick(event: MouseEvent | KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('a')) {
      this.enlaceSeleccionado.emit();
    }
  }
}
