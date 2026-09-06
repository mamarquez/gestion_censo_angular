import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RolService } from './rol.service';
import { Rol } from '../models/rol';
import { AUTH } from '../auth/auth.constants';

describe('RolService', () => {
  let service: RolService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/roles`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(RolService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ nombre: 'A' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('nombre')).toBe('A');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('rol() hace GET a /{id}', () => {
    service.rol(1).subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('add() hace POST con los datos en el body', () => {
    const rol: Partial<Rol> = {
      nombre: 'Rol A',
      descripcion: 'Descripción',
      activo: true
    };

    service.add(rol).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(rol);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('update() hace PUT a /{id} con los datos en el body', () => {
    const rol: Partial<Rol> = {
      nombre: 'Rol A',
      descripcion: 'Descripción',
      activo: true
    };

    service.update(5, rol).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(rol);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
