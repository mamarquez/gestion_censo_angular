import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { InstalacionComponent } from './views/instalaciones/instalacion.component';
import { MunicipioComponent } from './views/municipios/municipio.component';
import { UsuarioComponent } from './views/usuarios/usuario.component';
import { ProvinciaComponent } from './views/provincias/provincia.component';
import { RolComponent } from './views/roles/list/rol.component';
import { CaracteristicaComponent } from './views/caracteristicas/list/caracteristica.component';
import { AuditoriaComponent } from './views/auditorias/list/auditoria.component';
import { MenuComponent } from './views/menus/menu.component';
import { PavimentoComponent } from './views/pavimentos/pavimento.component';
import { MedidaComponent } from './views/medidas/medida.component';
import { ActividadDeportivaComponent } from './views/actividadesdeportivas/list/actividaddeportiva.component';
import { ListCentroEducativoComponent } from './views/centroseducativos/list/centroeducativo.component';
import { CerramientoComponent } from './views/cerramientos/list/cerramiento.component';
import { authGuard } from './auth/guards/auth.guard';
import { ConservacionComponent } from './views/conservaciones/list/conservacion.component';
import { NivelEnergeticoComponent } from './views/nivelesenergeticos/nivelenergetico.component';
import { NivelEducativoComponent } from './views/niveleseducativos/niveleducativo.component';
import { NivelDotacionComponent } from './views/nivelesdotaciones/niveldotacion.component';
import { IluminacionComponent } from './views/iluminaciones/iluminacion.component';
import { GestorComponent } from './views/gestores/list/gestor.component';
import { EstadoUsoComponent } from './views/estadosusos/list/estadouso.component';
import { EspacioDeportivoCompoment } from './views/espaciosdeportivos/list/espaciodeportivo.component';
import { EspacioComplementarioCompoment } from './views/espacioscomplementarios/list/espaciocomplementario.component';
import { PropietarioComponent } from './views/propietarios/propietario.component';
import { TiposGestoresPropiedadesComponent } from './views/tiposgestorespropiedades/tiposgestorespropiedades.component';
import { ConfiguracionComponent } from './views/configuracion/list/configuraciones.component';
import { EditUsuarioComponent } from './views/editusuario/edit.component';
import { ListComunidadesComponent } from './views/comunidades/list/comunidades.component';

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
        children: [
          { path: '', component: MunicipioComponent },
          // { path: ':id', component: EditUsuarioComponent },
        ]
      },
      {
        path: 'usuarios',
        children: [
          { path: '', component: UsuarioComponent },
          { path: ':id', component: EditUsuarioComponent },
        ]
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
        path: 'tiposgestorespropiedades',
        component: TiposGestoresPropiedadesComponent
      },
      {
        path: 'roles',
        component: RolComponent
      },
      {
        path: 'propietarios',
        component: PropietarioComponent
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
        path: 'configuraciones',
        component: ConfiguracionComponent
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
          { path: '', component: ListComunidadesComponent },
          // { path: ':id', component: EditUsuarioComponent },
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
