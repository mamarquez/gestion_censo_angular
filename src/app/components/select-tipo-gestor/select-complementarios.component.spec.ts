import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectTiposGestoresComponent } from './select-complementarios.component';
import { TipoGestorPropiedadService } from '../../services/tipogestorpropiedad.service';
import { TipoGestorPropiedad } from '../../models/TipoGestorPropiedad';

describe('SelectTiposGestoresComponent', () => {
  let component: SelectTiposGestoresComponent;
  let fixture: ComponentFixture<SelectTiposGestoresComponent>;
  let serviceSpy: jasmine.SpyObj<TipoGestorPropiedadService>;

  const tiposMock: TipoGestorPropiedad[] = [{ id: 1, nombre: 'Ayuntamiento', mostrar: 'Ayuntamiento', activo: true }];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('TipoGestorPropiedadService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: tiposMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectTiposGestoresComponent],
      providers: [{ provide: TipoGestorPropiedadService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectTiposGestoresComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga los tipos de gestor al iniciar, anteponiendo la opción "Seleccione"', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    const tipos = component.tiposGestores();
    expect(tipos).toHaveSize(2);
    expect(tipos[0].nombre).toBe('Seleccione');
    expect(tipos[1]).toEqual(tiposMock[0]);
    expect(component.cargando()).toBeFalse();
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
  });

  it('seleccionar() actualiza value y notifica onChange/onTouched', () => {
    fixture.detectChanges();

    const onChange = jasmine.createSpy('onChange');
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.seleccionar({ value: 4 });

    expect(component.value).toBe(4);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue() asigna el valor recibido', () => {
    fixture.detectChanges();
    component.writeValue(1);
    expect(component.value).toBe(1);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
