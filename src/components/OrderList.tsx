/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Calendar, User, Package, DollarSign, Download } from 'lucide-react';
import { getAllPenyewaan, updatePenyewaanStatus, deletePenyewaan } from '../api/penyewaan';
import type { Penyewaan } from '../types/penyewaan';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  equipmentName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  orderDate: string;
}

const OrderList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerEmail: '',
    equipmentName: '',
    quantity: 1,
    startDate: '',
    endDate: '',
    totalPrice: 0,
    status: 'pending' as 'pending' | 'active' | 'completed' | 'cancelled'
  });

  // API integration states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await getAllPenyewaan(token) as Penyewaan[];

        // Transform API data to match Order interface
        const transformedOrders: Order[] = response.map((penyewaan: Penyewaan) => {
          // Get equipment details from DetailSewa
          const equipmentDetails = penyewaan.DetailSewa.map(detail => ({
            name: detail.alatCamping.nama,
            quantity: detail.jumlah,
            price: detail.hargaSewa
          }));

          // Calculate total quantity and create equipment name string
          const totalQuantity = equipmentDetails.reduce((sum, item) => sum + item.quantity, 0);
          const equipmentNames = equipmentDetails.map(item => item.name).join(', ');

          // Map status to our format
          const statusMap: { [key: string]: 'pending' | 'active' | 'completed' | 'cancelled' } = {
            'Menunggu Konfirmasi': 'pending',
            'Dikonfirmasi': 'active',
            'Sedang Digunakan': 'active',
            'Selesai': 'completed',
            'Dibatalkan': 'cancelled'
          };

          const mappedStatus = statusMap[penyewaan.status.namaStatus] || 'pending';

          return {
            id: `ORD-${penyewaan.penyewaanId}`,
            customerName: penyewaan.customer.nama,
            customerEmail: penyewaan.customer.email || penyewaan.customer.noHp,
            equipmentName: equipmentNames,
            quantity: totalQuantity,
            startDate: penyewaan.tanggalAmbil,
            endDate: penyewaan.tanggalKembaliActual || penyewaan.tanggalAmbil,
            totalPrice: penyewaan.totalBiaya,
            status: mappedStatus,
            orderDate: penyewaan.createdAt
          };
        });

        setOrders(transformedOrders);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format date for HTML date input (yyyy-MM-dd)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      equipmentName: order.equipmentName,
      quantity: order.quantity,
      startDate: formatDateForInput(order.startDate),
      endDate: formatDateForInput(order.endDate),
      totalPrice: order.totalPrice,
      status: order.status
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;

    // Validation
    if (!editForm.customerName.trim()) {
      alert('Nama customer tidak boleh kosong!');
      return;
    }
    if (!editForm.customerEmail.trim()) {
      alert('Email customer tidak boleh kosong!');
      return;
    }
    if (!editForm.equipmentName.trim()) {
      alert('Nama equipment tidak boleh kosong!');
      return;
    }
    if (editForm.quantity < 1) {
      alert('Quantity harus lebih dari 0!');
      return;
    }
    if (!editForm.startDate || !editForm.endDate) {
      alert('Tanggal mulai dan selesai harus diisi!');
      return;
    }
    if (new Date(editForm.startDate) >= new Date(editForm.endDate)) {
      alert('Tanggal selesai harus setelah tanggal mulai!');
      return;
    }
    if (editForm.totalPrice < 0) {
      alert('Total harga tidak boleh negatif!');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);

    try {
      // Extract penyewaanId from order ID (remove 'ORD-' prefix)
      const penyewaanId = parseInt(editingOrder.id.replace('ORD-', ''));

      // Map frontend status to backend status ID
      const statusMap: { [key: string]: number } = {
        'pending': 1, // 'Diproses'
        'active': 2,   // 'Sedang Disewa'
        'completed': 3, // 'Dikembalikan'
        'cancelled': 4  // 'Dibatalkan'
      };

      const statusId = statusMap[editForm.status] || 1;

      // Prepare update data - only send fields accepted by backend
      const updateData: any = {
        statusId: statusId
      };

      // Only include tanggalKembaliActual if status is completed
      if (editForm.status === 'completed') {
        // Convert date string to ISO format for backend
        const dateObj = new Date(editForm.endDate);
        updateData.tanggalKembaliActual = dateObj.toISOString().split('T')[0] + 'T00:00:00.000Z';
      }

      // Call backend API to update order
      await updatePenyewaanStatus(token, penyewaanId, updateData);

      // Update local state
      const updatedOrder: Order = {
        ...editingOrder,
        customerName: editForm.customerName.trim(),
        customerEmail: editForm.customerEmail.trim(),
        equipmentName: editForm.equipmentName.trim(),
        quantity: editForm.quantity,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        totalPrice: editForm.totalPrice,
        status: editForm.status
      };

      setOrders(prev => prev.map(order =>
        order.id === editingOrder.id ? updatedOrder : order
      ));

      setShowEditModal(false);
      setEditingOrder(null);
      alert('Order berhasil diupdate!');
    } catch (error: any) {
      console.error('Error updating order:', error);
      alert('Gagal mengupdate order: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);

    try {
      // Extract penyewaanId from order ID (remove 'ORD-' prefix)
      const penyewaanId = parseInt(orderId.replace('ORD-', ''));

      // Call backend API to delete order
      await deletePenyewaan(token, penyewaanId);

      // Update local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      alert('Order berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      alert('Gagal menghapus order: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      // Sort orders by status: pending first, then active, completed, cancelled
      const statusOrder = ['pending', 'active', 'completed', 'cancelled'];
      const sortedOrders = [...filteredOrders].sort((a, b) => {
        const statusIndexA = statusOrder.indexOf(a.status);
        const statusIndexB = statusOrder.indexOf(b.status);
        
        if (statusIndexA !== statusIndexB) {
          return statusIndexA - statusIndexB;
        }
        
        // If same status, sort by order date (newest first)
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      });

      // Create CSV content with BOM for proper UTF-8 encoding
      const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Equipment', 'Quantity', 'Start Date', 'End Date', 'Total Price', 'Status', 'Order Date'];
      const csvContent = '\uFEFF' + [
        headers.join(','),
        ...sortedOrders.map(order => [
          order.id,
          `"${order.customerName.replace(/"/g, '""')}"`, // Escape quotes
          order.customerEmail,
          `"${order.equipmentName.replace(/"/g, '""')}"`, // Escape quotes
          order.quantity,
          order.startDate,
          order.endDate,
          order.totalPrice,
          getStatusText(order.status),
          order.orderDate
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `order-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`Data berhasil diekspor! ${sortedOrders.length} orders telah didownload.`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Terjadi kesalahan saat mengekspor data!');
    }
  };

  // Stats untuk dashboard - sorted by pending first
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'active').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0)
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h2>
        <p className="text-gray-600">Kelola semua pesanan rental alat camping</p>
      </div>

      {/* Stats Cards - Reordered with Pending first */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Menunggu</p>
              <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Aktif</p>
              <p className="text-xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, equipment, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Failed to load orders</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm">There are no orders matching your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">{formatDate(order.orderDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.equipmentName}</div>
                        <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.startDate)}</div>
                        <div className="text-sm text-gray-500">to {formatDate(order.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalPrice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit Order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg text-sm font-medium bg-blue-600 text-white">
                1
              </button>
              <button className="w-8 h-8 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                2
              </button>
              <button className="w-8 h-8 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                3
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
              <button
                onClick={() => setShowOrderDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Order ID</label>
                <p className="text-gray-900">{selectedOrder.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Customer</label>
                <p className="text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Equipment</label>
                <p className="text-gray-900">{selectedOrder.equipmentName} (Qty: {selectedOrder.quantity})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rental Period</label>
                <p className="text-gray-900">{formatDate(selectedOrder.startDate)} - {formatDate(selectedOrder.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Price</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedOrder.totalPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowOrderDetail(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditOrder(selectedOrder);
                  setShowOrderDetail(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Order - {editingOrder.id}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name*</label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email*</label>
                <input
                  type="email"
                  value={editForm.customerEmail}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name*</label>
                <input
                  type="text"
                  value={editForm.equipmentName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, equipmentName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (IDR)*</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.totalPrice}
                  onChange={(e) => setEditForm(prev => ({ ...prev, totalPrice: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as 'pending' | 'active' | 'completed' | 'cancelled' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Menunggu</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;