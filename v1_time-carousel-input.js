// alarm-clock.js e outros scripts podem precisar dessas variáveis
// para saber a hora selecionada.
// Vamos criar uma forma de expor a hora e minuto atuais do carrossel.
// Uma função para obter o valor atual será útil.

let currentHour = 0; // Torna global ou expõe via função
let currentMinute = 0; // Torna global ou expõe via função

// Funções para obter a hora e minuto selecionados
export function getSelectedHour() {
    return currentHour;
}

export function getSelectedMinute() {
    return currentMinute;
}

// Para que o alarm-clock.js possa setar a hora inicial
export function setInitialTime(hour, minute) {
    currentHour = hour;
    currentMinute = minute;
    updateMainCarouselPosition(hoursItems, currentHour);
    updateMainCarouselPosition(minutesItems, currentMinute);
}


// Tudo a partir daqui...
// Main input carousels
const hoursCarousel = document.getElementById('hours-carousel');
const hoursItems = document.getElementById('hours-items');
const hoursUpButton = hoursCarousel.querySelector('.carousel-button.up');
const hoursDownButton = hoursCarousel.querySelector('.carousel-button.down');

const minutesCarousel = document.getElementById('minutes-carousel');
const minutesItems = document.getElementById('minutes-items');
const minutesUpButton = minutesCarousel.querySelector('.carousel-button.up');
const minutesDownButton = minutesCarousel.querySelector('.carousel-button.down');

let currentHour = 0;
let currentMinute = 0;
const itemHeight = 50; // Height of each item in pixels
const itemsInView = 5; // Number of items visible in the selection carousel (250px / 50px)
const bufferItems = Math.floor(itemsInView / 2); // Items above/below center to keep full (2 items)

// References for the new selection carousels
const hoursSelectionOverlay = document.getElementById('hours-selection-overlay');
const hoursSelectionCarousel = document.getElementById('hours-selection-carousel');
const hoursSelectionItems = document.getElementById('hours-selection-items');

const minutesSelectionOverlay = document.getElementById('minutes-selection-overlay');
const minutesSelectionCarousel = document.getElementById('minutes-selection-carousel');
const minutesSelectionItems = document.getElementById('minutes-selection-items');


// --- Main Input Carousel Population ---
function populateMainCarousel(itemsContainer, totalItems) {
    itemsContainer.innerHTML = ''; // Clear existing items
    for (let i = 0; i < totalItems; i++) {
        const value = i.toString().padStart(2, '0');
        const item = document.createElement('div');
        item.classList.add('item');
        item.textContent = value;
        itemsContainer.appendChild(item);
    }
}

populateMainCarousel(hoursItems, 24);
populateMainCarousel(minutesItems, 60);

// --- Main Input Carousel Position Update ---
function updateMainCarouselPosition(carouselItems, currentIndex) {
    carouselItems.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
}

// Initialize positions for main carousels
updateMainCarouselPosition(hoursItems, currentHour);
updateMainCarouselPosition(minutesItems, currentMinute);

// --- Main Input Carousel Scroll Logic ---
function setupMainCarouselScroll(carouselElement, itemsElement, currentValRef, totalItems) {
    itemsElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY > 0) { // Scroll down
            currentValRef.value = (currentValRef.value + 1) % totalItems;
        } else { // Scroll up
            currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
        }
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        if (carouselElement.id === 'hours-carousel') {
            currentHour = currentValRef.value;
        } else {
            currentMinute = currentValRef.value;
        }
    });
}

const hourRef = { value: currentHour };
const minuteRef = { value: currentMinute };

setupMainCarouselScroll(hoursCarousel, hoursItems, hourRef, 24);
setupMainCarouselScroll(minutesCarousel, minutesItems, minuteRef, 60);

// --- Button Click Logic for Main Carousels ---
function setupCarouselButtons(upButton, downButton, itemsElement, currentValRef, totalItems, carouselId) {
    upButton.addEventListener('click', () => {
        currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        if (carouselId === 'hours-carousel') {
            currentHour = currentValRef.value;
        } else {
            currentMinute = currentValRef.value;
        }
    });

    downButton.addEventListener('click', () => {
        currentValRef.value = (currentValRef.value + 1) % totalItems;
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        if (carouselId === 'hours-carousel') {
            currentHour = currentValRef.value;
        } else {
            currentMinute = currentValRef.value;
        }
    });
}

setupCarouselButtons(hoursUpButton, hoursDownButton, hoursItems, hourRef, 24, 'hours-carousel');
setupCarouselButtons(minutesUpButton, minutesDownButton, minutesItems, minuteRef, 60, 'minutes-carousel');


// --- Selection Carousel Logic ---
const NUM_REPEATS = 3; // Number of times to repeat the full sequence (e.g., 0-23, 0-23, 0-23)
let isTransitioning = false; // Flag to prevent rapid jumps

function populateSelectionCarousel(itemsContainer, totalItems, parentOverlay, currentValRef) {
    itemsContainer.innerHTML = ''; // Clear previous content
    for (let r = 0; r < NUM_REPEATS; r++) { // Repeat the sequence NUM_REPEATS times
        for (let i = 0; i < totalItems; i++) {
            const value = i.toString().padStart(2, '0');
            const item = document.createElement('div');
            item.classList.add('item');
            item.textContent = value;
            // Store the actual value, not the repeated index
            item.dataset.value = i;
            // Store the full index within the repeated list
            item.dataset.fullIndex = (r * totalItems) + i;
            itemsContainer.appendChild(item);

            item.addEventListener('click', (event) => {
                const selectedValue = parseInt(event.target.dataset.value);
                currentValRef.value = selectedValue; // Update the reference

                if (parentOverlay.id === 'hours-selection-overlay') {
                    currentHour = selectedValue;
                    updateMainCarouselPosition(hoursItems, currentHour);
                } else {
                    currentMinute = selectedValue;
                    updateMainCarouselPosition(minutesItems, currentMinute);
                }
                parentOverlay.classList.remove('active'); // Close the overlay
            });
        }
    }
}

function updateSelectionCarouselPosition(itemsContainer, currentLogicalIndex, totalItems, isScrolling = false) {
    // Calculate the base index in the middle repetition block
    // The middle block starts after the first (NUM_REPEATS / 2) full sequences
    const midBlockStartOffset = Math.floor(NUM_REPEATS / 2) * totalItems;
    let targetFullIndex = midBlockStartOffset + currentLogicalIndex;

    let targetTransformY = -(targetFullIndex * itemHeight) + (bufferItems * itemHeight); // Offset by buffer to center


    // Apply transform
    // Temporarily disable transition for instant jumps, then re-enable for smooth scrolling
    if (!isScrolling && isTransitioning) { // Only apply transition for non-scrolling actions like click-to-center
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    } else if (isScrolling && !isTransitioning) {
        // When we detect a "snap back", remove the transition momentarily
        itemsContainer.style.transition = 'none';
    } else if (!isScrolling && !isTransitioning) { // If it's the first render (no scroll, no existing transition)
        itemsContainer.style.transition = `transform 0.2s ease-out`; // Add transition if not already active
    }


    itemsContainer.style.transform = `translateY(${targetTransformY}px)`;


    // This is the core "infinite scroll" logic for the overlay.
    // It checks if we're near the boundaries of the middle block
    // and "snaps" the position back to the equivalent spot in another block
    // without the user noticing the jump.

    // Get the current actual pixel position (from the transform)
    const currentTransformY = parseFloat(itemsContainer.style.transform.replace('translateY(', '').replace('px)', ''));

    // Calculate where we are relative to the start of the middle block
    const scrolledOffset = Math.abs(currentTransformY) - (midBlockStartOffset * itemHeight) + (bufferItems * itemHeight);


    if (scrolledOffset < (bufferItems * itemHeight) && currentLogicalIndex >= 0) { // Scrolled near the top of the middle block
        // Jump to the equivalent position in the last block
        const newLogicalIndex = currentLogicalIndex;
        const newTargetFullIndex = (NUM_REPEATS - 1) * totalItems + newLogicalIndex;
        const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

        // Turn off transition, jump, then turn on
        itemsContainer.style.transition = 'none';
        requestAnimationFrame(() => { // Use rAF for a smooth snap
            itemsContainer.style.transform = `translateY(${newTransformY}px)`;
            if (isScrolling) {
                // isTransitioning = true; // Set flag to indicate transition is desired for next scroll
                // itemsContainer.style.transition = `transform 0.2s ease-out`; // Re-enable for subsequent scrolls
            }
        });
    } else if (scrolledOffset > ((totalItems - bufferItems) * itemHeight)) { // Scrolled near the bottom of the middle block
        // Jump to the equivalent position in the first block
        const newLogicalIndex = currentLogicalIndex;
        const newTargetFullIndex = (0 * totalItems) + newLogicalIndex; // First block
        const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

        itemsContainer.style.transition = 'none';
        requestAnimationFrame(() => {
            itemsContainer.style.transform = `translateY(${newTransformY}px)`;
            if (isScrolling) {
                // isTransitioning = true;
                // itemsContainer.style.transition = `transform 0.2s ease-out`;
            }
        });
    }
    // Re-enable transition after potential jump if not already enabled by initial conditions
    if (!isTransitioning) { // Only if we weren't already transitioning from a click.
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    }
}


function setupSelectionCarouselInteraction(mainItemsElement, selectionOverlay, selectionItemsContainer, currentValRef, totalItems) {
    mainItemsElement.addEventListener('click', (event) => {
        populateSelectionCarousel(selectionItemsContainer, totalItems, selectionOverlay, currentValRef);
        // When opening, set initial position smoothly
        isTransitioning = true;
        selectionItemsContainer.style.transition = `transform 0.2s ease-out`;
        updateSelectionCarouselPosition(selectionItemsContainer, currentValRef.value, totalItems, false);
        selectionOverlay.classList.add('active');
        event.stopPropagation();
        setTimeout(() => { // Reset transition flag after the initial smooth scroll
            isTransitioning = false;
        }, 200); // Match CSS transition duration
    });

    selectionOverlay.addEventListener('click', (event) => {
        if (event.target === selectionOverlay) {
            selectionOverlay.classList.remove('active');
        }
    });

    selectionOverlay.querySelector('.selection-carousel').addEventListener('wheel', (event) => {
        event.preventDefault();
        let newLogicalIndex = currentValRef.value;

        if (event.deltaY > 0) { // Scroll down
            newLogicalIndex = (newLogicalIndex + 1) % totalItems;
        } else { // Scroll up
            newLogicalIndex = (newLogicalIndex - 1 + totalItems) % totalItems;
        }
        currentValRef.value = newLogicalIndex;

        // Update main carousel
        if (selectionOverlay.id === 'hours-selection-overlay') {
            currentHour = newLogicalIndex;
            updateMainCarouselPosition(hoursItems, currentHour);
        } else {
            currentMinute = newLogicalIndex;
            updateMainCarouselPosition(minutesItems, currentMinute);
        }

        // Update selection carousel position for the current logical index
        // Allow immediate jump if needed for wrapping, then smooth scroll
        selectionItemsContainer.style.transition = `transform 0.2s ease-out`; // Ensure transition is on for scrolling
        updateSelectionCarouselPosition(selectionItemsContainer, newLogicalIndex, totalItems, true);

        // Re-enable transition after scroll if it was turned off for a snap
        // This part might need fine-tuning if snaps cause issues, but general approach is here
        // setTimeout(() => { selectionItemsContainer.style.transition = `transform 0.2s ease-out`; }, 0);
    });
}

// Setup interactions for both hours and minutes
setupSelectionCarouselInteraction(hoursItems, hoursSelectionOverlay, hoursSelectionItems, hourRef, 24);
setupSelectionCarouselInteraction(minutesItems, minutesSelectionOverlay, minutesSelectionItems, minuteRef, 60);

// Initial population for the selection carousels (needed when they first open)
populateSelectionCarousel(hoursSelectionItems, 24, hoursSelectionOverlay, hourRef);
populateSelectionCarousel(minutesSelectionItems, 60, minutesSelectionOverlay, minuteRef);

// Set initial values based on current time
const now = new Date();
// Call setInitialTime here, after all elements are defined and populated
setInitialTime(now.getHours(), now.getMinutes());

document.addEventListener('DOMContentLoaded', () => {
    // Main input carousels
    const hoursCarousel = document.getElementById('hours-carousel');
    const hoursItems = document.getElementById('hours-items');
    const hoursUpButton = hoursCarousel.querySelector('.carousel-button.up');
    const hoursDownButton = hoursCarousel.querySelector('.carousel-button.down');

    const minutesCarousel = document.getElementById('minutes-carousel');
    const minutesItems = document.getElementById('minutes-items');
    const minutesUpButton = minutesCarousel.querySelector('.carousel-button.up');
    const minutesDownButton = minutesCarousel.querySelector('.carousel-button.down');

    // let currentHour = 0; // Já definido globalmente acima para exportação
    // let currentMinute = 0; // Já definido globalmente acima para exportação
    const itemHeight = 50; // Height of each item in pixels
    const itemsInView = 5; // Number of items visible in the selection carousel (250px / 50px)
    const bufferItems = Math.floor(itemsInView / 2); // Items above/below center to keep full (2 items)

    // References for the new selection carousels
    const hoursSelectionOverlay = document.getElementById('hours-selection-overlay');
    const hoursSelectionCarousel = document.getElementById('hours-selection-carousel');
    const hoursSelectionItems = document.getElementById('hours-selection-items');

    const minutesSelectionOverlay = document.getElementById('minutes-selection-overlay');
    const minutesSelectionCarousel = document.getElementById('minutes-selection-carousel');
    const minutesSelectionItems = document.getElementById('minutes-selection-items');


    // --- Main Input Carousel Population ---
    function populateMainCarousel(itemsContainer, totalItems) {
        itemsContainer.innerHTML = ''; // Clear existing items
        for (let i = 0; i < totalItems; i++) {
            const value = i.toString().padStart(2, '0');
            const item = document.createElement('div');
            item.classList.add('item');
            item.textContent = value;
            itemsContainer.appendChild(item);
        }
    }

    populateMainCarousel(hoursItems, 24);
    populateMainCarousel(minutesItems, 60);

    // --- Main Input Carousel Position Update ---
    function updateMainCarouselPosition(carouselItems, currentIndex) {
        carouselItems.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
    }

    // Initial positions for main carousels (moved to setInitialTime for external control)
    // updateMainCarouselPosition(hoursItems, currentHour);
    // updateMainCarouselPosition(minutesItems, currentMinute);

    // --- Main Input Carousel Scroll Logic ---
    function setupMainCarouselScroll(carouselElement, itemsElement, currentValRef, totalItems) {
        itemsElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (event.deltaY > 0) { // Scroll down
                currentValRef.value = (currentValRef.value + 1) % totalItems;
            } else { // Scroll up
                currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
            }
            updateMainCarouselPosition(itemsElement, currentValRef.value);
            if (carouselElement.id === 'hours-carousel') {
                currentHour = currentValRef.value;
            } else {
                currentMinute = currentValRef.value;
            }
        });
    }

    const hourRef = { value: currentHour };
    const minuteRef = { value: currentMinute };

    setupMainCarouselScroll(hoursCarousel, hoursItems, hourRef, 24);
    setupMainCarouselScroll(minutesCarousel, minutesItems, minuteRef, 60);

    // --- Button Click Logic for Main Carousels ---
    function setupCarouselButtons(upButton, downButton, itemsElement, currentValRef, totalItems, carouselId) {
        upButton.addEventListener('click', () => {
            currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
            updateMainCarouselPosition(itemsElement, currentValRef.value);
            if (carouselId === 'hours-carousel') {
                currentHour = currentValRef.value;
            } else {
                currentMinute = currentValRef.value;
            }
        });

        downButton.addEventListener('click', () => {
            currentValRef.value = (currentValRef.value + 1) % totalItems;
            updateMainCarouselPosition(itemsElement, currentValRef.value);
            if (carouselId === 'hours-carousel') {
                currentHour = currentValRef.value;
            } else {
                currentMinute = currentValRef.value;
            }
        });
    }

    setupCarouselButtons(hoursUpButton, hoursDownButton, hoursItems, hourRef, 24, 'hours-carousel');
    setupCarouselButtons(minutesUpButton, minutesDownButton, minutesItems, minuteRef, 60, 'minutes-carousel');


    // --- Selection Carousel Logic ---
    const NUM_REPEATS = 3; // Number of times to repeat the full sequence (e.g., 0-23, 0-23, 0-23)
    let isTransitioning = false; // Flag to prevent rapid jumps

    function populateSelectionCarousel(itemsContainer, totalItems, parentOverlay, currentValRef) {
        itemsContainer.innerHTML = ''; // Clear previous content
        for (let r = 0; r < NUM_REPEATS; r++) { // Repeat the sequence NUM_REPEATS times
            for (let i = 0; i < totalItems; i++) {
                const value = i.toString().padStart(2, '0');
                const item = document.createElement('div');
                item.classList.add('item');
                item.textContent = value;
                // Store the actual value, not the repeated index
                item.dataset.value = i;
                // Store the full index within the repeated list
                item.dataset.fullIndex = (r * totalItems) + i;
                itemsContainer.appendChild(item);

                item.addEventListener('click', (event) => {
                    const selectedValue = parseInt(event.target.dataset.value);
                    currentValRef.value = selectedValue; // Update the reference

                    if (parentOverlay.id === 'hours-selection-overlay') {
                        currentHour = selectedValue;
                        updateMainCarouselPosition(hoursItems, currentHour);
                    } else {
                        currentMinute = selectedValue;
                        updateMainCarouselPosition(minutesItems, currentMinute);
                    }
                    parentOverlay.classList.remove('active'); // Close the overlay
                });
            }
        }
    }

    function updateSelectionCarouselPosition(itemsContainer, currentLogicalIndex, totalItems, isScrolling = false) {
        // Calculate the base index in the middle repetition block
        const midBlockStartOffset = Math.floor(NUM_REPEATS / 2) * totalItems;
        let targetFullIndex = midBlockStartOffset + currentLogicalIndex;

        let targetTransformY = -(targetFullIndex * itemHeight) + (bufferItems * itemHeight); // Offset by buffer to center


        // Apply transform
        if (!isScrolling && isTransitioning) {
            itemsContainer.style.transition = `transform 0.2s ease-out`;
        } else if (isScrolling && !isTransitioning) {
            itemsContainer.style.transition = 'none';
        } else if (!isScrolling && !isTransitioning) {
            itemsContainer.style.transition = `transform 0.2s ease-out`;
        }


        itemsContainer.style.transform = `translateY(${targetTransformY}px)`;


        const currentTransformY = parseFloat(itemsContainer.style.transform.replace('translateY(', '').replace('px)', ''));

        const scrolledOffset = Math.abs(currentTransformY) - (midBlockStartOffset * itemHeight) + (bufferItems * itemHeight);


        if (scrolledOffset < (bufferItems * itemHeight) && currentLogicalIndex >= 0) {
            const newLogicalIndex = currentLogicalIndex;
            const newTargetFullIndex = (NUM_REPEATS - 1) * totalItems + newLogicalIndex;
            const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

            itemsContainer.style.transition = 'none';
            requestAnimationFrame(() => {
                itemsContainer.style.transform = `translateY(${newTransformY}px)`;
            });
        } else if (scrolledOffset > ((totalItems - bufferItems) * itemHeight)) {
            const newLogicalIndex = currentLogicalIndex;
            const newTargetFullIndex = (0 * totalItems) + newLogicalIndex;
            const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

            itemsContainer.style.transition = 'none';
            requestAnimationFrame(() => {
                itemsContainer.style.transform = `translateY(${newTransformY}px)`;
            });
        }
        if (!isTransitioning) {
            itemsContainer.style.transition = `transform 0.2s ease-out`;
        }
    }


    function setupSelectionCarouselInteraction(mainItemsElement, selectionOverlay, selectionItemsContainer, currentValRef, totalItems) {
        mainItemsElement.addEventListener('click', (event) => {
            populateSelectionCarousel(selectionItemsContainer, totalItems, selectionOverlay, currentValRef);
            isTransitioning = true;
            selectionItemsContainer.style.transition = `transform 0.2s ease-out`;
            updateSelectionCarouselPosition(selectionItemsContainer, currentValRef.value, totalItems, false);
            selectionOverlay.classList.add('active');
            event.stopPropagation();
            setTimeout(() => {
                isTransitioning = false;
            }, 200);
        });

        selectionOverlay.addEventListener('click', (event) => {
            if (event.target === selectionOverlay) {
                selectionOverlay.classList.remove('active');
            }
        });

        selectionOverlay.querySelector('.selection-carousel').addEventListener('wheel', (event) => {
            event.preventDefault();
            let newLogicalIndex = currentValRef.value;

            if (event.deltaY > 0) { // Scroll down
                newLogicalIndex = (newLogicalIndex + 1) % totalItems;
            } else { // Scroll up
                newLogicalIndex = (newLogicalIndex - 1 + totalItems) % totalItems;
            }
            currentValRef.value = newLogicalIndex;

            // Update main carousel
            if (selectionOverlay.id === 'hours-selection-overlay') {
                currentHour = newLogicalIndex;
                updateMainCarouselPosition(hoursItems, currentHour);
            } else {
                currentMinute = newLogicalIndex;
                updateMainCarouselPosition(minutesItems, currentMinute);
            }

            selectionItemsContainer.style.transition = `transform 0.2s ease-out`;
            updateSelectionCarouselPosition(selectionItemsContainer, newLogicalIndex, totalItems, true);
        });
    }

    // Setup interactions for both hours and minutes
    setupSelectionCarouselInteraction(hoursItems, hoursSelectionOverlay, hoursSelectionItems, hourRef, 24);
    setupSelectionCarouselInteraction(minutesItems, minutesSelectionOverlay, minutesSelectionItems, minuteRef, 60);

    // Initial population for the selection carousels (needed when they first open)
    populateSelectionCarousel(hoursSelectionItems, 24, hoursSelectionOverlay, hourRef);
    populateSelectionCarousel(minutesSelectionItems, 60, minutesSelectionOverlay, minuteRef);

    // Set initial values based on current time
    const now = new Date();
    setInitialTime(now.getHours(), now.getMinutes());
});
