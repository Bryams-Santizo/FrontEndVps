import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 
import { EventoService, IEventoVisualizacion } from '../../../../services/eventos.service';
import { API_BASE } from '../../../../config/api-base';

export interface IEvento {
  nombreEvento: string;
  tipo: string;
  fechaHorario: string;
  sede: string;
  organizador: string;
  objetivo: string;
  publicoObjetivo: string;
  programa: string;
  ponentes: string;
  requisitos: string;
  materiales: string;
  enlaceExterno: string | null;
}

interface EventoResponse {
  id_evento?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], 
  templateUrl: './eventos.html',
  styleUrls: ['./eventos.css']
})
export class EventosComponent implements OnInit {

  // Base para archivos estáticos (uploads)
  URL_ARCHIVOS: string = '';

  // --- Listado y Modal ---
  listaEventos: IEventoVisualizacion[] = [];
  eventoEnEdicion: IEventoVisualizacion | null = null;
  mostrarModalEdit = false;

  evento: IEvento = {
    nombreEvento: '',
    tipo: '',
    fechaHorario: '',
    sede: '',
    organizador: '',
    objetivo: '',
    publicoObjetivo: '',
    programa: '',
    ponentes: '',
    requisitos: '',
    materiales: '',
    enlaceExterno: null
  };

  archivoImagen: File | null = null;
  archivoDocumento: File | null = null; 

  tiposEvento: string[] = ['Taller', 'Congreso', 'Foro', 'Expo', 'Seminario', 'Curso', 'Convenio'];

  constructor(
    private eventoService: EventoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  
  ngOnInit(): void {
    const origin = isPlatformBrowser(this.platformId) ? window.location.origin : API_BASE.replace('/api', '');
    this.URL_ARCHIVOS = `${origin}/uploads/`;

    if (isPlatformBrowser(this.platformId)) {
      this.cargarEventos();
    }
  }

  cargarEventos(): void {
    this.eventoService.listarTodos().subscribe({
      next: (data) => this.listaEventos = data || [],
      error: (err) => console.error('Error al cargar eventos:', err)
    });
  }

  seleccionarImagen(event: any) {
    this.archivoImagen = event.target.files[0] || null;
  }
  
  seleccionarDocumento(event: any) {
    this.archivoDocumento = event.target.files[0] || null;
  }

  // Método para evitar el desfase de un día en los inputs de tipo date
  formatearFechaParaInput(fecha: string | null): string {
    if (!fecha) return '';
    // Extrae solo YYYY-MM-DD
    return fecha.split('T')[0];
  }

guardarEvento(): void {
    if (!this.evento.nombreEvento || !this.evento.tipo) {
        alert('Por favor, complete los campos Nombre y Tipo.');
        return;
    }
    
    const formData = new FormData();
    if (this.archivoImagen) formData.append('imagen', this.archivoImagen, this.archivoImagen.name);
    if (this.archivoDocumento) formData.append('documento', this.archivoDocumento, this.archivoDocumento.name);

    // FIX FECHA: Añadimos la hora al mediodía para evitar el salto de día por Timezone
    const fechaCorregida = this.evento.fechaHorario + 'T12:00:00';

    const metadataEvento = {
        nombre: this.evento.nombreEvento,
        tipo: this.evento.tipo,
        fechaInicio: fechaCorregida, 
        fechaFin: fechaCorregida,    
        lugar: this.evento.sede,               
        organizador: this.evento.organizador,
        objetivo: this.evento.objetivo,
        publicoObjetivo: this.evento.publicoObjetivo,
        programa: this.evento.programa,
        ponentes: this.evento.ponentes,
        requisitos: this.evento.requisitos,
        materiales: this.evento.materiales,
        enlaceExterno: this.evento.enlaceExterno 
    };

    formData.append('evento', new Blob([JSON.stringify(metadataEvento)], { type: 'application/json' }));

    this.eventoService.crearEvento(formData).subscribe({
      next: () => {
        alert(`Evento creado exitosamente`);
        this.cargarEventos();
        this.limpiarFormulario();
      },
      error: (error) => console.error('Error:', error)
    });
}

  // --- MÉTODOS CRUD ADICIONALES ---

  abrirModalEdicion(ev: IEventoVisualizacion): void {
    // Clonamos el objeto para no modificar la tabla directamente
    this.eventoEnEdicion = { ...ev };

    // Corregimos las fechas para que el input date las reconozca sin desfase
    if (this.eventoEnEdicion.fechaInicio) {
        this.eventoEnEdicion.fechaInicio = this.formatearFechaParaInput(this.eventoEnEdicion.fechaInicio);
    }
    if (this.eventoEnEdicion.fechaFin) {
        this.eventoEnEdicion.fechaFin = this.formatearFechaParaInput(this.eventoEnEdicion.fechaFin);
    }

    this.archivoImagen = null;
    this.archivoDocumento = null;
    this.mostrarModalEdit = true;
  }

  cerrarModal(): void {
    this.mostrarModalEdit = false;
    this.eventoEnEdicion = null;
  }

  actualizarEventoTodo(): void {
  if (!this.eventoEnEdicion || !this.eventoEnEdicion.id_evento) return;

  const formData = new FormData();

  // Solo enviar archivos si se seleccionaron nuevos
  if (this.archivoImagen) {
    formData.append('imagen', this.archivoImagen);
  }
  if (this.archivoDocumento) {
    formData.append('documento', this.archivoDocumento);
  }

  // 🔐 PRESERVAR ARCHIVOS EXISTENTES
  const eventoParaEnviar = {
    ...this.eventoEnEdicion,
    rutaImagen: this.eventoEnEdicion.rutaImagen,
    rutaEvidencia: this.eventoEnEdicion.rutaEvidencia
  };

  // Fix fecha
  if (eventoParaEnviar.fechaInicio && !eventoParaEnviar.fechaInicio.includes('T')) {
    eventoParaEnviar.fechaInicio += 'T12:00:00';
  }
  if (!eventoParaEnviar.fechaFin) {
    eventoParaEnviar.fechaFin = eventoParaEnviar.fechaInicio;
  }

  formData.append(
    'evento',
    new Blob([JSON.stringify(eventoParaEnviar)], { type: 'application/json' })
  );

  this.eventoService.actualizarEventoFormData(
    eventoParaEnviar.id_evento,
    formData
  ).subscribe({
    next: () => {
      alert('Evento actualizado correctamente');
      this.cargarEventos();
      this.cerrarModal();
    },
    error: () => alert('Error al actualizar el evento')
  });
}

  eliminarEvento(id: number): void {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm('¿Está seguro de eliminar este evento permanentemente?')) {
        this.eventoService.eliminarEvento(id).subscribe({
          next: () => {
            alert('Evento eliminado');
            this.cargarEventos();
          },
          error: (err) => console.error(err)
        });
      }
    }
  }

  limpiarFormulario(): void {
    this.evento = {
      nombreEvento: '', tipo: '', fechaHorario: '', sede: '',
      organizador: '', objetivo: '', publicoObjetivo: '',
      programa: '', ponentes: '', requisitos: '', materiales: '',
      enlaceExterno: null
    };
    this.archivoImagen = null;
    this.archivoDocumento = null;
    
    // Limpiar inputs de archivo en el DOM manualmente
    if (isPlatformBrowser(this.platformId)) {
      const inputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      inputs.forEach(input => input.value = '');
    }
  }
}