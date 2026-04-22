import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';

@Injectable({ providedIn: 'root' })
export class TrazabilidadService {

  private apiUrl = API_BASE; // o `${API_BASE}`

  constructor(private http: HttpClient) {}

  guardarProductor(productor: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productores`, productor);
  }

  obtenerCertificaciones(mercado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/certificaciones/mercado/${mercado}`);
  }

  calcularEvaluacion(
    productorId: number,
    certificacionId: number,
    aciertos: number,
    total: number,
    recomendaciones: string
  ): Observable<any> {
    const url = `${this.apiUrl}/evaluaciones/calcular`;

    const body = { productorId, certificacionId, aciertos, total, recomendaciones };
    return this.http.post(url, body);
  }

  descargarPdf(evaluacionId: number) {
    window.open(`${this.apiUrl}/evaluaciones/${evaluacionId}/pdf`, '_blank');
  }
}
