import { NivelEducativoComponent } from './niveleducativo.component';
import { NivelEducativoService } from '../../../services/niveleducativo.service';
import { NivelEducativo } from '../../../models/niveleducativo';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('NivelEducativoComponent', () => {
  ejecutarSuiteListadoCrud<NivelEducativoComponent, NivelEducativo>({
    component: NivelEducativoComponent,
    service: NivelEducativoService,
    crearMocks: () => [
      { id: 1, nombre: 'Primaria', descripcion: 'Educación primaria', activo: true },
      { id: 2, nombre: 'Secundaria', descripcion: 'Educación secundaria', activo: false }
    ],
    propiedadListado: 'nivelesEducativos',
    propiedadSeleccionado: 'nivelEducativo',
    filtroNombre: 'Prim',
    datosNuevo: { nombre: 'Bachillerato', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'Primaria renombrada', activo: true }
  });
});
