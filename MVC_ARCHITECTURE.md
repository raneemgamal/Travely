/project
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
├── script.js
├── package.json
└── database_schema.sql
######
// bonus singelton pattern

class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        this.connection = mysql.createConnection({...});
        Database.instance = this;
    }
}

Prevents multiple database connections

Saves system resources

Provides a global access point
####
mvc request Flow

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
######
