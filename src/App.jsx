import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentProfile from './pages/StudentProfile';
import FindScholarships from './pages/FindScholarships';
import MyDocuments from './pages/MyDocuments';
import ApplicationReadiness from './pages/ApplicationReadiness';
import MyApplications from './pages/MyApplications';

export default function App() {
    return (
        <BrowserRouter>
            <StudentProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/profile" element={<StudentProfile />} />
                        <Route path="/scholarships" element={<FindScholarships />} />
                        <Route path="/documents" element={<MyDocuments />} />
                        <Route path="/readiness" element={<ApplicationReadiness />} />
                        <Route path="/applications" element={<MyApplications />} />
                    </Routes>
                </Layout>
            </StudentProvider>
        </BrowserRouter>
    );
}
