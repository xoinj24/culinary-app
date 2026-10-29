export const initialRecipes = [
    {
        id: "recipe-1",
        title: "Сырники",
        category: "Завтрак",
        servings: 2,
        cookingTime: 20,
        ingredients: ["творог", "яйцо", "мука", "сахар"],
        instructions: "Смешать ингредиенты, сформировать сырники и обжарить.",
        favorite: true,
        reviews: [
            { id: "rev-1", author: "Мария", text: "Очень вкусные сырники получились!", likes: 5 },
            { id: "rev-2", author: "Иван", text: "Простой рецепт, спасибо.", likes: 2 }
        ]
    },
    {
        id: "recipe-2",
        title: "Овощной суп",
        category: "Обед",
        servings: 4,
        cookingTime: 35,
        ingredients: ["картофель", "морковь", "лук", "вода"],
        instructions: "Нарезать овощи и варить до готовности.",
        favorite: false,
        reviews: []
    },
    {
        id: "recipe-3",
        title: "Яблочный десерт",
        category: "Десерт",
        servings: 3,
        cookingTime: 25,
        ingredients: ["яблоки", "корица", "мёд"],
        instructions: "Нарезать яблоки, добавить корицу и запечь.",
        favorite: false,
        reviews: []
    }
];
