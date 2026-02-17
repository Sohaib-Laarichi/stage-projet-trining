import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        backgroundColor: '#f00509ff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;