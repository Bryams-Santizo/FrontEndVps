import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService, Proyecto, MediaFile } from '../../../services/proyecto.service';
import { API_BASE } from '../../../config/api-base';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proyectos.html',
  styleUrls: ['./proyectos.css']
})
export class ProyectosComponent implements OnInit {
  proyectos: Proyecto[] = [];
  proyectoEnEdicion: Proyecto | null = null;
  documentos: MediaFile[] = [];
  mostrarModalDocs = false;

  // Archivos temporales para subir
  nuevaImagen: File | null = null;
  nuevoDocumento: File | null = null;

  private readonly mediaBaseUrl: string;

  constructor(
    private proyectoService: ProyectoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.mediaBaseUrl = `${API_BASE}/media`;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarProyectos();
    }
  }

  // --- CARGAS Y GETTERS ---
  cargarProyectos(): void {
    this.proyectoService.listarProyectos().subscribe({
      next: (lista) => this.proyectos = lista,
      error: (err) => console.error('Error:', err)
    });
  }

  cargarDocumentosProyecto(id: number): void {
    this.proyectoService.listarDocumentos(id).subscribe({
      next: (docs) => this.documentos = docs,
      error: (err) => console.error('Error docs:', err)
    });
  }

  get imagenes(): MediaFile[] {
    return this.documentos.filter(d => d.fileType?.startsWith('image/'));
  }

  get otrosDocumentos(): MediaFile[] {
    return this.documentos.filter(d => !d.fileType?.startsWith('image/'));
  }

  getMediaUrl(doc: MediaFile): string {
    return `${this.mediaBaseUrl}/view/${doc.id}`;
  }

  // --- FLUJO DE EDICIÓN ---
  abrirModalEdicion(p: Proyecto): void {
    this.proyectoEnEdicion = { ...p };
    this.nuevaImagen = null;
    this.nuevoDocumento = null;
    this.mostrarModalDocs = true;
    if (p.id) this.cargarDocumentosProyecto(p.id);
  }

  cerrarModalDocumentos(): void {
    this.mostrarModalDocs = false;
    this.proyectoEnEdicion = null;
    this.documentos = [];
  }

  onFileChangeNuevo(event: Event, tipo: 'imagen' | 'documento'): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      if (tipo === 'imagen') this.nuevaImagen = input.files[0];
      else this.nuevoDocumento = input.files[0];
    }
  }

  // PROCESO ÚNICO DE GUARDADO
  guardarTodo(): void {
    if (!this.proyectoEnEdicion?.id) return;

    const pId = this.proyectoEnEdicion.id;
    const uploaderId = 1; // Ajustar según usuario logueado

    // 1. Actualizar Datos
    this.proyectoService.actualizarProyecto(pId, this.proyectoEnEdicion).subscribe({
      next: () => {
        // 2. Subir imagen si se seleccionó una
        if (this.nuevaImagen) {
          this.proyectoService.subirDocumento(this.nuevaImagen, pId, uploaderId).subscribe();
        }
        // 3. Subir documento si se seleccionó uno
        if (this.nuevoDocumento) {
          this.proyectoService.subirDocumento(this.nuevoDocumento, pId, uploaderId).subscribe();
        }

        if (isPlatformBrowser(this.platformId)) {
          alert('Proyecto actualizado correctamente.');
          this.cerrarModalDocumentos();
          this.cargarProyectos();
        }
      },
      error: () => alert('Error al actualizar el proyecto.')
    });
  }

  // --- ACCIONES ADICIONALES ---
  verDocumento(doc: MediaFile): void {
    if (isPlatformBrowser(this.platformId)) {
      window.open(this.getMediaUrl(doc), '_blank');
    }
  }

  eliminarProyectoCompleto(p: Proyecto): void {
  if (isPlatformBrowser(this.platformId)) {
    if (p.id && confirm(`¿Eliminar definitivamente el proyecto "${p.nombre}"?`)) {
      
      this.proyectoService.eliminarProyecto(p.id).subscribe({
        next: () => {
          alert('Proyecto eliminado con éxito');
          // Filtramos la lista localmente para que desaparezca de la vista de inmediato
          this.proyectos = this.proyectos.filter(proj => proj.id !== p.id);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('No se pudo eliminar el proyecto.');
        }
      });

    }
  } 
 }
}