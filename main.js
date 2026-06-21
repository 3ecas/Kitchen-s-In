// main.js
const trashBin = document.getElementById('floating-trash');
const workspace = document.getElementById('game-workspace');
const positionStorageKey = 'kitchens-in-window-positions';

let highestWindowZ = 20;

function getSavedWindowPositions() {
    try {
        return JSON.parse(localStorage.getItem(positionStorageKey)) || {};
    } catch (error) {
        return {};
    }
}

function saveWindowPosition(panel) {
    const positions = getSavedWindowPositions();
    positions[panel.id] = {
        left: panel.style.left,
        top: panel.style.top
    };
    try {
        localStorage.setItem(positionStorageKey, JSON.stringify(positions));
    } catch (error) {
        // Window dragging still works when browser storage is unavailable.
    }
}

function bringWindowToFront(panel) {
    highestWindowZ += 1;
    panel.style.zIndex = highestWindowZ;
}

function restoreWindowPositions() {
    const positions = getSavedWindowPositions();

    document.querySelectorAll('.floating-window').forEach(panel => {
        const savedPosition = positions[panel.id];
        if (!savedPosition) return;

        panel.style.left = savedPosition.left;
        panel.style.top = savedPosition.top;
    });
}

function makeWindowDraggable(panel) {
    const handle = panel.querySelector('.panel-handle');
    const panelWorkspace = panel.closest('.window-workspace') || workspace;
    if (!handle) return;

    handle.addEventListener('mousedown', event => {
        if (window.matchMedia('(max-width: 950px)').matches) return;
        if (event.target.closest('button')) return;

        event.preventDefault();
        bringWindowToFront(panel);
        panel.classList.add('panel-dragging');

        const workspaceRect = panelWorkspace.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = panelRect.left - workspaceRect.left + panelWorkspace.scrollLeft;
        const startTop = panelRect.top - workspaceRect.top + panelWorkspace.scrollTop;

        function moveWindow(moveEvent) {
            const maxLeft = Math.max(0, panelWorkspace.scrollWidth - panel.offsetWidth);
            const maxTop = Math.max(0, panelWorkspace.scrollHeight - panel.offsetHeight);
            const nextLeft = Math.max(0, Math.min(maxLeft, startLeft + moveEvent.clientX - startX));
            const nextTop = Math.max(0, Math.min(maxTop, startTop + moveEvent.clientY - startY));

            panel.style.left = `${nextLeft}px`;
            panel.style.top = `${nextTop}px`;
        }

        function stopMoving() {
            panel.classList.remove('panel-dragging');
            saveWindowPosition(panel);
            document.removeEventListener('mousemove', moveWindow);
            document.removeEventListener('mouseup', stopMoving);
        }

        document.addEventListener('mousemove', moveWindow);
        document.addEventListener('mouseup', stopMoving);
    });

    panel.addEventListener('mousedown', () => bringWindowToFront(panel));
}

document.querySelectorAll('.floating-window').forEach(makeWindowDraggable);

document.querySelectorAll('[data-close-window]').forEach(button => {
    button.addEventListener('click', () => {
        const panel = document.getElementById(button.dataset.closeWindow);
        if (panel) panel.classList.add('window-hidden');
    });
});

document.querySelectorAll('[data-open-window]').forEach(button => {
    button.addEventListener('click', () => {
        const panel = document.getElementById(button.dataset.openWindow);
        if (!panel) return;

        panel.classList.remove('window-hidden');
        bringWindowToFront(panel);
    });
});

document.getElementById('btn-reset-layout').addEventListener('click', () => {
    try {
        localStorage.removeItem(positionStorageKey);
    } catch (error) {
        // Reload still restores the CSS defaults when storage is unavailable.
    }
    window.location.reload();
});

restoreWindowPositions();

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
