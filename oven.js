// oven.js
installStationDrop(
    'station-oven',
    item => item === 'pizza-base',
    slot => startHeating(slot, 'baked-pizza', 8000)
);
