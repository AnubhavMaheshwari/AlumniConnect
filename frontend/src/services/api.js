import axios from 'axios';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // Local development can use Vite proxy.
    let url = envUrl || (isLocalhost ? '/api' : '/api');

    if (!envUrl && !isLocalhost) {
        console.error(
            'VITE_API_URL is not set for production. Set it to your Render backend URL (e.g. https://your-backend.onrender.com).'
        );
    }

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
