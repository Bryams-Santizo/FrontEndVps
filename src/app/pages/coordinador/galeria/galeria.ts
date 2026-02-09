import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Añadido FormsModule por si lo necesitas más adelante

// Interfaz para la imagen con su URL simulada
interface Evidencia {
  id: number;
  fileName: string;
  simulatedUrl: string; 
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria.html',
  styleUrls: ['./galeria.css']
})
export class GaleriaComponent implements OnInit {
  // Utilizamos Signals para manejar el estado de las imágenes
  evidencias: WritableSignal<Evidencia[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(false);

  // Clave de almacenamiento
  private STORAGE_KEY = 'project_evidences';
  
  // Contador para asignar IDs únicos, importante para la eliminación
  private nextId = 0;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.cargarEvidencias();
    }
  }

  // --- Lógica de Persistencia (LocalStorage) ---
  
  cargarEvidencias() {
    this.isLoading.set(true);
    if (typeof window !== 'undefined') {
      const storedEvidences = localStorage.getItem(this.STORAGE_KEY);
      if (storedEvidences) {
        const data: Evidencia[] = JSON.parse(storedEvidences);
        this.evidencias.set(data);
        // Aseguramos que el nextId sea mayor que el ID máximo existente
        if (data.length > 0) {
          this.nextId = Math.max(...data.map(e => e.id)) + 1;
        }
      }
    }
    this.isLoading.set(false);
  }

  guardarEvidencias() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.evidencias()));
    }
  }

  // --- Lógica de Subida y Manejo de Archivos ---

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.isLoading.set(true);
      
      const newEvidences: Evidencia[] = [];
      const filesArray = Array.from(input.files);

      filesArray.forEach(file => {
        // SIMULACIÓN: Crea una URL de placeholder con el nombre del archivo
        const placeholderUrl = `https://placehold.co/400x300/0D3B66/ffffff?text=${file.name.substring(0, 10) + '...'}\\nEVIDENCIA+DE+PROYECTO`;
        
        newEvidences.push({
          id: this.nextId++,
          fileName: file.name,
          simulatedUrl: placeholderUrl
        });
      });
      
      // Actualizar el estado y guardar
      this.evidencias.update(currentEvidences => [...currentEvidences, ...newEvidences]);
      this.guardarEvidencias();
      
      // Limpiar el input
      input.value = '';
      this.isLoading.set(false);
    }
  }

  eliminarEvidencia(id: number) {
    if (typeof window === 'undefined') return;
    if (confirm('¿Estás seguro de que quieres eliminar esta evidencia?')) {
      this.evidencias.update(currentEvidences => 
        currentEvidences.filter(e => e.id !== id)
      );
      this.guardarEvidencias();
      alert(`Evidencia eliminada.`);
    }
  }
}