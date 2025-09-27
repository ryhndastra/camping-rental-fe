// src/api/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // URL backend NestJS

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fungsi untuk Login
export const login = async (credentials: any) => {
  try {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

// Fungsi untuk Mendapatkan Data Dashboard
export const getDashboardData = async (token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

// Fungsi untuk Alat Camping
export const getAllAlatCamping = async (token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/alat-camping');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const createAlatCamping = async (token: string, formData: FormData) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.post('/alat-camping', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const updateAlatCamping = async (token: string, id: number, data: any) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.patch(`/alat-camping/${id}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const updateAlatCampingImage = async (token: string, id: number, formData: FormData) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.patch(`/alat-camping/upload_gambar/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const deleteAlatCamping = async (token: string, id: number) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.delete(`/alat-camping/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const deleteAlatCampingImage = async (token: string, id: number) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.delete(`/alat-camping/hapus_gambar/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

// Fungsi untuk Kategori Alat
export const getAllKategoriAlat = async (token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/kategori-alat');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export default api;
