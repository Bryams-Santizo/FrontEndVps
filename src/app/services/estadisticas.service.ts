import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE } from '../config/api-base';
@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  private apiUrl = `${API_BASE}/estadisticas`;

  constructor(private http: HttpClient) {}

  proyectosPorMes() {
    return this.http.get<any[]>(`${this.apiUrl}/proyectos-mes`);
  }

  participantesPorMes() {
    return this.http.get<any[]>(`${this.apiUrl}/participantes-mes`);
  }

  proyectosPorEstado() {
    return this.http.get<any[]>(`${this.apiUrl}/proyectos-estado`);
  }

  tiposProyecto() {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-proyecto`);
  }

  estadoProyectos() {
    return this.http.get<any[]>(`${this.apiUrl}/estado-proyectos`);
  }


  getTotales() {
  return this.http.get<{totalProyectos: number, totalParticipantes: number}>(`${this.apiUrl}/totales`);
}

}