import { Component } from '@angular/core';
import { AsistenciaService } from '../../../services/asistencia.service';
import { CommonModule, SlicePipe } from '@angular/common'; // Importa el pipe específicamente si es necesario
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asistencia-publico',
  templateUrl: './asistencia.html',
  styleUrls: ['./asistencia.css'],
  imports: [
    CommonModule, 
    FormsModule,
    // Si usas Angular moderno, CommonModule ya incluye NgIf, NgFor y SlicePipe
  ],
})
export class AsistenciaComponent {

  mostrarOtro: boolean = false;
  campoOtro: string = '';

  // Objeto limpio para el productor
  solicitud: any = {
    nombreSolicitante: '',
    tipoSolicitante: '',
    problemaEspecifico: '',
    ubicacion: '',
    estatus: 'PENDIENTE' // El backend lo fuerza, pero es bueno tenerlo aquí
  };

  constructor(private asistenciaService: AsistenciaService) {}

  manejarCambioTipo() {
    this.mostrarOtro = this.solicitud.tipoSolicitante === 'Otro';
  }

  enviarSolicitud() {
    // Validar campos básicos
    if (!this.solicitud.nombreSolicitante || !this.solicitud.problemaEspecifico) {
      alert("Por favor, llene los campos obligatorios.");
      return;
    }

    // Si seleccionó 'Otro', combinamos los textos
    if (this.mostrarOtro) {
      this.solicitud.tipoSolicitante = `Otro: ${this.campoOtro}`;
    }

    // Enviamos al método guardarSolicitudProductor del backend
    this.asistenciaService.crearSolicitud(this.solicitud).subscribe({
      next: (res) => {
        alert("¡Solicitud enviada con éxito! El TecNM revisará su caso.");
        this.limpiarFormulario();
      },
      error: (err) => alert("Hubo un error al enviar su solicitud.")
    });
  }

  limpiarFormulario() {
    this.solicitud = {
      nombreSolicitante: '',
      tipoSolicitante: '',
      problemaEspecifico: '',
      ubicacion: ''
    };
    this.campoOtro = '';
    this.mostrarOtro = false;
  }
}