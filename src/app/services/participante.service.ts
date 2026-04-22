// src/app/services/participante.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../config/api-base';

@Injectable({ providedIn: 'root' })
export class ParticipanteService {
  private participantesUrl = `${API_BASE}/participantes`; // /api/participantes
  private rolesUrl = `${API_BASE}/roles`;                 // /api/roles

  constructor(private http: HttpClient) {}

  // ✅ Roles
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.rolesUrl);
  }

  // ✅ Listado
  getParticipantes(): Observable<any[]> {
    return this.http.get<any[]>(this.participantesUrl);
  }

  // ✅ Registro completo (ajusta si tu backend usa otra ruta)
  registrarParticipanteCompleto(datos: any): Observable<any> {
    return this.http.post(`${this.participantesUrl}/registro-completo`, datos);
  }

  // ✅ Actualizar
  actualizarParticipante(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.participantesUrl}/${id}`, datos);
  }

  // ✅ Eliminar
  eliminarParticipante(id: number): Observable<any> {
    return this.http.delete(`${this.participantesUrl}/${id}`);
  }

  // ✅ Actividad completa
  getActividadCompleta(id: number): Observable<any> {
    return this.http.get<any>(`${this.participantesUrl}/actividad-completa/${id}`).pipe(
      map((data) => ({
        ...data,

        proyectos: (data.proyectos || []).map((p: any) => {
          let imgUrl = p.imagenUrl;
          let docUrl = p.documentoUrl;

          const listaArchivos = p.medias || p.avances || [];

          if (listaArchivos.length > 0) {
            const archivoImagen = listaArchivos.find((m: any) => m.fileType?.includes('image'));
            if (archivoImagen?.id) {
              imgUrl = `${API_BASE}/media/download/${archivoImagen.id}`;
            }

            const archivoDoc = listaArchivos.find(
              (m: any) => m.fileType?.includes('pdf') || m.url?.endsWith('.pdf')
            );

            if (archivoDoc?.id) {
              docUrl = `${API_BASE}/media/download/${archivoDoc.id}`;
            } else if (archivoDoc?.url) {
              docUrl = archivoDoc.url;
            }
          }

          // Si es absoluta, la respetamos. Si es relativa, la hacemos relativa a dominio.
          const normaliza = (u: string | null | undefined) => {
            if (!u) return null;
            if (u.startsWith('http')) return u;
            return u.startsWith('/') ? u : `/${u}`;
          };

          return {
            ...p,
            imagenUrl: normaliza(imgUrl),
            documentoUrl: normaliza(docUrl),
          };
        }),

        eventos: (data.eventos || []).map((e: any) => ({
          ...e,
          rutaImagen: e.rutaImagen ? `/uploads/${e.rutaImagen}` : null,
          rutaEvidencia: e.rutaEvidencia ? `/uploads/${e.rutaEvidencia}` : null,
        })),
      }))
    );
  }
}
