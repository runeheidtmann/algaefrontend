import fetchWrapper from '@/helpers/fetchWrapper';
import { defineStore } from 'pinia';

const baseURL = import.meta.env.VITE_API_BASE_URL

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        userData: { username: '', }
    }),
    getters: {
        isLoggedIn: (state) => !!state.accessToken,
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
        },
    },
});