import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

// Define schema directly here for now as requested
const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.number().min(0.01, "Price must be greater than 0"),
    quantity: z.number().int().min(0, "Quantity must be non-negative"),
});

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isSubmitting },
    } = useForm({
        resolver: zodResolver(productSchema),
        mode: 'onChange',
    });

    // Placeholder for fetching data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            // Simulate fetching data
            console.log(`Fetching product with id: ${id}`);
            // In a real app, you would query Apollo here
            // setValue('name', 'Existing Product');
            // setValue('price', 100);
            // setValue('quantity', 5);
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data) => {
        try {
            console.log('Form Submitted:', data);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
            setTimeout(() => navigate('/products'), 1500);
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to submit form');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Toaster />
            <h2>{isEditMode ? 'Edit Product' : 'Create New Product'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* Name Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Product Name</label>
                    <input
                        id="name"
                        {...register('name')}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        placeholder="e.g. Awesome Gadget"
                    />
                    {errors.name && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.name.message}</p>}
                </div>

                {/* Price Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="price" style={{ display: 'block', marginBottom: '5px' }}>Price (€)</label>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        placeholder="0.00"
                    />
                    {errors.price && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.price.message}</p>}
                </div>

                {/* Quantity Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="quantity" style={{ display: 'block', marginBottom: '5px' }}>Quantity</label>
                    <input
                        id="quantity"
                        type="number"
                        {...register('quantity', { valueAsNumber: true })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        placeholder="0"
                    />
                    {errors.quantity && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.quantity.message}</p>}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        style={{ flex: 1, padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: isValid && !isSubmitting ? '#1890ff' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ProductForm;
