// fridge.js
const fridgeSections = [
    { name: 'Bakery', items: ['dough', 'raw-bread'] },
    { name: 'Dairy', items: ['cheese'] },
    { name: 'Equipment', items: ['pot'] },
    { name: 'Liquids', items: ['water'] },
    { name: 'Protein', items: ['egg', 'ham', 'raw-chicken', 'raw-fish', 'raw-meat'] },
    { name: 'Rice', items: ['raw-rice'] },
    { name: 'Vegetables', items: ['broccoli', 'raw-lettuce', 'raw-potato', 'raw-tomato'] }
];

const fridgeList = document.getElementById('fridge-list');

function createIngredientItem(item) {
    const count = getInventoryCount(item);
    const li = document.createElement('li');

    li.className = `ingredient-item ${count <= 0 ? 'out-of-stock' : ''}`;
    li.setAttribute('draggable', count > 0 ? 'true' : 'false');
    li.dataset.item = item;
    li.innerHTML = `
        <span class="icon">${ICONS[item]}</span>
        <span class="ing-name">${getItemName(item)}</span>
        <span class="stock-count">${count}</span>
    `;

    li.addEventListener('dragstart', event => {
        if (getInventoryCount(item) <= 0) {
            event.preventDefault();
            return;
        }

        GAME.draggedItemType = event.currentTarget.dataset.item;
        GAME.draggedComponents = [event.currentTarget.dataset.item];
        GAME.draggedFromSlot = null;
        GAME.draggedFromInventory = true;
        event.dataTransfer.effectAllowed = 'copy';
    });

    li.addEventListener('dragend', resetDragState);
    return li;
}

function renderFridge() {
    fridgeList.innerHTML = '';

    [...fridgeSections]
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(section => {
            const sectionItem = document.createElement('li');
            const sectionList = document.createElement('ul');

            sectionItem.className = 'fridge-section';
            sectionList.className = 'fridge-section-items';
            sectionItem.innerHTML = `<h3>${section.name}</h3>`;

            [...section.items]
                .sort((a, b) => getItemName(a).localeCompare(getItemName(b)))
                .forEach(item => sectionList.appendChild(createIngredientItem(item)));

            sectionItem.appendChild(sectionList);
            fridgeList.appendChild(sectionItem);
        });
}

document.addEventListener('inventorychange', renderFridge);
renderFridge();
