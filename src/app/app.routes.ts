import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { InstalacionComponent } from './views/instalaciones/instalacion.component';
import { MunicipioComponent } from './views/municipios/municipio.component';
import { UsuarioComponent } from './views/usuarios/usuario.component';
import { ProvinciaComponent } from './views/provincias/provincia.component';
import { RolComponent } from './views/roles/rol.component';
import { CaracteristicaComponent } from './views/caracteristicas/caracteristica.component';
import { AuditoriaComponent } from './views/auditorias/auditoria.component';
import { MenuComponent } from './views/menus/menu.component';
import { PavimentoComponent } from './views/pavimentos/pavimento.component';
import { MedidaComponent } from './views/medidas/medida.component';
import { ActividadDeportivaComponent } from './views/actividadesdeportivas/actividaddeportiva.component';
import { CentroEducativoComponent } from './views/centroseducativos/centroeducativo.component';
import { CerramientoComponent } from './views/cerramientos/cerramiento.component';
import { authGuard } from './auth/guards/auth.guard';
import { ConservacionComponent } from './views/conservaciones/conservacion.component';
import { NivelEnergeticoComponent } from './views/nivelesenergeticos/nivelenergetico.component';
import { NivelEducativoComponent } from './views/niveleseducativos/niveleducativo.component';
import { NivelDotacionComponent } from './views/nivelesdotaciones/niveldotacion.component';
import { IluminacionComponent } from './views/iluminaciones/iluminacion.component';
import { GestorComponent } from './views/gestores/cerramiento.component';
import { EstadoUsoComponent } from './views/estadosusos/estadouso.component';
import { EspacioDeportivoCompoment } from './views/espaciosdeportivos/espaciodeportivo.component';
import { EspacioComplementarioCompoment } from './views/espacioscomplementarios/espaciocomplementario.component';

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
      },
      {
        path: 'pavimentos',
        component: PavimentoComponent
      },
      {
        path: 'medidas',
        component: MedidaComponent
      },
      {
        path: 'actividadesdeportivas',
        component: ActividadDeportivaComponent
      },
      {
        path: 'centroseducativos',
        component: CentroEducativoComponent
      },
      {
        path: 'cerramientos',
        component: CerramientoComponent
      },
      {
        path: 'conservaciones',
        component: ConservacionComponent
      },
      {
        path: 'nivelesenergeticos',
        component: NivelEnergeticoComponent
      },
      {
        path: 'niveleseducativos',
        component: NivelEducativoComponent
      },
      {
        path: 'nivelesdotaciones',
        component: NivelDotacionComponent
      },
      {
        path: 'iluminaciones',
        component: IluminacionComponent
      },
      {
        path: 'gestores',
        component: GestorComponent
      },
      {
        path: 'estadosusos',
        component: EstadoUsoComponent
      },
      {
        path: 'espaciosdeportivos',
        component: EspacioDeportivoCompoment
      },
      {
        path: 'espacioscomplementarios',
        component: EspacioComplementarioCompoment
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
