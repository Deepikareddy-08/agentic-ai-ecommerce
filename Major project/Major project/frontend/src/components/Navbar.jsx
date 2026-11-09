import { 
  ShoppingBag, 
  Sparkles, 
  Layers, 
  Bot, 
  User, 
  Shield, 
  ShoppingCart,
  Heart,
  Search,
  LogIn,
  UserPlus,
  X
} from 'lucide-react';

export default function Navbar({ 
  activeTab = 'catalogue', 
  setActiveTab, 
  cartCount = 0, 
  cartTotal = 0, 
  onOpenCart, 
  currentUser, 
  onOpenProfile,
  searchQuery = '',
  setSearchQuery,
  onSearch,
  compareCount = 0,
  wishlistCount = 0
}) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(12px)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab && setActiveTab('catalogue')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
          }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                Aura<span style={{ color: '#ff9800' }}>Store</span>
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Personalized Smart E-Commerce</p>
          </div>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (activeTab !== 'catalogue' && setActiveTab) {
              setActiveTab('catalogue');
            }
            if (onSearch) onSearch(e);
          }}
          style={{ display: 'flex', alignItems: 'center', flex: '1 1 260px', maxWidth: '380px', position: 'relative' }}
        >
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search products, brands, specs..."
            value={searchQuery}
            onFocus={() => {
              if (activeTab !== 'catalogue' && setActiveTab) {
                setActiveTab('catalogue');
              }
            }}
            onChange={(e) => {
              if (activeTab !== 'catalogue' && setActiveTab) {
                setActiveTab('catalogue');
              }
              if (setSearchQuery) setSearchQuery(e.target.value);
            }}
            style={{
              paddingLeft: '36px',
              paddingRight: searchQuery ? '32px' : '12px',
              height: '38px',
              fontSize: '0.85rem'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (setSearchQuery) setSearchQuery('');
              }}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '50%'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`btn btn-sm ${activeTab === 'catalogue' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <ShoppingBag size={14} /> Catalogue
          </button>

          <button
            onClick={() => setActiveTab('ai-advisor')}
            className={`btn btn-sm ${activeTab === 'ai-advisor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <Bot size={15} /> AI Advisor
          </button>


          <button
            onClick={() => setActiveTab('compare')}
            className={`btn btn-sm ${activeTab === 'compare' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <Layers size={14} /> Compare
            {compareCount > 0 && (
              <span className="badge badge-info" style={{ marginLeft: '4px', padding: '1px 5px', fontSize: '0.68rem' }}>
                {compareCount}
              </span>
            )}
          </button>

          {currentUser && currentUser.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`btn btn-sm ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderColor: 'var(--accent)' }}
            >
              <Shield size={14} /> Admin
            </button>
          )}
        </nav>

        {/* Actions: Wishlist, Cart & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Wishlist Button */}
          <button 
            onClick={() => onOpenProfile && onOpenProfile(currentUser ? 'profile' : 'login')} 
            className="btn btn-secondary"
            title="Wishlist"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Heart size={15} style={{ color: 'var(--danger)' }} />
            {wishlistCount > 0 && <span>{wishlistCount}</span>}
          </button>

          {/* Cart Button */}
          <button 
            onClick={onOpenCart} 
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem'
            }}
          >
            <ShoppingCart size={15} />
            <span>₹{(cartTotal || 0).toLocaleString('en-IN')}</span>
            {cartCount > 0 && (
              <span className="badge badge-success" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Actions */}
          {currentUser ? (
            <button 
              onClick={() => onOpenProfile('profile')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <User size={15} />
              <span>{currentUser.username}</span>
              {currentUser.role === 'ROLE_ADMIN' && (
                <span className="badge badge-accent" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>ADMIN</span>
              )}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                onClick={() => onOpenProfile('login')}
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  padding: '0.45rem 0.8rem', 
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Sign in to your account"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>

              <button 
                onClick={() => onOpenProfile('register')}
                className="btn btn-accent"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  padding: '0.45rem 0.85rem', 
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Create a new account"
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
