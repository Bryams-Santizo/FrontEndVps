import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import actoresJson from '../../../assets/data/actores.json';
import datosCafeDeJson from '../../../assets/data/regiones-cafe.json';
import coordsMunicipiosJson from '../../../assets/data/coords.json';
import iconMapJson from '../../../assets/data/iconMap.json';
import data from '../../../assets/data/regiones-cafe.json';
const iconMap = iconMapJson as Record<string, string>;
const coordsMunicipios = coordsMunicipiosJson as unknown as Record<string, [number, number]>;

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

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

public vistaActual: 'productores' | 'empresas' | 'institutos' = 'productores';
public empresasMunicipio: any[] = [];
public institutosMunicipio: any[] = [];
public modoTabla: boolean = true;
municipios: any[] = [];

public filtroEslabon: string = '';
public filtroCertificacion: string = '';
public actoresData: any = actoresJson;
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
  public eslabones: string[] = ['productores', 'cooperativas', 'exportacion', 'ayuntamiento'];
  public certificaciones: string[] = ['Orgánico', 'Fair Trade', 'Rainforest'];
  public productoresMunicipio: any[] = [];
  



  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private ngZone: NgZone, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.municipios = Object.entries(data).map(([nombre, info]: any) => ({
    nombre,
    ...info
  }));
}

  async ngAfterViewInit() {

    document.addEventListener('abrirListado', () => {
  this.ngZone.run(() => {
    this.activarListado();
  });
});

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
crearIconoHTML(tipo: string) {
  const icono = this.obtenerIcono(tipo);

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px;
        height:32px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:16px;
        background:${this.getColor(tipo)};
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      ">
        <i class="bi ${icono}"></i>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}
getColor(tipo: string): string {
  switch (tipo) {
    case 'productores': return '#28a745';
    case 'empresas': return '#0d6efd';
    case 'cooperativas': return '#ffc107';
    case 'institutos': return '#6f42c1';
    default: return '#6c757d';
  }
}

obtenerIcono(tipo: string): string {
  return iconMap[tipo] || 'bi-circle';
}
  private seleccionarEstado(feature: any) {
    const nombre = feature.properties.name;
    this.nombreEstadoSeleccionado = nombre;

    const bounds = L.geoJSON(feature).getBounds();

    // 🔥 FIX
    this.map.flyToBounds(bounds, { padding: [20, 20], duration: 1.2 });

    if (this.markersGroup) {
  this.markersGroup.clearLayers();
}

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
  this.markersGroup.clearLayers();

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

     const key = Object.keys(coordsMunicipios).find(k => normalizar(k) === normalizar(nombre));
const coord = key ? coordsMunicipios[key] : null;

      if (!coord) {
  console.warn("No hay coordenadas para:", nombre);
  return;
}
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
  // 1. Mover mapa al municipio
  const coord = coordsMunicipios[nombreMun];
  if (coord) {
    this.map.flyTo(coord, 12, { animate: true, duration: 1.5 });
    this.markersGroup.clearLayers();
    this.dibujarPuntosLocalidades(nombreMun);
  }

  // 2. Obtener datos geográficos/estadísticos (para el MODAL) desde datos-cafe.json
  const todosRegiones = datosCafeDeJson as Record<string, any>;
  const keyRegion = Object.keys(todosRegiones).find(k => k.toLowerCase() === nombreMun.toLowerCase());
  const datosRegionales = keyRegion ? todosRegiones[keyRegion] : null;

  // 3. Obtener datos de actores (para las TABLAS) desde el nuevo actores.json
  // Intentamos buscar por nombre exacto o por la abreviatura que usa el mapa
  const nombreParaActores = nombreMun === 'Frontera Comalapa' ? 'F. Comalapa' : nombreMun;
  const datosActores = this.actoresData[nombreParaActores] || this.actoresData[nombreMun];

  // 4. COMBINACIÓN DE DATOS
  if (datosRegionales || datosActores) {
    // Para el MODAL: Mezclamos la zona, los datos regionales y lo que venga de actores
    this.selectedMunicipio = { 
      nombre: nombreMun, 
      zona: zona, 
      ...datosRegionales, // Aquí vienen altura, clima, producciónHa, etc.
      actores: datosRegionales?.actores || datosActores?.resumenActores // Prioriza el contador del modal
    };

    // Para las TABLAS: Priorizamos la lista masiva de actores.json
    this.productoresMunicipio = datosActores?.productores || datosRegionales?.productores || [];
    this.empresasMunicipio = datosActores?.empresas || datosRegionales?.empresas || [];
    this.institutosMunicipio = datosActores?.institutos || datosRegionales?.institutos || [];

  } else {
    // Reset si no hay nada
    this.selectedMunicipio = null;
    this.productoresMunicipio = [];
    this.empresasMunicipio = [];
    this.institutosMunicipio = [];
  }

  // 5. Activar vista y detectar cambios
  this.verListado = true;
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

  if (!this.selectedMunicipio) return;

  this.markersGroup.clearLayers();

  const todos = datosCafeDeJson as Record<string, any>;
  const key = Object.keys(todos).find(
    k => k.toLowerCase() === this.selectedMunicipio!.nombre.toLowerCase()
  );

  const mun = key ? todos[key] : null;
  if (!mun) return;

  const lista = [
    ...(mun.productores || []),
    ...(mun.empresas || []),
    ...(mun.institutos || [])
  ];

  const filtrados = lista.filter((item: any) => {

    const cumpleEslabon = this.filtroEslabon
      ? item.tipo === this.filtroEslabon
      : true;

    const cumpleCertificacion = this.filtroCertificacion
      ? (item.certificaciones || []).includes(this.filtroCertificacion)
      : true;

    return cumpleEslabon && cumpleCertificacion;
  });

  filtrados.forEach((item: any) => {

    if (!item.coords) return;

    L.marker(item.coords, {
      icon: this.crearIconoHTML(item.tipo || 'productores')
    }).addTo(this.markersGroup);

  });
}

private dibujarSoloTipo(lista: any[], tipo: string) {
  lista.forEach((item: any) => {

   
    if (!item.coords) return;
const latlng = item.coords;

    L.marker(latlng, {
      icon: this.crearIconoHTML(tipo)
    }).addTo(this.markersGroup);
  });
}

get municipiosFiltrados() {
  return this.municipios.filter(m => {

    const cumpleEslabon = this.filtroEslabon
      ? m.actores?.[this.filtroEslabon]
      : true;

    const cumpleCertificacion = this.filtroCertificacion
      ? (m.certificaciones || []).includes(this.filtroCertificacion)
      : true;

    return cumpleEslabon && cumpleCertificacion;
  });
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


private dibujarPuntosLocalidades(municipio: string) {

  const todos = datosCafeDeJson as Record<string, any>;
  const datosMun = todos[municipio];

  if (!datosMun) return;

  const lista = [
    ...(datosMun.productores || []),
    ...(datosMun.empresas || []),
    ...(datosMun.institutos || [])
  ];

  lista.forEach((p: any) => {

    const tipo = p.tipo || 'productores';
    const latlng: [number, number] = p.coords || coordsMunicipios[municipio];

    const marker = L.marker(latlng, {
      icon: this.crearIconoHTML(tipo)
    }).addTo(this.markersGroup);

    marker.bindPopup(`
      <div style="text-align:center;">
        <strong>${p.nombre}</strong><br>
        <small>${tipo}</small>
      </div>
    `);
  });
}

cambiarVista(vista: 'productores' | 'empresas' | 'institutos') {
  this.vistaActual = vista;
}

private calcularCentro(municipios: string[]): [number, number] {
  let lat = 0, lng = 0, count = 0;

  municipios.forEach(m => {
    const coord = coordsMunicipios[m];
    if (coord) {
      lat += coord[0];
      lng += coord[1];
      count++;
    }
  });

  return [lat / count, lng / count];
}

regresarMapa() {
  this.verListado = false;
  this.selectedMunicipio = null;
  this.selectedRegionData = null;
  this.cargarMapaCompleto();
}


}
