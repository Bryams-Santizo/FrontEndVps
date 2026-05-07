import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';

@Injectable({
  providedIn: 'root'
})
export class SimuladorService {

  private apiUrl = `${API_BASE}/simulador/calcular`;

  constructor(private http: HttpClient) {}

  /**
   * Envía los datos del formulario al backend para procesar
   * el diagnóstico estratégico ADICAM.
   */
  calcularSimulacion(datosSim: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datosSim);
  }
}
