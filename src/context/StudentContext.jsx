import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let active = true;
        authApi.me()
            .then(res => {
                if (active) setStudent(res.data);
            })
            .catch(error => {
                if (active && error.response?.status !== 401) {
                    setLoadError('Could not verify your sign-in session. Check that the backend is running.');
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const saveStudent = (value) => {
        setStudent(value);
        setLoadError('');
    };

    const logout = async () => {
        await authApi.logout();
        setStudent(null);
    };

    const value = useMemo(() => ({
        student,
        studentId: student?.id ?? null,
        loading,
        loadError,
        saveStudent,
        logout,
    }), [student, loading, loadError]);

    return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export const useStudent = () => useContext(StudentContext);
