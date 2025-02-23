import React, { useState } from 'react';
import axios from 'axios';

function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/register', form);
      setMessage(res.data.message);
      setForm({ username: '', email: '', password: '' }); 
    } catch (error) {
      setMessage('Error registering user');
    }
  };

  return (
    <div className='container'>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name='username'
          placeholder='Username'
          onChange={handleChange}
          value={form.username}
          required
        />
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
        <button type='submit'>Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterPage;
