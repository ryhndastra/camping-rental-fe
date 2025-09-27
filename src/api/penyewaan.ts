import api from './axios';

// Fungsi untuk Penyewaan/Rental
export const getAllPenyewaan = async (token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/penyewaan');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const getPenyewaanById = async (token: string, penyewaanId: number) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/penyewaan/${penyewaanId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const updatePenyewaanStatus = async (token: string, penyewaanId: number, data: any) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.patch(`/penyewaan/${penyewaanId}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};

export const deletePenyewaan = async (token: string, penyewaanId: number) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.delete(`/penyewaan/${penyewaanId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
  }
};
