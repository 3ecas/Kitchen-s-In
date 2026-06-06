// order_bar.js
const ORDER_STATE = {
    activeOrders: [],
    nextId: 1,
    maxOrders: 5
};

const activeOrdersContainer = document.getElementById('active-orders');
const orderPopup = document.getElementById('order-popup');

function getAvailableOrders() {
    return Array.isArray(MENU) ? MENU : [];
}

function renderActiveOrders() {
    if (!activeOrdersContainer) return;

    activeOrdersContainer.innerHTML = ORDER_STATE.activeOrders.map(order => `
        <div class="order-card ${order.isNew ? 'new-order' : ''}" data-order-id="${order.id}">
            <span class="order-icon">${ICONS[order.finalItem]}</span>
            <span class="order-name">${order.name}</span>
        </div>
    `).join('');

    ORDER_STATE.activeOrders.forEach(order => {
        order.isNew = false;
    });
}

function showOrderPopup(order) {
    if (!orderPopup) return;

    orderPopup.innerHTML = `
        <span class="order-icon">${ICONS[order.finalItem]}</span>
        <span>${order.name}</span>
    `;
    orderPopup.classList.remove('show');
    void orderPopup.offsetWidth;
    orderPopup.classList.add('show');

    setTimeout(() => {
        orderPopup.classList.remove('show');
    }, 1800);
}

function generateIncomingOrder() {
    const orders = getAvailableOrders();
    if (!orders.length || ORDER_STATE.activeOrders.length >= ORDER_STATE.maxOrders) return;

    const recipe = orders[Math.floor(Math.random() * orders.length)];
    const order = {
        id: ORDER_STATE.nextId,
        name: recipe.name,
        finalItem: recipe.finalItem,
        requires: recipe.requires,
        isNew: true
    };

    ORDER_STATE.nextId += 1;
    ORDER_STATE.activeOrders.push(order);
    renderActiveOrders();
    showOrderPopup(order);
}

function completeOrder(recipe) {
    const orderIndex = ORDER_STATE.activeOrders.findIndex(order =>
        isMatch(recipe.requires, order.requires)
    );

    if (orderIndex === -1) return false;

    ORDER_STATE.activeOrders.splice(orderIndex, 1);
    renderActiveOrders();
    return true;
}

setInterval(generateIncomingOrder, 12000);

generateIncomingOrder();
