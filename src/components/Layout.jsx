import { NavLink, useLocation } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';

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
    const { student } = useStudent();
    const location = useLocation();

    const title = pageTitles[location.pathname] || 'ScholarPath';
    const initials = student?.fullName
        ? student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'SP';

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
                    </div>
                </header>

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
