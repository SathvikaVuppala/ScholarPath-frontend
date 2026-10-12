import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { documentApi } from '../services/api';
import { Link } from 'react-router-dom';

export default function MyDocuments() {
    const { studentId } = useStudent();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (!studentId) { setLoading(false); return; }
        const load = async () => {
            setLoading(true);
            try {
                const res = await documentApi.getByStudent(studentId);
                setDocs(res.data);
                setError('');
            } catch {
                setError('Could not load documents. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentId]);

    const toggle = async (doc) => {
        setUpdating(prev => ({ ...prev, [doc.id]: true }));
        try {
            const res = await documentApi.update(doc.id, !doc.completed, doc.notes);
            setDocs(prev => prev.map(d => d.id === doc.id ? res.data : d));
        } catch {
            setError('Could not update document status.');
        } finally {
            setUpdating(prev => ({ ...prev, [doc.id]: false }));
        }
    };

    const completed = docs.filter(d => d.completed).length;
    const total = docs.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading documents...</span></div>;

    if (!studentId) {
        return (
            <div>
                <div className="page-header">
                    <h2 className="section-heading">My Documents</h2>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <div className="empty-state-title">No Profile Found</div>
                    <div className="empty-state-desc">
                        Please <Link to="/profile">create your student profile</Link> first.
                        Your document checklist will be automatically set up.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="section-heading">My Documents</h2>
                <p className="section-desc">
                    Mark each document as complete when you have it ready. Progress is saved automatically.
                </p>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {/* Summary Card */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-600)' }}>{completed}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>Completed</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--red-500)' }}>{total - completed}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>Pending</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-800)' }}>{pct}%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>Completion</div>
                        </div>
                    </div>
                    <div style={{ minWidth: 200, flex: 1 }}>
                        <div style={{ marginBottom: 6, fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 600 }}>
                            Progress: {completed}/{total}
                        </div>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Document List */}
            <div className="card">
                <div className="card-header">
                    <div className="card-icon green">📋</div>
                    <div>
                        <div className="card-title">Document Checklist</div>
                        <div className="card-subtitle">Click any item to mark it complete or incomplete</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {docs.map(doc => (
                        <div
                            key={doc.id}
                            className={`document-item${doc.completed ? ' completed' : ''}`}
                            onClick={() => !updating[doc.id] && toggle(doc)}
                            title={`Click to mark as ${doc.completed ? 'incomplete' : 'complete'}`}
                        >
                            <div className={`doc-checkbox${doc.completed ? ' checked' : ''}`}>
                                {updating[doc.id] ? '⏳' : doc.completed ? '✓' : ''}
                            </div>
                            <span className={`doc-name${doc.completed ? ' completed' : ''}`}>
                                {doc.documentName}
                            </span>
                            <span className={`badge ${doc.completed ? 'badge-green' : 'badge-gray'}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                                {doc.completed ? '✅ Done' : '⏳ Pending'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="alert alert-info" style={{ marginTop: 20 }}>
                ℹ️ Document completion affects your Application Readiness score. Having all documents ready improves your readiness percentage.
            </div>
        </div>
    );
}
