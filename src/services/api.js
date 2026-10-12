import axios from 'axios';

// When using Vite proxy, use relative /api paths
const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
    withCredentials: true,
});

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
    me: () => api.get('/auth/me'),
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
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
