import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { loginSchema } from '../schemas/authSchema';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      token
    }
  }
`;

const Login = () => {
    const navigate = useNavigate();
    const [login, { loading }] = useMutation(LOGIN_MUTATION);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange', // Permet de désactiver le bouton en temps réel
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
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd' }}>
            <Toaster />
            <h2>Login</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Username</label>
                    <input
                        {...register('username')}
                        style={{ width: '100%', display: 'block', padding: '8px' }}
                    />
                    {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        {...register('password')}
                        style={{ width: '100%', display: 'block', padding: '8px' }}
                    />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={!isValid || loading}
                    style={{ width: '100%', padding: '10px', cursor: isValid ? 'pointer' : 'not-allowed' }}
                >
                    {loading ? 'Connecting...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;