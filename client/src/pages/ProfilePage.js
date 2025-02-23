import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfilePage() {
 
  const [profile, setProfile] = useState({ username: '', email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(true); 


  useEffect(() => {

    
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setProfile(response.data);
        })
        .catch((error) => {
          console.error(error);
          setMessage('Error fetching profile data');
        });
    }
  }, []);

 
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.put(
        'https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/profile/update',
        { username: profile.username, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await axios.put(
            'https://app-414df6c2-29f7-4816-9069-43ff25e3f558.cleverapps.io/profile/password',
            { password: newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessage('Password changed successfully');
        } catch (error) {
          setMessage(error.response?.data?.error || 'Error changing password');
        }
  };

  return (
    <div className="profile-container">
      <h1>Update Profile</h1>

      {/* Button to switch forms */}
      <div className="form-toggle">
        <button onClick={() => setIsUpdatingProfile(true)}>Update Profile</button>
        <button onClick={() => setIsUpdatingProfile(false)}>Change Password</button>
      </div>

      {/* Profile Update Form */}
      {isUpdatingProfile ? (
        <form onSubmit={handleProfileUpdate}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
          <button type="submit">Update Profile</button>
        </form>
      ) : (
        // Password Change Form
        <form onSubmit={handlePasswordChange}>
          <div>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Change Password</button>
        </form>
      )}

      {/* Display Messages */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ProfilePage;
