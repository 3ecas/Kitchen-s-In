// order_bar.js
const tickerContainer = document.getElementById('order-ticker');

function getAvailableOrders() {
    return Array.isArray(MENU) ? MENU.map(recipe => recipe.name) : ['Pizza'];
}

function generateIncomingOrder() {
    const orders = getAvailableOrders();
    const randomPlate = orders[Math.floor(Math.random() * orders.length)];
    const orderSpan = document.createElement('span');

    orderSpan.className = 'ticker-item';
    orderSpan.textContent = `-- NEW ORDER -- ${randomPlate}`;
    tickerContainer.appendChild(orderSpan);

    while (tickerContainer.children.length > 5) {
        tickerContainer.removeChild(tickerContainer.firstChild);
    }
}

setInterval(generateIncomingOrder, 15000);

for (let index = 0; index < 3; index += 1) {
    generateIncomingOrder();
}
