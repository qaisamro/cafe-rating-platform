import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getStats } from '../services/adminService';

const StatCard = ({ label, value, icon, color, trend }) => (
    <div className="stat-card animate-slideUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: `${color}18`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '24px'
            }}>{icon}</div>
            {trend !== undefined && (
                <span className={`badge ${trend >= 0 ? 'badge-success' : 'badge-danger'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
            )}
        </div>
        <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '8px' }}>
            {value ?? <div className="skeleton" style={{ height: '36px', width: '80px' }} />}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>{label}</div>
        <div style={{ height: '3px', borderRadius: '99px', marginTop: '20px', background: `${color}30` }}>
            <div style={{ height: '100%', width: '65%', background: color, borderRadius: '99px' }} />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getStats()
            .then(res => setStats(res.data))
            .catch(() => setStats({ totalUsers: '--', totalCafes: '--', totalReviews: '--', pendingReviews: '--' }));
    }, []);

    return (
        <Layout>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">لوحة القيادة</h1>
                    <p className="page-subtitle">مرحباً! إليك ملخص شامل لأداء المنصة اليوم.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-ghost btn-sm">تصدير تقرير</button>
                    <button className="btn-primary btn-sm">+ إضافة جديدة</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <StatCard label="إجمالي المستخدمين" value={stats?.totalUsers} icon="👥" color="var(--primary)" trend={12} />
                <StatCard label="المقاهي المسجلة" value={stats?.totalCafes} icon="☕" color="var(--accent)" trend={8} />
                <StatCard label="التقييمات الكلية" value={stats?.totalReviews} icon="⭐" color="var(--warning)" trend={24} />
                <StatCard label="بانتظار المراجعة" value={stats?.pendingReviews} icon="🛡️" color="var(--danger)" trend={-5} />
            </div>

            {/* Bottom Grid */}
            <div className="two-col">
                {/* Recent Activity */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px' }}>النشاط الأخير</h3>
                        <button className="btn-ghost btn-sm">عرض الكل</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: '✅', text: 'تمت الموافقة على تقييم جديد', time: 'منذ 5 دقائق', color: 'var(--success)' },
                            { icon: '👤', text: 'مستخدم جديد انضم للمنصة', time: 'منذ 20 دقيقة', color: 'var(--primary)' },
                            { icon: '☕', text: 'مقهى جديد في انتظار المراجعة', time: 'منذ ساعة', color: 'var(--warning)' },
                            { icon: '🏆', text: 'تم تفعيل نظام المكافآت', time: 'منذ 3 ساعات', color: 'var(--accent)' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '10px',
                                    background: `${item.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px', flexShrink: 0
                                }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{item.text}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>الإجراءات السريعة</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { icon: '🛡️', label: 'مراجعة التقييمات', color: 'var(--primary)', href: '/moderation' },
                            { icon: '👥', label: 'إدارة المستخدمين', color: 'var(--accent)', href: '/users' },
                            { icon: '☕', label: 'إدارة المقاهي', color: 'var(--warning)', href: '/cafes' },
                            { icon: '📊', label: 'تقرير الأداء', color: 'var(--secondary)', href: '/dashboard' },
                        ].map((a, i) => (
                            <a key={i} href={a.href} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', gap: '12px', padding: '20px',
                                background: `${a.color}0D`, borderRadius: 'var(--radius-lg)',
                                textDecoration: 'none', border: `1px solid ${a.color}20`,
                                transition: 'var(--transition-fast)', cursor: 'pointer'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = `${a.color}20`}
                                onMouseLeave={e => e.currentTarget.style.background = `${a.color}0D`}
                            >
                                <span style={{ fontSize: '28px' }}>{a.icon}</span>
                                <span style={{ fontWeight: '700', fontSize: '13px', color: a.color, textAlign: 'center' }}>{a.label}</span>
                            </a>
                        ))}
                    </div>

                    {/* Platform Health */}
                    <div style={{ marginTop: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>صحة المنصة</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--success)' }}>98%</span>
                        </div>
                        <div className="progress">
                            <div className="progress-bar" style={{ width: '98%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
