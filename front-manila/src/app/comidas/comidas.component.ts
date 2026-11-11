import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiComidaService } from '../servicios/api-comida.service';
import { CompartirComidasService } from '../servicios/compartir-comidas.service';
import { Comidas } from '../entidades/comidas';

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comidas.component.html',
  styleUrl: './comidas.component.css'
})
export class ComidasComponent implements OnInit {

  // entidad Comidas: nombre e ingrediente de los buscadores, tipo = categoría que se eligió
  comida: Comidas = new Comidas();

  categorias: any[] = [];
  ingredientes: string[] = [];
  lista: any[] = [];

  // qué parte de la página se muestra (categorías o lista de comidas)
  verCategorias: boolean = true;
  verComidas: boolean = false;
  titulo: string = '';
  cargando: boolean = false;
  sinResultados: boolean = false;

  // mensaje que sale cuando se agrega una comida al pedido
  mensajeAgregado: string = '';
  private temporizador: any;

  constructor(private apiComidaService: ApiComidaService, private compartirComidasService: CompartirComidasService) { }

  ngOnInit(): void {
    this.obtenerCategorias();
    this.obtenerIngredientes();
  }

  obtenerCategorias() {
    this.apiComidaService.mostrarComidas('categories.php')
      .then(data => {
        console.log('Datos obtenidos:', data);
        this.categorias = data.categories;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });
  }

  // lista de todos los ingredientes (para sugerirlos en el buscador por ingrediente)
  obtenerIngredientes() {
    this.apiComidaService.listaIngredientesComida()
      .then(data => {
        if (Array.isArray(data.meals)) {
          this.ingredientes = data.meals.map((m: any) => m.strIngredient);
        }
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });
  }

  verCategoria(categoria: string) {
    this.comida.tipo = categoria;
    this.mostrarLista(this.apiComidaService.comidasPorCategoria(categoria), 'Categoría · ' + categoria);
  }

  buscarPorNombre() {
    if (this.comida.nombre.trim() != '') {
      this.comida.tipo = '';
      this.mostrarLista(this.apiComidaService.comidaPorNombre(this.comida.nombre.trim()), 'Nombre · ' + this.comida.nombre);
    }
  }

  buscarPorIngrediente() {
    if (this.comida.ingrediente.trim() != '') {
      this.comida.tipo = '';
      this.mostrarLista(this.apiComidaService.comidasPorIngrediente(this.comida.ingrediente), 'Ingrediente · ' + this.comida.ingrediente);
    }
  }

  volver() {
    this.verCategorias = true;
    this.verComidas = false;
    this.comida.tipo = '';
  }

  // peticion = la consulta a la API que ya se hizo (nombre, ingrediente o categoría)
  mostrarLista(peticion: Promise<any>, titulo: string) {
    this.verCategorias = false;
    this.verComidas = true;
    this.titulo = titulo;
    this.lista = [];
    this.cargando = true;
    this.sinResultados = false;

    peticion
      .then(data => {
        // la API trae "meals" (si no hay resultados no es una lista)
        let meals = data.meals;
        if (!Array.isArray(meals)) {
          meals = [];
        }
        // las listas por categoría o ingrediente no traen los ingredientes, por eso se pide el detalle de cada comida
        const detalles = meals.slice(0, 24).map((m: any) => this.apiComidaService.mostrarComidas('lookup.php?i=' + m.idMeal));
        return Promise.all(detalles);
      })
      .then(respuestas => {
        this.lista = respuestas.map((r: any) => this.armarComida(r.meals[0]));
        this.cargando = false;
        this.sinResultados = this.lista.length == 0;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        this.cargando = false;
        this.sinResultados = true;
      });
  }

  armarComida(m: any) {
    let ingredientes: string[] = [];
    for (let i = 1; i <= 20; i++) {
      if (m['strIngredient' + i]) {
        ingredientes.push(m['strIngredient' + i]);
      }
    }
    return {
      id: m.idMeal,
      tipo: 'comida',
      nombre: m.strMeal,
      foto: m.strMealThumb,
      categoria: m.strCategory + ' · ' + m.strArea,
      ingredientes: ingredientes,
      precio: Math.floor(Math.random() * 35 + 10) * 1000,
      cantidad: 1
    };
  }

  // para mostrar el precio como $12.000 (igual que en el pedido)
  formato(valor: number) {
    return "$" + valor.toLocaleString('es-CO');
  }

  mas(c: any) {
    c.cantidad = c.cantidad + 1;
  }

  menos(c: any) {
    if (c.cantidad > 1) {
      c.cantidad = c.cantidad - 1;
    }
  }

  // manda la comida al pedido (servicio compartir-comidas)
  agregar(c: any) {
    let pedidos = this.compartirComidasService.comidasSignal();
    let existente = pedidos.find((p: any) => p.id == c.id);
    if (existente) {
      existente.cantidad = existente.cantidad + c.cantidad;
    } else {
      pedidos.push({ id: c.id, tipo: c.tipo, nombre: c.nombre, foto: c.foto, precio: c.precio, cantidad: c.cantidad });
    }
    this.compartirComidasService.enviar([...pedidos]);

    this.mostrarMensaje(c.nombre + ' ha sido agregada al pedido');
    c.cantidad = 1;
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
