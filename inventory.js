// inventory.js
const inventoryStorageKey = 'kitchens-in-inventory';
const coinsStorageKey = 'kitchens-in-coins';

const INVENTORY_META = {
    'raw-bread': { name: 'Bread', category: 'Bakery' },
    'dough': { name: 'Dough', category: 'Bakery' },
    'cheese': { name: 'Cheese', category: 'Dairy' },
    'pot': { name: 'Pot', category: 'Equipment' },
    'water': { name: 'Water', category: 'Liquids' },
    'egg': { name: 'Egg', category: 'Protein' },
    'ham': { name: 'Ham', category: 'Protein' },
    'raw-chicken': { name: 'Chicken', category: 'Protein' },
    'raw-fish': { name: 'Fish', category: 'Protein' },
    'raw-meat': { name: 'Meat', category: 'Protein' },
    'raw-rice': { name: 'Rice', category: 'Crops' },
    'wheat': { name: 'Wheat', category: 'Crops' },
    'broccoli': { name: 'Broccoli', category: 'Vegetables' },
    'raw-lettuce': { name: 'Lettuce', category: 'Vegetables' },
    'raw-potato': { name: 'Potato', category: 'Vegetables' },
    'raw-tomato': { name: 'Tomato', category: 'Vegetables' }
};

const DEFAULT_INVENTORY = {
    'raw-bread': 3,
    'dough': 2,
    'cheese': 3,
    'pot': 2,
    'water': 6,
    'egg': 2,
    'ham': 2,
    'raw-chicken': 2,
    'raw-fish': 3,
    'raw-meat': 2,
    'raw-rice': 3,
    'wheat': 0,
    'broccoli': 2,
    'raw-lettuce': 3,
    'raw-potato': 4,
    'raw-tomato': 4
};

function loadInventory() {
    try {
        const saved = JSON.parse(localStorage.getItem(inventoryStorageKey)) || {};
        return { ...DEFAULT_INVENTORY, ...saved };
    } catch (error) {
        return { ...DEFAULT_INVENTORY };
    }
}

function saveInventory() {
    try {
        localStorage.setItem(inventoryStorageKey, JSON.stringify(GAME.inventory));
    } catch (error) {
        // The current session still works if browser storage is unavailable.
    }
}

function notifyInventoryChanged() {
    saveInventory();
    document.dispatchEvent(new CustomEvent('inventorychange'));
}

function getInventoryCount(item) {
    return GAME.inventory[item] || 0;
}

function addInventory(item, amount = 1) {
    GAME.inventory[item] = getInventoryCount(item) + amount;
    notifyInventoryChanged();
}

function consumeInventory(item, amount = 1) {
    if (getInventoryCount(item) < amount) return false;
    GAME.inventory[item] -= amount;
    notifyInventoryChanged();
    return true;
}

function canAffordInventory(costs) {
    return Object.entries(costs).every(([item, amount]) => getInventoryCount(item) >= amount);
}

function consumeInventoryCosts(costs) {
    if (!canAffordInventory(costs)) return false;
    Object.entries(costs).forEach(([item, amount]) => {
        GAME.inventory[item] -= amount;
    });
    notifyInventoryChanged();
    return true;
}

function renderCoinDisplays() {
    document.querySelectorAll('#coin-count, #header-coins').forEach(element => {
        element.textContent = GAME.coins;
    });
}

function addCoins(amount) {
    GAME.coins += amount;
    try {
        localStorage.setItem(coinsStorageKey, String(GAME.coins));
    } catch (error) {
        // Coins remain available for the current session.
    }
    renderCoinDisplays();
}

GAME.inventory = loadInventory();
try {
    GAME.coins = Math.max(0, Number(localStorage.getItem(coinsStorageKey)) || 0);
} catch (error) {
    GAME.coins = 0;
}
renderCoinDisplays();
