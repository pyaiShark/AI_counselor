import axios from 'axios';
import { getAccessToken, getRefreshToken, setToken, removeToken } from './Auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Don't attempt to refresh token for login requests
        // If login fails (401), we want the component to handle the error
        if (originalRequest.url.includes('/login/')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    setToken(response.data.access, response.data.refresh);
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    removeToken();
                    // Only redirect if not already on the login page to avoid loops
                    if (window.location.pathname !== '/login') {
                         window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                removeToken();
                // Only redirect if not already on the login page
                if (window.location.pathname !== '/login') {
                     window.location.href = '/login';
                }
            }
        }

        // Handle 500 Internal Server Errors
        if (error.response?.status >= 500) {
            // Redirect to a specific error page if needed, or let components handle it
            // For a "global" error page redirect:
            // window.location.href = '/server-error'; 
            console.error("Server Error:", error.response.data);
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const login = async (email, password) => {
    const response = await api.post('/login/', { email, password });
    if (response.data.access && response.data.refresh) {
        setToken(response.data.access, response.data.refresh);
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await api.post('/forgot-password/', { email });
    return response.data;
};

export const resetPassword = async (password, uid, token) => {
    const response = await api.post(`/reset-password/?uid=${uid}&token=${token}`, { password });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/profile/');
    return response.data;
};

export const updateProfile = async (data) => { // This part may be changed, review in case of error
    const response = await api.put('/profile/', data);
    return response.data;
};


// Onboarding API calls
export const getOnboardingStatus = async () => {
    const response = await api.get('/onboarding/status/');
    return response.data;
};

export const submitAcademicBackground = async (data) => {
    uniRecommendationsCache = null; // Clear cache on update
    const response = await api.post('/onboarding/academic/', data);
    return response.data;
};
export const getAcademicBackground = async () => {
    const response = await api.get('/onboarding/academic/');
    return response.data;
};

export const submitStudyGoal = async (data) => {
    uniRecommendationsCache = null; // Clear cache on update
    const response = await api.post('/onboarding/study-goal/', data);
    return response.data;
};
export const getStudyGoal = async () => {
    const response = await api.get('/onboarding/study-goal/');
    return response.data;
};

export const submitBudget = async (data) => {
    uniRecommendationsCache = null; // Clear cache on update
    const response = await api.post('/onboarding/budget/', data);
    return response.data;
};
export const getBudget = async () => {
    const response = await api.get('/onboarding/budget/');
    return response.data;
};

export const submitExamsReadiness = async (data) => {
    uniRecommendationsCache = null; // Clear cache on update
    const response = await api.post('/onboarding/exams/', data);
    return response.data;
};

export const getExamsReadiness = async () => {
    const response = await api.get('/onboarding/exams/');
    return response.data;
};

// Dashboard / Task APIs
export const getTasks = () => api.get('/tasks/');
export const generateTasks = () => api.post('/tasks/generate/');
export const createTask = (taskData) => api.post('/tasks/', taskData);
export const updateTask = (taskId, data) => api.patch(`/tasks/${taskId}/`, data);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}/`);
export const getProfileStrength = () => api.get('/dashboard/strength/');

// University Shortlisting APIs
let uniRecommendationsCache = null;

export const prefetchRecommendations = (page = 1, limit = 12) => {
    // Only cache the first page for now to simplify
    if (page === 1 && !uniRecommendationsCache) {
        uniRecommendationsCache = api.get(`/universities/recommendations/?page=${page}&limit=${limit}`);
    }
    return uniRecommendationsCache;
};

export const getUniversityRecommendations = (page = 1, limit = 12) => {
    if (page === 1 && uniRecommendationsCache) {
        return uniRecommendationsCache;
    }
    return api.get(`/universities/recommendations/?page=${page}&limit=${limit}`);
};

export const getAllUniversities = (page = 1, limit = 12, country = '', minRank = 0, maxRank = 10000, search = '') => {
    return api.get(`/universities/all/?page=${page}&limit=${limit}&country=${encodeURIComponent(country)}&rank_min=${minRank}&rank_max=${maxRank}&search=${encodeURIComponent(search)}`);
};

export const getLockedUniversities = () => api.get('/universities/locked/');

export const evaluateUniversity = (uniName) => api.get(`/universities/evaluate/?name=${encodeURIComponent(uniName)}`);
export const shortlistAction = (data) => {
    // Clear cache if user changes their shortlist to ensure recommendations stay fresh
    uniRecommendationsCache = null;
    return api.post('/universities/shortlist/', data);
};

export default api;

