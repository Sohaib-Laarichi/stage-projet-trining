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

const ProductForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const productId = id ? parseInt(id, 10) : null;

    const productSchema = z.object({
        name: z.string().min(2, t('validation.nameMin')),
        description: z.string().optional().or(z.literal('')),
        price: z.number({ invalid_type_error: t('validation.priceRequired') }).min(0, t('validation.priceMin')),
        quantity: z.number({ invalid_type_error: t('validation.quantityRequired') }).int(t('validation.quantityInt')).min(0, t('validation.quantityMin')),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm({
        resolver: zodResolver(productSchema),
        mode: 'onChange',
    });

    // Fetch product for edit mode
    // Unauthorized/Forbidden handled globally by errorLink.
    const { data: productData, loading: fetchLoading, error: fetchError } = useQuery(GET_PRODUCT_BY_ID, {
        variables: { id: productId },
        skip: !isEditMode,
    });

    // Prefill form when product data is loaded
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

    const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
        refetchQueries: [{ query: GET_PRODUCTS }],
        onCompleted: () => {
            toast.success(t('productForm.createSuccess'));
            setTimeout(() => navigate('/products'), 800);
        },
        onError: (err) => {
            if (!isAuthError(err) && !isInfraError(err)) {
                toast.error(err.message || t('productForm.createFailed'));
            }
        },
    });

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

    const isSaving = creating || updating;

    const onSubmit = async (data) => {
        const input = {
            name: data.name,
            description: data.description || null,
            price: data.price,
            quantity: data.quantity,
        };

        if (isEditMode) {
            await updateProduct({ variables: { id: productId, input } });
        } else {
            await createProduct({ variables: { input } });
        }
    };

    
    if (isEditMode && fetchLoading) {
        return <LoadingSpinner text={t('productForm.loading')} />;
    }

    
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
            <h2>{isEditMode ? t('productForm.editTitle') : t('productForm.createTitle')}</h2>

            <div className="product-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-field">
                        <label htmlFor="name">{t('productForm.nameLabel')}</label>
                        <input
                            id="name"
                            {...register('name')}
                            placeholder={t('productForm.namePlaceholder')}
                        />
                        {errors.name && <p className="field-error">{errors.name.message}</p>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="description">{t('productForm.descriptionLabel')}</label>
                        <textarea
                            id="description"
                            {...register('description')}
                            placeholder={t('productForm.descriptionPlaceholder')}
                            rows={3}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="price">{t('productForm.priceLabel')}</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            {...register('price', { valueAsNumber: true })}
                            placeholder={t('productForm.pricePlaceholder')}
                        />
                        {errors.price && <p className="field-error">{errors.price.message}</p>}
                    </div>

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

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/products')}
                        >
                            {t('productForm.cancel')}
                        </button>
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
