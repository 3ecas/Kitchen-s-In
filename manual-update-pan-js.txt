// pan.js
const panIngredients = ['water', 'raw-fish', 'raw-potato', 'broccoli', 'egg'];
const panSlots = document.querySelectorAll('#station-pan .slot');

installStationDrop(
    'station-pan',
    item => panIngredients.includes(item)
);

function canJoinPan(slot) {
    if (slot.classList.contains('empty') || !GAME.draggedItemType || GAME.draggedFromSlot === slot) {
        return false;
    }

    const currentComponents = getSlotComponents(slot);
    const draggedComponents = GAME.draggedComponents.length ? GAME.draggedComponents : [GAME.draggedItemType];
    const joinedComponents = [...currentComponents, ...draggedComponents];
    const uniqueComponents = [...new Set(joinedComponents)];

    if (uniqueComponents.length !== joinedComponents.length) return false;
    if (uniqueComponents.length > panIngredients.length) return false;

    return uniqueComponents.every(item => panIngredients.includes(item));
}

function joinPanIngredients(slot) {
    const sourceSlot = GAME.draggedFromSlot;
    const currentComponents = getSlotComponents(slot);
    const draggedComponents = GAME.draggedComponents.length ? GAME.draggedComponents : [GAME.draggedItemType];
    const joinedComponents = [...new Set([...currentComponents, ...draggedComponents])];
    const isCompletePan = panIngredients.every(item => joinedComponents.includes(item));

    fillSlot(slot, isCompletePan ? 'fish-pan' : 'assembly', joinedComponents);

    if (sourceSlot && sourceSlot !== slot) {
        clearSlot(sourceSlot);
    }

    resetDragState();
}

panSlots.forEach(slot => {
    slot.addEventListener('dragover', event => {
        if (!canJoinPan(slot)) return;
        event.preventDefault();
        event.stopPropagation();
        slot.classList.add('slot-combine-target');
    });

    slot.addEventListener('dragleave', () => {
        slot.classList.remove('slot-combine-target');
    });

    slot.addEventListener('drop', event => {
        if (!canJoinPan(slot)) return;
        event.preventDefault();
        event.stopPropagation();
        slot.classList.remove('slot-combine-target');
        joinPanIngredients(slot);
    });
});
