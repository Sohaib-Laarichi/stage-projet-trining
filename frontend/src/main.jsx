/**
 * main.jsx — Point d'entrée de l'application React.
 *
 * Ce fichier configure et initialise :
 *   - Le client Apollo (GraphQL) avec gestion des erreurs et du JWT
 *   - Le contexte de thème (dark/light)
 *   - L'internationalisation (i18n)
 *   - Le composant ErrorBoundary pour les erreurs critiques
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './i18n/i18n';           // Initialise i18next (FR/EN)
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import toast from 'react-hot-toast';

// ─── 1. Lien HTTP vers le serveur GraphQL ───────────────────────────────────
// Toutes les requêtes GraphQL sont envoyées à cette URL.
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql',
});

// ─── 2. Lien d'authentification ─────────────────────────────────────────────
// Intercepte chaque requête et y ajoute le JWT (Bearer token) stocké
// dans le localStorage, si l'utilisateur est connecté.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// ─── Helper : récupérer un message traduit sans React Hook ──────────────────
// Utilisé dans errorLink où les hooks React ne sont pas disponibles.
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

// ─── 3. Lien de gestion des erreurs GraphQL ─────────────────────────────────
// Intercepte les erreurs GraphQL et réseau avant qu'elles n'atteignent
// les composants. Gère deux cas :
//   - Erreur d'auth (401/403) → supprime le token et redirige vers /login
//   - Erreur d'infra (serveur indisponible) → affiche un toast
//   - Erreur réseau → affiche un toast
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const gqlError of graphQLErrors) {
      // Vérifie si c'est une erreur d'authentification ou d'autorisation
      if (isAuthError(gqlError)) {
        const msg = (gqlError.message || '').toLowerCase();

        // Token expiré ou invalide → déconnexion forcée
        if (msg.includes('unauthorized') || msg.includes('401')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        // Accès refusé (403) → notifier sans déconnecter
        toast.error(getMsg('forbidden'));
        return;
      }

      // Erreur d'infrastructure (DB down, serveur KO, etc.)
      if (isInfraError(gqlError)) {
        toast.error(getMsg('networkError'));
        return;
      }
    }
  }

  // Erreur réseau pure (pas de connexion au serveur)
  if (networkError) {
    toast.error(getMsg('networkError'));
  }
});

// ─── 4. Création du client Apollo ───────────────────────────────────────────
// Les liens sont chaînés dans l'ordre : errorLink → authLink → httpLink
// Chaque requête passe par ces trois étapes avant d'atteindre le serveur.
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),   // Cache en mémoire pour les résultats
});

// ─── 5. Rendu de l'application ──────────────────────────────────────────────
// L'arbre de providers enveloppe toute l'application :
//   ErrorBoundary  → attrape les erreurs React non gérées
//   ThemeProvider  → fournit le thème (dark/light) à tous les composants
//   ApolloProvider → fournit le client GraphQL à tous les composants
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <ThemeProvider>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
