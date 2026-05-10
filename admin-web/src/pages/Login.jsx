import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            direction: 'rtl',
        }}>
            {/* Left — Branding Panel */}
            <div style={{
                background: 'linear-gradient(145deg, #4F46E5 0%, #7C3AED 50%, #00C2A8 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', top: '40%', left: '60%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '28px',
                        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '42px', margin: '0 auto 32px', border: '1px solid rgba(255,255,255,0.25)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                    }}>☕</div>
                    <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '900', marginBottom: '16px', lineHeight: 1.2 }}>
                        كافيه كونكت
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: '17px', lineHeight: 1.6, maxWidth: '340px' }}>
                        منصة إدارة المقاهي العربية الأولى — مبنية بمستوى عالمي للسعادة الرقمية.
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '48px' }}>
                        {[['500+', 'مقهى'], ['12K+', 'مستخدم'], ['98%', 'رضا']].map(([num, label]) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ color: 'white', fontSize: '26px', fontWeight: '900' }}>{num}</div>
                                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '4px' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Login Form */}
            <div style={{
                background: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 48px',
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }} className="animate-slideUp">
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)' }}>
                            مرحباً بعودتك 👋
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                            سجل دخولك للوصول إلى لوحة التحكم
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'var(--danger-light)', color: 'var(--danger)',
                            padding: '12px 18px', borderRadius: 'var(--radius-md)',
                            marginBottom: '24px', fontWeight: '600', fontSize: '14px',
                            border: '1px solid rgba(239,68,68,0.2)',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label className="input-label">البريد الإلكتروني</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    placeholder="admin@cafe.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">كلمة المرور</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔐</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary btn-full btn-xl"
                            disabled={loading}
                            style={{ marginTop: '8px', fontSize: '16px' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                    جاري التحقق...
                                </span>
                            ) : 'تسجيل الدخول ←'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '32px' }}>
                        هذه اللوحة مخصصة للمشرفين والإدارة فقط
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
    );
};

export default Login;
