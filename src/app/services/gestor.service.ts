import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Gestor } from '../models/gestor';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class GestorService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/gestores`;


   /**
   * Obtener todas las gestores
   */
  getAll(): Observable<ApiResponse<Gestor[]>> {
    return this.http.get<ApiResponse<Gestor[]>>(this.api);
  }
}
