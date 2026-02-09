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
    institucionId: null,
    tipoInstitucion: '',
    nombreInstitucionViculada: '',
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
    if (!this.idInstitucionSeleccionada) {
      alert("Selecciona una institución primero");
      return;
    }

    this.asistenciaService.vincular(this.solicitudSeleccionada.id, this.asistencia).subscribe(res => {
      alert("¡Productor vinculado con éxito!");
      this.solicitudSeleccionada = null;
      this.obtenerPendientes(); // Refrescar lista
    });
  }
}