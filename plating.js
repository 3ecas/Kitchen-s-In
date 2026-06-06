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
        prepRequires: ['sliced-bread', 'grated-cheese', 'sliced-ham'],
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
        prepRequires: ['pot', 'water', 'raw-fish', 'raw-potato', 'broccoli', 'egg'],
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

function findRecipeSlots(occupiedSlots, recipeItems) {
    const remainingSlots = [...occupiedSlots];
    const matchedSlots = [];

    for (const recipeItem of recipeItems) {
        const slotIndex = remainingSlots.findIndex(slot => slot.dataset.item === recipeItem);
        if (slotIndex === -1) return [];

        matchedSlots.push(remainingSlots[slotIndex]);
        remainingSlots.splice(slotIndex, 1);
    }

    return matchedSlots;
}

function findServableOrder(occupiedSlots) {
    if (typeof ORDER_STATE === 'undefined') {
        const recipe = MENU.find(entry => findRecipeSlots(occupiedSlots, entry.requires).length === entry.requires.length);
        return recipe ? { recipe, slots: findRecipeSlots(occupiedSlots, recipe.requires) } : null;
    }

    for (const order of ORDER_STATE.activeOrders) {
        const recipe = MENU.find(entry => isMatch(entry.requires, order.requires));
        if (!recipe) continue;

        const slots = findRecipeSlots(occupiedSlots, recipe.requires);
        if (slots.length === recipe.requires.length) {
            return { recipe, slots };
        }
    }

    return null;
}

function showServeBurst(x, y, coins) {
    const pieces = ['\u2728', '\u2B50', `+${coins}`, '\u{1F4B0}', '\u2728'];

    pieces.forEach((piece, index) => {
        const burst = document.createElement('span');
        burst.className = 'serve-burst';
        burst.textContent = piece;
        burst.style.left = `${x}px`;
        burst.style.top = `${y}px`;
        burst.style.setProperty('--dx', `${(index - 2) * 18}px`);
        burst.style.setProperty('--dy', `${index % 2 === 0 ? -54 : -36}px`);
        document.body.appendChild(burst);

        setTimeout(() => burst.remove(), 900);
    });
}

function canPlate(item) {
    if (!item) return false;
    if (item === 'dough' || item === 'assembly' || item === 'pizza-base' || item === 'fish-pot' || item === 'cut-potato' || item === 'burnt-food') return false;
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

document.getElementById('btn-serve').addEventListener('click', event => {
    let occupiedSlots = Array.from(plateSlots)
        .filter(slot => !slot.classList.contains('empty'));
    const servedRecipes = [];
    let totalReward = 0;

    while (true) {
        const servableOrder = findServableOrder(occupiedSlots);
        if (!servableOrder) break;

        const { recipe, slots } = servableOrder;

        if (typeof completeOrder === 'function' && !completeOrder(recipe)) {
            break;
        }

        totalReward += recipe.reward;
        servedRecipes.push(recipe.name);
        slots.forEach(clearSlot);
        occupiedSlots = occupiedSlots.filter(slot => !slots.includes(slot));
    }

    if (!servedRecipes.length) {
        alert("There is no completed active order on the plate yet.");
        return;
    }

    GAME.coins += totalReward;
    document.getElementById('coin-count').textContent = GAME.coins;
    showServeBurst(event.clientX, event.clientY, totalReward);
});

renderRecipeList();
