// US-13.4 – Component tests for LoginPage
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing/react';
import '../i18n/i18n';
import Login from '../components/Login';
import { LOGIN_MUTATION } from '../queries';

const loginSuccessMock = {
    request: {
        query: LOGIN_MUTATION,
        variables: { username: 'admin', password: 'secret123' },
    },
    result: {
        data: { login: { token: 'fake-jwt-token' } },
    },
};

const loginErrorMock = {
    request: {
        query: LOGIN_MUTATION,
        variables: { username: 'admin', password: 'wrongpass' },
    },
    error: new Error('Invalid credentials'),
};

const renderLogin = (mocks = []) =>
    render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </MockedProvider>
    );

describe('LoginPage', () => {
    it('renders username and password inputs', () => {
        renderLogin();
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
        renderLogin();
        expect(screen.getByRole('button', { name: /sign in|login|connexion|se connecter/i })).toBeInTheDocument();
    });

    it('submit button is disabled when form is empty', () => {
        renderLogin();
        const btn = screen.getByRole('button', { name: /sign in|login|connexion|se connecter/i });
        expect(btn).toBeDisabled();
    });

    it('shows validation error when username is too short', async () => {
        const user = userEvent.setup();
        renderLogin();
        const usernameInput = screen.getByPlaceholderText(/username/i);
        await user.type(usernameInput, 'a');
        await user.tab();
        await waitFor(() => {
            const errors = screen.queryAllByRole('paragraph');
            // At least one error paragraph should appear
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    it('submit button becomes enabled with valid credentials', async () => {
        const user = userEvent.setup();
        renderLogin();
        await user.type(screen.getByPlaceholderText(/username/i), 'admin');
        await user.type(screen.getByPlaceholderText(/password/i), 'secret123');
        await waitFor(() => {
            const btn = screen.getByRole('button', { name: /sign in|login|connexion|se connecter/i });
            expect(btn).not.toBeDisabled();
        });
    });

    it('calls LOGIN_MUTATION and stores token on successful login', async () => {
        const user = userEvent.setup();
        renderLogin([loginSuccessMock]);
        await user.type(screen.getByPlaceholderText(/username/i), 'admin');
        await user.type(screen.getByPlaceholderText(/password/i), 'secret123');
        await user.click(screen.getByRole('button', { name: /sign in|login|connexion|se connecter/i }));
        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        });
    });
});
