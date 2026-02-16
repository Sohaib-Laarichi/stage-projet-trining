import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import './MainLayout.css';

const MainLayout = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'EN');

    const toggleLang = () => {
        const newLang = lang === 'EN' ? 'FR' : 'EN';
        setLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    // Determine page title from current route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/products/new') return 'New Product';
        if (path.includes('/edit')) return 'Edit Product';
        if (path === '/products') return 'Products';
        return 'Dashboard';
    };

    return (
        <div className="layout">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">S</div>
                    <span className="sidebar-brand">Stock Manager</span>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-label">Menu</span>

                    <NavLink
                        to="/products"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}

                    >
                        <span className="nav-item-label">Products</span>
                    </NavLink>

                    <span className="nav-section-label">Preferences</span>

                    <button className="nav-item" onClick={toggleTheme}>
                        <span className="nav-item-label">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        <button
                            className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                            aria-label="Toggle theme"
                        />
                    </button>

                    <button className="nav-item" onClick={toggleLang}>
                        <span className="nav-item-label">Language</span>
                        <span className="nav-item-badge">{lang}</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="nav-item-label">Logout</span>
                    </button>
                </div>
            </aside>

            

            {/* Main content */}
            <main className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
