import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';
@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  // Ajusta esta URL según tu configuración de Spring Boot
  private apiUrl = `${API_BASE}/asistencias`;

  constructor(private http: HttpClient) { }

  // --- MÉTODOS PARA EL PÚBLICO (PRODUCTORES) ---

  /**
   * Guarda la solicitud inicial del productor. 
   * El backend le asignará automáticamente el estatus "PENDIENTE".
   */
  crearSolicitud(solicitud: any): Observable<any> {
  // Cambia /guardar por /solicitar
  return this.http.post(`${this.apiUrl}/solicitar`, solicitud);
}

  /**
   * Permite al público consultar todas las asistencias que ya fueron vinculadas
   * (Para la sección de transparencia o resultados)
   */
  listarVinculadasParaPublico(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/todas`);
  }


  // --- MÉTODOS PARA EL ADMINISTRADOR (TECNM) ---

  /**
   * Obtiene solo las solicitudes que tienen estatus "PENDIENTE"
   */
  listarPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pendientes`);
  }

  /**
   * Vincula una solicitud existente con una institución de los catálogos.
   * @param id El ID de la asistencia técnica (solicitud del productor)
   * @param datosVinculacion Objeto con institucionId, tipoInstitucion, especialistas, etc.
   */
  vincular(id: number, datosVinculacion: any): Observable<any> {
    // Usamos el endpoint que definimos en el Controller para la vinculación
    return this.http.put(`${this.apiUrl}/vincular/${id}`, datosVinculacion);
  }

  /**
   * Obtiene el detalle de una sola solicitud (opcional)
   */
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}