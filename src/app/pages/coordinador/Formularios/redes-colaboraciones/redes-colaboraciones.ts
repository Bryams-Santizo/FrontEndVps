import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ColaboracionService } from '../../../../services/colaboracion.service';

export interface IRedColaboracion {
  id?: number; 
  institucionSolicitante: string;
  tipoColaboracion: string;
  especificacionOtroTipo?: string;
  descripcionNecesidad: string;
  numeroEstudiantes: string;
  perfilCompetencias: string;
  duracion: string;
  beneficios: string;
  personaContacto: string;
  documentosAdjuntos: string;
  cartaIntencion: string;      
  estado: string;
}

@Component({
  selector: 'app-redes-colaboraciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './redes-colaboraciones.html',
  styleUrls: ['./redes-colaboraciones.css']
})
export class RedesColaboracionesComponent implements OnInit {

  documentoArchivo: File | null = null;
  cartaArchivo: File | null = null;

  listaColaboraciones: any[] = [];
  editandoId: number | null = null;

  colaboracion: IRedColaboracion = this.inicializarColaboracion();

  tiposColaboracion: string[] = [
    'Servicio social',
    'Residencias profesionales',
    'Proyecto NODES',
    'Proyecto dual',
    'Investigación conjunta',
    'Otro'
  ];

  constructor(private colaboracionService: ColaboracionService) {}

  ngOnInit(): void {
    this.cargarColaboraciones();
  }

  get mostrarOtroTipo(): boolean {
    return this.colaboracion.tipoColaboracion === 'Otro' || 
           (!!this.colaboracion.tipoColaboracion && !this.tiposColaboracion.includes(this.colaboracion.tipoColaboracion) && this.colaboracion.tipoColaboracion !== '');
  }

  cargarColaboraciones(): void {
    this.colaboracionService.getColaboraciones().subscribe({
      next: (data) => this.listaColaboraciones = data,
      error: (err) => console.error('Error al cargar datos', err)
    });
  }

  onFileChange(event: any, field: 'documentosAdjuntos' | 'cartaIntencion'): void {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length > 0) {
        const file = target.files[0];
        
        if (field === 'documentosAdjuntos') {
          this.documentoArchivo = file;
        } else if (field === 'cartaIntencion') {
          this.cartaArchivo = file;
        }
        // Solo actualizamos el nombre visual si se sube un archivo nuevo
        this.colaboracion[field] = file.name;
    }
  }

  guardarDatos(): void {
    // 1. Clonamos el objeto para no afectar la vista
    const datosParaEnviar = { ...this.colaboracion };
    
    // 2. ELIMINAMOS los campos que el Backend no conoce
    delete (datosParaEnviar as any).imagenUrl;
    delete (datosParaEnviar as any).documentoUrl;
    delete (datosParaEnviar as any).cartaUrl;

    // ... lógica del "Otro" tipo de colaboración ...
    if (this.mostrarOtroTipo && this.colaboracion.especificacionOtroTipo) {
        datosParaEnviar.tipoColaboracion = this.colaboracion.especificacionOtroTipo;
    }
    delete (datosParaEnviar as any).especificacionOtroTipo;

    const formData = new FormData();
    // 3. Enviamos el objeto LIMPIO
    formData.append('colaboracion', JSON.stringify(datosParaEnviar)); 
    
    if (this.documentoArchivo) formData.append('fileDocumento', this.documentoArchivo);
    if (this.cartaArchivo) formData.append('fileCarta', this.cartaArchivo);

    if (this.editandoId) {
      // Usamos un nuevo método del servicio que acepta FormData
      this.colaboracionService.actualizarColaboracionFormData(this.editandoId, formData).subscribe({
        next: () => {
          alert('¡Actualizado con éxito!');
          this.limpiarFormulario();
          this.cargarColaboraciones(); 
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar la información.');
        }
      });
    } else {
      this.colaboracionService.crearColaboracionFormData(formData).subscribe({
        next: () => {
          alert('¡Guardado con éxito!');
          this.limpiarFormulario();
          this.cargarColaboraciones(); 
        },
        error: (err) => {
          console.error(err);
          alert('Error al subir la información.');
        }
      });
    }
  }

  editarColaboracion(item: any): void {
    this.editandoId = item.id;
    this.colaboracion = { ...item };
    
    if (!this.tiposColaboracion.includes(item.tipoColaboracion)) {
      this.colaboracion.especificacionOtroTipo = item.tipoColaboracion;
      this.colaboracion.tipoColaboracion = 'Otro';
    }
    
    // Al editar, la ventana se desplaza hacia arriba para que el usuario vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // NUEVO: Método para el botón cancelar
  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  eliminarColaboracion(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.colaboracionService.eliminarColaboracion(id).subscribe({
        next: () => {
          alert('Registro eliminado');
          this.cargarColaboraciones();
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar');
        }
      });
    }
  }

  limpiarFormulario() {
    this.colaboracion = this.inicializarColaboracion();
    this.editandoId = null;
    this.documentoArchivo = null;
    this.cartaArchivo = null;
  }

  private inicializarColaboracion(): IRedColaboracion {
    return {
      institucionSolicitante: '', tipoColaboracion: '', especificacionOtroTipo: '',
      descripcionNecesidad: '', numeroEstudiantes: '', perfilCompetencias: '',
      duracion: '', beneficios: '', personaContacto: '', documentosAdjuntos: '',
      cartaIntencion: '', estado: ''
    };
  }
}
