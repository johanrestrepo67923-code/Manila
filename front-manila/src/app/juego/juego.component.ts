import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiComidaService } from '../servicios/api-comida.service';
import { ApiBebidaService } from '../servicios/api-bebida.service';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.css'
})
export class JuegoComponent implements OnInit {

  celdas: any[] = [];
  imgPlato: string = "";
  imgBebida: string = "";
  posPlato: number = -1;
  posBebida: number = -1;
  encontroPlato: boolean = false;
  encontroBebida: boolean = false;
  intentos: number = 0;
  ronda: number = 1;
  mensaje: string = "";
  bloqueado: boolean = false;

  private platformId = inject(PLATFORM_ID);

  constructor(private apiComidaService: ApiComidaService, private apiBebidaService: ApiBebidaService) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.iniciar();
    }
  }

  // trae una foto de un plato y una de una bebida (random de cada API) y arma la matriz
  iniciar() {
    this.bloqueado = true;
    this.mensaje = "Preparando el tablero…";

    this.apiComidaService.mostrarComidas('random.php')
      .then(data => {
        this.imgPlato = data.meals[0].strMealThumb;
        return this.apiBebidaService.mostrarBebidas('random.php');
      })
      .then(data => {
        this.imgBebida = data.drinks[0].strDrinkThumb;
        this.ubicar();
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        this.mensaje = "No se pudieron cargar las imágenes. Revisa tu conexión.";
      });
  }

  // matriz de 4x4 (16 casillas): el plato y la bebida quedan en posiciones diferentes a las de la ronda anterior
  ubicar() {
    const anteriorPlato = this.posPlato;
    const anteriorBebida = this.posBebida;
    do {
      this.posPlato = Math.floor(Math.random() * 16);
      this.posBebida = Math.floor(Math.random() * 16);
    } while (this.posPlato == this.posBebida || this.posPlato == anteriorPlato || this.posBebida == anteriorBebida);

    this.celdas = [];
    for (let i = 0; i < 16; i++) {
      let tipo = "";
      if (i == this.posPlato) {
        tipo = "plato";
      } else if (i == this.posBebida) {
        tipo = "bebida";
      }
      // esPlato, esBebida, vacia y especial son las banderas que usa el HTML (así no lleva comparaciones)
      this.celdas.push({
        numero: i + 1,
        tipo: tipo,
        abierta: false,
        esPlato: tipo == "plato",
        esBebida: tipo == "bebida",
        vacia: tipo == "",
        especial: tipo != ""
      });
    }

    this.encontroPlato = false;
    this.encontroBebida = false;
    this.intentos = 0;
    this.bloqueado = false;
    this.mensaje = "Encuentra el plato 🍽️ y la bebida 🍹";
  }

  elegir(c: any) {
    if (this.bloqueado || c.abierta) {
      return;
    }
    c.abierta = true;
    this.intentos = this.intentos + 1;

    if (c.tipo == "plato") {
      this.encontroPlato = true;
      this.mensaje = "¡Encontraste el plato! Ahora la bebida.";
    } else if (c.tipo == "bebida") {
      this.encontroBebida = true;
      this.mensaje = "¡Encontraste la bebida! Ahora el plato.";
    } else {
      this.mensaje = "Nada por aquí… sigue buscando.";
    }

    // cuando se encuentran los dos, el juego se inicia otra vez con las imágenes en otras posiciones
    if (this.encontroPlato && this.encontroBebida) {
      this.bloqueado = true;
      this.mensaje = "¡Los encontraste en " + this.intentos + " intentos! Nueva ronda…";
      setTimeout(() => {
        this.ronda = this.ronda + 1;
        this.iniciar();
      }, 2200);
    }
  }

  reiniciar() {
    this.ronda = 1;
    this.iniciar();
  }
}
