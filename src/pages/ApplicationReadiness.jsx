import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { scholarshipApi, documentApi } from '../services/api';
import { Link } from 'react-router-dom';

export default function ApplicationReadiness() {
    const { student, studentId } = useStudent();
    const [eligibleScholarships, setEligibleScholarships] = useState([]);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!studentId) { setLoading(false); return; }
        const load = async () => {
            setLoading(true);
            try {
                const [eligRes, docRes] = await Promise.all([
                    scholarshipApi.checkAllEligibility(studentId),
                    documentApi.getByStudent(studentId),
                ]);
                const eligible = eligRes.data.filter(e => e.eligibility.status === 'ELIGIBLE');
                setEligibleScholarships(eligible);
                setDocs(docRes.data);
                setError('');
            } catch {
                setError('Could not load readiness data. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentId]);

    // Calculate readiness
    const totalDocs = docs.length;
    const completedDocs = docs.filter(d => d.completed).length;
    const pendingDocs = docs.filter(d => !d.completed);
    const docPct = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

    // Profile completeness (all fields present)
    const profileComplete = student &&
        student.fullName && student.email && student.course &&
        student.academicYear && student.academicPercentage !== undefined &&
        student.annualFamilyIncome !== undefined && student.state && student.category;
    const profilePct = profileComplete ? 100 : 0;

    // Overall readiness = 50% profile + 50% documents
    const overallPct = Math.round((profilePct * 0.5) + (docPct * 0.5));

    const getReadinessLabel = (pct) => {
        if (pct >= 90) return { label: 'Excellent', color: 'var(--green-600)' };
        if (pct >= 70) return { label: 'Good', color: 'var(--blue-500)' };
        if (pct >= 50) return { label: 'Fair', color: 'var(--yellow-500)' };
        return { label: 'Needs Improvement', color: 'var(--red-500)' };
    };

    const readiness = getReadinessLabel(overallPct);

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Calculating readiness...</span></div>;

    if (!studentId) {
        return (
            <div>
                <div className="page-header">
                    <h2 className="section-heading">Application Readiness</h2>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <div className="empty-state-title">Profile Required</div>
                    <div className="empty-state-desc">
                        <Link to="/profile">Create your student profile</Link> to calculate your readiness score.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="section-heading">Application Readiness</h2>
                <p className="section-desc">
                    Your readiness score is calculated from profile completeness and document completion.
                    <strong> This is a demo score — not an official government assessment.</strong>
                </p>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="alert alert-warning">
                ⚠️ <strong>Disclaimer:</strong> This readiness score is for self-assessment purposes within this demo app only.
                It does not represent any official evaluation or guarantee of scholarship approval.
            </div>

            {/* Main Score */}
            <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
                <div className="card-header" style={{ justifyContent: 'center' }}>
                    <div className="card-icon green">📊</div>
                    <div>
                        <div className="card-title">Overall Readiness Score</div>
                        <div className="card-subtitle">Based on profile + document completion</div>
                    </div>
                </div>
                <div style={{
                    width: 160, height: 160, borderRadius: '50%',
                    background: `conic-gradient(${readiness.color} ${overallPct * 3.6}deg, var(--gray-200) 0deg)`,
                    margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: '50%', background: 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: readiness.color, lineHeight: 1 }}>
                            {overallPct}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 600 }}>READINESS</div>
                    </div>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: readiness.color }}>{readiness.label}</div>

                {/* How it's calculated */}
                <div style={{ marginTop: 20, textAlign: 'left', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 16, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--navy-800)' }}>📐 How is this calculated?</div>
                    <div>• <strong>Profile Completeness (50%):</strong> {profilePct === 100 ? '✅ Complete' : '❌ Incomplete — fill all profile fields'}</div>
                    <div style={{ marginTop: 4 }}>• <strong>Document Completion (50%):</strong> {completedDocs}/{totalDocs} documents = {docPct}%</div>
                    <div style={{ marginTop: 8, fontStyle: 'italic' }}>
                        Overall = (Profile 50% × {profilePct / 100}) + (Docs 50% × {docPct / 100}) = {overallPct}%
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-icon navy">👤</div>
                        <div>
                            <div className="card-title">Profile Status</div>
                            <div className="card-subtitle">{profilePct}% complete</div>
                        </div>
                    </div>
                    {profileComplete ? (
                        <div className="badge badge-green" style={{ fontSize: '0.9rem' }}>✅ Profile is complete</div>
                    ) : (
                        <div>
                            <div className="badge badge-red" style={{ marginBottom: 12 }}>❌ Profile incomplete</div>
                            <Link to="/profile" className="btn btn-primary btn-sm">Complete Profile →</Link>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-icon green">🎓</div>
                        <div>
                            <div className="card-title">Eligible Scholarships</div>
                            <div className="card-subtitle">Based on your profile</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-600)' }}>
                        {eligibleScholarships.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>scholarships you qualify for</div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-icon orange">📄</div>
                        <div>
                            <div className="card-title">Document Progress</div>
                            <div className="card-subtitle">{completedDocs}/{totalDocs} complete</div>
                        </div>
                    </div>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${docPct}%` }} />
                    </div>
                    <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--gray-500)' }}>{docPct}% complete</div>
                </div>
            </div>

            {/* Missing Documents */}
            {pendingDocs.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-icon red">⚠️</div>
                        <div>
                            <div className="card-title">Pending Documents ({pendingDocs.length})</div>
                            <div className="card-subtitle">Complete these to improve your readiness score</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {pendingDocs.map(d => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                <span>❌</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>{d.documentName}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <Link to="/documents" className="btn btn-primary btn-sm">Go to Documents Checklist →</Link>
                    </div>
                </div>
            )}

            {/* Eligible scholarships list */}
            {eligibleScholarships.length > 0 && (
                <div className="card" style={{ marginTop: 24 }}>
                    <div className="card-header">
                        <div className="card-icon green">✅</div>
                        <div>
                            <div className="card-title">Scholarships You Are Eligible For</div>
                            <div className="card-subtitle">{eligibleScholarships.length} demo scholarships match your profile</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {eligibleScholarships.map(e => (
                            <div key={e.scholarship.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--navy-800)' }}>{e.scholarship.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>₹{Number(e.scholarship.amount).toLocaleString('en-IN')}</div>
                                </div>
                                <span className="badge badge-green">✅ Eligible</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <Link to="/scholarships" className="btn btn-success btn-sm">View All Scholarships →</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
