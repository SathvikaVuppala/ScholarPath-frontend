import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { studentApi } from '../services/api';

const COURSES = ['B.Tech / B.E.', 'B.Sc', 'B.Com', 'BA', 'BCA', 'BSW', 'M.Tech / M.E.',
    'M.Sc', 'M.Com', 'MA', 'MCA', 'MBA', 'MBBS', 'BDS', 'Diploma', 'Engineering', 'Other'];

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', 'PWD', 'Other'];

const emptyForm = {
    fullName: '', email: '', course: '', academicYear: '', academicPercentage: '', annualFamilyIncome: '', state: '', category: '',
};

export default function StudentProfile() {
    const { student, studentId, saveStudent } = useStudent();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [apiError, setApiError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (studentId) {
                setFetchLoading(true);
                try {
                    const res = await studentApi.getById(studentId);
                    const s = res.data;
                    setForm({
                        fullName: s.fullName, email: s.email, course: s.course,
                        academicYear: String(s.academicYear), academicPercentage: String(s.academicPercentage),
                        annualFamilyIncome: String(s.annualFamilyIncome), state: s.state, category: s.category,
                    });
                    saveStudent(s);
                } catch {
                    setApiError('Could not load your profile from the server.');
                } finally {
                    setFetchLoading(false);
                }
            }
        };
        load();
        // eslint-disable-next-line
    }, [studentId]);

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Full name is required.';
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format.';
        if (!form.course) e.course = 'Course is required.';
        if (!form.academicYear) e.academicYear = 'Academic year is required.';
        if (!form.academicPercentage) e.academicPercentage = 'Percentage is required.';
        else if (parseFloat(form.academicPercentage) < 0 || parseFloat(form.academicPercentage) > 100)
            e.academicPercentage = 'Must be between 0 and 100.';
        if (!form.annualFamilyIncome) e.annualFamilyIncome = 'Income is required.';
        else if (parseInt(form.annualFamilyIncome) < 0) e.annualFamilyIncome = 'Cannot be negative.';
        if (!form.state) e.state = 'State is required.';
        if (!form.category) e.category = 'Category is required.';
        return e;
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        setSuccess('');
        setApiError('');

        const payload = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            course: form.course,
            academicYear: parseInt(form.academicYear),
            academicPercentage: parseFloat(form.academicPercentage),
            annualFamilyIncome: parseInt(form.annualFamilyIncome),
            state: form.state,
            category: form.category,
        };

        try {
            const res = await studentApi.update(studentId, payload);
            setSuccess('Profile updated successfully! ✅');
            saveStudent(res.data);
            setIsEditing(false);
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.fieldErrors
                ? JSON.stringify(err.response?.data)
                : 'Could not connect to the server. Make sure the backend is running.';
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => { setIsEditing(true); setSuccess(''); setApiError(''); };

    if (fetchLoading) {
        return <div className="loading-container"><div className="spinner" /><span>Loading profile...</span></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="section-heading">Student Profile</h2>
                <p className="section-desc">
                    Fill in your details accurately. This information is used to determine scholarship eligibility.
                </p>
            </div>

            {success && <div className="alert alert-success">✅ {success}</div>}
            {apiError && <div className="alert alert-error">❌ {apiError}</div>}

            {student && !isEditing ? (
                <div className="card">
                    <div className="card-header">
                        <div className="card-icon green">👤</div>
                        <div>
                            <div className="card-title">Your Profile</div>
                            <div className="card-subtitle">All your details are saved</div>
                        </div>
                        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={handleEdit}>
                            ✏️ Edit Profile
                        </button>
                    </div>
                    <div className="form-grid">
                        {[
                            ['Full Name', student.fullName],
                            ['Email', student.email],
                            ['Course', student.course],
                            ['Academic Year', `Year ${student.academicYear}`],
                            ['Academic Percentage', `${student.academicPercentage}%`],
                            ['Annual Family Income', `₹${Number(student.annualFamilyIncome).toLocaleString('en-IN')}`],
                            ['State', student.state],
                            ['Category', student.category],
                        ].map(([label, value]) => (
                            <div key={label} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy-800)', marginTop: 4 }}>{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header">
                        <div className="card-icon navy">📝</div>
                        <div>
                            <div className="card-title">{student ? 'Edit Profile' : 'Create Profile'}</div>
                            <div className="card-subtitle">Fields marked <span style={{ color: 'var(--red-500)' }}>*</span> are required</div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name <span className="required">*</span></label>
                                <input className={`form-input${errors.fullName ? ' error' : ''}`} name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Ravi Kumar" />
                                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email <span className="required">*</span></label>
                                <input className={`form-input${errors.email ? ' error' : ''}`} name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. ravi@example.com" />
                                {errors.email && <span className="form-error">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Course <span className="required">*</span></label>
                                <select className={`form-select${errors.course ? ' error' : ''}`} name="course" value={form.course} onChange={handleChange}>
                                    <option value="">Select course...</option>
                                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errors.course && <span className="form-error">{errors.course}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Academic Year <span className="required">*</span></label>
                                <select className={`form-select${errors.academicYear ? ' error' : ''}`} name="academicYear" value={form.academicYear} onChange={handleChange}>
                                    <option value="">Select year...</option>
                                    {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                                {errors.academicYear && <span className="form-error">{errors.academicYear}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Academic Percentage (%) <span className="required">*</span></label>
                                <input className={`form-input${errors.academicPercentage ? ' error' : ''}`} name="academicPercentage" type="number" min="0" max="100" step="0.01" value={form.academicPercentage} onChange={handleChange} placeholder="e.g. 78.5" />
                                {errors.academicPercentage && <span className="form-error">{errors.academicPercentage}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Annual Family Income (₹) <span className="required">*</span></label>
                                <input className={`form-input${errors.annualFamilyIncome ? ' error' : ''}`} name="annualFamilyIncome" type="number" min="0" value={form.annualFamilyIncome} onChange={handleChange} placeholder="e.g. 250000" />
                                <span className="form-hint">Enter amount in Indian Rupees (e.g. 250000 for ₹2.5 Lakh)</span>
                                {errors.annualFamilyIncome && <span className="form-error">{errors.annualFamilyIncome}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">State <span className="required">*</span></label>
                                <select className={`form-select${errors.state ? ' error' : ''}`} name="state" value={form.state} onChange={handleChange}>
                                    <option value="">Select state...</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors.state && <span className="form-error">{errors.state}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category <span className="required">*</span></label>
                                <select className={`form-select${errors.category ? ' error' : ''}`} name="category" value={form.category} onChange={handleChange}>
                                    <option value="">Select category...</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errors.category && <span className="form-error">{errors.category}</span>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? '⏳ Saving...' : student ? '💾 Update Profile' : '✅ Create Profile'}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
