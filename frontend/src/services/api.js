import axios from 'axios';
const API_BASE = 'http://localhost:8080/api';
const API = axios.create({ baseURL: API_BASE });

export const createRoom = (createdBy) => API.post('/rooms', null, { params: { createdBy } });
export const getRoom = (code) => API.get(`/rooms/${code}`);
export const joinRoom = (code, participantName, role = 'TEAM_MEMBER') =>
  API.post(`/rooms/${code}/join`, null, { params: { participantName, role } });
export const leaveRoom = (code, participantName) =>
  API.post(`/rooms/${code}/leave`, null, { params: { participantName } });
export const addStory = (code, title, description = '') =>
  API.post(`/rooms/${code}/stories`, { title, description });
export const getHistory = (code) => API.get(`/rooms/${code}/history`);
