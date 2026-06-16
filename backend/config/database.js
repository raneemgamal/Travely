// Singleton Pattern: Ensures only one database connection pool exists
const mysql = require('mysql2/promise');

class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'Rakwa5678@',
            database: 'travel'
        });

        Database.instance = this;
    }

    getPool() {
        return this.pool;
    }

    async testConnection() {
        try {
            const [rows] = await this.pool.query('SELECT DATABASE() as current_db');
            return rows[0].current_db;
        } catch (err) {
            throw err;
        }
    }
}

// Export singleton instance
module.exports = new Database();

