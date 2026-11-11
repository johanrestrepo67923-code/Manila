import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiBebidaService } from '../servicios/api-bebida.service';
import { CompartirBebidasService } from '../servicios/compartir-bebidas.service';
import { Bebidas } from '../entidades/bebidas';

@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bebidas.component.html',
  styleUrl: './bebidas.component.css'
})
export class BebidasComponent implements OnInit {

  // entidad Bebidas: nombre, ingrediente y tipo (alcohólica o sin alcohol) de los buscadores
  bebida: Bebidas = new Bebidas();

  categorias: any[] = [];
  lista: any[] = [];
  ingredienteInfo: any = null;

  // qué parte de la página se muestra (categorías o lista de bebidas)
  verCategorias: boolean = true;
  verBebidas: boolean = false;
  titulo: string = '';
  cargando: boolean = false;
  cargandoCategorias: boolean = false;
  sinResultados: boolean = false;

  // mensaje que sale cuando se agrega una bebida al pedido
  mensajeAgregado: string = '';
  private temporizador: any;

  constructor(private apiBebidaService: ApiBebidaService, private compartirBebidasService: CompartirBebidasService) { }

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  // las categorías (cada una trae su imagen desde el servicio)
  obtenerCategorias() {
    this.cargandoCategorias = true;
    this.apiBebidaService.categoriasBebida()
      .then(data => {
        this.categorias = data;
        this.cargandoCategorias = false;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        this.cargandoCategorias = false;
      });
  }

  // "Ver bebidas" de una categoría
  verCategoria(categoria: string) {
    this.bebida.tipo = '';
    this.ingredienteInfo = null;
    this.mostrarLista(this.apiBebidaService.bebidasPorCategoria(categoria), 'Categoría · ' + categoria);
  }

  // regresar a todas las categorías
  volver() {
    this.verCategorias = true;
    this.verBebidas = false;
    this.bebida.tipo = '';
    this.ingredienteInfo = null;
  }

  // 1. Coctel por nombre
  buscarPorNombre() {
    if (this.bebida.nombre.trim() != '') {
      this.ingredienteInfo = null;
      this.mostrarLista(this.apiBebidaService.bebidaPorNombre(this.bebida.nombre.trim()), 'Cóctel · ' + this.bebida.nombre);
    }
  }

  // 2. Ingrediente por nombre (muestra la información del ingrediente y las bebidas que lo llevan)
  buscarPorIngrediente() {
    if (this.bebida.ingrediente.trim() != '') {
      this.ingredienteInfo = null;
      this.apiBebidaService.ingredienteBebida(this.bebida.ingrediente.trim())
        .then(data => {
          if (Array.isArray(data.ingredients)) {
            this.ingredienteInfo = data.ingredients[0];
          }
        })
        .catch(error => {
          console.error('Error al obtener los datos:', error);
        });
      this.mostrarLista(this.apiBebidaService.bebidasPorIngrediente(this.bebida.ingrediente.trim()), 'Bebidas con ' + this.bebida.ingrediente);
    }
  }

  // 3. Filtrar por tipo de bebida (alcohólica, sin alcohol)
  filtrarTipo() {
    if (this.bebida.tipo != '') {
      this.ingredienteInfo = null;
      // una sola url: bebida.tipo es "Alcoholic" o "Non_Alcoholic"
      const peticion = this.apiBebidaService.bebidasPorAlcohol(this.bebida.tipo);
      this.mostrarLista(peticion, 'Tipo · ' + (this.bebida.tipo == 'Alcoholic' ? 'Alcohólica' : 'Sin alcohol'));
    }
  }

  // peticion = la consulta a la API que ya se hizo (nombre, ingrediente, tipo o categoría)
  mostrarLista(peticion: Promise<any>, titulo: string) {
    this.verCategorias = false;
    this.verBebidas = true;
    this.titulo = titulo;
    this.lista = [];
    this.cargando = true;
    this.sinResultados = false;

    peticion
      .then(data => {
        // la API trae "drinks" (si no hay resultados no es una lista)
        let drinks = data.drinks;
        if (!Array.isArray(drinks)) {
          drinks = [];
        }
        // los filtros no traen los ingredientes, por eso se pide el detalle de cada bebida
        const detalles = drinks.slice(0, 24).map((d: any) => this.apiBebidaService.mostrarBebidas('lookup.php?i=' + d.idDrink));
        return Promise.all(detalles);
      })
      .then(respuestas => {
        this.lista = respuestas.map((r: any) => this.armarBebida(r.drinks[0]));
        this.cargando = false;
        this.sinResultados = this.lista.length == 0;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        this.cargando = false;
        this.sinResultados = true;
      });
  }

  // la API no trae el precio, se asigna uno aleatorio
  armarBebida(d: any) {
    let ingredientes: string[] = [];
    for (let i = 1; i <= 15; i++) {
      if (d['strIngredient' + i]) {
        ingredientes.push(d['strIngredient' + i]);
      }
    }
    return {
      id: d.idDrink,
      tipo: 'bebida',
      nombre: d.strDrink,
      foto: d.strDrinkThumb,
      categoria: d.strCategory + ' · ' + d.strAlcoholic,
      ingredientes: ingredientes,
      precio: Math.floor(Math.random() * 35 + 10) * 1000,
      cantidad: 1
    };
  }

  // para mostrar el precio como $12.000 (igual que en el pedido)
  formato(valor: number) {
    return "$" + valor.toLocaleString('es-CO');
  }

  mas(b: any) {
    b.cantidad = b.cantidad + 1;
  }

  menos(b: any) {
    if (b.cantidad > 1) {
      b.cantidad = b.cantidad - 1;
    }
  }

  // manda la bebida al pedido (servicio compartir-bebidas)
  agregar(b: any) {
    let pedidos = this.compartirBebidasService.bebidasSignal();
    let existente = pedidos.find((p: any) => p.id == b.id);
    if (existente) {
      existente.cantidad = existente.cantidad + b.cantidad;
    } else {
      pedidos.push({ id: b.id, tipo: b.tipo, nombre: b.nombre, foto: b.foto, precio: b.precio, cantidad: b.cantidad });
    }
    this.compartirBebidasService.enviar([...pedidos]);

    this.mostrarMensaje(b.nombre + ' ha sido agregada al pedido');
    b.cantidad = 1;
  }

  // muestra el mensaje unos segundos y luego lo quita
  mostrarMensaje(texto: string) {
    this.mensajeAgregado = '✓ ' + texto;
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.mensajeAgregado = '';
    }, 2500);
  }
}
