import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EstadisticasService } from '../../../services/estadisticas.service';
import { ProyectoService } from '../../../services/proyecto.service'; // Inyectamos tu servicio funcional
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css'],
})
export class EstadisticasComponent implements AfterViewInit {
  @ViewChild('proyectosMesCanvas') proyectosMesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('participantesCanvas') participantesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tiposCanvas') tiposCanvas!: ElementRef<HTMLCanvasElement>;

  // Variables para las tarjetas (KPIs)
  public totalProyectos: number = 0;
  public totalParticipantes: number = 0;

  private chartProyectos: Chart | undefined;
  private chartParticipantes: Chart | undefined;
  private chartTipos: Chart | undefined;

  constructor(
    private stats: EstadisticasService,
    private proyectoService: ProyectoService, // Servicio que ya te funciona
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarConteosReales(); // Tu lógica del Inicio
      this.cargarGraficas();
    }
  }

  // USAMOS TU LÓGICA FUNCIONAL:
  private cargarConteosReales() {
  this.stats.getTotales().subscribe({
    next: (res) => {
      this.totalProyectos = res.totalProyectos;
      this.totalParticipantes = res.totalParticipantes;
    },
    error: (err) => console.error('Error al cargar totales:', err)
  });
}

 

private cargarGraficas() {
  // 1. Proyectos por Mes
  // Gráfica de Proyectos por Mes
this.stats.proyectosPorMes().subscribe(data => {
  if (this.chartProyectos) this.chartProyectos.destroy();
  this.chartProyectos = new Chart(this.proyectosMesCanvas.nativeElement, {
    type: 'bar',
    data: {
      labels: data.map((d: any) => d[0]), // El índice 0 es el nombre del mes
      datasets: [{
        label: 'Proyectos',
        data: data.map((d: any) => d[1]), // El índice 1 es el número (count)
        backgroundColor: '#4e73df'
      }]
    }
  });
});

  // 2. Participantes por Mes
  this.stats.participantesPorMes().subscribe(data => {
  // Actualizar el KPI (Total de personas)
  this.totalParticipantes = data.reduce((acc: number, curr: any) => acc + (Number(curr[1]) || 0), 0);

  if (this.chartParticipantes) this.chartParticipantes.destroy();
  
  this.chartParticipantes = new Chart(this.participantesCanvas.nativeElement, {
    type: 'doughnut', // Cambiamos a dona porque son categorías (Tipos)
    data: {
      labels: data.map((d: any) => d[0]), // Aquí vendrá "TECNOLOGICO", "EMPRESA", etc.
      datasets: [{
        label: 'Total por Tipo',
        data: data.map((d: any) => d[1]), // El conteo
        backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e'], // Colores para cada tipo
        hoverOffset: 4
      }]
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
});

  // 3. Tipos de Proyecto (Gráfica de Pie)
  this.stats.tiposProyecto().subscribe(data => {
    if (this.chartTipos) this.chartTipos.destroy();
    this.chartTipos = new Chart(this.tiposCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: data.map((d: any) => d[0]), // Actividad
        datasets: [{
          data: data.map((d: any) => d[1]), // Conteo
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
        }]
      }
    });
  });
}
}