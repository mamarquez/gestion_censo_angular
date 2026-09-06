import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EspacioDeportivoService } from './espaciodeportivo.service';
import { EspacioDeportivo } from '../models/espaciodeportivo';
import { AUTH } from '../auth/auth.constants';

describe('EspacioDeportivoService', () => {
  let service: EspacioDeportivoService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/espaciosdeportivos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(EspacioDeportivoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ nombre: 'Pista de pádel' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('nombre')).toBe('Pista de pádel');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('addRegistro() hace POST con el espacio deportivo en el body', () => {
    const datos = {
      nombre: 'Pista de pádel',
      valor: 'padel',
      activo: true
    } as EspacioDeportivo;

    service.addRegistro(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('updateRegistro() hace PUT a /{id} con los datos en el body', () => {
    const datos = {
      id: 7,
      nombre: 'Pista de pádel',
      valor: 'padel',
      activo: true
    } as EspacioDeportivo;

    service.updateRegistro(datos).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });
});
