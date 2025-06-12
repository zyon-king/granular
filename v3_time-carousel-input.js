// v1_time-carousel-input.js
// Este script gerencia os carrosséis de hora e minuto.

// Variáveis que armazenam a hora e o minuto selecionados
// Elas se tornarão globais porque o script é carregado sem type="module"
let currentHour = 0;
let currentMinute = 0;

// Função para obter a hora selecionada (globalmente disponível)
function getSelectedHour() {
    return currentHour;
}

// Função para obter o minuto selecionado (globalmente disponível)
function getSelectedMinute() {
    return currentMinute;
}

// Função para definir a hora inicial nos carrosséis (globalmente disponível)
function setInitialTime(hour, minute) {
    currentHour = hour;
    currentMinute = minute;
    // Verifica se os elementos do DOM já existem antes de tentar manipulá-los
    if (typeof hoursItems !== 'undefined' && typeof minutesItems !== 'undefined') {
        updateMainCarouselPosition(hoursItems, currentHour);
        updateMainCarouselPosition(minutesItems, currentMinute);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // ... (restante do código do seu v1_time-carousel-input.js permanece o mesmo) ...

    // Referências aos elementos do DOM para os carrosséis principais
    const hoursCarousel = document.getElementById('hours-carousel');
    const hoursItems = document.getElementById('hours-items');
    const hoursUpButton = hoursCarousel.querySelector('.carousel-button.up');
    const hoursDownButton = hoursCarousel.querySelector('.carousel-button.down');

    const minutesCarousel = document.getElementById('minutes-carousel');
    const minutesItems = document.getElementById('minutes-items');
    const minutesUpButton = minutesCarousel.querySelector('.carousel-button.up');
    const minutesDownButton = minutesCarousel.querySelector('.carousel-button.down');

    const itemHeight = 50; // Altura de cada item em pixels
    const itemsInView = 5; // Número de itens visíveis no carrossel de seleção (250px / 50px)
    const bufferItems = Math.floor(itemsInView / 2); // Itens acima/abaixo do centro para manter o preenchimento (2 itens)

    // Referências aos elementos do DOM para os carrosséis de seleção em overlay
    const hoursSelectionOverlay = document.getElementById('hours-selection-overlay');
    const hoursSelectionCarousel = document.getElementById('hours-selection-carousel');
    const hoursSelectionItems = document.getElementById('hours-selection-items');

    const minutesSelectionOverlay = document.getElementById('minutes-selection-overlay');
    const minutesSelectionCarousel = document.getElementById('minutes-selection-carousel');
    const minutesSelectionItems = document.getElementById('minutes-selection-items');

    // --- População dos Carrosséis Principais ---
    function populateMainCarousel(itemsContainer, totalItems) {
        itemsContainer.innerHTML = ''; // Limpa itens existentes
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

    // --- Atualização da Posição dos Carrosséis Principais ---
    function updateMainCarouselPosition(carouselItems, currentIndex) {
        carouselItems.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
    }

    // --- Lógica de Scroll dos Carrosséis Principais ---
    function setupMainCarouselScroll(carouselElement, itemsElement, currentValRef, totalItems) {
        itemsElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (event.deltaY > 0) { // Scroll para baixo
                currentValRef.value = (currentValRef.value + 1) % totalItems;
            } else { // Scroll para cima
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

    // --- Lógica de Clique dos Botões dos Carrosséis Principais ---
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

    // --- Lógica do Carrossel de Seleção (Overlay) ---
    const NUM_REPEATS = 3; // Número de vezes para repetir a sequência completa (e.g., 0-23, 0-23, 0-23)
    let isTransitioning = false; // Flag para prevenir saltos rápidos

    function populateSelectionCarousel(itemsContainer, totalItems, parentOverlay, currentValRef) {
        itemsContainer.innerHTML = ''; // Limpa conteúdo anterior
        for (let r = 0; r < NUM_REPEATS; r++) { // Repete a sequência NUM_REPEATS vezes
            for (let i = 0; i < totalItems; i++) {
                const value = i.toString().padStart(2, '0');
                const item = document.createElement('div');
                item.classList.add('item');
                item.textContent = value;
                item.dataset.value = i; // Armazena o valor real
                item.dataset.fullIndex = (r * totalItems) + i; // Armazena o índice completo na lista repetida
                itemsContainer.appendChild(item);

                item.addEventListener('click', (event) => {
                    const selectedValue = parseInt(event.target.dataset.value);
                    currentValRef.value = selectedValue; // Atualiza a referência
                    
                    // Atualiza as variáveis globais (currentHour/currentMinute)
                    if (parentOverlay.id === 'hours-selection-overlay') {
                        currentHour = selectedValue;
                        updateMainCarouselPosition(hoursItems, currentHour); // Atualiza o carrossel principal
                    } else {
                        currentMinute = selectedValue;
                        updateMainCarouselPosition(minutesItems, currentMinute); // Atualiza o carrossel principal
                    }
                    parentOverlay.classList.remove('active'); // Fecha o overlay
                });
            }
        }
    }

    function updateSelectionCarouselPosition(itemsContainer, currentLogicalIndex, totalItems, isScrolling = false) {
        const midBlockStartOffset = Math.floor(NUM_REPEATS / 2) * totalItems;
        let targetFullIndex = midBlockStartOffset + currentLogicalIndex;

        let targetTransformY = -(targetFullIndex * itemHeight) + (bufferItems * itemHeight);

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

            if (event.deltaY > 0) { // Scroll para baixo
                newLogicalIndex = (newLogicalIndex + 1) % totalItems;
            } else { // Scroll para cima
                newLogicalIndex = (newLogicalIndex - 1 + totalItems) % totalItems;
            }
            currentValRef.value = newLogicalIndex;

            if (selectionOverlay.id === 'hours-selection-overlay') {
                currentHour = newLogicalIndex;
                updateMainCarouselPosition(hoursItems, currentHour);
            } else {
                currentMinute = newLogicalIndex;
                currentMinute = newLogicalIndex;
                updateMainCarouselPosition(minutesItems, currentMinute);
            }

            selectionItemsContainer.style.transition = `transform 0.2s ease-out`;
            updateSelectionCarouselPosition(selectionItemsContainer, newLogicalIndex, totalItems, true);
        });
    }

    // Configura interações para horas e minutos
    setupSelectionCarouselInteraction(hoursItems, hoursSelectionOverlay, hoursSelectionItems, hourRef, 24);
    setupSelectionCarouselInteraction(minutesItems, minutesSelectionOverlay, minutesSelectionItems, minuteRef, 60);

    // População inicial para os carrosséis de seleção (necessário quando abrem pela primeira vez)
    populateSelectionCarousel(hoursSelectionItems, 24, hoursSelectionOverlay, hourRef);
    populateSelectionCarousel(minutesSelectionItems, 60, minutesSelectionOverlay, minuteRef);

    // Define os valores iniciais com base na hora atual
    const now = new Date();
    setInitialTime(now.getHours(), now.getMinutes()); // Chamada da função global
});
