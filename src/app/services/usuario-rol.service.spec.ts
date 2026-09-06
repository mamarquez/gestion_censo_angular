import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from './usuario-rol.service';
import { RolesUsuarioModel } from '../models/roles-usuario-model';
import { AUTH } from '../auth/auth.constants';

describe('UsuarioService (usuario-rol.service)', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/usuarios-roles`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ idUsuario: '1' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('idUsuario')).toBe('1');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get('1').subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('update() hace PUT a /{id} con los datos en el body', () => {
    const usuario: RolesUsuarioModel = {
      idUsuario: 1,
      idRol: 2,
      roles: []
    };

    service.update('1', usuario).subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(usuario);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado('1').subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro('1').subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
