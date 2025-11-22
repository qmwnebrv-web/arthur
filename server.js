// Backend Server for Arthur's Website
// This uses Node.js with Express and SQLite database

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
// Eesti ajavöönd
process.env.TZ = 'Europe/Tallinn';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
// Kui keegi läheb avalehele, näita index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(session({
    secret: 'arthur-loodus-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize Database
const db = new sqlite3.Database('./website.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        ip_address TEXT,
        timestamp DATETIME DEFAULT (datetime('now', 'localtime')),
        is_important INTEGER DEFAULT 0,
        is_read INTEGER DEFAULT 0
    )`);

    // Visitors table for analytics
    db.run(`CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT,
        user_agent TEXT,
        page_visited TEXT,
        timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
    )`);

    // Admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )`);

    // Create default admin user (username: arthur, password: arthur2024)
    const defaultPassword = '9hah20sd&2g!';
    bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
            console.error('Error creating admin user:', err);
        } else {
            db.run(`INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)`, 
                ['15joadnawo1!f?', hash], (err) => {
                    if (err) {
                        console.error('Error inserting admin:', err);
                    } else {
                        console.log('Default admin user created: username=arthur, password=arthur2024');
                    }
                });
        }
    });
}

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// ============================================
// PUBLIC ENDPOINTS
// ============================================

// Submit contact form
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    db.run(
        `INSERT INTO messages (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)`,
        [name, email, subject || '', message, ip],
        function(err) {
            if (err) {
                console.error('Error saving message:', err);
                return res.status(500).json({ error: 'Failed to save message' });
            }
            res.json({ success: true, message: 'Sõnum edukalt saadetud!' });
        }
    );
});

// Track visitor (salvestab iga 2 minuti tagant sama IP kohta)
const recentVisitors = {}; // Hoiab meeles viimased külastused

app.post('/api/track-visit', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const userAgent = req.get('User-Agent') || 'unknown';
    const page = req.body.page || 'unknown';
    
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000; // 2 minutit millisekundites
    
    // Kontrolli kas see IP on hiljuti külastanud
    if (recentVisitors[ip] && (now - recentVisitors[ip]) < twoMinutes) {
        console.log('Skipping - too soon for IP:', ip);
        return res.json({ success: true, message: 'Too soon, skipping' });
    }
    
    // Salvesta uus külastus
    db.run(
        `INSERT INTO visitors (ip_address, user_agent, page_visited) VALUES (?, ?, ?)`,
        [ip, userAgent, page],
        (err) => {
            if (err) {
                console.error('Error tracking visit:', err);
                return res.json({ success: false });
            }
            
            // Uuenda mälus olev aeg
            recentVisitors[ip] = now;
            console.log('New visit recorded for IP:', ip);
            res.json({ success: true, message: 'Visit recorded' });
        }
    );
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM admin_users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Vale kasutajanimi või parool' });
        }

        bcrypt.compare(password, user.password_hash, (err, result) => {
            if (result) {
                req.session.isAdmin = true;
                req.session.username = username;
                res.json({ success: true, message: 'Sisselogimine õnnestus!' });
            } else {
                res.status(401).json({ error: 'Vale kasutajanimi või parool' });
            }
        });
    });
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Välja logitud' });
});

// Check if admin is logged in
app.get('/api/admin/check', (req, res) => {
    res.json({ isAuthenticated: !!req.session.isAdmin });
});

// Get all messages
app.get('/api/admin/messages', isAuthenticated, (req, res) => {
    const { sortBy = 'timestamp', order = 'DESC', filter } = req.query;
    
    let query = `SELECT * FROM messages`;
    const params = [];
    
    if (filter === 'important') {
        query += ` WHERE is_important = 1`;
    } else if (filter === 'unread') {
        query += ` WHERE is_read = 0`;
    }
    
    query += ` ORDER BY ${sortBy} ${order}`;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }
        res.json(rows);
    });
});

// Mark message as important
app.put('/api/admin/messages/:id/important', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { isImportant } = req.body;

    db.run(
        `UPDATE messages SET is_important = ? WHERE id = ?`,
        [isImportant ? 1 : 0, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update message' });
            }
            res.json({ success: true });
        }
    );
});

// Mark message as read
app.put('/api/admin/messages/:id/read', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { isRead } = req.body;

    db.run(
        `UPDATE messages SET is_read = ? WHERE id = ?`,
        [isRead ? 1 : 0, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update message' });
            }
            res.json({ success: true });
        }
    );
});

// Delete message
app.delete('/api/admin/messages/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM messages WHERE id = ?`, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete message' });
        }
        res.json({ success: true });
    });
});

// Get visitor statistics
app.get('/api/admin/stats', isAuthenticated, (req, res) => {
    const stats = {};

    // Total visitors
    db.get(`SELECT COUNT(*) as total FROM visitors`, (err, row) => {
        stats.totalVisitors = row ? row.total : 0;

        // Unique visitors
        db.get(`SELECT COUNT(DISTINCT ip_address) as unique FROM visitors`, (err, row) => {
            stats.uniqueVisitors = row ? row.unique : 0;

            // Today's visitors
            db.get(`SELECT COUNT(*) as today FROM visitors WHERE DATE(timestamp) = DATE('now')`, (err, row) => {
                stats.todayVisitors = row ? row.today : 0;

                // Current online (last 5 minutes)
                db.get(`SELECT COUNT(DISTINCT ip_address) as online FROM visitors 
                        WHERE datetime(timestamp) > datetime('now', '-5 minutes')`, (err, row) => {
                    stats.currentOnline = row ? row.online : 0;

                    // Total messages
                    db.get(`SELECT COUNT(*) as total FROM messages`, (err, row) => {
                        stats.totalMessages = row ? row.total : 0;

                        // Unread messages
                        db.get(`SELECT COUNT(*) as unread FROM messages WHERE is_read = 0`, (err, row) => {
                            stats.unreadMessages = row ? row.unread : 0;

                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

// Get recent visitors
app.get('/api/admin/visitors', isAuthenticated, (req, res) => {
    db.all(`SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 50`, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch visitors' });
        }
        res.json(rows);
    });
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});


// Clear all visitors (no login required)
app.delete('/api/visitors/clear', (req, res) => {
    db.run(`DELETE FROM visitors`, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to clear visitors' });
        }
        res.json({ success: true, message: 'All visitors cleared' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    console.log(`Default login - Username: arthur, Password: arthur2024`);
});