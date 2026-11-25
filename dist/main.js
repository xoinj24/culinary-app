import { createRecipeOnServer, deleteRecipeOnServer, fetchRecipes, setFavorite, updateRecipeOnServer, } from "./api.js";
import { isCategory } from "./parse.js";
import { assertNever, errorMessage } from "./state.js";
import { debounce } from "./debounce.js";
import { withRetry } from "./retry.js";
import { deleteRecipe, filterRecipes, sortRecipes } from "./recipes.js";
import { cancelEditButton, categoryFilter, editMessage, editRecipeCategory, editRecipeForm, editRecipeId, editRecipeIngredients, editRecipeInstructions, editRecipeServings, editRecipeTime, editRecipeTitle, favoritesOnly, formMessage, recipeForm, recipeList, renderMessage, renderRecipes, retryButton, searchInput, sortDirectionSelect, sortKeySelect, } from "./ui.js";
let state = { status: "loading" };
function setState(next) {
    state = next;
    render();
}
function getFilter() {
    return {
        query: searchInput.value,
        category: categoryFilter.value,
        favoritesOnly: favoritesOnly.checked,
    };
}
function isSortKey(value) {
    return value === "title" || value === "servings" || value === "cookingTime";
}
function render() {
    retryButton.hidden = state.status !== "error";
    switch (state.status) {
        case "loading":
            renderMessage("Загружаем рецепты...");
            break;
        case "error":
            renderMessage(`Не удалось загрузить: ${state.message}`);
            break;
        case "success": {
            const filtered = filterRecipes(state.recipes, getFilter());
            const sortKey = sortKeySelect.value;
            const direction = sortDirectionSelect.value === "desc" ? "desc" : "asc";
            const prepared = isSortKey(sortKey)
                ? sortRecipes(filtered, sortKey, direction)
                : filtered;
            renderRecipes(prepared);
            break;
        }
        default:
            assertNever(state);
    }
}
function updateRecipes(change) {
    if (state.status !== "success")
        return;
    setState({ status: "success", recipes: change(state.recipes) });
}
let controller;
async function search() {
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    try {
        const recipes = await fetchRecipes(searchInput.value, signal);
        setState({ status: "success", recipes });
    }
    catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }
        setState({ status: "error", message: errorMessage(error) });
    }
}
searchInput.addEventListener("input", debounce(() => void search(), 300));
categoryFilter.addEventListener("change", render);
favoritesOnly.addEventListener("change", render);
sortKeySelect.addEventListener("change", render);
sortDirectionSelect.addEventListener("change", render);
retryButton.addEventListener("click", () => void init());
cancelEditButton.addEventListener("click", () => {
    editRecipeForm.reset();
    editRecipeForm.hidden = true;
});
recipeList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement))
        return;
    const button = target.closest("button[data-action]");
    const id = button?.dataset.id;
    const action = button?.dataset.action;
    if (!id || !action || state.status !== "success")
        return;
    if (action === "edit") {
        const current = state.recipes.find((recipe) => recipe.id === id);
        if (!current)
            return;
        editRecipeId.value = current.id;
        editRecipeTitle.value = current.title;
        editRecipeCategory.value = current.category;
        editRecipeServings.value = String(current.servings);
        editRecipeTime.value = String(current.cookingTime);
        editRecipeIngredients.value = current.ingredients.join(", ");
        editRecipeInstructions.value = current.instructions;
        editMessage.textContent = "";
        editRecipeForm.hidden = false;
        editRecipeForm.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }
    try {
        if (action === "favorite") {
            const current = state.recipes.find((recipe) => recipe.id === id);
            if (!current)
                return;
            const updated = await setFavorite(id, !current.favorite);
            updateRecipes((list) => list.map((recipe) => (recipe.id === updated.id ? updated : recipe)));
        }
        else if (action === "delete") {
            await deleteRecipeOnServer(id);
            updateRecipes((list) => deleteRecipe(list, id));
        }
    }
    catch (error) {
        formMessage.textContent = `Не удалось выполнить действие: ${errorMessage(error)}`;
    }
});
editRecipeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.status !== "success")
        return;
    const category = editRecipeCategory.value;
    if (!isCategory(category))
        return;
    const id = editRecipeId.value;
    const changes = {
        title: editRecipeTitle.value.trim(),
        category,
        servings: Number(editRecipeServings.value),
        cookingTime: Number(editRecipeTime.value),
        ingredients: editRecipeIngredients.value.split(",").map((x) => x.trim()).filter(Boolean),
        instructions: editRecipeInstructions.value.trim(),
    };
    try {
        const updated = await updateRecipeOnServer(id, changes);
        updateRecipes((list) => list.map((recipe) => (recipe.id === id ? updated : recipe)));
        editRecipeForm.reset();
        editRecipeForm.hidden = true;
        formMessage.textContent = "Изменения сохранены.";
    }
    catch (error) {
        editMessage.textContent = errorMessage(error);
    }
});
recipeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const titleInput = document.querySelector("#recipe-title");
    const categoryInput = document.querySelector("#recipe-category");
    const servingsInput = document.querySelector("#recipe-servings");
    const timeInput = document.querySelector("#recipe-time");
    const ingredientsInput = document.querySelector("#recipe-ingredients");
    const instructionsInput = document.querySelector("#recipe-instructions");
    if (!titleInput ||
        !categoryInput ||
        !servingsInput ||
        !timeInput ||
        !ingredientsInput ||
        !instructionsInput) {
        formMessage.textContent = "Ошибка разметки формы.";
        return;
    }
    const title = titleInput.value.trim();
    const category = categoryInput.value;
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
    if (!isCategory(category)) {
        formMessage.textContent = "Выберите категорию из списка.";
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
    const draft = {
        title,
        category,
        servings,
        cookingTime,
        ingredients,
        instructions,
    };
    const newRecipe = { ...draft, favorite: false };
    try {
        const created = await createRecipeOnServer(newRecipe);
        updateRecipes((list) => [created, ...list]);
        recipeForm.reset();
        formMessage.textContent = "Рецепт добавлен.";
    }
    catch (error) {
        formMessage.textContent = `Не удалось сохранить рецепт: ${errorMessage(error)}`;
    }
});
async function init() {
    setState({ status: "loading" });
    try {
        const recipes = await withRetry(() => fetchRecipes(), 3, 1000);
        setState({ status: "success", recipes });
    }
    catch (error) {
        setState({ status: "error", message: errorMessage(error) });
    }
}
void init();
