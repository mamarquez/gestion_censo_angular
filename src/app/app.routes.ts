import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ListInstalacionesComponent } from './views/instalaciones/list/instalaciones.component';
import { MunicipioComponent } from './views/municipios/list/municipio.component';
import { UsuarioComponent } from './views/usuarios/list/usuario.component';
import { ListProvinciaComponent } from './views/provincias/list/provincia.component';
import { RolComponent } from './views/roles/list/rol.component';
import { CaracteristicaComponent } from './views/caracteristicas/list/caracteristica.component';
import { AuditoriaComponent } from './views/auditorias/list/auditoria.component';
import { MenuComponent } from './views/menus/list/menu.component';
import { PavimentoComponent } from './views/pavimentos/list/pavimento.component';
import { MedidaComponent } from './views/medidas/list/medida.component';
import { ActividadDeportivaComponent } from './views/actividadesdeportivas/list/actividaddeportiva.component';
import { ListCentroEducativoComponent } from './views/centroseducativos/list/centroeducativo.component';
import { CerramientoComponent } from './views/cerramientos/list/cerramiento.component';
import { authGuard } from './auth/guards/auth.guard';
import { ConservacionComponent } from './views/conservaciones/list/conservacion.component';
import { NivelEnergeticoComponent } from './views/nivelesenergeticos/list/nivelenergetico.component';
import { NivelEducativoComponent } from './views/niveleseducativos/list/niveleducativo.component';
import { NivelDotacionComponent } from './views/nivelesdotaciones/list/niveldotacion.component';
import { IluminacionComponent } from './views/iluminaciones/list/iluminacion.component';
import { GestorComponent } from './views/gestores/list/gestor.component';
import { EstadoUsoComponent } from './views/estadosusos/list/estadouso.component';
import { PropietarioComponent } from './views/propietarios/list/propietario.component';
import {
  TiposGestoresPropiedadesComponent
} from './views/tiposgestorespropiedades/list/tiposgestorespropiedades.component';
import { ConfiguracionComponent } from './views/configuracion/list/configuraciones.component';
import { EditUsuarioComponent } from './views/usuarios/edit/edit.component';
import { ListComunidadesComponent } from './views/comunidades/list/comunidades.component';
import { EditInstalacionComponent } from './views/instalaciones/edit/editInstalacion.component';
import {
  EditInstalacionDeportivaComponent
} from './views/instalaciones/edit/tabs/deportivos/edit-espacio-deportivo/edit-instalacion-deportiva.component';
import { EspacioDeportivoComponent } from './views/espaciosdeportivos/list/espaciodeportivo.component';
import { EspacioComplementarioCompoment } from './views/espacioscomplementarios/list/espaciocomplementario.component';
import { RolFormComponent } from './views/roles/form/rol-form.component';
import {
  EditInstalacionRutaComponent
} from './views/instalaciones/edit/tabs/rutas/edit-instalacion-ruta/edit-instalacion-ruta.component';
import { MapaRutaComponent } from './components/mapa-ruta/mapa-ruta.component';
import { PerfilComponent } from './views/usuarios/perfil/perfil.component';
import { NotFoundComponent } from './views/errors/not-found/not-found.component';
import { ForbiddenComponent } from './views/errors/forbidden/forbidden.component';
import { ServerErrorComponent } from './views/errors/server-error/server-error.component';
import {
  EditEspacioComplementarioComponent
} from './views/espacioscomplementarios/edit-espacio-complementario/edit-espacio-complementario.component';

/**
 * @version 2.0.0
 */

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
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
    path: '500',
    component: ServerErrorComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canMatch: [authGuard],
    children: [
      {
        path: 'instalaciones',
        children: [
          { path: '', component: ListInstalacionesComponent },
          { path: ':id', component: EditInstalacionComponent }
        ]
      },
      {
        path: 'municipios',
        children: [
          { path: '', component: MunicipioComponent }
          // { path: ':id', component: EditMunicipioComponent },
        ]
      },
      {
        path: 'usuarios',
        children: [
          { path: '', component: UsuarioComponent },
          { path: 'nuevo', component: EditUsuarioComponent },
          { path: 'perfil', component: PerfilComponent },
          { path: ':id', component: EditUsuarioComponent }
        ]
      },
      {
        path: 'menus',
        children: [
          { path: '', component: MenuComponent }
          // { path: ':id', component: EditMenuComponent },
        ]
      },
      {
        path: 'provincias',
        children: [
          { path: '', component: ListProvinciaComponent }
          // { path: ':id', component: EditProvinciaComponent },
        ]

      },
      {
        path: 'tiposgestorespropiedades',
        children: [
          { path: '', component: TiposGestoresPropiedadesComponent }
          // { path: ':id', component: EditTipoGestorPropiedadComponent },
        ]
      },
      {
        path: 'roles',
        children: [
          { path: '', component: RolComponent },
          { path: 'nuevo', component: RolFormComponent },
          { path: ':id', component: RolFormComponent }
        ]
      },
      {
        path: 'propietarios',
        children: [
          { path: '', component: PropietarioComponent }
          // { path: ':id', component: EditPropietarioComponent }
        ]
      },
      {
        path: 'caracteristicas',
        component: CaracteristicaComponent
      },
      {
        path: 'auditorias', component: AuditoriaComponent
      },
      {
        path: 'pavimentos',
        children: [
          { path: '', component: PavimentoComponent }
          // { path: ':id', component: EditPavimentoComponent }
        ]
      },
      {
        path: 'configuraciones',
        children: [
          { path: '', component: ConfiguracionComponent }
          // { path: ':id', component: EditConfiguracionComponent }
        ]
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
        component: ListCentroEducativoComponent
      },
      {
        path: 'comunidades',
        children: [
          { path: '', component: ListComunidadesComponent }
          // { path: ':id', component: EditComunidadComponent },
        ]
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
        path: 'espacioscomplementarios',
        children: [
          { path: '', component: EspacioComplementarioCompoment },
          { path: ':id', component: EditEspacioComplementarioComponent },
        ]
      },
      {
        path: 'espaciosdeportivos',
        children: [
          { path: '', component: EspacioDeportivoComponent },
          { path: ':id', component: EditEspacioComplementarioComponent }
        ]
      },
      {
        path: 'instalacionesespacios',
        children: [
          { path: ':id', component: EditInstalacionDeportivaComponent }
        ]
      },
      {
        path: 'instalacionesrutas',
        children: [
          { path: 'nuevo', component: EditInstalacionRutaComponent },
          { path: ':id', component: EditInstalacionRutaComponent }
        ]
      },
      {
        path: 'mapa',
        children: [
          { path: '', component: MapaRutaComponent }
        ]
      },
      {
        path: 'error/403',
        component: ForbiddenComponent
      },
      {
        path: 'error/500',
        component: ServerErrorComponent
      },
      {
        path: 'no-encontrado',
        component: NotFoundComponent
      }
    ]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
