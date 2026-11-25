export const CATEGORY_LABELS = {
    "Завтрак": "Утренние блюда",
    "Обед": "Основные блюда",
    "Ужин": "Вечерние блюда",
    "Десерт": "Сладкие блюда",
};
export function createRecipe(draft) {
    return {
        ...draft,
        id: "recipe-" + Date.now(),
        favorite: false,
    };
}
export function deleteRecipe(recipes, id) {
    return recipes.filter((recipe) => recipe.id !== id);
}
export function toggleFavorite(recipes, id) {
    return recipes.map((recipe) => recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe);
}
export function filterRecipes(recipes, filter) {
    return recipes.filter((recipe) => {
        const matchesQuery = recipe.title.toLowerCase().includes(filter.query.toLowerCase());
        const matchesCategory = filter.category === "Все" || recipe.category === filter.category;
        const matchesFavorite = !filter.favoritesOnly || recipe.favorite;
        return matchesQuery && matchesCategory && matchesFavorite;
    });
}
export function sortRecipes(recipes, key, direction) {
    const multiplier = direction === "asc" ? 1 : -1;
    return [...recipes].sort((a, b) => {
        const left = a[key];
        const right = b[key];
        if (typeof left === "number" && typeof right === "number") {
            return (left - right) * multiplier;
        }
        return String(left).localeCompare(String(right), "ru") * multiplier;
    });
}
