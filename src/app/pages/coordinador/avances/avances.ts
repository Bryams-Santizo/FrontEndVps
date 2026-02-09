import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avances',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avances.html',
  styleUrls: ['./avances.css']
})
export class Avances {
  avances: string[] = [];

  subirArchivo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avances.push(file.name);
      alert(`Archivo "${file.name}" cargado (simulación)`);
    }
  }
}
