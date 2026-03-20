import axios from 'axios';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL || '/api';
    // If the URL is absolute and doesn't end with /api, append it.
    if (url.startsWith('http') && !url.endsWith('/api') && !url.endsWith('/api/')) {
        url = url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
};

const API = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    }
});


// Add token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
