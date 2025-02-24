const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://user-management-system-fawn-nine.vercel.app/'
}));

app.get('/', (req, res) => {
  res.send('Server is running and responding to GET requests');
});
// MySQL Connection

const connection = mysql.createConnection({
  host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST,
  user: process.env.MYSQL_ADDON_USER || process.env.DB_USER,
  password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASS,
  database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME,
  port: process.env.MYSQL_ADDON_PORT || process.env.DB_PORT || 3306
});
connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to database!');
});

// Signup
app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'user'; 

  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  connection.query(sql, [username, email, hashedPassword, userRole], (err, result) => {
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

  connection.query(sql, [email], async (err, results) => {
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

  connection.query(sql, [hashedPassword, req.user.id], (err) => {
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
  connection.query(sql, [username, email, hashedPassword, userRole], (err) => {
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
  connection.query(sql, [email], (err, result) => {
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
  connection.query(sql, (err, results) => {
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



import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false); 
  const [isChangePasswordFormVisible, setIsChangePasswordFormVisible] = useState(false); 
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]); 

  const apiUrl = process.env.API_URL;
  fetch(`${apiUrl}/endpoint`)
    .then(response => response.json())
    .then(data => console.log(data));
    
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/register', registerForm);
      setMessage(res.data.message);
      setMessageType('success');
      setRegisterForm({ username: '', email: '', password: '', role: 'user' });
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000); 
    } catch (error) {
      setMessage('Error registering user');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/login', loginForm);
      setToken(res.data.token);
      setUserRole(res.data.user.role);
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      setMessage('Login successful');
      setMessageType('success');
      setLoginForm({ email: '', password: '' });
      if (res.data.user.role === 'admin') {
        setIsAdminPanelVisible(true); 
      }
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } catch (error) {
      setMessage('Error logging in');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsAdminPanelVisible(false);
    setMessage('Logged out');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000); 
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You need to be logged in to change your password.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return;
    }

    try {
      const res = await axios.put(
        'https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/change-password',
        { newPassword, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setMessageType('success');
      setNewPassword('');
      setEmail('');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } catch (error) {
      setMessage('Error changing password');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000); 
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data.users);
    } catch (error) {
      setMessage('Error fetching users');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const deleteUser = async (email) => {
    try {
      const token = localStorage.getItem('token'); 
      const res = await axios.delete('https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/admin/delete-user', {
        headers: { Authorization: `Bearer ${token}` },
        data: { email }  
      });
      setMessage(res.data.message);  
      setMessageType('success');
      fetchAllUsers(); 
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000); 
    } catch (error) {
      console.error('Error deleting user:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'Failed to delete user');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000); 
    }
  };

  return (
    <div className="container">
      <h2 className="title">{isLoggedIn ? 'Welcome' : 'Welcome to User Management System'}</h2>

      {/* Message at the top */}
      {message && (
        <div className={`message ${messageType}`}>
          <p>{message}</p>
        </div>
      )}

      {/* Register Form */}
      {!isLoggedIn && !isLoginFormVisible && !isChangePasswordFormVisible && (
        <div className="form-container">
          <h3>Register</h3>
          <form onSubmit={handleRegister}>
            <input
              name="username"
              placeholder="Username"
              onChange={handleRegisterChange}
              value={registerForm.username}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleRegisterChange}
              value={registerForm.email}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleRegisterChange}
              value={registerForm.password}
              required
            />
            <select name="role" onChange={handleRegisterChange} value={registerForm.role}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Register</button>
          </form>
          <button onClick={() => setIsLoginFormVisible(true)}>Already have an account? Login</button>
        </div>
      )}

      {/* Login Form */}
      {isLoginFormVisible && !isLoggedIn && (
        <div className="form-container">
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleLoginChange}
              value={loginForm.email}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleLoginChange}
              value={loginForm.password}
              required
            />
            <button type="submit">Login</button>
          </form>
          <button onClick={() => setIsLoginFormVisible(false)}>Don't have an account? Register</button>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminPanelVisible && (
        <div className="admin-panel">
          <h3>Admin Panel</h3>
          <button onClick={fetchAllUsers}>See All Users</button>

          {/* Delete User and Register User */}
          <div>
            <h4>Delete User</h4>
            <input
              type="email"
              placeholder="Enter user's email to delete"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <button onClick={() => deleteUser(email)}>Delete User</button>
          </div>

          {/* List of All Users */}
          <div>
            <h4>All Registered Users</h4>
            {allUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <ul>
                {allUsers.map((user) => (
                  <li key={user._id}>
                    {user.username} - {user.email} - {user.role}
                    <button onClick={() => deleteUser(user.email)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Change Password Form */}
      {isChangePasswordFormVisible && (
        <div>
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Change Password</button>
          </form>
          <button onClick={() => setIsChangePasswordFormVisible(false)}>Back to Login</button>
        </div>
      )}

      {/* Logout Button */}
      {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
    </div>
  );
}

export default App;
