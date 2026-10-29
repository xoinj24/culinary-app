import type { Category, Recipe, RecipeDraft, RecipeFilter } from "./types.js";
import { initialRecipes } from "./data.js";
import { loadRecipes, saveRecipes } from "./storage.js";
import { createRecipe, deleteRecipe, filterRecipes, toggleFavorite, likeReview } from "./recipes.js";
import {
  searchInput, categoryFilter, favoritesOnly, recipeForm,
  recipeList, formMessage, resultsCount, renderRecipes
} from "./ui.js";

let recipes: Recipe[] = initialRecipes;
saveRecipes(recipes);

function getFilter(): RecipeFilter {
  return {
    query: searchInput.value,
    category: categoryFilter.value as Category | "Все",
    favoritesOnly: favoritesOnly.checked
  };
}

function render(): void {
  renderRecipes(filterRecipes(recipes, getFilter()));
}

function persistAndRender(): void {
  saveRecipes(recipes);
  render();
}

searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);
favoritesOnly.addEventListener("change", render);

recipeList.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest<HTMLButtonElement>("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  if (!id) return;

  if (action === "favorite") {
    recipes = toggleFavorite(recipes, id);
  } else if (action === "delete") {
    recipes = deleteRecipe(recipes, id);
  } else if (action === "like-review") {
    recipes = likeReview(recipes, id); // Логика клика по лайку отзыва
  } else {
    return;
  }
  persistAndRender();
});

recipeForm.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  const titleInput = document.querySelector<HTMLInputElement>("#recipe-title");
  const categoryInput = document.querySelector<HTMLSelectElement>("#recipe-category");
  const servingsInput = document.querySelector<HTMLInputElement>("#recipe-servings");
  const timeInput = document.querySelector<HTMLInputElement>("#recipe-time");
  const ingredientsInput = document.querySelector<HTMLTextAreaElement>("#recipe-ingredients");
  const instructionsInput = document.querySelector<HTMLTextAreaElement>("#recipe-instructions");

  if (!titleInput || !categoryInput || !servingsInput || !timeInput ||
    !ingredientsInput || !instructionsInput) {
    formMessage.textContent = "Ошибка разметки формы.";
    return;
  }

  const title = titleInput.value.trim();
  const servings = Number(servingsInput.value);
  const cookingTime = Number(timeInput.value);
  const ingredients = ingredientsInput.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const instructions = instructionsInput.value.trim();

  if (!title || !instructions || ingredients.length === 0) {
    formMessage.textContent = "Заполните все поля формы.";
    return;
  }

  if (!Number.isFinite(servings) || servings < 1 || servings > 30) {
    formMessage.textContent = "Количество порций должно быть от 1 до 30.";
    return;
  }

  if (!Number.isFinite(cookingTime) || cookingTime < 1 || cookingTime > 600) {
    formMessage.textContent = "Время должно быть от 1 до 600 минут.";
    return;
  }

  const draft: RecipeDraft = {
    title,
    category: categoryInput.value as Category,
    servings,
    cookingTime,
    ingredients,
    instructions
  };

  recipes = [createRecipe(draft), ...recipes];
  recipeForm.reset();
  formMessage.textContent = "Рецепт добавлен.";
  persistAndRender();
});

render();
