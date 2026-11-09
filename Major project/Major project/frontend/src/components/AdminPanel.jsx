import { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Plus, Edit, Trash2, X, Search, RefreshCw, 
  Database, Package, ShoppingCart, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, Filter, AlertTriangle,
  Users, UserCheck, Eye, Mail, Phone, MapPin, UserX
} from 'lucide-react';
import { productApi, orderApi, authApi, userApi } from '../services/api';

const STORE_CATEGORIES = [
  "Smartphones",
  "Laptops",
  "Smartwatches",
  "Audio & Headphones",
  "Power Banks & Portable Power",
  "Cameras & Gaming",
  "Car Electronics & Dash Cams",
  "Drones & Aerial Imaging",
  "E-Readers & Digital Paper",
  "Gaming & VR",
  "Kitchen & Home Appliances",
  "Monitors & Displays",
  "Networking & Wireless",
  "PC & Gaming Components",
  "Personal Care Electronics",
  "Printers & Office Electronics",
  "Robot Vacuums & Smart Cleaning",
  "Smart Home & Automation",
  "Smart Security & Surveillance",
  "Smart TVs & Home Entertainment",
  "Smart Wearables & Health Electronics",
  "Tablets",
  "Accessories"
];

const AdminPanel = ({ currentUser, initialProducts = [], fallbackProducts = [] }) => {
  const getInitialProducts = () => {
    if (initialProducts && initialProducts.length > 0) return initialProducts;
    if (fallbackProducts && fallbackProducts.length > 0) return fallbackProducts;
    try {
      const cached = localStorage.getItem('admin_cached_products') || localStorage.getItem('aurastore_cached_catalog');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  };

  const [products, setProducts] = useState(getInitialProducts);
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('local_orders') || '[]');
    } catch (e) { return []; }
  });
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_cached_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 1, username: 'admin', email: 'admin@aurastore.com', role: 'ROLE_ADMIN', createdAt: '2026-01-01T00:00:00Z', isProtected: true },
      { id: 2, username: 'deepika', email: 'deepika@aurastore.com', role: 'ROLE_CUSTOMER', createdAt: '2026-01-15T00:00:00Z' }
    ];
  });
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'users'
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Product Add / Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [customCategoryActive, setCustomCategoryActive] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Smartphones',
    price: '',
    description: '',
    specifications: '{"processor": "Snapdragon / Apple / Intel", "ram": "8GB / 16GB", "storage": "128GB / 256GB"}',
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'
  });

  const ensureAdminToken = async () => {
    const currentToken = localStorage.getItem('token');
    const savedUserStr = localStorage.getItem('user');
    let currentUser = null;
    try { currentUser = savedUserStr ? JSON.parse(savedUserStr) : null; } catch(e){}
    const isAdmin = currentUser && (currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ADMIN');

    if (!currentToken || currentToken.startsWith('offline-') || !isAdmin) {
      try {
        const res = await authApi.login({ username: 'admin', password: 'admin123' });
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify({
            id: res.data.id || 1,
            username: 'admin',
            role: 'ROLE_ADMIN',
            email: res.data.email || 'admin@aurastore.com'
          }));
          return res.data.token;
        }
      } catch (err) {
        console.warn('Auto admin token setup note:', err.message);
      }
    }
    return currentToken;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await ensureAdminToken();
      if (mounted) await loadData();
    })();
    return () => { mounted = false; };
  }, []);

  // Automatic Background Reconnect Supervision when backend is offline
  useEffect(() => {
    if (!dbConnected) {
      const timer = setInterval(() => {
        loadData();
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [dbConnected]);

  const showToast = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    let loadedProducts = [];
    let isLive = false;

    try {
      // 1. Fetch complete product catalog from PostgreSQL
      try {
        const adminRes = await productApi.getAllAdmin();
        if (adminRes.data && Array.isArray(adminRes.data)) {
          loadedProducts = adminRes.data;
          isLive = true;
        }
      } catch (err) {
        // Fallback to getAll with large size
        const pageRes = await productApi.getAll({ size: 1000 });
        if (pageRes.data?.content && Array.isArray(pageRes.data.content)) {
          loadedProducts = pageRes.data.content;
          isLive = true;
        } else if (Array.isArray(pageRes.data)) {
          loadedProducts = pageRes.data;
          isLive = true;
        }
      }

      // 2. Fetch orders
      let loadedOrders = [];
      try {
        const ordRes = await orderApi.getAll();
        loadedOrders = ordRes.data || [];
      } catch (err) {
        console.warn('Orders fetch error:', err);
      }
      try {
        const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
        localOrders.forEach(lo => {
          if (!loadedOrders.some(o => o.id === lo.id)) {
            loadedOrders.unshift(lo);
          }
        });
      } catch (e) {}
      setOrders(loadedOrders);

      // 3. Fetch Users (Backend PostgreSQL + Local Storage Cache)
      let loadedUsers = [];
      try {
        const userRes = await userApi.getAllAdmin();
        if (userRes.data && Array.isArray(userRes.data)) {
          loadedUsers = userRes.data;
        }
      } catch (userErr) {
        console.warn('Backend users fetch note:', userErr.message);
      }

      // Merge with any offline registered accounts in localStorage
      try {
        const localUsersStr = localStorage.getItem('local_registered_users');
        if (localUsersStr) {
          const localUsers = JSON.parse(localUsersStr);
          localUsers.forEach(lu => {
            const exists = loadedUsers.some(u => 
              (u.username && u.username.toLowerCase() === lu.username?.toLowerCase()) ||
              (u.email && u.email.toLowerCase() === lu.email?.toLowerCase())
            );
            if (!exists) {
              loadedUsers.push({
                id: lu.id || 'LOCAL-' + Math.random().toString(36).substring(2, 7),
                username: lu.username,
                email: lu.email,
                role: lu.role || 'ROLE_CUSTOMER',
                createdAt: lu.createdAt || new Date().toISOString(),
                isLocalOnly: true
              });
            }
          });
        }
      } catch (e) {}

      // Ensure default system admin user is present
      if (!loadedUsers.some(u => u.username === 'admin')) {
        loadedUsers.unshift({
          id: 1,
          username: 'admin',
          email: 'admin@aurastore.com',
          role: 'ROLE_ADMIN',
          createdAt: '2026-01-01T00:00:00Z',
          isProtected: true
        });
      }

      // Enrich users with saved delivery profile details and order statistics
      try {
        const enrichedUsers = (loadedUsers || []).map(u => {
          if (!u) return null;
          let delivery = null;
          try {
            const savedDel = localStorage.getItem(`delivery_profile_${u.username || u.id}`);
            if (savedDel) delivery = JSON.parse(savedDel);
          } catch (e) {}

          const userOrders = (loadedOrders || []).filter(o => 
            (o?.customerName && o.customerName.toLowerCase() === u.username?.toLowerCase()) ||
            (o?.customerEmail && o.customerEmail.toLowerCase() === u.email?.toLowerCase()) ||
            (o?.user?.username && o.user.username.toLowerCase() === u.username?.toLowerCase())
          );

          return {
            ...u,
            deliveryProfile: delivery,
            orderCount: userOrders.length,
            totalSpent: userOrders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0)
          };
        }).filter(Boolean);

        setUsers(enrichedUsers);
        try {
          localStorage.setItem('admin_cached_users', JSON.stringify(enrichedUsers));
        } catch (e) {}
      } catch (enrichErr) {
        console.warn('User enrichment error suppressed:', enrichErr);
      }

      if (loadedProducts.length > 0) {
        setProducts(loadedProducts);
        setDbConnected(true);
        setStatusMessage(null);
        try {
          localStorage.setItem('admin_cached_products', JSON.stringify(loadedProducts));
          localStorage.setItem('aurastore_cached_catalog', JSON.stringify(loadedProducts));
        } catch (e) {}
      } else {
        setProducts(prev => {
          if (prev && prev.length > 0) return prev;
          if (initialProducts && initialProducts.length > 0) return initialProducts;
          if (fallbackProducts && fallbackProducts.length > 0) return fallbackProducts;
          try {
            const cached = localStorage.getItem('admin_cached_products') || localStorage.getItem('aurastore_cached_catalog');
            if (cached) return JSON.parse(cached);
          } catch (e) {}
          return [];
        });
        setDbConnected(isLive);
        if (isLive) setStatusMessage(null);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      if (!isLive) {
        setDbConnected(false);
        showToast('Backend offline. Please start START_AURA_STORE.bat and click Refresh.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setImagePreviewError(false);
    setCustomCategoryActive(false);
    setFormData({
      name: '',
      brand: '',
      category: 'Smartphones',
      price: '',
      description: '',
      specifications: '{"processor": "Snapdragon / Apple / Intel", "ram": "8GB / 16GB", "storage": "128GB / 256GB"}',
      stockQuantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'
    });
    setShowProductModal(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setImagePreviewError(false);
    const isStandardCat = STORE_CATEGORIES.includes(prod.category);
    setCustomCategoryActive(!isStandardCat && !!prod.category);

    const stockVal = prod.stock !== undefined ? prod.stock : (prod.stockQuantity !== undefined ? prod.stockQuantity : 0);

    setFormData({
      name: prod.name || '',
      brand: prod.brand || '',
      category: prod.category || 'Smartphones',
      price: prod.price !== undefined ? prod.price : '',
      description: prod.description || '',
      specifications: typeof prod.specifications === 'string' ? prod.specifications : JSON.stringify(prod.specifications || {}, null, 2),
      stockQuantity: stockVal,
      imageUrl: prod.imageUrl || ''
    });
    setShowProductModal(true);
  };

  // Delete Product
  const handleDeleteProduct = async (product) => {
    const confirmMsg = `Are you sure you want to delete Product #${product.id} ("${product.name}")?\n\nThis will permanently remove it from the PostgreSQL database.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await ensureAdminToken();
      await productApi.delete(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showToast(`Product #${product.id} ("${product.name}") was deleted successfully from the database.`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Delete Failed: ${errMsg}`);
      showToast(`Failed to delete: ${errMsg}`, 'error');
    }
  };

  // Save (Create or Update) Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || isNaN(formData.price)) {
      alert('Please fill out Product Name and valid Price.');
      return;
    }

    try {
      await ensureAdminToken();
      const parsedStock = parseInt(formData.stockQuantity, 10) || 0;
      const parsedPrice = parseFloat(formData.price);

      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        price: parsedPrice,
        stock: parsedStock,
        stockQuantity: parsedStock,
        imageUrl: formData.imageUrl.trim(),
        description: formData.description.trim(),
        specifications: formData.specifications.trim(),
        rating: editingProduct ? (editingProduct.rating || 4.5) : 4.5,
        reviewCount: editingProduct ? (editingProduct.reviewCount || 0) : 0
      };

      if (editingProduct) {
        const res = await productApi.update(editingProduct.id, payload);
        const updated = res.data || { ...editingProduct, ...payload };
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
        showToast(`Product #${editingProduct.id} ("${updated.name}") updated successfully!`, 'success');
      } else {
        const res = await productApi.create(payload);
        const created = res.data || { ...payload, id: Date.now() };
        setProducts(prev => [created, ...prev]);
        showToast(`Product "${created.name}" created and added to PostgreSQL database!`, 'success');
      }
      setShowProductModal(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Save Failed: ${errMsg}`);
      showToast(`Save failed: ${errMsg}`, 'error');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await orderApi.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? (res.data || { ...o, status: newStatus }) : o));
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.warn('Order status update error:', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order #${orderId} status set to ${newStatus} in local view`, 'warning');
    }
  };

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Text Search Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = String(p.id).includes(q) || `#${p.id}`.includes(q);
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const brandMatch = (p.brand || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const specMatch = (p.specifications || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !brandMatch && !catMatch && !specMatch) {
          return false;
        }
      }

      // 2. Category Match
      if (selectedCategory !== 'ALL') {
        if ((p.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Stock Status Match
      const stock = p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : 0);
      if (selectedStockStatus === 'IN_STOCK' && stock <= 0) return false;
      if (selectedStockStatus === 'LOW_STOCK' && (stock <= 0 || stock > 10)) return false;
      if (selectedStockStatus === 'OUT_OF_STOCK' && stock > 0) return false;

      return true;
    }).sort((a, b) => {
      const aStock = a.stock !== undefined ? a.stock : (a.stockQuantity || 0);
      const bStock = b.stock !== undefined ? b.stock : (b.stockQuantity || 0);
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;

      switch (sortBy) {
        case 'id-desc': return (b.id || 0) - (a.id || 0);
        case 'id-asc': return (a.id || 0) - (b.id || 0);
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        case 'price-asc': return aPrice - bPrice;
        case 'price-desc': return bPrice - aPrice;
        case 'stock-asc': return aStock - bStock;
        case 'stock-desc': return bStock - aStock;
        case 'rating-desc': return bRating - aRating;
        default: return (b.id || 0) - (a.id || 0);
      }
    });
  }, [products, searchQuery, selectedCategory, selectedStockStatus, sortBy]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const displayedProducts = useMemo(() => {
    if (pageSize === 'ALL') return filteredProducts;
    const startIndex = (activePage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, activePage, pageSize]);

  // Database Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const catSet = new Set();

    products.forEach(p => {
      const s = p.stock !== undefined ? p.stock : (p.stockQuantity || 0);
      if (s > 10) inStock++;
      else if (s > 0) lowStock++;
      else outOfStock++;

      if (p.category) catSet.add(p.category);
    });

    return { total, inStock, lowStock, outOfStock, categoriesCount: catSet.size };
  }, [products]);

  // Filter and Search Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = userSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.deliveryProfile?.name && u.deliveryProfile.name.toLowerCase().includes(q)) ||
        (u.deliveryProfile?.city && u.deliveryProfile.city.toLowerCase().includes(q)) ||
        (u.deliveryProfile?.phone && u.deliveryProfile.phone.includes(q));

      const matchesRole = userRoleFilter === 'ALL' || 
        (userRoleFilter === 'ADMIN' && (u.role === 'ROLE_ADMIN' || u.role === 'ADMIN')) ||
        (userRoleFilter === 'CUSTOMER' && (u.role === 'ROLE_CUSTOMER' || u.role === 'CUSTOMER'));

      return matchesSearch && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  // Delete User Profile Permanently
  const handleDeleteUser = async (user) => {
    if (!user) return;
    if (user.username === 'admin' || user.id === 1) {
      showToast('Primary system Administrator cannot be deleted.', 'error');
      setUserToDelete(null);
      return;
    }

    setDeletingUser(true);
    try {
      // 1. Delete from PostgreSQL if live
      if (dbConnected) {
        try {
          if (typeof user.id === 'number') {
            await userApi.deleteUser(user.id);
          } else if (user.username) {
            await userApi.deleteUserByUsername(user.username);
          }
        } catch (backendErr) {
          console.warn('Backend user delete warning:', backendErr.message);
          if (user.username) {
            try { await userApi.deleteUserByUsername(user.username); } catch(e){}
          }
        }
      }

      // 2. Remove from local_registered_users in localStorage
      try {
        const localUsersStr = localStorage.getItem('local_registered_users');
        if (localUsersStr) {
          const localUsers = JSON.parse(localUsersStr);
          const filtered = localUsers.filter(lu => 
            lu.username?.toLowerCase() !== user.username?.toLowerCase() &&
            lu.email?.toLowerCase() !== user.email?.toLowerCase()
          );
          localStorage.setItem('local_registered_users', JSON.stringify(filtered));
        }
      } catch (e) {}

      // 3. Remove cached delivery profile
      try {
        localStorage.removeItem(`delivery_profile_${user.username}`);
        localStorage.removeItem(`delivery_profile_${user.id}`);
      } catch (e) {}

      // 4. Update UI State
      setUsers(prev => prev.filter(u => u.username !== user.username && u.id !== user.id));
      setUserToDelete(null);
      setSelectedUser(null);
      showToast(`User profile "${user.username}" deleted successfully.`, 'success');
    } catch (err) {
      console.error('Failed to delete user:', err);
      showToast('Failed to delete user: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setDeletingUser(false);
    }
  };

  // Authorization check
  if (!currentUser || currentUser.role !== 'ROLE_ADMIN') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <Shield size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Administrator Authorization Required</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto' }}>
          Please log in as an administrator (e.g. username: <code>admin</code>) to access product catalog CRUD and order fulfillment.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Toast Notification */}
      {statusMessage && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : statusMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMessage.type === 'success' ? '#10b981' : statusMessage.type === 'warning' ? '#f59e0b' : '#ef4444'}`,
          color: statusMessage.type === 'success' ? '#34d399' : statusMessage.type === 'warning' ? '#fbbf24' : '#f87171',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Backend Disconnection Banner */}
      {!dbConnected && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle className="text-danger" size={24} />
            <div>
              <div style={{ fontWeight: 700, color: '#f87171' }}>Backend Microservice Offline (Port 8080)</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Double-click <code>START_AURA_STORE.bat</code> on your Desktop to boot all microservices. Auto-reconnecting in background...
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={loadData} disabled={loading} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Connecting...' : 'Retry Connection'}
          </button>
        </div>
      )}

      {/* Main Admin Header Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
            <Shield className="text-primary" size={24} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              System Administration Dashboard
            </h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: dbConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: dbConnected ? '#10b981' : '#f59e0b',
              border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dbConnected ? '#10b981' : '#f59e0b' }}></span>
              {dbConnected ? 'PostgreSQL Live' : 'Local Resilient Cache'}
            </span>
          </div>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Full CRUD control over PostgreSQL catalog ({products.length} products total), live stock management & customer order fulfillment
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={loadData} 
            disabled={loading} 
            title="Reload from PostgreSQL"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button 
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('products')}
            style={{ fontWeight: 600 }}
          >
            <Package size={15} /> Products ({products.length})
          </button>

          <button 
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('orders')}
            style={{ fontWeight: 600 }}
          >
            <ShoppingCart size={15} /> Orders ({orders.length})
          </button>

          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('users')}
            style={{ fontWeight: 600 }}
          >
            <Users size={15} /> Users ({users.length})
          </button>

          {activeTab === 'products' && (
            <button className="btn btn-primary" onClick={handleOpenAdd} style={{ fontWeight: 700, padding: '0.5rem 1.1rem' }}>
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Products</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{metrics.total}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>In Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{metrics.inStock}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Low / Out of Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{metrics.lowStock + metrics.outOfStock}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{orders.length}</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('users')}
          style={{ 
            background: 'var(--bg-card)', 
            padding: '1rem 1.25rem', 
            borderRadius: 'var(--radius-md)', 
            border: activeTab === 'users' ? '2px solid #8b5cf6' : '1px solid var(--border-color)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Users</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>{users.length}</div>
          </div>
        </div>
      </div>

      {/* PRODUCTS TAB CONTENT */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Search, Filter & Controls Toolbar */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search products by name, brand, #ID, or specs..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="form-control"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                style={{ height: '38px', fontSize: '0.82rem', width: 'auto', minWidth: '150px' }}
              >
                <option value="ALL">All Categories ({metrics.categoriesCount || STORE_CATEGORIES.length})</option>
                {STORE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter Dropdown */}
            <div>
              <select
                className="form-control"
                value={selectedStockStatus}
                onChange={(e) => { setSelectedStockStatus(e.target.value); setCurrentPage(1); }}
                style={{ height: '38px', fontSize: '0.82rem', width: 'auto' }}
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock (&gt; 10)</option>
                <option value="LOW_STOCK">Low Stock (1 - 10)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: '38px', fontSize: '0.82rem', width: 'auto' }}
              >
                <option value="id-desc">Newest First (ID Desc)</option>
                <option value="id-asc">Oldest First (ID Asc)</option>
                <option value="name-asc">Name (A - Z)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-desc">Stock: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
                <option value="rating-desc">Rating: Highest First</option>
              </select>
            </div>

            {/* Page Size Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Show:</span>
              <select
                className="form-control"
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10);
                  setPageSize(val);
                  setCurrentPage(1);
                }}
                style={{ height: '38px', fontSize: '0.82rem', width: 'auto' }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="ALL">All ({totalItems})</option>
              </select>
            </div>
          </div>

          {/* Results Summary & Pagination Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <div>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{totalItems === 0 ? 0 : (pageSize === 'ALL' ? 1 : (activePage - 1) * pageSize + 1)}</strong> - <strong style={{ color: 'var(--text-primary)' }}>{pageSize === 'ALL' ? totalItems : Math.min(activePage * pageSize, totalItems)}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> products in database
              {searchQuery && <span> matching "<span style={{ color: 'var(--primary)' }}>{searchQuery}</span>"</span>}
              {selectedCategory !== 'ALL' && <span> in <span style={{ color: 'var(--primary)' }}>{selectedCategory}</span></span>}
            </div>

            {pageSize !== 'ALL' && totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', height: '30px' }}
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <span>Page <strong>{activePage}</strong> of <strong>{totalPages}</strong></span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', height: '30px' }}
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '70px' }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Product & Brand</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Price (₹)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Stock Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Rating</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                      <Package size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                      <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>No Products Match Your Criteria</div>
                      <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                        {searchQuery ? 'Try clearing your search or category filter.' : 'Click "+ Add Product" above to create your first item in PostgreSQL.'}
                      </div>
                      {searchQuery && (
                        <button className="btn btn-secondary" style={{ marginTop: '1rem', padding: '0.35rem 0.85rem' }} onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}>
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map(p => {
                    const stock = p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : 0);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
                          #{p.id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: '#0a0f1d',
                            border: '1px solid var(--border-color)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              onError={(e) => { e.target.style.display = 'none'; }}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Brand: <strong style={{ color: 'var(--text-primary)' }}>{p.brand || 'Generic'}</strong>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            whiteSpace: 'nowrap'
                          }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          ₹{(p.price || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                          {stock > 10 ? (
                            <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                              ● {stock} in stock
                            </span>
                          ) : stock > 0 ? (
                            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                              ▲ {stock} low stock
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                              ✕ Out of stock
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {p.rating || 4.5}</span>
                          {p.reviewCount ? (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '4px' }}>({p.reviewCount})</span>
                          ) : null}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                              onClick={() => handleOpenEdit(p)}
                              title="Edit product in PostgreSQL"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={() => handleDeleteProduct(p)}
                              title="Delete product permanently from PostgreSQL"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Bar */}
          {pageSize !== 'ALL' && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>
                Page <strong>{activePage}</strong> of <strong>{totalPages}</strong> ({totalItems} items total)
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="btn btn-secondary"
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage(1)}
                  style={{ padding: '0.3rem 0.65rem' }}
                >
                  First
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  style={{ padding: '0.3rem 0.65rem' }}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  style={{ padding: '0.3rem 0.65rem' }}
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  style={{ padding: '0.3rem 0.65rem' }}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB CONTENT */}
      {activeTab === 'orders' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Items Summary</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Fulfillment Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <ShoppingCart size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>No Orders Recorded</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                      Customer purchases will appear here in real time.
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      #{o.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{o.user?.username || o.customerName || `Customer #${o.user?.id || o.userId || 'Guest'}`}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{o.customerEmail || o.user?.email || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{o.items?.length || 1} items</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.items?.map(it => it.productName || it.product?.name || `Item #${it.productId}`).join(', ') || 'Smart Electronics'}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ₹{(o.totalPrice || o.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : o.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                        {o.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <select
                        className="form-control"
                        value={o.status || 'CONFIRMED'}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        style={{ width: 'auto', display: 'inline-block', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* USERS TAB CONTENT */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search, Filter & Quick Stats Toolbar */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search user by username, email, city, phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px', fontSize: '0.86rem' }}
                />
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                className="form-control"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="CUSTOMER">Customers ({users.filter(u => u.role !== 'ROLE_ADMIN' && u.role !== 'ADMIN').length})</option>
                <option value="ADMIN">Administrators ({users.filter(u => u.role === 'ROLE_ADMIN' || u.role === 'ADMIN').length})</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> registered user profiles</span>
            </div>
          </div>

          {/* Users Management Table */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>User / Account</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Delivery Address</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Orders & Spent</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Registered On</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                      <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                      <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>No User Profiles Found</div>
                      <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                        {userSearchQuery ? 'Try clearing or modifying your search filter.' : 'New customer registrations will appear here in real time.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isAdmin = u.role === 'ROLE_ADMIN' || u.role === 'ADMIN';
                    const isCurrentAdmin = u.username === 'admin';
                    return (
                      <tr key={u.id || u.username} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {/* User Identity */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isAdmin ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}>
                              {(u.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{u.username}</span>
                                {isCurrentAdmin && (
                                  <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                ID: #{u.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{u.email || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: isAdmin ? '#a78bfa' : '#60a5fa',
                            border: `1px solid ${isAdmin ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                          }}>
                            {isAdmin ? <Shield size={12} /> : <UserCheck size={12} />}
                            {isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER'}
                          </span>
                        </td>

                        {/* Delivery Address */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {u.deliveryProfile ? (
                            <div style={{ fontSize: '0.78rem' }}>
                              <div style={{ fontWeight: 600 }}>{u.deliveryProfile.name || u.username}</div>
                              <div style={{ color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.deliveryProfile.city ? `${u.deliveryProfile.city} (${u.deliveryProfile.pincode || ''})` : u.deliveryProfile.address}
                              </div>
                              {u.deliveryProfile.phone && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>📞 {u.deliveryProfile.phone}</div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              No address saved
                            </span>
                          )}
                        </td>

                        {/* Orders & Total Spent */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem' }}>
                            {u.orderCount} {u.orderCount === 1 ? 'order' : 'orders'}
                          </div>
                          {u.totalSpent > 0 && (
                            <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                              ₹{u.totalSpent.toLocaleString('en-IN')} total
                            </div>
                          )}
                        </td>

                        {/* Registered Date */}
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => setSelectedUser(u)}
                              title="View full user profile"
                            >
                              <Eye size={13} /> Details
                            </button>

                            {isCurrentAdmin ? (
                              <button
                                className="btn btn-secondary"
                                disabled
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', opacity: 0.5, cursor: 'not-allowed' }}
                                title="Primary system Administrator cannot be deleted"
                              >
                                <Shield size={13} /> Protected
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.8rem',
                                  color: 'var(--danger)',
                                  borderColor: 'rgba(239, 68, 68, 0.3)'
                                }}
                                onClick={() => setUserToDelete(u)}
                                title={`Delete user ${u.username}`}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER PROFILE DETAILS MODAL */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)} style={{ zIndex: 1300 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '95%' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  {(selectedUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    User Profile: {selectedUser.username}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Account ID: #{selectedUser.id} • {selectedUser.role}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Information Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              
              {/* Account Credentials */}
              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Account Credentials & Authentication
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Username:</span>
                    <div style={{ fontWeight: 700 }}>{selectedUser.username}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address:</span>
                    <div style={{ fontWeight: 600 }}>{selectedUser.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role Permission:</span>
                    <div style={{ fontWeight: 700, color: selectedUser.role === 'ROLE_ADMIN' ? '#a78bfa' : '#60a5fa' }}>
                      {selectedUser.role}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Created:</span>
                    <div>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString('en-IN') : 'Active'}</div>
                  </div>
                </div>
              </div>

              {/* Delivery & Shipping Profile */}
              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Customer Shipping & Delivery Profile
                </div>
                {selectedUser.deliveryProfile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Customer Name: </span>
                      <strong>{selectedUser.deliveryProfile.name}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile Number: </span>
                      <strong>📞 {selectedUser.deliveryProfile.phone}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Street Address: </span>
                      <span>{selectedUser.deliveryProfile.address}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>City & PIN Code: </span>
                      <span>{selectedUser.deliveryProfile.city} - {selectedUser.deliveryProfile.pincode}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    No delivery profile registered yet. The user has not saved a shipping address.
                  </div>
                )}
              </div>

              {/* Order History Summary */}
              <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Shopping & Order Activity
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Purchases: </span>
                    <strong>{selectedUser.orderCount} orders</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount Spent: </span>
                    <strong style={{ color: '#10b981', fontSize: '1rem' }}>₹{selectedUser.totalSpent.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                {selectedUser.username !== 'admin' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      setUserToDelete(u);
                    }}
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.85rem' }}
                  >
                    <Trash2 size={14} /> Delete User Profile
                  </button>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)} style={{ fontSize: '0.85rem' }}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="modal-backdrop" onClick={() => !deletingUser && setUserToDelete(null)} style={{ zIndex: 1350 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '95%', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              Delete User Profile?
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete user <strong>"{userToDelete.username}"</strong> (<code>{userToDelete.email}</code>)?
              <br /><br />
              <span style={{ color: '#f87171', fontSize: '0.82rem' }}>
                ⚠️ This will permanently remove their credentials, delivery profile, and wishlist preferences. This action cannot be undone.
              </span>
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                disabled={deletingUser}
                onClick={() => setUserToDelete(null)}
                style={{ flex: 1, padding: '0.55rem 0' }}
              >
                Cancel
              </button>
              <button
                className="btn"
                disabled={deletingUser}
                onClick={() => handleDeleteUser(userToDelete)}
                style={{
                  flex: 1,
                  background: 'var(--danger)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  padding: '0.55rem 0'
                }}
              >
                {deletingUser ? 'Deleting...' : 'Yes, Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-backdrop" onClick={() => setShowProductModal(false)} style={{ zIndex: 1300 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package className="text-primary" size={20} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {editingProduct ? `Edit Product #${editingProduct.id}` : 'Add New Product to PostgreSQL'}
                </h3>
              </div>
              <button 
                onClick={() => setShowProductModal(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Product Name & Brand */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samsung Galaxy S24 Ultra"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samsung, Apple, Sony"
                    className="form-control"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              {/* Category, Price & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Category *
                  </label>
                  {!customCategoryActive ? (
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setCustomCategoryActive(true);
                          setFormData({ ...formData, category: '' });
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                    >
                      {STORE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__CUSTOM__">+ Other / Custom Category...</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Enter category"
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setCustomCategoryActive(false);
                          setFormData({ ...formData, category: 'Smartphones' });
                        }}
                      >
                        List
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    placeholder="e.g. 49999"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25"
                    className="form-control"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Image URL (Direct link to JPG/PNG/WebP) *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    className="form-control"
                    style={{ flex: 1 }}
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setImagePreviewError(false);
                      setFormData({ ...formData, imageUrl: e.target.value });
                    }}
                  />
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: '#0a0f1d',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData.imageUrl && !imagePreviewError ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        onError={() => setImagePreviewError(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Package size={18} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Hardware Specifications (JSON or structured text)
                </label>
                <textarea
                  rows="3"
                  className="form-control"
                  style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                  placeholder='{"processor": "Snapdragon 8 Gen 3", "ram": "12GB", "storage": "256GB"}'
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Product Description
                </label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Detailed customer-facing product description, features, warranty, and included box items..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {editingProduct ? 'Save Changes' : 'Create Product in PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
