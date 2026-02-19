// US-13.4 – Component tests for ProductsListPage
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing/react';
import '../i18n/i18n';
import ProductList from '../components/ProductList';
import { GET_PRODUCTS, DELETE_PRODUCT } from '../queries';

const mockProducts = [
    { id: 1, name: 'Widget', description: 'A widget', price: 9.99, quantity: 10, createdAt: '2024-01-01' },
    { id: 2, name: 'Gadget', description: 'A gadget', price: 19.99, quantity: 2, createdAt: '2024-01-02' },
];


const makeProductsMock = () => ({
    request: { query: GET_PRODUCTS },
    result: { data: { products: mockProducts } },
});

const emptyProductsMock = {
    request: { query: GET_PRODUCTS },
    result: { data: { products: [] } },
};

const deleteMock = {
    request: { query: DELETE_PRODUCT, variables: { id: 1 } },
    result: { data: { deleteProduct: { id: 1 } } },
};


const refetchAfterDeleteMock = {
    request: { query: GET_PRODUCTS },
    result: { data: { products: [mockProducts[1]] } },
};

const renderList = (mocks) =>
    render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <MemoryRouter>
                <ProductList />
            </MemoryRouter>
        </MockedProvider>
    );

describe('ProductsListPage', () => {
    beforeEach(() => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    it('shows a loading spinner initially', () => {
        renderList([makeProductsMock()]);
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('renders product rows after data loads', async () => {
        renderList([makeProductsMock()]);
        await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
        expect(screen.getByText('Gadget')).toBeInTheDocument();
    });

    it('renders price and quantity for each product', async () => {
        renderList([makeProductsMock()]);
        await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
        expect(screen.getByText('9.99 DH')).toBeInTheDocument();
        expect(screen.getByText('19.99 DH')).toBeInTheDocument();
    });

    it('renders Edit and Delete buttons for each product', async () => {
        renderList([makeProductsMock()]);
        await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
        const editButtons = screen.getAllByRole('link', { name: /edit|modifier/i });
        const deleteButtons = screen.getAllByRole('button', { name: /delete|supprimer/i });
        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
    });

    it('shows "New Product" button', async () => {
        renderList([makeProductsMock()]);
        await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
        expect(screen.getByRole('link', { name: /new product|nouveau produit/i })).toBeInTheDocument();
    });

    it('shows empty state when no products exist', async () => {
        renderList([emptyProductsMock]);
        await waitFor(() => {
            expect(document.querySelector('.empty-state')).toBeInTheDocument();
        });
    });

    it('calls DELETE_PRODUCT mutation when Delete is clicked and confirmed', async () => {
        const user = userEvent.setup();
        renderList([makeProductsMock(), deleteMock, refetchAfterDeleteMock]);
        await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
        const deleteButtons = screen.getAllByRole('button', { name: /delete|supprimer/i });
        await user.click(deleteButtons[0]);
        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(screen.queryByText('Widget')).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('low-quantity badge is applied when quantity < 5', async () => {
        renderList([makeProductsMock()]);
        await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
        const badges = document.querySelectorAll('.qty-badge.low');
        expect(badges.length).toBeGreaterThan(0);
    });
});
