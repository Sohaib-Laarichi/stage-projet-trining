import React from 'react';
import './LoadingSpinner.css';

/**
 * Full-page loading spinner.
 * @param {string} text - Optional label shown below the spinner.
 */
const LoadingSpinner = ({ text }) => (
    <div className="spinner-container">
        <div className="spinner" />
        {text && <span className="spinner-text">{text}</span>}
    </div>
);

export default LoadingSpinner;
