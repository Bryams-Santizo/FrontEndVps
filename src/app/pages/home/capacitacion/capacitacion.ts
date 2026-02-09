import { Component, OnInit } from '@angular/core';

// Definimos la estructura exacta basada en tu formulario HTML
interface Capacitacion {
  nombre: string;
  tipo: string;
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
}

@Component({
  selector: 'app-capacitacion-simulacion',
  templateUrl: './capacitacion.html',
  styleUrls: ['./capacitacion.css']
})
export class CapacitacionComponent implements OnInit {

  // Esta es la lista que simula los datos que el admin ya "subió"
  listaCapacitaciones: Capacitacion[] = [
    {
      nombre: 'Certificación en Desarrollo Web con Angular',
      tipo: 'Certificación',
      duracion: '60 horas',
      requisitos: 'Conocimientos básicos de JavaScript y HTML.',
      competencias: 'Creación de SPAs, gestión de estados y consumo de APIs.',
      publicoObjetivo: 'Desarrolladores Junior y estudiantes de sistemas.',
      contenido: 'Módulo 1: Componentes. Módulo 2: Servicios. Módulo 3: Observables.',
      materiales: 'Repositorios de código, manual PDF, acceso a grabaciones.',
      emisor: 'Dirección de Tecnologías de la Información',
      criteriosEvaluacion: '80% de asistencia y proyecto final funcional.',
      disponibilidad: 'Inscripciones abiertas hasta el 15 de marzo.',
      costo: 'Gratuito',
      instructores: 'Ing. Alan Turing'
    },
    {
      nombre: 'Taller de Liderazgo y Gestión de Equipos',
      tipo: 'Taller',
      duracion: '15 horas',
      requisitos: 'Ninguno.',
      competencias: 'Comunicación asertiva, resolución de conflictos y delegación.',
      publicoObjetivo: 'Jefes de área y coordinadores de proyecto.',
      contenido: '1. Inteligencia Emocional. 2. Métodos de Retroalimentación. 3. Coaching.',
      materiales: 'Guía de ejercicios prácticos y plantillas de gestión.',
      emisor: 'Departamento de Recursos Humanos',
      criteriosEvaluacion: 'Participación en dinámicas grupales.',
      disponibilidad: 'Sábados de 9:00 AM a 2:00 PM.',
      costo: '$500 MXN',
      instructores: 'Lic. Sarah Connor'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // En una app real, aquí harías el fetch a tu API
    console.log('Información simulada cargada correctamente');
  }

  // Función simulada para el botón "Más información"
  verDetalles(curso: Capacitacion) {
    alert(`Has seleccionado el curso: ${curso.nombre}\nEmitido por: ${curso.emisor}`);
  }

}