import { CerramientoComponent } from './cerramiento.component';
import { CerramientoService } from '../../../services/cerramiento.service';
import { Cerramiento } from '../../../models/cerramiento';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('CerramientoComponent', () => {
  ejecutarSuiteListadoCrud<CerramientoComponent, Cerramiento>({
    component: CerramientoComponent,
    service: CerramientoService,
    crearMocks: () => [
      { id: 1, nombre: 'Vallado metálico', descripcion: 'Perimetral', activo: true },
      { id: 2, nombre: 'Muro de fábrica', descripcion: 'Perimetral', activo: false }
    ],
    propiedadListado: 'cerramientos',
    propiedadSeleccionado: 'cerramiento',
    filtroNombre: 'Vallado',
    datosNuevo: { nombre: 'Nuevo cerramiento', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'Vallado renombrado', activo: true }
  });
});
