import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Módulo necesario para Template-Driven Forms

// ===================================
// INTERFAZ ACTUALIZADA
// Se añade el campo de 'estado' (cambiado a camelCase)
// ===================================
export interface IRedColaboracion {
  institucionSolicitante: string;
  tipoColaboracion: string;
  especificacionOtroTipo?: string; // Nuevo campo para la especificación
  descripcionNecesidad: string;
  numeroEstudiantes: string;
  perfilCompetencias: string;
  duracion: string;
  beneficios: string;
  personaContacto: string;
  documentosAdjuntos: string;
  cartaIntencion: string;
  estado: string; // <-- CORREGIDO a camelCase
}

@Component({
  selector: 'app-redes-colaboraciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './redes-colaboraciones.html',
  styleUrls: ['./redes-colaboraciones.css']
})
export class RedesColaboracionesComponent {

  // Se inicializa el nuevo campo
  colaboracion: IRedColaboracion = {
    institucionSolicitante: '',
    tipoColaboracion: '',
    especificacionOtroTipo: '', // Inicializar el campo
    descripcionNecesidad: '',
    numeroEstudiantes: '',
    perfilCompetencias: '',
    duracion: '',
    beneficios: '',
    personaContacto: '',
    documentosAdjuntos: '',
    cartaIntencion: '',
    estado: '' // <-- CORREGIDO a camelCase
  };

  tiposColaboracion: string[] = [
    'Servicio social',
    'Residencias profesionales',
    'Proyecto NODES',
    'Proyecto dual',
    'Investigación conjunta',
    'Otro' // Añadido
  ];

  // Propiedad calculada para controlar la visibilidad en el HTML
  get mostrarOtroTipo(): boolean {
    return this.colaboracion.tipoColaboracion === 'Otro';
  }

  onFileChange(event: any, field: 'documentosAdjuntos' | 'cartaIntencion'): void {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length > 0) {
      // Dado que el tipo de 'field' es solo 'documentosAdjuntos' o 'cartaIntencion',
      // forzar el tipo aquí es seguro en el contexto de Angular.
      this.colaboracion[field as keyof IRedColaboracion] = target.files[0].name;
    }
  }

  // Lógica para validar y guardar (MODIFICADO para consolidar el valor)
  guardarDatos(): void {
    const datosAEnviar: IRedColaboracion = { ...this.colaboracion };

    // 1. VALIDACIÓN BÁSICA (Asegurar que el campo de especificación no esté vacío si se seleccionó "Otro")
    if (this.mostrarOtroTipo && !datosAEnviar.especificacionOtroTipo?.trim()) {
      alert('Por favor, especifique el tipo de colaboración "Otro".');
      return;
    }

    // 2. CONSOLIDACIÓN: Si se seleccionó "Otro", usamos la especificación como valor final.
    if (this.mostrarOtroTipo && datosAEnviar.especificacionOtroTipo) {
      datosAEnviar.tipoColaboracion = datosAEnviar.especificacionOtroTipo;
    }

    // Opcional: Eliminar el campo auxiliar de la versión final
    delete (datosAEnviar as any).especificacionOtroTipo;

    console.log('=== DATOS DE COLABORACIÓN CONSOLIDADOS ===');
    console.log(datosAEnviar);
    console.log('=====================================');
    alert('Datos del módulo REDES / COLABORACIONES listos para enviar.');
  }
}
