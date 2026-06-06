// fryer.js
const fryerRecipes = {
    'cut-potato': 'fries',
    'raw-shrimp': 'fried-shrimp'
};

installStationDrop(
    'station-fryer',
    item => Boolean(fryerRecipes[item]),
    (slot, item) => startHeating(slot, fryerRecipes[item], 2500)
);
