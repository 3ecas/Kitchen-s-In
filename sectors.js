// sectors.js
const FARM_JOBS = [
    { name: 'Broccoli', output: 'broccoli', amount: 2, duration: 5000 },
    { name: 'Lettuce', output: 'raw-lettuce', amount: 2, duration: 4500 },
    { name: 'Potatoes', output: 'raw-potato', amount: 3, duration: 6000 },
    { name: 'Rice', output: 'raw-rice', amount: 2, duration: 6500 },
    { name: 'Tomatoes', output: 'raw-tomato', amount: 3, duration: 5000 },
    { name: 'Wheat', output: 'wheat', amount: 3, duration: 5500 },
    { name: 'Well Water', output: 'water', amount: 4, duration: 3500 }
];

const ANIMAL_JOBS = [
    { name: 'Collect Eggs', output: 'egg', amount: 2, duration: 4500 },
    { name: 'Make Cheese', output: 'cheese', amount: 1, duration: 6000 },
    { name: 'Prepare Chicken', output: 'raw-chicken', amount: 1, duration: 6500 },
    { name: 'Prepare Ham', output: 'ham', amount: 1, duration: 6000 },
    { name: 'Prepare Meat', output: 'raw-meat', amount: 1, duration: 7000 }
];

const WAREHOUSE_JOBS = [
    { name: 'Bake Bread', output: 'raw-bread', amount: 1, duration: 4000, costs: { wheat: 2 } },
    { name: 'Make Dough', output: 'dough', amount: 1, duration: 3500, costs: { wheat: 2 } },
    { name: 'Make Pot', output: 'pot', amount: 1, duration: 5000, coinCost: 8 }
];

function switchSector(sectorName) {
    document.querySelectorAll('.sector-view').forEach(view => {
        view.classList.toggle('active', view.dataset.view === sectorName);
    });

    document.querySelectorAll('[data-sector]').forEach(button => {
        button.classList.toggle('active', button.dataset.sector === sectorName);
    });
}

document.querySelector('.sector-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-sector]');
    if (!button) return;
    switchSector(button.dataset.sector);
});

function formatCosts(job) {
    const parts = Object.entries(job.costs || {}).map(([item, amount]) => `${amount} ${INVENTORY_META[item].name}`);
    if (job.coinCost) parts.push(`${job.coinCost} coins`);
    return parts.length ? `Needs ${parts.join(' + ')}` : `Produces ${job.amount}`;
}

function getWindowId(type, name) {
    return `${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function createProductionCard(job, type, index) {
    const windowId = getWindowId(type, job.name);
    const card = document.createElement('article');
    const columns = type === 'warehouse' ? 2 : 4;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const startLeft = type === 'warehouse' ? 475 : 16;

    card.id = windowId;
    card.className = 'production-card floating-window management-window';
    card.dataset.type = type;
    card.style.left = `${startLeft + (column * 225)}px`;
    card.style.top = `${16 + (row * 225)}px`;
    card.innerHTML = `
        <div class="window-header panel-handle">
            <h3>${job.name}</h3>
            <button class="window-close" type="button" data-close-window="${windowId}" aria-label="Close ${job.name}">x</button>
        </div>
        <div class="production-body">
            <div class="production-icon">${ICONS[job.output]}</div>
            <p>${formatCosts(job)}</p>
            <button class="production-start" type="button">Start</button>
            <div class="production-progress"><span></span></div>
            <small class="production-status">Ready</small>
        </div>
    `;

    card.querySelector('.production-start').addEventListener('click', () => startProduction(card, job));
    return card;
}

function canStartJob(job) {
    const hasItems = canAffordInventory(job.costs || {});
    const hasCoins = !job.coinCost || GAME.coins >= job.coinCost;
    return hasItems && hasCoins;
}

function startProduction(card, job) {
    const button = card.querySelector('.production-start');
    const progress = card.querySelector('.production-progress span');
    const status = card.querySelector('.production-status');

    if (button.disabled) return;
    if (!canStartJob(job)) {
        status.textContent = 'Missing supplies';
        return;
    }

    if (job.costs && !consumeInventoryCosts(job.costs)) return;
    if (job.coinCost) addCoins(-job.coinCost);

    button.disabled = true;
    status.textContent = 'Working...';
    progress.style.width = '0%';

    const startedAt = Date.now();
    const timer = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        progress.style.width = `${Math.min((elapsed / job.duration) * 100, 100)}%`;

        if (elapsed < job.duration) return;

        clearInterval(timer);
        addInventory(job.output, job.amount);
        status.textContent = `+${job.amount} ready`;
        button.disabled = false;

        setTimeout(() => {
            progress.style.width = '0%';
            status.textContent = 'Ready';
        }, 1200);
    }, 100);
}

function renderProductionGrid(containerId, jobs, type, toolbarId) {
    const container = document.getElementById(containerId);
    const toolbar = document.getElementById(toolbarId);
    container.innerHTML = '';
    if (toolbar) {
        toolbar.innerHTML = type === 'warehouse'
            ? '<button type="button" data-open-window="warehouse-inventory-window">Inventory</button>'
            : '';
    }

    jobs.forEach((job, index) => {
        const windowId = getWindowId(type, job.name);
        container.appendChild(createProductionCard(job, type, index));

        if (toolbar) {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.openWindow = windowId;
            button.textContent = job.name;
            toolbar.appendChild(button);
        }
    });
}

function renderWarehouseInventory() {
    const container = document.getElementById('warehouse-inventory');
    const items = Object.keys(INVENTORY_META).sort((a, b) => {
        const categoryCompare = INVENTORY_META[a].category.localeCompare(INVENTORY_META[b].category);
        return categoryCompare || INVENTORY_META[a].name.localeCompare(INVENTORY_META[b].name);
    });

    container.innerHTML = items.map(item => `
        <div class="inventory-item ${getInventoryCount(item) <= 0 ? 'empty-stock' : ''}">
            <span>${ICONS[item]}</span>
            <div><strong>${INVENTORY_META[item].name}</strong><small>${INVENTORY_META[item].category}</small></div>
            <b>${getInventoryCount(item)}</b>
        </div>
    `).join('');
}

const fishingButton = document.querySelector('[data-fish]');
fishingButton.addEventListener('click', () => {
    const card = fishingButton.closest('.production-card');
    const progress = card.querySelector('.production-progress span');
    const status = card.querySelector('.production-status');
    const duration = 7000;
    const startedAt = Date.now();

    fishingButton.disabled = true;
    status.textContent = 'Net in the water...';

    const timer = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        progress.style.width = `${Math.min((elapsed / duration) * 100, 100)}%`;

        if (elapsed < duration) return;

        clearInterval(timer);
        const catchAmount = 1 + Math.floor(Math.random() * 3);
        addInventory('raw-fish', catchAmount);
        status.textContent = `Caught ${catchAmount} fish`;
        fishingButton.disabled = false;

        setTimeout(() => {
            progress.style.width = '0%';
            status.textContent = 'Ready';
        }, 1400);
    }, 100);
});

document.addEventListener('inventorychange', renderWarehouseInventory);

renderProductionGrid('farm-production', FARM_JOBS, 'farm', 'farm-toolbar');
renderProductionGrid('animal-production', ANIMAL_JOBS, 'animals', 'animal-toolbar');
renderProductionGrid('warehouse-production', WAREHOUSE_JOBS, 'warehouse', 'warehouse-toolbar');
renderWarehouseInventory();
