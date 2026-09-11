import { NivelEnergeticoComponent } from './nivelenergetico.component';
import { NivelEnergeticoService } from '../../../services/nivelenergetico.service';
import { NivelEnergetico } from '../../../models/nivelenergetico';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('NivelEnergeticoComponent', () => {
  ejecutarSuiteListadoCrud<NivelEnergeticoComponent, NivelEnergetico>({
    component: NivelEnergeticoComponent,
    service: NivelEnergeticoService,
    crearMocks: () => [
      { id: 1, nombre: 'A', descripcion: 'Eficiencia alta', activo: true },
      { id: 2, nombre: 'G', descripcion: 'Eficiencia baja', activo: false }
    ],
    propiedadListado: 'nivelesEnergeticos',
    propiedadSeleccionado: 'nivelEnergetico',
    filtroNombre: 'A',
    datosNuevo: { nombre: 'B', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'A+', activo: true }
  });
});
