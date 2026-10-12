import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { StudentProvider, useStudent } from './context/StudentContext';
import Layout from './components/Layout';
import AccountPage from './pages/AccountPage';
import Dashboard from './pages/Dashboard';
import StudentProfile from './pages/StudentProfile';
import FindScholarships from './pages/FindScholarships';
import MyDocuments from './pages/MyDocuments';
import ApplicationReadiness from './pages/ApplicationReadiness';
import MyApplications from './pages/MyApplications';
import ScholarshipDetails from './pages/ScholarshipDetails';

function AppRoutes() {
    const { student, loading, loadError } = useStudent();
    const location = useLocation();

    if (loading) {
        return <div className="loading-container"><div className="spinner" /><span>Checking your account...</span></div>;
    }

    if (!student) {
        return (
            <Routes>
                <Route path="/register" element={<AccountPage loadError={loadError} />} />
                <Route path="*" element={<AccountPage loadError={loadError} />} />
            </Routes>
        );
    }

    if (location.pathname === '/login' || location.pathname === '/register') {
        return <Navigate to="/" replace />;
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/scholarships" element={<FindScholarships />} />
                <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
                <Route path="/documents" element={<MyDocuments />} />
                <Route path="/readiness" element={<ApplicationReadiness />} />
                <Route path="/applications" element={<MyApplications />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <StudentProvider>
                <AppRoutes />
            </StudentProvider>
        </BrowserRouter>
    );
}
