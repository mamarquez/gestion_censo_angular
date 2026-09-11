import { IluminacionComponent } from './iluminacion.component';
import { IluminacionService } from '../../../services/iluminacion.service';
import { Iluminacion } from '../../../models/iluminacion';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('IluminacionComponent', () => {
  ejecutarSuiteListadoCrud<IluminacionComponent, Iluminacion>({
    component: IluminacionComponent,
    service: IluminacionService,
    crearMocks: () => [
      { id: 1, nombre: 'LED', descripcion: 'Bajo consumo', activo: true },
      { id: 2, nombre: 'Halógena', descripcion: 'Alto consumo', activo: false }
    ],
    propiedadListado: 'iluminaciones',
    propiedadSeleccionado: 'iluminacion',
    filtroNombre: 'LED',
    datosNuevo: { nombre: 'Fluorescente', descripcion: 'desc', activo: true },
    datosActualizado: { id: 1, nombre: 'LED renombrado', activo: true }
  });
});
