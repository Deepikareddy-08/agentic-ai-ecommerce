import { Heart, Layers, Eye, Check } from 'lucide-react';

const getCategoryFallbackImage = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('phone') || cat.includes('smartphone')) return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop';
  if (cat.includes('laptop')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop';
  if (cat.includes('audio') || cat.includes('headphone') || cat.includes('speaker')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop';
  if (cat.includes('watch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop';
  if (cat.includes('tv')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop';
  if (cat.includes('camera') || cat.includes('gaming')) return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop';
  if (cat.includes('vr') || cat.includes('ar')) return 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop';
};

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  onToggleWishlist,
  isInWishlist,
  isWishlisted,
  onToggleCompare,
  isCompared,
  onViewDetails,
  onOpenDetails,
  currency = 'USD'
}) {
  const isOutOfStock = (product.stockQuantity || product.stock || 0) <= 0;
  const isLowStock = !isOutOfStock && (product.stockQuantity || product.stock || 0) <= 5;
  const activeWishlist = isWishlisted || isInWishlist;

  const handleOpenDetails = () => {
    if (onOpenDetails) onOpenDetails(product.id);
    else if (onViewDetails) onViewDetails(product);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(product.id);
    else if (onAddToWishlist) onAddToWishlist(product);
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    if (onToggleCompare) onToggleCompare(product.id);
  };

  // Price formatting: Support USD ($) as in the screenshot or INR (₹)
  const isUsd = currency === 'USD';
  const displayPrice = isUsd 
    ? `$${((product.price || 0) / 80).toFixed(2)}`
    : `₹${(product.price || 0).toLocaleString('en-IN')}`;

  const originalPriceVal = isUsd
    ? ((product.price || 0) / 80) * 1.5
    : Math.round((product.price || 0) * 1.4);

  const displayOriginalPrice = isUsd
    ? `$${originalPriceVal.toFixed(2)}`
    : `₹${originalPriceVal.toLocaleString('en-IN')}`;

  return (
    <div 
      className="product-card-item"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Top Image Box */}
      <div 
        onClick={handleOpenDetails}
        style={{
          position: 'relative',
          width: '100%',
          height: '185px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop'}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getCategoryFallbackImage(product.category);
          }}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Compare Button Pill (Top-Left) */}
        <button
          onClick={handleCompareClick}
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            padding: '3px 8px',
            borderRadius: '12px',
            background: isCompared ? '#ff9800' : 'rgba(255, 255, 255, 0.92)',
            color: isCompared ? '#ffffff' : '#475569',
            border: isCompared ? '1px solid #e68a00' : '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            zIndex: 2,
            transition: 'all 0.2s'
          }}
          title={isCompared ? 'In Comparison List (Click to remove)' : 'Add to Compare'}
        >
          {isCompared ? <Check size={11} /> : <Layers size={11} />}
          <span>{isCompared ? 'Comparing' : 'Compare'}</span>
        </button>

        {/* Wishlist Button (Top-Right) */}
        <button
          onClick={handleWishlistClick}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            zIndex: 2,
            transition: 'transform 0.15s'
          }}
          title={activeWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={14} color={activeWishlist ? '#ef4444' : '#94a3b8'} fill={activeWishlist ? '#ef4444' : 'none'} />
        </button>

        {/* Stock / Eye Badge */}
        {isOutOfStock ? (
          <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '10px', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '10px', background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
            Only {product.stockQuantity || product.stock} left
          </span>
        ) : null}

        {/* Quick View Details Button (Bottom-Right overlay) */}
        <button
          onClick={(e) => { e.stopPropagation(); handleOpenDetails(); }}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            zIndex: 2
          }}
          title="Quick View Details"
        >
          <Eye size={13} />
        </button>
      </div>

      {/* Product Information */}
      <div style={{ padding: '10px 14px 4px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3
            onClick={handleOpenDetails}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              margin: '0 0 3px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3
            }}
            title={product.name}
          >
            {product.name}
          </h3>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            {product.brand} • {product.category}
          </div>
        </div>
      </div>

      {/* Price Row: Current Price Left | Strikethrough Original Price Right */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '6px 14px 10px' }}>
        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
          {displayPrice}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8', textDecoration: 'line-through' }}>
          {displayOriginalPrice}
        </span>
      </div>

      {/* Dual Action: ADD TO CART & BUY NOW Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#e2e8f0' }}>
        <button
          onClick={() => onAddToCart && onAddToCart(product)}
          disabled={isOutOfStock}
          style={{
            background: isOutOfStock ? '#cbd5e1' : '#ff9800',
            color: '#ffffff',
            border: 'none',
            padding: '10px 4px',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            outline: 'none'
          }}
          onMouseOver={(e) => {
            if (!isOutOfStock) e.currentTarget.style.background = '#e68a00';
          }}
          onMouseOut={(e) => {
            if (!isOutOfStock) e.currentTarget.style.background = '#ff9800';
          }}
        >
          {isOutOfStock ? 'Sold Out' : 'ADD TO CART'}
        </button>

        <button
          onClick={() => onBuyNow && onBuyNow(product)}
          disabled={isOutOfStock}
          style={{
            background: isOutOfStock ? '#cbd5e1' : '#0d2757',
            color: '#ffffff',
            border: 'none',
            padding: '10px 4px',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            outline: 'none'
          }}
          onMouseOver={(e) => {
            if (!isOutOfStock) e.currentTarget.style.background = '#1e3a8a';
          }}
          onMouseOut={(e) => {
            if (!isOutOfStock) e.currentTarget.style.background = '#0d2757';
          }}
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}
