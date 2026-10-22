import axios from 'axios';

// Set VITE_API_BASE_URL to the deployed backend origin plus /api.
// Local development uses the Vite /api proxy.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

console.log('ScholarPath API base URL:', API_BASE);

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
    withCredentials: true,
});

function requireStudentResponse(response) {
    const student = response.data;
    if (!student || typeof student !== 'object' ||
        !Number.isInteger(student.id) || typeof student.fullName !== 'string') {
        throw new Error('The authentication endpoint did not return a student profile.');
    }
    return response;
}

let csrfToken = null;
let csrfRequest = null;

api.interceptors.request.use(async config => {
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method) && !config.url?.endsWith('/auth/csrf')) {
        if (!csrfToken) {
            csrfRequest ??= api.get('/auth/csrf')
                .then(res => { csrfToken = res.data.token; })
                .finally(() => { csrfRequest = null; });
            await csrfRequest;
        }
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return config;
});

// ---- Authentication APIs ----
export const authApi = {
    me: () => api.get('/auth/me').then(requireStudentResponse),
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data).then(requireStudentResponse),
    async logout() {
        await api.post('/auth/logout');
        csrfToken = null;
    },
};

// ---- Student APIs ----
export const studentApi = {
    getById: (id) => api.get(`/students/${id}`),
    getByEmail: (email) => api.get(`/students/by-email/${encodeURIComponent(email)}`),
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
