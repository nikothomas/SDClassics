document.addEventListener('DOMContentLoaded', () => {
    // Function to get query parameter by name
    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    const carVin = getQueryParam('vin'); // Use 'vin' as the query parameter name

    // Fetch car details if carVin is available
    if (carVin) {
        fetch(`/api/cars/${carVin}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(car => {
                displayCarDetails(car);
            })
            .catch(error => {
                console.error('Error fetching car details:', error);
                document.querySelector('.details-container').innerHTML = '<p>Error fetching car details. Please try again later.</p>';
            });
    } else {
        document.querySelector('.details-container').innerHTML = '<p>No car selected. Please go back to the inventory page and select a car to view details.</p>';
    }
});

// Function to display car details on the page
const displayCarDetails = (car) => {
    const carDetailsCard = document.getElementById('car-details-card');
    const carDetailsInfo = document.getElementById('car-details-info');

    if (carDetailsCard && carDetailsInfo) {
        // Use the image URL from the `car` object or a default image if not available
        const imageUrl = car.image_url ? car.image_url : 'path/to/default-image.jpg'; // Replace with actual default image path

        carDetailsCard.innerHTML = `
            <img src="${imageUrl}" alt="${car.make || ''} ${car.model || ''}" class="car-image">
            <h3>${car.make || 'Unknown Make'} ${car.model || 'Unknown Model'}</h3>
            <p>${car.description || 'No description available.'}</p>
        `;

        carDetailsInfo.innerHTML = `
            <h2>${car.make || 'Unknown Make'} ${car.model || 'Unknown Model'}</h2>
            <table>
                <tr><th>VIN</th><td>${car.vin || 'N/A'}</td></tr>
                <tr><th>Price</th><td>${car.price ? `$${car.price.toLocaleString()}` : 'N/A'}</td></tr>
                <tr><th>Year</th><td>${car.year || 'N/A'}</td></tr>
                <tr><th>Miles</th><td>${car.miles ? `${car.miles.toLocaleString()} miles` : 'N/A'}</td></tr>
                <tr><th>Engine</th><td>${car.engine || 'N/A'}</td></tr>
                <tr><th>Transmission</th><td>${car.transmission || 'N/A'}</td></tr>
                <tr><th>Drivetrain</th><td>${car.drivetrain || 'N/A'}</td></tr>
                <tr><th>Suspension</th><td>${car.suspension || 'N/A'}</td></tr>
                <tr><th>Interior</th><td>${car.interior || 'N/A'}</td></tr>
                <tr><th>Color</th><td>${car.color || 'N/A'}</td></tr>
            </table>
            <a href="contact-us.html?service=car-inquiry&vin=${car.vin || ''}"> <!-- Add VIN to Contact Us link -->
                <button class="button inquire-now">Inquire Now</button>
            </a>
        `;
    } else {
        console.error("Car detail elements are not found.");
    }
};
