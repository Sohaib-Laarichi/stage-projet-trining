/**
 * App.jsx — Routeur principal de l'application.
 *
 * Définit toutes les routes de l'application et implémente le système
 * de routes protégées (PrivateRoute) basé sur la présence d'un JWT.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import MainLayout from './components/MainLayout';

/**
 * PrivateRoute — Composant gardien pour les routes protégées.
 *
 * Vérifie qu'un token JWT est présent dans le localStorage.
 * Si oui → rend les composants enfants.
 * Si non → redirige automatiquement vers /login.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Le composant à protéger
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

/**
 * App — Composant racine de l'application.
 *
 * Structure des routes :
 *   /login           → Page de connexion (publique)
 *   /register        → Page d'inscription (publique)
 *   /products        → Liste des produits (protégée)
 *   /products/new    → Formulaire de création (protégée)
 *   /products/:id/edit → Formulaire d'édition (protégée)
 *   /               → Redirige vers /login
 *
 * Les routes protégées sont groupées sous MainLayout (sidebar + header).
 */
function App() {
  return (

    <Router>
      {/* Système de notifications toast global — positionné en haut à droite */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { zIndex: 99999 }
        }}
        containerStyle={{ zIndex: 99999 }}
      />
      <Routes>
        {/* ── Routes publiques ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Routes protégées — nécessitent un JWT valide ── */}
        {/* Toutes les routes enfant sont rendues dans le MainLayout (sidebar) */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
        </Route>

        {/* Redirection par défaut vers la page de connexion */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;