import { Component, OnInit } from '@angular/core';
import { AsistenciaService } from '../../../../services/asistencia.service';
import { CommonModule, SlicePipe } from '@angular/common'; // Importa el pipe específicamente si es necesario
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-asistencia-admin',
  templateUrl: './asistencia-tecnica.html',
  styleUrls: ['./asistencia-tecnica.css'],
  imports: [
    CommonModule, 
    FormsModule,
    // Si usas Angular moderno, CommonModule ya incluye NgIf, NgFor y SlicePipe
  ],
})
export class AsistenciaTecnicaComponent implements OnInit {

  listaPendientes: any[] = [];
  listaCatalogo: any[] = [];
  solicitudSeleccionada: any = null;

  
  
  // Datos para la vinculación
  tipoSeleccionado: string = '';
  idInstitucionSeleccionada: number | null = null;

  // Objeto que enviaremos al backend
 asistencia: any = {
    institucionId: null, // Se puede quedar en null ya que escribirás el nombre
    tipoInstitucion: '',
    nombreInstitucionViculada: '', // Aquí se guarda lo que escribas
    tipoAsistencia: '',
    especialistas: '',
    costos: ''
  };

  constructor(
    private asistenciaService: AsistenciaService,
  
  ) {}

  ngOnInit(): void {
    this.obtenerPendientes();
  }

obtenerPendientes() {
    this.asistenciaService.listarPendientes().subscribe(res => {
      this.listaPendientes = res;
    });
  }

  cargarCatalogoPorTipo() {
    if (this.tipoSeleccionado === 'EMPRESA') {
    //  this.empresaService.listar().subscribe(res => this.listaCatalogo = res);
    } else if (this.tipoSeleccionado === 'GOBIERNO') {
      //this.gobiernoService.listar().subscribe(res => this.listaCatalogo = res);
    }
  }

 seleccionarParaResponder(solicitud: any) {
    this.solicitudSeleccionada = solicitud;
    // Reiniciar el objeto de asistencia para una nueva vinculación
    this.asistencia.nombreInstitucionViculada = '';
  }

  onInstitucionChange() {
    const inst = this.listaCatalogo.find(i => i.id == this.idInstitucionSeleccionada);
    if (inst) {
      this.asistencia.institucionId = inst.id;
      this.asistencia.tipoInstitucion = this.tipoSeleccionado;
      this.asistencia.nombreInstitucionViculada = inst.nombre;
    }
  }

  confirmarVinculacion() {
    // Validamos que el usuario haya escrito algo
    if (!this.asistencia.nombreInstitucionViculada || this.asistencia.nombreInstitucionViculada.trim() === '') {
      alert("Por favor, escribe el nombre de la institución o equipo técnico.");
      return;
    }

    // Llamada al servicio enviando el ID de la solicitud y los datos capturados
    this.asistenciaService.vincular(this.solicitudSeleccionada.id, this.asistencia).subscribe({
      next: (res) => {
        alert("¡Productor vinculado con éxito! Se ha enviado la notificación por correo.");
        this.solicitudSeleccionada = null;
        this.obtenerPendientes(); // Refrescar lista
      },
      error: (err) => alert("Error al confirmar la vinculación.")
    });
  }
}
