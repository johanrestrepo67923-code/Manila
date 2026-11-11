import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiComidaService } from '../servicios/api-comida.service';
import { ApiBebidaService } from '../servicios/api-bebida.service';
import { Comidas } from '../entidades/comidas';
import { Bebidas } from '../entidades/bebidas';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  // plato y bebida estrella (entidades Comidas y Bebidas); la foto viene de la API
  plato: Comidas = new Comidas();
  bebida: Bebidas = new Bebidas();
  fotoPlato: string = "";
  fotoBebida: string = "";

  // para mostrar el plato / la bebida o el cuadro de "cargando"
  platoListo: boolean = false;
  platoCargando: boolean = true;
  bebidaLista: boolean = false;
  bebidaCargando: boolean = true;

  // todas las fotos de esta página vienen de las APIs (TheMealDB y TheCocktailDB)
  carrusel: any[] = [];
  mosaico: any[] = [];

  constructor(private apiComidaService: ApiComidaService, private apiBebidaService: ApiBebidaService) { }

  ngOnInit(): void {
    this.obtenerPlato();
    this.obtenerBebida();
    this.obtenerCarrusel();
    this.obtenerMosaico();
  }

  // el plato y la bebida estrella cambian según el día del mes
  obtenerPlato() {
    const platos = ['52772', '52959', '52771', '52874', '52977'];
    const dia = new Date().getDate();

    this.apiComidaService.mostrarComidas('lookup.php?i=' + platos[dia % platos.length])
      .then(data => {
        const m = data.meals[0];
        let ingredientes: string[] = [];
        for (let i = 1; i <= 20; i++) {
          if (m['strIngredient' + i]) {
            ingredientes.push(m['strIngredient' + i]);
          }
        }
        this.plato.nombre = m.strMeal;
        this.plato.tipo = m.strCategory + ' · ' + m.strArea;
        this.plato.ingrediente = ingredientes.slice(0, 5).join(' · ');
        this.fotoPlato = m.strMealThumb;
        this.platoListo = true;
        this.platoCargando = false;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });
  }

  obtenerBebida() {
    const bebidas = ['11001', '11007', '11000', '11002', '11003'];
    const dia = new Date().getDate();

    this.apiBebidaService.mostrarBebidas('lookup.php?i=' + bebidas[dia % bebidas.length])
      .then(data => {
        const d = data.drinks[0];
        let ingredientes: string[] = [];
        for (let i = 1; i <= 15; i++) {
          if (d['strIngredient' + i]) {
            ingredientes.push(d['strIngredient' + i]);
          }
        }
        this.bebida.nombre = d.strDrink;
        this.bebida.tipo = d.strCategory + ' · ' + d.strAlcoholic;
        this.bebida.ingrediente = ingredientes.slice(0, 5).join(' · ');
        this.fotoBebida = d.strDrinkThumb;
        this.bebidaLista = true;
        this.bebidaCargando = false;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });
  }

  // carrusel de la portada: 3 platos japoneses de la API
  obtenerCarrusel() {
    this.apiComidaService.mostrarComidas('filter.php?a=Japanese')
      .then(data => {
        if (Array.isArray(data.meals)) {
          this.carrusel = data.meals.slice(0, 3).map((m: any) => ({ nombre: m.strMeal, foto: m.strMealThumb }));
        }
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });
  }

  // mosaico de "Nuestra historia": 3 platos y 2 bebidas de las APIs
  obtenerMosaico() {
    const platos = this.apiComidaService.mostrarComidas('filter.php?c=Seafood');
    const bebidas = this.apiBebidaService.mostrarBebidas('filter.php?c=Cocktail');

    Promise.all([platos, bebidas])
      .then(([comidas, tragos]) => {
        let fotos: any[] = [];
        if (Array.isArray(comidas.meals)) {
          fotos = comidas.meals.slice(0, 3).map((m: any) => ({ nombre: m.strMeal, foto: m.strMealThumb }));
        }
        if (Array.isArray(tragos.drinks)) {
          fotos = fotos.concat(tragos.drinks.slice(0, 2).map((d: any) => ({ nombre: d.strDrink, foto: d.strDrinkThumb })));
        }
        this.mosaico = fotos;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });
  }
}
