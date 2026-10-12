import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { scholarshipApi, applicationApi } from '../services/api';
import { Link } from 'react-router-dom';

function EligibilityBadge({ status }) {
    if (status === 'ELIGIBLE') return <span className="badge badge-green">✅ Eligible</span>;
    if (status === 'NOT_ELIGIBLE') return <span className="badge badge-red">❌ Not Eligible</span>;
    return <span className="badge badge-yellow">⚠️ Incomplete Profile</span>;
}

export default function FindScholarships() {
    const { studentId } = useStudent();
    const [scholarships, setScholarships] = useState([]);
    const [eligibility, setEligibility] = useState({});
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState({});
    const [appSuccess, setAppSuccess] = useState({});
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (studentId) {
                    const res = await scholarshipApi.checkAllEligibility(studentId);
                    const map = {};
                    const list = res.data.map(item => {
                        map[item.scholarship.id] = item.eligibility;
                        return item.scholarship;
                    });
                    setScholarships(list);
                    setEligibility(map);
                } else {
                    const res = await scholarshipApi.getAll();
                    setScholarships(res.data);
                }
                setError('');
            } catch {
                setError('Could not load scholarships. Make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentId]);

    const handleApply = async (scholarship) => {
        if (!studentId) return;
        setApplying(prev => ({ ...prev, [scholarship.id]: true }));
        try {
            await applicationApi.add(studentId, scholarship.id);
            setAppSuccess(prev => ({ ...prev, [scholarship.id]: 'Added to My Applications!' }));
        } catch (err) {
            const msg = err.response?.data?.error || 'Already added or error occurred.';
            setAppSuccess(prev => ({ ...prev, [scholarship.id]: `⚠️ ${msg}` }));
        } finally {
            setApplying(prev => ({ ...prev, [scholarship.id]: false }));
        }
    };

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const filtered = scholarships.filter(s => {
        const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (filter === 'ALL') return true;
        const elig = eligibility[s.id];
        if (filter === 'ELIGIBLE') return elig?.status === 'ELIGIBLE';
        if (filter === 'NOT_ELIGIBLE') return elig?.status === 'NOT_ELIGIBLE';
        return true;
    });

    const getCardClass = (id) => {
        const status = eligibility[id]?.status;
        if (status === 'ELIGIBLE') return 'scholarship-card eligible';
        if (status === 'NOT_ELIGIBLE') return 'scholarship-card not-eligible';
        return 'scholarship-card incomplete';
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading scholarships...</span></div>;

    return (
        <div>
            <div className="page-header">
                <h2 className="section-heading">Find Scholarships</h2>
                <p className="section-desc">
                    Below are 5 illustrative DEMO scholarships. Eligibility is checked using your profile data.
                    <strong> These are not real government schemes.</strong>
                </p>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {!studentId && (
                <div className="alert alert-warning">
                    ⚠️ <Link to="/profile" style={{ fontWeight: 700 }}>Create your profile</Link> to see personalized eligibility results.
                </div>
            )}

            <div className="alert alert-info">
                ℹ️ <strong>DEMO Data:</strong> All scholarship records are sample data for educational demonstration only.
                Deadlines and URLs are fictional. This does not submit real applications.
            </div>

            <div className="search-filter-bar">
                <div className="search-input" style={{ position: 'relative' }}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search scholarships..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-select"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{ width: 180 }}
                    disabled={!studentId}
                >
                    <option value="ALL">All Scholarships</option>
                    <option value="ELIGIBLE">✅ Eligible Only</option>
                    <option value="NOT_ELIGIBLE">❌ Not Eligible</option>
                </select>
                <span className="badge badge-blue">{filtered.length} found</span>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-title">No scholarships found</div>
                    <div className="empty-state-desc">Try adjusting your search or filter.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filtered.map(s => {
                        const elig = eligibility[s.id];
                        const isExpanded = expanded[s.id];
                        return (
                            <div key={s.id} className={getCardClass(s.id)}>
                                <div className="scholarship-card-header">
                                    <div>
                                        <div className="scholarship-title">{s.title}</div>
                                        {elig && <EligibilityBadge status={elig.status} />}
                                    </div>
                                    <div className="scholarship-amount">₹{Number(s.amount).toLocaleString('en-IN')}</div>
                                </div>

                                <div className="scholarship-desc">{s.description}</div>

                                <div className="scholarship-meta">
                                    {s.minAcademicPercentage && (
                                        <span className="scholarship-meta-item">📚 Min {s.minAcademicPercentage}%</span>
                                    )}
                                    {s.maxAnnualFamilyIncome && (
                                        <span className="scholarship-meta-item">💰 Income ≤ ₹{Number(s.maxAnnualFamilyIncome).toLocaleString('en-IN')}</span>
                                    )}
                                    {s.applicableCourse && <span className="scholarship-meta-item">🎓 {s.applicableCourse}</span>}
                                    {s.applicableState && <span className="scholarship-meta-item">📍 {s.applicableState}</span>}
                                    {s.applicableCategory && <span className="scholarship-meta-item">🏷️ {s.applicableCategory}</span>}
                                    <span className="scholarship-meta-item">📅 {s.deadline}</span>
                                </div>

                                {/* Eligibility reasons */}
                                {elig && (
                                    <div>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => toggleExpand(s.id)}
                                            style={{ marginBottom: isExpanded ? 8 : 0 }}
                                        >
                                            {isExpanded ? '▲ Hide' : '▼ Show'} Eligibility Details
                                        </button>
                                        {isExpanded && (
                                            <div style={{ marginTop: 8 }}>
                                                {elig.passReasons?.length > 0 && (
                                                    <ul className="reasons-list">
                                                        {elig.passReasons.map((r, i) => (
                                                            <li key={i} className="reason-pass">✅ {r}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {elig.failReasons?.length > 0 && (
                                                    <ul className="reasons-list" style={{ marginTop: 4 }}>
                                                        {elig.failReasons.map((r, i) => (
                                                            <li key={i} className="reason-fail">❌ {r}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {elig.reasons?.map((r, i) => <div key={i} className="badge badge-gray" style={{ marginTop: 4 }}>{r}</div>)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="scholarship-actions">
                                    {studentId && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleApply(s)}
                                            disabled={applying[s.id]}
                                        >
                                            {applying[s.id] ? '⏳' : '📬'} Track Application
                                        </button>
                                    )}
                                    <a
                                        href={s.applicationUrl}
                                        className="btn btn-outline btn-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        🔗 View Details (DEMO URL)
                                    </a>
                                    {appSuccess[s.id] && (
                                        <span className="badge badge-green" style={{ alignSelf: 'center' }}>
                                            {appSuccess[s.id]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
