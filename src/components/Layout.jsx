import { NavLink, useLocation } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { useState } from 'react';

const navItems = [
    { to: '/', label: 'Dashboard', icon: '🏠' },
    { to: '/profile', label: 'Student Profile', icon: '👤' },
    { to: '/scholarships', label: 'Find Scholarships', icon: '🎓' },
    { to: '/documents', label: 'My Documents', icon: '📄' },
    { to: '/readiness', label: 'App. Readiness', icon: '📊' },
    { to: '/applications', label: 'My Applications', icon: '📬' },
];

const pageTitles = {
    '/': 'Dashboard',
    '/profile': 'Student Profile',
    '/scholarships': 'Find Scholarships',
    '/documents': 'My Documents',
    '/readiness': 'Application Readiness',
    '/applications': 'My Applications',
};

export default function Layout({ children }) {
    const { student, logout } = useStudent();
    const location = useLocation();
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState('');

    const title = pageTitles[location.pathname] ||
        (location.pathname.startsWith('/scholarships/') ? 'Scholarship Details' : 'ScholarPath');
    const initials = student?.fullName
        ? student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'SP';

    const handleLogout = async () => {
        setLoggingOut(true);
        setLogoutError('');
        try {
            await logout();
        } catch {
            setLogoutError('Could not log out. Please try again.');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <div className="brand-icon">🎓</div>
                        <div className="brand-text">
                            <span className="brand-name">ScholarPath</span>
                            <span className="brand-tagline">Scholarship Readiness System</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-label">Navigation</span>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-profile-hint">
                        {student
                            ? `Logged in as ${student.fullName}`
                            : '⚠️ Complete your profile to unlock eligibility features'}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="main-content">
                <header className="top-bar">
                    <h1 className="top-bar-title">{title}</h1>
                    <div className="top-bar-student">
                        <div className="student-avatar">{initials}</div>
                        <span className="student-name-display">
                            {student ? student.fullName : 'Guest Student'}
                        </span>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={handleLogout}
                            disabled={loggingOut}
                        >
                            {loggingOut ? 'Logging out…' : 'Log out'}
                        </button>
                    </div>
                </header>

                <main className="page-content">
                    {logoutError && <div className="alert alert-error">{logoutError}</div>}
                    {children}
                </main>
            </div>
        </div>
    );
}
