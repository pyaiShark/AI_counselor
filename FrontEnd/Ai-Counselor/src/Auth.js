
export const setToken = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
};

export const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

export const setUserName = (name) => {
    if (name) {
        localStorage.setItem('user_name', name);
    }
};

export const getUserName = () => {
    return localStorage.getItem('user_name');
};

export const removeUserName = () => {
    localStorage.removeItem('user_name');
};

export const removeToken = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    removeUserName(); // Also remove user name on logout
};
