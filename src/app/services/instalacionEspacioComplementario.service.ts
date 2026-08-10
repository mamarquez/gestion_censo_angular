import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { InstalacionEspacioComplementario } from   '../models/instalacionEspacioComplementario';

@Injectable({
  providedIn: 'root'
})
export class InstalacionEspacioComplementarioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionesespacioscomplementarios`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los espacios deportivos de instalaciones
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<InstalacionEspacioComplementario[]>> {
    console.log(filtros);

    return this.http.get<ApiResponseWrapper<InstalacionEspacioComplementario[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener espacios deportivos de una instalación
   */
  get(id?: any): Observable<ApiResponseWrapper<InstalacionEspacioComplementario[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionEspacioComplementario[]>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<InstalacionEspacioComplementario>> {
    return this.http.patch<ApiResponseWrapper<InstalacionEspacioComplementario>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Cambia la visibilidad de un registro
   * @param id Id del registro
   */
  cambiarVisible(id: number): Observable<ApiResponseWrapper<InstalacionEspacioComplementario>> {
    return this.http.patch<ApiResponseWrapper<InstalacionEspacioComplementario>>(`${this.api}/visibilidad/${id}`, null, { headers: this.headers });
  }

  /**
   * Crea un nuevo espacio deportivo
   * @param espacioDeportivo Datos del espacio deportivo
   */
  crear(espacioDeportivo: Partial<InstalacionEspacioComplementario>): Observable<ApiResponseWrapper<InstalacionEspacioComplementario>> {
    return this.http.post<ApiResponseWrapper<InstalacionEspacioComplementario>>(`${this.api}`, espacioDeportivo, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<InstalacionEspacioComplementario>> {
    return this.http.delete<ApiResponseWrapper<InstalacionEspacioComplementario>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
