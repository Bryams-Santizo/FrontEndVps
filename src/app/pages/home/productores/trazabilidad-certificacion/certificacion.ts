import { Component } from '@angular/core';
import { TrazabilidadService } from '../../../../services/trazabilidad.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BANCO_PREGUNTAS } from '../../../../preguntas.data';

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificacion.html',
  styleUrls: ['./certificacion.css']
})
export class TrazabilidadComponent {
  pasoActual: number = 1;
  productor = { 
    nombreProductor: '', 
    nombreFinca: '', 
    ubicacion: '', 
    hectareas: null, 
    altitudPromedio: null, 
    volumenProduccion: null, 
    variedades: '' 
  };
  productorIdGuardado: number = 0;

  estadosDisponibles = ['Chiapas', 'Veracruz', 'Oaxaca'];
  municipiosData = [
    { estado: 'Chiapas', municipio: 'Tapachula', altitud: 170 },
    { estado: 'Chiapas', municipio: 'Unión Juárez', altitud: 1300 },
    { estado: 'Chiapas', municipio: 'Motozintla', altitud: 1200 },
    { estado: 'Veracruz', municipio: 'Coatepec', altitud: 1200 },
    { estado: 'Oaxaca', municipio: 'Pluma Hidalgo', altitud: 1300 }
  ];
  municipiosFiltrados: any[] = [];

  mercados = ['Europa', 'Asia', 'USA', 'Nacional'];
  mercadoSeleccionado: string = '';
  certificacionesDisponibles: any[] = [];
  certificacionSeleccionada: any = null;
  esDiagnosticoGeneral: boolean = false;

  preguntasActuales: any[] = [];
  resultadoFinal: any = null;

  constructor(private trazabilidadService: TrazabilidadService) {}

  onEstadoChange(estado: string) {
    this.municipiosFiltrados = this.municipiosData.filter(m => m.estado === estado);
    this.productor.altitudPromedio = null;
  }

  onMunicipioChange(municipioNombre: string) {
    const mun = this.municipiosFiltrados.find(m => m.municipio === municipioNombre);
    if (mun) {
      this.productor.altitudPromedio = mun.altitud;
      this.productor.ubicacion = `${mun.municipio}, ${mun.estado}`;
    }
  }

  guardarPerfil() {
    this.trazabilidadService.guardarProductor(this.productor).subscribe({
      next: (res) => {
        this.productorIdGuardado = res.id; 
        this.pasoActual = 2;
      },
      error: (err) => alert('Error al guardar productor: ' + err.message)
    });
  }

  seleccionarMercado(mercado: string) {
    this.mercadoSeleccionado = mercado;
    this.trazabilidadService.obtenerCertificaciones(mercado).subscribe({
      next: (res) => {
        this.certificacionesDisponibles = res;
        this.pasoActual = 2;
      },
      error: (err) => console.error('Error al cargar', err)
    });
  }

  iniciarDiagnosticoGeneral() {
    this.esDiagnosticoGeneral = true;
    this.certificacionSeleccionada = { nombre: 'Diagnóstico Integral ADICAM', id: 0 };
    this.preguntasActuales = [
      ...BANCO_PREGUNTAS.organica, 
      ...BANCO_PREGUNTAS.comercio_justo, 
      ...BANCO_PREGUNTAS.rainforest_utz
    ];
    this.preguntasActuales.forEach(p => {
  if (p.tipo === 'boolean') p.respuesta = false;
  else p.respuesta = 0; // Esto cubre 'number', 'scale' y 'percentage'
});
    this.pasoActual = 3;
  }

  iniciarTesting(certificacion: any) {
    this.esDiagnosticoGeneral = false;
    this.certificacionSeleccionada = certificacion;
    
    const nombre = certificacion.nombre.toLowerCase();
    if (nombre.includes('orgánica')) this.preguntasActuales = [...BANCO_PREGUNTAS.organica];
    else if (nombre.includes('justo')) this.preguntasActuales = [...BANCO_PREGUNTAS.comercio_justo];
    else if (nombre.includes('rainforest') || nombre.includes('utz')) this.preguntasActuales = [...BANCO_PREGUNTAS.rainforest_utz];
    else this.preguntasActuales = [...BANCO_PREGUNTAS.organica];

    this.preguntasActuales.forEach(p => p.respuesta = (p.tipo === 'boolean' ? false : 0));
    this.pasoActual = 3;
  }

  finalizarTest() {
    let aciertos = 0;
    let recomendacionesFaltantes: string[] = [];

  this.preguntasActuales.forEach(p => {
  let cumple = false;
  
  if (p.tipo === 'boolean') {
    cumple = (p.respuesta === p.meta);
  } else if (p.tipo === 'scale' || p.tipo === 'number' || p.tipo === 'percentage') {
    // La lógica de "mayor o igual" sigue funcionando perfecto, 
    // siempre que en tus DATOS la meta sea 80 y no 8.
    cumple = (p.respuesta >= p.meta);
  }

  if (cumple) aciertos++;
  else recomendacionesFaltantes.push(p.recomendacion);
});

    const total = this.preguntasActuales.length;
    const stringRecomendaciones = recomendacionesFaltantes.join("\n- ");
    const certId = this.esDiagnosticoGeneral ? 1 : this.certificacionSeleccionada.id;

    // Ahora el servicio acepta los 5 parámetros, por lo que el error desaparecerá
    this.trazabilidadService.calcularEvaluacion(
      this.productorIdGuardado, 
      certId, 
      aciertos, 
      total, 
      stringRecomendaciones
    ).subscribe({
      next: (res) => {
        this.resultadoFinal = res;
        this.resultadoFinal.porcentajeAMostrar = res.porcentajeCumplimiento.toFixed(2).replace('.', ',');
        this.pasoActual = 4;
      },
      error: (err) => alert('Error al procesar: ' + err.message)
    });
  }

  descargarReporte() {
    this.trazabilidadService.descargarPdf(this.resultadoFinal.id);
  }
}
