import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PropietarioComponent } from './propietario.component';
import { PropietarioService } from '../../../services/propietario.service';
import { DialogService } from '../../../services/dialog.service';
import { Propietario } from '../../../models/propietario';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { ejecutarSuiteListadoCrud } from '../../../testing/crud-listado.suite';

describe('PropietarioComponent', () => {
  ejecutarSuiteListadoCrud<PropietarioComponent, Propietario>({
    component: PropietarioComponent,
    service: PropietarioService,
    metodosServicio: ['getAll', 'get', 'cambiarEstado', 'cambiarVisible', 'borrarRegistro', 'addRegistro', 'updateRegistro'],
    crearMocks: () => [
      { id: 1, nombre: 'Ayuntamiento', descripcion: 'Público', visible: true, activo: true },
      { id: 2, nombre: 'Diputación', descripcion: 'Público', visible: false, activo: false }
    ],
    propiedadListado: 'propietarios',
    propiedadSeleccionado: 'propietario',
    filtroNombre: 'Ayunt',
    datosNuevo: { nombre: 'Nuevo propietario', descripcion: 'desc', visible: true, activo: true },
    datosActualizado: { id: 1, nombre: 'Ayuntamiento renombrado', visible: true, activo: true }
  });

  describe('cambiarVisible()', () => {
    let component: PropietarioComponent;
    let fixture: ComponentFixture<PropietarioComponent>;
    let serviceSpy: jasmine.SpyObj<PropietarioService>;

    const propietariosMock: Propietario[] = [
      { id: 1, nombre: 'Ayuntamiento', descripcion: 'Público', visible: true, activo: true },
      { id: 2, nombre: 'Diputación', descripcion: 'Público', visible: false, activo: false }
    ];

    const respuesta = (data: any): ApiResponseWrapper<any> => ({ message: '', data, success: true, fieldErrors: null });

    beforeEach(async () => {
      TestBed.resetTestingModule();
      serviceSpy = jasmine.createSpyObj('PropietarioService', [
        'getAll', 'get', 'cambiarEstado', 'cambiarVisible', 'borrarRegistro', 'addRegistro', 'updateRegistro'
      ]);
      serviceSpy.getAll.and.returnValue(of(respuesta(propietariosMock)));

      await TestBed.configureTestingModule({
        imports: [PropietarioComponent],
        providers: [
          { provide: PropietarioService, useValue: serviceSpy },
          { provide: DialogService, useValue: jasmine.createSpyObj('DialogService', ['confirmar']) },
          MessageService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(PropietarioComponent);
      component = fixture.componentInstance;
    });

    it('invierte la visibilidad del propietario afectado', () => {
      fixture.detectChanges();
      serviceSpy.cambiarVisible.and.returnValue(of(respuesta(true)));

      component.cambiarVisible(1);

      expect(serviceSpy.cambiarVisible).toHaveBeenCalledWith(1);
      expect(component.propietarios.find(p => p.id === 1)?.visible).toBeFalse();
    });

    it('notifica error si falla', () => {
      fixture.detectChanges();
      serviceSpy.cambiarVisible.and.returnValue(throwError(() => new Error('fallo')));

      component.cambiarVisible(1);

      expect(component.cargando).toBeFalse();
    });
  });
});
