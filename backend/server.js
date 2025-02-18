require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Joi = require('joi');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Change if needed
  password: 'marcletty12!',  // Change if needed
  database: 'user_management'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Validation Schema
const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').required()
});

// ✅ Register Route
app.post('/api/register', async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Registration failed' });
      res.status(201).json({ message: 'User registered successfully!' });
    }
  );
});

// ✅ Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err || result.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// ✅ Middleware to Protect Routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ✅ Get Users (Protected Route - Admin Only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });

  db.query('SELECT id, name, email, role FROM users', (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Start Server
app.listen(5000, () => console.log('🚀 Backend running on http://localhost:5000'));
