import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './i18n/i18n';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import toast from 'react-hot-toast';

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const getMsg = (key) => {
  try {
    const lng = localStorage.getItem('i18nextLng') || 'en';
    const messages = {
      en: { forbidden: 'Access denied', networkError: 'Server unreachable' },
      fr: { forbidden: 'Accès refusé', networkError: 'Serveur inaccessible' },
    };
    return (messages[lng] || messages.en)[key];
  } catch {
    const fallback = { forbidden: 'Access denied', networkError: 'Server unreachable' };
    return fallback[key];
  }
};

import { isInfraError, isAuthError } from './utils/errorUtils';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const gqlError of graphQLErrors) {
      if (isAuthError(gqlError)) {
        const msg = (gqlError.message || '').toLowerCase();

        if (msg.includes('unauthorized') || msg.includes('401')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        toast.error(getMsg('forbidden'));
        return;
      }

      if (isInfraError(gqlError)) {
        toast.error(getMsg('networkError'));
        return;
      }
    }
  }

  if (networkError) {
    toast.error(getMsg('networkError'));
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <ThemeProvider>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
