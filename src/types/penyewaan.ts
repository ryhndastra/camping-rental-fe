export interface Penyewaan {
  penyewaanId: number;
  customerId: number;
  tanggalAmbil: string;
  jamAmbilBarang: string;
  durasiPenyewaan: number;
  tanggalKembaliActual: string | null;
  totalBiaya: number;
  processedByAdmin: boolean;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    customerId: number;
    nama: string;
    noHp: string;
    email?: string;
    alamat?: string;
  };
  status: {
    statusPenyewaanId: number;
    namaStatus: string;
    urutanProses: number;
  };
  DetailSewa: Array<{
    detailSewaId: number;
    penyewaanId: number;
    alatCampingId: number;
    jumlah: number;
    hargaSewa: number;
    totalHarga: number;
    alatCamping: {
      alatCampingId: number;
      nama: string;
      deskripsi: string;
      hargaSewaPerHari: number;
      stok: number;
      gambar?: string;
      kategoriAlatId: number;
    };
  }>;
}

export interface UpdatePenyewaanStatusDto {
  statusId: number;
  tanggalKembaliActual?: Date;
}
