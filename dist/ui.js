function requireElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Не найден элемент: ${selector}`);
    }
    return element;
}
export const searchInput = requireElement("#search");
export const categoryFilter = requireElement("#category-filter");
export const favoritesOnly = requireElement("#favorites-only");
export const recipeForm = requireElement("#recipe-form");
export const recipeList = requireElement("#recipe-list");
export const formMessage = requireElement("#form-message");
export const resultsCount = requireElement("#results-count");
export function renderRecipes(recipes) {
    recipeList.replaceChildren();
    resultsCount.textContent = `Найдено рецептов: ${recipes.length}`;
    if (recipes.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Ничего не найдено. Измените фильтр.";
        recipeList.append(empty);
        return;
    }
    for (const recipe of recipes) {
        const card = document.createElement("article");
        card.className = "recipe-card";
        const title = document.createElement("h3");
        title.textContent = recipe.title;
        const meta = document.createElement("p");
        meta.textContent = `${recipe.category} · ${recipe.cookingTime} мин. · ${recipe.servings} порц.`;
        const ingredients = document.createElement("p");
        ingredients.textContent = `Ингредиенты: ${recipe.ingredients.join(", ")}`;
        const instructions = document.createElement("p");
        instructions.textContent = recipe.instructions;
        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.dataset.action = "favorite";
        favoriteButton.dataset.id = recipe.id;
        favoriteButton.textContent = recipe.favorite ? "★ Убрать из избранного" : "☆ В избранное";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = recipe.id;
        deleteButton.textContent = "Удалить";
        // --- БЛОК ОТЗЫВОВ ---
        const reviewsSection = document.createElement("div");
        reviewsSection.className = "reviews-section";
        const reviewsTitle = document.createElement("h4");
        reviewsTitle.textContent = `Отзывы (${recipe.reviews.length})`;
        reviewsSection.append(reviewsTitle);
        if (recipe.reviews.length === 0) {
            const noReviews = document.createElement("p");
            noReviews.textContent = "Отзывов пока нет.";
            reviewsSection.append(noReviews);
        }
        else {
            for (const review of recipe.reviews) {
                const reviewDiv = document.createElement("div");
                reviewDiv.className = "review-item";
                const reviewAuthor = document.createElement("strong");
                reviewAuthor.textContent = `${review.author}: `;
                const reviewText = document.createTextNode(review.text);
                const likeReviewBtn = document.createElement("button");
                likeReviewBtn.type = "button";
                likeReviewBtn.className = "like-review-btn";
                likeReviewBtn.dataset.action = "like-review";
                likeReviewBtn.dataset.id = review.id;
                likeReviewBtn.textContent = `${review.likes}`;
                reviewDiv.append(reviewAuthor, reviewText, likeReviewBtn);
                reviewsSection.append(reviewDiv);
            }
        }
        // --------------------
        card.append(title, meta, ingredients, instructions, favoriteButton, deleteButton, reviewsSection);
        recipeList.append(card);
    }
}
