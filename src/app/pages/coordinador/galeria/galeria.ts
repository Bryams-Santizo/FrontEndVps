import { Component, OnInit, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaleriaService } from '../../../services/galeria.service';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria.html',
  styleUrls: ['./galeria.css']
})
export class GaleriaComponent implements OnInit {
  private galeriaService = inject(GaleriaService);
  
  evidencias = signal<any[]>([]);
  isLoading = signal(false);
  actividadInput = signal('');
  subtemaInput = signal('');
  archivoSeleccionado: File | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Agrupación automática por actividad
  evidenciasAgrupadas = computed(() => {
    const grupos: { [key: string]: any[] } = {};
    this.evidencias().forEach(ev => {
      const nombreActividad = ev.actividad || 'General';
      if (!grupos[nombreActividad]) grupos[nombreActividad] = [];
      grupos[nombreActividad].push(ev);
    });
    return grupos;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarEvidencias();
    }
  }

 cargarEvidencias() {
  this.galeriaService.listar().subscribe({
    next: (data) => {
      console.log('Datos recibidos:', data);
      this.evidencias.set(data);
    },
    error: (err) => console.error(err)
  });
}


  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  subir() {
    if (!this.archivoSeleccionado || !this.actividadInput()) {
      alert('Por favor selecciona una imagen y describe la actividad.');
      return;
    }

    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('file', this.archivoSeleccionado);

    const metadatos = {
      actividad: this.actividadInput(),
      subtema: this.subtemaInput()
    };

    formData.append('evidencia', new Blob([JSON.stringify(metadatos)], { 
      type: 'application/json' 
    }));

    this.galeriaService.crearEvidencia(formData).subscribe({
      next: (res) => {
        alert('¡Evidencia guardada!');
        this.evidencias.update(prev => [...prev, res]);
        this.limpiar();
        this.isLoading.set(false);
      },
      error: (err) => {
        alert('Error al subir: ' + err.message);
        this.isLoading.set(false);
      }
    });
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar esta evidencia?')) {
      this.galeriaService.eliminar(id).subscribe({
        next: () => this.evidencias.update(list => list.filter(e => e.id !== id))
      });
    }
  }

  limpiar() {
    this.actividadInput.set('');
    this.subtemaInput.set('');
    this.archivoSeleccionado = null;
    if (isPlatformBrowser(this.platformId)) {
      const input = document.querySelector('.file-input') as HTMLInputElement;
      if (input) input.value = '';
    }
  }
}
