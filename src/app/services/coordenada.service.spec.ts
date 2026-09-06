import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CoordenadaService } from './coordenada.service';
import { Coordenada } from '../models/coordenada';
import { AUTH } from '../auth/auth.constants';

describe('CoordenadaService', () => {
  let service: CoordenadaService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/geoposiciones`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(CoordenadaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('get() hace GET a /{id}', () => {
    service.get('7').subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('updateRegistro() hace PUT a /{id} con los datos en el body', () => {
    const datos: Coordenada = {
      id: 7,
      gradosLatitud: '40',
      minutosLatitud: '25',
      segundosLatitud: '10',
      gradosLongitud: '3',
      minutosLongitud: '42',
      segundosLongitud: '5',
      altitud: '650'
    };

    service.updateRegistro('7', datos).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
