import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

/**
 * @version 2.0.3
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
    loadComponent: () => import('./views/errors/server-error/server-error.component').then(m => m.ServerErrorComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canMatch: [authGuard],
    children: [
      {
        path: 'instalaciones',
        children: [
          { path: '', loadComponent: () => import('./views/instalaciones/list/instalaciones.component').then(m => m.ListInstalacionesComponent) },
          { path: ':id', loadComponent: () => import('./views/instalaciones/edit/editInstalacion.component').then(m => m.EditInstalacionComponent) }
        ]
      },
      {
        path: 'municipios',
        children: [
          { path: '', loadComponent: () => import('./views/municipios/list/municipio.component').then(m => m.MunicipioComponent) }
          // { path: ':id', loadComponent: () => import('./views/municipios/form/edit-municipio.component').then(m => m.EditMunicipioComponent) },
        ]
      },
      {
        path: 'usuarios',
        children: [
          { path: '', loadComponent: () => import('./views/usuarios/list/usuario.component').then(m => m.UsuarioComponent) },
          { path: 'nuevo', loadComponent: () => import('./views/usuarios/edit/edit.component').then(m => m.EditUsuarioComponent) },
          { path: 'perfil', loadComponent: () => import('./views/usuarios/perfil/perfil.component').then(m => m.PerfilComponent) },
          { path: ':id', loadComponent: () => import('./views/usuarios/edit/edit.component').then(m => m.EditUsuarioComponent) }
        ]
      },
      {
        path: 'menus',
        loadComponent: () => import('./views/menus/list/menu.component').then(m => m.MenuComponent)
      },
      {
        path: 'provincias',
        loadComponent: () => import('./views/provincias/list/provincia.component').then(m => m.ListProvinciaComponent)
      },
      {
        path: 'tiposgestorespropiedades',
        loadComponent: () => import('./views/tiposgestorespropiedades/list/tiposgestorespropiedades.component').then(m => m.TiposGestoresPropiedadesComponent)
      },
      {
        path: 'roles',
        children: [
          { path: '', loadComponent: () => import('./views/roles/list/rol.component').then(m => m.RolComponent) },
          { path: 'nuevo', loadComponent: () => import('./views/roles/form/rol-form.component').then(m => m.RolFormComponent) },
          { path: ':id', loadComponent: () => import('./views/roles/form/rol-form.component').then(m => m.RolFormComponent) }
        ]
      },
      {
        path: 'propietarios',
        loadComponent: () => import('./views/propietarios/list/propietario.component').then(m => m.PropietarioComponent)
      },
      {
        path: 'caracteristicas',
        loadComponent: () => import('./views/caracteristicas/list/caracteristica.component').then(m => m.CaracteristicaComponent)
      },
      {
        path: 'auditorias',
        loadComponent: () => import('./views/auditorias/list/auditoria.component').then(m => m.AuditoriaComponent)
      },
      {
        path: 'pavimentos',
        loadComponent: () => import('./views/pavimentos/list/pavimento.component').then(m => m.PavimentoComponent)
      },
      {
        path: 'configuraciones',
        loadComponent: () => import('./views/configuracion/list/configuraciones.component').then(m => m.ConfiguracionComponent)
      },
      {
        path: 'medidas',
        loadComponent: () => import('./views/medidas/list/medida.component').then(m => m.MedidaComponent)
      },
      {
        path: 'actividadesdeportivas',
        loadComponent: () => import('./views/actividadesdeportivas/list/actividaddeportiva.component').then(m => m.ActividadDeportivaComponent)
      },
      {
        path: 'centroseducativos',
        loadComponent: () => import('./views/centroseducativos/list/centroeducativo.component').then(m => m.ListCentroEducativoComponent)
      },
      {
        path: 'comunidades',
        loadComponent: () => import('./views/comunidades/list/comunidades.component').then(m => m.ListComunidadesComponent)
      },
      {
        path: 'cerramientos',
        loadComponent: () => import('./views/cerramientos/list/cerramiento.component').then(m => m.CerramientoComponent)
      },
      {
        path: 'conservaciones',
        loadComponent: () => import('./views/conservaciones/list/conservacion.component').then(m => m.ConservacionComponent)
      },
      {
        path: 'nivelesenergeticos',
        loadComponent: () => import('./views/nivelesenergeticos/list/nivelenergetico.component').then(m => m.NivelEnergeticoComponent)
      },
      {
        path: 'niveleseducativos',
        loadComponent: () => import('./views/niveleseducativos/list/niveleducativo.component').then(m => m.NivelEducativoComponent)
      },
      {
        path: 'nivelesdotaciones',
        loadComponent: () => import('./views/nivelesdotaciones/list/niveldotacion.component').then(m => m.NivelDotacionComponent)
      },
      {
        path: 'iluminaciones',
        loadComponent: () => import('./views/iluminaciones/list/iluminacion.component').then(m => m.IluminacionComponent)
      },
      {
        path: 'gestores',
        loadComponent: () => import('./views/gestores/list/gestor.component').then(m => m.GestorComponent)
      },
      {
        path: 'estadosusos',
        loadComponent: () => import('./views/estadosusos/list/estadouso.component').then(m => m.EstadoUsoComponent)
      },
      {
        path: 'instalacionesespacios',
        children: [
          {
            path: ':id',
            loadComponent: () => import('./views/instalaciones/edit/tabs/deportivos/edit-espacio-deportivo/edit-instalacion-deportiva.component')
              .then(m => m.EditInstalacionDeportivaComponent)
          }
        ]
      },
      {
        path: 'instalacionesrutas',
        children: [
          { 
            path: 'nuevo', 
            loadComponent: () => import('./views/instalaciones/edit/tabs/rutas/edit-instalacion-ruta/edit-instalacion-ruta.component')
              .then(m => m.EditInstalacionRutaComponent) 
          },
          { 
            path: ':id', 
            loadComponent: () => import('./views/instalaciones/edit/tabs/rutas/edit-instalacion-ruta/edit-instalacion-ruta.component')
              .then(m => m.EditInstalacionRutaComponent) 
          }
        ]
      },
      {
        path: 'tiposinstalaciones',
        loadComponent: () => import('./views/tiposinstalaciones/tipos-instalaciones.component').then(m => m.TiposInstalacionesComponent)
      },
      {
        path: 'error/403',
        loadComponent: () => import('./views/errors/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
      },
      {
        path: 'error/500',
        loadComponent: () => import('./views/errors/server-error/server-error.component').then(m => m.ServerErrorComponent)
      },
      {
        path: 'no-encontrado',
        loadComponent: () => import('./views/errors/not-found/not-found.component').then(m => m.NotFoundComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./views/errors/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
