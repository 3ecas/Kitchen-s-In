// order_bar.js
const ORDER_GRACE_PERIOD = 15000;
const ORDER_LIFETIME = 60000;

const ORDER_STATE = {
    activeOrders: [],
    nextId: 1,
    maxOrders: 5,
    rating: 0,
    reputationStarted: false,
    gameOver: false
};

const activeOrdersContainer = document.getElementById('active-orders');
const ratingStars = document.getElementById('rating-stars');
const ratingValue = document.getElementById('rating-value');
const gameOverOverlay = document.getElementById('game-over-overlay');

function getAvailableOrders() {
    return Array.isArray(MENU) ? MENU : [];
}

function getOrderAge(order) {
    return Math.max(0, Date.now() - order.createdAt - ORDER_GRACE_PERIOD);
}

function getOrderProgress(order) {
    return Math.max(0, 1 - (getOrderAge(order) / ORDER_LIFETIME));
}

function getOrderReward(order) {
    const rewardMultiplier = 0.2 + (getOrderProgress(order) * 0.8);
    return Math.max(1, Math.round(order.baseReward * rewardMultiplier));
}

function getServiceStars(order) {
    const age = getOrderAge(order);
    if (age <= 15000) return 5;
    if (age <= 25000) return 4;
    if (age <= 35000) return 3;
    if (age <= 45000) return 2;
    return 1;
}

function renderRating() {
    const fullStars = Math.round(ORDER_STATE.rating);
    ratingStars.textContent = `${'\u2605'.repeat(fullStars)}${'\u2606'.repeat(5 - fullStars)}`;
    ratingValue.textContent = ORDER_STATE.rating.toFixed(1);
}

function renderActiveOrders() {
    if (!activeOrdersContainer) return;

    activeOrdersContainer.innerHTML = ORDER_STATE.activeOrders.map(order => {
        const progress = getOrderProgress(order);
        const patienceColor = progress > 0.5 ? '#6BD4A1' : progress > 0.25 ? '#FFC043' : '#E86A6A';
        return `
            <div class="order-card ${order.isNew ? 'new-order' : ''}" data-order-id="${order.id}">
                <span class="order-icon">${ICONS[order.finalItem]}</span>
                <span class="order-name">${order.name}</span>
                <span class="order-value">${getOrderReward(order)}\u{1F4B0}</span>
                <span class="order-patience"><span style="width:${progress * 100}%;background:${patienceColor}"></span></span>
            </div>
        `;
    }).join('');

    ORDER_STATE.activeOrders.forEach(order => {
        order.isNew = false;
    });
}

function endGame() {
    ORDER_STATE.gameOver = true;
    gameOverOverlay.classList.remove('hidden');
}

function changeRating(amount) {
    ORDER_STATE.rating = Math.max(0, Math.min(5, ORDER_STATE.rating + amount));
    renderRating();

    if (ORDER_STATE.reputationStarted && ORDER_STATE.rating <= 0) {
        endGame();
    }
}

function updateRatingFromService(serviceStars) {
    if (!ORDER_STATE.reputationStarted) {
        ORDER_STATE.reputationStarted = true;
        ORDER_STATE.rating = serviceStars;
        renderRating();
        return;
    }

    const adjustment = (serviceStars - 3) * 0.35;
    changeRating(adjustment);
}

function generateIncomingOrder() {
    if (ORDER_STATE.gameOver) return;

    const orders = getAvailableOrders();
    if (!orders.length || ORDER_STATE.activeOrders.length >= ORDER_STATE.maxOrders) return;

    const recipe = orders[Math.floor(Math.random() * orders.length)];
    const order = {
        id: ORDER_STATE.nextId,
        name: recipe.name,
        finalItem: recipe.finalItem,
        requires: recipe.requires,
        baseReward: recipe.reward,
        createdAt: Date.now(),
        isNew: true
    };

    ORDER_STATE.nextId += 1;
    ORDER_STATE.activeOrders.push(order);
    renderActiveOrders();
}

function completeOrder(recipe) {
    const orderIndex = ORDER_STATE.activeOrders.findIndex(order =>
        isMatch(recipe.requires, order.requires)
    );

    if (orderIndex === -1 || ORDER_STATE.gameOver) return false;

    const order = ORDER_STATE.activeOrders[orderIndex];
    const result = {
        reward: getOrderReward(order),
        serviceStars: getServiceStars(order)
    };

    ORDER_STATE.activeOrders.splice(orderIndex, 1);
    updateRatingFromService(result.serviceStars);
    renderActiveOrders();
    return result;
}

function updateOrders() {
    if (ORDER_STATE.gameOver) return;

    const expiredOrders = ORDER_STATE.activeOrders.filter(order => getOrderProgress(order) <= 0);
    if (expiredOrders.length) {
        const expiredIds = new Set(expiredOrders.map(order => order.id));
        ORDER_STATE.activeOrders = ORDER_STATE.activeOrders.filter(order => !expiredIds.has(order.id));

        if (ORDER_STATE.reputationStarted) {
            changeRating(-expiredOrders.length);
        }
    }

    renderActiveOrders();
}

document.getElementById('btn-restart').addEventListener('click', () => {
    window.location.reload();
});

setInterval(generateIncomingOrder, 12000);
setInterval(updateOrders, 1000);

renderRating();
generateIncomingOrder();
