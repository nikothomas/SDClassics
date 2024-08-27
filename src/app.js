const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const { auth, requiresAuth, claimEquals } = require('express-openid-connect');
const dotenv = require('dotenv');
const path = require('path');
const { check, validationResult } = require('express-validator');

dotenv.config();

const app = express();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Auth0 configuration
const config = {
    authRequired: false, // Global setting; we'll enforce this on specific routes as needed
    auth0Logout: true,
    secret: process.env.SESSION_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

// Auth0 middleware
app.use(auth(config));

// Middleware to set authentication status and user details
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
});

// Middleware to protect routes
const requireAuth = requiresAuth();

// Hardcoded admin check using environment variable
app.get('/auth/check-admin', requiresAuth(), (req, res) => {
    const adminUserId = process.env.ADMIN_USER_ID;
    if (req.oidc.user && req.oidc.user.sub === adminUserId) {
        res.json({ isAdmin: true });
    } else {
        res.json({ isAdmin: false });
    }
});

// Route to serve the manage-inventory page
app.get('/manage-inventory', requiresAuth(), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/manage-inventory.html'));
});

// Route to serve the manage-inventory page
app.get('/manage-inventory', requiresAuth(), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/manage-inventory.html'));
});

// Endpoint to get all cars
app.get('/api/cars', async (req, res) => {
    try {
        let { data: cars, error } = await supabase.from('active_inventory').select('*');
        if (error) throw error;
        res.json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cars' });
    }
});

// Endpoint to get a car by VIN
app.get('/api/cars/:vin', async (req, res) => {
    const carVin = req.params.vin; // VIN is a string, so no need to parse
    console.log('Fetching car with VIN:', carVin); // Debugging log

    try {
        let { data: car, error } = await supabase
            .from('active_inventory')
            .select('*')
            .eq('vin', carVin)
            .single();

        if (error) {
            console.error('Supabase error:', error); // Log specific error details
            throw error;
        }

        if (!car) {
            console.error('No car found with VIN:', carVin);
            return res.status(404).json({ error: 'Car not found' });
        }

        res.json(car);
    } catch (err) {
        console.error('Caught error:', err); // More detailed error logging
        res.status(500).json({ error: 'Failed to fetch car' });
    }
});



app.post('/api/cars', requiresAuth(), upload.single('image'), async (req, res) => {
    const {
        make,
        model,
        vin,
        description,
        miles,
        price,
        engine,
        transmission,
        drivetrain,
        suspension,
        interior,
        year,
        color
    } = req.body;

    let imageUrl = null;

    try {
        // Insert car data into the database first, without the image URL
        let { data, error } = await supabase
            .from('active_inventory')
            .insert([
                {
                    make,
                    model,
                    vin,
                    description,
                    miles,
                    price,
                    engine,
                    transmission,
                    drivetrain,
                    suspension,
                    interior,
                    year,
                    color,
                    image_url: null, // Initially set to null
                },
            ])
            .select();

        // Check for errors in database insertion
        if (error) {
            console.error('Error inserting data:', error);
            throw error;
        }

        // If data insertion is successful and there is an image file, upload the image
        if (data && req.file) {
            // Upload image to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('car-images')
                .upload(`public/${req.file.originalname}`, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: req.file.mimetype,
                });

            if (uploadError) throw uploadError;

            // Get the public URL for the uploaded image
            const { data: publicUrlData } = supabase
                .storage
                .from('car-images')
                .getPublicUrl(`public/${req.file.originalname}`);

            imageUrl = publicUrlData.publicUrl;

            // Update the car record with the image URL after successful image upload
            const { error: updateError } = await supabase
                .from('active_inventory')
                .update({ image_url: imageUrl })
                .eq('vin', vin);

            if (updateError) {
                console.error('Error updating image URL:', updateError);
                throw updateError;
            }
        }

        res.status(201).json(data[0]); // Return the inserted car data
    } catch (err) {
        console.error('Caught error:', err);
        res.status(500).json({ error: 'Failed to add car' });
    }
});


// Endpoint to update a car by VIN
app.put('/api/cars/:vin', requiresAuth(), async (req, res) => {
    const carVin = req.params.vin; // VIN is a string, so no need to parse
    const {
        make,
        model,
        description,
        miles,
        price,
        engine,
        transmission,
        drivetrain,
        suspension,
        interior,
        year,
        color
    } = req.body;

    try {
        const { error } = await supabase
            .from('active_inventory')
            .update({
                make,
                model,
                description,
                miles,
                price,
                engine,
                transmission,
                drivetrain,
                suspension,
                interior,
                year,
                color
            })
            .eq('vin', carVin);

        if (error) throw error;

        res.status(200).json({ message: 'Car updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update car' });
    }
});

// Endpoint to delete a car by VIN
app.delete('/api/cars/:vin', requiresAuth(), async (req, res) => {
    const carVin = req.params.vin; // VIN is a string, so no need to parse
    try {
        // First, fetch the car record to get the image URL
        const { data: car, error: fetchError } = await supabase
            .from('active_inventory')
            .select('image_url')
            .eq('vin', carVin)
            .single();

        if (fetchError) throw fetchError;

        // If an image URL exists, delete the image from Supabase storage
        if (car && car.image_url) {
            const filePath = car.image_url.split('/').pop(); // Extract the file path
            const { error: deleteError } = await supabase
                .storage
                .from('car-images')
                .remove([`public/${filePath}`]);

            if (deleteError) {
                console.error('Error deleting image:', deleteError);
                // Continue to delete car even if the image deletion fails
            }
        }

        // Proceed to delete the car entry from the database
        const { error: deleteCarError } = await supabase
            .from('active_inventory')
            .delete()
            .eq('vin', carVin);

        if (deleteCarError) throw deleteCarError;

        res.status(200).json({ message: 'Car deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete car' });
    }
});

// Endpoint to get all contact form submissions
app.get('/api/contact', requiresAuth(), async (req, res) => {
    try {
        const { data: contacts, error } = await supabase
            .from('contact_info')
            .select('*');

        if (error) {
            console.error('Supabase error fetching contacts:', error);
            throw error;
        }

        res.json(contacts);
    } catch (err) {
        console.error('Caught error fetching contacts:', err);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Endpoint to get a single contact form submission by ID
app.get('/api/contact/:id', requiresAuth(), async (req, res) => {
    const contactId = req.params.id; // ID is expected to be an integer
    try {
        const { data: contact, error } = await supabase
            .from('contact_info')
            .select('*')
            .eq('id', contactId)
            .single();

        if (error) {
            console.error('Supabase error fetching contact:', error);
            throw error;
        }

        if (!contact) {
            console.error('No contact found with ID:', contactId);
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(contact);
    } catch (err) {
        console.error('Caught error fetching contact:', err);
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
});

app.post('/api/contact', [
    check('name').trim().escape(),
    check('email').isEmail().normalizeEmail(),
    check('service').trim().escape(),
    check('message').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Insert contact data into the database
        const { data, error } = await supabase
            .from('contact_info')
            .insert([
                {
                    name,
                    email,
                    service,
                    message,
                },
            ])
            .select();

        if (error) {
            console.error('Error inserting contact info:', error);
            return res.status(500).json({ error: 'Failed to save contact information.' });
        }

        res.status(201).json({ message: 'Contact information saved successfully.' });
    } catch (err) {
        console.error('Caught error:', err);
        res.status(500).json({ error: 'Failed to save contact information.' });
    }
});


// Define other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profile.html'));
});

app.get('/user', requireAuth, (req, res) => {
    res.json(req.oidc.user);
});

app.get('/auth/status', (req, res) => {
    res.json({ isAuthenticated: req.oidc.isAuthenticated() });
});

// Admin-only route using claimEquals
app.get('/admin', claimEquals('isAdmin', true), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Load SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
};

// Start the HTTP server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
