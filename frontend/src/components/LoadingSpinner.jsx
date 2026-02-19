import React from 'react';
import './LoadingSpinner.css';


const LoadingSpinner = ({ text }) => (
    <div className="spinner-container">
        <div className="spinner" />
        {text && <span className="spinner-text">{text}</span>}
    </div>
);

export default LoadingSpinner;
