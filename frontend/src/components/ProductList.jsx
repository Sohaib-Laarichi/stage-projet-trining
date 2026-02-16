import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PRODUCTS, DELETE_PRODUCT } from '../queries';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import './ProductList.css';

const ProductList = () => {
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(GET_PRODUCTS, {
        fetchPolicy: 'cache-and-network',
        onError: (err) => {
            if (err.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                toast.error('Failed to load products');
            }
        },
    });

    const [deleteProduct] = useMutation(DELETE_PRODUCT, {
        refetchQueries: [{ query: GET_PRODUCTS }],
        onCompleted: () => toast.success('Product deleted'),
        onError: (err) => toast.error(err.message || 'Delete failed'),
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Delete "${name}"?`)) {
            deleteProduct({ variables: { id } });
        }
    };

    if (loading && !data) {
        return (
            <div className="spinner-container">
                <div className="spinner" />
                <span className="spinner-text">Loading products...</span>
            </div>
        );
    }

    if (error && !data) {
        return null; // Error already handled via onError
    }

    const products = data?.products || [];

    return (
        <div>
            <Toaster position="top-right" />
            <div className="products-header">
                <h2>Products</h2>
                <Link to="/products/new" className="btn-create">
                    + New Product
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="products-table-wrapper">
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3>No products yet</h3>
                        <p>Create your first product to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="products-table-wrapper">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <strong>{product.name}</strong>
                                        {product.description && (
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {product.description}
                                            </div>
                                        )}
                                    </td>
                                    <td>{product.price} DH</td>
                                    <td>
                                        <span className={`qty-badge ${product.quantity < 5 ? 'low' : 'ok'}`}>
                                            {product.quantity}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <Link to={`/products/${product.id}/edit`} className="btn-action">
                                                Edit
                                            </Link>
                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDelete(product.id, product.name)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductList;