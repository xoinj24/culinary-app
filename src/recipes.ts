import type { Recipe, RecipeFilter } from "./types.js";

export function createRecipe(draft: Omit<Recipe, "id" | "favorite">): Recipe {
  return {
    ...draft,
    id: "recipe-" + Date.now(),
    favorite: false
  };
}

export function deleteRecipe(recipes: Recipe[], id: string): Recipe[] {
  return recipes.filter(recipe => recipe.id !== id);
}

export function toggleFavorite(recipes: Recipe[], id: string): Recipe[] {
  return recipes.map(recipe => 
    recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe
  );
}

export function filterRecipes(recipes: Recipe[], filter: RecipeFilter): Recipe[] {
  return recipes.filter(recipe => {
    const matchesQuery = recipe.title.toLowerCase().includes(filter.query.toLowerCase());
    const matchesCategory = filter.category === "Все" || recipe.category === filter.category;
    const matchesFavorite = !filter.favoritesOnly || recipe.favorite;
    return matchesQuery && matchesCategory && matchesFavorite;
  });
}
