/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Tent, Package, Search, Bell, Trash2, Edit, Check, X } from 'lucide-react';
import api, { getDashboardData, getAllAlatCamping } from '../api/axios';
import { getNotifications, getUnreadCount, markAsRead } from "../api/notifikasi";
import type { Notifikasi } from "../api/notifikasi";

// Import komponen terpisah
import OrderList from '../components/OrderList';
import TermsConditions from '../components/TermsConditions';
import Products from '../components/Products';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  loginTime: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  id: string;
  address: string;
}

interface DashboardStats {
  totalProducts: number;
  activeRentals: number;
  totalCustomers: number;
  pendingOrders: number;
  totalOrders: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notifikasi[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  // Use adminToken consistently for authentication
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    id: '',
    address: ''
  });
  const [editingProfileData, setEditingProfileData] = useState<ProfileData>({ ...profileData });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeRentals: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    totalOrders: 0
  });
  const [bestSellerProducts, setBestSellerProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (!token) return;
      const unread = await getUnreadCount(token);
      setUnreadCount(unread);

      const notifList = await getNotifications(token);
      setNotifications(notifList);
    } catch (err) {
      console.error("Gagal ambil notifikasi:", err);
    }
  };

  const handleNotificationClick = async (notifId: number) => {
    try {
      if (!token) return;
      await markAsRead(notifId, token);
      // Refresh notifications after marking as read
      await fetchNotifications();
    } catch (err) {
      console.error("Gagal mark as read:", err);
    }
  };

  // Enhancement: fetch notifications immediately on mount and on token change
  useEffect(() => {
    fetchNotifications();

    // auto-refresh setiap 10 detik
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotificationDropdown && !target.closest('.notification-dropdown')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationDropdown]);

  // Debug: log unreadCount changes
  useEffect(() => {
    console.log("Unread notifications count:", unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    // Cek authentication
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    console.log('Token:', token);
    console.log('UserData:', userData);
    console.log('UserData type:', typeof userData);

    if (!token || !userData || userData === 'undefined' || userData === null) {
      // Redirect ke login jika tidak authenticated atau data invalid
      console.log('Redirecting to login - missing or invalid auth data');
      navigate('/');
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user:', parsedUser);
      setUser(parsedUser);

      // Fetch dashboard stats
      fetchDashboardStats(token);

      // Fetch profile data
      fetchProfileData(token);

      // Fetch best seller products
      fetchBestSellerProducts(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      console.error('Raw userData:', userData);
      // Clear corrupted data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const fetchDashboardStats = async (token: string) => {
    try {
      const stats = await getDashboardData(token) as DashboardStats;
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchProfileData = async (token: string) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/admin/profile');
      const profile = response.data as { adminId: number; nama: string; email: string; firstName?: string; lastName?: string; phone?: string; gender?: string; address?: string; role: string };

      setProfileData({
        firstName: profile.firstName ?? profile.nama ?? '',
        lastName: profile.lastName ?? '',
        email: profile.email,
        phone: profile.phone ?? '',
        gender: (profile.gender as 'male' | 'female') ?? 'male',
        id: profile.adminId.toString(),
        address: profile.address ?? ''
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // Clear any other stored data if needed
    localStorage.clear();

    // Dispatch custom event to notify App component of auth change
    window.dispatchEvent(new Event('authChange'));

    // Reset component state
    setUser(null);
    setIsLoading(false);
    setActiveMenu('Dashboard');

    // Navigate to login page
    navigate('/', { replace: true });
  };

  const handleEditProfile = () => {
    setEditingProfileData({ ...profileData });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Authentication token not found. Please login again.');
      return;
    }

    setIsUpdatingProfile(true);

    try {
      // Prepare the data to send to backend
      const updateData = {
        firstName: editingProfileData.firstName,
        lastName: editingProfileData.lastName,
        email: editingProfileData.email,
        phone: editingProfileData.phone,
        gender: editingProfileData.gender,
        address: editingProfileData.address,
      };

      // Make API call to update profile
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.patch('/admin/profile', updateData);

      // Update local state with the response data
      const updatedProfile = response.data as { adminId: number; nama: string; email: string; firstName?: string; lastName?: string; phone?: string; gender?: string; address?: string; role: string };
      setProfileData({
        firstName: updatedProfile.firstName ?? updatedProfile.nama ?? '',
        lastName: updatedProfile.lastName ?? '',
        email: updatedProfile.email,
        phone: updatedProfile.phone ?? '',
        gender: (updatedProfile.gender as 'male' | 'female') ?? 'male',
        id: updatedProfile.adminId.toString(),
        address: updatedProfile.address ?? ''
      });

      // Update the user state and localStorage to reflect the new name in navbar
      if (user) {
        const updatedUser = {
          ...user,
          name: `${updatedProfile.firstName ?? ''} ${updatedProfile.lastName ?? ''}`.trim()
        };
        setUser(updatedUser);
        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      }

      setIsEditingProfile(false);
      alert('Profile berhasil diupdate!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengupdate profile. Silakan coba lagi.';
      alert(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProfileData({ ...profileData });
    setIsEditingProfile(false);
  };

  // Fetch best seller products from backend
  const fetchBestSellerProducts = async (token: string) => {
    try {
      setIsLoadingProducts(true);
      const products = await getAllAlatCamping(token) as any[];

      // Map backend data to frontend format
      const mappedProducts = products.slice(0, 3).map((product: any) => ({
        name: product.nama,
        sales: 0, // Since backend doesn't track sales, set to 0
        image: product.imageUrl ? `http://localhost:3000/uploads/${product.imageUrl}` : '🏕️' // Use backend image or fallback emoji
      }));

      setBestSellerProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching best seller products:', error);
      // Fallback to hardcoded data if API fails
      setBestSellerProducts([
        { name: 'Camping Tent', sales: 161, image: '🏕️' },
        { name: 'Portable Stove', sales: 150, image: '🔥' },
        { name: 'Sleeping Bag', sales: 142, image: '🛌' },
      ]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Komponen untuk render konten berdasarkan menu aktif
  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Tent className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.activeRentals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <User className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.pendingOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Orders Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="mb-4">
                    <div className="flex items-end justify-center space-x-2 mb-4">
                      <div className="w-8 h-16 bg-blue-400 rounded"></div>
                      <div className="w-8 h-20 bg-blue-500 rounded"></div>
                      <div className="w-8 h-12 bg-blue-300 rounded"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Orders</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardStats.totalOrders ?? '...'}</p>
                  <p className="text-sm text-gray-600">Orders in Last Month</p>
                </div>
              </div>

              {/* Best Seller Products */}

              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Seller Products</h3>
                <div className="space-y-3">
                  {bestSellerProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "/default-placeholder.png"; // fallback
                          }}
                        />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium">{product.sales} Sales</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );

      case 'Products':
        return <Products />;

      case 'Profile':
        return (
          <div className="flex-1 p-6 bg-gray-100">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">General Information</h2>

              {/* Profile Header */}
              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900">Admin 1</h3>
                  <p className="text-gray-600">{profileData.firstName} {profileData.lastName.toLowerCase()}</p>
                </div>
                <div className="ml-auto">
                  {!isEditingProfile ? (
                    <button
                      onClick={handleEditProfile}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isUpdatingProfile}
                        className={`p-2 rounded-lg transition-colors ${isUpdatingProfile
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-green-600 hover:bg-green-100'
                          }`}
                      >
                        {isUpdatingProfile ? (
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdatingProfile}
                        className={`p-2 rounded-lg transition-colors ${isUpdatingProfile
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-100'
                          }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={isEditingProfile ? editingProfileData.firstName : profileData.firstName}
                    onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full px-4 py-3 text-gray-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isEditingProfile ? 'bg-white border border-gray-300' : 'bg-gray-200'
                      }`}
                    readOnly={!isEditingProfile}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={isEditingProfile ? editingProfileData.lastName : profileData.lastName}
                    onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-4 py-3 text-gray-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isEditingProfile ? 'bg-white border border-gray-300' : 'bg-gray-200'
                      }`}
                    readOnly={!isEditingProfile}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={isEditingProfile ? editingProfileData.email : profileData.email}
                    onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 text-gray-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isEditingProfile ? 'bg-white border border-gray-300' : 'bg-gray-200'
                      }`}
                    readOnly={!isEditingProfile}
                  />
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={isEditingProfile ? editingProfileData.phone : profileData.phone}
                    onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-4 py-3 text-gray-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isEditingProfile ? 'bg-white border border-gray-300' : 'bg-gray-200'
                      }`}
                    readOnly={!isEditingProfile}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Gender
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={isEditingProfile ? editingProfileData.gender === 'male' : profileData.gender === 'male'}
                        onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, gender: 'male' }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        disabled={!isEditingProfile}
                      />
                      <span className={`ml-2 font-medium ${(isEditingProfile ? editingProfileData.gender === 'male' : profileData.gender === 'male') ? 'text-gray-900' : 'text-gray-600'
                        }`}>Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={isEditingProfile ? editingProfileData.gender === 'female' : profileData.gender === 'female'}
                        onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, gender: 'female' }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        disabled={!isEditingProfile}
                      />
                      <span className={`ml-2 ${(isEditingProfile ? editingProfileData.gender === 'female' : profileData.gender === 'female') ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>Female</span>
                    </label>
                  </div>
                </div>

                {/* ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ID
                  </label>
                  <input
                    type="text"
                    value={isEditingProfile ? editingProfileData.id : profileData.id}
                    onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, id: e.target.value }))}
                    className={`w-full px-4 py-3 text-gray-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isEditingProfile ? 'bg-white border border-gray-300' : 'bg-gray-200'
                      }`}
                    readOnly={!isEditingProfile}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Address
                </label>
                <textarea
                  value={isEditingProfile ? editingProfileData.address : profileData.address}
                  onChange={(e) => isEditingProfile && setEditingProfileData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className={`w-full px-4 py-3 text-gray-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${isEditingProfile ? 'bg-white border border-gray-300' : 'bg-gray-200'
                    }`}
                  readOnly={!isEditingProfile}
                />
              </div>
            </div>
          </div>
        );

      case 'Order list':
        return <OrderList />;

      case 'Syarat & Ketentuan':
        return <TermsConditions />;

      default:
        return (
          <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">Fitur {activeMenu} sedang dalam pengembangan</p>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">Authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Tent className="mr-2" />
            GoCamping
          </h1>
        </div>

        <nav className="mt-8">
          {[
            { name: 'Dashboard', icon: '🏠' },
            { name: 'Products', icon: '📦' },
            { name: 'Profile', icon: '👤' },
            { name: 'Order list', icon: '📋' },
            { name: 'Syarat & Ketentuan', icon: '📄' },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveMenu(item.name)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-700 transition-colors ${activeMenu === item.name ? 'bg-gray-700 border-r-4 border-blue-500' : ''
                }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span>Application</span>
                  <span className="mx-2">›</span>
                  <span className="text-gray-900 font-medium">{activeMenu}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notification Bell with Dropdown */}
                <div className="relative">
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900 relative"
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotificationDropdown && (
                    <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.dibaca ? 'bg-blue-50' : ''
                                }`}
                              onClick={() => handleNotificationClick(notif.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${!notif.dibaca ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{notif.pesan}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {profileData.firstName && profileData.lastName
                        ? `${profileData.firstName} ${profileData.lastName}`
                        : profileData.firstName || user?.name || 'Admin'}
                    </p>
                    <p className="text-gray-500">@{user?.username || profileData.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
