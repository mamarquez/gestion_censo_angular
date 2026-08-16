import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { Coordenada } from '../models/coordenada';

@Injectable({
  providedIn: 'root'
})
export class CoordenadaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/geoposiciones`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener registro
   */
  get(id: string): Observable<ApiResponseWrapper<Coordenada>> {
    return this.http.get<ApiResponseWrapper<Coordenada>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Actualizar registro
   * @param datos
   */
  updateRegistro(id: string, datos: Coordenada): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, datos, { headers: this.headers });
  }

}
