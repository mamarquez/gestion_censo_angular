import { Component, inject, signal } from '@angular/core'; // Inyectamos signal
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
/* import { LoaderComponent } from '../loader/loader.component'; */
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  // Creamos una Signal reactiva con los datos del usuario al arrancar el Layout
  usuarioLogueado = signal(this.authService.getUser());

  onLogout(): void {
    this.authService.logout();
  }
}