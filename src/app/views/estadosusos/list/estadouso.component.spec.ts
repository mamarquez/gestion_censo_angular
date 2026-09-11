import { EstadoUsoComponent } from './estadouso.component';
import { EstadoUsoService } from '../../../services/estadouso.service';
import { EstadoUso } from '../../../models/estadouso';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('EstadoUsoComponent', () => {
  ejecutarSuiteListadoCrud<EstadoUsoComponent, EstadoUso>({
    component: EstadoUsoComponent,
    service: EstadoUsoService,
    crearMocks: () => [
      { id: 1, nombre: 'En uso', descripcion: 'Uso habitual', activo: true },
      { id: 2, nombre: 'Fuera de servicio', descripcion: 'No operativo', activo: false }
    ],
    propiedadListado: 'estadosUsos',
    propiedadSeleccionado: 'estadoUso',
    filtroNombre: 'En uso',
    datosNuevo: { nombre: 'Nuevo estado', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'En uso renombrado', activo: true }
  });
});
