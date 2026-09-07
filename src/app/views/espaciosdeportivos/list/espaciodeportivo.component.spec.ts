import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EspacioDeportivoComponent } from './espaciodeportivo.component';
import { EspacioDeportivoService } from '../../../services/espaciodeportivo.service';
import { DialogService } from '../../../services/dialog.service';
import { EspacioDeportivo } from '../../../models/espaciodeportivo';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('EspacioDeportivoComponent', () => {
  let component: EspacioDeportivoComponent;
  let fixture: ComponentFixture<EspacioDeportivoComponent>;
  let serviceSpy: jasmine.SpyObj<EspacioDeportivoService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const espacioMock: EspacioDeportivo = {
    id: 1,
    nombre: 'Pista de pádel',
    descripcion: 'Pista cubierta',
    valor: '1',
    activo: true
  };

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('EspacioDeportivoService', ['getAll', 'get', 'addRegistro', 'updateRegistro', 'cambiarEstado', 'borrarRegistro']);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);
    serviceSpy.getAll.and.returnValue(of(respuesta([espacioMock])));

    await TestBed.configureTestingModule({
      imports: [EspacioDeportivoComponent],
      providers: [
        { provide: EspacioDeportivoService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        ConfirmationService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EspacioDeportivoComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga los espacios deportivos en ngOnInit', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.espaciosDeportivos).toEqual([espacioMock]);
    expect(component.cargando).toBeFalse();
  });

  it('cargar() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('buscar() envía los filtros del formulario', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    serviceSpy.getAll.and.returnValue(of(respuesta([espacioMock])));

    component.form.patchValue({ nombre: 'Pádel' });
    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Pádel' }));
    expect(component.espaciosDeportivos).toEqual([espacioMock]);
  });

  it('buscar() deja la lista vacía si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.espaciosDeportivos).toEqual([]);
  });

  it('buscar() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.espaciosDeportivos).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Pádel' });
    serviceSpy.getAll.calls.reset();
    serviceSpy.getAll.and.returnValue(of(respuesta([])));

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() alterna el estado activo', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(espacioMock)));

    component.cambiarEstado(1);

    expect(component.espaciosDeportivos[0].activo).toBeFalse();
    expect(component.cargando).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() invoca DialogService.confirmar()', () => {
    fixture.detectChanges();

    component.confirmarBorrado(espacioMock);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
  });

  it('confirmarBorrado() borra el registro al aceptar', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(espacioMock)));
    dialogServiceSpy.confirmar.and.callFake((config: any) => config.onAccept());

    component.confirmarBorrado(espacioMock);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.espaciosDeportivos).toEqual([]);
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake((config: any) => config.onAccept());

    component.confirmarBorrado(espacioMock);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia la selección y muestra el modal', () => {
    fixture.detectChanges();

    component.abrirModal();

    expect(component.espacioDeportivo).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el registro y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(espacioMock)));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.espacioDeportivo).toEqual(espacioMock);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() no abre el modal si no hay datos', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    component.modalVisible = false;
    component.editar('1');

    expect(component.espacioDeportivo).toBeNull();
    expect(component.modalVisible).toBeFalse();
  });

  it('editar() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.editar('1');

    expect(component.cargando).toBeFalse();
  });

  it('guardar() crea un registro nuevo cuando no hay id', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ nombre: 'Nueva pista', descripcion: '', valor: '1', activo: true } as EspacioDeportivo);

    expect(serviceSpy.addRegistro).toHaveBeenCalled();
    expect(component.modalVisible).toBeFalse();
  });

  it('guardar() notifica error al crear si falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Nueva pista', descripcion: '', valor: '1', activo: true } as EspacioDeportivo);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() actualiza un registro existente cuando hay id', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar(espacioMock);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1 }));
    expect(component.modalVisible).toBeFalse();
  });

  it('guardar() notifica error al actualizar si falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar(espacioMock);

    expect(component.cargando).toBeFalse();
  });
});
