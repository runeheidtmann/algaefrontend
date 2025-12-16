import fetchWrapper from '@/helpers/fetchWrapper';
import { defineStore } from 'pinia';
import { useAppStore } from './app';

const baseURL = import.meta.env.VITE_API_BASE_URL

// Helper to check if a JWT token is expired
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        return true; // If we can't parse it, consider it expired
    }
}

// Clear tokens if refresh token is expired on startup
function getValidToken(key) {
    const token = localStorage.getItem(key);
    // For refresh token, check if it's expired - if so, clear everything
    if (key === 'refreshToken' && isTokenExpired(token)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
    }
    return token;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        // Check refresh token validity on startup - if expired, user must login again
        accessToken: getValidToken('refreshToken') ? localStorage.getItem('accessToken') : null,
        refreshToken: getValidToken('refreshToken'),
        userData: { username: '', }
    }),
    getters: {
        isLoggedIn: (state) => !!state.accessToken && !!state.refreshToken,
        // New getter to check if session is still valid
        isSessionValid: (state) => {
            if (!state.refreshToken) return false;
            return !isTokenExpired(state.refreshToken);
        },
    },
    actions: {
        async login(username, password) {
            try {
                const response = await fetch(`${baseURL}/api/token/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                this.accessToken = data.access;
                this.refreshToken = data.refresh;

                localStorage.setItem('accessToken', this.accessToken);
                localStorage.setItem('refreshToken', this.refreshToken);

                await this.fetchUserData();

            } catch (error) {
                console.error('Error during login:', error);
                throw error;
            }
        },
        async signup(username, first_name, last_name, email, password) {
            try {
                const response = await fetch(`${baseURL}/api/register/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, first_name, last_name, email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to sign up');
                }

                const data = await response.json();
                this.accessToken = data.access;
                this.refreshToken = data.refresh;

                localStorage.setItem('accessToken', this.accessToken);
                localStorage.setItem('refreshToken', this.refreshToken);

                console.log('Signup and login successful');

                await this.fetchUserData();

            } catch (error) {
                console.error('Error during signup:', error);
                throw error;
            }
        },

        async fetchUserData() {
            try {
                const response = await fetchWrapper(`${baseURL}/api/userdata/`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                this.userData = await response.json();
                console.log(this.userData);

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },

        logout() {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            this.accessToken = null;
            this.refreshToken = null;
            
            // Clear app store state
            const appStore = useAppStore();
            appStore.resetState();
        },
    },
});