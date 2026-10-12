import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { scholarshipApi, documentApi, applicationApi, studentApi } from '../services/api';

export default function Dashboard() {
    const { student, studentId, setStudent } = useStudent();
    const [stats, setStats] = useState({
        totalScholarships: 0,
        eligibleScholarships: 0,
        docsCompleted: 0,
        totalDocs: 0,
        totalApplications: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load student data if studentId exists but student object is not yet in context
        const loadStudent = async () => {
            if (studentId && !student) {
                try {
                    const res = await studentApi.getById(studentId);
                    setStudent(res.data);
                } catch {
                    // Student not found, clear it
                }
            }
        };
        loadStudent();
    }, [studentId, student, setStudent]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const schRes = await scholarshipApi.getAll();
                const total = schRes.data.length;
                let eligible = 0;

                if (studentId) {
                    try {
                        const eligRes = await scholarshipApi.checkAllEligibility(studentId);
                        eligible = eligRes.data.filter(e => e.eligibility.status === 'ELIGIBLE').length;
                    } catch { }

                    try {
                        const docRes = await documentApi.getByStudent(studentId);
                        const docs = docRes.data;
                        const completed = docs.filter(d => d.completed).length;
                        setStats(prev => ({ ...prev, docsCompleted: completed, totalDocs: docs.length }));
                    } catch { }

                    try {
                        const appRes = await applicationApi.getByStudent(studentId);
                        setStats(prev => ({ ...prev, totalApplications: appRes.data.length }));
                    } catch { }
                }

                setStats(prev => ({ ...prev, totalScholarships: total, eligibleScholarships: eligible }));
                setError('');
            } catch (err) {
                setError('Could not connect to the backend. Make sure the Spring Boot server is running on port 8080.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [studentId]);

    const readinessPct = stats.totalDocs > 0
        ? Math.round((stats.docsCompleted / stats.totalDocs) * 100)
        : 0;

    return (
        <div>
            <div className="page-header">
                <h2 className="section-heading">Welcome to ScholarPath 🎓</h2>
                <p className="section-desc">
                    {student
                        ? `Hello, ${student.fullName}! Here's your scholarship readiness overview.`
                        : 'Complete your student profile to unlock eligibility checking and readiness features.'}
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    ⚠️ <span>{error}</span>
                </div>
            )}

            {!student && (
                <div className="alert alert-warning">
                    ⚠️ No student profile found.{' '}
                    <Link to="/profile" style={{ fontWeight: 700, color: '#92400e' }}>
                        Create your profile here →
                    </Link>
                </div>
            )}

            {loading ? (
                <div className="loading-container"><div className="spinner" /><span>Loading dashboard...</span></div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon navy">🎓</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.totalScholarships}</div>
                                <div className="stat-label">Total Scholarships</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.eligibleScholarships}</div>
                                <div className="stat-label">Eligible Scholarships</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange">📄</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.docsCompleted}/{stats.totalDocs}</div>
                                <div className="stat-label">Documents Completed</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon purple">📊</div>
                            <div className="stat-info">
                                <div className="stat-value">{readinessPct}%</div>
                                <div className="stat-label">Document Readiness</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon navy">⚡</div>
                            <div>
                                <div className="card-title">Quick Actions</div>
                                <div className="card-subtitle">Jump to the key features</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                            <Link to="/profile" className="btn btn-primary">👤 Update Profile</Link>
                            <Link to="/scholarships" className="btn btn-success">🔍 Find Scholarships</Link>
                            <Link to="/documents" className="btn btn-outline">📄 My Documents</Link>
                            <Link to="/readiness" className="btn btn-outline">📊 Check Readiness</Link>
                            <Link to="/applications" className="btn btn-outline">📬 My Applications</Link>
                        </div>
                    </div>

                    {stats.totalDocs > 0 && (
                        <div className="card" style={{ marginTop: 20 }}>
                            <div className="card-header">
                                <div className="card-icon green">📊</div>
                                <div>
                                    <div className="card-title">Document Completion Progress</div>
                                    <div className="card-subtitle">{stats.docsCompleted} of {stats.totalDocs} documents marked as complete</div>
                                </div>
                            </div>
                            <div className="progress-container">
                                <div className="progress-bar" style={{ width: `${readinessPct}%` }} />
                            </div>
                            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                                {readinessPct}% complete
                            </div>
                        </div>
                    )}

                    <div className="alert alert-info" style={{ marginTop: 20 }}>
                        ℹ️ <strong>Disclaimer:</strong> ScholarPath is a demo project. All scholarship records are illustrative
                        sample data. Eligibility checks are rule-based. This tool does not submit any real government applications.
                    </div>
                </>
            )}
        </div>
    );
}
