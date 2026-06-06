// fridge.js
const startingIngredients = [
    'raw-bread',
    'dough',
    'raw-lettuce',
    'raw-tomato',
    'raw-potato',
    'raw-fish',
    'broccoli',
    'egg',
    'pan',
    'water',
    'cheese',
    'ham',
    'raw-meat'
];

const fridgeList = document.getElementById('fridge-list');

startingIngredients.forEach(item => {
    const li = document.createElement('li');
    li.className = 'ingredient-item';
    li.setAttribute('draggable', 'true');
    li.dataset.item = item;
    li.innerHTML = `<span class="icon">${ICONS[item]}</span><span class="ing-name">${getItemName(item)}</span>`;

    li.addEventListener('dragstart', event => {
        GAME.draggedItemType = event.currentTarget.dataset.item;
        GAME.draggedComponents = [event.currentTarget.dataset.item];
        GAME.draggedFromSlot = null;
        event.dataTransfer.effectAllowed = 'copy';
    });

    li.addEventListener('dragend', resetDragState);
    fridgeList.appendChild(li);
});
