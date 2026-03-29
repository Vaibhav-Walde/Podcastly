import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'http://localhost:3001/api/v1';
const getToken = () => localStorage.getItem('JWT');
const auth = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const fetchAllSessions = () => axios.get(`${BASE}/sessions/get-all-sessions`, auth());
export const createSession = (sessionName: string) => axios.post(`${BASE}/sessions/create-session`, { sessionName }, auth());
export const joinSession = (sessionCode: string | null) => axios.post(`${BASE}/sessions/joinSession`, { sessionCode }, auth());
export const getSession = (sessionCode: string | null) => axios.get(`${BASE}/sessions/get-session/${sessionCode}`, auth());
export const login = (email: string, password: string) => axios.post(`${BASE}/user/signin`, { email, password });
export const signUp = (name: string, email: string, password: string) => axios.post(`${BASE}/user/signup`, { name, email, password });
export const sendChunksToBackend = (formData: any) => axios.post(`${BASE}/recordings/chunks`, formData, auth());
export const sendFinalCallToEndOfRecordingApi = (roomName: string, userType: string, sessionId: string) =>
  axios.post(`${BASE}/recordings/merge-upload-s3`, { sessionName: roomName, userType, sessionId }, auth());
export const getAllVideosApi = (sessionId: string) => axios.get(`${BASE}/recordings/get-session-videos/${sessionId}`, auth());
