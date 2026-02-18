// US-13.3 – Unit tests for Product GraphQL queries and mutations
// using Apollo's MockedProvider so no real network calls are made.
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import {
    GET_PRODUCTS,
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
} from '../queries';
import { useQuery, useMutation } from '@apollo/client/react';

// ─── tiny wrapper components ────────────────────────────────────────────────

const ProductsWrapper = () => {
    const { loading, data, error } = useQuery(GET_PRODUCTS);
    if (loading) return <p>Loading…</p>;
    if (error) return <p>Error</p>;
    return (
        <ul>
            {data.products.map((p) => (
                <li key={p.id}>{p.name}</li>
            ))}
        </ul>
    );
};

const CreateWrapper = ({ onDone }) => {
    const [createProduct] = useMutation(CREATE_PRODUCT);
    const run = async () => {
        const res = await createProduct({
            variables: { input: { name: 'Widget', description: '', price: 9.99, quantity: 10 } },
        });
        onDone(res.data.createProduct);
    };
    return <button onClick={run}>create</button>;
};

const UpdateWrapper = ({ onDone }) => {
    const [updateProduct] = useMutation(UPDATE_PRODUCT);
    const run = async () => {
        const res = await updateProduct({
            variables: { id: 1, input: { name: 'Widget v2', description: '', price: 19.99, quantity: 5 } },
        });
        onDone(res.data.updateProduct);
    };
    return <button onClick={run}>update</button>;
};

const DeleteWrapper = ({ onDone }) => {
    const [deleteProduct] = useMutation(DELETE_PRODUCT);
    const run = async () => {
        const res = await deleteProduct({ variables: { id: 1 } });
        onDone(res.data.deleteProduct);
    };
    return <button onClick={run}>delete</button>;
};

// ─── mocks ──────────────────────────────────────────────────────────────────

const productsMock = {
    request: { query: GET_PRODUCTS },
    result: {
        data: {
            products: [
                { id: 1, name: 'Widget', description: 'A widget', price: 9.99, quantity: 10, createdAt: '2024-01-01' },
                { id: 2, name: 'Gadget', description: 'A gadget', price: 19.99, quantity: 5, createdAt: '2024-01-02' },
            ],
        },
    },
};

const createMock = {
    request: {
        query: CREATE_PRODUCT,
        variables: { input: { name: 'Widget', description: '', price: 9.99, quantity: 10 } },
    },
    result: {
        data: {
            createProduct: { id: 3, name: 'Widget', description: '', price: 9.99, quantity: 10 },
        },
    },
};

const updateMock = {
    request: {
        query: UPDATE_PRODUCT,
        variables: { id: 1, input: { name: 'Widget v2', description: '', price: 19.99, quantity: 5 } },
    },
    result: {
        data: {
            updateProduct: { id: 1, name: 'Widget v2', description: '', price: 19.99, quantity: 5 },
        },
    },
};

const deleteMock = {
    request: { query: DELETE_PRODUCT, variables: { id: 1 } },
    result: { data: { deleteProduct: { id: 1 } } },
};

// ─── tests ───────────────────────────────────────────────────────────────────

describe('Product GraphQL – GET_PRODUCTS query', () => {
    it('products query returns results', async () => {
        render(
            <MockedProvider mocks={[productsMock]} addTypename={false}>
                <ProductsWrapper />
            </MockedProvider>
        );
        expect(screen.getByText('Loading…')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());
        expect(screen.getByText('Gadget')).toBeInTheDocument();
    });
});

describe('Product GraphQL – CREATE_PRODUCT mutation', () => {
    it('create mutation returns created product', async () => {
        let result = null;
        const { getByText } = render(
            <MockedProvider mocks={[createMock]} addTypename={false}>
                <CreateWrapper onDone={(r) => { result = r; }} />
            </MockedProvider>
        );
        getByText('create').click();
        await waitFor(() => expect(result).not.toBeNull());
        expect(result.id).toBe(3);
        expect(result.name).toBe('Widget');
    });
});

describe('Product GraphQL – UPDATE_PRODUCT mutation', () => {
    it('update mutation returns updated product', async () => {
        let result = null;
        const { getByText } = render(
            <MockedProvider mocks={[updateMock]} addTypename={false}>
                <UpdateWrapper onDone={(r) => { result = r; }} />
            </MockedProvider>
        );
        getByText('update').click();
        await waitFor(() => expect(result).not.toBeNull());
        expect(result.id).toBe(1);
        expect(result.name).toBe('Widget v2');
    });
});

describe('Product GraphQL – DELETE_PRODUCT mutation', () => {
    it('delete mutation returns success response', async () => {
        let result = null;
        const { getByText } = render(
            <MockedProvider mocks={[deleteMock]} addTypename={false}>
                <DeleteWrapper onDone={(r) => { result = r; }} />
            </MockedProvider>
        );
        getByText('delete').click();
        await waitFor(() => expect(result).not.toBeNull());
        expect(result.id).toBe(1);
    });
});
