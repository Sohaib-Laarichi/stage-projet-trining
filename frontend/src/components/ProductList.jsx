import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { GET_PRODUCTS, DELETE_PRODUCT } from '../queries';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import './ProductList.css';

const ProductList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(GET_PRODUCTS, {
        fetchPolicy: 'cache-and-network',
        onError: (err) => {
            if (err.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                toast.error(t('products.loadFailed'));
            }
        },
    });

    const [deleteProduct] = useMutation(DELETE_PRODUCT, {
        refetchQueries: [{ query: GET_PRODUCTS }],
        onCompleted: () => toast.success(t('products.deleteSuccess')),
        onError: (err) => toast.error(err.message || t('products.deleteFailed')),
    });

    const handleDelete = (id, name) => {
        if (window.confirm(t('products.deleteConfirm', { name }))) {
            deleteProduct({ variables: { id } });
        }
    };

    if (loading && !data) {
        return (
            <div className="spinner-container">
                <div className="spinner" />
                <span className="spinner-text">{t('products.loading')}</span>
            </div>
        );
    }

    if (error && !data) {
        return null;
    }

    const products = data?.products || [];

    return (
        <div>
            <Toaster position="top-right" />
            <div className="products-header">
                <h2>{t('products.title')}</h2>
                <Link to="/products/new" className="btn-create">
                    {t('products.newProduct')}
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="products-table-wrapper">
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3>{t('products.emptyTitle')}</h3>
                        <p>{t('products.emptyDescription')}</p>
                    </div>
                </div>
            ) : (
                <div className="products-table-wrapper">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>{t('products.name')}</th>
                                <th>{t('products.price')}</th>
                                <th>{t('products.quantity')}</th>
                                <th>{t('products.actions')}</th>
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
                                                {t('products.edit')}
                                            </Link>
                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDelete(product.id, product.name)}
                                            >
                                                {t('products.delete')}
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