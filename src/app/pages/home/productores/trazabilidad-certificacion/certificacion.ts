import { Component } from '@angular/core';
import { TrazabilidadService } from '../../../../services/trazabilidad.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificacion.html',
  styleUrls: ['./certificacion.css']
})
export class TrazabilidadComponent {
  pasoActual: number = 1;
  productor = { nombreProductor: '', nombreFinca: '', ubicacion: '', hectareas: null, altitudPromedio: null, volumenProduccion: null, variedades: '' };
  productorIdGuardado: number = 0;

  mercados = ['Europa', 'Asia', 'USA', 'Nacional'];
  mercadoSeleccionado: string = '';
  certificacionesDisponibles: any[] = [];
  certificacionSeleccionada: any = null;
  esDiagnosticoGeneral: boolean = false;

  // BANCO DE PREGUNTAS REALES SEPARADAS POR TIPO
  preguntasOrganicas = [
    { texto: '¿Evita estrictamente el uso de pesticidas, herbicidas y fertilizantes sintéticos (banda roja/amarilla)?', respuesta: false, tipo: 'Orgánica' },
    { texto: '¿Aplica compostas, abonos orgánicos y cuenta con un plan de nutrición de suelos documentado?', respuesta: false, tipo: 'Orgánica' },
    { texto: '¿Tiene establecidas barreras vivas para evitar la contaminación cruzada de fincas vecinas convencionales?', respuesta: false, tipo: 'Orgánica' },
    { texto: '¿Lleva un registro estricto (bitácora) de todas las labores de campo e insumos aplicados?', respuesta: false, tipo: 'Orgánica' }
  ];

  preguntasComercioJusto = [
    { texto: '¿Garantiza el pago de un salario digno y prohíbe estrictamente el trabajo infantil en su finca?', respuesta: false, tipo: 'Comercio Justo' },
    { texto: '¿Está organizado en una cooperativa o grupo que toma decisiones de manera democrática en asamblea?', respuesta: false, tipo: 'Comercio Justo' },
    { texto: '¿Ofrece condiciones seguras de trabajo y respeta la equidad de género en las labores y pagos?', respuesta: false, tipo: 'Comercio Justo' }
  ];

  preguntasRainforest = [
    { texto: '¿Mantiene una cobertura de sombra diversificada con especies nativas en su cafetal?', respuesta: false, tipo: 'Rainforest' },
    { texto: '¿Protege los cuerpos de agua (ríos, manantiales) y evita la deforestación de bosques primarios?', respuesta: false, tipo: 'Rainforest' },
    { texto: '¿Trata adecuadamente las aguas mieles y la pulpa resultantes del beneficio húmedo del café?', respuesta: false, tipo: 'Rainforest' }
  ];

  // Las preguntas que se mostrarán en pantalla
  preguntasActuales: any[] = [];
  resultadoFinal: any = null;

  constructor(private trazabilidadService: TrazabilidadService) {}

  guardarPerfil() {
    this.trazabilidadService.guardarProductor(this.productor).subscribe({
      next: (res) => {
        this.productorIdGuardado = res.id; 
        this.pasoActual = 2; // Despliega la sección 2 abajo
      },
      error: (err) => alert('Error al guardar productor: ' + err.message)
    });
  }

  seleccionarMercado(mercado: string) {
    this.mercadoSeleccionado = mercado;
    this.trazabilidadService.obtenerCertificaciones(mercado).subscribe({
      next: (res) => {
        this.certificacionesDisponibles = res;
        this.pasoActual = 2; // Mantiene visible el menú
      },
      error: (err) => console.error('Error al cargar', err)
    });
  }

  // DIAGNÓSTICO GENERAL (Suma todas las preguntas)
  iniciarDiagnosticoGeneral() {
    this.esDiagnosticoGeneral = true;
    this.certificacionSeleccionada = { nombre: 'Diagnóstico Integral ADICAM', id: null };
    // Une todas las preguntas en un solo gran examen
    this.preguntasActuales = [...this.preguntasOrganicas, ...this.preguntasComercioJusto, ...this.preguntasRainforest];
    this.preguntasActuales.forEach(p => p.respuesta = false);
    this.pasoActual = 3; // Despliega el test abajo
  }

  // TESTING ESPECÍFICO (Asigna solo las preguntas que corresponden)
  iniciarTesting(certificacion: any) {
    this.esDiagnosticoGeneral = false;
    this.certificacionSeleccionada = certificacion;
    
    // Filtro inteligente según el nombre de la certificación real
    const nombre = certificacion.nombre.toLowerCase();
    if (nombre.includes('orgánica') || nombre.includes('organic')) {
      this.preguntasActuales = [...this.preguntasOrganicas];
    } else if (nombre.includes('justo') || nombre.includes('fairtrade')) {
      this.preguntasActuales = [...this.preguntasComercioJusto];
    } else if (nombre.includes('rainforest') || nombre.includes('utz')) {
      this.preguntasActuales = [...this.preguntasRainforest];
    } else {
      // Por defecto si es Denominación de Origen u otra
      this.preguntasActuales = [...this.preguntasOrganicas, ...this.preguntasRainforest]; 
    }

    this.preguntasActuales.forEach(p => p.respuesta = false); 
    this.pasoActual = 3;
  }

  finalizarTest() {
    let certificacionFinalId = this.certificacionSeleccionada.id;

    if (this.esDiagnosticoGeneral) {
      let puntosOrg = this.preguntasActuales.filter(p => p.tipo === 'Orgánica' && p.respuesta).length;
      let puntosCom = this.preguntasActuales.filter(p => p.tipo === 'Comercio Justo' && p.respuesta).length;
      let puntosRain = this.preguntasActuales.filter(p => p.tipo === 'Rainforest' && p.respuesta).length;

      let maxPuntos = Math.max(puntosOrg, puntosCom, puntosRain);
      
      // Asignamos el ID de la BD según donde salió mejor
      if (maxPuntos === puntosOrg) certificacionFinalId = 1; // ID Orgánica
      else if (maxPuntos === puntosCom) certificacionFinalId = 2; // ID Comercio Justo
      else certificacionFinalId = 3; // ID Rainforest
    }

    const aciertos = this.preguntasActuales.filter(p => p.respuesta).length;
    const total = this.preguntasActuales.length;

    this.trazabilidadService.calcularEvaluacion(this.productorIdGuardado, certificacionFinalId, aciertos, total)
      .subscribe({
        next: (res) => {
          this.resultadoFinal = res;
          this.pasoActual = 4; // Despliega los resultados al final
        },
        error: (err) => alert('Error al procesar: ' + err.message)
      });
  }

  descargarReporte() {
    this.trazabilidadService.descargarPdf(this.resultadoFinal.id);
  }
}
