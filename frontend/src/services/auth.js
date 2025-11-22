// src/services/auth.js
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

// general axios instance for auth actions
export const AUTH_API = axios.create({ baseURL: API_BASE });

export function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // also set on the auth instance if you use it
    AUTH_API.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    localStorage.setItem('authToken', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    delete AUTH_API.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
}

export function getStoredUser() {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}
