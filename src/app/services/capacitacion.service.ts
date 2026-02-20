import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';

/* ============================
   INTERFACES
============================ */

export interface ICapacitacion {
  id?: number;
  nombre: string;
  tipo: string;
  tipoOtro?: string;
  duracion: string;
  requisitos: string;
  competencias: string;
  publicoObjetivo: string;
  contenido: string;
  materiales: string;
  emisor: string;
  criteriosevaluacion: string;
  disponibilidad: string;
  costo: string;
  instructores: string;
  disponibilidadL: string;
  autorizacion?: string;
  activo: boolean;
}

export interface IInscripcion {
  id?: number;
  nombreAlumno: string;
  emailAlumno: string;
  telefonoAlumno: string;
  estado?: string;
  capacitacion: {
    id?: number;
    nombre?: string;
  };
}

export interface IDatosAceptacion {
  fechaInicio: string;
  hora: string;
  lugar: string;
  mensajeAdicional: string;
}

/* ============================
   SERVICE
============================ */

@Injectable({
  providedIn: 'root'
})
export class CapacitacionService {

  // 🔥 URLs dinámicas para producción
  private apiCapacitaciones = `${API_BASE}/capacitaciones`;
  private apiInscripciones = `${API_BASE}/inscripciones`;

  constructor(private http: HttpClient) {}

  /* ============================
     CAPACITACIONES
  ============================ */

  getCapacitaciones(): Observable<ICapacitacion[]> {
    return this.http.get<ICapacitacion[]>(this.apiCapacitaciones);
  }

  guardarCapacitacion(capacitacion: ICapacitacion): Observable<ICapacitacion> {
    return this.http.post<ICapacitacion>(this.apiCapacitaciones, capacitacion);
  }

  actualizarCapacitacion(
    id: number,
    capacitacion: ICapacitacion
  ): Observable<ICapacitacion> {
    return this.http.put<ICapacitacion>(
      `${this.apiCapacitaciones}/${id}`,
      capacitacion
    );
  }

  eliminarCapacitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiCapacitaciones}/${id}`);
  }

  /* ============================
     INSCRIPCIONES
  ============================ */

  solicitarInscripcion(inscripcion: IInscripcion): Observable<IInscripcion> {
    return this.http.post<IInscripcion>(
      this.apiInscripciones,
      inscripcion
    );
  }

  obtenerPendientes(): Observable<IInscripcion[]> {
    return this.http.get<IInscripcion[]>(
      `${this.apiInscripciones}/pendientes`
    );
  }

  aceptarInscripcion(
    id: number,
    datos: IDatosAceptacion
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiInscripciones}/${id}/aceptar`,
      datos
    );
  }
}
