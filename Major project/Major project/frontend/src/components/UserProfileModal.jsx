import { useState, useEffect } from 'react';
import { X, User, LogIn, UserPlus, Package, Heart, Sliders, LogOut, CheckCircle2, AlertCircle, Lock, KeyRound } from 'lucide-react';
import { authApi, userApi, orderApi, wishlistApi } from '../services/api';

const UserProfileModal = ({ isOpen, onClose, currentUser, onLoginSuccess, onLogout, onOpenProductDetails, initialMode = 'login', authNotice = '' }) => {
  const [activeTab, setActiveTab] = useState(currentUser ? 'profile' : 'login');
  
  const sanitizeAuthMode = (mode) => (mode === 'register' ? 'register' : (mode === 'forgot' ? 'forgot' : 'login'));

  // Auth Form State
  const [authMode, setAuthMode] = useState(() => sanitizeAuthMode(initialMode)); // 'login', 'register', or 'forgot'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Input Validation State
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Robust Email Validation Function
  const validateEmailFormat = (val) => {
    if (!val || !val.trim()) {
      return 'Email address is required.';
    }
    const trimmed = val.trim();
    if (/\s/.test(trimmed)) {
      return 'Email address cannot contain spaces.';
    }
    if (!trimmed.includes('@')) {
      return 'Email must include "@" (e.g. deepika@gmail.com).';
    }
    const parts = trimmed.split('@');
    if (parts.length > 2) {
      return 'Email can only contain a single "@" symbol.';
    }
    const userPart = parts[0];
    const domainPart = parts[1];
    if (!userPart) {
      return 'Please enter a username before "@" (e.g. deepika@gmail.com).';
    }
    if (!domainPart) {
      return 'Please enter a domain after "@" (e.g. gmail.com).';
    }
    if (!domainPart.includes('.')) {
      return 'Email domain must include an extension like .com (e.g. @gmail.com).';
    }
    const domainSubparts = domainPart.split('.');
    const tld = domainSubparts[domainSubparts.length - 1];
    if (domainSubparts[0].length === 0) {
      return 'Please enter a domain name before the dot (e.g. gmail.com).';
    }
    if (tld.length < 2) {
      return 'Domain extension must be at least 2 letters (e.g. .com, .in, .org).';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return 'Invalid email format. Format must be name@domain.com (e.g. deepika@gmail.com).';
    }
    return ''; // Valid!
  };

  const checkBackendHealth = async () => {
    try {
      setBackendStatus('checking');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('http://localhost:8080/api/products?page=0&size=1', { 
        method: 'GET',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setBackendStatus('online');
        setAuthError(prev => (prev && prev.includes('port 8080') ? '' : prev));
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkBackendHealth();
    }
  }, [isOpen]);

  // Profile Preferences State
  const [preferences, setPreferences] = useState({
    categoryPreferences: '',
    budgetRange: '',
    featurePreferences: ''
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setActiveTab('profile');
      loadUserData();
    } else {
      setActiveTab('login');
      setAuthMode(sanitizeAuthMode(initialMode));
      setAuthError('');
      // Wipe internal modal state so previous account details never leak
      setOrders([]);
      setWishlist([]);
      setPreferences({
        categoryPreferences: '',
        budgetRange: '',
        featurePreferences: ''
      });
      setUsername('');
      setPassword('');
      setEmail('');
      setEmailTouched(false);
      setEmailError('');
      setUsernameTouched(false);
      setPasswordTouched(false);
    }
  }, [currentUser, isOpen, initialMode]);

  const loadUserData = async () => {
    // Reset immediately so previous account's details never linger
    setOrders([]);
    setWishlist([]);
    setPreferences({
      categoryPreferences: '',
      budgetRange: '',
      featurePreferences: ''
    });

    try {
      const prefRes = await userApi.getPreferences();
      if (prefRes.data) {
        setPreferences({
          categoryPreferences: prefRes.data.categoryPreferences || '',
          budgetRange: prefRes.data.budgetRange || '',
          featurePreferences: prefRes.data.featurePreferences || ''
        });
      }
    } catch (err) {
      console.error('Failed to load user preferences:', err);
    }

    setOrdersLoading(true);
    try {
      const orderRes = await orderApi.getMyOrders();
      setOrders(orderRes.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    }
    finally { setOrdersLoading(false); }

    setWishlistLoading(true);
    try {
      const wishRes = await wishlistApi.getAll();
      setWishlist(wishRes.data || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setWishlist([]);
    }
    finally { setWishlistLoading(false); }
  };

  if (!isOpen) return null;

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setResetSuccess('');

    const cleanIdentifier = forgotIdentifier.trim();
    if (!cleanIdentifier) {
      setAuthError('Please enter your Username or Email address.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setAuthError('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setAuthError('New password and confirmation password do not match.');
      return;
    }

    setAuthLoading(true);

    try {
      const res = await authApi.forgotPassword({
        identifier: cleanIdentifier,
        newPassword: forgotNewPassword
      });

      const { token, id, username: uname, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username: uname, role }));

      setForgotIdentifier('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setUsername('');
      setPassword('');
      setAuthLoading(false);
      setResetSuccess(`Password reset successfully! Welcome back, ${uname}.`);

      setTimeout(() => {
        onLoginSuccess && onLoginSuccess({ id, username: uname, role });
        onClose();
      }, 800);
      return;
    } catch (err) {
      console.warn('Backend forgot-password error:', err);
      const isNetworkOrTimeout = err.code === 'ERR_NETWORK' ||
                                 err.code === 'ECONNABORTED' ||
                                 !err.response ||
                                 err.message?.includes('timeout') ||
                                 err.message?.includes('Network Error');

      if (isNetworkOrTimeout) {
        const lowerIdent = cleanIdentifier.toLowerCase();
        let matchedUser = null;
        if (lowerIdent === 'admin' || lowerIdent === 'admin@ecommerce.local') {
          matchedUser = { id: 1, username: 'admin', email: 'admin@ecommerce.local', role: 'ROLE_ADMIN' };
        } else if (lowerIdent === 'deepika' || lowerIdent === 'deepika@ecommerce.local') {
          matchedUser = { id: 2, username: 'deepika', email: 'deepika@ecommerce.local', role: 'ROLE_CUSTOMER' };
        } else {
          const localUsers = JSON.parse(localStorage.getItem('local_registered_users') || '[]');
          const idx = localUsers.findIndex(u => u.username.toLowerCase() === lowerIdent || (u.email && u.email.toLowerCase() === lowerIdent));
          if (idx !== -1) {
            localUsers[idx].password = forgotNewPassword;
            localStorage.setItem('local_registered_users', JSON.stringify(localUsers));
            matchedUser = localUsers[idx];
          }
        }

        if (matchedUser) {
          const token = `offline-token-${matchedUser.id}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(matchedUser));
          setAuthLoading(false);
          setResetSuccess(`Password reset successfully! Welcome back, ${matchedUser.username}.`);
          setTimeout(() => {
            onLoginSuccess && onLoginSuccess(matchedUser);
            onClose();
          }, 800);
          return;
        }

        setAuthError(`No registered local account found for '${cleanIdentifier}'.`);
        setAuthLoading(false);
        return;
      }

      const errMsg = err.response?.data?.message || err.message || 'Password reset failed. Please check your username/email.';
      setAuthError(errMsg);
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      let res;
      if (authMode === 'login') {
        try {
          res = await authApi.login({ username: username.trim(), password });
        } catch (loginErr) {
          console.warn('Backend login attempt error:', loginErr);
          const isNetworkOrTimeout = loginErr.code === 'ERR_NETWORK' || 
                                     loginErr.code === 'ECONNABORTED' || 
                                     !loginErr.response || 
                                     loginErr.message?.includes('timeout') ||
                                     loginErr.message?.includes('Network Error');
          
          if (isNetworkOrTimeout) {
            // 1. Check Pre-Configured Demo Accounts
            if (username.trim() === 'deepika' && password === 'user123') {
              const mockUser = { id: 2, username: 'deepika', email: 'deepika@ecommerce.local', role: 'ROLE_CUSTOMER' };
              localStorage.setItem('token', 'demo-customer-token-deepika');
              localStorage.setItem('user', JSON.stringify(mockUser));
              setAuthLoading(false);
              onLoginSuccess && onLoginSuccess(mockUser);
              onClose();
              return;
            } else if (username.trim() === 'admin' && password === 'admin123') {
              const mockUser = { id: 1, username: 'admin', email: 'admin@ecommerce.local', role: 'ROLE_ADMIN' };
              localStorage.setItem('token', 'demo-admin-token');
              localStorage.setItem('user', JSON.stringify(mockUser));
              setAuthLoading(false);
              onLoginSuccess && onLoginSuccess(mockUser);
              onClose();
              return;
            }

            // 2. Check Locally Registered Accounts
            const localUsers = JSON.parse(localStorage.getItem('local_registered_users') || '[]');
            const foundUser = localUsers.find(
              u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
            );
            if (foundUser) {
              const mockUser = { id: foundUser.id, username: foundUser.username, email: foundUser.email, role: foundUser.role || 'ROLE_CUSTOMER' };
              localStorage.setItem('token', `offline-token-${foundUser.id}`);
              localStorage.setItem('user', JSON.stringify(mockUser));
              setAuthLoading(false);
              onLoginSuccess && onLoginSuccess(mockUser);
              onClose();
              return;
            }
          }
          throw loginErr;
        }
      } else {
        const emailErr = validateEmailFormat(email);
        if (emailErr) {
          setEmailTouched(true);
          setEmailError(emailErr);
          setAuthError(emailErr);
          setAuthLoading(false);
          return;
        }
        if (!username || username.trim().length < 3) {
          setUsernameTouched(true);
          setAuthError('Username must be at least 3 characters.');
          setAuthLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setPasswordTouched(true);
          setAuthError('Password must be at least 6 characters.');
          setAuthLoading(false);
          return;
        }

        try {
          res = await authApi.register({ 
            username: username.trim(), 
            email: email.trim(), 
            password, 
            role: 'ROLE_CUSTOMER' 
          });
        } catch (regErr) {
          console.warn('Backend register attempt error:', regErr);
          const isNetworkOrTimeout = regErr.code === 'ERR_NETWORK' || 
                                     regErr.code === 'ECONNABORTED' || 
                                     !regErr.response || 
                                     regErr.message?.includes('timeout') ||
                                     regErr.message?.includes('Network Error');
          
          if (isNetworkOrTimeout) {
            // Immediate Client-Side Account Creation so registration always works
            const localUsers = JSON.parse(localStorage.getItem('local_registered_users') || '[]');
            const existing = localUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
            if (existing) {
              setAuthError(`Username '${username.trim()}' is already registered.`);
              setAuthLoading(false);
              return;
            }
            const newUserId = Date.now();
            const newUser = {
              id: newUserId,
              username: username.trim(),
              email: email.trim(),
              role: 'ROLE_CUSTOMER'
            };
            localUsers.push({ ...newUser, password });
            localStorage.setItem('local_registered_users', JSON.stringify(localUsers));

            const token = `offline-user-token-${newUserId}`;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));

            setOrders([]);
            setWishlist([]);
            setPreferences({ categoryPreferences: '', budgetRange: '', featurePreferences: '' });
            setUsername('');
            setPassword('');
            setEmail('');
            setEmailTouched(false);
            setEmailError('');
            setUsernameTouched(false);
            setPasswordTouched(false);
            setAuthError('');
            setAuthLoading(false);

            onLoginSuccess && onLoginSuccess(newUser);
            onClose();
            return;
          }
          throw regErr;
        }
      }

      const { token, id, username: uname, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username: uname, role }));
      
      // Wipe local state clean before activating new session
      setOrders([]);
      setWishlist([]);
      setPreferences({ categoryPreferences: '', budgetRange: '', featurePreferences: '' });
      setUsername('');
      setPassword('');
      setEmail('');
      setEmailTouched(false);
      setEmailError('');
      setUsernameTouched(false);
      setPasswordTouched(false);
      setAuthError('');

      onLoginSuccess && onLoginSuccess({ id, username: uname, role });
      onClose();
    } catch (err) {
      console.error('Authentication error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors?.[0]?.defaultMessage;
      if (serverMsg) {
        setAuthError(serverMsg);
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response || err.message?.includes('timeout')) {
        if (authMode === 'register') {
          const localUsers = JSON.parse(localStorage.getItem('local_registered_users') || '[]');
          const existing = localUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
          if (existing) {
            setAuthError(`Username '${username.trim()}' is already registered.`);
            setAuthLoading(false);
            return;
          }
          const newUserId = Date.now();
          const newUser = {
            id: newUserId,
            username: username.trim(),
            email: email.trim(),
            role: 'ROLE_CUSTOMER'
          };
          localUsers.push({ ...newUser, password });
          localStorage.setItem('local_registered_users', JSON.stringify(localUsers));

          const token = `offline-user-token-${newUserId}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(newUser));

          setUsername('');
          setPassword('');
          setEmail('');
          setEmailTouched(false);
          setEmailError('');
          setUsernameTouched(false);
          setPasswordTouched(false);
          setAuthError('');
          setAuthLoading(false);

          onLoginSuccess && onLoginSuccess(newUser);
          onClose();
          return;
        } else if (authMode === 'login') {
          if (username.trim() === 'admin' && password === 'admin123') {
            const mockUser = { id: 1, username: 'admin', role: 'ROLE_ADMIN' };
            localStorage.setItem('token', 'offline-demo-admin-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            onLoginSuccess && onLoginSuccess(mockUser);
            onClose();
            return;
          } else if (username.trim() === 'deepika' && password === 'user123') {
            const mockUser = { id: 2, username: 'deepika', role: 'ROLE_CUSTOMER' };
            localStorage.setItem('token', 'offline-demo-customer-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            onLoginSuccess && onLoginSuccess(mockUser);
            onClose();
            return;
          }
          const localUsers = JSON.parse(localStorage.getItem('local_registered_users') || '[]');
          const foundUser = localUsers.find(
            u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
          );
          if (foundUser) {
            const mockUser = { id: foundUser.id, username: foundUser.username, email: foundUser.email, role: foundUser.role || 'ROLE_CUSTOMER' };
            localStorage.setItem('token', `offline-token-${foundUser.id}`);
            localStorage.setItem('user', JSON.stringify(mockUser));
            onLoginSuccess && onLoginSuccess(mockUser);
            onClose();
            return;
          }
        }
        setAuthError('Backend server (port 8080) did not respond. Please start START_AURA_STORE.bat as Administrator.');
      } else {
        setAuthError(authMode === 'login' 
          ? 'Invalid username or password. Please verify credentials.' 
          : 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefSaving(true);
    setPrefSuccess(false);
    try {
      await userApi.updatePreferences(preferences);
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch {
      alert('Failed to save preferences');
    } finally {
      setPrefSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User className="text-primary" size={20} />
              {currentUser ? `Welcome, ${currentUser.username}` : (authMode === 'login' ? 'Sign In to Your Account' : (authMode === 'register' ? 'Create a New Account' : 'Reset Password & Sign In'))}
            </h3>
            {backendStatus === 'online' ? (
              <span style={{ fontSize: '0.72rem', color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                ● Server Online
              </span>
            ) : backendStatus === 'offline' ? (
              <span onClick={checkBackendHealth} style={{ fontSize: '0.72rem', color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }} title="Click to test connection">
                ● Server Offline (Click to Test)
              </span>
            ) : null}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Not Logged In View */}
        {!currentUser ? (
          <div>
            {authNotice && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.86rem',
                color: '#1e40af',
                lineHeight: 1.45,
                boxShadow: '0 1px 2px rgba(30, 64, 175, 0.05)'
              }}>
                <Lock size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                <span><strong>Authentication Required:</strong> {authNotice}</span>
              </div>
            )}

            {/* VIEW A: FORGOT PASSWORD FORM */}
            {authMode === 'forgot' ? (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                  borderRadius: '10px',
                  border: '1px solid #c7d2fe'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyRound size={18} style={{ color: '#4f46e5' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#312e81' }}>
                      Password Reset & Instant Sign In
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(''); setResetSuccess(''); }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #c7d2fe',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#4f46e5',
                      cursor: 'pointer'
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>

                <div style={{
                  fontSize: '0.82rem',
                  color: '#475569',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '1rem',
                  lineHeight: 1.45
                }}>
                  💡 Enter your registered <strong>Username</strong> or <strong>Email Address</strong> and choose a new password. Once submitted, your password will be updated and you will be <strong>logged in automatically</strong>.
                </div>

                {resetSuccess && (
                  <div style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontSize: '0.86rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600
                  }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                {authError && (
                  <div style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#b91c1c',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Registered Username or Email *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. deepika or deepika@gmail.com or admin"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>New Password *</label>
                      {forgotNewPassword && (
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: forgotNewPassword.length >= 6 ? '#16a34a' : '#dc2626'
                        }}>
                          {forgotNewPassword.length >= 6 ? '✓ Valid (>=6 chars)' : `${forgotNewPassword.length}/6 chars`}
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="Enter new password (min 6 characters)"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Confirm New Password *</label>
                      {forgotConfirmPassword && (
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: forgotNewPassword === forgotConfirmPassword ? '#16a34a' : '#dc2626'
                        }}>
                          {forgotNewPassword === forgotConfirmPassword ? '✓ Passwords Match' : '✕ Does not match'}
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="Re-enter new password to confirm"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    />
                  </div>

                  {/* Quick autofill for easy demo */}
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '6px', fontWeight: 600 }}>Quick Autofill Demo User:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => { setForgotIdentifier('deepika'); setForgotNewPassword('user123'); setForgotConfirmPassword('user123'); setAuthError(''); }}
                        style={{ padding: '3px 8px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Reset Customer (deepika)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setForgotIdentifier('admin'); setForgotNewPassword('admin123'); setForgotConfirmPassword('admin123'); setAuthError(''); }}
                        style={{ padding: '3px 8px', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Reset Admin (admin)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={authLoading}
                    style={{
                      marginTop: '0.25rem',
                      padding: '0.75rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    }}
                  >
                    {authLoading ? 'Updating Password & Logging In...' : <><KeyRound size={18} /> Reset Password & Sign In</>}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); setResetSuccess(''); }}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ← Remember your password? Return to Sign In
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* VIEW B: NORMAL SIGN IN / SIGN UP */
              <div>
                {/* Prominent Sign In / Sign Up Segmented Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  background: '#f1f5f9',
                  padding: '6px',
                  borderRadius: '12px',
                  marginBottom: '1.25rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <button
                    type="button"
                    onClick={() => { 
                      setAuthMode('login'); 
                      setAuthError(''); 
                      setEmailTouched(false); 
                      setEmailError(''); 
                      setUsernameTouched(false); 
                      setPasswordTouched(false); 
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: authMode === 'login' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'transparent',
                      color: authMode === 'login' ? '#ffffff' : '#64748b',
                      boxShadow: authMode === 'login' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
                    }}
                  >
                    <LogIn size={16} /> Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setAuthMode('register'); 
                      setAuthError(''); 
                      setEmailTouched(false); 
                      setEmailError(''); 
                      setUsernameTouched(false); 
                      setPasswordTouched(false); 
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: authMode === 'register' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'transparent',
                      color: authMode === 'register' ? '#ffffff' : '#64748b',
                      boxShadow: authMode === 'register' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
                    }}
                  >
                    <UserPlus size={16} /> Sign Up
                  </button>
                </div>

            {authError && (
              <div style={{
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 500 }}>{authError}</span>
                </div>
                {authError.includes('port 8080') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        checkBackendHealth();
                        if (username && password) {
                          handleAuthSubmit({ preventDefault: () => {} });
                        }
                      }}
                      style={{
                        padding: '4px 14px',
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Retry Connection
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Tip: Double-click <strong>START_AURA_STORE.bat</strong> on your Desktop
                    </span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Username</label>
                  {authMode === 'register' && usernameTouched && username.trim() && (
                    <span style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: 600, 
                      color: username.trim().length >= 3 ? '#16a34a' : '#dc2626' 
                    }}>
                      {username.trim().length >= 3 ? '✓ Username OK' : '✕ Min 3 chars'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder={authMode === 'login' ? "Enter your username (e.g. deepika or admin)" : "Choose a unique username (min 3 chars)"}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (authMode === 'register' && !usernameTouched && e.target.value.length >= 2) {
                      setUsernameTouched(true);
                    }
                  }}
                  onBlur={() => authMode === 'register' && setUsernameTouched(true)}
                  style={{
                    borderColor: authMode === 'register' && usernameTouched && username.trim()
                      ? (username.trim().length >= 3 ? '#22c55e' : '#ef4444')
                      : undefined
                  }}
                />
                {authMode === 'register' && usernameTouched && username.trim().length > 0 && username.trim().length < 3 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontSize: '0.76rem', marginTop: '4px' }}>
                    <AlertCircle size={13} /> <span>Username must be at least 3 characters.</span>
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {emailTouched && email.trim() && (
                      <span style={{ 
                        fontSize: '0.74rem', 
                        fontWeight: 700, 
                        color: validateEmailFormat(email) ? '#dc2626' : '#16a34a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {validateEmailFormat(email) ? '✕ Incomplete' : '✓ Valid Format'}
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. deepika@gmail.com"
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        if (!emailTouched && (val.length >= 2 || val.includes('@'))) {
                          setEmailTouched(true);
                        }
                        setEmailError(validateEmailFormat(val));
                        if (authError && authError.toLowerCase().includes('email')) {
                          setAuthError('');
                        }
                      }}
                      onBlur={() => {
                        setEmailTouched(true);
                        setEmailError(validateEmailFormat(email));
                      }}
                      style={{
                        borderColor: emailTouched && email.trim() 
                          ? (validateEmailFormat(email) ? '#ef4444' : '#22c55e') 
                          : undefined,
                        boxShadow: emailTouched && email.trim()
                          ? (validateEmailFormat(email) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : '0 0 0 3px rgba(34, 197, 94, 0.15)')
                          : undefined,
                        paddingRight: '38px',
                        background: emailTouched && email.trim() && validateEmailFormat(email) ? '#fef2f2' : undefined
                      }}
                    />
                    {emailTouched && email.trim() && (
                      <div style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}>
                        {validateEmailFormat(email) ? (
                          <AlertCircle size={18} color="#ef4444" />
                        ) : (
                          <CheckCircle2 size={18} color="#22c55e" />
                        )}
                      </div>
                    )}
                  </div>
                  {/* Real-time Inline Error Warning */}
                  {emailTouched && validateEmailFormat(email) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      color: '#dc2626',
                      fontSize: '0.78rem',
                      marginTop: '5px',
                      fontWeight: 500,
                      lineHeight: 1.35,
                      background: 'rgba(239, 68, 68, 0.08)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{validateEmailFormat(email)}</span>
                    </div>
                  )}
                  {/* Real-time Success Confirmation */}
                  {emailTouched && !validateEmailFormat(email) && email.trim() && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#16a34a',
                      fontSize: '0.78rem',
                      marginTop: '5px',
                      fontWeight: 500,
                      background: 'rgba(34, 197, 94, 0.08)',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                      <span>Accepted: Valid email format (domain verified)</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setForgotIdentifier(username || '');
                        setForgotNewPassword('');
                        setForgotConfirmPassword('');
                        setAuthError('');
                        setResetSuccess('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4f46e5',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Forgot Password?
                    </button>
                  )}
                  {authMode === 'register' && passwordTouched && password && (
                    <span style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: 600, 
                      color: password.length >= 6 ? '#16a34a' : '#dc2626' 
                    }}>
                      {password.length >= 6 ? '✓ Valid (>=6 chars)' : `${password.length}/6 chars`}
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder={authMode === 'login' ? "Enter your password" : "Create password (minimum 6 characters)"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authMode === 'register' && !passwordTouched && e.target.value.length >= 2) {
                      setPasswordTouched(true);
                    }
                  }}
                  onBlur={() => authMode === 'register' && setPasswordTouched(true)}
                  style={{
                    borderColor: authMode === 'register' && passwordTouched && password
                      ? (password.length >= 6 ? '#22c55e' : '#ef4444')
                      : undefined
                  }}
                />
                {authMode === 'register' && passwordTouched && password.length > 0 && password.length < 6 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontSize: '0.76rem', marginTop: '4px' }}>
                    <AlertCircle size={13} /> <span>Password must be at least 6 characters.</span>
                  </div>
                )}
              </div>

              {authMode === 'login' && (
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', fontSize: '0.8rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong>Quick Autofill Demo Credentials:</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => { setUsername('admin'); setPassword('admin123'); setAuthError(''); }}
                      style={{
                        padding: '4px 10px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        border: '1px solid #c7d2fe',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Autofill Admin (admin / admin123)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUsername('deepika'); setPassword('user123'); setAuthError(''); }}
                      style={{
                        padding: '4px 10px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Autofill Customer (deepika / user123)
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={authLoading} 
                style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.75rem', 
                  fontSize: '0.95rem', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px' 
                }}
              >
                {authLoading ? (
                  'Verifying Credentials...'
                ) : authMode === 'login' ? (
                  <><LogIn size={18} /> Sign In to Account</>
                ) : (
                  <><UserPlus size={18} /> Create New Account</>
                )}
              </button>

              {/* Bottom Toggle Link */}
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                {authMode === 'login' ? (
                  <div>
                    <span>
                      Don't have an account yet?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setAuthError(''); }}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Sign Up Here
                      </button>
                    </span>
                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setForgotIdentifier(username || '');
                          setForgotNewPassword('');
                          setForgotConfirmPassword('');
                          setAuthError('');
                          setResetSuccess('');
                        }}
                        style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                      >
                        Forgot password? Reset & Instant Sign In
                      </button>
                    </div>
                  </div>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Sign In Here
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    ) : (
          /* Logged In View with Tabs */
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 600 }}
                onClick={() => setActiveTab('profile')}
              >
                <Sliders size={14} /> Preferences
              </button>
              <button
                className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 600 }}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={14} /> Orders ({orders.length})
              </button>
              <button
                className={`btn ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 600 }}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={14} /> Wishlist ({wishlist.length})
              </button>
              <button
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', fontSize: '0.82rem', padding: '0.45rem 0.9rem', color: '#dc2626', borderColor: '#fca5a5', fontWeight: 600 }}
                onClick={() => {
                  setOrders([]);
                  setWishlist([]);
                  setPreferences({ categoryPreferences: '', budgetRange: '', featurePreferences: '' });
                  setUsername('');
                  setPassword('');
                  setEmail('');
                  setAuthError('');
                  onLogout && onLogout();
                  onClose && onClose();
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            {/* Profile / Preferences Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: '#f8fafc', 
                  padding: '0.85rem 1.25rem', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0', 
                  fontSize: '0.88rem',
                  color: '#334155'
                }}>
                  <span>User Role: <strong style={{ color: '#4f46e5', fontWeight: 700 }}>{currentUser.role}</strong></span>
                  <span>User ID: <strong style={{ color: '#0f172a', fontWeight: 700 }}>#{currentUser.id}</strong></span>
                </div>

                {prefSuccess && (
                  <div style={{ padding: '0.65rem 1rem', borderRadius: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Preferences successfully updated in database!
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Preferred Categories (e.g. Laptops, Smartphones)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={preferences.categoryPreferences}
                    onChange={(e) => setPreferences({ ...preferences, categoryPreferences: e.target.value })}
                    placeholder="e.g. Laptops, Audio"
                    style={{ background: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Typical Budget Range (e.g. 50000-80000)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={preferences.budgetRange}
                    onChange={(e) => setPreferences({ ...preferences, budgetRange: e.target.value })}
                    placeholder="e.g. 40000-75000"
                    style={{ background: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Feature Preferences (e.g. 16GB RAM, OLED, Battery, ANC)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={preferences.featurePreferences}
                    onChange={(e) => setPreferences({ ...preferences, featurePreferences: e.target.value })}
                    placeholder="e.g. 16GB RAM, Long Battery, Fast Charging"
                    style={{ background: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={prefSaving} style={{ marginTop: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 600 }}>
                  {prefSaving ? 'Saving...' : 'Save Recommendation Preferences'}
                </button>
              </form>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {ordersLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No orders placed yet.</p>
                ) : (
                  orders.map(order => {
                    const status = (order.status || 'PLACED').toUpperCase();
                    let badgeBg = '#fffbeb';
                    let badgeColor = '#b45309';
                    let badgeBorder = '#fde68a';
                    if (status === 'DELIVERED') {
                      badgeBg = '#ecfdf5';
                      badgeColor = '#047857';
                      badgeBorder = '#a7f3d0';
                    } else if (status === 'SHIPPED') {
                      badgeBg = '#eff6ff';
                      badgeColor = '#1d4ed8';
                      badgeBorder = '#bfdbfe';
                    } else if (status === 'CONFIRMED') {
                      badgeBg = '#f5f3ff';
                      badgeColor = '#6d28d9';
                      badgeBorder = '#ddd6fe';
                    } else if (status === 'CANCELLED') {
                      badgeBg = '#fef2f2';
                      badgeColor = '#b91c1c';
                      badgeBorder = '#fecaca';
                    }

                    const formattedTotal = (order.totalPrice ?? order.totalAmount ?? 0).toLocaleString('en-IN');

                    return (
                      <div 
                        key={order.id} 
                        style={{ 
                          background: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          padding: '1.15rem 1.25rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                              Order #{order.id}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                            </span>
                          </div>
                          <span 
                            style={{ 
                              background: badgeBg, 
                              color: badgeColor, 
                              border: `1px solid ${badgeBorder}`,
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              letterSpacing: '0.4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 500, lineHeight: 1.45 }}>
                          {order.items?.map(it => `${it.product?.name || it.productName || 'Product'} × ${it.quantity}`).join(', ') || 'No item details'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                            Total Price:
                          </span>
                          <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.05rem' }}>
                            ₹{formattedTotal}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {wishlistLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading wishlist...</p>
                ) : wishlist.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Your wishlist is empty.</p>
                ) : (
                  wishlist.map(w => {
                    const prod = w.product || {};
                    return (
                      <div
                        key={w.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem', 
                          background: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          padding: '0.85rem 1.15rem', 
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onClick={() => {
                          onClose();
                          onOpenProductDetails && onOpenProductDetails(prod.id || w.productId);
                        }}
                      >
                        <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                            {prod.name || 'Product'}
                          </h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {prod.brand && (
                              <span style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                {prod.brand}
                              </span>
                            )}
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {prod.category || ''}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1rem' }}>
                          ₹{(prod.price || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
