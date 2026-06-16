# Travely Website

A full-stack travel booking website for searching and booking flights and hotels. The project includes a responsive front-end built with HTML, CSS, and JavaScript, plus a Node.js/Express backend connected to a MySQL database.

The website is branded as **Travely** / **البطة المرتاحة للسفر والسياحة** and provides a simple travel agency experience where users can browse destinations, search for flights, search for hotels, log in, and store booking/search data in the database.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Installation and Setup](#installation-and-setup)
- [How to Run the Project](#how-to-run-the-project)
- [How to Use](#how-to-use)
- [MVC Architecture](#mvc-architecture)
- [Singleton Pattern](#singleton-pattern)
- [Notes](#notes)

---

## Project Overview

Travely is a travel and tourism web application that helps users search for flights and hotels. It includes multiple pages:

- **Home Page**: Landing page with a travel hero section and call-to-action button.
- **Flights Page**: Search form for flight details such as origin, destination, trip type, class, date, and number of travelers.
- **Hotels Page**: Search form for hotels using destination, check-in date, check-out date, guests, and rooms.
- **Login Page**: User login interface.
- **Contact Page**: Contact information for the travel agency.

The backend stores users, searches, bookings, and available travel options using MySQL.

---

## Features

### Frontend Features

- Responsive website layout.
- Navigation between Home, Flights, Hotels, Contact, and Login pages.
- Flight search form with:
  - Trip type selection.
  - Travel class selection.
  - Origin and destination input.
  - Departure and return dates.
  - Adult, child, and infant counters.
- Hotel search form with:
  - Destination input.
  - Check-in and check-out dates.
  - Number of guests.
  - Number of rooms.
- Dynamic display of flight and hotel search results.
- Booking buttons for flights and hotels.
- Destination slider/cards.
- Contact page with phone, WhatsApp, email, hotline, and address.

### Backend Features

- Express.js server.
- MySQL database connection.
- User registration endpoint.
- User login endpoint.
- Flight search API.
- Flight booking API.
- Hotel search API.
- Hotel booking API.
- User booking history APIs.
- Basic search and booking analytics API.
- Static file serving for HTML, CSS, JavaScript, and images.

---

## Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Responsive design with media queries

### Backend

- Node.js
- Express.js
- MySQL2
- MySQL database

### Dependencies

The project uses the following main npm packages:

```json
{
  "express": "^4.22.1",
  "mysql2": "^3.12.0",
  "bcryptjs": "^2.4.3"
}
```

> Note: `bcryptjs` is installed, but the current login logic compares passwords directly. For a production project, passwords should be hashed before being stored.

---

## Project Structure

```text
project/
│
├── index.html              # Home page
├── flights.html            # Flights search page
├── hotels.html             # Hotels search page
├── contact.html            # Contact page
├── login.html              # Login page
│
├── style.css               # Main stylesheet
├── script.js               # Frontend JavaScript logic
│
├── server.js               # Express backend server
├── database.js             # Singleton database connection file
├── database_schema.sql     # MySQL database schema
│
├── package.json            # Node.js project configuration
├── package-lock.json       # Installed dependency lock file
└── MVC_ARCHITECTURE.md     # Notes about MVC structure and request flow
```

Suggested MVC structure from the architecture document:

```text
project/
│
├── models/
│   ├── User.js
│   ├── Flight.js
│   └── Hotel.js
│
├── controllers/
│   ├── UserController.js
│   ├── FlightController.js
│   └── HotelController.js
│
├── views/
│   ├── index.html
│   ├── login.html
│   ├── flights.html
│   ├── hotels.html
│   └── contact.html
│
├── public/
│   ├── style.css
│   └── script.js
│
├── server.js
├── database.js
├── package.json
└── database_schema.sql
```

---

## Database Design

The project uses a MySQL database named:

```sql
travel
```

### Main Tables

#### `users`
Stores website users.

| Column | Description |
|---|---|
| `id` | User ID |
| `username` | Unique username |
| `email` | Unique email address |
| `password_hash` | User password value |
| `created_at` | Account creation date |

#### `flight_searches`
Stores flight search history for analytics.

#### `hotel_searches`
Stores hotel search history for analytics.

#### `flight_bookings`
Stores confirmed flight bookings.

#### `hotel_bookings`
Stores confirmed hotel bookings.

#### `available_flights`
Stores flight data shown in search results.

#### `available_hotels`
Stores hotel data shown in search results.

---

## API Endpoints

### General

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ping` | Checks if the backend is running |
| `GET` | `/api/check-db` | Checks the database connection |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Registers a new user |
| `POST` | `/login` | Logs in a user |

### Flights

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/flights/search` | Searches for flights and stores the search query |
| `POST` | `/api/flights/book` | Books a selected flight |
| `GET` | `/api/bookings/flights/:userId` | Gets flight bookings for a user |

### Hotels

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/hotels/search` | Searches for hotels and stores the search query |
| `POST` | `/api/hotels/book` | Books a selected hotel |
| `GET` | `/api/bookings/hotels/:userId` | Gets hotel bookings for a user |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/searches` | Returns counts for flight searches, hotel searches, flight bookings, and hotel bookings |

---

## Installation and Setup

### 1. Install Node.js

Make sure Node.js is installed on your machine.

Check installation:

```bash
node -v
npm -v
```

### 2. Install MySQL

Install and start MySQL on your device.

### 3. Clone or Download the Project

Place all project files in one folder.

### 4. Install Dependencies

Inside the project folder, run:

```bash
npm install
```

### 5. Create the Database

Open MySQL and run the SQL file:

```bash
mysql -u root -p < database_schema.sql
```

Or manually open `database_schema.sql` in MySQL Workbench and execute it.

### 6. Configure Database Connection

In `server.js` and `database.js`, update the database settings to match your local MySQL configuration:

```js
host: 'localhost',
user: 'root',
password: 'your_mysql_password',
database: 'travel'
```

Do not upload your real database password to GitHub.

---

## How to Run the Project

Start the backend server:

```bash
npm start
```

The server will run on:

```text
http://localhost:3000
```

Open this URL in your browser:

```text
http://localhost:3000
```

---

## How to Use

1. Open the website in the browser.
2. Navigate to the **Flights** page to search for flights.
3. Enter the origin, destination, departure date, travel class, and passenger count.
4. Click **Search Flights** to view available flights.
5. Click **Book** to book a flight.
6. Navigate to the **Hotels** page to search for hotels.
7. Enter the city, check-in date, check-out date, guests, and rooms.
8. Click **Search Hotels** to view hotel results.
9. Click **Book** to book a hotel.
10. Use the **Contact** page to view agency contact details.

---

## MVC Architecture

The project follows the idea of the MVC architecture:

```text
Client Request
    ↓
Routes
    ↓
Controller
    ↓
Model
    ↓
Database
    ↓
Response to Client
```

### Explanation

- **Model**: Handles database tables and data logic, such as users, flights, and hotels.
- **View**: Represents the user interface pages, such as `index.html`, `flights.html`, and `hotels.html`.
- **Controller**: Handles requests, validates input, calls the model/database, and returns responses.

The current project has most logic inside `server.js`, but it can be improved by separating the code into `models`, `views`, and `controllers` folders.

---

## Singleton Pattern

The `database.js` file applies the Singleton Pattern to make sure only one database connection pool is created.

### Why it is useful

- Prevents creating multiple database connections unnecessarily.
- Saves system resources.
- Provides one global access point for the database.
- Makes the project easier to maintain.

Example idea:

```js
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.pool = mysql.createPool({ ... });
    Database.instance = this;
  }
}
```

---

## Notes

- The project currently uses simple login logic. For better security, use hashed passwords with `bcryptjs`.
- The database password should be stored in environment variables instead of being written directly in the code.
- If the database has no matching flights or hotels, the server returns sample data.
- The project can be extended by adding:
  - User registration page.
  - Admin dashboard.
  - Payment system.
  - Booking cancellation.
  - Better session handling.
  - Real flight and hotel APIs.

---

## Author

Travely Website Project
