
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Plus, Package, Upload, X } from 'lucide-react';
import {
  getAllAlatCamping,
  createAlatCamping,
  updateAlatCamping,
  updateAlatCampingImage,
  deleteAlatCamping,
  deleteAlatCampingImage,
  getAllKategoriAlat,
} from '../api/axios';

interface Product {
  id: number;
  name: string;
  image: string;
  stock: number;
  category: string;
  price: number;
  description: string;
  status: 'available' | 'out_of_stock' | 'maintenance';
}

interface NewProductForm {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  image: string;
}

const Products: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductForm, setNewProductForm] = useState<NewProductForm>({
    name: '',
    category: 'Shelter',
    price: '',
    stock: '',
    description: '',
    image: ''
  });
  const [editProductForm, setEditProductForm] = useState<NewProductForm>({
    name: '',
    category: 'Shelter',
    price: '',
    stock: '',
    description: '',
    image: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number, nama: string }[]>([]);
  const itemsPerPage = 6;

  // Fetch token from localStorage or other auth storage
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    if (!token) return;
    getAllKategoriAlat(token)
      .then(data => {
        if (Array.isArray(data)) {
          // Set categories as array of objects with id and nama
          setCategories(data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
      });
  }, [token]);

  // Fetch products from backend
  useEffect(() => {
    if (!token) return;
    getAllAlatCamping(token)
      .then(data => {
        if (Array.isArray(data)) {
          // Map backend data to Product interface
          const mappedProducts = data.map((item: any) => ({
            id: item.alatCampingId,
            name: item.nama,
            image: item.imageUrl ? `http://localhost:3000/uploads/${item.imageUrl}` : '📦',
            stock: item.stok,
            category: item.kategori?.nama || 'Unknown',
            price: item.hargaSewaPerHari,
            description: item.deskripsi,
            status: item.stok === 0 ? 'out_of_stock' as const : (item.status === true ? 'available' as const : 'maintenance' as const),
          }));
          setProducts(mappedProducts);
        }
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
      });
  }, [token]);

  // Data produk dengan informasi lebih lengkap
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle image file selection for add modal
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
          setNewProductForm(prev => ({ ...prev, image: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image file selection for edit modal
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditImagePreview(event.target.result as string);
          setEditProductForm(prev => ({ ...prev, image: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAddForm = () => {
    setNewProductForm({
      name: '',
      category: 'Shelter',
      price: '',
      stock: '',
      description: '',
      image: ''
    });
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const resetEditForm = () => {
    setEditProductForm({
      name: '',
      category: 'Shelter',
      price: '',
      stock: '',
      description: '',
      image: ''
    });
    setEditImageFile(null);
    setEditImagePreview('');
    setEditingProduct(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'out_of_stock':
        return 'Stok Habis';
      case 'maintenance':
        return 'Maintenance';
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleEditProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setEditProductForm({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        description: product.description,
        image: product.image
      });

      // Set image preview if it's a data URL
      if (product.image.startsWith('data:')) {
        setEditImagePreview(product.image);
      } else {
        setEditImagePreview('');
      }

      setShowEditModal(true);
    }
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;

    // Validasi form
    if (!editProductForm.name || !editProductForm.price || !editProductForm.stock || !editProductForm.description) {
      alert('Harap lengkapi semua field yang wajib diisi!');
      return;
    }

    if (!token) {
      alert('Token tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update product data
      // Find kategoriId from categories list based on selected category name
      const selectedCategory = categories.find(cat => cat.nama === editProductForm.category);
      const kategoriId = selectedCategory ? selectedCategory.id : 1;

      const updateData = {
        nama: editProductForm.name,
        hargaSewaPerHari: parseInt(editProductForm.price),
        stok: parseInt(editProductForm.stock),
        deskripsi: editProductForm.description,
        kategoriId: kategoriId,
        status: true, // Add status field as boolean true
      };

      await updateAlatCamping(token, editingProduct.id, updateData);

      // Update image if new image is selected
      if (editImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', editImageFile);
        await updateAlatCampingImage(token, editingProduct.id, imageFormData);
      }

      // Refresh products list
      const updatedProducts = await getAllAlatCamping(token);
      if (Array.isArray(updatedProducts)) {
        const mappedProducts = updatedProducts.map((item: any) => ({
          id: item.alatCampingId,
          name: item.nama,
          image: item.imageUrl ? `http://localhost:3000/uploads/${item.imageUrl}` : '📦',
          stock: item.stok,
          category: item.kategori?.nama || 'Unknown',
          price: item.hargaSewaPerHari,
          description: item.deskripsi,
          status: item.status === true ? 'available' as const : 'maintenance' as const,
        }));
        setProducts(mappedProducts);
      }

      resetEditForm();
      setShowEditModal(false);
      alert('Produk berhasil diupdate!');
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Gagal mengupdate produk');
      alert('Gagal mengupdate produk: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    if (!token) {
      alert('Token tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteAlatCamping(token, productId);

      // Refresh products list
      const updatedProducts = await getAllAlatCamping(token);
      if (Array.isArray(updatedProducts)) {
        const mappedProducts = updatedProducts.map((item: any) => ({
          id: item.alatCampingId,
          name: item.nama,
          image: item.imageUrl ? `http://localhost:3000/uploads/${item.imageUrl}` : '📦',
          stock: item.stok,
          category: item.kategori?.nama || 'Unknown',
          price: item.hargaSewaPerHari,
          description: item.deskripsi,
          status: item.stok === 0 ? 'out_of_stock' as const : (item.status === true ? 'available' as const : 'maintenance' as const),
        }));
        setProducts(mappedProducts);
      }

      alert('Produk berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Gagal menghapus produk');
      alert('Gagal menghapus produk: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleSaveNewProduct = async () => {
    // Validasi form
    if (!newProductForm.name || !newProductForm.price || !newProductForm.stock || !newProductForm.description) {
      alert('Harap lengkapi semua field yang wajib diisi!');
      return;
    }

    if (!token) {
      alert('Token tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find kategoriId from categories list based on selected category name
      const selectedCategory = categories.find(cat => cat.nama === newProductForm.category);
      const kategoriId = selectedCategory?.id || 1;

      const formData = new FormData();
      formData.append('nama', newProductForm.name);
      formData.append('hargaSewaPerHari', newProductForm.price);
      formData.append('stok', newProductForm.stock);
      formData.append('deskripsi', newProductForm.description);
      formData.append('kategoriId', kategoriId.toString());
      formData.append('status', 'true'); // Add status field as string 'true'

      if (selectedImageFile) {
        formData.append('file', selectedImageFile);
      }

      await createAlatCamping(token, formData);

      // Refresh products list
      const updatedProducts = await getAllAlatCamping(token);
      if (Array.isArray(updatedProducts)) {
        const mappedProducts = updatedProducts.map((item: any) => ({
          id: item.alatCampingId,
          name: item.nama,
          image: item.imageUrl ? `http://localhost:3000/uploads/${item.imageUrl}` : '📦',
          stock: item.stok,
          category: item.kategori?.nama || 'Unknown',
          price: item.hargaSewaPerHari,
          description: item.deskripsi,
          status: item.stok === 0 ? 'out_of_stock' as const : (item.status === true ? 'available' as const : 'maintenance' as const),
        }));
        setProducts(mappedProducts);
      }

      resetAddForm();
      setShowAddModal(false);
      alert('Produk berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || 'Gagal menambahkan produk');
      alert('Gagal menambahkan produk: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Stats untuk dashboard
  const stats = {
    total: products.length,
    available: products.filter(p => p.status === 'available').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    maintenance: products.filter(p => p.status === 'maintenance').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Management</h2>
        <p className="text-gray-600">Kelola semua produk alat camping untuk rental</p>
      </div>

      {/* Stats Cards */} {/* untuk menghitung total semua produk */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        {/* menghitung total produk yang tersedia atau yang bisa dipinjamkan */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-xl font-semibold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </div>
        {/* menghitung stock yang habis*/}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-xl font-semibold text-gray-900">{stats.outOfStock}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Product Management */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header Section atau search bar*/}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              {/* filter semua kateogiru */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category.nama} value={category.nama}>{category.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Product
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">
                    <img
                      src={product.image.startsWith('data:') ? product.image
                        : `${product.image}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(product.status)}`}>  {/* status produk*/}
                    {getStatusText(product.status)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>  {/* judul produk */}
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>  {/* deskripsi produk */}

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-semibold text-gray-900">{product.stock} unit</p>  {/* stock produk */}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Harga/hari</p>
                    <p className="font-semibold text-blue-600">{formatCurrency(product.price)}</p>  {/* harga produk */}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProduct(product)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >  {/* meliaht lebih datail prihal produk*/}
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >  {/* edit produk */}
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >  {/* menghapus*/}
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal atau nampilin view produk secara detail*/}
      {showProductDetail && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <button
                onClick={() => setShowProductDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>


            <div className="text-center mb-4">
              <div className="mb-2">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-24 h-24 object-cover rounded-lg mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = "/default-placeholder.png"; // fallback kalau gambar error
                  }}
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">
                {selectedProduct.name}
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Kategori</label>
                <p className="text-gray-900">{selectedProduct.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                <p className="text-gray-900">{selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock</label>
                  <p className="text-gray-900">{selectedProduct.stock} unit</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Harga/hari</label>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(selectedProduct.price)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedProduct.status)}`}>
                  {getStatusText(selectedProduct.status)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowProductDetail(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditProduct(selectedProduct.id);
                  setShowProductDetail(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Produk</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetEditForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editProductForm.name}
                    onChange={(e) => setEditProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama produk..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editProductForm.category}
                    onChange={(e) => setEditProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.nama} value={category.nama}>{category.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga per hari <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editProductForm.price}
                    onChange={(e) => setEditProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editProductForm.stock}
                    onChange={(e) => setEditProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editProductForm.description}
                    onChange={(e) => setEditProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Masukkan deskripsi produk..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gambar Produk
                  </label>

                  {/* Image Preview */}
                  <div className="mb-4">
                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {editImagePreview ? (
                        <div className="relative">
                          <img
                            src={editImagePreview}
                            alt="Preview"
                            className="max-w-full max-h-44 object-contain rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setEditImagePreview('');
                              setEditImageFile(null);
                              setEditProductForm(prev => ({ ...prev, image: editingProduct?.image || '' }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                      ) : editingProduct && editingProduct.image ? (
                        <div className="text-center">
                          <img
                            src={editingProduct.image}
                            alt="Current"
                            className="max-w-full max-h-44 object-contain rounded-lg mx-auto"
                            onError={(e) => {
                              e.currentTarget.src = "/default-placeholder.png"; // fallback kalau gagal load
                            }}
                          />
                          <p className="text-gray-500 text-sm">Gambar saat ini</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Pilih gambar produk</p>
                          <p className="text-gray-400 text-xs">PNG, JPG, GIF hingga 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageSelect}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {editImageFile ? 'Ganti Gambar' : 'Upload Gambar Baru'}
                  </label>

                  {/* Image Info */}
                  {editImageFile && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">{editImageFile.name}</p>
                      <p className="text-xs text-blue-600">
                        {(editImageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Product Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Produk</h4>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">

                      <div className="text-3xl">
                        {editImagePreview ? (
                          <img
                            src={editImagePreview}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : editingProduct && editingProduct.image ? (
                          <img
                            src={editingProduct.image}
                            alt="Current"
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/default-placeholder.png"; // fallback kalau gambar gagal load
                            }}
                          />
                        ) : (
                          '📦'
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${editProductForm.stock && parseInt(editProductForm.stock) > 0
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                        {editProductForm.stock && parseInt(editProductForm.stock) > 0 ? 'Tersedia' : 'Stok Habis'}
                      </span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {editProductForm.name || 'Nama Produk'}
                    </h5>
                    <p className="text-xs text-gray-600 mb-2">
                      {editProductForm.description || 'Deskripsi produk...'}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Stock: {editProductForm.stock || '0'} unit
                      </span>
                      <span className="font-semibold text-blue-600">
                        {editProductForm.price ? formatCurrency(parseInt(editProductForm.price)) : 'Rp 0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetEditForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditProduct}
                disabled={!editProductForm.name || !editProductForm.price || !editProductForm.stock || !editProductForm.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tambah Produk Baru</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama produk..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.nama} value={category.nama}>{category.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga per hari <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Masukkan deskripsi produk..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gambar Produk
                  </label>

                  {/* Image Preview */}
                  <div className="mb-4">
                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full max-h-44 object-contain rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setImagePreview('');
                              setSelectedImageFile(null);
                              setNewProductForm(prev => ({ ...prev, image: '' }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Pilih gambar produk</p>
                          <p className="text-gray-400 text-xs">PNG, JPG, GIF hingga 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedImageFile ? 'Ganti Gambar' : 'Upload Gambar'}
                  </label>

                  {/* Image Info */}
                  {selectedImageFile && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">{selectedImageFile.name}</p>
                      <p className="text-xs text-blue-600">
                        {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Product Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Produk</h4>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          '📦'
                        )}
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
                        Tersedia
                      </span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {newProductForm.name || 'Nama Produk'}
                    </h5>
                    <p className="text-xs text-gray-600 mb-2">
                      {newProductForm.description || 'Deskripsi produk...'}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Stock: {newProductForm.stock || '0'} unit
                      </span>
                      <span className="font-semibold text-blue-600">
                        {newProductForm.price ? formatCurrency(parseInt(newProductForm.price)) : 'Rp 0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNewProduct}
                disabled={!newProductForm.name || !newProductForm.price || !newProductForm.stock || !newProductForm.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
