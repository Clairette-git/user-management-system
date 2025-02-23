import React, { useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/login', form);
      localStorage.setItem('token', res.data.token);
      setMessage('Login successful');
    } catch (error) {
      setMessage('Error logging in');
    }
  };

  return (
    <div className='container'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name='email'
          type='email'
          placeholder='Email'
          onChange={handleChange}
          value={form.email}
          required
        />
        <input
          name='password'
          type='password'
          placeholder='Password'
          onChange={handleChange}
          value={form.password}
          required
        />
        <button type='submit'>Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginPage;
