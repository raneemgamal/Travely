create database travel;
USE travel;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (username, email, password_hash)
VALUES (
  'testuser',
  'testuser@example.com',
  'test12345'
);

-- Flight searches (for analytics)
CREATE TABLE IF NOT EXISTS flight_searches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  trip_type VARCHAR(20) NOT NULL,
  travel_class VARCHAR(20),
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  infants INT DEFAULT 0,
  user_id INT,
  searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Hotel searches (for analytics)
CREATE TABLE IF NOT EXISTS hotel_searches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  guests INT DEFAULT 2,
  rooms INT DEFAULT 1,
  user_id INT,
  searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Flight bookings
CREATE TABLE IF NOT EXISTS flight_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  trip_type VARCHAR(20) NOT NULL,
  travel_class VARCHAR(20) NOT NULL,
  airline VARCHAR(100),
  departure_time TIME,
  arrival_time TIME,
  duration VARCHAR(20),
  price DECIMAL(10, 2) NOT NULL,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  infants INT DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  booking_status VARCHAR(20) DEFAULT 'confirmed',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hotel bookings
CREATE TABLE IF NOT EXISTS hotel_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  guests INT DEFAULT 2,
  rooms INT DEFAULT 1,
  price_per_night DECIMAL(10, 2) NOT NULL,
  total_nights INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  stars INT,
  booking_status VARCHAR(20) DEFAULT 'confirmed',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Available flights (for search results)
CREATE TABLE IF NOT EXISTS available_flights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  airline VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration VARCHAR(20) NOT NULL,
  travel_class VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  available_seats INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Available hotels (for search results)
CREATE TABLE IF NOT EXISTS available_hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  stars INT DEFAULT 3,
  price_per_night DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  available_rooms INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);