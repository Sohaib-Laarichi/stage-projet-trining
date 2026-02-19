import React from 'react';
import Logo from './Logo';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useLoginSchema } from '../schemas/authSchema';
import { LOGIN_MUTATION } from '../queries';
import './Login.css';
import './LoadingSpinner.css';
import { isInfraError } from '../utils/errorUtils';
import { isAuthError } from '../utils/errorUtils';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [login, { loading }] = useMutation(LOGIN_MUTATION);
    const loginSchema = useLoginSchema();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });


    const pingBackend = async () => {
        try {
            const res = await fetch('http://localhost:8000/health', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(3000),
            });
            return res.ok;
        } catch {
            return false;
        }
    };



    // ... (inside component)

    const onSubmit = async (data) => {

        const reachable = await pingBackend();
        if (!reachable) {
            toast.error(t('login.errorServerUnreachable'));
            return;
        }

        try {
            const response = await login({ variables: data });
            const token = response?.data?.login?.token;

            if (token) {
                localStorage.setItem('token', token);
                toast.success(t('login.success'));
                setTimeout(() => navigate('/products'), 1000);
            }
        } catch (err) {
            // Check if it's an infra error (DB down, Network Error) already handled by global errorLink
            if (!isInfraError(err)) {
                toast.error(t('login.errorInvalidCredentials'));
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Panel - Form */}
                <div className="login-form-panel">
                    <Logo size="medium" />
                    <h2>WELCOME</h2>
                    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="login-field">
                            <input
                                {...register('username')}
                                placeholder={t('login.username')}
                            />
                            {errors.username && <p className="field-error">{errors.username.message}</p>}
                        </div>

                        <div className="login-field">
                            <input
                                type="password"
                                {...register('password')}
                                placeholder={t('login.password')}
                            />
                            {errors.password && <p className="field-error">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={!isValid || loading}
                        >
                            {loading && <span className="btn-spinner" aria-hidden="true" />}
                            {loading ? t('login.loading') : t('login.submit')}
                        </button>

                        <p className="auth-link">
                            Don't have an account? <Link to="/register">Sign up here</Link>
                        </p>
                    </form>
                </div>

                {/* Right Panel - Illustration */}
                <div className="login-illustration-panel">
                    <svg className="login-illustration" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                        {/* Paper airplane */}
                        <path d="M380 80 L420 60 L400 100 Z" fill="#2196F3" />
                        <path d="M380 80 L420 60 L410 80 Z" fill="#29B6F6" opacity="0.7" />

                        {/* Dotted path */}
                        <path d="M410 70 Q 380 120, 320 140" stroke="#999" strokeWidth="2" strokeDasharray="5,5" fill="none" />

                        {/* Phone/Screen */}
                        <rect x="200" y="120" width="140" height="220" rx="15" fill="#2196F3" />
                        <rect x="210" y="130" width="120" height="200" rx="10" fill="#29B6F6" />

                        {/* User icon on screen */}
                        <circle cx="270" cy="180" r="25" fill="#fff" />
                        <circle cx="270" cy="175" r="12" fill="#333" />
                        <path d="M245 200 Q270 190, 295 200" fill="#333" />

                        {/* Password fields on screen */}
                        <rect x="220" y="220" width="100" height="8" rx="4" fill="#fff" />
                        <circle cx="230" cy="224" r="2" fill="#333" />
                        <circle cx="238" cy="224" r="2" fill="#333" />
                        <circle cx="246" cy="224" r="2" fill="#333" />

                        <rect x="220" y="240" width="100" height="8" rx="4" fill="#fff" />
                        <circle cx="230" cy="244" r="2" fill="#333" />
                        <circle cx="238" cy="244" r="2" fill="#333" />
                        <circle cx="246" cy="244" r="2" fill="#333" />

                        {/* Gear icon */}
                        <circle cx="360" cy="160" r="20" fill="#E0E0E0" opacity="0.5" />
                        <circle cx="360" cy="160" r="12" fill="#fff" />

                        {/* Person standing */}
                        <ellipse cx="160" cy="420" rx="15" ry="5" fill="#333" opacity="0.2" />
                        <rect x="150" y="350" width="20" height="70" rx="10" fill="#4CAF50" />
                        <circle cx="160" cy="330" r="18" fill="#333" />
                        <path d="M145 360 L130 390 L140 390" fill="#333" strokeWidth="8" strokeLinecap="round" />
                        <path d="M175 360 L190 390 L180 390" fill="#333" strokeWidth="8" strokeLinecap="round" />

                        {/* Person sitting */}
                        <ellipse cx="360" cy="420" rx="20" ry="5" fill="#333" opacity="0.2" />
                        <circle cx="360" cy="360" r="18" fill="#333" />
                        <rect x="350" y="375" width="20" height="30" rx="10" fill="#4CAF50" />
                        <rect x="340" y="405" width="15" height="20" fill="#333" />
                        <rect x="365" y="405" width="15" height="20" fill="#333" />

                        {/* Laptop */}
                        <rect x="330" y="395" width="60" height="3" fill="#666" />
                        <rect x="325" y="385" width="70" height="10" rx="2" fill="#444" />

                        {/* Plant */}
                        <ellipse cx="420" cy="430" rx="12" ry="8" fill="#8BC34A" />
                        <rect x="415" y="430" width="10" height="15" fill="#4CAF50" />
                        <path d="M410 425 Q420 415, 430 425" fill="#4CAF50" />
                        <path d="M412 430 Q420 422, 428 430" fill="#66BB6A" />
                    </svg>
                </div>
            </div>
        </div>

    );
};

export default Login;