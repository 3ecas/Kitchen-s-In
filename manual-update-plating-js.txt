// plating.js
const MENU = [
    {
        name: 'Pizza',
        finalItem: 'baked-pizza',
        prepRequires: ['dough', 'chopped-tomato', 'grated-cheese'],
        requires: ['baked-pizza'],
        reward: 35
    },
    {
        name: 'Hamburger',
        finalItem: 'hamburger',
        prepRequires: ['sliced-bread', 'chopped-lettuce', 'chopped-tomato', 'grated-cheese', 'cooked-meat'],
        requires: ['hamburger'],
        reward: 40
    },
    {
        name: 'Salad',
        finalItem: 'salad',
        prepRequires: ['chopped-lettuce', 'chopped-tomato'],
        requires: ['salad'],
        reward: 20
    },
    {
        name: 'Simple Sandwich',
        finalItem: 'simple-sandwich',
        prepRequires: ['sliced-bread', 'cheese', 'sliced-ham'],
        requires: ['simple-sandwich'],
        reward: 15
    },
    {
        name: 'Fish and Chips',
        finalItem: 'fish-and-chips',
        prepRequires: ['cooked-fish', 'fries'],
        requires: ['fish-and-chips'],
        reward: 35
    },
    {
        name: 'Cooked Fish',
        finalItem: 'cooked-fish-meal',
        prepRequires: ['water', 'raw-fish', 'raw-potato', 'broccoli', 'egg'],
        requires: ['cooked-fish-meal'],
        reward: 45
    }
];

const plateSlots = document.querySelectorAll('#station-plate .slot');

function isMatch(plateItems, recipeItems) {
    if (plateItems.length !== recipeItems.length) return false;

    const sortedPlate = [...plateItems].sort();
    const sortedRecipe = [...recipeItems].sort();
    return sortedPlate.every((item, index) => item === sortedRecipe[index]);
}

function canPlate(item) {
    if (!item) return false;
    if (item === 'dough' || item === 'assembly' || item === 'pizza-base' || item === 'fish-pan' || item === 'cut-potato' || item === 'burnt-food') return false;
    return !item.startsWith('raw-');
}

function renderRecipeList() {
    const recipeListUI = document.getElementById('recipe-list');
    recipeListUI.innerHTML = MENU.map(recipe => `
        <div class="recipe-entry">
            <div class="recipe-title">
                <span>${recipe.name}</span>
                <span class="recipe-final-icon">${ICONS[recipe.finalItem]}</span>
            </div>
            <div class="recipe-needs">${recipe.prepRequires.map(item => `<span>${getDisplayIcon(item)}</span>`).join('')}</div>
        </div>
    `).join('');
}

installStationDrop(
    'station-plate',
    canPlate
);

document.getElementById('btn-serve').addEventListener('click', () => {
    const itemsOnPlate = Array.from(plateSlots)
        .filter(slot => !slot.classList.contains('empty'))
        .map(slot => slot.dataset.item);

    const recipe = MENU.find(entry => isMatch(itemsOnPlate, entry.requires));

    if (!recipe) {
        alert("That plate does not match any recipe yet.");
        return;
    }

    if (typeof completeOrder === 'function' && !completeOrder(recipe)) {
        alert(`There is no active order for ${recipe.name}.`);
        return;
    }

    GAME.coins += recipe.reward;
    document.getElementById('coin-count').textContent = GAME.coins;
    plateSlots.forEach(clearSlot);
    alert(`Served ${recipe.name}! +${recipe.reward} Coins`);
});

renderRecipeList();
