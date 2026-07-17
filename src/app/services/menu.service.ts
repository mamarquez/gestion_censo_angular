import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Menu } from '../models/menu';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  
  private readonly http = inject(HttpClient);  
  private readonly api = `${AUTH.API}/menus`;


   /**
   * Obtener menús
   */
  getAll(): Observable<ApiResponse<Menu[]>> {
    return this.http.get<ApiResponse<Menu[]>>(this.api);
  }
}