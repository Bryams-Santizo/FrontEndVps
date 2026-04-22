import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { HttpClientModule } from '@angular/common/http'; 
import { Router } from '@angular/router';

// Importaciones de Eventos
import { EventoService, IEventoVisualizacion } from '../../services/eventos.service';
// Importamos ProyectoService y la interfaz ProyectoPublico
import { ProyectoService, ProyectoPublico } from '../../services/proyecto.service'; 
import { CapacitacionService, ICapacitacion } from '../../services/capacitacion.service';
import { ColaboracionService, IColaboracion} from '../../services/colaboracion.service';

import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  //  (si tu aplicación no lo provee globalmente) y EventoService
  imports: [CommonModule, RouterLink, HttpClientModule], 
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [EventoService, ProyectoService, CapacitacionService, CapacitacionService] // Se recomienda proveer el servicio si no está en 'root'
})
export class Home implements OnInit {
  protected readonly title = signal('CafeHub');


mostrarTodoOrganizaciones = false;

colaboraciones: IColaboracion[] = [];
cargandoColaboraciones: boolean = true;
  
  // =========================================================
  // 🚩 PROPIEDADES DE ESTADO DEL EVENTO (ORIGINALES - INTACTAS)
  ultimosEventos: IEventoVisualizacion[] = [];
  cargando: boolean = true;
  // -------------------------------------

  // =========================================================
  // 🚩 PROPIEDADES PARA PROYECTOS (AÑADIDAS)
  proyectos: ProyectoPublico[] = []; 
  // -------------------------------------
capacitaciones: ICapacitacion[] = [];
  cargandoCapacitaciones: boolean = true;
  // 🚩 CONSTRUCTOR (MODIFICADO para inyectar ProyectoService)
  constructor(
    private router: Router,
    private eventoService: EventoService,
    private proyectoService: ProyectoService ,// 🚩 AÑADIDO
    private capacitacionService: CapacitacionService,
    private colaboracionservice: ColaboracionService
    ) { }

    

  ngOnInit(): void {
    this.cargarUltimosEventos();
    this.cargarProyectos(); // 🚩 CARGA DE PROYECTOS AÑADIDA
    this.cargarCapacitaciones();
    this.obtenercolaboraciones();
  }



navegarAFiltro(subtema: string) {
  // Forzamos la limpieza de Bootstrap para que no bloquee el hilo de ejecución
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
  document.body.classList.remove('modal-open');
  document.body.style.overflow = 'auto';

  // Navegamos
  this.router.navigate(['/verproyectos'], { 
    queryParams: { filtro: subtema } 
  });
}



  // 🚩 LÓGICA DE CARGA DE EVENTOS (ORIGINAL - INTACTA)
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

  // 🚩 FUNCIONES AUXILIARES PARA EL HTML (ORIGINALES - INTACTAS)
  obtenerUrlEvidencia(nombreArchivo: string): string {
    return `http://localhost:8080/uploads/${nombreArchivo}`; 
  }

  formatearDia(fechaStr: string): string {
    if (!fechaStr) return 'XX';
    // Creamos el objeto Date a partir del string
    const date = new Date(fechaStr);
    // getUTCDate() devuelve el día exacto sin importar la zona horaria local
    return date.getUTCDate().toString().padStart(2, '0');
  }

  formatearMes(fechaStr: string): string {
    if (!fechaStr) return 'Mes';
    // Usamos nombres cortos o largos según prefieras
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = new Date(fechaStr);
    // getUTCMonth() asegura obtener el mes correcto de la cadena original
    return meses[date.getUTCMonth()];
  }
    
  // =========================================================
  // 🚩 LÓGICA DE CARGA DE PROYECTOS (AÑADIDA)
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

  // =========================================================
  // 🚩 FUNCIONES AUXILIARES DE PROYECTOS (AÑADIDAS para el HTML)
  // =========================================================

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

    // Usado por [ngClass] en el HTML de proyectos
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

        let url = project.documentoUrl;
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        url = `http://${host}:8080${url}`; 
        
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
    }
    
    previewFile(project: ProyectoPublico): void {
        if (!project.documentoUrl) { return; }

        const match = project.documentoUrl.match(/\/download\/(\d+)/);
        if (!match) { return; }

        const mediaId = match[1];
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const url = `http://${host}:8080/api/media/view/${mediaId}`;

        window.open(url, '_blank');
    }


    //Capacitaciones//
    cargarCapacitaciones(): void {
    this.cargandoCapacitaciones = true;
    this.capacitacionService.getCapacitaciones().subscribe({
      next: (data) => {
        // Filtramos solo las activas y tomamos las primeras 3 para el Home
        this.capacitaciones = data.filter(c => c.activo).slice(0, 3);
        this.cargandoCapacitaciones = false;
      },
      error: (err) => {
        console.error('Error cargando capacitaciones:', err);
        this.cargandoCapacitaciones = false;
      }
    });
  }
 

  // Auxiliar para generar una fecha aleatoria futura (ya que la interfaz no tiene fecha)
  // O puedes usar un campo si lo agregas después al backend.
  obtenerFechaCurso(id: number | undefined): Date {
    const fecha = new Date();
    // Sumamos días basados en el ID para que sea determinista (siempre igual para el mismo curso)
    fecha.setDate(fecha.getDate() + ((id || 1) * 7)); 
    return fecha;
  }

  //colaboraciones//
   obtenercolaboraciones(): void {
  this.cargandoColaboraciones = true;
  this.colaboracionservice.getColaboraciones().subscribe({
    next: (lista) => {
      // Tomamos las últimas 3 para que quepan en una fila del home
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
