import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectDeportivoComponent } from './select-deportivo.component';
import { TipoInstalacionService } from '../../services/tipo-instalacion.service';
import { TipoInstalacion } from '../../models/tipo-instalacion';

describe('SelectDeportivoComponent', () => {
  let component: SelectDeportivoComponent;
  let fixture: ComponentFixture<SelectDeportivoComponent>;
  let serviceSpy: jasmine.SpyObj<TipoInstalacionService>;

  const tiposMock: TipoInstalacion[] = [{ id: 1, nombre: 'Pista de pádel', activo: true } as TipoInstalacion];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('TipoInstalacionService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: tiposMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectDeportivoComponent],
      providers: [{ provide: TipoInstalacionService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectDeportivoComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga los tipos de instalación al iniciar', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    expect(component.tiposInstalaciones()).toEqual(tiposMock);
    expect(component.cargando()).toBeFalse();
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.tiposInstalaciones()).toEqual([]);
  });

  it('seleccionar() actualiza value y notifica onChange/onTouched', () => {
    fixture.detectChanges();

    const onChange = jasmine.createSpy('onChange');
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.seleccionar({ value: 3 });

    expect(component.value).toBe(3);
    expect(onChange).toHaveBeenCalledWith(3);
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue() asigna el valor recibido', () => {
    fixture.detectChanges();
    component.writeValue(2);
    expect(component.value).toBe(2);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
