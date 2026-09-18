import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Points to process.env.PORT || 3000
    withCredentials: true, // Sends refresh token HTTP-only cookies across requests
    headers: {
        'Content-Type': 'application/json',
    },
});