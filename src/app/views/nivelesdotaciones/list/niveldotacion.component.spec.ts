import { NivelDotacionComponent } from './niveldotacion.component';
import { NivelDotacionService } from '../../../services/nivelDotacion.service';
import { NivelDotacion } from '../../../models/niveldotacion';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('NivelDotacionComponent', () => {
  ejecutarSuiteListadoCrud<NivelDotacionComponent, NivelDotacion>({
    component: NivelDotacionComponent,
    service: NivelDotacionService,
    crearMocks: () => [
      { id: 1, nombre: 'Básico', descripcion: 'Dotación mínima', activo: true },
      { id: 2, nombre: 'Completo', descripcion: 'Dotación total', activo: false }
    ],
    propiedadListado: 'nivelesDotaciones',
    propiedadSeleccionado: 'nivelDotacion',
    filtroNombre: 'Bás',
    datosNuevo: { nombre: 'Nuevo nivel', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'Básico renombrado', activo: true }
  });
});
