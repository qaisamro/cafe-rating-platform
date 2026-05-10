import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const Cafes = () => {
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.get(`${API}/cafes`, getAuth())
            .then(res => { setCafes(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = cafes.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.address?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">المقاهي</h1>
                    <p className="page-subtitle">قائمة بجميع المقاهي المسجلة على المنصة ({cafes.length} مقهى)</p>
                </div>
                <div className="search-bar">
                    <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                    <input
                        placeholder="البحث بالاسم أو العنوان..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="stats-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card" style={{ height: '200px' }}>
                            <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />
                            <div className="skeleton" style={{ height: '18px', width: '70%', marginBottom: '10px' }} />
                            <div className="skeleton" style={{ height: '14px', width: '50%' }} />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">☕</div>
                    <h3>لا توجد مقاهي</h3>
                    <p>لم يتم العثور على مقاهٍ تطابق بحثك</p>
                </div>
            ) : (
                <div className="stats-grid animate-slideUp">
                    {filtered.map(cafe => (
                        <div key={cafe.id} className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                height: '130px', background: cafe.image_url
                                    ? `url(${cafe.image_url.startsWith('/') ? 'http://localhost:5000' + cafe.image_url : cafe.image_url}) center/cover`
                                    : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '42px',
                                position: 'relative',
                            }}>
                                {!cafe.image_url && '☕'}
                                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                    <span className="badge badge-success" style={{ background: 'rgba(16,185,129,0.18)', backdropFilter: 'blur(8px)' }}>
                                        نشط
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <h4 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>{cafe.name}</h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {cafe.description || 'لا يوجد وصف متاح لهذا المقهى حتى الآن.'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        📍 {cafe.address || 'غير محدد'}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--warning)', fontSize: '14px' }}>
                                        ⭐ {cafe.rating || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default Cafes;
