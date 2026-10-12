import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { scholarshipApi } from '../services/api';

export default function ScholarshipDetails() {
    const { id } = useParams();
    const [scholarship, setScholarship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        setScholarship(null);
        setLoading(true);
        setError('');

        scholarshipApi.getById(id)
            .then(res => {
                if (active) setScholarship(res.data);
            })
            .catch(err => {
                if (!active) return;
                setError(err.response?.status === 404
                    ? 'This scholarship could not be found.'
                    : 'Could not load scholarship details. Make sure the backend is running.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    if (loading) {
        return <div className="loading-container"><div className="spinner" /><span>Loading scholarship details...</span></div>;
    }

    if (error || !scholarship) {
        return (
            <div>
                <div className="page-header">
                    <h2 className="section-heading">Scholarship Details</h2>
                </div>
                <div className="alert alert-error">⚠️ {error || 'This scholarship could not be found.'}</div>
                <Link to="/scholarships" className="btn btn-outline">← Back to scholarships</Link>
            </div>
        );
    }

    const criteria = [
        {
            label: 'Minimum academic percentage',
            value: scholarship.minAcademicPercentage != null
                ? `${scholarship.minAcademicPercentage}%`
                : 'No minimum',
        },
        {
            label: 'Maximum annual family income',
            value: scholarship.maxAnnualFamilyIncome != null
                ? `₹${Number(scholarship.maxAnnualFamilyIncome).toLocaleString('en-IN')}`
                : 'No income limit',
        },
        { label: 'Applicable course', value: scholarship.applicableCourse || 'All courses' },
        { label: 'Applicable state', value: scholarship.applicableState || 'All states' },
        { label: 'Applicable category', value: scholarship.applicableCategory || 'All categories' },
    ];
    const requiredDocuments = scholarship.requiredDocuments
        ? scholarship.requiredDocuments.split(',').map(document => document.trim()).filter(Boolean)
        : [];

    return (
        <div>
            <div className="page-header">
                <Link to="/scholarships" className="btn btn-outline btn-sm" style={{ marginBottom: 16 }}>
                    ← Back to scholarships
                </Link>
                <div className="scholarship-detail-header">
                    <div>
                        <span className="badge badge-orange">DEMO SCHOLARSHIP</span>
                        <h2 className="section-heading scholarship-detail-title">{scholarship.title}</h2>
                    </div>
                    <div className="scholarship-amount">
                        ₹{Number(scholarship.amount).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>

            <div className="alert alert-warning">
                ⚠️ <strong>Demo record:</strong> Real applications are unavailable for demo scholarships.
                You can review and track preparation in ScholarPath, but this page does not submit an application.
            </div>

            <section className="card scholarship-detail">
                <div className="scholarship-detail-section">
                    <h3 className="card-title">About this scholarship</h3>
                    <p className="scholarship-desc">{scholarship.description}</p>
                </div>

                <div className="scholarship-detail-section">
                    <h3 className="card-title">Eligibility criteria</h3>
                    <div className="scholarship-criteria">
                        {criteria.map(criterion => (
                            <div className="scholarship-criterion" key={criterion.label}>
                                <span className="scholarship-criterion-label">{criterion.label}</span>
                                <span className="scholarship-criterion-value">{criterion.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="scholarship-detail-section scholarship-detail-meta">
                    <div>
                        <h3 className="card-title">Deadline</h3>
                        <p className="scholarship-desc">{scholarship.deadline || 'Not specified (DEMO)'}</p>
                    </div>
                    <div>
                        <h3 className="card-title">Scholarship amount</h3>
                        <p className="scholarship-desc">₹{Number(scholarship.amount).toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="scholarship-detail-section">
                    <h3 className="card-title">Required documents</h3>
                    {requiredDocuments.length > 0 ? (
                        <ul className="scholarship-documents">
                            {requiredDocuments.map(document => <li key={document}>{document}</li>)}
                        </ul>
                    ) : (
                        <p className="scholarship-desc">No document requirements are listed.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
