import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectComunidadComponent } from './select-comunidad.component';
import { ComunidadautonomaService } from '../../services/comunidadautonoma.service';
import { ComunidadAutonoma } from '../../models/comunidadautonoma';

describe('SelectComunidadComponent', () => {
  let component: SelectComunidadComponent;
  let fixture: ComponentFixture<SelectComunidadComponent>;
  let serviceSpy: jasmine.SpyObj<ComunidadautonomaService>;

  const comunidadesMock: ComunidadAutonoma[] = [
    { id: 1, nombre: 'Andalucía', activo: true } as ComunidadAutonoma
  ];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ComunidadautonomaService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: comunidadesMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectComunidadComponent],
      providers: [{ provide: ComunidadautonomaService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComunidadComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga las comunidades al iniciar', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    expect(component.comunidades()).toEqual(comunidadesMock);
    expect(component.cargandoComunidades()).toBeFalse();
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargandoComunidades()).toBeFalse();
    expect(component.comunidades()).toEqual([]);
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
    component.writeValue(5);
    expect(component.value).toBe(5);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
