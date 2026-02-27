/**
 * ProductList.jsx — Page d'affichage de la liste des produits.
 *
 * Fonctionnalités :
 *   - Récupération des produits via la query GraphQL GET_PRODUCTS
 *   - Affichage dans un tableau avec indicateur de stock (badge rouge/vert)
 *   - Suppression avec confirmation et rafraîchissement automatique
 *   - Gestion des états vide, chargement et erreur
 *   - Support de l'internationalisation (FR/EN)
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { GET_PRODUCTS, DELETE_PRODUCT } from '../queries';

import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { isInfraError, isAuthError } from '../utils/errorUtils';
import './ProductList.css';

/**
 * ProductList — Affiche la liste de tous les produits en tableau.
 *
 * Stratégie de cache Apollo : 'cache-and-network'
 *   → Affiche d'abord le cache pour une réponse instantanée,
 *     puis re-fetch en arrière-plan pour garder les données fraîches.
 */
const ProductList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // ─── Query : Récupérer tous les produits ─────────────────────────────────
    const { loading, error, data } = useQuery(GET_PRODUCTS, {
        fetchPolicy: 'cache-and-network',   // Cache immédiat + mise à jour réseau
        onError: (err) => {
            // Les erreurs d'auth et d'infra sont déjà gérées par errorLink (main.jsx)
            // On affiche le toast uniquement pour les autres erreurs métier
            if (!isAuthError(err) && !isInfraError(err)) {
                toast.error(t('products.loadFailed'));
            }
        },
    });

    // ─── Mutation : Supprimer un produit ─────────────────────────────────────
    // refetchQueries : après suppression, recharge automatiquement GET_PRODUCTS
    // pour synchroniser la liste avec la base de données.
    const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
        refetchQueries: [{ query: GET_PRODUCTS }],
        onCompleted: () => toast.success(t('products.deleteSuccess')),
        onError: (err) => {
            if (isAuthError(err)) {
                toast.error(t('errors.forbidden'));
                return;
            }
            if (!isInfraError(err)) {
                toast.error(err.message || t('products.deleteFailed'));
            }
        },
    });

    /**
     * handleDelete — Demande confirmation, puis supprime le produit.
     *
     * @param {number} id - ID du produit à supprimer
     * @param {string} name - Nom du produit (affiché dans le message de confirmation)
     */
    const handleDelete = (id, name) => {
        if (window.confirm(t('products.deleteConfirm', { name }))) {
            deleteProduct({ variables: { id } });
        }
    };

    // ─── États de rendu ──────────────────────────────────────────────────────

    // Chargement initial (aucune donnée en cache)
    if (loading && !data) {
        return <LoadingSpinner text={t('products.loading')} />;
    }

    // Erreur et pas de données en cache → errorLink a déjà affiché le toast
    if (error && !data) {
        return null;
    }

    const products = data?.products || [];

    return (
        <div>
            {/* ── En-tête : titre + bouton de création ── */}
            <div className="products-header">
                <h2>{t('products.title')}</h2>
                <Link to="/products/new" className="btn-create">
                    {t('products.newProduct')}
                </Link>
            </div>

            {products.length === 0 ? (
                /* ── État vide : aucun produit en base ── */
                <div className="products-table-wrapper">
                    <div className="empty-state">
                        <h3>{t('products.emptyTitle')}</h3>
                        <p>{t('products.emptyDescription')}</p>
                    </div>
                </div>
            ) : (
                /* ── Tableau des produits ── */
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
                                    {/* Colonne Nom + description en sous-texte */}
                                    <td>
                                        <strong>{product.name}</strong>
                                        {product.description && (
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {product.description}
                                            </div>
                                        )}
                                    </td>

                                    {/* Colonne Prix */}
                                    <td>{product.price} DH</td>

                                    {/* Colonne Quantité avec badge coloré :
                                        - Rouge si quantité < 5 (stock faible)
                                        - Vert si quantité ≥ 5 (stock OK) */}
                                    <td>
                                        <span className={`qty-badge ${product.quantity < 5 ? 'low' : 'ok'}`}>
                                            {product.quantity}
                                        </span>
                                    </td>

                                    {/* Colonne Actions : Modifier et Supprimer */}
                                    <td>
                                        <div className="actions-cell">
                                            {/* Lien vers le formulaire d'édition */}
                                            <Link to={`/products/${product.id}/edit`} className="btn-action">
                                                {t('products.edit')}
                                            </Link>

                                            {/* Bouton de suppression — désactivé pendant la mutation */}
                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDelete(product.id, product.name)}
                                                disabled={deleting}
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