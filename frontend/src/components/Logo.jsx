import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
    return (
        <div className={`logo-container logo-${size}`}>
            <img src="/logo.png" alt="Stock Manager Logo" className="logo-image" />
        </div>
    );
};

export default Logo;
