// main.js
const trashBin = document.getElementById('floating-trash');

if (trashBin) {
    trashBin.addEventListener('dragover', event => {
        if (!GAME.draggedFromSlot) return;
        event.preventDefault();
        trashBin.classList.add('drag-over');
    });

    trashBin.addEventListener('dragleave', () => {
        trashBin.classList.remove('drag-over');
    });

    trashBin.addEventListener('drop', event => {
        event.preventDefault();
        trashBin.classList.remove('drag-over');

        if (GAME.draggedFromSlot) {
            clearSlot(GAME.draggedFromSlot);
        }

        resetDragState();
    });
}
