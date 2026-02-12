import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PRODUCTS } from './queries';

const ProductList = () => {
    const { loading, error, data } = useQuery(GET_PRODUCTS);

    if (loading) return <p>Chargement des produits...</p>;
    if (error) return <p style={{ color: 'red' }}>Erreur : {error.message}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Liste des Produits</h2>
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
                            <td><strong>{product.name}</strong></td>
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