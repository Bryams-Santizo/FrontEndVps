import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CafeService } from '../../../services/cafe.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-productores',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './productores.html',
  styleUrls: ['./productores.css']
})
export class ProductoresComponent implements OnInit {

  // Datos REALES del Backend (Bolsa + Tipo de Cambio)
  precioBolsaQuintal: number = 0; // Ahora en MXN
  precioBolsaKilo: number = 0;    // Ahora en MXN
  tipoCambioHoy: number = 0;      // Tasa USD/MXN real
  fechaActualizacion: string = '';
  cargandoPrecio: boolean = true;
  errorConexion: boolean = false;

  // Inputs del productor
  unidadVenta: 'quintal' | 'kilo' = 'quintal';
  cantidad: number = 0;
  tipoCafe: string = 'pergamino';
  calidad: string = 'comercial';
  certificacion: string = 'ninguna';

  readonly KILOS_POR_QUINTAL = 46;

  // Precios base solo para productos procesados (en MXN, no cotizados en bolsa)
  // Estos valores son estáticos pero se muestran en Pesos Mexicanos
  preciosBaseProcesados: any = {
    cereza:   { kilo: 8, quintal: 368 },
    tostado:  { kilo: 160, quintal: 7360 },
    molido:   { kilo: 180, quintal: 8280 }
  };

  factoresCalidad: any = { comercial: 1, primera: 1.15, especial: 1.30 };
  factoresCertificacion: any = { ninguna: 1, organico: 1.15, comercioJusto: 1.10 };

  constructor(private cafeService: CafeService) {}

  ngOnInit(): void {
    this.obtenerPrecioReal();
  }

  obtenerPrecioReal() {
    this.cargandoPrecio = true;
    this.errorConexion = false;
    this.cafeService.getPrecioBolsa().subscribe({
      next: (data) => {
        // Verificamos que el backend mande datos mayores a 0 (evitar simulación)
        if (data && data.precioQuintal > 0) {
          this.precioBolsaQuintal = data.precioQuintal;
          this.precioBolsaKilo = data.precioKilo;
          this.tipoCambioHoy = data.tipoCambio; // Guardamos el dólar actual
          this.fechaActualizacion = new Date().toLocaleString(); // Fecha y hora
          this.cargandoPrecio = false;
        } else {
          this.errorConexion = true;
          this.cargandoPrecio = false;
        }
      },
      error: (err) => {
        console.error('Error de conexión con el servidor de bolsa:', err);
        this.errorConexion = true;
        this.cargandoPrecio = false;
      }
    });
  }

  // Precio de referencia dinámico convertido a PESOS MEXICANOS
  get precioReferencia(): number {
    let base = 0;

    // Prioridad absoluta a la bolsa para Oro y Pergamino
    if (this.tipoCafe === 'oro' || this.tipoCafe === 'pergamino') {
      if (this.precioBolsaQuintal > 0) {
        base = (this.unidadVenta === 'quintal') ? this.precioBolsaQuintal : this.precioBolsaKilo;
        
        // Ajuste de mercado: El pergamino vale menos que el café oro (limpio)
        if (this.tipoCafe === 'pergamino') base *= 0.85;
      } else {
        return 0; // No se inventan datos si la conexión falla
      }
    } else {
      // Usar precios locales para café procesado
      base = this.preciosBaseProcesados[this.tipoCafe]?.[this.unidadVenta] || 0;
    }

    return base * this.factoresCalidad[this.calidad] * this.factoresCertificacion[this.certificacion];
  }

  get totalKilos(): number {
    return this.unidadVenta === 'quintal' ? this.cantidad * this.KILOS_POR_QUINTAL : this.cantidad;
  }

  get totalEstimado(): number {
    return this.cantidad * this.precioReferencia;
  }
}
