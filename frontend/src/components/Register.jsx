import React from 'react';
import Logo from './Logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useRegisterSchema } from '../schemas/authSchema';
import { REGISTER_MUTATION } from '../queries';
import './Login.css';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [register, { loading }] = useMutation(REGISTER_MUTATION);
    const registerSchema = useRegisterSchema();

    const {
        register: registerField,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
        defaultValues: {
            role: 'USER'
        }
    });

    const onSubmit = async (data) => {
        try {
            await register({
                variables: {
                    input: {
                        username: data.username,
                        email: data.email,
                        password: data.password,
                        role: data.role
                    }
                }
            });

            toast.success(t('register.success'));
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            if (err.message.includes('already exists')) {
                toast.error(t('register.errorUserExists'));
            } else {
                toast.error(err.message || t('register.errorFailed'));
            }
        }
    };

    return (
        <div className="login-page">
            <Toaster />
            <div className="login-container">
                {/* Left Panel - Form */}
                <div className="login-form-panel">
                    <Logo size="medium" />
                    <h2>{t('register.title').toUpperCase()}</h2>
                    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="login-field">
                            <input
                                {...registerField('username')}
                                placeholder={t('register.usernamePlaceholder')}
                            />
                            {errors.username && <p className="field-error">{errors.username.message}</p>}
                        </div>

                        <div className="login-field">
                            <input
                                type="email"
                                {...registerField('email')}
                                placeholder={t('register.emailPlaceholder')}
                            />
                            {errors.email && <p className="field-error">{errors.email.message}</p>}
                        </div>

                        <div className="login-field">
                            <input
                                type="password"
                                {...registerField('password')}
                                placeholder={t('register.passwordPlaceholder')}
                            />
                            {errors.password && <p className="field-error">{errors.password.message}</p>}
                        </div>

                        <div className="login-field">
                            <select {...registerField('role')} className="role-select">
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                            {errors.role && <p className="field-error">{errors.role.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={!isValid || loading}
                        >
                            {loading ? t('register.loading') : t('register.submit')}
                        </button>

                        <p className="auth-link">
                            {t('register.haveAccount')} <Link to="/login">{t('register.loginLink')}</Link>
                        </p>
                    </form>
                </div>

                {}
                <div className="login-illustration-panel">
                    <svg className="login-illustration" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                        {}
                        <path d="M380 80 L420 60 L400 100 Z" fill="#3b82f6" />
                        <path d="M380 80 L420 60 L410 80 Z" fill="#60a5fa" opacity="0.7" />

                        {}
                        <path d="M410 70 Q 380 120, 320 140" stroke="#999" strokeWidth="2" strokeDasharray="5,5" fill="none" />

                        {}
                        <rect x="200" y="120" width="140" height="220" rx="15" fill="#1e293b" />
                        <rect x="210" y="130" width="120" height="200" rx="10" fill="#334155" />

                        {}
                        <circle cx="270" cy="180" r="25" fill="#fff" />
                        <circle cx="270" cy="175" r="12" fill="#333" />
                        <path d="M245 200 Q270 190, 295 200" fill="#333" />

                        {}
                        <rect x="220" y="220" width="100" height="8" rx="4" fill="#fff" />
                        <circle cx="230" cy="224" r="2" fill="#333" />
                        <circle cx="238" cy="224" r="2" fill="#333" />
                        <circle cx="246" cy="224" r="2" fill="#333" />

                        <rect x="220" y="240" width="100" height="8" rx="4" fill="#fff" />
                        <circle cx="230" cy="244" r="2" fill="#333" />
                        <circle cx="238" cy="244" r="2" fill="#333" />
                        <circle cx="246" cy="244" r="2" fill="#333" />

                        {}
                        <circle cx="360" cy="160" r="20" fill="#E0E0E0" opacity="0.5" />
                        <circle cx="360" cy="160" r="12" fill="#fff" />

                        {}
                        <ellipse cx="160" cy="420" rx="15" ry="5" fill="#333" opacity="0.2" />
                        <rect x="150" y="350" width="20" height="70" rx="10" fill="#3b82f6" />
                        <circle cx="160" cy="330" r="18" fill="#333" />
                        <path d="M145 360 L130 390 L140 390" fill="#333" strokeWidth="8" strokeLinecap="round" />
                        <path d="M175 360 L190 390 L180 390" fill="#333" strokeWidth="8" strokeLinecap="round" />

                        {}
                        <ellipse cx="360" cy="420" rx="20" ry="5" fill="#333" opacity="0.2" />
                        <circle cx="360" cy="360" r="18" fill="#333" />
                        <rect x="350" y="375" width="20" height="30" rx="10" fill="#3b82f6" />
                        <rect x="340" y="405" width="15" height="20" fill="#333" />
                        <rect x="365" y="405" width="15" height="20" fill="#333" />

                        {}
                        <rect x="330" y="395" width="60" height="3" fill="#666" />
                        <rect x="325" y="385" width="70" height="10" rx="2" fill="#444" />

                        {}
                        <ellipse cx="420" cy="430" rx="12" ry="8" fill="#64748b" />
                        <rect x="415" y="430" width="10" height="15" fill="#475569" />
                        <path d="M410 425 Q420 415, 430 425" fill="#475569" />
                        <path d="M412 430 Q420 422, 428 430" fill="#64748b" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Register;
