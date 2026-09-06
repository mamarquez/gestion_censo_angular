import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from './usuario.service';
import { UsuarioModel } from '../models/usuario-model';
import { AUTH } from '../auth/auth.constants';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/usuarios`;

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
    service.getAll({ nombreUsuario: 'jperez' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('nombreUsuario')).toBe('jperez');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get('7').subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('add() hace POST con el usuario en el body', () => {
    const usuario: Partial<UsuarioModel> = {
      nombreUsuario: 'jperez',
      nombre: 'Juan',
      apellido1: 'Pérez',
      activo: true,
      email: 'jperez@example.com',
      roles: []
    };

    service.add(usuario).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(usuario);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('update() hace PUT a /{id} con los datos en el body', () => {
    const usuario: Partial<UsuarioModel> = {
      nombreUsuario: 'jperez',
      nombre: 'Juan',
      apellido1: 'Pérez',
      activo: true,
      email: 'jperez@example.com',
      roles: []
    };

    service.update('7', usuario).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(usuario);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('updatePerfil() hace PUT a /perfil/{id} con los datos en el body', () => {
    const datos = { nombre: 'Juan' };

    service.updatePerfil(7, datos).subscribe();

    const req = httpMock.expectOne(`${api}/perfil/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado('7').subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro('7').subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
