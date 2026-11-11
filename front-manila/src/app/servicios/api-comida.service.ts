import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiComidaService {

  constructor() { }

  private linkComidaPorNombre = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

  comidaPorNombre(nombre: string) {
    return fetch(this.linkComidaPorNombre + encodeURIComponent(nombre))
      .then(response => response.json())
      .then(data => {
        console.log(data);
        return data;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        throw error;
      });
  }

  private linkListaIngredientesComida = "https://www.themealdb.com/api/json/v1/1/list.php?i=list";

  listaIngredientesComida() {
    return fetch(this.linkListaIngredientesComida)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        return data;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        throw error;
      });
  }

  private linkComidasPorCategoria = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";

  comidasPorCategoria(categoria: string) {
    return fetch(this.linkComidasPorCategoria + encodeURIComponent(categoria))
      .then(response => response.json())
      .then(data => {
        console.log(data);
        return data;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        throw error;
      });
  }

  private linkComidasPorIngrediente = "https://www.themealdb.com/api/json/v1/1/filter.php?i=";

  comidasPorIngrediente(ingrediente: string) {
    return fetch(this.linkComidasPorIngrediente + encodeURIComponent(ingrediente.trim().replace(/\s+/g, '_')))
      .then(response => response.json())
      .then(data => {
        console.log(data);
        return data;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        throw error;
      });
  }

  private urlComidas = "https://www.themealdb.com/api/json/v1/1/";

  mostrarComidas(parametros: string) {
    return fetch(this.urlComidas + parametros)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        return data;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        throw error;
      });
  }
}
