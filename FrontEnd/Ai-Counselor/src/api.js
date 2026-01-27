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
        if (error.response.status === 401 && !originalRequest._retry) {
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
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                removeToken();
                window.location.href = '/login';
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

export default api;
