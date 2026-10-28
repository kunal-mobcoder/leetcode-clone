import axios from 'axios';

let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

export const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach Authorization header if access token is available
api.interceptors.request.use((config) => {
    if (currentAccessToken && config.headers) {
        config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
});

// Response interceptor: Auto-refresh access token on 401
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/register') &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await api.post('/auth/refresh');
                const newToken = res.data.accessToken;
                setAccessToken(newToken);
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                setAccessToken(null);
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
