// US-13.2 – Unit tests for auth token storage logic.
import { describe, it, expect, beforeEach } from 'vitest';
import {
    setToken,
    getToken,
    removeToken,
    isLoggedIn,
} from '../utils/authStorage';

describe('authStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should store token after login', () => {
        setToken('my-jwt-token');
        expect(localStorage.getItem('token')).toBe('my-jwt-token');
    });

    it('should clear token on logout', () => {
        localStorage.setItem('token', 'existing-token');
        removeToken();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('should detect isLoggedIn if token exists', () => {
        expect(isLoggedIn()).toBe(false);
        setToken('some-token');
        expect(isLoggedIn()).toBe(true);
    });

    it('getToken returns null when no token is stored', () => {
        expect(getToken()).toBeNull();
    });

    it('getToken returns the stored token', () => {
        localStorage.setItem('token', 'abc123');
        expect(getToken()).toBe('abc123');
    });
});
