import { ConfiguracionComponent } from './configuraciones.component';
import { ConfiguracionService } from '../../../services/configuracion.service';
import { Configuracion } from '../../../models/configuracion';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('ConfiguracionComponent', () => {
  ejecutarSuiteListadoCrud<ConfiguracionComponent, Configuracion>({
    component: ConfiguracionComponent,
    service: ConfiguracionService,
    crearMocks: () => [
      { id: 1, nombre: 'Máx. tamaño fichero', descripcion: 1, valor: '10', activo: true },
      { id: 2, nombre: 'Correo remitente', descripcion: 2, valor: 'no-reply@x.com', activo: false }
    ],
    propiedadListado: 'configuraciones',
    propiedadSeleccionado: 'configuracion',
    filtroNombre: 'Máx',
    datosNuevo: { nombre: 'Nueva config', descripcion: 1, valor: '1', activo: true } as any,
    datosActualizado: { id: 1, nombre: 'Renombrada', valor: '10', activo: true } as any
  });
});
