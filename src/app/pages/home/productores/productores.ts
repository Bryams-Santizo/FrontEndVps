import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CafeService } from '../../../services/cafe.service';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { SimuladorService } from '../../../services/simulador.service';

@Component({
  selector: 'app-productores',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './productores.html',
  styleUrls: ['./productores.css']
})
export class ProductoresComponent implements OnInit {
  // Sincronizado con el HTML: Usamos vistaActual para el control de pantallas
  vistaActual: 'menu' | 'calculadora' | 'simulador' = 'menu';

  // --- DATOS COMPARTIDOS Y BOLSA ---
  precioBolsaQuintal: number = 0;
  precioBolsaKilo: number = 0;
  tipoCambioHoy: number = 17.50; 
  fechaActualizacion: string = '';
  cargandoPrecio: boolean = true;
  errorConexion: boolean = false;

  // --- INPUTS CALCULADORA TRADICIONAL ---
  unidadVenta: 'quintal' | 'kilo' = 'quintal';
  cantidad: number = 0;
  tipoCafe: string = 'pergamino';
  calidad: string = 'comercial';
  certificacion: string = 'ninguna';
  
  factoresCalidad: any = { comercial: 1, primera: 1.15, especial: 1.30 };
  factoresCertificacion: any = { ninguna: 1, organico: 1.15, comercioJusto: 1.10 };
  preciosBaseProcesados: any = { 
    cereza: { kilo: 8, quintal: 368 }, 
    tostado: { kilo: 160, quintal: 7360 }, 
    molido: { kilo: 180, quintal: 8280 } 
  };

  // --- DATOS SIMULADOR ADICAM ---
  sim = {
    nombre: '', cooperativa: '', parcela: '',
    origenEstado: 'Chiapas', origenMunicipio: '',
    mercadoObjetivo: 'Nacional', 
    destinoFinal: '',
    estadoInicial: 'Pergamino', 
    variedad: 'Arábica',
    segmento: 'Volumen',
    presentacionVenta: 'Pergamino',
    tieneGNSS: 'No', tieneSuelo: 'No',
    certCheck: { sca: false, organico: false, fairtrade: false, rainforest: false },
    volumenEntrada: 0, unidadVolumen: 'kg',
    tieneQGrade: 'No',
    costoEmpaqueManual: 0, costoMaquila: 0,
    fleteTerrestre: 0, agenteAduanal: 7500, puntoSalida: 'Veracruz'
  };

  // Listas Dinámicas
  estadosMexico = ['Chiapas', 'Veracruz', 'Oaxaca', 'Puebla', 'Guerrero'];
  paisesDestino = ['USA', 'Alemania', 'Japón', 'Canadá', 'España'];

  // Resultados del Simulador
  res = {
    inversionPuestaPunto: 0,
    mermaTrilla: 0, mermaTostado: 0, pesoFinal: 0,
    costoEmpaqueTotal: 0, costoLogisticaTotal: 0,
    precioADICAM: 0, utilidadTradicional: 0, utilidadADICAM: 0,
    viabilidad: 'Rojo'
  };

  readonly KILOS_POR_QUINTAL = 46;

  constructor(private cafeService: CafeService, private location: Location, private simuladorService: SimuladorService) {}

  ngOnInit(): void {
    this.obtenerPrecioReal();
  }

  obtenerPrecioReal() {
    this.cargandoPrecio = true;
    this.cafeService.getPrecioBolsa().subscribe({
      next: (data) => {
        if (data && data.precioQuintal > 0) {
          this.precioBolsaQuintal = data.precioQuintal;
          this.precioBolsaKilo = data.precioKilo;
          this.tipoCambioHoy = data.tipoCambio;
          this.fechaActualizacion = new Date().toLocaleString();
          this.cargandoPrecio = false;
        } else {
          this.errorConexion = true;
          this.cargandoPrecio = false;
        }
      },
      error: () => {
        this.errorConexion = true;
        this.cargandoPrecio = false;
      }
    });
  }

  // --- LÓGICA CALCULADORA ---
  get precioReferencia(): number {
    let base = 0;
    if (this.tipoCafe === 'oro' || this.tipoCafe === 'pergamino') {
      if (this.precioBolsaQuintal > 0) {
        base = (this.unidadVenta === 'quintal') ? this.precioBolsaQuintal : this.precioBolsaKilo;
        if (this.tipoCafe === 'pergamino') base *= 0.85;
      } else return 0;
    } else {
      base = this.preciosBaseProcesados[this.tipoCafe]?.[this.unidadVenta] || 0;
    }
    // Aplicar factores de calidad y certificación solo en calculadora
    const fCal = this.factoresCalidad[this.calidad] || 1;
    const fCert = this.factoresCertificacion[this.certificacion] || 1;
    return base * fCal * fCert;
  }

  get totalKilos(): number {
    return this.unidadVenta === 'quintal' ? this.cantidad * this.KILOS_POR_QUINTAL : this.cantidad;
  }

  get totalEstimado(): number {
    return this.cantidad * this.precioReferencia;
  }

  // --- LÓGICA SIMULADOR ---
  get utilidadTradicional(): number {
    let kilos = this.sim.unidadVolumen === 'quintal' ? this.sim.volumenEntrada * 46 : this.sim.volumenEntrada;
    let precioLocal = 45; // Precio promedio local simulado (Coyotes)
    return kilos * precioLocal;
  }


  // --- NAVEGACIÓN ---
  cambiarVista(vista: 'menu' | 'calculadora' | 'simulador') {
    this.vistaActual = vista;
  }

  regresar() {
    if (this.vistaActual === 'menu') {
      this.location.back();
    } else {
      this.vistaActual = 'menu';
    }
  }

  ejecutarSimulador() {
    this.simuladorService.calcularSimulacion(this.sim).subscribe({
      next: (resultado) => {
        this.res = resultado;
        console.log("Simulación ADICAM recibida con éxito:", this.res);
      },
      error: (err) => {
        console.error("Error al conectar con el servidor ADICAM:", err);
        // Aquí podrías disparar una alerta visual de error
      }
    });
    }
}

