import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useStudent } from '../context/StudentContext';

const profileFields = [
    { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'course', label: 'Course', type: 'text', autoComplete: 'off' },
    { name: 'academicYear', label: 'Academic year (1–6)', type: 'number', min: 1, max: 6 },
    { name: 'academicPercentage', label: 'Academic percentage', type: 'number', min: 0, max: 100, step: '0.01' },
    { name: 'annualFamilyIncome', label: 'Annual family income (₹)', type: 'number', min: 0 },
    { name: 'state', label: 'State', type: 'text', autoComplete: 'address-level1' },
    { name: 'category', label: 'Category', type: 'text', autoComplete: 'off' },
];

const emptyValues = {
    fullName: '',
    email: '',
    password: '',
    course: '',
    academicYear: '',
    academicPercentage: '',
    annualFamilyIncome: '',
    state: '',
    category: '',
};

export default function AccountPage({ loadError = '' }) {
    const isRegistering = useLocation().pathname === '/register';
    const navigate = useNavigate();
    const { saveStudent } = useStudent();
    const [values, setValues] = useState(emptyValues);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        setValues(previous => ({ ...previous, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (isRegistering) {
                await authApi.register({
                    ...values,
                    academicYear: Number(values.academicYear),
                    academicPercentage: Number(values.academicPercentage),
                    annualFamilyIncome: Number(values.annualFamilyIncome),
                });
            }
            const response = await authApi.login({ email: values.email, password: values.password });
            saveStudent(response.data);
            navigate('/', { replace: true });
        } catch (err) {
            const message = err.response?.data?.error;
            setError(message || (err.response?.status === 401
                ? 'Invalid email or password.'
                : 'Could not connect to the server. Check that the backend and database are available.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="account-page">
            <section className="account-card">
                <div className="account-brand">
                    <div className="brand-icon">🎓</div>
                    <div>
                        <div className="brand-name">ScholarPath</div>
                        <div className="account-subtitle">Scholarship Readiness System</div>
                    </div>
                </div>
                <h1 className="section-heading">{isRegistering ? 'Create your student account' : 'Log in to ScholarPath'}</h1>
                <p className="section-desc">
                    {isRegistering
                        ? 'Your account and student profile are securely stored in the ScholarPath database.'
                        : 'Log in to access your profile, documents, eligibility results, and application tracker.'}
                </p>
                {(loadError || error) && <div className="alert alert-error">{loadError || error}</div>}
                <form className="account-form" onSubmit={handleSubmit}>
                    {isRegistering && profileFields.map(field => (
                        <label className="form-group" key={field.name}>
                            <span className="form-label">{field.label}</span>
                            <input
                                className="form-input"
                                type={field.type}
                                name={field.name}
                                autoComplete={field.autoComplete}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={values[field.name]}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    ))}
                    {!isRegistering && (
                        <label className="form-group">
                            <span className="form-label">Email</span>
                            <input
                                className="form-input"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={values.email}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    )}
                    <label className="form-group">
                        <span className="form-label">Password</span>
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            autoComplete={isRegistering ? 'new-password' : 'current-password'}
                            minLength={isRegistering ? 8 : undefined}
                            value={values.password}
                            onChange={handleChange}
                            required
                        />
                        {isRegistering && <span className="form-hint">Use at least 8 characters.</span>}
                    </label>
                    <button className="btn btn-primary account-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Please wait…' : isRegistering ? 'Create account' : 'Log in'}
                    </button>
                </form>
                <p className="account-switch">
                    {isRegistering ? 'Already have an account?' : 'New to ScholarPath?'}{' '}
                    <Link to={isRegistering ? '/login' : '/register'}>
                        {isRegistering ? 'Log in' : 'Create an account'}
                    </Link>
                </p>
                <p className="account-note">
                    Each account has its own profile, document checklist, and application tracker. Existing student records are not overwritten.
                    Unregistered legacy profiles cannot be claimed without email verification, so use a different email to create a new account.
                </p>
            </section>
        </div>
    );
}
