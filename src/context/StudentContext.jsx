import { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext(null);

const STUDENT_ID_KEY = 'scholarpath_student_id';

export function StudentProvider({ children }) {
    const [student, setStudent] = useState(null);
    const [studentId, setStudentId] = useState(() => {
        const saved = localStorage.getItem(STUDENT_ID_KEY);
        return saved ? parseInt(saved, 10) : null;
    });

    const saveStudent = (s) => {
        setStudent(s);
        setStudentId(s.id);
        localStorage.setItem(STUDENT_ID_KEY, String(s.id));
    };

    const clearStudent = () => {
        setStudent(null);
        setStudentId(null);
        localStorage.removeItem(STUDENT_ID_KEY);
    };

    return (
        <StudentContext.Provider value={{ student, studentId, setStudent, saveStudent, clearStudent }}>
            {children}
        </StudentContext.Provider>
    );
}

export const useStudent = () => useContext(StudentContext);
