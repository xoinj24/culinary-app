export function createRecipe(draft) {
    return {
        ...draft,
        id: "recipe-" + Date.now(),
        favorite: false,
        reviews: []
    };
}
export function deleteRecipe(recipes, id) {
    return recipes.filter(recipe => recipe.id !== id);
}
export function toggleFavorite(recipes, id) {
    return recipes.map(recipe => recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe);
}
export function likeReview(recipes, reviewId) {
    return recipes.map(recipe => ({
        ...recipe,
        reviews: recipe.reviews.map(review => review.id === reviewId ? { ...review, likes: review.likes + 1 } : review)
    }));
}
export function filterRecipes(recipes, filter) {
    return recipes.filter(recipe => {
        const matchesQuery = recipe.title.toLowerCase().includes(filter.query.toLowerCase());
        const matchesCategory = filter.category === "Все" || recipe.category === filter.category;
        const matchesFavorite = !filter.favoritesOnly || recipe.favorite;
        return matchesQuery && matchesCategory && matchesFavorite;
    });
}
