// counter.js
const counterRecipes = {
    'raw-bread': 'sliced-bread',
    'raw-tomato': 'chopped-tomato',
    'raw-lettuce': 'chopped-lettuce',
    'raw-potato': 'cut-potato',
    'cheese': 'grated-cheese'
};

const counterSlots = document.querySelectorAll('#station-counter .slot');
const assemblyRecipes = [
    {
        result: 'pizza-base',
        ingredients: ['dough', 'chopped-tomato', 'grated-cheese']
    },
    {
        result: 'hamburger',
        ingredients: ['sliced-bread', 'chopped-lettuce', 'chopped-tomato', 'grated-cheese', 'cooked-meat']
    },
    {
        result: 'salad',
        ingredients: ['chopped-lettuce', 'chopped-tomato']
    },
    {
        result: 'simple-sandwich',
        ingredients: ['cheese', 'ham']
    },
    {
        result: 'fish-and-chips',
        ingredients: ['cooked-fish', 'fries']
    }
];

const assemblyIngredients = [...new Set(assemblyRecipes.flatMap(recipe => recipe.ingredients))];
const counterReadyItems = ['cooked-fish-meal'];

installStationDrop(
    'station-counter',
    item => Boolean(counterRecipes[item]) || assemblyIngredients.includes(item) || counterReadyItems.includes(item)
);

function getMatchingAssembly(components) {
    return assemblyRecipes.find(recipe =>
        components.every(item => recipe.ingredients.includes(item)) &&
        components.length <= recipe.ingredients.length
    );
}

function getCompleteAssembly(components) {
    return assemblyRecipes.find(recipe =>
        recipe.ingredients.length === components.length &&
        recipe.ingredients.every(item => components.includes(item))
    );
}

function canJoinAssembly(slot) {
    if (slot.classList.contains('empty') || !GAME.draggedItemType || GAME.draggedFromSlot === slot) {
        return false;
    }

    const currentComponents = getSlotComponents(slot);
    const draggedComponents = GAME.draggedComponents.length ? GAME.draggedComponents : [GAME.draggedItemType];
    const joinedComponents = [...currentComponents, ...draggedComponents];
    const uniqueComponents = [...new Set(joinedComponents)];

    if (uniqueComponents.length !== joinedComponents.length) return false;

    return Boolean(getMatchingAssembly(uniqueComponents));
}

function joinAssemblyIngredients(slot) {
    const sourceSlot = GAME.draggedFromSlot;
    const currentComponents = getSlotComponents(slot);
    const draggedComponents = GAME.draggedComponents.length ? GAME.draggedComponents : [GAME.draggedItemType];
    const joinedComponents = [...new Set([...currentComponents, ...draggedComponents])];
    const completeAssembly = getCompleteAssembly(joinedComponents);

    fillSlot(slot, completeAssembly ? completeAssembly.result : 'assembly', joinedComponents);

    if (sourceSlot && sourceSlot !== slot) {
        clearSlot(sourceSlot);
    }

    resetDragState();
}

counterSlots.forEach(slot => {
    slot.addEventListener('dragover', event => {
        if (!canJoinAssembly(slot)) return;
        event.preventDefault();
        event.stopPropagation();
        slot.classList.add('slot-combine-target');
    });

    slot.addEventListener('dragleave', () => {
        slot.classList.remove('slot-combine-target');
    });

    slot.addEventListener('drop', event => {
        if (!canJoinAssembly(slot)) return;
        event.preventDefault();
        event.stopPropagation();
        slot.classList.remove('slot-combine-target');
        joinAssemblyIngredients(slot);
    });

    slot.addEventListener('click', () => {
        const item = slot.dataset.item;
        if (!counterRecipes[item]) return;

        const result = counterRecipes[item];
        slot.dataset.item = result;
        slot.dataset.components = JSON.stringify([result]);
        renderSlotContents(slot, result, [result]);
        slot.innerHTML += `<span class="ready-mark">\u2705</span>`;
    });
});
