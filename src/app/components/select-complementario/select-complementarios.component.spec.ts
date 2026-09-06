import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectComplementariosComponent } from './select-complementarios.component';
import { EspacioComplementarioService } from '../../services/espaciocomplementario.service';
import { EspacioComplementario } from '../../models/espaciocomplementario';

describe('SelectComplementariosComponent', () => {
  let component: SelectComplementariosComponent;
  let fixture: ComponentFixture<SelectComplementariosComponent>;
  let serviceSpy: jasmine.SpyObj<EspacioComplementarioService>;

  const espaciosMock: EspacioComplementario[] = [{ id: 1, nombre: 'Vestuario', activo: true } as EspacioComplementario];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('EspacioComplementarioService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: espaciosMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectComplementariosComponent],
      providers: [{ provide: EspacioComplementarioService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComplementariosComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga los espacios complementarios al iniciar', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    expect(component.espaciosComplementarios()).toEqual(espaciosMock);
    expect(component.cargando()).toBeFalse();
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.espaciosComplementarios()).toEqual([]);
  });

  it('seleccionar() actualiza value y notifica onChange/onTouched', () => {
    fixture.detectChanges();

    const onChange = jasmine.createSpy('onChange');
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.seleccionar({ value: 7 });

    expect(component.value).toBe(7);
    expect(onChange).toHaveBeenCalledWith(7);
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue() asigna el valor recibido', () => {
    fixture.detectChanges();
    component.writeValue(8);
    expect(component.value).toBe(8);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
