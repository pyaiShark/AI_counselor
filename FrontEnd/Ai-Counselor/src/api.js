import axios from 'axios';
import { getAccessToken, getRefreshToken, setToken, removeToken } from './Auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
    const response = await api.post('/onboarding/academic/', data);
    return response.data;
};

export const getAcademicBackground = async () => {
    const response = await api.get('/onboarding/academic/');
    return response.data;
};

export const submitStudyGoal = async (data) => {
    const response = await api.post('/onboarding/study-goal/', data);
    return response.data;
};

export const getStudyGoal = async () => {
    const response = await api.get('/onboarding/study-goal/');
    return response.data;
};

export const submitBudget = async (data) => {
    const response = await api.post('/onboarding/budget/', data);
    return response.data;
};

export const getBudget = async () => {
    const response = await api.get('/onboarding/budget/');
    return response.data;
};

export const submitExamsReadiness = async (data) => {
    const response = await api.post('/onboarding/exams/', data);
    return response.data;
};

export const getExamsReadiness = async () => {
    const response = await api.get('/onboarding/exams/');
    return response.data;
};

export default api;
