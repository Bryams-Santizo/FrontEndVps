import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../config/api-base';

export interface MediaFile {
  id: number;
  fileName: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
  actividad?: string;
  necesidad?: string;
  estadoProyecto?: string;
  fechaInicio?: string;
  fechaFin?: string;
  empresaVinculada?: string;
  tecnologico?: { id: number } | null;
  medias?: MediaFile[];
}

export interface ProyectoPublico {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  empresaVinculada: string;
  tecnologico: string;
  actividad: string;
  imagenUrl: string | null;
  documentoUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProyectoService {

  private apiUrl = API_BASE;                  // /api
  private proyectosUrl = `${API_BASE}/proyectos`; // /api/proyectos

  constructor(private http: HttpClient) {}

  // ---- Proyectos CRUD ----
  listarProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.proyectosUrl);
  }

  crearProyecto(proyecto: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.proyectosUrl, proyecto);
  }

  actualizarProyecto(id: number, proyecto: Proyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.proyectosUrl}/${id}`, proyecto);
  }

  eliminarProyecto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.proyectosUrl}/${id}`);
  }

  // ---- Documentos (Media) ----
  listarDocumentos(proyectoId: number): Observable<MediaFile[]> {
    return this.http.get<MediaFile[]>(`${API_BASE}/media/por-proyecto/${proyectoId}`);
  }

  subirDocumento(file: File, proyectoId: number, uploaderId: number): Observable<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('proyectoId', proyectoId.toString());
    formData.append('uploaderId', uploaderId.toString());

    return this.http.post<MediaFile>(`${API_BASE}/media/upload`, formData);
  }

  descargarDocumento(mediaId: number): Observable<Blob> {
    return this.http.get(`${API_BASE}/media/download/${mediaId}`, { responseType: 'blob' });
  }

  eliminarDocumento(mediaId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/media/${mediaId}`);
  }

  actualizarDocumento(mediaId: number, file: File): Observable<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<MediaFile>(`${API_BASE}/media/${mediaId}`, formData);
  }

  // ---- Proyectos públicos ----
  listarProyectosPublicos(): Observable<ProyectoPublico[]> {
    // ✅ Normaliza: si viene absoluta (http), se queda; si viene relativa, queda relativa
    const normaliza = (u: string | null) => {
      if (!u) return null;
      if (u.startsWith('http')) return u;
      return u.startsWith('/') ? u : `/${u}`;
    };

    return this.http
      .get<ProyectoPublico[]>(`${API_BASE}/public/proyectos`)
      .pipe(
        map(proyectos =>
          proyectos.map(p => ({
            ...p,
            imagenUrl: normaliza(p.imagenUrl),
            documentoUrl: normaliza(p.documentoUrl)
          }))
        )
      );
  }

  // /api/proyectos/latest
  listarUltimosTresProyectos(): Observable<ProyectoPublico[]> {
    return this.http.get<ProyectoPublico[]>(`${this.proyectosUrl}/latest`);
  }
}