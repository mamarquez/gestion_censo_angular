import { ListCentroEducativoComponent } from './centroeducativo.component';
import { CentroEducativoService } from '../../../services/centroeducativo.service';
import { CentroEducativo } from '../../../models/centroeducativo';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('ListCentroEducativoComponent', () => {
  ejecutarSuiteListadoCrud<ListCentroEducativoComponent, CentroEducativo>({
    component: ListCentroEducativoComponent,
    service: CentroEducativoService,
    crearMocks: () => [
      { id: 1, nombre: 'CEIP San José', descripcion: 'Primaria', activo: true },
      { id: 2, nombre: 'IES Al-Ándalus', descripcion: 'Secundaria', activo: false }
    ],
    propiedadListado: 'centrosEducativos',
    propiedadSeleccionado: 'centroEducativo',
    filtroNombre: 'CEIP',
    datosNuevo: { nombre: 'Nuevo centro', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'CEIP renombrado', activo: true }
  });
});
