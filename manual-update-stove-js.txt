// stove.js
const stoveRecipes = {
    'raw-meat': 'cooked-meat',
    'raw-fish': 'cooked-fish',
    'fish-pot': 'cooked-fish-meal',
    'raw-pasta': 'boiled-pasta',
    'raw-rice': 'cooked-rice'
};

installStationDrop(
    'station-stove',
    item => Boolean(stoveRecipes[item]),
    (slot, item) => startHeating(slot, stoveRecipes[item], item === 'fish-pot' ? 6000 : 4000)
);
