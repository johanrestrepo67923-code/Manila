import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompartirComidasService } from '../servicios/compartir-comidas.service';
import { CompartirBebidasService } from '../servicios/compartir-bebidas.service';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navegacion.component.html',
  styleUrl: './navegacion.component.css'
})
export class NavegacionComponent {

  abierto: boolean = false;

  opcionesInicio = { exact: true };

  constructor(private compartirComidasService: CompartirComidasService, private compartirBebidasService: CompartirBebidasService) { }


  alternarMenu() {
    this.abierto = !this.abierto;
  }

  cerrarMenu() {
    this.abierto = false;
  }

  contar() {
    let cantidad = 0;
    this.compartirComidasService.comidasSignal().forEach((p: any) => {
      cantidad = cantidad + p.cantidad;
    });
    this.compartirBebidasService.bebidasSignal().forEach((p: any) => {
      cantidad = cantidad + p.cantidad;
    });
    return cantidad;
  }


  hayProductos() {
    return this.contar() > 0;
  }
}
