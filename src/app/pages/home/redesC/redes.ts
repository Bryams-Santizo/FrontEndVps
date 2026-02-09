import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importamos la interfaz para mantener la consistencia de los datos
export interface IRedColaboracion {
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
  selector: 'app-consulta-colaboraciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redes.html',
  styleUrls: ['./redes.css']
})
export class RedesComponent implements OnInit {

  // Esta lista almacenará todos los registros que vienen de tu base de datos o servicio
  listaColaboraciones: IRedColaboracion[] = [];

  constructor() { }

  ngOnInit(): void {
    // Aquí llamarías a tu servicio para obtener los datos guardados
    this.obtenerColaboraciones();
  }

  obtenerColaboraciones(): void {
    // Datos de ejemplo que representan lo que el formulario guardó
    // Notarás que incluimos todos los campos del formulario original
    this.listaColaboraciones = [
      {
        institucionSolicitante: 'Innovación Tecnológica S.A.',
        estado: 'Jalisco',
        tipoColaboracion: 'Residencias profesionales',
        descripcionNecesidad: 'Implementación de un sistema de control de inventarios basado en etiquetas RFID para almacenes de gran escala.',
        numeroEstudiantes: '3',
        perfilCompetencias: 'Estudiantes de Ingeniería Industrial o Sistemas con conocimiento en logística y bases de datos SQL.',
        duracion: '6 meses / 500 horas',
        beneficios: 'Apoyo económico de $3,500 mensuales, transporte gratuito y servicio de comedor.',
        personaContacto: 'Ing. Alberto Ruiz - Gerente de Logística',
        documentosAdjuntos: 'proyecto_rfid_v1.pdf',
        cartaIntencion: 'carta_firmada_innovacion.pdf'
      },
      {
        institucionSolicitante: 'Gobierno Municipal - Dpto. Ecología',
        estado: 'Nuevo León',
        tipoColaboracion: 'Servicio social',
        descripcionNecesidad: 'Campaña de reforestación urbana y mapeo digital de áreas verdes protegidas mediante herramientas GIS.',
        numeroEstudiantes: '10',
        perfilCompetencias: 'Estudiantes con sentido de responsabilidad ambiental, manejo básico de mapas digitales o biología.',
        duracion: '480 horas reglamentarias',
        beneficios: 'Liberación inmediata de servicio social y certificación en manejo de herramientas geográficas.',
        personaContacto: 'Lic. Claudia Ortiz - Directora de Medio Ambiente',
        documentosAdjuntos: '',
        cartaIntencion: 'convenio_municipio.pdf'
      }
    ];
  }

  // Función opcional para descargar o ver el nombre del archivo
  verArchivo(nombreArchivo: string): void {
    if (nombreArchivo) {
      alert('Abriendo archivo: ' + nombreArchivo);
      // Aquí iría la lógica para descargar el archivo desde tu servidor
    }
  }
}