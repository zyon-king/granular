    const itemHeight = 50; // Height of each item in pixels
    const NUM_REPEATS = 3; // Number of times to repeat the full sequence in selection overlay

    // --- TimeCarousel Class ---
    // This class encapsulates the logic for a single hour OR minute carousel
    class TimeCarousel {
        constructor(carouselId, itemsId, selectionOverlayId, selectionItemsId, minValue, maxValue, initialValue = 0) {
            this.carouselElem = document.getElementById(carouselId);
            this.itemsElem = document.getElementById(itemsId);
            this.selectionOverlayElem = document.getElementById(selectionOverlayId);
            this.selectionItemsElem = document.getElementById(selectionItemsId);
            this.minValue = minValue;
            this.maxValue = maxValue;
            this.totalItems = maxValue - minValue + 1;
            this.currentValue = initialValue;

            // Bind 'this' to methods that will be used as event listeners
            this.handleWheelScroll = this.handleWheelScroll.bind(this);
            this.handleButtonClick = this.handleButtonClick.bind(this);
            this.handleMainCarouselClick = this.handleMainCarouselClick.bind(this);
            this.handleOverlayClick = this.handleOverlayClick.bind(this);
            this.handleSelectionItemClick = this.handleSelectionItemClick.bind(this);
            this.handleSelectionWheelScroll = this.handleSelectionWheelScroll.bind(this);

            this.init();
        }

        init() {
            this.populateMainCarousel();
            this.updateMainCarouselPosition();
            this.setupMainCarouselEvents();
            this.setupSelectionOverlayEvents();
        }

        // Populates the smaller display carousel (e.g., in the main alarm section)
        populateMainCarousel() {
            this.itemsElem.innerHTML = '';
            for (let i = this.minValue; i <= this.maxValue; i++) {
                const value = String(i).padStart(2, '0');
                const item = document.createElement('div');
                item.classList.add('item');
                item.textContent = value;
                this.itemsElem.appendChild(item);
            }
        }

        // Updates the visual position of the smaller display carousel
        updateMainCarouselPosition() {
            const index = this.currentValue - this.minValue;
            this.itemsElem.style.transform = `translateY(-${index * itemHeight}px)`;
        }

        // Handles mouse wheel scrolling on the main carousel
        handleWheelScroll(event) {
            event.preventDefault();
            if (event.deltaY > 0) { // Scroll down
                this.currentValue = (this.currentValue + 1);
            } else { // Scroll up
                this.currentValue = (this.currentValue - 1);
            }
            // Wrap around logic
            if (this.currentValue > this.maxValue) this.currentValue = this.minValue;
            if (this.currentValue < this.minValue) this.currentValue = this.maxValue;

            this.updateMainCarouselPosition();
        }

        // Handles button clicks (up/down arrows) on the main carousel
        handleButtonClick(event) {
            const direction = event.target.dataset.direction;
            if (direction === 'up') {
                this.currentValue = (this.currentValue - 1);
            } else { // 'down'
                this.currentValue = (this.currentValue + 1);
            }
            // Wrap around logic
            if (this.currentValue > this.maxValue) this.currentValue = this.minValue;
            if (this.currentValue < this.minValue) this.currentValue = this.maxValue;

            this.updateMainCarouselPosition();
        }

        // Sets up event listeners for the main carousel (wheel and buttons)
        setupMainCarouselEvents() {
            this.carouselElem.addEventListener('wheel', this.handleWheelScroll);
            const buttons = this.carouselElem.querySelectorAll('.carousel-button');
            buttons.forEach(button => {
                button.addEventListener('click', this.handleButtonClick);
            });
            this.itemsElem.addEventListener('click', this.handleMainCarouselClick);
        }

        // Populates the large selection overlay carousel
        populateSelectionCarouselItems() {
            this.selectionItemsElem.innerHTML = '';
            for (let r = 0; r < NUM_REPEATS; r++) {
                for (let i = this.minValue; i <= this.maxValue; i++) {
                    const value = String(i).padStart(2, '0');
                    const item = document.createElement('div');
                    item.classList.add('item');
                    item.textContent = value;
                    item.dataset.value = i; // Store actual value
                    this.selectionItemsElem.appendChild(item);
                }
            }
        }

        // Updates the visual position of the selection overlay carousel
        updateSelectionCarouselPosition(targetValue, isScrolling = false) {
            const totalItemsInRepetition = this.totalItems;
            const middleBlockStartOffset = Math.floor(NUM_REPEATS / 2) * totalItemsInRepetition;
            const bufferItems = Math.floor(this.selectionCarouselElem.clientHeight / 2 / itemHeight); // Approx items to center

            let targetFullIndex = middleBlockStartOffset + (targetValue - this.minValue);
            let targetTransformY = -(targetFullIndex * itemHeight) + (bufferItems * itemHeight);

            this.selectionItemsElem.style.transform = `translateY(${targetTransformY}px)`;

            // Snap back logic for infinite scroll effect in overlay
            // This is more complex and usually involves checking position after transition
            // For now, let's focus on the initial smooth scroll and basic wheel
        }


        // Handles click on the main carousel, opening the selection overlay
        handleMainCarouselClick() {
            // First, populate the overlay with the correct range of numbers
            this.populateSelectionCarouselItems();

            // Store a reference to WHICH carousel (this instance) opened the overlay
            // So the overlay's item clicks know which current value to update
            this.selectionOverlayElem.currentActiveCarousel = this;

            // Set the selection carousel's initial scroll position
            // This needs a small delay or rAF to ensure the DOM is ready after populate
            requestAnimationFrame(() => {
                 // The selection-carousel element itself, within the overlay
                this.selectionCarouselElem = this.selectionOverlayElem.querySelector('.selection-carousel');
                // Ensure the transition is active for smooth initial jump
                this.selectionItemsElem.style.transition = `transform 0.2s ease-out`;
                this.updateSelectionCarouselPosition(this.currentValue, false);
            });

            this.selectionOverlayElem.classList.add('active'); // Show the overlay
        }

        // Handles click on an item in the selection overlay
        handleSelectionItemClick(event) {
            // Ensure this is an item click, not the background
            if (event.target.classList.contains('item')) {
                const selectedValue = parseInt(event.target.dataset.value);
                // Get the carousel instance that opened this overlay
                const activeCarousel = this.selectionOverlayElem.currentActiveCarousel;
                if (activeCarousel) {
                    activeCarousel.setValue(selectedValue); // Update its value
                    activeCarousel.updateMainCarouselPosition(); // Update its main display
                }
                this.selectionOverlayElem.classList.remove('active'); // Close overlay
            }
        }

        // Handles clicks on the selection overlay background to close it
        handleOverlayClick(event) {
            if (event.target === this.selectionOverlayElem) {
                this.selectionOverlayElem.classList.remove('active');
            }
        }

        // Handles wheel scrolling on the selection overlay
        handleSelectionWheelScroll(event) {
            event.preventDefault();
            const activeCarousel = this.selectionOverlayElem.currentActiveCarousel;
            if (activeCarousel) {
                let newLogicalValue = activeCarousel.getValue();
                if (event.deltaY > 0) { // Scroll down
                    newLogicalValue = (newLogicalValue + 1);
                } else { // Scroll up
                    newLogicalValue = (newLogicalValue - 1);
                }
                // Wrap around logic
                if (newLogicalValue > activeCarousel.maxValue) newLogicalValue = activeCarousel.minValue;
                if (newLogicalValue < activeCarousel.minValue) newLogicalValue = activeCarousel.maxValue;

                activeCarousel.setValue(newLogicalValue); // Update value
                activeCarousel.updateMainCarouselPosition(); // Update main display

                // Update overlay position (snap back for infinite scroll)
                this.selectionItemsElem.style.transition = `transform 0.2s ease-out`; // Ensure transition
                this.updateSelectionCarouselPosition(newLogicalValue, true);
            }
        }

        // Sets up event listeners for the selection overlay
        setupSelectionOverlayEvents() {
            // Add click listener to the overlay background
            this.selectionOverlayElem.addEventListener('click', this.handleOverlayClick);
            // Add click listener to items within the selection items container
            this.selectionItemsElem.addEventListener('click', this.handleSelectionItemClick);
            // Add wheel listener to the selection carousel itself
            this.selectionOverlayElem.querySelector('.selection-carousel').addEventListener('wheel', this.handleSelectionWheelScroll);
        }


        // Public methods to get/set value
        getValue() {
            return this.currentValue;
        }

        setValue(newValue) {
            if (newValue >= this.minValue && newValue <= this.maxValue) {
                this.currentValue = newValue;
                this.updateMainCarouselPosition(); // Keep main display updated
            }
        }
    }

    // --- Initialize all carousels ---
    let mainHoursCarousel, mainMinutesCarousel;
    let pauseDurationHoursCarousel, pauseDurationMinutesCarousel;
    let pauseEndHoursCarousel, pauseEndMinutesCarousel;

    document.addEventListener('DOMContentLoaded', () => {
        const now = new Date();

        // Main Alarm Carousels
        mainHoursCarousel = new TimeCarousel(
            'hours-carousel', 'hours-items',
            'hours-selection-overlay', 'hours-selection-items',
            0, 23, now.getHours()
        );
        mainMinutesCarousel = new TimeCarousel(
            'minutes-carousel', 'minutes-items',
            'minutes-selection-overlay', 'minutes-selection-items',
            0, 59, now.getMinutes()
        );

        // Pause Duration Carousels (start at 0 hours, 0 minutes by default)
        pauseDurationHoursCarousel = new TimeCarousel(
            'pause-duration-hours-carousel', 'pause-duration-hours-items',
            'hours-selection-overlay', 'hours-selection-items',
            0, 23, 0 // Initial value for hours in duration
        );
        pauseDurationMinutesCarousel = new TimeCarousel(
            'pause-duration-minutes-carousel', 'pause-duration-minutes-items',
            'minutes-selection-overlay', 'minutes-selection-items',
            0, 59, 0 // Initial value for minutes in duration
        );

        // Pause End Time Carousels (start at current time + 1 hour, current minute)
        pauseEndHoursCarousel = new TimeCarousel(
            'pause-end-hours-carousel', 'pause-end-hours-items',
            'hours-selection-overlay', 'hours-selection-items',
            0, 23, (now.getHours() + 1) % 24
        );
        pauseEndMinutesCarousel = new TimeCarousel(
            'pause-end-minutes-carousel', 'pause-end-minutes-items',
            'minutes-selection-overlay', 'minutes-selection-items',
            0, 59, now.getMinutes()
        );

        // --- Expose global functions for the main alarm clock script ---
        // (These are needed if the alarm clock logic is in a separate script
        // that expects these global functions, like your v1.1_alarm-clock.js)
        window.getSelectedHour = () => mainHoursCarousel.getValue();
        window.getSelectedMinute = () => mainMinutesCarousel.getValue();
        window.setInitialTime = (h, m) => {
            mainHoursCarousel.setValue(h);
            mainMinutesCarousel.setValue(m);
        };

        // You would also expose functions to get values from pause carousels if needed by alarm-clock.js
        window.getPauseDurationHour = () => pauseDurationHoursCarousel.getValue();
        window.getPauseDurationMinute = () => pauseDurationMinutesCarousel.getValue();
        window.getPauseEndHour = () => pauseEndHoursCarousel.getValue();
        window.getPauseEndMinute = () => pauseEndMinutesCarousel.getValue();

    });
