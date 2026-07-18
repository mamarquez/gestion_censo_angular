import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { InstalacionComponent } from './views/instalaciones/instalacion.component';
import { MunicipioComponent } from './views/municipios/municipio.component';
import { UsuarioComponent } from './views/usuarios/usuario.component';
import { ProvinciaComponent } from './views/provincias/provincia.component';
import { RolComponent } from './views/roles/rol.component';
import { CaracteristicaComponent } from './views/caracteristicas/caracteristica.component';
import { AuditoriaComponent} from './views/auditorias/auditoria.component';
import { MenuComponent } from './views/menus/menu.component';
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
      },
      {
        path: 'roles',
        component: RolComponent
      },
      {
        path: 'caracteristicas',
        component: CaracteristicaComponent
      },
      {
        path: 'auditorias',
        component: AuditoriaComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
