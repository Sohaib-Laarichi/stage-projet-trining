import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { GET_PRODUCT_BY_ID, CREATE_PRODUCT, UPDATE_PRODUCT, GET_PRODUCTS } from '../queries';
import './ProductForm.css';

const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().or(z.literal('')),
    price: z.number({ invalid_type_error: 'Price is required' }).min(0, 'Price must be >= 0'),
    quantity: z.number({ invalid_type_error: 'Quantity is required' }).int('Must be a whole number').min(0, 'Quantity must be >= 0'),
});

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const productId = id ? parseInt(id, 10) : null;

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm({
        resolver: zodResolver(productSchema),
        mode: 'onChange',
    });

    // Fetch product for edit mode
    const { data: productData, loading: fetchLoading, error: fetchError } = useQuery(GET_PRODUCT_BY_ID, {
        variables: { id: productId },
        skip: !isEditMode,
        onError: (err) => {
            if (err.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        },
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
            toast.success('Product created successfully');
            setTimeout(() => navigate('/products'), 800);
        },
        onError: (err) => {
            toast.error(err.message || 'Create product failed');
        },
    });

    const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT, {
        refetchQueries: [{ query: GET_PRODUCTS }],
        onCompleted: () => {
            toast.success('Product updated successfully');
            setTimeout(() => navigate('/products'), 800);
        },
        onError: (err) => {
            toast.error(err.message || 'Update failed');
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

    // Loading state for edit mode fetch
    if (isEditMode && fetchLoading) {
        return (
            <div className="spinner-container">
                <div className="spinner" />
                <span className="spinner-text">Loading product...</span>
            </div>
        );
    }

    // Product not found
    if (isEditMode && fetchError && fetchError.message.includes('not found')) {
        return (
            <div className="not-found">
                <h3>Product not found</h3>
                <p>The product you're looking for doesn't exist.</p>
                <Link to="/products">← Back to Products</Link>
            </div>
        );
    }

    return (
        <div className="product-form-container">
            <Toaster position="top-right" />
            <h2>{isEditMode ? 'Edit Product' : 'Create Product'}</h2>

            <div className="product-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-field">
                        <label htmlFor="name">Product Name *</label>
                        <input
                            id="name"
                            {...register('name')}
                            placeholder="e.g. Awesome Gadget"
                        />
                        {errors.name && <p className="field-error">{errors.name.message}</p>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            {...register('description')}
                            placeholder="Optional product description"
                            rows={3}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="price">Price (DH) *</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            {...register('price', { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                        {errors.price && <p className="field-error">{errors.price.message}</p>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="quantity">Quantity *</label>
                        <input
                            id="quantity"
                            type="number"
                            {...register('quantity', { valueAsNumber: true })}
                            placeholder="0"
                        />
                        {errors.quantity && <p className="field-error">{errors.quantity.message}</p>}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/products')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={!isValid || isSaving}
                        >
                            {isSaving ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
