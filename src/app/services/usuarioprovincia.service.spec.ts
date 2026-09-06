import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioProvinciaService } from './usuarioprovincia.service';
import { AUTH } from '../auth/auth.constants';

describe('UsuarioProvinciaService', () => {
  let service: UsuarioProvinciaService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/usuarios-provincias`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(UsuarioProvinciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getByUsuario() hace GET a /usuario/{usuarioId}', () => {
    service.getByUsuario(1).subscribe();

    const req = httpMock.expectOne(`${api}/usuario/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('asignarProvincias() hace POST a la URL base con usuarioId y provinciaIds en el body', () => {
    service.asignarProvincias(1, [2, 3]).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ usuarioId: 1, provinciaIds: [2, 3] });
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
