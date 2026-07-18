import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { InstalacionComponent } from './pages/instalaciones/instalacion.component';
import { MunicipioComponent } from './pages/municipios/municipio.component';
import { UsuarioComponent } from './pages/usuarios/usuario.component';
import { ProvinciaComponent } from './pages/provincias/provincia.component';
import { MenuComponent } from './pages/menus/menu.component';
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
        component: InstalacionComponent
      },
      {
        path: 'municipios', 
        component: MunicipioComponent
      },
      {
        path: 'usuarios', 
        component: UsuarioComponent
      },
      {
        path: 'menus', 
        component: MenuComponent
      },
      {
        path: 'provincias', 
        component: ProvinciaComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];