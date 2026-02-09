import { Component, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { API_BASE } from '../../config/api-base';

// Importaciones de Eventos
import { EventoService, IEventoVisualizacion } from '../../services/eventos.service';

// Importaciones de Proyectos
import { ProyectoService, ProyectoPublico } from '../../services/proyecto.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  encapsulation: ViewEncapsulation.Emulated,
  // OJO: si tus servicios ya tienen providedIn:'root', NO necesitas providers aquí.
  // Puedes dejarlo o quitarlo. No rompe.
  providers: [EventoService, ProyectoService]
})
export class Home implements OnInit {
  protected readonly title = signal('CafeHub');

  // ===== Eventos =====
  ultimosEventos: IEventoVisualizacion[] = [];
  cargando: boolean = true;

  // ===== Proyectos =====
  proyectos: ProyectoPublico[] = [];

  constructor(
    private router: Router,
    private eventoService: EventoService,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit(): void {
    this.cargarUltimosEventos();
    this.cargarProyectos();
  }

  navegarAFiltro(subtema: string): void {
    // Limpieza de Bootstrap (backdrop) para evitar bloqueo
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';

    this.router.navigate(['/verproyectos'], {
      queryParams: { filtro: subtema }
    });
  }

  // ====== Cargar últimos eventos ======
  cargarUltimosEventos(): void {
    this.cargando = true;

    this.eventoService.listarUltimosTres().subscribe({
      next: (eventos: IEventoVisualizacion[]) => {
        this.ultimosEventos = (eventos || []).slice(0, 3);
        this.cargando = false;
      },
      error: (err: unknown) => {
        console.error('Error cargando últimos eventos:', err);
        this.cargando = false;
      }
    });
  }

  // ====== Helpers eventos para el HTML ======
  obtenerUrlEvidencia(nombreArchivo: string): string {
    return `${API_BASE}/uploads/${nombreArchivo}`;
  } // ✅ ESTA LLAVE FALTABA Y ROMPÍA TODO

  formatearDia(fechaStr: string): string {
    if (!fechaStr) return 'XX';
    const date = new Date(fechaStr);
    // si viene ISO con TZ, esto evita corrimientos
    return date.getUTCDate().toString().padStart(2, '0');
  }

  formatearMes(fechaStr: string): string {
    if (!fechaStr) return 'Mes';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = new Date(fechaStr);
    return meses[date.getUTCMonth()];
  }

  // ====== Cargar proyectos públicos ======
  cargarProyectos(): void {
    this.proyectoService.listarProyectosPublicos().subscribe({
      next: (lista: ProyectoPublico[]) => {
        this.proyectos = lista || [];
      },
      error: (err: unknown) => {
        console.error('Error listando proyectos públicos:', err);
      }
    });
  }

  // ====== Helpers proyectos para el HTML ======
  verProyecto(p: ProyectoPublico): void {
    // Si después haces detalle, aquí navegas
    console.log('Ver Proyecto:', p?.nombre);
  }

  obtenerUrlImagen(url: string | null): string {
    return url || '/Imegenes/default_project.png';
  }

  obtenerClaseEstatus(estado: string | null | undefined): string {
    const valor = (estado || '').toLowerCase();
    if (valor.includes('curso')) return 'badge badge-encurso';
    if (valor.includes('final')) return 'badge badge-finalizado';
    if (valor.includes('cancel')) return 'badge badge-cancelado';
    return 'badge badge-default';
  }

  obtenerFondoDinamico(index: number): string {
    switch (index % 3) {
      case 0: return 'bg-primary-custom';
      case 1: return 'bg-dark';
      case 2: return 'bg-success-custom';
      default: return 'bg-secondary';
    }
  }

  downloadFile(project: ProyectoPublico): void {
    if (!project?.documentoUrl) return;

    // Si documentoUrl ya viene absoluto, no lo dupliques
    let url = project.documentoUrl;
    if (!url.startsWith('http')) {
      url = `${API_BASE}${url}`;
    }

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
  }

  previewFile(project: ProyectoPublico): void {
    if (!project?.documentoUrl) return;

    const match = project.documentoUrl.match(/\/download\/(\d+)/);
    if (!match) return;

    const mediaId = match[1];
    const url = `${API_BASE}/media/view/${mediaId}`;
    window.open(url, '_blank');
  }
}