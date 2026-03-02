import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadService {

  // Ajusta el path base del módulo según tu backend
  private apiUrl = `${API_BASE}`;

  constructor(private http: HttpClient) { }

  // --- PRODUCTORES ---

  guardarProductor(productor: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productores`, productor);
  }

  // --- CERTIFICACIONES ---

  obtenerCertificacionesPorMercado(mercado: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/certificaciones/mercado/${encodeURIComponent(mercado)}`);
  }

  // --- EVALUACIONES ---

  /**
   * Calcula evaluación (recomendación: mandar params con HttpParams)
   */
  calcularEvaluacion(
    productorId: number,
    certificacionId: number,
    aciertos: number,
    total: number
  ): Observable<any> {

    const params = new HttpParams()
      .set('productorId', productorId)
      .set('certificacionId', certificacionId)
      .set('aciertos', aciertos)
      .set('total', total);

    return this.http.post(`${this.apiUrl}/evaluaciones/calcular`, {}, { params });
  }

  /**
   * Descarga el PDF como archivo (sin abrir pestañas)
   * Devuelve un Blob para que el componente decida cómo guardarlo.
   */
  descargarPdf(evaluacionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/evaluaciones/${evaluacionId}/pdf`, {
      responseType: 'blob'
    });
  }
}
