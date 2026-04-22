import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Importaciones de servicios
import { EventoService, IEventoVisualizacion } from '../../services/eventos.service';
import { ProyectoService, ProyectoPublico } from '../../services/proyecto.service';
import { CapacitacionService, ICapacitacion } from '../../services/capacitacion.service';
import { ColaboracionService, IColaboracion } from '../../services/colaboracion.service';

import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [EventoService, ProyectoService, CapacitacionService, ColaboracionService]
})
export class Home implements OnInit {
  protected readonly title = signal('CafeHub');

  mostrarTodoOrganizaciones = false;

  colaboraciones: IColaboracion[] = [];
  cargandoColaboraciones: boolean = true;

  // =========================================================
  // 🚩 PROPIEDADES DE ESTADO DEL EVENTO
  // =========================================================
  ultimosEventos: IEventoVisualizacion[] = [];
  cargando: boolean = true;

  // =========================================================
  // 🚩 PROPIEDADES PARA PROYECTOS
  // =========================================================
  proyectos: ProyectoPublico[] = [];

  // =========================================================
  // 🚩 PROPIEDADES PARA CAPACITACIONES
  // =========================================================
  capacitaciones: ICapacitacion[] = [];
  cargandoCapacitaciones: boolean = true;

  constructor(
    private router: Router,
    private eventoService: EventoService,
    private proyectoService: ProyectoService,
    private capacitacionService: CapacitacionService,
    private colaboracionservice: ColaboracionService
  ) {}

  ngOnInit(): void {
    this.cargarUltimosEventos();
    this.cargarProyectos();
    this.cargarCapacitaciones();
    this.obtenercolaboraciones();
  }

  navegarAFiltro(subtema: string) {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();

    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';

    this.router.navigate(['/verproyectos'], {
      queryParams: { filtro: subtema }
    });
  }

  // =========================================================
  // 🚩 EVENTOS
  // =========================================================
  cargarUltimosEventos(): void {
    this.cargando = true;
    this.eventoService.listarUltimosTres().subscribe({
      next: (eventos) => {
        this.ultimosEventos = eventos.slice(0, 3);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando últimos eventos:', err);
        this.cargando = false;
      }
    });
  }

  obtenerUrlEvidencia(nombreArchivo: string): string {
    return `/uploads/${nombreArchivo}`;
  }

  formatearDia(fechaStr: string): string {
    if (!fechaStr) return 'XX';
    const date = new Date(fechaStr);
    return date.getUTCDate().toString().padStart(2, '0');
  }

  formatearMes(fechaStr: string): string {
    if (!fechaStr) return 'Mes';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = new Date(fechaStr);
    return meses[date.getUTCMonth()];
  }

  // =========================================================
  // 🚩 PROYECTOS
  // =========================================================
  cargarProyectos(): void {
    this.proyectoService.listarProyectosPublicos().subscribe({
      next: (lista) => {
        this.proyectos = lista;
      },
      error: (err) => {
        console.error('Error listando proyectos públicos:', err);
      }
    });
  }

  verProyecto(p: ProyectoPublico): void {
    this.router.navigate(['/verproyectos'], {
      queryParams: { id: p.id }
    });
  }

  obtenerUrlImagen(url: string | null): string {
    return url || '/Imegenes/default_project.png';
  }

  obtenerClaseEstatus(estado: string | null | undefined): string {
    const valor = (estado || '').toLowerCase();

    if (valor.includes('curso')) {
      return 'badge badge-encurso';
    }
    if (valor.includes('final')) {
      return 'badge badge-finalizado';
    }
    if (valor.includes('cancel')) {
      return 'badge badge-cancelado';
    }

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
    if (!project.documentoUrl) return;

    const a = document.createElement('a');
    a.href = project.documentoUrl;
    a.target = '_blank';
    a.click();
  }

  previewFile(project: ProyectoPublico): void {
    if (!project.documentoUrl) return;

    const match = project.documentoUrl.match(/\/download\/(\d+)/);
    if (!match) return;

    const mediaId = match[1];
    const url = `/api/media/view/${mediaId}`;

    window.open(url, '_blank');
  }

  // =========================================================
  // 🚩 CAPACITACIONES
  // =========================================================
  cargarCapacitaciones(): void {
    this.cargandoCapacitaciones = true;
    this.capacitacionService.getCapacitaciones().subscribe({
      next: (data) => {
        this.capacitaciones = data.filter(c => c.activo).slice(0, 3);
        this.cargandoCapacitaciones = false;
      },
      error: (err) => {
        console.error('Error cargando capacitaciones:', err);
        this.cargandoCapacitaciones = false;
      }
    });
  }

  obtenerFechaCurso(id: number | undefined): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + ((id || 1) * 7));
    return fecha;
  }

  // =========================================================
  // 🚩 COLABORACIONES
  // =========================================================
  obtenercolaboraciones(): void {
    this.cargandoColaboraciones = true;
    this.colaboracionservice.getColaboraciones().subscribe({
      next: (lista) => {
        this.colaboraciones = lista.slice(0, 3);
        this.cargandoColaboraciones = false;
      },
      error: (err) => {
        console.error('Error listando colaboraciones:', err);
        this.cargandoColaboraciones = false;
      }
    });
  }

  verColaboracion() {
    this.router.navigate(['/redes']);
  }

  toggleOrganizaciones() {
    this.mostrarTodoOrganizaciones = !this.mostrarTodoOrganizaciones;
  }
}
