document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-car-form');
    const feedbackMessage = document.getElementById('feedback-message');

    // Handle form submission for adding a car
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/cars', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                feedbackMessage.style.display = 'block';
                feedbackMessage.textContent = 'Car added successfully!';
                feedbackMessage.classList.remove('error');
                setTimeout(() => feedbackMessage.style.display = 'none', 3000);
                form.reset();
                loadInventory(); // Reload inventory to show the new car
                hideAddCarOverlay();
            } else {
                const errorData = await response.json();
                feedbackMessage.style.display = 'block';
                feedbackMessage.textContent = errorData.error || 'Failed to add car.';
                feedbackMessage.classList.add('error');
                setTimeout(() => feedbackMessage.style.display = 'none', 3000);
            }
        } catch (error) {
            console.error('Error adding car:', error);
            feedbackMessage.style.display = 'block';
            feedbackMessage.textContent = 'Error adding car. Please try again.';
            feedbackMessage.classList.add('error');
            setTimeout(() => feedbackMessage.style.display = 'none', 3000);
        }
    });

    // Function to load the current inventory
    const loadInventory = async () => {
        const inventoryContainer = document.getElementById('current-inventory');
        inventoryContainer.innerHTML = '';

        // Add the "Add New Car" card as the first card in the container
        const addCard = document.createElement('div');
        addCard.className = 'add-card';
        addCard.onclick = showAddCarOverlay;
        addCard.innerHTML = `
            <div class="card-content">
                <i class="fas fa-plus-circle fa-3x"></i>
                <p>Add New Car</p>
            </div>
        `;
        inventoryContainer.appendChild(addCard);

        try {
            const response = await fetch('/api/cars');
            const cars = await response.json();
            cars.forEach(car => {
                const carItem = document.createElement('div');
                carItem.className = 'card';
                const imageUrl = car.image_url ? car.image_url : 'path/to/default-image.jpg';
                carItem.innerHTML = `
                    <img src="${imageUrl}" alt="${car.make} ${car.model}" class="car-image">
                    <div class="card-content">
                        <h3>${car.make} ${car.model}</h3>
                        <p>Year: ${car.year}</p>
                        <p>Miles: ${car.miles.toLocaleString()}</p>
                        <p>Price: $${car.price.toLocaleString()}</p>
                    </div>
                    <div class="card-buttons">
                        <button class="button edit-button" onclick="openEditModal(${car.id})">Edit</button>
                        <button class="button delete-button" onclick="deleteCar(${car.id})">Delete</button>
                    </div>
                `;
                inventoryContainer.appendChild(carItem);
            });
        } catch (error) {
            console.error('Error loading inventory:', error);
            inventoryContainer.innerHTML = '<p>Error loading inventory.</p>';
        }
    };

    // Function to delete a car
    window.deleteCar = async (carId) => {
        try {
            const response = await fetch(`/api/cars/${carId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Car deleted successfully.');
                loadInventory(); // Reload inventory after deletion
            } else {
                alert('Failed to delete the car.');
            }
        } catch (error) {
            console.error('Error deleting car:', error);
        }
    };

    // Function to open the edit modal with car details
    window.openEditModal = (carId) => {
        fetch(`/api/cars/${carId}`)
            .then(response => response.json())
            .then(car => {
                document.getElementById('edit-make').value = car.make;
                document.getElementById('edit-model').value = car.model;
                document.getElementById('vin').value = car.vin;
                document.getElementById('edit-description').value = car.description;
                document.getElementById('edit-miles').value = car.miles;
                document.getElementById('edit-price').value = car.price;
                document.getElementById('edit-engine').value = car.engine;
                document.getElementById('edit-transmission').value = car.transmission;
                document.getElementById('edit-drivetrain').value = car.transmission;
                document.getElementById('edit-suspension').value = car.transmission;
                document.getElementById('edit-interior').value = car.transmission;
                document.getElementById('edit-year').value = car.year;
                document.getElementById('edit-color').value = car.color;
                document.getElementById('edit-car-id').value = car.id;
                showEditCarOverlay();
            })
            .catch(error => console.error('Error fetching car details:', error));
    };

    // Show and hide overlay functions
    window.showAddCarOverlay = () => {
        document.getElementById('add-car-overlay').classList.add('active');
    };

    window.hideAddCarOverlay = () => {
        document.getElementById('add-car-overlay').classList.remove('active');
    };

    window.showEditCarOverlay = () => {
        document.getElementById('edit-car-overlay').classList.add('active');
    };

    window.hideEditCarOverlay = () => {
        document.getElementById('edit-car-overlay').classList.remove('active');
    };

    // Load the inventory on page load
    loadInventory();
});
