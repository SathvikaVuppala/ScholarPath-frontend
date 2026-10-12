import axios from 'axios';

// When using Vite proxy, use relative /api paths
const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// ---- Student APIs ----
export const studentApi = {
    getById: (id) => api.get(`/students/${id}`),
    getByEmail: (email) => api.get(`/students/by-email/${encodeURIComponent(email)}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
};

// ---- Scholarship APIs ----
export const scholarshipApi = {
    getAll: () => api.get('/scholarships'),
    getById: (id) => api.get(`/scholarships/${id}`),
    checkEligibility: (scholarshipId, studentId) =>
        api.get(`/scholarships/${scholarshipId}/eligibility?studentId=${studentId}`),
    checkAllEligibility: (studentId) =>
        api.get(`/scholarships/eligibility-all?studentId=${studentId}`),
};

// ---- Document APIs ----
export const documentApi = {
    getByStudent: (studentId) => api.get(`/documents/student/${studentId}`),
    update: (docId, completed, notes) =>
        api.patch(`/documents/${docId}`, { completed, notes }),
};

// ---- Application APIs ----
export const applicationApi = {
    getByStudent: (studentId) => api.get(`/applications/student/${studentId}`),
    add: (studentId, scholarshipId) =>
        api.post('/applications', { studentId, scholarshipId }),
    updateStatus: (appId, status) =>
        api.patch(`/applications/${appId}/status`, { status }),
    delete: (appId) => api.delete(`/applications/${appId}`),
};

export default api;
