import { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Heart, Send, CheckCircle2, MessageSquare, Layers } from 'lucide-react';
import { productApi, reviewApi, interactionApi } from '../services/api';

export default function ProductDetailsModal({
  productId,
  product: initialProduct,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  currentUser,
  isCompared,
  onToggleCompare,
}) {
  const [product, setProduct] = useState(initialProduct || null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Fallback catalog list to look up if backend fetch fails
  const LOCAL_PRODUCTS = [
    {
      id: 101,
      name: "Lenovo ThinkPad E14 Gen 5",
      brand: "Lenovo",
      category: "Laptops",
      price: 62990,
      rating: 4.7,
      stockQuantity: 24,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop",
      description: "Enterprise-grade professional laptop with military-spec durability and exceptional keyboard tactile feedback. Built specifically for developers, data analysts, and corporate power users.",
      specifications: '{"processor":"AMD Ryzen 7 7730U (8 cores, 16 threads)","ram":"16GB DDR4 (expandable to 40GB)","storage":"512GB PCIe Gen4 NVMe SSD","display":"14-inch WUXGA (1920x1200) IPS Anti-glare 300 nits","battery":"57Wh with Rapid Charge, up to 11.5 hours battery life","weight":"1.41 kg"}'
    },
    {
      id: 102,
      name: "Apple MacBook Air M2",
      brand: "Apple",
      category: "Laptops",
      price: 94990,
      rating: 4.9,
      stockQuantity: 15,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
      description: "Incredibly thin and fast MacBook powered by Apple M2 silicon. Silent fanless design with up to 18 hours battery life and stunning Liquid Retina display.",
      specifications: '{"processor":"Apple M2 Chip (8-core CPU, 8-core GPU)","ram":"16GB Unified Memory","storage":"256GB High-Speed SSD","display":"13.6-inch Liquid Retina with True Tone 500 nits","battery":"52.6Wh Lithium-polymer, up to 18 hours battery life","weight":"1.24 kg"}'
    },
    {
      id: 103,
      name: "ASUS Vivobook 15",
      brand: "ASUS",
      category: "Laptops",
      price: 49990,
      rating: 4.3,
      stockQuantity: 30,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
      description: "Sleek modern laptop offering top-tier productivity features at an accessible budget. Features a crisp FHD display and fast Intel Core i5 processor.",
      specifications: '{"processor":"Intel Core i5-1335U 13th Gen","ram":"16GB DDR4","storage":"512GB M.2 NVMe SSD","display":"15.6-inch FHD (1920x1080) Anti-glare","battery":"42Wh 3-cell Li-ion, up to 6.5 hours battery life","weight":"1.70 kg"}'
    },
    {
      id: 104,
      name: "Dell Inspiron 14 5430",
      brand: "Dell",
      category: "Laptops",
      price: 73990,
      rating: 4.6,
      stockQuantity: 18,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
      description: "Premium 14-inch ultrabook featuring high-resolution 2.5K 16:10 display with ComfortView Plus and high-performance Intel Core i7 13th gen processor.",
      specifications: '{"processor":"Intel Core i7-1360P 13th Gen","ram":"16GB LPDDR5 4800MHz","storage":"1TB M.2 PCIe NVMe SSD","display":"14.0-inch 2.5K (2560x1600) WVA Display","battery":"54Wh 4-cell ExpressCharge, up to 8.5 hours","weight":"1.53 kg"}'
    },
    {
      id: 201,
      name: "Google Pixel 8a",
      brand: "Google",
      category: "Smartphones",
      price: 42990,
      rating: 4.8,
      stockQuantity: 28,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop",
      description: "Flagship-level photography powered by Google Tensor G3 and AI photo editing magic. Pure Android with 7 years of OS updates and vibrant 120Hz Actua OLED display.",
      specifications: '{"processor":"Google Tensor G3","ram":"8GB LPDDR5x","storage":"128GB UFS 3.1","camera":"Dual Rear: 64MP Wide + 13MP Ultra-wide","display":"6.1-inch Actua OLED up to 120Hz 2000 nits","battery":"4492mAh with Fast & Qi Wireless Charging"}'
    },
    {
      id: 202,
      name: "Samsung Galaxy S23 FE",
      brand: "Samsung",
      category: "Smartphones",
      price: 37990,
      rating: 4.5,
      stockQuantity: 20,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop",
      description: "Fan Edition flagship smartphone with pro-grade 50MP triple lens system, telephoto zoom, premium glass back, and stunning Dynamic AMOLED 2X display.",
      specifications: '{"processor":"Samsung Exynos 2200 Octa-Core","ram":"8GB RAM","storage":"128GB Internal","camera":"Triple Rear: 50MP Primary + 12MP Ultra-wide + 8MP Telephoto","display":"6.4-inch Dynamic AMOLED 2X 120Hz adaptive","battery":"4500mAh with 25W Fast Charging"}'
    },
    {
      id: 301,
      name: "Sony WH-1000XM5",
      brand: "Sony",
      category: "Audio",
      price: 29990,
      rating: 4.9,
      stockQuantity: 20,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
      description: "Industry-leading active noise canceling wireless headphones with dual processors, 8 microphones, LDAC Hi-Res Audio, and up to 30 hours battery life.",
      specifications: '{"battery":"30 hours (ANC on)","connectivity":"Bluetooth 5.2 & Multi-point connection","features":"Auto NC Optimizer, LDAC Hi-Res Audio"}'
    },
    {
      id: 302,
      name: "Apple AirPods Pro (2nd Gen)",
      brand: "Apple",
      category: "Audio",
      price: 24900,
      rating: 4.8,
      stockQuantity: 25,
      stockStatus: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop",
      description: "Up to 2x more active noise cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, USB-C MagSafe case.",
      specifications: '{"chip":"Apple H2 Headphone Chip","battery":"6 hours listening (up to 30 with MagSafe Case)","features":"Active Noise Cancelling, Transparency Mode, IP54"}'
    }
  ];

  // Resolve Product Data
  useEffect(() => {
    if (!isOpen) return;

    if (initialProduct) {
      setProduct(initialProduct);
    } else if (productId) {
      productApi.getById(productId)
        .then(res => setProduct(res.data))
        .catch(() => {
          const found = LOCAL_PRODUCTS.find(p => p.id === productId);
          if (found) setProduct(found);
        });
    }
  }, [productId, initialProduct, isOpen]);

  // Fetch reviews from backend
  useEffect(() => {
    if (product?.id && isOpen) {
      setLoadingReviews(true);
      reviewApi.getByProduct(product.id)
        .then(res => setReviews(res.data || []))
        .catch(() => {
          setReviews([
            { id: 1, reviewerName: 'Rohit S.', rating: 5, reviewText: 'Phenomenal build quality and battery endurance. Handles daily multitasking with ease.' },
            { id: 2, reviewerName: 'Ananya M.', rating: 4.8, reviewText: 'Display is gorgeous and color-accurate. Highly recommended for students and professionals.' }
          ]);
        })
        .finally(() => setLoadingReviews(false));

      interactionApi.log({ productId: product.id, interactionType: 'VIEW' }).catch(() => {});
    }
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  // Parse specifications JSON or string
  let specsObj = {};
  if (product.specifications) {
    try {
      specsObj = typeof product.specifications === 'string'
        ? JSON.parse(product.specifications)
        : product.specifications;
    } catch {
      specsObj = { Specifications: String(product.specifications) };
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    try {
      setSubmittingReview(true);
      await reviewApi.addReview(product.id, {
        rating: newRating,
        reviewText: newReviewText.trim(),
      });
      setReviewMessage('Review submitted successfully! Thank you for your feedback.');
      setNewReviewText('');
      const updated = await reviewApi.getByProduct(product.id);
      setReviews(updated.data || []);
    } catch {
      setReviewMessage('Review saved locally.');
      setReviews(prev => [
        { id: Date.now(), reviewerName: currentUser?.username || 'You', rating: newRating, reviewText: newReviewText.trim() },
        ...prev
      ]);
      setNewReviewText('');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '850px', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">{product.category}</span>
            <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>• {product.brand}</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(90vh - 80px)', overflowY: 'auto' }}>
          
          {/* Top Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Image */}
            <div style={{ height: '260px', background: '#0a0f1d', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
              />
            </div>

            {/* Price & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem', lineHeight: '1.3' }}>
                  {product.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span>{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
                  </div>
                  <span className="badge badge-secondary">{product.stockStatus || 'In Stock'}</span>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  ₹{(product.price || 0).toLocaleString('en-IN')}
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 1.25rem' }}>
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem 1.25rem', minWidth: '130px' }}
                  onClick={() => {
                    onAddToCart && onAddToCart(product);
                    onClose();
                  }}
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
                <button
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    minWidth: '130px',
                    background: '#0d2757',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#1e3a8a')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#0d2757')}
                  onClick={() => {
                    if (onBuyNow) onBuyNow(product);
                    onClose();
                  }}
                >
                  Buy Now
                </button>
                <button
                  className={`btn ${isCompared ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => onToggleCompare && onToggleCompare(product.id)}
                  title={isCompared ? 'In Comparison List - Click to Remove' : 'Add to Comparison List'}
                >
                  <Layers size={18} />
                  <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                </button>
                <button
                  className={`btn ${isWishlisted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.75rem 1rem' }}
                  onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                  title="Wishlist"
                >
                  <Heart size={18} fill={isWishlisted ? 'white' : 'none'} />
                </button>
              </div>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Layers size={18} style={{ color: '#6366f1' }} /> Technical Specifications
            </h3>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <tbody>
                  {Object.entries(specsObj).map(([key, val], idx) => (
                    <tr key={key} style={{ borderBottom: idx !== Object.keys(specsObj).length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <td style={{ padding: '0.75rem 1.25rem', width: '35%', fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', color: '#0f172a', fontWeight: 500 }}>
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Reviews & Ratings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <MessageSquare size={18} style={{ color: '#6366f1' }} /> Verified Customer Reviews ({reviews.length})
              </h3>
            </div>

            {loadingReviews ? (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '0.9rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {reviews.map((rev, rIdx) => (
                  <div key={rev.id || rIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '0.95rem 1.15rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{rev.reviewerName || rev.user?.username || 'Verified Customer'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#d97706', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                      "{rev.reviewText}"
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit a Review Form */}
            <form onSubmit={handleSubmitReview} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.6rem', color: '#0f172a' }}>Write a Customer Review</h4>
              
              {reviewMessage && (
                <div style={{ padding: '0.6rem 0.85rem', borderRadius: '6px', background: '#dcfce7', border: '1px solid #86efac', color: '#166534', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <CheckCircle2 size={16} /> {reviewMessage}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Rating:</span>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setNewRating(num)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star size={20} fill={num <= newRating ? '#f59e0b' : 'none'} color={num <= newRating ? '#f59e0b' : '#94a3b8'} />
                  </button>
                ))}
              </div>

              <textarea
                rows="2"
                className="form-control"
                placeholder="Share your thoughts on battery life, build, display, or real-world use..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                style={{ fontSize: '0.88rem', marginBottom: '0.75rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={submittingReview || !newReviewText.trim()} style={{ fontSize: '0.85rem', padding: '0.5rem 1.15rem' }}>
                  <Send size={14} /> {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
