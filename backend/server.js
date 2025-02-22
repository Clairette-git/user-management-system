const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection

require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
   

});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Signup
app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'user'; 

  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, email, hashedPassword, userRole], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error registering user' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login 
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.name, email: user.email, role: user.role }
    });
  });
});

//  verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Change Password 
app.put('/change-password', verifyToken, async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = 'UPDATE users SET password = ? WHERE id = ?';

  db.query(sql, [hashedPassword, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error updating password' });
    res.json({ message: 'Password changed successfully' });
  });
});

// Admin Register Users
app.post('/admin/register', verifyToken, verifyAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'user';

  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, email, hashedPassword, userRole], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error registering user' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Delete user by email (admin only)
app.delete('/admin/delete-user', verifyToken, verifyAdmin, (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const sql = 'DELETE FROM users WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Error deleting user' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

//  Get All Users (For Admin)
app.get('/users', verifyToken, verifyAdmin, (req, res) => {
  const sql = 'SELECT id, name, email, role FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Error fetching users' });
    }
    res.json({ users: results });
  });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
