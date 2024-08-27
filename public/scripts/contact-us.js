// Function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set the service dropdown value based on the URL parameter
window.onload = function() {
    const serviceParam = getQueryParam('service');
    if (serviceParam) {
        const serviceDropdown = document.getElementById('service');
        if (serviceDropdown) {
            serviceDropdown.value = serviceParam;
        }
    }
};

// Function to handle form submission
function submitContactForm(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value.trim();
    const message = document.getElementById('message').value.trim();

    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, service, message }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error saving contact information:', data.error);
                alert('There was an error submitting the form. Please try again later.');
            } else {
                alert('Thank you for your message! We will get back to you soon.');
                document.getElementById('contact-form').reset(); // Reset form fields
            }
        })
        .catch(error => {
            console.error('Error submitting contact form:', error);
            alert('There was an error submitting the form. Please try again later.');
        });
}

