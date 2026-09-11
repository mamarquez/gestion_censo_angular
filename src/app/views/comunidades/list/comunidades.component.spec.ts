import { ListComunidadesComponent } from './comunidades.component';
import { ComunidadautonomaService } from '../../../services/comunidadautonoma.service';
import { ComunidadAutonoma } from '../../../models/comunidadautonoma';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('ListComunidadesComponent', () => {
  ejecutarSuiteListadoCrud<ListComunidadesComponent, ComunidadAutonoma>({
    component: ListComunidadesComponent,
    service: ComunidadautonomaService,
    crearMocks: () => [
      { id: 1, codigo: '01', nombre: 'Andalucía', activo: true },
      { id: 2, codigo: '09', nombre: 'Cataluña', activo: false }
    ],
    propiedadListado: 'comunidades',
    propiedadSeleccionado: 'comunidad',
    filtroNombre: 'Andal',
    datosNuevo: { codigo: '12', nombre: 'Galicia', activo: true },
    datosActualizado: { id: 1, nombre: 'Andalucía renombrada', activo: true }
  });
});
