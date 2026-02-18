/**
 * authStorage.js
 * Pure utility for managing the auth token in localStorage.
 * Keeping this logic separate makes it easy to unit-test without
 * rendering any React component.
 */

export const setToken = (token) => localStorage.setItem('token', token);

export const getToken = () => localStorage.getItem('token');

export const removeToken = () => localStorage.removeItem('token');

export const isLoggedIn = () => !!localStorage.getItem('token');
