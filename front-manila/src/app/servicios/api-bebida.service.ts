import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiBebidaService {

  constructor() { }

  // 1. Coctel por nombre
  private linkBebidaPorNombre = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=";

  bebidaPorNombre(nombre: string) {
    return fetch(this.linkBebidaPorNombre + encodeURIComponent(nombre))
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

  // 2. Ingrediente por nombre (información del ingrediente)
  private linkIngredienteBebida = "https://www.thecocktaildb.com/api/json/v1/1/search.php?i=";

  ingredienteBebida(ingrediente: string) {
    return fetch(this.linkIngredienteBebida + encodeURIComponent(ingrediente))
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (Array.isArray(data.ingredients) && data.ingredients.length > 0) {
          data.ingredients[0].imagen = "https://www.thecocktaildb.com/images/ingredients/" + encodeURIComponent(data.ingredients[0].strIngredient) + "-Medium.png";
        }
        return data;
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        throw error;
      });
  }

  private linkBebidasPorIngrediente = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=";

  bebidasPorIngrediente(ingrediente: string) {
    return fetch(this.linkBebidasPorIngrediente + encodeURIComponent(ingrediente))
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

  
  private linkBebidasPorAlcohol = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=";

  bebidasPorAlcohol(alcohol: string) {
    return fetch(this.linkBebidasPorAlcohol + encodeURIComponent(alcohol))
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

  private linkBebidasPorCategoria = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=";

  bebidasPorCategoria(categoria: string) {
    return fetch(this.linkBebidasPorCategoria + encodeURIComponent(categoria))
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


  private urlBebidas = "https://www.thecocktaildb.com/api/json/v1/1/";

  mostrarBebidas(parametros: string) {
    return fetch(this.urlBebidas + parametros)
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

  categoriasBebida() {
    return this.mostrarBebidas('list.php?c=list')
      .then(data => {
        const categorias = data.drinks ?? [];
        return Promise.all(
          categorias.map((categoria: any) =>
            this.bebidasPorCategoria(categoria.strCategory)
              .then(bebidas => ({
                ...categoria,
                imagen: bebidas.drinks?.[0]?.strDrinkThumb ?? ''
              }))
          )
        );
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
        throw error;
      });
  }
}
