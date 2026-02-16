import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { loginSchema } from '../schemas/authSchema';
import { LOGIN_MUTATION } from '../queries';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [login, { loading }] = useMutation(LOGIN_MUTATION);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        try {
            const response = await login({ variables: data });
            const token = response.data.login.token;

            localStorage.setItem('token', token);
            toast.success('Login successful!');

            setTimeout(() => navigate('/products'), 1000);
        } catch (err) {
            if (err.networkError) {
                toast.error('Server unreachable');
            } else {
                toast.error('Invalid credentials');
            }
        }
    };

    return (
        <div className="login-page">
            <Toaster />
            <div className="login-card">
                <div className="login-card-logo">S</div>
                <h2>Stock Manager</h2>
                <p className="login-card-subtitle">Sign in to your account</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="login-field">
                        <label>Username</label>
                        <input {...register('username')} placeholder="Enter your username" />
                        {errors.username && <p className="field-error">{errors.username.message}</p>}
                    </div>

                    <div className="login-field">
                        <label>Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="field-error">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={!isValid || loading}
                    >
                        {loading ? 'Connecting...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;