import axios from "./axios";

export interface Notifikasi {
  id: number;
  pesan: string;
  dibaca: boolean;
  penyewaanId: number;
  adminId: number;
  createdAt: string;
}

export const getNotifications = async (
  token: string
): Promise<Notifikasi[]> => {
  const res = await axios.get<Notifikasi[]>("/notifikasi", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const markAsRead = async (
  id: number,
  token: string
): Promise<Notifikasi> => {
  const res = await axios.patch<Notifikasi>(
    `/notifikasi/${id}`,
    { dibaca: true },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// 🔴 fungsi baru untuk ambil jumlah notif belum dibaca
export const getUnreadCount = async (token: string): Promise<number> => {
  const res = await axios.get<number>("/notifikasi/unread-count", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
