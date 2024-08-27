document.addEventListener('DOMContentLoaded', () => {
    const inventorySection = document.getElementById('inventory');

    // Fetch the car data from the API
    fetch('/api/cars')
        .then(response => response.json())
        .then(cars => {
            // Loop through each car and create a card for it
            cars.forEach(car => {
                // Create a new div element for the car card
                const carCard = document.createElement('div');
                carCard.className = 'card';  // Assign the 'card' class to the div

                // Use the image_url directly from the car object, or a default image if not available
                const imageUrl = car.image_url ? car.image_url : 'path/to/default-image.jpg';

                // Set the inner HTML of the car card with all the car details
                carCard.innerHTML = `
                    <img src="${imageUrl}" alt="${car.make} ${car.model}" class="car-image">
                    <div class="card-content">
                        <h3>${car.make} ${car.model}</h3>
                        <p>Year: ${car.year}</p>
                        <p>Miles: ${car.miles.toLocaleString()}</p>
                        <p>Color: ${car.color}</p>
                        <p>Price: $${car.price.toLocaleString()}</p>
                    </div>
                `;

                // Make the entire card clickable by adding an event listener
                carCard.addEventListener('click', () => {
                    window.location.href = `car-details.html?vin=${car.vin}`;
                });

                // Append the car card to the inventory section
                inventorySection.appendChild(carCard);
            });
        })
        .catch(error => {
            console.error('Error fetching car inventory:', error);
            inventorySection.innerHTML = '<p>Error loading inventory.</p>';
        });
});
