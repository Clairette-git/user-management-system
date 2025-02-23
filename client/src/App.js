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
