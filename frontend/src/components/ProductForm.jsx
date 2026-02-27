/**
 * ProductForm.jsx — Formulaire de création et de modification d'un produit.
 *
 * Ce composant fonctionne en deux modes selon l'URL :
 *   - Mode création  : /products/new    → appelle CREATE_PRODUCT
 *   - Mode édition   : /products/:id/edit → charge le produit et appelle UPDATE_PRODUCT
 *
 * Fonctionnalités :
 *   - Validation en temps réel (Zod + react-hook-form)
 *   - Pré-remplissage du formulaire en mode édition
 *   - Gestion des états de chargement et d'erreur
 *   - Notifications toast pour succès/échec
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { GET_PRODUCT_BY_ID, CREATE_PRODUCT, UPDATE_PRODUCT, GET_PRODUCTS } from '../queries';
import LoadingSpinner from './LoadingSpinner';
import { isInfraError, isAuthError } from '../utils/errorUtils';
import './ProductForm.css';

/**
 * ProductForm — Composant formulaire produit (création / édition).
 *
 * Détection du mode : la présence du paramètre `:id` dans l'URL
 * détermine automatiquement si on est en mode création ou édition.
 */
const ProductForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();           // Paramètre URL — présent uniquement en mode édition
    const navigate = useNavigate();
    const isEditMode = !!id;              // true si URL contient un :id (mode édition)
    const productId = id ? parseInt(id, 10) : null;

    // ─── Schéma de validation Zod ────────────────────────────────────────────
    // Validations métier : nom ≥ 2 chars, prix ≥ 0, quantité entière ≥ 0
    const productSchema = z.object({
        name: z.string().min(2, t('validation.nameMin')),
        description: z.string().optional().or(z.literal('')),   // Champ optionnel
        price: z.number({ invalid_type_error: t('validation.priceRequired') }).min(0, t('validation.priceMin')),
        quantity: z.number({ invalid_type_error: t('validation.quantityRequired') }).int(t('validation.quantityInt')).min(0, t('validation.quantityMin')),
    });

    // ─── Initialisation du formulaire ────────────────────────────────────────
    const {
        register,       // Lie les inputs
        handleSubmit,   // Wrapper de soumission (valide avant d'appeler onSubmit)
        reset,          // Pré-remplit le formulaire en mode édition
        formState: { errors, isValid, isSubmitting },
    } = useForm({
        resolver: zodResolver(productSchema),
        mode: 'onChange',   // Validation en temps réel
    });


    // ─── Chargement du produit en mode édition ───────────────────────────────
    // La query est ignorée (skip) en mode création pour éviter un appel inutile.
    // Les erreurs d'auth/infra sont gérées globalement par l'errorLink de main.jsx
    const { data: productData, loading: fetchLoading, error: fetchError } = useQuery(GET_PRODUCT_BY_ID, {
        variables: { id: productId },
        skip: !isEditMode,  // Ne pas exécuter la query en mode création
    });

    // ─── Pré-remplissage du formulaire après chargement ──────────────────────
    // useEffect se déclenche quand les données du produit arrivent.
    // reset() injecte les valeurs dans le formulaire sans re-render.
    useEffect(() => {
        if (productData?.productById) {
            const p = productData.productById;
            reset({
                name: p.name,
                description: p.description || '',
                price: parseFloat(p.price),
                quantity: p.quantity,
            });
        }
    }, [productData, reset]);

    // ─── Mutation : Créer un produit ─────────────────────────────────────────
    // Après création : rafraîchit la liste (refetchQueries) et redirige
    const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
        refetchQueries: [{ query: GET_PRODUCTS }],  // Met à jour le cache Apollo
        onCompleted: () => {
            toast.success(t('productForm.createSuccess'));
            setTimeout(() => navigate('/products'), 800);
        },
        onError: (err) => {
            // Les erreurs d'auth et d'infra sont déjà gérées par errorLink
            if (!isAuthError(err) && !isInfraError(err)) {
                toast.error(err.message || t('productForm.createFailed'));
            }
        },
    });

    // ─── Mutation : Modifier un produit ──────────────────────────────────────
    const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT, {
        refetchQueries: [{ query: GET_PRODUCTS }],
        onCompleted: () => {
            toast.success(t('productForm.updateSuccess'));
            setTimeout(() => navigate('/products'), 800);
        },
        onError: (err) => {
            if (!isAuthError(err) && !isInfraError(err)) {
                toast.error(err.message || t('productForm.updateFailed'));
            }
        },
    });

    // État de sauvegarde : vrai si création OU mise à jour en cours
    const isSaving = creating || updating;

    /**
     * onSubmit — Gère la soumission du formulaire.
     *
     * Construit l'objet input et appelle la bonne mutation selon le mode.
     * @param {object} data - Données validées par Zod
     */
    const onSubmit = async (data) => {
        const input = {
            name: data.name,
            description: data.description || null,  // null si champ vide
            price: data.price,
            quantity: data.quantity,
        };

        if (isEditMode) {
            // Mode édition : inclut l'ID du produit à modifier
            await updateProduct({ variables: { id: productId, input } });
        } else {
            // Mode création : pas d'ID nécessaire
            await createProduct({ variables: { input } });
        }
    };

    // ─── États de rendu conditionnels ────────────────────────────────────────

    // Affiche un spinner pendant le chargement du produit (mode édition uniquement)
    if (isEditMode && fetchLoading) {
        return <LoadingSpinner text={t('productForm.loading')} />;
    }

    // Affiche un message "non trouvé" si le produit n'existe plus en base
    if (isEditMode && fetchError && fetchError.message.includes('not found')) {
        return (
            <div className="not-found">
                <h3>{t('productForm.notFoundTitle')}</h3>
                <p>{t('productForm.notFoundDescription')}</p>
                <Link to="/products">{t('productForm.backToProducts')}</Link>
            </div>
        );
    }

    return (
        <div className="product-form-container">
            {/* Titre dynamique selon le mode */}
            <h2>{isEditMode ? t('productForm.editTitle') : t('productForm.createTitle')}</h2>

            <div className="product-form">
                <form onSubmit={handleSubmit(onSubmit)}>

                    {/* ── Champ : Nom du produit ── */}
                    <div className="form-field">
                        <label htmlFor="name">{t('productForm.nameLabel')}</label>
                        <input
                            id="name"
                            {...register('name')}
                            placeholder={t('productForm.namePlaceholder')}
                        />
                        {errors.name && <p className="field-error">{errors.name.message}</p>}
                    </div>

                    {/* ── Champ : Description (optionnel) ── */}
                    <div className="form-field">
                        <label htmlFor="description">{t('productForm.descriptionLabel')}</label>
                        <textarea
                            id="description"
                            {...register('description')}
                            placeholder={t('productForm.descriptionPlaceholder')}
                            rows={3}
                        />
                    </div>

                    {/* ── Champ : Prix (nombre décimal, step 0.01) ── */}
                    <div className="form-field">
                        <label htmlFor="price">{t('productForm.priceLabel')}</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            {...register('price', { valueAsNumber: true })}   // Convertit en nombre
                            placeholder={t('productForm.pricePlaceholder')}
                        />
                        {errors.price && <p className="field-error">{errors.price.message}</p>}
                    </div>

                    {/* ── Champ : Quantité (entier uniquement) ── */}
                    <div className="form-field">
                        <label htmlFor="quantity">{t('productForm.quantityLabel')}</label>
                        <input
                            id="quantity"
                            type="number"
                            {...register('quantity', { valueAsNumber: true })}
                            placeholder={t('productForm.quantityPlaceholder')}
                        />
                        {errors.quantity && <p className="field-error">{errors.quantity.message}</p>}
                    </div>

                    {/* ── Actions : Annuler / Soumettre ── */}
                    <div className="form-actions">
                        {/* Bouton Annuler → retourne à la liste sans sauvegarder */}
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/products')}
                        >
                            {t('productForm.cancel')}
                        </button>

                        {/* Bouton Soumettre — désactivé si formulaire invalide ou sauvegarde en cours */}
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={!isValid || isSaving}
                        >
                            {isSaving && <span className="btn-spinner" aria-hidden="true" />}
                            {isSaving ? t('productForm.saving') : (isEditMode ? t('productForm.update') : t('productForm.create'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
