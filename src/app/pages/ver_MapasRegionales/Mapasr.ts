import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import datosCafeDeJson from '../../../assets/data/regiones-cafe.json';
import coordsMunicipiosJson from '../../../assets/data/coords.json';
const coordsMunicipios = coordsMunicipiosJson as unknown as Record<string, [number, number]>;

interface IRegionalData {
  nombreRegion: string;
  municipios: string[];
  actoresDetalle: { 
    productores: number; cooperativas: number; acopiadores: number; 
    exportadores: number; tostadores: number; proveedores: number; ayuntamientos: number; 
  };
  productoresPorTamano: { small: number; medium: number; large: number; promedioSuperficie: string };
  rangoAltitudinal: string;
  altitudPromedio: number;
  variedadesPredominantes: string[];
  produccionEstimada: string;
  totalProduccion: string;
}

interface IMunicipioData {
  nombre: string;
  zona: string;
  actores: {
    productores: string;
    cooperativas: string;
    exportacion: string;
    ayuntamiento: string;
  };
  infoProductores: {
    perfil: string;
    promedioFinca: string;
  };
  altura: string;
  variedades: string[];
  produccionHa: string;
  clima: string;
}

let L: any = null;

@Component({
  selector: 'app-mapas-regionales',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './MapasR.html',
  styleUrls: ['./MapasR.css']
})
export class MapaR implements OnInit, AfterViewInit {

  private map: any;
  private markersGroup: any = null;
  private capaEstadoActual: any = null;
  private mexicoFeatures: any[] = [];

  public isLoading = true;
  public selectedRegionData: IRegionalData | null = null;
  public esChiapasVisible = false;
  public selectedMunicipio: IMunicipioData | null = null;
  public pSeleccionado: any = null;
  public verListado: boolean = false;
  public nombreEstadoSeleccionado: string = 'México';

  // 🔥 AGREGADO (para que no marque error en HTML)
  public eslabones: string[] = ['Producción', 'Transformación', 'Comercialización'];
  public certificaciones: string[] = ['Orgánico', 'Fair Trade', 'Rainforest'];
  public productoresMunicipio: any[] = [];


  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private ngZone: NgZone, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const leafletModule = await import('leaflet');
      L = leafletModule.default || leafletModule;
      this.initMap();
    }
  }

  private initMap() {
    if (!L) return;
    this.map = L.map('map-container').setView([23.6, -102.5], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.markersGroup = L.layerGroup().addTo(this.map);

    this.cargarMapaCompleto();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  async cargarMapaCompleto() {
    this.markersGroup.clearLayers();
    if (this.capaEstadoActual) this.map.removeLayer(this.capaEstadoActual);

    try {
      const resMexico = await fetch('https://raw.githubusercontent.com/angelnmara/geojson/master/mexicoHigh.json');
      const mexicoRaw = await resMexico.json();
      this.mexicoFeatures = mexicoRaw.features;

      this.capaEstadoActual = L.geoJSON(this.mexicoFeatures, {
        style: (feature: any) => ({
          color: '#003b6f',
          weight: 1,
          fillOpacity: 0.4,
          fillColor: feature?.properties.name === 'Chiapas' ? '#003b6f' : '#003b6f'
        }),
        onEachFeature: (feature: any, layer: any) => {
          layer.bindTooltip(feature.properties.name);
          layer.on({
            mouseover: (e: any) => e.target.setStyle({ fillOpacity: 0.7, weight: 2 }),
            mouseout: (e: any) => e.target.setStyle({ fillOpacity: 0.4, weight: 1 }),
            click: () => this.ngZone.run(() => this.seleccionarEstado(feature))
          });
        }
      }).addTo(this.map);

      this.map.fitBounds(this.capaEstadoActual.getBounds());

    } catch (error) {
      console.error("Error cargando el mapa:", error);
    }
  }

  private seleccionarEstado(feature: any) {
    const nombre = feature.properties.name;
    this.nombreEstadoSeleccionado = nombre;

    const bounds = L.geoJSON(feature).getBounds();

    // 🔥 FIX
    this.map.flyToBounds(bounds, { padding: [20, 20], duration: 1.2 });

    this.markersGroup.clearLayers();

    L.geoJSON(feature, {
      style: { color: '#6F4E37', weight: 3, fillOpacity: 0.1 }
    }).addTo(this.markersGroup);

    if (nombre === 'Chiapas') {
      this.esChiapasVisible = true;
      this.cargarZonasIndividuales();
    } else {
      this.esChiapasVisible = false;
      this.selectedRegionData = null;
    }

    this.cdr.detectChanges();
  }

private cargarZonasIndividuales() {

  const zonas = [
    { name: "Soconusco", mun: ["Tapachula","Cacahoatán","Unión Juárez","Tuxtla Chico","Huixtla","Huehuetán","Tuzantán"] },
    { name: "Sierra Madre", mun: ["Siltepec","Motozintla","El Porvenir","Mazapa de Madero","La Grandeza","Frontera Comalapa","Amatenango de la Frontera","Chicomuselo","Bella Vista","Bejucal de Ocampo","Honduras de la Sierra","Capitán Luis Ángel Vidal"] },
    { name: "Frailesca", mun: ["Ángel Albino Corzo","La Concordia","Villa Corzo","Montecristo de Guerrero"] },
    { name: "Los Altos", mun: ["Chenalhó","Tenejapa","Oxchuc","San Cristóbal de las Casas","Huixtán","Pantelhó","Altamirano"] },
    { name: "Selva", mun: ["Ocosingo","Yajalón","Chilón","Palenque","Salto de Agua","Maravilla Tenejapa"] },
    { name: "Norte", mun: ["Pichucalco","Amatán","Ixtacomitán","Solosuchiapa","Cintalapa"] },
    { name: "Meseta Comiteca", mun: ["Las Margaritas","La Trinitaria","Independencia","Comitán de Domínguez","Las Rosas","Maravilla Tenejapa","Tzimol"] }
  ];

  zonas.forEach(z => {

    const data = this.generarDatosReales(z.name, z.mun);

    z.mun.forEach(nombre => {

      const coord = coordsMunicipios[nombre];
      if (!coord) return;

      const marker = L.circleMarker(coord, {
        radius: 6,
        color: '#fff',
        weight: 2,
        fillColor: '#6F4E37',
        fillOpacity: 1
      }).addTo(this.markersGroup);

      marker.bindTooltip(nombre);

      marker.on('click', () => this.ngZone.run(() => {
        this.selectedRegionData = data;
        this.seleccionarMunicipio(nombre, z.name);
        this.cdr.detectChanges();
      }));

    });

  });
}

  private generarDatosReales(nombre: string, municipios: string[]): IRegionalData {
    const stats: any = (datosCafeDeJson as any).regiones || {};
    const s = stats[nombre] || { alt: "0", prom: 0, prod: "0", var: [], p: 0 };

    return {
      nombreRegion: nombre,
      municipios,
      actoresDetalle: { 
        productores: s.p, cooperativas: 35, acopiadores: 15,
        exportadores: 10, tostadores: 12, proveedores: 20, ayuntamientos: municipios.length
      },
      productoresPorTamano: { 
        small: Math.floor(s.p * 0.9),
        medium: Math.floor(s.p * 0.08),
        large: Math.floor(s.p * 0.02),
        promedioSuperficie: "3.5 ha"
      },
      rangoAltitudinal: s.alt + " msnm",
      altitudPromedio: s.prom,
      variedadesPredominantes: s.var,
      produccionEstimada: 'Alta',
      totalProduccion: s.prod + ' Quintales oro/año'
    };
  }

 public seleccionarMunicipio(nombreMun: string, zona: string) {
  // 1. Navegación y Transición en el Mapa
  const coord = coordsMunicipios[nombreMun];
  if (coord) {
    this.map.flyTo(coord, 12, {
      animate: true,
      duration: 1.5
    });
    
    // Dibujamos los puntos específicos (Clusters y Maduros)
    this.dibujarPuntosLocalidades(nombreMun);
  }

  // 2. Gestión de Datos (Lectura directa desde la raíz del JSON)
  const todos: any = datosCafeDeJson || {};
  
  // Buscamos el municipio. Usamos .trim() por si hay espacios extra
  const datos = todos[nombreMun.trim()];

  if (datos) {
    console.log("¡Datos encontrados para!", nombreMun);
    this.selectedMunicipio = { 
      nombre: nombreMun, 
      zona, 
      ...datos 
    };
    // Cargamos productores si existen en el JSON del municipio
    this.productoresMunicipio = datos.productores || [];
  } else {
    console.warn("No se encontraron datos en el JSON para:", nombreMun);
    // Estado vacío o en proceso si no hay coincidencia
    this.selectedMunicipio = {
      nombre: nombreMun,
      zona,
      actores: {
        productores: "Dato en proceso",
        cooperativas: "Dato en proceso",
        exportacion: "Dato en proceso",
        ayuntamiento: "Dato en proceso"
      },
      infoProductores: {
        perfil: "No disponible",
        promedioFinca: "No disponible"
      },
      altura: "Dato en proceso",
      variedades: ["No especificado"],
      produccionHa: "Dato en proceso",
      clima: "Variado"
    };
    this.productoresMunicipio = [];
  }

  // 3. Forzar actualización de la vista para que la tarjeta se llene
  this.cdr.detectChanges();
}
  public generateReport() {
    if (!this.selectedRegionData) return;

    const d = this.selectedRegionData;
    const doc = new jsPDF();

    doc.setFillColor(0, 59, 111);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.text(`REPORTE REGIONAL: ${d.nombreRegion}`, 15, 25);

    autoTable(doc, {
      startY: 50,
      head: [['Concepto', 'Información']],
      body: [
        ['Municipios', d.municipios.join(', ')],
        ['Producción', d.totalProduccion],
        ['Variedades', d.variedadesPredominantes.join(', ')],
        ['Altura Media', d.altitudPromedio + ' msnm']
      ],
      // 🔥 FIX
      headStyles: { fillColor: [0, 59, 111] }
    });

    doc.save(`Reporte_Cafe_${d.nombreRegion}.pdf`);
  }

  applyFilters() {
    console.log('Filtros aplicados');
  }

public activarListado() {
  this.verListado = true;
  // Hacemos scroll suave hacia la sección del listado
  setTimeout(() => {
    document.getElementById('seccion-listado')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

  abrirDetalle(productor: any) {
    this.pSeleccionado = productor;
  }



// En tu archivo .ts, actualiza o añade estos métodos:




private dibujarPuntosLocalidades(municipio: string) {
  // 1. Limpiamos los marcadores regionales previos
  if (this.markersGroup) {
    this.markersGroup.clearLayers();
  }

  // 2. Obtenemos los datos de productores de este municipio
  // (Asumiendo que vienen en tu JSON de municipios)
  const todos: any = (datosCafeDeJson as any).municipios || {};
  const datosMun = todos[municipio];
  
  if (!datosMun || !datosMun.productores) return;

  // 3. Iteramos sobre los productores/localidades para dibujarlos
  datosMun.productores.forEach((p: any) => {
    
    // Determinamos el estilo según el "Nivel de Madurez" o "Tipo"
    // Si es Cooperativa o Maduro, usamos un color distinto (Amarillo/Oro)
    const esMaduro = p.madurez === 'Maduro' || p.tipo === 'Cooperativa';
    
    const markerOptions = {
      radius: esMaduro ? 9 : 6, // Más grande si es maduro
      fillColor: esMaduro ? '#FFD700' : '#6F4E37', // Oro para maduros, Café para comunes
      color: '#FFFFFF',
      weight: 2,
      fillOpacity: 0.9
    };

    // Usamos las coordenadas del productor/localidad
    // Si el productor no tiene coord propia, podrías usar una pequeña variación 
    // de la coord del municipio para que no se encimen.
    const latlng: [number, number] = p.coords || coordsMunicipios[municipio];

    const marker = L.circleMarker(latlng, markerOptions).addTo(this.markersGroup);

    // 4. Creamos el Popup con el diseño que pediste
    const popupContent = `
      <div style="text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <strong style="color: #6F4E37; font-size: 14px;">${p.nombre}</strong><br>
        <span style="font-size: 12px; color: #666;">${p.localidad || 'Localidad General'}</span>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
        
        ${p.cantidad ? `
          <div style="margin-bottom: 8px;">
            <i class="fas fa-users"></i> <b>${p.cantidad}</b> Productores
          </div>
        ` : ''}

        <p style="font-size: 11px; margin-bottom: 10px;">
          ¿Quieres conocer los productores de nuestro municipio y el perfil de su producto?
        </p>
        
        <button id="btn-lista-${p.clave}" 
                class="btn btn-sm btn-dark" 
                style="background-color: #003b6f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;">
          VER LISTADO
        </button>
      </div>
    `;

    marker.bindPopup(popupContent);

    // 5. Listener para el botón dentro del Popup
    marker.on('popupopen', () => {
      const btn = document.getElementById(`btn-lista-${p.clave}`);
      if (btn) {
        btn.onclick = () => {
          this.ngZone.run(() => {
            this.activarListado();
          });
        };
      }
    });
  });
}

}
