import { parseRecipe, parseRecipes } from "./parse.js";
import type { NewRecipe, Recipe, RecipeUpdate } from "./types.js";

const API_URL = "http://localhost:3001/recipes";

async function request(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Сервер вернул ошибку: ${response.status}`);
  }

  const data: unknown = await response.json();
  return data;
}

export async function fetchRecipes(
  query = "",
  signal?: AbortSignal
): Promise<Recipe[]> {
  const text = query.trim();
  const url = text
    ? `${API_URL}?title_like=${encodeURIComponent(text)}`
    : API_URL;

  return parseRecipes(await request(url, { signal }));
}

export type FetchRecipesResult = Awaited<ReturnType<typeof fetchRecipes>>;
export type FetchRecipesArguments = Parameters<typeof fetchRecipes>;

export async function createRecipeOnServer(
  recipe: NewRecipe
): Promise<Recipe> {
  const data = await request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });
  return parseRecipe(data);
}

export async function setFavorite(
  id: string,
  favorite: boolean
): Promise<Recipe> {
  const data = await request(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ favorite }),
  });
  return parseRecipe(data);
}

export async function deleteRecipeOnServer(id: string): Promise<void> {
  await request(`${API_URL}/${id}`, { method: "DELETE" });
}

export async function updateRecipeOnServer(
  id: Recipe["id"],
  changes: RecipeUpdate
): Promise<Recipe> {
  const data = await request(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });

  return parseRecipe(data);
}
