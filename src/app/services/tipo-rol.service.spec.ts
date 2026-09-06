import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TipoRolService } from './tipo-rol.service';
import { AUTH } from '../auth/auth.constants';

describe('TipoRolService', () => {
  let service: TipoRolService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/roles-tipos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TipoRolService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base', () => {
    service.getAll().subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });
});
