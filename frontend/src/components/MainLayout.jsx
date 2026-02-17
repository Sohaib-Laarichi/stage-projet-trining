import React, { useState } from 'react';
import Logo from './Logo';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import './MainLayout.css';

const MainLayout = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleLang = () => {
        const newLang = i18n.language === 'en' ? 'fr' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('lang', newLang);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success(t('menu.logoutSuccess'));
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(prev => !prev);


    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/products/new') return t('nav.newProduct');
        if (path.includes('/edit')) return t('nav.editProduct');
        if (path === '/products') return t('nav.products');
        return t('nav.dashboard');
    };

    return (
        <div className="layout">
            <Toaster position="top-right" />

            { }
            <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <Logo size="small" />
                    <span className="sidebar-brand">Stock Manager</span>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-label">{t('menu.menu')}</span>

                    <NavLink
                        to="/products"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}

                    >
                        <span className="nav-item-label">{t('menu.products')}</span>
                    </NavLink>

                    <span className="nav-section-label">{t('menu.preferences')}</span>

                    <button className="nav-item" onClick={toggleTheme}>
                        <span className="nav-item-label">
                            {theme === 'dark' ? t('menu.darkMode') : t('menu.lightMode')}
                        </span>
                        <span
                            className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                            aria-label="Toggle theme"
                        />
                    </button>

                    <button className="nav-item" onClick={toggleLang}>
                        <span className="nav-item-label">{t('menu.language')}</span>
                        <span className="nav-item-badge">{i18n.language.toUpperCase()}</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="nav-item-label">{t('menu.logout')}</span>
                    </button>
                </div>
            </aside>



            { }
            <main className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
