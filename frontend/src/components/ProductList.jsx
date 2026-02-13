import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import LogoutButton from './LogoutButton';
import { GET_PRODUCTS } from '../queries';

const ProductList = () => {
    const { loading, error, data } = useQuery(GET_PRODUCTS);

    if (loading) return <p>Chargement des produits...</p>;
    if (error) return <p style={{ color: 'red' }}>Erreur : {error.message}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Liste des Produits</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                        to="/products/new"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                        }}
                    >
                        Create New Product
                    </Link>
                    <LogoutButton />
                </div>
            </div>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prix</th>
                        <th>Quantité</th>
                        <th>Date de création</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.products && data.products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                                <Link to={`/products/${product.id}/edit`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                                    <strong>{product.name}</strong>
                                </Link>
                            </td>
                            <td>{product.price} €</td>
                            <td>
                                <span style={{
                                    color: product.quantity < 5 ? 'red' : 'green',
                                    fontWeight: 'bold'
                                }}>
                                    {product.quantity}
                                </span>
                            </td>
                            <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;