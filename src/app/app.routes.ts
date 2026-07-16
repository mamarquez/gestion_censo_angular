import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { InstalacionesComponent } from './pages/instalaciones/instalaciones.component';
import { MunicipiosComponent } from './pages/municipios/municipios.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  /*
  {
    path: 'login',
    component: LoginComponent
  },
  */
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canMatch: [authGuard], // Protege la zona privada
    children: [
      {
        path: 'instalaciones', 
        component: InstalacionesComponent
      },
      {
        path: 'municipios', 
        component: MunicipiosComponent
      },
      {
        path: 'usuarios', 
        component: UsuariosComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];