
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() },
    Toaster: () => null,
}));



const getMsg = (key) => {
    const messages = { forbidden: 'Access denied', networkError: 'Server unreachable' };
    return messages[key];
};

const handleError = ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        for (const { message } of graphQLErrors) {
            const msg = message?.toLowerCase() ?? '';

            if (msg.includes('unauthorized') || msg.includes('401')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            if (msg.includes('forbidden') || msg.includes('403')) {
                toast.error(getMsg('forbidden'));
                return;
            }
        }
    }

    if (networkError) {
        toast.error(getMsg('networkError'));
    }
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Apollo errorLink handler — US-14.1', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('token', 'some-token');
        // Reset window.location.href for each test
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: 'http://localhost:3000/' },
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('clears token and redirects to /login on Unauthorized error', () => {
        handleError({
            graphQLErrors: [{ message: 'Unauthorized: invalid token' }],
            networkError: null,
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(window.location.href).toBe('/login');
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('shows "Access denied" toast on Forbidden error', () => {
        handleError({
            graphQLErrors: [{ message: 'Forbidden: insufficient permissions' }],
            networkError: null,
        });

        expect(toast.error).toHaveBeenCalledWith('Access denied');
        // Token must NOT be removed for Forbidden
        expect(localStorage.getItem('token')).toBe('some-token');
        expect(window.location.href).not.toBe('/login');
    });

    it('shows "Server unreachable" toast on network error', () => {
        handleError({
            graphQLErrors: null,
            networkError: new Error('Failed to fetch'),
        });

        expect(toast.error).toHaveBeenCalledWith('Server unreachable');
        expect(localStorage.getItem('token')).toBe('some-token');
    });

    it('does not redirect or show toast for a normal GraphQL error', () => {
        handleError({
            graphQLErrors: [{ message: 'Product not found' }],
            networkError: null,
        });

        expect(window.location.href).not.toBe('/login');
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('handles 401 numeric code in message', () => {
        handleError({
            graphQLErrors: [{ message: '401 authentication required' }],
            networkError: null,
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(window.location.href).toBe('/login');
    });

    it('handles 403 numeric code in message', () => {
        handleError({
            graphQLErrors: [{ message: '403 access denied' }],
            networkError: null,
        });

        expect(toast.error).toHaveBeenCalledWith('Access denied');
    });
});
