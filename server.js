const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Create MySQL connection pool (fill in your own MySQL credentials)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // change if your MySQL user is different
  password: 'Rakwa5678@',          // put your MySQL password here
  database: 'travel' // database you will create below
});

// Parse form data (from login form) and JSON (for APIs)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS, images) from current folder
app.use(express.static(__dirname));

// Example API route you can call from script.js
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend is working!', time: new Date().toISOString() });
});

// Check database connection and show which database is connected
app.get('/api/check-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() as current_db');
    const currentDb = rows[0].current_db;
    
    const config = pool.config || {
      host: 'localhost',
      user: 'root',
      database: 'travel'
    };
    
    res.json({
      connected: true,
      database: currentDb,
      config: {
        host: config.host,
        user: config.user,
        database: config.database
      },
      message: `Connected to database: ${currentDb}`
    });
  } catch (err) {
    console.error('Database check error:', err);
    res.status(500).json({
      connected: false,
      error: err.message,
      config: {
        host: 'localhost',
        user: 'root',
        database: 'travel'
      }
    });
  }
});

// Register new user (you can hook this up to a real "Create Account" form later)
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send('Missing username, email, or password');
    }

    // Check if user already exists
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );

    if (rows.length > 0) {
      return res.status(409).send('User with that username or email already exists');
    }

    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password] // storing plain text (user requested)
    );

    return res.send('Registration successful. You can now log in.');
  } catch (err) {
    console.error('Error in /register:', err);
    return res.status(500).send('Server error during registration');
  }
});

// Login using MySQL users table
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send('Missing username or password');
    }

    // Allow login with either username OR email typed into the "username" field
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .send('<h1>Login failed</h1><p>Invalid username or password.</p>');
    }

    const user = rows[0];
    if (password !== user.password_hash) {
      return res
        .status(401)
        .send('<h1>Login failed</h1><p>Invalid username or password.</p>');
    }


    console.log('Login successful for user:', user.username || user.email);

    // Store user session (simple approach - in production use proper sessions/cookies)
    // For now, we'll redirect with user ID in query param, frontend will store in localStorage
    return res.redirect(`/?userId=${user.id}&login=success`);
  } catch (err) {
    console.error('Error in /login:', err);
    return res.status(500).send('Server error during login');
  }
});

// ==================== FLIGHT ROUTES ====================

// Search flights (stores search query + returns results)
app.post('/api/flights/search', async (req, res) => {
  try {
    const { origin, destination, departure, return: returnDate, tripType, class: travelClass, adults, children, infants, userId } = req.body;

    if (!origin || !destination || !departure) {
      return res.status(400).json({ error: 'Missing required fields: origin, destination, departure' });
    }

    // Store search query for analytics
    await pool.query(
      'INSERT INTO flight_searches (origin, destination, departure_date, return_date, trip_type, travel_class, adults, children, infants, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [origin, destination, departure, returnDate || null, tripType || 'round-trip', travelClass || 'economy', adults || 1, children || 0, infants || 0, userId || null]
    );

    // Get available flights matching search criteria
    const [flights] = await pool.query(
      `SELECT * FROM available_flights 
       WHERE origin LIKE ? AND destination LIKE ? AND travel_class = ?
       ORDER BY price ASC
       LIMIT 20`,
      [`%${origin}%`, `%${destination}%`, travelClass || 'economy']
    );

    // If no flights in DB, return sample data
    if (flights.length === 0) {
      const sampleFlights = [
        { id: 1, airline: 'Emirates', departure_time: '08:00', arrival_time: '14:30', duration: '6h 30m', price: 450, travel_class: 'economy' },
        { id: 2, airline: 'Qatar Airways', departure_time: '10:15', arrival_time: '17:00', duration: '6h 45m', price: 520, travel_class: 'economy' },
        { id: 3, airline: 'Lufthansa', departure_time: '14:00', arrival_time: '20:15', duration: '6h 15m', price: 480, travel_class: 'economy' },
        { id: 4, airline: 'British Airways', departure_time: '16:30', arrival_time: '23:00', duration: '6h 30m', price: 510, travel_class: 'economy' },
        { id: 5, airline: 'Emirates', departure_time: '09:00', arrival_time: '15:00', duration: '6h 00m', price: 1200, travel_class: 'business' },
        { id: 6, airline: 'Qatar Airways', departure_time: '11:30', arrival_time: '18:00', duration: '6h 30m', price: 1350, travel_class: 'business' }
      ].filter(f => f.travel_class === (travelClass || 'economy'));
      
      return res.json({ flights: sampleFlights, fromDatabase: false });
    }

    res.json({ flights, fromDatabase: true });
  } catch (err) {
    console.error('Error in /api/flights/search:', err);
    res.status(500).json({ error: 'Server error during flight search' });
  }
});

// Book a flight
app.post('/api/flights/book', async (req, res) => {
  try {
    const { userId, origin, destination, departureDate, returnDate, tripType, travelClass, airline, departureTime, arrivalTime, duration, price, adults, children, infants } = req.body;

    if (!userId || !origin || !destination || !departureDate || !price) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const totalPassengers = (parseInt(adults) || 1) + (parseInt(children) || 0) + (parseInt(infants) || 0);
    const totalPrice = parseFloat(price) * totalPassengers;

    const [result] = await pool.query(
      `INSERT INTO flight_bookings 
       (user_id, origin, destination, departure_date, return_date, trip_type, travel_class, airline, departure_time, arrival_time, duration, price, adults, children, infants, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, origin, destination, departureDate, returnDate || null, tripType || 'one-way', travelClass || 'economy', airline, departureTime, arrivalTime, duration, price, adults || 1, children || 0, infants || 0, totalPrice]
    );

    res.json({ 
      success: true, 
      bookingId: result.insertId,
      message: 'Flight booked successfully!' 
    });
  } catch (err) {
    console.error('Error in /api/flights/book:', err);
    res.status(500).json({ error: 'Server error during flight booking' });
  }
});

// ==================== HOTEL ROUTES ====================

// Search hotels (stores search query + returns results)
app.post('/api/hotels/search', async (req, res) => {
  try {
    const { city, checkin, checkout, guests, rooms, userId } = req.body;

    if (!city || !checkin || !checkout) {
      return res.status(400).json({ error: 'Missing required fields: city, checkin, checkout' });
    }

    // Store search query for analytics
    await pool.query(
      'INSERT INTO hotel_searches (city, checkin_date, checkout_date, guests, rooms, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [city, checkin, checkout, guests || 2, rooms || 1, userId || null]
    );

    // Get available hotels matching search criteria
    const [hotels] = await pool.query(
      `SELECT * FROM available_hotels 
       WHERE city LIKE ? AND available_rooms >= ?
       ORDER BY price_per_night ASC
       LIMIT 20`,
      [`%${city}%`, rooms || 1]
    );

    // If no hotels in DB, return sample data
    if (hotels.length === 0) {
      const sampleHotels = [
        { id: 1, name: 'Grand Palace Hotel', stars: 5, price_per_night: 350, location: 'City Center', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
        { id: 2, name: 'Seaside Resort & Spa', stars: 5, price_per_night: 420, location: 'Beachfront', image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
        { id: 3, name: 'Urban Comfort Inn', stars: 4, price_per_night: 180, location: 'Downtown', image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400' },
        { id: 4, name: 'The Heritage Hotel', stars: 4, price_per_night: 220, location: 'Historic District', image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
        { id: 5, name: 'Budget Stay Express', stars: 3, price_per_night: 89, location: 'Near Airport', image_url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400' },
        { id: 6, name: 'Luxury Suites Tower', stars: 5, price_per_night: 550, location: 'Financial District', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' }
      ];
      
      return res.json({ hotels: sampleHotels, fromDatabase: false });
    }

    res.json({ hotels, fromDatabase: true });
  } catch (err) {
    console.error('Error in /api/hotels/search:', err);
    res.status(500).json({ error: 'Server error during hotel search' });
  }
});

// Book a hotel
app.post('/api/hotels/book', async (req, res) => {
  try {
    const { userId, hotelName, city, location, checkinDate, checkoutDate, guests, rooms, pricePerNight, stars } = req.body;

    if (!userId || !hotelName || !city || !checkinDate || !checkoutDate || !pricePerNight) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Calculate total nights and price
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const totalNights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(pricePerNight) * totalNights * (parseInt(rooms) || 1);

    const [result] = await pool.query(
      `INSERT INTO hotel_bookings 
       (user_id, hotel_name, city, location, checkin_date, checkout_date, guests, rooms, price_per_night, total_nights, total_price, stars)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, hotelName, city, location || '', checkinDate, checkoutDate, guests || 2, rooms || 1, pricePerNight, totalNights, totalPrice, stars || 3]
    );

    res.json({ 
      success: true, 
      bookingId: result.insertId,
      message: 'Hotel booked successfully!' 
    });
  } catch (err) {
    console.error('Error in /api/hotels/book:', err);
    res.status(500).json({ error: 'Server error during hotel booking' });
  }
});

// ==================== USER BOOKINGS ====================

// Get user's flight bookings
app.get('/api/bookings/flights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [bookings] = await pool.query(
      'SELECT * FROM flight_bookings WHERE user_id = ? ORDER BY booked_at DESC',
      [userId]
    );
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching flight bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's hotel bookings
app.get('/api/bookings/hotels/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [bookings] = await pool.query(
      'SELECT * FROM hotel_bookings WHERE user_id = ? ORDER BY booked_at DESC',
      [userId]
    );
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching hotel bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ANALYTICS ====================

// Get search analytics (for admin/dashboard)
app.get('/api/analytics/searches', async (req, res) => {
  try {
    const [flightSearches] = await pool.query('SELECT COUNT(*) as count FROM flight_searches');
    const [hotelSearches] = await pool.query('SELECT COUNT(*) as count FROM hotel_searches');
    const [flightBookings] = await pool.query('SELECT COUNT(*) as count FROM flight_bookings');
    const [hotelBookings] = await pool.query('SELECT COUNT(*) as count FROM hotel_bookings');

    res.json({
      flightSearches: flightSearches[0].count,
      hotelSearches: hotelSearches[0].count,
      flightBookings: flightBookings[0].count,
      hotelBookings: hotelBookings[0].count
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fallback: send index.html for the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Check and display database connection info
  try {
    const [rows] = await pool.query('SELECT DATABASE() as current_db');
    const currentDb = rows[0].current_db;
    console.log(`✅ Connected to database: ${currentDb || 'None (check config)'}`);
    console.log(`   Host: localhost | User: root | Database: travel`);
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
});

