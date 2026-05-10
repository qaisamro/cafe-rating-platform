import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getUsers, createOwner, updateUser, deleteUser } from '../services/adminService';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Forms state
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
    const [editForm, setEditForm] = useState({ id: null, name: '', email: '', role: '', points: 0 });
    const [userToDelete, setUserToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createOwner({ ...createForm, role: 'owner' });
            setShowCreateModal(false);
            setCreateForm({ name: '', email: '', password: '' });
            fetchUsers();
        } catch { } finally { setSubmitting(false); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateUser(editForm.id, editForm);
            setShowEditModal(false);
            fetchUsers();
        } catch { } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        setSubmitting(true);
        try {
            await deleteUser(userToDelete.id);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers();
        } catch { } finally { setSubmitting(false); }
    };

    const openEdit = (user) => {
        setEditForm({ id: user.id, name: user.name, email: user.email, role: user.role, points: user.points || 0 });
        setShowEditModal(true);
    };

    const openDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const roleLabel = (r) => ({
        admin: { label: 'مشرف', cls: 'badge-danger' },
        owner: { label: 'مالك', cls: 'badge-primary' },
        user: { label: 'مستخدم', cls: 'badge-muted' },
    }[r] || { label: r, cls: 'badge-muted' });

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">المستخدمون</h1>
                    <p className="page-subtitle">إدارة جميع حسابات المنصة ({users.length} حساب)</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="search-bar">
                        <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>🔍</span>
                        <input
                            placeholder="البحث بالاسم أو البريد..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ إضافة مالك</button>
                </div>
            </div>

            <div className="table-container animate-slideUp">
                <table>
                    <thead>
                        <tr>
                            <th>المستخدم</th>
                            <th>البريد الإلكتروني</th>
                            <th>الدور</th>
                            <th>النقاط</th>
                            <th style={{ textAlign: 'center' }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j}><div className="skeleton" style={{ height: '20px', width: j === 0 ? '160px' : '100px' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="5">
                                <div className="empty-state">
                                    <div className="empty-state-icon">👤</div>
                                    <h3>لا يوجد مستخدمون</h3>
                                    <p>لم يتم العثور على نتائج تطابق البحث</p>
                                </div>
                            </td></tr>
                        ) : filtered.map(user => (
                            <tr key={user.id} className="table-row-hover">
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="avatar avatar-circle avatar-md avatar-placeholder">
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '13px' }}>{user.email}</td>
                                <td><span className={`badge ${roleLabel(user.role).cls}`}>{roleLabel(user.role).label}</span></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: 'var(--warning)', fontSize: '14px' }}>⭐</span>
                                        <span style={{ fontWeight: '700' }}>{user.points ?? 0}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button className="btn-ghost" onClick={() => openEdit(user)} style={{ padding: '8px', color: 'var(--secondary)' }}>✏️</button>
                                        <button className="btn-ghost" onClick={() => openDelete(user)} style={{ padding: '8px', color: 'var(--danger)' }}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* === Create Modal === */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h3 style={{ fontSize: '22px' }}>🏪 إضافة صاحب مقهى</h3>
                            <button className="btn-ghost btn-icon" onClick={() => setShowCreateModal(false)} style={{ fontSize: '18px' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="input-group">
                                <label className="input-label">الاسم الكامل</label>
                                <input placeholder="أحمد محمد" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">البريد الإلكتروني</label>
                                <input type="email" placeholder="owner@cafe.com" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">كلمة المرور</label>
                                <input type="password" placeholder="••••••••" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="btn-ghost btn-full" onClick={() => setShowCreateModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary btn-full" disabled={submitting}>
                                    {submitting ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === Edit Modal === */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h3 style={{ fontSize: '22px' }}>✏️ تعديل بيانات المستخدم</h3>
                            <button className="btn-ghost btn-icon" onClick={() => setShowEditModal(false)} style={{ fontSize: '18px' }}>✕</button>
                        </div>
                        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="input-group">
                                <label className="input-label">الاسم الكامل</label>
                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">البريد الإلكتروني</label>
                                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">الدور (Role)</label>
                                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} required>
                                    <option value="user">مستخدم عادي</option>
                                    <option value="owner">مالك مقهى</option>
                                    <option value="admin">مشرف منصة</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">النقاط</label>
                                <input type="number" value={editForm.points} onChange={e => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="btn-ghost btn-full" onClick={() => setShowEditModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary btn-full" disabled={submitting}>
                                    {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === Delete Modal === */}
            {showDeleteModal && userToDelete && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '48px', color: 'var(--danger)' }}>⚠️</div>
                            <h3 style={{ fontSize: '22px', fontWeight: '800' }}>حذف المستخدم نهائياً؟</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                هل أنت متأكد من حذف الحساب <strong>{userToDelete.name}</strong>؟<br />
                                سيتم حذف جميع تعليقاته، نقاطه، والمقاهي التابعة له (إن وُجدت) بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
                                <button type="button" className="btn-ghost btn-full" onClick={() => setShowDeleteModal(false)}>إلغاء الأمر</button>
                                <button type="button" onClick={handleDelete} disabled={submitting}
                                    style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '12px', fontWeight: '700', width: '100%', cursor: 'pointer' }}>
                                    {submitting ? 'جاري الحذف...' : 'نعم، احذف الحساب'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Users;
