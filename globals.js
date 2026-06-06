// globals.js
const ICONS = {
    'raw-bread': '\u{1F35E}',
    'sliced-bread': '\u{1F96A}',
    'raw-meat': '\u{1F969}',
    'cooked-meat': '\u{1F354}',
    'raw-potato': '\u{1F954}',
    'cut-potato': '\u{1F954}',
    'fries': '\u{1F35F}',
    'dough': '\u{1F95F}',
    'baked-pizza': '\u{1F355}',
    'raw-tomato': '\u{1F345}',
    'chopped-tomato': '\u{1F345}',
    'raw-lettuce': '\u{1F96C}',
    'chopped-lettuce': '\u{1F96C}',
    'raw-garlic': '\u{1F9C4}',
    'chopped-garlic': '\u{1F9C4}',
    'raw-pasta': '\u{1F35D}',
    'boiled-pasta': '\u{1F35D}',
    'raw-rice': '\u{1F33E}',
    'cooked-rice': '\u{1F35A}',
    'raw-shrimp': '\u{1F990}',
    'fried-shrimp': '\u{1F364}',
    'raw-fish': '\u{1F41F}',
    'cooked-fish': '\u{1F41F}',
    'fish-and-chips': '\u{1F41F}\u{1F35F}',
    'fish-pot': '\u{1F372}',
    'cooked-fish-meal': '\u{1F372}',
    'pot': '\u{1FAD5}',
    'water': '\u{1F4A7}',
    'broccoli': '\u{1F966}',
    'egg': '\u{1F95A}',
    'cheese': '\u{1F9C0}',
    'grated-cheese': '\u{1F9C0}',
    'ham': '\u{1F953}',
    'sliced-ham': '\u{1F953}',
    'assembly': '\u{1F372}',
    'pizza-base': '\u{1F95F}',
    'hamburger': '\u{1F354}',
    'salad': '\u{1F957}',
    'simple-sandwich': '\u{1F96A}',
    'burnt-food': '\u{1F5D1}\uFE0F'
};

const GAME = {
    coins: 0,
    draggedItemType: null,
    draggedComponents: [],
    draggedFromSlot: null
};

const DISPLAY_ICON_OVERRIDES = {
    'sliced-bread': 'raw-bread',
    'cooked-meat': 'raw-meat',
    'sliced-ham': 'ham'
};

const READY_MARK_ITEMS = [
    'sliced-bread',
    'chopped-tomato',
    'chopped-lettuce',
    'cut-potato',
    'grated-cheese',
    'sliced-ham',
    'cooked-meat',
    'cooked-fish',
    'fries',
    'baked-pizza',
    'cooked-fish-meal'
];

function getDisplayIcon(itemType) {
    return ICONS[DISPLAY_ICON_OVERRIDES[itemType] || itemType] || '?';
}

function findFirstEmptySlot(stationElement) {
    return stationElement.querySelector('.slot.empty');
}

function getItemName(itemType) {
    return itemType
        .replace('raw-', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getSlotComponents(slot) {
    if (!slot.dataset.components) {
        return slot.dataset.item ? [slot.dataset.item] : [];
    }

    try {
        return JSON.parse(slot.dataset.components);
    } catch (error) {
        return slot.dataset.item ? [slot.dataset.item] : [];
    }
}

function renderSlotContents(slot, itemType, components = [itemType]) {
    const visibleComponents = ['hamburger', 'salad', 'simple-sandwich', 'fish-and-chips', 'cooked-fish-meal'].includes(itemType)
        ? [itemType]
        : components.map(component => DISPLAY_ICON_OVERRIDES[component] || component);
    const icons = visibleComponents.map(component => `<span>${ICONS[component] || '?'}</span>`).join('');
    const contentClass = visibleComponents.length > 1 ? 'slot-contents grouped' : 'slot-contents';

    slot.dataset.item = itemType;
    slot.dataset.components = JSON.stringify(components);
    slot.innerHTML = `<span class="${contentClass}">${icons}</span>`;
}

function fillSlot(slot, itemType, components = [itemType]) {
    clearSlot(slot);
    slot.classList.remove('empty');
    renderSlotContents(slot, itemType, components);
    if (READY_MARK_ITEMS.includes(itemType)) {
        slot.innerHTML += `<span class="ready-mark">\u2705</span>`;
    }
    slot.setAttribute('draggable', 'true');
    slot.addEventListener('dragstart', handleDragStart);
    slot.addEventListener('dragend', resetDragState);
}

function clearSlot(slot) {
    if (slot.cookTimer) {
        clearInterval(slot.cookTimer);
        slot.cookTimer = null;
    }

    slot.classList.add('empty');
    slot.removeAttribute('data-item');
    slot.removeAttribute('data-components');
    slot.removeAttribute('draggable');
    slot.removeEventListener('dragstart', handleDragStart);
    slot.removeEventListener('dragend', resetDragState);
    slot.innerHTML = '';
}

function handleDragStart(event) {
    GAME.draggedItemType = event.currentTarget.dataset.item;
    GAME.draggedComponents = getSlotComponents(event.currentTarget);
    GAME.draggedFromSlot = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';
}

function resetDragState() {
    GAME.draggedItemType = null;
    GAME.draggedComponents = [];
    GAME.draggedFromSlot = null;
}

function startHeating(slot, finalItem, timeToCook) {
    const originalVisualItem = getSlotComponents(slot)[0] || slot.dataset.item;
    const keepOriginalVisual = originalVisualItem === 'raw-meat' && finalItem === 'cooked-meat';
    const progressMarkup = `
        <span class="ready-mark" style="display:none;">${ICONS['check'] || '\u2705'}</span>
        <div class="progress-container">
            <div class="progress-fill"></div>
        </div>`;

    slot.innerHTML += progressMarkup;

    const fill = slot.querySelector('.progress-fill');
    const slotContents = slot.querySelector('.slot-contents');
    const readyMark = slot.querySelector('.ready-mark');
    let time = 0;
    let isCooked = false;

    slot.cookTimer = setInterval(() => {
        time += 100;
        fill.style.width = `${Math.min((time / timeToCook) * 100, 100)}%`;

        if (!isCooked && time >= timeToCook) {
            isCooked = true;
            time = 0;
            slot.dataset.item = finalItem;
            slot.dataset.components = JSON.stringify([finalItem]);
            slotContents.className = 'slot-contents';
            slotContents.innerHTML = `<span>${ICONS[keepOriginalVisual ? originalVisualItem : finalItem]}</span>`;
            readyMark.style.display = 'flex';
            fill.style.width = '0%';
            fill.style.background = '#FF5722';
            return;
        }

        if (isCooked && time >= timeToCook) {
            clearInterval(slot.cookTimer);
            slot.cookTimer = null;
            slot.dataset.item = 'burnt-food';
            slot.dataset.components = JSON.stringify(['burnt-food']);
            slotContents.className = 'slot-contents';
            slotContents.innerHTML = `<span>${ICONS[keepOriginalVisual ? originalVisualItem : 'burnt-food']}</span>`;
            readyMark.style.display = 'none';
            fill.style.background = '#000';
        }
    }, 100);
}

function installStationDrop(stationId, acceptsItem, onPlaced = () => {}) {
    const station = document.getElementById(stationId);
    if (!station) return;

    station.addEventListener('dragover', event => {
        if (!GAME.draggedItemType || !findFirstEmptySlot(station)) return;
        event.preventDefault();
        station.classList.add('drag-over');
    });

    station.addEventListener('dragleave', event => {
        if (!station.contains(event.relatedTarget)) {
            station.classList.remove('drag-over');
        }
    });

    station.addEventListener('drop', event => {
        event.preventDefault();
        station.classList.remove('drag-over');

        const item = GAME.draggedItemType;
        const components = GAME.draggedComponents.length ? GAME.draggedComponents : [item];
        const sourceSlot = GAME.draggedFromSlot;
        const targetSlot = event.target.closest('.slot.empty');
        const emptySlot = targetSlot && station.contains(targetSlot)
            ? targetSlot
            : findFirstEmptySlot(station);

        if (!item || !emptySlot || !acceptsItem(item)) {
            resetDragState();
            return;
        }

        fillSlot(emptySlot, item, components);
        onPlaced(emptySlot, item);

        if (sourceSlot && sourceSlot !== emptySlot) {
            clearSlot(sourceSlot);
        }

        resetDragState();
    });
}
