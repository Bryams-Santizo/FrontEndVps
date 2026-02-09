import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productores.html',
  styleUrls: ['./productores.css']
})
export class ProductoresComponent {

  // Inputs del productor
  unidadVenta: 'quintal' | 'kilo' = 'quintal';
  cantidad: number = 0;
  tipoCafe: string = 'pergamino';
  calidad: string = 'comercial';
  certificacion: string = 'ninguna';

  // Constantes
  readonly KILOS_POR_QUINTAL = 46;

  // Tabla de precios base (REFERENCIA)
  preciosBase: any = {
    cereza:   { kilo: 8 },
    pergamino:{ quintal: 3000 },
    oro:      { quintal: 5200 },
    tostado:  { kilo: 160 },
    molido:   { kilo: 180 }
  };

  // Factores de calidad
  factoresCalidad: any = {
    comercial: 1,
    primera: 1.15,
    especial: 1.30
  };

  // Factores de certificación
  factoresCertificacion: any = {
    ninguna: 1,
    organico: 1.15,
    comercioJusto: 1.10
  };

  // Precio base automático
  get precioReferencia(): number {
    const precio =
      this.preciosBase[this.tipoCafe]?.[this.unidadVenta] || 0;

    return precio *
      this.factoresCalidad[this.calidad] *
      this.factoresCertificacion[this.certificacion];
  }

  // Conversión a kilos
  get totalKilos(): number {
    if (this.unidadVenta === 'quintal') {
      return this.cantidad * this.KILOS_POR_QUINTAL;
    }
    return this.cantidad;
  }

  // Total estimado
  get totalEstimado(): number {
    return this.cantidad * this.precioReferencia;
  }
}
