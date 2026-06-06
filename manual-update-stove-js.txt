// stove.js
const stoveRecipes = {
    'raw-meat': 'cooked-meat',
    'raw-fish': 'cooked-fish',
    'fish-pot': 'cooked-fish-meal',
    'rice-pot': 'cooked-rice',
    'raw-pasta': 'boiled-pasta',
};

installStationDrop(
    'station-stove',
    item => Boolean(stoveRecipes[item]),
    (slot, item) => startHeating(slot, stoveRecipes[item], ['fish-pot', 'rice-pot'].includes(item) ? 6000 : 4000)
);
