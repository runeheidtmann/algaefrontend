// fetchWrapper.js
import { useAuthStore } from '@/store/authStore';
import router from '@/router';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

function isTokenExpired(token) {
    if (!token) return true;
    const payload = parseJwt(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
}

async function refreshAccessToken(refreshToken) {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    try {
        const response = await fetch(`${baseURL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log("Token Refreshed")
        const data = await response.json();
        return data.access; // Return new accessToken
    } catch (error) {
        console.error('Error during token refresh:', error);
        throw error;
    }
}

// Helper function to handle session expiration
function handleSessionExpired() {
    const authStore = useAuthStore();
    authStore.logout();
    router.push({ name: 'Login' });
}

async function fetchWrapper(url, options = {}) {
    const authStore = useAuthStore();

    // If refresh token is expired, logout and redirect immediately
    if (isTokenExpired(authStore.refreshToken)) {
        handleSessionExpired();
        throw new Error('Session expired. Please login again.');
    }

    if (isTokenExpired(authStore.accessToken)) {
        try {
            const newAccessToken = await refreshAccessToken(authStore.refreshToken);
            if (newAccessToken) {
                authStore.accessToken = newAccessToken;
                localStorage.setItem('accessToken', newAccessToken);
            } else {
                handleSessionExpired();
                throw new Error('Unable to refresh access token');
            }
        } catch (error) {
            handleSessionExpired();
            throw new Error('Session expired. Please login again.');
        }
    }

    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${authStore.accessToken}`;

    let response = await fetch(url, options);

    if (response.status === 401) {
        try {
            const newAccessToken = await refreshAccessToken(authStore.refreshToken);
            if (newAccessToken) {
                authStore.accessToken = newAccessToken;
                localStorage.setItem('accessToken', newAccessToken);
                options.headers['Authorization'] = `Bearer ${newAccessToken}`;
                response = await fetch(url, options);
            } else {
                handleSessionExpired();
                throw new Error('Unable to refresh access token');
            }
        } catch (error) {
            handleSessionExpired();
            throw new Error('Session expired. Please login again.');
        }
    }

    return response;
}

export default fetchWrapper;
