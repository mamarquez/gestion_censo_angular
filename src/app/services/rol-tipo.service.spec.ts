import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RolTipoService } from './rol-tipo.service';
import { AUTH } from '../auth/auth.constants';

describe('RolTipoService', () => {
  let service: RolTipoService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/usuarios-roles`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(RolTipoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('asignarRoles() hace POST a la URL base con usuarioId y rolesIds en el body', () => {
    service.asignarRoles(1, [2, 3]).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ usuarioId: 1, rolesIds: [2, 3] });
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
