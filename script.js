const ICONS = {
    'raw-bread': '🍞',
    'sliced-bread': '🥪',
    'raw-meat': '🥩',
    'cooked-meat': '🍔',
    'burnt-meat': '🗑️' // Ruined food turns into a piece of trash
};

let coins = 0;
let draggedItemType = null;
let draggedFromSlot = null;

const pantryItems = document.querySelectorAll('.ingredient-item');
const slots = document.querySelectorAll('.slot');

// 1. Pickup from Pantry
pantryItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        draggedItemType = e.target.dataset.item;
        draggedFromSlot = null; 
    });
});

// 2. Setup Slots & Trash Zone
slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        // If it's empty OR if it's the trash bin, light it up
        if (slot.classList.contains('empty') || slot.id === 'trash-bin') {
            slot.classList.add('drag-over');
        }
    });

    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));

    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const stationType = slot.parentElement.dataset.station;

        // TRASH LOGIC: Throwing something away
        if (stationType === 'trash') {
            if (draggedFromSlot) {
                clearSlot(draggedFromSlot); // Delete the item from where it came
            }
            return; // Don't fill the trash bin itself
        }

        // Only allow dropping in other stations if slot is empty
        if (!slot.classList.contains('empty')) return;

        // Normal Kitchen Rules
        if (draggedItemType === 'raw-bread' && stationType === 'counter') {
            fillSlot(slot, 'raw-bread');
        } 
        else if (draggedItemType === 'raw-meat' && stationType === 'stove') {
            fillSlot(slot, 'raw-meat');
            startCooking(slot); // Start Phase 1 timer!
        }
        else if ((draggedItemType === 'sliced-bread' || draggedItemType === 'cooked-meat') && stationType === 'plate') {
            fillSlot(slot, draggedItemType);
            if (draggedFromSlot) clearSlot(draggedFromSlot);
        }
    });

    // 3. Clicking to interact (Slice bread)
    slot.addEventListener('click', () => {
        if (slot.dataset.item === 'raw-bread') {
            slot.dataset.item = 'sliced-bread';
            slot.innerHTML = `
                <span class="icon">${ICONS['sliced-bread']}</span>
                <span class="ready-mark">✅</span>`;
        }
    });
});

// --- Helper Functions ---
function fillSlot(slot, itemType) {
    slot.classList.remove('empty');
    slot.dataset.item = itemType;
    slot.innerHTML = `<span class="icon">${ICONS[itemType]}</span>`;
    
    // Everything placed in a slot can be dragged around (or to the trash)
    slot.setAttribute('draggable', 'true');
    slot.addEventListener('dragstart', handleSlotDragStart);
}

function handleSlotDragStart(e) {
    draggedItemType = e.target.dataset.item;
    draggedFromSlot = e.target;
}

function clearSlot(slot) {
    if (slot.cookInterval) clearInterval(slot.cookInterval); // Stop timers
    
    slot.classList.add('empty');
    slot.removeAttribute('data-item');
    slot.removeAttribute('draggable');
    slot.removeEventListener('dragstart', handleSlotDragStart);
    slot.innerHTML = '';
}

// --- The 2-Phase Cooking Logic ---
function startCooking(slot) {
    slot.innerHTML = `
        <span class="icon">${ICONS['raw-meat']}</span>
        <span class="ready-mark" style="display:none;">✅</span>
        <div class="progress-container" style="display:block;">
            <div class="progress-fill"></div>
        </div>`;
    
    const fill = slot.querySelector('.progress-fill');
    const icon = slot.querySelector('.icon');
    const readyMark = slot.querySelector('.ready-mark');
    
    let timeElapsed = 0;
    const phaseTime = 5000; // 5 seconds per phase
    let isCooked = false;

    slot.cookInterval = setInterval(() => {
        timeElapsed += 100;
        let percentage = (timeElapsed / phaseTime) * 100;

        if (!isCooked) {
            // Phase 1: Cooking Raw Meat
            fill.style.width = percentage + '%';
            
            if (timeElapsed >= phaseTime) {
                // BECOMES COOKED!
                isCooked = true;
                timeElapsed = 0; // Restart the timer
                slot.dataset.item = 'cooked-meat';
                icon.innerText = ICONS['cooked-meat'];
                readyMark.style.display = 'flex'; // Show the ✅
                fill.style.background = '#FF5722'; // Bar turns red (Danger phase!)
                fill.style.width = '0%';
            }
        } else {
            // Phase 2: Danger (Cooked meat sitting too long)
            fill.style.width = percentage + '%';
            
            if (timeElapsed >= phaseTime) {
                // BECOMES BURNT!
                clearInterval(slot.cookInterval);
                slot.dataset.item = 'burnt-meat';
                icon.innerText = ICONS['burnt-meat']; // Becomes 🗑️ icon
                readyMark.style.display = 'none'; // Hide ✅
                fill.style.background = '#000'; // Black bar
            }
        }
    }, 100);
}

// --- Serving Logic ---
document.getElementById('btn-serve').addEventListener('click', () => {
    const plateSlots = document.querySelectorAll('#station-plate .slot:not(.empty)');
    
    let hasBread = false;
    let hasMeat = false;

    plateSlots.forEach(slot => {
        if (slot.dataset.item === 'sliced-bread') hasBread = true;
        if (slot.dataset.item === 'cooked-meat') hasMeat = true;
    });

    if (hasBread && hasMeat) {
        coins += 15;
        document.getElementById('coin-count').innerText = coins;
        plateSlots.forEach(slot => clearSlot(slot));
        alert("Hamburger Served! +15 Coins 🍔💰");
    } else {
        alert("Recipe incomplete! Need 1 Sliced Bread and 1 Cooked Meat on the plate.");
    }
});