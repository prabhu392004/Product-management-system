import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  RotateCw, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Boxes,
  PackageOpen,
  Tag
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from './api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', brand: '', price: '', quantity: '' });
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProductList = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const list = Array.isArray(res?.data) 
        ? res.data 
        : (Array.isArray(res?.data?.data) ? res.data.data : []);
      setProducts(list);
    } catch (err) {
      showToast('Failed to load products: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const totalCount = list.length;
    const totalUnits = list.reduce((acc, p) => acc + (Number(p?.quantity) || 0), 0);
    const totalValue = list.reduce((acc, p) => acc + ((Number(p?.price) || 0) * (Number(p?.quantity) || 0)), 0);
    const lowStockCount = list.filter(p => (Number(p?.quantity) || 0) <= 5).length;
    return { totalCount, totalUnits, totalValue, lowStockCount };
  }, [products]);

  // Brand list
  const brands = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return [...new Set(list.map(p => p?.brand).filter(Boolean))].sort();
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    const safeList = Array.isArray(products) ? products : [];
    let list = safeList.filter(p => {
      const query = (searchQuery || '').toLowerCase().trim();
      const matchesSearch = !query || 
        (p?.name && String(p.name).toLowerCase().includes(query)) ||
        (p?.brand && String(p.brand).toLowerCase().includes(query));
      const matchesBrand = !selectedBrand || p?.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });

    list.sort((a, b) => {
      if (sortBy === 'name_asc') return String(a?.name || '').localeCompare(String(b?.name || ''));
      if (sortBy === 'name_desc') return String(b?.name || '').localeCompare(String(a?.name || ''));
      if (sortBy === 'price_low') return (Number(a?.price) || 0) - (Number(b?.price) || 0);
      if (sortBy === 'price_high') return (Number(b?.price) || 0) - (Number(a?.price) || 0);
      if (sortBy === 'qty_low') return (Number(a?.quantity) || 0) - (Number(b?.quantity) || 0);
      if (sortBy === 'qty_high') return (Number(b?.quantity) || 0) - (Number(a?.quantity) || 0);
      return (Number(b?.id) || 0) - (Number(a?.id) || 0);
    });

    return list;
  }, [products, searchQuery, selectedBrand, sortBy]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', brand: '', price: '', quantity: '' });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      quantity: product.quantity,
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully!');
      } else {
        await createProduct(payload);
        showToast('Product created successfully!');
      }
      setIsModalOpen(false);
      fetchProductList();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const errorList = [];
        for (const key in data.errors) {
          const msg = Array.isArray(data.errors[key]) ? data.errors[key].join(', ') : data.errors[key];
          errorList.push(`${key}: ${msg}`);
        }
        setFormErrors(errorList);
      } else {
        setFormErrors([data?.message || err.message || 'Operation failed']);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showToast('Product deleted successfully');
      setDeleteTarget(null);
      fetchProductList();
    } catch (err) {
      showToast('Failed to delete: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (num) => {
    return '₹' + (Number(num) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                StockMaster
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">React</span>
              </h1>
              <p className="text-xs text-slate-500">Django REST Product Management</p>
            </div>
          </div>

          <button 
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Products</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalCount}</h3>
              <p className="text-xs text-slate-400">Unique catalog items</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Units</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalUnits.toLocaleString()}</h3>
              <p className="text-xs text-slate-400">Items in stock</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Inventory Value</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{formatCurrency(stats.totalValue)}</h3>
              <p className="text-xs text-slate-400">Total stock worth</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl select-none">
              ₹
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Low Stock (&le; 5)</p>
              <h3 className="text-2xl font-extrabold text-amber-600">{stats.lowStockCount}</h3>
              <p className="text-xs text-slate-400">Needs restock</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Brand:</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Sort:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="newest">Newest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="price_low">Price (Lowest)</option>
                <option value="price_high">Price (Highest)</option>
                <option value="qty_low">Quantity (Lowest)</option>
                <option value="qty_high">Quantity (Highest)</option>
              </select>
            </div>

            <button 
              onClick={fetchProductList} 
              title="Refresh"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or add your first product.</p>
              </div>
              <button 
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                <PlusCircle className="w-4 h-4" />
                Add Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Product Name</th>
                    <th className="py-3.5 px-6">Brand</th>
                    <th className="py-3.5 px-6">Price (₹)</th>
                    <th className="py-3.5 px-6">Quantity</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(item => {
                    const qty = Number(item.quantity) || 0;
                    const badge = qty === 0 
                      ? { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', text: 'Out of Stock' }
                      : qty <= 5 
                      ? { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', text: 'Low Stock' }
                      : { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', text: 'In Stock' };

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-slate-400 font-mono text-xs">#{item.id}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800">{item.name}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                            {item.brand}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">{formatCurrency(item.price)}</td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-slate-700">{qty}</span>
                          <span className="text-xs text-slate-400 ml-1">pcs</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                            {badge.text}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button 
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <p>Showing {filteredProducts.length} of {products.length} products</p>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>
      </main>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-slate-500">Enter product parameters below</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <ul className="list-disc pl-4 space-y-0.5">
                  {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Product Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Wireless Mouse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Brand *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Logitech"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Price (₹) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    required
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Stock Quantity *
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    required
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Product</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className={`px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium ${
            toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-rose-600 text-white border-rose-700'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
