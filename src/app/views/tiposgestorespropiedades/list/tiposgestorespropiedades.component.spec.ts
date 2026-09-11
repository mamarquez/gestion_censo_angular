import { TiposGestoresPropiedadesComponent } from './tiposgestorespropiedades.component';
import { TipoGestorPropiedadService } from '../../../services/tipogestorpropiedad.service';
import { TipoGestorPropiedad } from '../../../models/TipoGestorPropiedad';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('TiposGestoresPropiedadesComponent', () => {
  ejecutarSuiteListadoCrud<TiposGestoresPropiedadesComponent, TipoGestorPropiedad>({
    component: TiposGestoresPropiedadesComponent,
    service: TipoGestorPropiedadService,
    crearMocks: () => [
      { id: 1, nombre: 'Público', mostrar: 'Público', activo: true },
      { id: 2, nombre: 'Privado', mostrar: 'Privado', activo: false }
    ],
    propiedadListado: 'tiposGestoresPropiedades',
    propiedadSeleccionado: 'tipoGestorPropiedad',
    filtroNombre: 'Púb',
    datosNuevo: { nombre: 'Nuevo tipo', mostrar: 'Nuevo', activo: true },
    datosActualizado: { id: 1, nombre: 'Público renombrado', mostrar: 'Público', activo: true }
  });
});
