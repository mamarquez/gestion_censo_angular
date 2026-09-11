import { MedidaComponent } from './medida.component';
import { MedidaService } from '../../../services/medida.service';
import { Medida } from '../../../models/medida';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('MedidaComponent', () => {
  ejecutarSuiteListadoCrud<MedidaComponent, Medida>({
    component: MedidaComponent,
    service: MedidaService,
    crearMocks: () => [
      { id: 1, nombre: 'Metros cuadrados', descripcion: 'Superficie', valor: 'm2', activo: true },
      { id: 2, nombre: 'Unidades', descripcion: 'Cantidad', valor: 'ud', activo: false }
    ],
    propiedadListado: 'medidas',
    propiedadSeleccionado: 'medida',
    filtroNombre: 'Metros',
    datosNuevo: { nombre: 'Nueva medida', descripcion: 'desc', valor: 'kg', activo: true },
    datosActualizado: { id: 1, nombre: 'Metros renombrados', valor: 'm2', activo: true }
  });
});
