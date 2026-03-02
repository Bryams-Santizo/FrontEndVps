import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadService {
  
  private baseUrl = 'http://localhost:8080/api'; 

  constructor(private http: HttpClient) { }

  
  guardarProductor(productor: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/productores`, productor);
  }

  
  obtenerCertificaciones(mercado: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/certificaciones/mercado/${mercado}`);
  }

 
  calcularEvaluacion(productorId: number, certificacionId: number, aciertos: number, total: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/evaluaciones/calcular?productorId=${productorId}&certificacionId=${certificacionId}&aciertos=${aciertos}&total=${total}`, {});
  }

  
  descargarPdf(evaluacionId: number) {
    // Abre el endpoint en una nueva pestaña para disparar la descarga directa
    window.open(`${this.baseUrl}/evaluaciones/${evaluacionId}/pdf`, '_blank');
  }
}
