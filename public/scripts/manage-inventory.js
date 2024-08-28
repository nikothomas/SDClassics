document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-car-form');
    const editForm = document.getElementById('edit-car-form');
    const feedbackMessage = document.getElementById('feedback-message');

    // General function to handle form submissions
    const handleFormSubmission = async (event, url, method, successMessage, hideOverlayCallback) => {
        event.preventDefault();

        // Convert form data to JSON format
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            displayFeedback(response.ok, successMessage, responseData.error);

            if (response.ok) {
                hideOverlayCallback();
                loadInventory();
            }
        } catch (error) {
            console.error(`Error ${method === 'POST' ? 'adding' : 'updating'} car:`, error);
            displayFeedback(false, null, 'An error occurred. Please try again.');
        }
    };

    // Display feedback message
    const displayFeedback = (success, successMessage, errorMessage) => {
        feedbackMessage.style.display = 'block';
        feedbackMessage.textContent = success ? successMessage : errorMessage;
        feedbackMessage.classList.toggle('error', !success);
        setTimeout(() => feedbackMessage.style.display = 'none', 3000);
    };

    // Handle form submission for adding a car
    form.addEventListener('submit', (event) => handleFormSubmission(
        event,
        '/api/cars',
        'POST',
        'Car added successfully!',
        hideAddCarOverlay
    ));

    // Handle form submission for editing a car
    editForm.addEventListener('submit', (event) => {
        const carVin = document.getElementById('edit-car-id').value;
        handleFormSubmission(
            event,
            `/api/cars/${carVin}`,
            'PUT',
            'Car details updated successfully!',
            hideEditCarOverlay
        );
    });

    // Function to load the current inventory
    const loadInventory = async () => {
        const inventoryContainer = document.getElementById('current-inventory');
        inventoryContainer.innerHTML = '';
        createAddCarCard(inventoryContainer);

        try {
            const response = await fetch('/api/cars');
            const cars = await response.json();
            cars.forEach(car => createCarCard(car, inventoryContainer));
        } catch (error) {
            console.error('Error loading inventory:', error);
            inventoryContainer.innerHTML = '<p>Error loading inventory.</p>';
        }
    };

    // Function to create 'Add New Car' card
    const createAddCarCard = (container) => {
        const addCard = document.createElement('div');
        addCard.className = 'add-card';
        addCard.onclick = showAddCarOverlay;
        addCard.innerHTML = `
            <div class="add-card-content">
                <i class="fas fa-plus-circle fa-3x"></i>
                <p>Add New Car</p>
            </div>
        `;
        container.appendChild(addCard);
    };

    // Function to create a car card
    const createCarCard = (car, container) => {
        const carItem = document.createElement('div');
        carItem.className = 'card';
        const imageUrl = car.image_url || 'path/to/default-image.jpg';
        carItem.innerHTML = `
            <img src="${imageUrl}" alt="${car.make} ${car.model}" class="car-image">
            <div class="card-content">
                <h3>${car.make} ${car.model}</h3>
                <p>VIN: ${car.vin}</p>
                <p>Year: ${car.year}</p>
                <p>Miles: ${car.miles.toLocaleString()}</p>
                <p>Price: $${car.price.toLocaleString()}</p>
            </div>
            <div class="card-buttons">
                <button class="button edit-button" onclick="openEditModal('${car.vin}')">Edit</button>
                <button class="button delete-button" onclick="deleteCar('${car.vin}')">Delete</button>
            </div>
        `;
        container.appendChild(carItem);
    };

    // Function to delete a car
    window.deleteCar = async (carVin) => {
        try {
            const response = await fetch(`/api/cars/${carVin}`, { method: 'DELETE' });
            alert(response.ok ? 'Car deleted successfully.' : 'Failed to delete the car.');
            if (response.ok) loadInventory();
        } catch (error) {
            console.error('Error deleting car:', error);
        }
    };

    // Function to open the edit modal with car details
    window.openEditModal = async (carVin) => {
        try {
            const response = await fetch(`/api/cars/${carVin}`);
            const car = await response.json();
            populateEditForm(car);
            showEditCarOverlay();
        } catch (error) {
            console.error('Error fetching car details:', error);
        }
    };

    // Populate the edit form with car details
    const populateEditForm = (car) => {
        document.getElementById('edit-make').value = car.make;
        document.getElementById('edit-model').value = car.model;
        document.getElementById('edit-car-id').value = car.vin; // This is now a hidden input field
        document.getElementById('edit-description').value = car.description;
        document.getElementById('edit-miles').value = car.miles;
        document.getElementById('edit-price').value = car.price;
        document.getElementById('edit-engine').value = car.engine;
        document.getElementById('edit-transmission').value = car.transmission;
        document.getElementById('edit-drivetrain').value = car.drivetrain;
        document.getElementById('edit-suspension').value = car.suspension;
        document.getElementById('edit-interior').value = car.interior;
        document.getElementById('edit-year').value = car.year;
        document.getElementById('edit-color').value = car.color;
    };

    // Show and hide overlay functions
    window.showAddCarOverlay = () => document.getElementById('add-car-overlay').classList.add('active');
    window.hideAddCarOverlay = () => document.getElementById('add-car-overlay').classList.remove('active');
    window.showEditCarOverlay = () => document.getElementById('edit-car-overlay').classList.add('active');
    window.hideEditCarOverlay = () => document.getElementById('edit-car-overlay').classList.remove('active');

    loadInventory();
});
