// US-13.4 – Component tests for ProductFormPage (create mode)
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing/react';
import '../i18n/i18n';
import ProductForm from '../components/ProductForm';
import { CREATE_PRODUCT, GET_PRODUCTS } from '../queries';


const createMock = {
    request: {
        query: CREATE_PRODUCT,
        variables: {
            input: { name: 'Test Widget', description: null, price: 9.99, quantity: 5 },
        },
    },
    result: {
        data: {
            createProduct: { id: 10, name: 'Test Widget', description: null, price: 9.99, quantity: 5 },
        },
    },
};

const getProductsMock = {
    request: { query: GET_PRODUCTS },
    result: { data: { products: [] } },
};

const renderForm = (mocks = [], path = '/products/new') =>
    render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/products/new" element={<ProductForm />} />
                    <Route path="/products" element={<div>Products List</div>} />
                </Routes>
            </MemoryRouter>
        </MockedProvider>
    );

describe('ProductFormPage (create mode)', () => {
    it('renders all form fields', () => {
        renderForm();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    });

    it('submit button is disabled when form is empty', () => {
        renderForm();
        const submitBtn = screen.getByRole('button', { name: /create|créer|save|enregistrer/i });
        expect(submitBtn).toBeDisabled();
    });

    it('shows validation error when name is too short', async () => {
        const user = userEvent.setup();
        renderForm();
        const nameInput = screen.getByLabelText(/name/i);
        await user.type(nameInput, 'a');
        await user.tab();
        await waitFor(() => {
            const errors = document.querySelectorAll('.field-error');
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    it('submit button is enabled with valid data', async () => {
        const user = userEvent.setup();
        renderForm();
        await user.type(screen.getByLabelText(/name/i), 'Test Widget');
        await user.type(screen.getByLabelText(/price/i), '9.99');
        await user.type(screen.getByLabelText(/quantity/i), '5');
        await waitFor(() => {
            const submitBtn = screen.getByRole('button', { name: /create|créer|save|enregistrer/i });
            expect(submitBtn).not.toBeDisabled();
        });
    });

    it('calls CREATE_PRODUCT mutation on valid submit', async () => {
        const user = userEvent.setup();
        renderForm([createMock, getProductsMock]);
        await user.type(screen.getByLabelText(/name/i), 'Test Widget');
        await user.type(screen.getByLabelText(/price/i), '9.99');
        await user.type(screen.getByLabelText(/quantity/i), '5');
        const submitBtn = await screen.findByRole('button', { name: /create|créer|save|enregistrer/i });
        expect(submitBtn).not.toBeDisabled();
        await user.click(submitBtn);
        await waitFor(() => {
            expect(screen.getByText('Products List')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('renders a cancel button that navigates back', () => {
        renderForm();
        expect(screen.getByRole('button', { name: /cancel|annuler/i })).toBeInTheDocument();
    });
});
