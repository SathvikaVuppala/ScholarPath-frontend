import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { applicationApi } from '../services/api';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = [
    { value: 'NOT_STARTED', label: '⭕ Not Started', badgeClass: 'badge-gray' },
    { value: 'IN_PROGRESS', label: '🔄 In Progress', badgeClass: 'badge-yellow' },
    { value: 'SUBMITTED', label: '✅ Submitted', badgeClass: 'badge-green' },
];

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyApplications() {
    const { studentId } = useStudent();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [deleting, setDeleting] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (!studentId) { setLoading(false); return; }
        const load = async () => {
            setLoading(true);
            try {
                const res = await applicationApi.getByStudent(studentId);
                setApps(res.data);
                setError('');
            } catch {
                setError('Could not load applications. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentId]);

    const handleStatusChange = async (app, newStatus) => {
        setUpdating(prev => ({ ...prev, [app.id]: true }));
        try {
            const res = await applicationApi.updateStatus(app.id, newStatus);
            setApps(prev => prev.map(a => a.id === app.id ? res.data : a));
        } catch {
            setError('Could not update status.');
        } finally {
            setUpdating(prev => ({ ...prev, [app.id]: false }));
        }
    };

    const handleDelete = async (appId) => {
        if (!window.confirm('Remove this application from your tracker?')) return;
        setDeleting(prev => ({ ...prev, [appId]: true }));
        try {
            await applicationApi.delete(appId);
            setApps(prev => prev.filter(a => a.id !== appId));
        } catch {
            setError('Could not remove application.');
        } finally {
            setDeleting(prev => ({ ...prev, [appId]: false }));
        }
    };

    const getBadgeClass = (status) => {
        return STATUS_OPTIONS.find(o => o.value === status)?.badgeClass || 'badge-gray';
    };

    const getLabelFor = (status) => {
        return STATUS_OPTIONS.find(o => o.value === status)?.label || status;
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading applications...</span></div>;

    if (!studentId) {
        return (
            <div>
                <div className="page-header"><h2 className="section-heading">My Applications</h2></div>
                <div className="empty-state">
                    <div className="empty-state-icon">📬</div>
                    <div className="empty-state-title">Profile Required</div>
                    <div className="empty-state-desc">
                        <Link to="/profile">Create your profile</Link> first, then browse scholarships and click "Track Application".
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="section-heading">My Applications</h2>
                <p className="section-desc">
                    Track the status of scholarships you're applying to.
                    <strong> Note: This tool only tracks your preparation — it does not submit real applications to any government portal.</strong>
                </p>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="alert alert-warning">
                ⚠️ <strong>Disclaimer:</strong> Changing status to "Submitted" here only updates your local tracking record.
                No actual scholarship application is submitted to any government or official website.
            </div>

            {/* Stats */}
            {apps.length > 0 && (
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card">
                        <div className="stat-icon navy">📬</div>
                        <div className="stat-info">
                            <div className="stat-value">{apps.length}</div>
                            <div className="stat-label">Total Tracked</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange">🔄</div>
                        <div className="stat-info">
                            <div className="stat-value">{apps.filter(a => a.status === 'IN_PROGRESS').length}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{apps.filter(a => a.status === 'SUBMITTED').length}</div>
                            <div className="stat-label">Submitted (Track Only)</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Applications table */}
            {apps.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📬</div>
                    <div className="empty-state-title">No Applications Tracked Yet</div>
                    <div className="empty-state-desc">
                        Go to <Link to="/scholarships">Find Scholarships</Link>, and click "Track Application" on any scholarship.
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header">
                        <div className="card-icon navy">📋</div>
                        <div>
                            <div className="card-title">Application Tracker</div>
                            <div className="card-subtitle">Update the status as you make progress on each scholarship</div>
                        </div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Scholarship</th>
                                    <th>Amount</th>
                                    <th>Added On</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map(app => (
                                    <tr key={app.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--navy-800)', fontSize: '0.875rem' }}>
                                                {app.scholarship.title}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                Deadline: {app.scholarship.deadline}
                                            </div>
                                        </td>
                                        <td>₹{Number(app.scholarship.amount).toLocaleString('en-IN')}</td>
                                        <td>{formatDate(app.appliedAt)}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <span className={`badge ${getBadgeClass(app.status)}`}>
                                                    {getLabelFor(app.status)}
                                                </span>
                                                <select
                                                    className="status-select"
                                                    value={app.status}
                                                    onChange={e => handleStatusChange(app, e.target.value)}
                                                    disabled={updating[app.id]}
                                                >
                                                    {STATUS_OPTIONS.map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(app.id)}
                                                disabled={deleting[app.id]}
                                            >
                                                {deleting[app.id] ? '⏳' : '🗑️'} Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
