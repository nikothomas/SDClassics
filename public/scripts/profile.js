document.addEventListener('DOMContentLoaded', function () {
    // Fetch user profile information from Auth0
    fetch('/auth/status')
        .then(response => response.json())
        .then(data => {
            if (data.isAuthenticated) {
                fetch('/user') // Assuming you have an endpoint that returns the user profile
                    .then(response => response.json())
                    .then(user => {
                        // Update UI with user information
                        document.getElementById('profile-name').textContent = user.name;
                        document.getElementById('profile-email').textContent = user.email;

                        // Update profile picture if available
                        if (user.picture) {
                            const profilePicture = document.getElementById('profile-picture');
                            profilePicture.src = user.picture;
                            profilePicture.style.display = 'block';
                        }

                        // Check if the user is an admin using the updated admin endpoint
                        fetch('/auth/check-admin')
                            .then(response => response.json())
                            .then(adminData => {
                                console.log('Admin Check Response:', adminData); // Log the response for debugging
                                if (adminData.isAdmin) {
                                    document.getElementById('admin-button').style.display = 'inline-block'; // Show the admin button
                                    document.getElementById('contacts-card').style.display = 'block'; // Show contacts card if admin
                                    fetchContacts(); // Fetch and display contacts only if the user is an admin
                                }
                            })
                            .catch(error => console.error('Error checking admin status:', error));
                    });
            } else {
                window.location.href = '/login'; // Redirect to login if not authenticated
            }
        })
        .catch(error => console.error('Error fetching user profile:', error));
});

// Function to fetch contacts from Supabase
function fetchContacts() {
    fetch('/api/contact') // Assumes you have the endpoint set up to fetch all contacts
        .then(response => response.json())
        .then(contacts => {
            displayContacts(contacts);
        })
        .catch(error => {
            console.error('Error fetching contacts:', error);
            document.getElementById('contacts-list').innerHTML = '<p>Error loading contacts. Please try again later.</p>';
        });
}

// Function to display contacts in the contacts card in a tabular format
function displayContacts(contacts) {
    const contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = ''; // Clear any existing content

    if (contacts.length === 0) {
        contactsList.innerHTML = '<p>No contacts found.</p>';
        return;
    }

    // Create a table to display contacts
    const table = document.createElement('table');
    table.classList.add('contacts-table'); // Add a class for styling

    // Create the header row for the table
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Date & Time</th>
        <th>Name</th>
        <th>Email</th>
        <th>Service</th>
        <th>Message</th>
    `;
    table.appendChild(headerRow);

    // Populate the table with contact data
    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(contact.submitted_at).toLocaleString()}</td>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.service}</td>
            <td>${contact.message}</td>
        `;
        table.appendChild(row);
    });

    contactsList.appendChild(table);
}

// Logout function
function logout() {
    window.location.href = '/logout'; // Replace with your Auth0 logout URL if needed
}

// Redirect to manage-inventory page
function goToManageInventory() {
    window.location.href = '/manage-inventory';
}
