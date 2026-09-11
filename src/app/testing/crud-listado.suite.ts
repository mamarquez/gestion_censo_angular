import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DialogService } from '../services/dialog.service';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';

/**
 * Forma mínima que debe cumplir el componente de listado CRUD probado por esta suite.
 * `TProp`/`TSingular` son los nombres de las propiedades plural/singular del componente
 * (p. ej. `'pavimentos'`/`'pavimento'`), tipados como keyof para mantener autocompletado.
 */
export interface ComponenteListadoCrud<T extends { id?: number; nombre?: string; activo?: boolean }> {
  form: { value: any; patchValue: (v: any) => void; reset: () => void };
  cargando: boolean;
  modalVisible: boolean;
  buscar(): void;
  limpiar(): void;
  cambiarEstado(id: number): void;
  confirmarBorrado(registro: T): void;
  abrirModal(): void;
  editar(id: string): void;
  guardar(registro: T): void;
}

export interface ServicioListadoCrudSpy<T> {
  getAll: jasmine.Spy;
  get: jasmine.Spy;
  cambiarEstado: jasmine.Spy;
  borrarRegistro: jasmine.Spy;
  addRegistro: jasmine.Spy;
  updateRegistro: jasmine.Spy;
  [key: string]: jasmine.Spy;
}

export interface ConfigSuiteListadoCrud<
  TComponent extends ComponenteListadoCrud<TModel>,
  TModel extends { id?: number; nombre?: string; activo?: boolean }
> {
  /** Clase standalone del componente listado (p. ej. `PavimentoComponent`). */
  component: new (...args: any[]) => TComponent;
  /** Clase del servicio inyectado (p. ej. `PavimentoService`). */
  service: new (...args: any[]) => any;
  /** Métodos del servicio a espiar. Por defecto los seis habituales del patrón CRUD. */
  metodosServicio?: string[];
  /** Dos registros mock; el `[0]` se usa en la mayoría de aserciones puntuales. */
  crearMocks: () => [TModel, TModel];
  /** Nombre de la propiedad plural del componente (p. ej. `'pavimentos'`). */
  propiedadListado: keyof TComponent;
  /** Nombre de la propiedad singular del componente (p. ej. `'pavimento'`). */
  propiedadSeleccionado: keyof TComponent;
  /** Texto de filtro usado en los tests de `buscar()`/`limpiar()`. */
  filtroNombre: string;
  /** Datos para crear un registro nuevo (sin id) en los tests de `guardar()`. */
  datosNuevo: Partial<TModel>;
  /** Datos para actualizar el registro `[0]` (con id) en los tests de `guardar()`. */
  datosActualizado: Partial<TModel>;
  /** Nombre singular en minúsculas usado en mensajes de log (p. ej. `'pavimento'`). */
  nombreEntidadLog?: string;
  /** Extiende/reemplaza la config por defecto de `TestBed.configureTestingModule`. */
  providersExtra?: any[];
}

const respuesta = <T>(data: T): ApiResponseWrapper<T> => ({
  message: '',
  data,
  success: true,
  fieldErrors: null
});

/**
 * Registra el bloque `describe` con la suite estándar de un listado CRUD
 * (`views/<entidad>/list`): carga inicial, buscar/limpiar, cambiarEstado,
 * confirmarBorrado, abrirModal/editar y guardar (alta y edición).
 *
 * Cubre el esqueleto común a todas las entidades simples de solo `list/`
 * (ver convención en CLAUDE.md); no sustituye specs con comportamiento propio
 * (p. ej. `cambiarVisible`), que deben añadirse en un `describe` adicional en
 * el spec concreto.
 */
export function ejecutarSuiteListadoCrud<
  TComponent extends ComponenteListadoCrud<TModel>,
  TModel extends { id?: number; nombre?: string; activo?: boolean }
>(config: ConfigSuiteListadoCrud<TComponent, TModel>): void {
  let component: TComponent;
  let fixture: ComponentFixture<TComponent>;
  let serviceSpy: ServicioListadoCrudSpy<TModel>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let mocks: [TModel, TModel];
  let primerRegistro: TModel;

  const metodos = config.metodosServicio ?? [
    'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
  ];

  beforeEach(async () => {
    mocks = config.crearMocks();
    primerRegistro = mocks[0];
    serviceSpy = jasmine.createSpyObj(config.service.name, metodos);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(mocks)));

    await TestBed.configureTestingModule({
      imports: [config.component],
      providers: config.providersExtra ?? [
        { provide: config.service, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(config.component);
    component = fixture.componentInstance;
  });

  const listado = (): TModel[] => (component as any)[config.propiedadListado];

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(listado()).toHaveSize(2);
    expect(component.cargando).toBeFalse();
  });

  it('cargar() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('buscar() aplica los filtros del formulario', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    component.form.patchValue({ nombre: config.filtroNombre });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: config.filtroNombre }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(listado()).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(listado()).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: config.filtroNombre });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo del registro afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(primerRegistro.id!);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(primerRegistro.id);
    expect(listado().find(r => r.id === primerRegistro.id)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(primerRegistro.id!);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del registro', () => {
    fixture.detectChanges();
    const registro = listado().find(r => r.id === primerRegistro.id)!;

    component.confirmarBorrado(registro);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const dialogConfig = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(dialogConfig.mensaje).toContain(primerRegistro.nombre);
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake((c: any) => c.onAccept());
    const registro = listado().find(r => r.id === primerRegistro.id)!;

    component.confirmarBorrado(registro);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(primerRegistro.id);
    expect(listado().find(r => r.id === primerRegistro.id)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake((c: any) => c.onAccept());
    const registro = listado().find(r => r.id === primerRegistro.id)!;

    component.confirmarBorrado(registro);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia el registro seleccionado y abre el modal', () => {
    fixture.detectChanges();
    (component as any)[config.propiedadSeleccionado] = primerRegistro;

    component.abrirModal();

    expect((component as any)[config.propiedadSeleccionado]).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el registro y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(primerRegistro)));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect((component as any)[config.propiedadSeleccionado]).toEqual(primerRegistro);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() no abre el modal si la respuesta no trae datos', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    component.editar('1');

    expect(component.modalVisible).toBeFalse();
  });

  it('editar() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.editar('1');

    expect(component.cargando).toBeFalse();
  });

  it('guardar() sin id llama a addRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardar(config.datosNuevo as TModel);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining(config.datosNuevo));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar(config.datosActualizado as TModel);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining(config.datosActualizado));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar(config.datosNuevo as TModel);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar(config.datosActualizado as TModel);

    expect(component.cargando).toBeFalse();
  });
}
