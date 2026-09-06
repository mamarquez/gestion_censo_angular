import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuditoriaComponent } from './auditoria.component';
import { AuditoriaService } from '../../../services/auditoria.service';
import { Auditoria } from '../../../models/auditoria';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('AuditoriaComponent', () => {
  let component: AuditoriaComponent;
  let fixture: ComponentFixture<AuditoriaComponent>;
  let serviceSpy: jasmine.SpyObj<AuditoriaService>;

  const auditoriaMock: Auditoria = {
    id: 1,
    tabla: 'usuarios',
    registroId: 5,
    operacion: 'INSERT',
    usuario: { id: '2', nombre: 'Ana' } as any,
    fecha: new Date('2026-01-01'),
    valorAnterior: null as any,
    valorNuevo: {} as any,
    cambios: ''
  } as Auditoria;

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('AuditoriaService', ['getAll', 'get']);
    serviceSpy.getAll.and.returnValue(of(respuesta([auditoriaMock])));

    await TestBed.configureTestingModule({
      imports: [AuditoriaComponent],
      providers: [
        { provide: AuditoriaService, useValue: serviceSpy },
        MessageService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditoriaComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga las auditorías en ngOnInit', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.auditorias).toEqual([auditoriaMock]);
    expect(component.cargando).toBeFalse();
  });

  it('notifica error si la carga inicial falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('buscar() envía los filtros del formulario y actualiza la lista', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    serviceSpy.getAll.and.returnValue(of(respuesta([auditoriaMock])));

    component.form.patchValue({ tabla: 'usuarios' });
    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ tabla: 'usuarios' }));
    expect(component.auditorias).toEqual([auditoriaMock]);
  });

  it('buscar() deja la lista vacía si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.auditorias).toEqual([]);
  });

  it('buscar() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.auditorias).toEqual([]);
  });

  it('limpiar() resetea el formulario a operacion null y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ tabla: 'usuarios', operacion: 'INSERT' });
    serviceSpy.getAll.calls.reset();
    serviceSpy.getAll.and.returnValue(of(respuesta([])));

    component.limpiar();

    expect(component.form.value.tabla).toBeNull();
    expect(component.form.value.operacion).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('ver() carga el detalle de una auditoría y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(auditoriaMock)));

    component.ver('1');

    expect(component.mostrarModal).toBeTrue();
    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.auditoria).toEqual(auditoriaMock);
  });

  it('ver() notifica error si falla la carga del detalle', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.ver('1');

    expect(component.cargando).toBeFalse();
  });

  it('getSeverity() mapea cada operación a su severidad', () => {
    fixture.detectChanges();

    expect(component.getSeverity('INSERT')).toBe('success');
    expect(component.getSeverity('UPDATE')).toBe('warn');
    expect(component.getSeverity('DELETE')).toBe('danger');
    expect(component.getSeverity('OTRO')).toBe('secondary');
  });
});
