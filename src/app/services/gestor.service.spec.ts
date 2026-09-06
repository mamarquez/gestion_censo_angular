import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GestorService } from './gestor.service';
import { Gestor } from '../models/gestor';
import { AUTH } from '../auth/auth.constants';

describe('GestorService', () => {
  let service: GestorService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/gestores`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(GestorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ nombre: 'Ayuntamiento' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('nombre')).toBe('Ayuntamiento');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get('7').subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('addRegistro() hace POST con el gestor en el body', () => {
    const datos = {
      nombre: 'Ayuntamiento',
      descripcion: 'Gestor municipal',
      activo: true
    } as Gestor;

    service.addRegistro(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('updateRegistro() hace PUT a /{id} con los datos en el body', () => {
    const datos = {
      id: 7,
      nombre: 'Ayuntamiento',
      descripcion: 'Gestor municipal',
      activo: true
    } as Gestor;

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
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
