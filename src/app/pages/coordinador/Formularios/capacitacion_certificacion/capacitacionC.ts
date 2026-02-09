import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 1. Interfaz para definir la estructura de datos
export interface ICapacitacion {
  nombre: string;
  tipo: string;
  // Añadimos un campo para la especificación de "Otro"
  tipoOtro: string; 
  duracion: string;
  requisitos: string;
  competencias: string;
  publicoObjetivo: string;
  contenido: string;
  materiales: string;
  emisor: string;
  criteriosEvaluacion: string;
  disponibilidad: string;
  costo: string;
  instructores: string;
  autorizacion: string;
}

@Component({
  selector: 'app-capacitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './capacitacionC.html',
  styleUrls: ['./capacitacionC.css']
})
export class CapacitacionesComponent implements OnInit {

  // 2. Modelo de datos del formulario
  capacitacion: ICapacitacion = {
    nombre: '',
    tipo: '',
    tipoOtro: '', // Inicializamos el nuevo campo
    duracion: '',
    requisitos: '',
    competencias: '',
    publicoObjetivo: '',
    contenido: '',
    materiales: '',
    emisor: '',
    criteriosEvaluacion: '',
    disponibilidad: '',
    costo: '',
    instructores: '',
    autorizacion: ''
  };

  // Variable para controlar la visibilidad del campo "Otro"
  mostrarCampoOtroTipo: boolean = false;

  // 3. Opciones del combobox
  // **Añadimos la opción "Otros"**
  tiposCapacitacion: string[] = [
    'Módulo de autoaprendizaje (webinar)',
    'Curso virtual',
    'Taller presencial / virtual',
    'Certificación técnica',
    'Otro' // <-- Opción "Otro" agregada
  ];

  constructor() {}

  ngOnInit(): void {}

  // **Nuevo método para manejar el cambio en el select**
  onTipoChange(): void {
    // Si el valor seleccionado es 'Otro', mostramos el campo de texto adicional
    if (this.capacitacion.tipo === 'Otro') {
      this.mostrarCampoOtroTipo = true;
    } else {
      // Si selecciona otra opción, ocultamos el campo y limpiamos su valor
      this.mostrarCampoOtroTipo = false;
      this.capacitacion.tipoOtro = '';
    }
  }

  // Guardar datos
  guardarDatos(): void {
    // Para ver el valor de "Otro" en la consola si fue seleccionado
    if (this.capacitacion.tipo === 'Otro' && this.capacitacion.tipoOtro) {
        console.log('Tipo seleccionado: Otro - Especificación:', this.capacitacion.tipoOtro);
    }
    
    console.log('Datos de Capacitación a enviar:', this.capacitacion);
    alert('Datos de CAPACITACIÓN listos para enviar.');
  }

}