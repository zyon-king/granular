// v3_time-carousel-input.js
// Este script gerencia a configuração de múltiplos pares de carrosséis de hora e minuto.

// Altura de cada item e número de itens visíveis
const CAROUSEL_ITEM_HEIGHT = 50; // Altura de cada item em pixels
const CAROUSEL_ITEMS_IN_VIEW = 5; // Número de itens visíveis no carrossel de seleção (250px / 50px)
const CAROUSEL_BUFFER_ITEMS = Math.floor(CAROUSEL_ITEMS_IN_VIEW / 2); // Itens acima/abaixo do centro para manter o preenchimento (2 itens)
const SELECTION_NUM_REPEATS = 3; // Número de vezes para repetir a sequência completa no overlay

/**
 * Configura um par de carrosséis de hora e minuto (principal e opcionalmente o overlay de seleção).
 * @param {string} hoursCarouselId - ID do container do carrossel de horas principal.
 * @param {string} hoursItemsId - ID do container dos itens do carrossel de horas principal.
 * @param {string} minutesCarouselId - ID do container do carrossel de minutos principal.
 * @param {string} minutesItemsId - ID do container dos itens do carrossel de minutos principal.
 * @param {string|null} hoursOverlayId - ID do overlay de seleção de horas (opcional).
 * @param {string|null} hoursSelectionCarouselId - ID do carrossel de seleção de horas dentro do overlay (opcional).
 * @param {string|null} hoursSelectionItemsId - ID do container dos itens de seleção de horas dentro do overlay (opcional).
 * @param {string|null} minutesOverlayId - ID do overlay de seleção de minutos (opcional).
 * @param {string|null} minutesSelectionCarouselId - ID do carrossel de seleção de minutos dentro do overlay (opcional).
 * @param {string|null} minutesSelectionItemsId - ID do container dos itens de seleção de minutos dentro do overlay (opcional).
 * @param {number} totalHours - Número total de horas (e.g., 24).
 * @param {number} totalMinutes - Número total de minutos (e.g., 60).
 * @returns {object} Um objeto com métodos getHour(), getMinute() e setTime(h, m) para este par de carrosséis.
 */
function setupTimeCarousels(
    hoursCarouselId, hoursItemsId,
    minutesCarouselId, minutesItemsId,
    hoursOverlayId, hoursSelectionCarouselId, hoursSelectionItemsId,
    minutesOverlayId, minutesSelectionCarouselId, minutesSelectionItemsId,
    totalHours, totalMinutes
) {
    // Variáveis internas para este par de carrosséis
    let _currentHour = 0;
    let _currentMinute = 0;
    let isTransitioning = false; // Flag para prevenir saltos rápidos no overlay

    // --- Referências aos elementos do DOM para este par de carrosséis ---
    const hoursCarousel = document.getElementById(hoursCarouselId);
    const hoursItems = document.getElementById(hoursItemsId);
    const hoursUpButton = hoursCarousel ? hoursCarousel.querySelector('.carousel-button.up') : null;
    const hoursDownButton = hoursCarousel ? hoursCarousel.querySelector('.carousel-button.down') : null;

    const minutesCarousel = document.getElementById(minutesMinutesId);
    const minutesItems = document.getElementById(minutesItemsId);
    const minutesUpButton = minutesCarousel ? minutesCarousel.querySelector('.carousel-button.up') : null;
    const minutesDownButton = minutesCarousel ? minutesCarousel.querySelector('.carousel-button.down') : null;

    // Referências aos elementos do DOM para os carrosséis de seleção em overlay (se fornecidos)
    const hoursSelectionOverlay = hoursOverlayId ? document.getElementById(hoursOverlayId) : null;
    const hoursSelectionCarousel = hoursSelectionCarouselId ? document.getElementById(hoursSelectionCarouselId) : null;
    const hoursSelectionItems = hoursSelectionItemsId ? document.getElementById(hoursSelectionItemsId) : null;

    const minutesSelectionOverlay = minutesOverlayId ? document.getElementById(minutesOverlayId) : null;
    const minutesSelectionCarousel = minutesSelectionCarouselId ? document.getElementById(minutesSelectionCarouselId) : null;
    const minutesSelectionItems = minutesSelectionItemsId ? document.getElementById(minutesSelectionItemsId) : null;

    // --- Funções Auxiliares Internas ---

    function populateMainCarousel(itemsContainer, total) {
        itemsContainer.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const value = i.toString().padStart(2, '0');
            const item = document.createElement('div');
            item.classList.add('item');
            item.textContent = value;
            itemsContainer.appendChild(item);
        }
    }

    function updateMainCarouselPosition(itemsContainer, currentIndex) {
        itemsContainer.style.transform = `translateY(-${currentIndex * CAROUSEL_ITEM_HEIGHT}px)`;
    }

    function setupMainCarouselScroll(itemsElement, total, isHourCarousel) {
        itemsElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (event.deltaY > 0) { // Scroll para baixo
                if (isHourCarousel) {
                    _currentHour = (_currentHour + 1) % total;
                } else {
                    _currentMinute = (_currentMinute + 1) % total;
                }
            } else { // Scroll para cima
                if (isHourCarousel) {
                    _currentHour = (_currentHour - 1 + total) % total;
                } else {
                    _currentMinute = (_currentMinute - 1 + total) % total;
                }
            }
            updateMainCarouselPosition(itemsElement, isHourCarousel ? _currentHour : _currentMinute);
        });
    }

    function setupCarouselButtons(upButton, downButton, itemsElement, total, isHourCarousel) {
        if (!upButton || !downButton) return; // Se os botões não existirem (ex: para carrosséis sem botões de scroll)

        upButton.addEventListener('click', () => {
            if (isHourCarousel) {
                _currentHour = (_currentHour - 1 + total) % total;
            } else {
                _currentMinute = (_currentMinute - 1 + total) % total;
            }
            updateMainCarouselPosition(itemsElement, isHourCarousel ? _currentHour : _currentMinute);
        });

        downButton.addEventListener('click', () => {
            if (isHourCarousel) {
                _currentHour = (_currentHour + 1) % total;
            } else {
                _currentMinute = (_currentMinute + 1) % total;
            }
            updateMainCarouselPosition(itemsElement, isHourCarousel ? _currentHour : _currentMinute);
        });
    }

    function populateSelectionCarousel(itemsContainer, total, parentOverlay, currentValGetter, currentValSetter, isHourCarousel) {
        itemsContainer.innerHTML = '';
        for (let r = 0; r < SELECTION_NUM_REPEATS; r++) {
            for (let i = 0; i < total; i++) {
                const value = i.toString().padStart(2, '0');
                const item = document.createElement('div');
                item.classList.add('item');
                item.textContent = value;
                item.dataset.value = i;
                item.dataset.fullIndex = (r * total) + i;
                itemsContainer.appendChild(item);

                item.addEventListener('click', (event) => {
                    const selectedValue = parseInt(event.target.dataset.value);
                    currentValSetter(selectedValue); // Atualiza a variável interna
                    updateMainCarouselPosition(isHourCarousel ? hoursItems : minutesItems, selectedValue); // Atualiza o carrossel principal
                    parentOverlay.classList.remove('active'); // Fecha o overlay
                });
            }
        }
    }

    function updateSelectionCarouselPosition(itemsContainer, currentLogicalIndex, total, isScrolling = false) {
        const midBlockStartOffset = Math.floor(SELECTION_NUM_REPEATS / 2) * total;
        let targetFullIndex = midBlockStartOffset + currentLogicalIndex;

        let targetTransformY = -(targetFullIndex * CAROUSEL_ITEM_HEIGHT) + (CAROUSEL_BUFFER_ITEMS * CAROUSEL_ITEM_HEIGHT);

        itemsContainer.style.transition = isScrolling && !isTransitioning ? 'none' : `transform 0.2s ease-out`;
        itemsContainer.style.transform = `translateY(${targetTransformY}px)`;

        // Lógica de loop infinito para o carrossel de seleção (teletransporte visual)
        itemsContainer.addEventListener('transitionend', function handler() {
            if (isTransitioning) { // Apenas se a transição foi disparada por um clique no main carousel
                itemsContainer.style.transition = 'none';
                itemsContainer.style.transform = `translateY(${targetTransformY}px)`;
                isTransitioning = false; // Reset da flag
            }
            itemsContainer.removeEventListener('transitionend', handler);
        });

        // Este bloco é para o teletransporte durante o scroll com o mouse (wheel)
        // Isso é mais complexo com transição, talvez remover a transição no wheel e deixar snap
        // Ou refatorar a lógica para ser baseada em currentIndex e totalItems de forma mais robusta.
        // Por simplicidade para a função global, vamos remover a lógica de teletransporte aqui por enquanto,
        // e focar apenas na atualização direta da posição.
        // A lógica de teletransporte para o "fim do bloco" será feita no click para abrir e setar
        // e no scroll do overlay, garantindo que o index lógico sempre esteja correto.
    }


    function setupSelectionCarouselInteraction(
        mainItemsElement, selectionOverlay, selectionItemsContainer,
        currentValGetter, currentValSetter, total, isHourCarousel
    ) {
        if (!mainItemsElement || !selectionOverlay) return; // Se não houver overlay, não configura a interação

        mainItemsElement.addEventListener('click', (event) => {
            // Oculta todos os overlays de seleção ativos antes de abrir um novo
            document.querySelectorAll('.selection-overlay.active').forEach(overlay => {
                overlay.classList.remove('active');
            });

            populateSelectionCarousel(selectionItemsContainer, total, selectionOverlay, currentValGetter, currentValSetter, isHourCarousel);
            isTransitioning = true; // Define a flag para a transição inicial
            
            // Define o transform inicial para o item atualmente selecionado
            const initialLogicalIndex = currentValGetter();
            const midBlockStartOffset = Math.floor(SELECTION_NUM_REPEATS / 2) * total;
            const initialTargetFullIndex = midBlockStartOffset + initialLogicalIndex;
            const initialTransformY = -(initialTargetFullIndex * CAROUSEL_ITEM_HEIGHT) + (CAROUSEL_BUFFER_ITEMS * CAROUSEEL_ITEM_HEIGHT);
            selectionItemsContainer.style.transition = 'none'; // Desabilita a transição para o jump inicial
            selectionItemsContainer.style.transform = `translateY(${initialTransformY}px)`;


            selectionOverlay.classList.add('active');
            event.stopPropagation(); // Evita que o clique no mainItemsElement feche o overlay imediatamente
        });

        selectionOverlay.addEventListener('click', (event) => {
            if (event.target === selectionOverlay || event.target.classList.contains('selection-carousel')) {
                selectionOverlay.classList.remove('active');
            }
        });

        // Adiciona um listener para rolagem no overlay de seleção
        if (selectionCarousel) { // Verifica se o elemento existe
             selectionCarousel.addEventListener('wheel', (event) => {
                event.preventDefault();
                let newLogicalIndex = currentValGetter();

                if (event.deltaY > 0) { // Scroll para baixo
                    newLogicalIndex = (newLogicalIndex + 1) % total;
                } else { // Scroll para cima
                    newLogicalIndex = (newLogicalIndex - 1 + total) % total;
                }
                currentValSetter(newLogicalIndex); // Atualiza a variável interna

                // Calcula a nova posição baseada no index lógico atual dentro do bloco do meio
                const midBlockStartOffset = Math.floor(SELECTION_NUM_REPEATS / 2) * total;
                const targetFullIndex = midBlockStartOffset + newLogicalIndex;
                const targetTransformY = -(targetFullIndex * CAROUSEL_ITEM_HEIGHT) + (CAROUSEL_BUFFER_ITEMS * CAROUSEL_ITEM_HEIGHT);

                selectionItemsContainer.style.transition = `transform 0.2s ease-out`; // Re-habilita a transição
                selectionItemsContainer.style.transform = `translateY(${targetTransformY}px)`;

                // Atualiza o carrossel principal em tempo real durante a rolagem do overlay
                updateMainCarouselPosition(isHourCarousel ? hoursItems : minutesItems, newLogicalIndex);
            });
        }
    }

    // --- Inicialização para este par de carrosséis ---
    if (hoursItems) { // Popula e configura o carrossel de horas principal
        populateMainCarousel(hoursItems, totalHours);
        setupMainCarouselScroll(hoursItems, totalHours, true);
        setupCarouselButtons(hoursUpButton, hoursDownButton, hoursItems, totalHours, true);
        if (hoursSelectionOverlay) {
            setupSelectionCarouselInteraction(
                hoursItems, hoursSelectionOverlay, hoursSelectionItems,
                () => _currentHour, (val) => _currentHour = val, totalHours, true
            );
        }
    }

    if (minutesItems) { // Popula e configura o carrossel de minutos principal
        populateMainCarousel(minutesItems, totalMinutes);
        setupMainCarouselScroll(minutesItems, totalMinutes, false);
        setupCarouselButtons(minutesUpButton, minutesDownButton, minutesItems, totalMinutes, false);
        if (minutesSelectionOverlay) {
            setupSelectionCarouselInteraction(
                minutesItems, minutesSelectionOverlay, minutesSelectionItems,
                () => _currentMinute, (val) => _currentMinute = val, totalMinutes, false
            );
        }
    }
    
    // Retorna métodos para acessar e definir a hora/minuto deste par de carrosséis
    return {
        getHour: () => _currentHour,
        getMinute: () => _currentMinute,
        setTime: (hour, minute) => {
            _currentHour = hour;
            _currentMinute = minute;
            if (hoursItems) updateMainCarouselPosition(hoursItems, _currentHour);
            if (minutesItems) updateMainCarouselPosition(minutesItems, _currentMinute);
        }
    };
}

// O código abaixo será a ÚNICA parte que permanece no DOMContentLoaded original
// e será responsável por chamar setupTimeCarousels para cada conjunto.
document.addEventListener('DOMContentLoaded', () => {
    // Exemplo de como usar a função setupTimeCarousels para o carrossel principal:
    // (Este é o carrossel que antes usava as variáveis globais `currentHour` e `currentMinute`)
    // AGORA, ele também terá sua própria instância.

    // Remova as antigas definições de currentHour, currentMinute, getSelectedHour, getSelectedMinute
    // Se elas estiverem aqui. Elas serão substituídas pelo objeto retornado por setupTimeCarousels.

    const mainAlarmCarousels = setupTimeCarousels(
        'hours-carousel', 'hours-items',
        'minutes-carousel', 'minutes-items',
        'hours-selection-overlay', 'hours-selection-carousel', 'hours-selection-items',
        'minutes-selection-overlay', 'minutes-selection-carousel', 'minutes-selection-items',
        24, 60
    );

    // Agora, para definir a hora inicial, você usaria:
    const now = new Date();
    mainAlarmCarousels.setTime(now.getHours(), now.getMinutes());

    // E para obter os valores no alarm-clock.js, você faria:
    // let horaAlarme = mainAlarmCarousels.getHour();
    // let minutoAlarme = mainAlarmCarousels.getMinute();

    // Os carrosséis de pausa serão inicializados de forma similar no alarm-clock.js.
});
