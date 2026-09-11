import { ConservacionComponent } from './conservacion.component';
import { ConservacionService } from '../../../services/conservacion.service';
import { Conservacion } from '../../../models/conservacion';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('ConservacionComponent', () => {
  ejecutarSuiteListadoCrud<ConservacionComponent, Conservacion>({
    component: ConservacionComponent,
    service: ConservacionService,
    crearMocks: () => [
      { id: 1, nombre: 'Buen estado', descripcion: 'Sin incidencias', activo: true },
      { id: 2, nombre: 'Regular', descripcion: 'Con desperfectos', activo: false }
    ],
    propiedadListado: 'conservaciones',
    propiedadSeleccionado: 'conservacion',
    filtroNombre: 'Buen',
    datosNuevo: { nombre: 'Nueva conservación', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'Buen estado renombrado', activo: true }
  });
});
