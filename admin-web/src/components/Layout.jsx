import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.getAttribute('data-theme') === 'dark'
    );

    const toggleTheme = () => {
        const next = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        setIsDark(!isDark);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const active = (path) => location.pathname === path;

    return (
        <div className="dashboard-layout">
            {/* === Sidebar === */}
            <aside className="dashboard-sidebar">
                {/* Brand */}
                <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px', boxShadow: 'var(--shadow-primary)', flexShrink: 0
                        }}>☕</div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>كافيه كونكت</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>لوحة تحكم المشرف</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <NavItem to="/dashboard" label="لوحة القيادة" icon="📊" active={active('/dashboard')} />
                    <NavItem to="/users" label="المستخدمون" icon="👥" active={active('/users')} />
                    <NavItem to="/cafes" label="المقاهي" icon="☕" active={active('/cafes')} />
                    <NavItem to="/moderation" label="الإشراف" icon="🛡️" active={active('/moderation')} />
                </nav>

                {/* Footer */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={toggleTheme}
                        className="btn-ghost btn-full"
                        style={{ marginBottom: '10px', justifyContent: 'flex-start', gap: '12px' }}
                    >
                        <span>{isDark ? '☀️' : '🌙'}</span>
                        {isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="btn-danger btn-full"
                        style={{ justifyContent: 'flex-start', gap: '12px' }}
                    >
                        <span>🚪</span>
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* === Main Content === */}
            <main className="dashboard-content animate-fadeIn">
                {children}
            </main>
        </div>
    );
};

const NavItem = ({ to, label, icon, active }) => (
    <Link
        to={to}
        className={`nav-item ${active ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
    >
        <span className="nav-item-icon">{icon}</span>
        <span>{label}</span>
    </Link>
);

export default Layout;
