import os

app_path = r"c:\Users\Deepika\Desktop\Major project (2)\Major project\Major project\frontend\src\App.jsx"

with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state for authNotice and pendingCheckoutItem
old_state_block = """  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');"""

new_state_block = """  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authNotice, setAuthNotice] = useState('');
  const [pendingCheckoutItem, setPendingCheckoutItem] = useState(null);"""

if old_state_block in content:
    content = content.replace(old_state_block, new_state_block, 1)
    print("1. Added authNotice & pendingCheckoutItem state.")
else:
    print("WARNING: Could not find old_state_block.")

# 2. Update handleBuyNow & handleProceedToPaymentFromCart
old_payment_handlers = """  // Payment checkout & Buy Now handlers
  const handleBuyNow = (product) => {
    setPaymentItems([{ product, quantity: 1 }]);
    setIsPaymentOpen(true);
  };

  const handleProceedToPaymentFromCart = () => {
    if (cart.length === 0) return;
    setPaymentItems(cart);
    setCartDrawerOpen(false);
    setIsPaymentOpen(true);
  };"""

new_payment_handlers = """  // Payment checkout & Buy Now handlers (Strictly requires Authentication)
  const handleBuyNow = (product) => {
    if (!currentUser) {
      setPendingCheckoutItem(product);
      setAuthNotice(`Please sign in or create an account to purchase "${product.name}".`);
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      showToast('Authentication required: Please sign in or sign up to buy this product.', 'info');
      return;
    }
    setPaymentItems([{ product, quantity: 1 }]);
    setIsPaymentOpen(true);
  };

  const handleProceedToPaymentFromCart = () => {
    if (!currentUser) {
      setPendingCheckoutItem('cart');
      setCartDrawerOpen(false);
      setAuthNotice('Please sign in or create an account to complete your checkout.');
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      showToast('Authentication required: Please sign in to proceed to checkout.', 'info');
      return;
    }
    if (cart.length === 0) return;
    setPaymentItems(cart);
    setCartDrawerOpen(false);
    setIsPaymentOpen(true);
  };"""

if old_payment_handlers in content:
    content = content.replace(old_payment_handlers, new_payment_handlers, 1)
    print("2. Updated handleBuyNow and handleProceedToPaymentFromCart.")
else:
    print("WARNING: Could not find old_payment_handlers.")

# 3. Update handleLoginSuccess & handleLogout
old_login_logout = """  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const userCart = loadUserCart(user);
    setCart(userCart);
    showToast(`Welcome back, ${user.username}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setCurrentUser(null);
    const guestCart = loadUserCart(null);
    setCart(guestCart);
    setWishlistIds([]);
    if (activeTab === 'admin') {
      setActiveTab('catalogue');
    }
    showToast('Signed out successfully');
  };"""

new_login_logout = """  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const userCart = loadUserCart(user);
    setCart(userCart);
    setAuthModalOpen(false);
    setAuthNotice('');

    // Resume checkout automatically if user was attempting to purchase before signing in
    if (pendingCheckoutItem) {
      if (pendingCheckoutItem === 'cart') {
        const itemsToPay = userCart.length > 0 ? userCart : cart;
        if (itemsToPay.length > 0) {
          setPaymentItems(itemsToPay);
          setIsPaymentOpen(true);
          showToast(`Welcome back, ${user.username}! Resuming your secure checkout...`, 'success');
        } else {
          showToast(`Welcome back, ${user.username}!`, 'success');
        }
      } else {
        const targetProd = pendingCheckoutItem;
        setPaymentItems([{ product: targetProd, quantity: 1 }]);
        setIsPaymentOpen(true);
        showToast(`Welcome back, ${user.username}! Resuming your purchase of "${targetProd.name}"...`, 'success');
      }
      setPendingCheckoutItem(null);
    } else {
      showToast(`Welcome back, ${user.username}!`, 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setCurrentUser(null);
    const guestCart = loadUserCart(null);
    setCart(guestCart);
    setWishlistIds([]);
    setIsPaymentOpen(false);
    setPaymentItems([]);
    setPendingCheckoutItem(null);
    setAuthNotice('');
    if (activeTab === 'admin') {
      setActiveTab('catalogue');
    }
    showToast('Signed out successfully');
  };"""

if old_login_logout in content:
    content = content.replace(old_login_logout, new_login_logout, 1)
    print("3. Updated handleLoginSuccess and handleLogout.")
else:
    print("WARNING: Could not find old_login_logout.")

# 4. Clear authNotice on manual profile open
old_nav_open = """        onOpenProfile={(mode = 'login') => {
          const sanitizedMode = (typeof mode === 'string' && (mode === 'register' || mode === 'login' || mode === 'profile')) ? mode : 'login';
          setAuthInitialMode(sanitizedMode);
          setAuthModalOpen(true);
        }}"""

new_nav_open = """        onOpenProfile={(mode = 'login') => {
          const sanitizedMode = (typeof mode === 'string' && (mode === 'register' || mode === 'login' || mode === 'profile')) ? mode : 'login';
          setAuthNotice('');
          setAuthInitialMode(sanitizedMode);
          setAuthModalOpen(true);
        }}"""

if old_nav_open in content:
    content = content.replace(old_nav_open, new_nav_open, 1)
    print("4. Updated onOpenProfile in Navbar.")
else:
    print("WARNING: Could not find old_nav_open.")

# 5. Update UserProfileModal props to include authNotice
old_user_modal = """      {/* User Profile / Auth Modal */}
      <UserProfileModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenProductDetails={handleOpenProductDetails}
      />"""

new_user_modal = """      {/* User Profile / Auth Modal */}
      <UserProfileModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        authNotice={authNotice}
        onClose={() => { setAuthModalOpen(false); setAuthNotice(''); }}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOpenProductDetails={handleOpenProductDetails}
      />"""

if old_user_modal in content:
    content = content.replace(old_user_modal, new_user_modal, 1)
    print("5. Updated UserProfileModal props.")
else:
    print("WARNING: Could not find old_user_modal.")

with open(app_path, "w", encoding="utf-8") as f:
    f.write(content)

print("[SUCCESS] App.jsx updated successfully.")

