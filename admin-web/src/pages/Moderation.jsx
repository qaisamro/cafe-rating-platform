import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getPendingReviews, moderateReview } from '../services/adminService';

const Moderation = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { loadReviews(); }, []);

    const loadReviews = () => {
        setLoading(true);
        getPendingReviews().then(res => { setReviews(res.data); setLoading(false); }).catch(() => setLoading(false));
    };

    const handleModerate = async (id, approved) => {
        try { await moderateReview(id, approved); loadReviews(); } catch { }
    };

    const stars = (n) => '⭐'.repeat(Math.min(n, 5));

    return (
        <Layout>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">الإشراف على التقييمات</h1>
                    <p className="page-subtitle">مراجعة وتصفية آراء المجتمع</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { key: 'all', label: 'الكل', count: reviews.length },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={filter === f.key ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
                        >
                            {f.label}
                            {f.count > 0 && (
                                <span style={{
                                    background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--primary-light)',
                                    color: filter === f.key ? 'white' : 'var(--primary)',
                                    borderRadius: 'var(--radius-full)', padding: '1px 8px',
                                    fontSize: '11px', marginRight: '8px', fontWeight: '700'
                                }}>{f.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews Grid */}
            {loading ? (
                <div className="stats-grid">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card" style={{ height: '200px' }}>
                            <div className="skeleton" style={{ height: '20px', width: '50%', marginBottom: '16px' }} />
                            <div className="skeleton" style={{ height: '60px', marginBottom: '16px' }} />
                            <div className="skeleton" style={{ height: '36px' }} />
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">✨</div>
                    <h3>كل شيء نظيف!</h3>
                    <p>لا توجد تقييمات بانتظار المراجعة في الوقت الحالي</p>
                </div>
            ) : (
                <div className="stats-grid animate-slideUp" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {reviews.map(review => (
                        <div key={review.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div className="avatar avatar-circle avatar-md avatar-placeholder">
                                        {review.user_name?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{review.user_name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{review.cafe_name}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ color: 'var(--warning)', fontSize: '14px' }}>{stars(review.rating)}</span>
                                    <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '15px' }}> {review.rating}</span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div style={{
                                background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                                padding: '16px', fontStyle: 'italic',
                                color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px',
                                borderRight: '3px solid var(--primary)'
                            }}>
                                "{review.comment}"
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="btn-approve"
                                    style={{ flex: 1 }}
                                    onClick={() => handleModerate(review.id, true)}
                                >
                                    ✅ قبول ونشر
                                </button>
                                <button
                                    className="btn-reject"
                                    style={{ flex: 1 }}
                                    onClick={() => handleModerate(review.id, false)}
                                >
                                    ✕ رفض
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default Moderation;
