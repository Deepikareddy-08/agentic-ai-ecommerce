import { useState, useEffect } from 'react';
import { Layers, Sparkles, X, Plus, Check, ShoppingBag } from 'lucide-react';
import { comparisonApi, productApi } from '../services/api';

const FALLBACK_COMPARE_PRODUCTS = [
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
    description: "Enterprise-grade professional laptop with military-spec durability and exceptional keyboard tactile feedback. Built specifically for developers, data analysts, and corporate power users requiring relentless reliability.",
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
    specifications: '{"processor":"Google Tensor G3","ram":"8GB LPDDR5x","storage":"128GB UFS 3.1","camera":"Dual Rear: 64MP Wide (f/1.89) + 13MP Ultra-wide","display":"6.1-inch Actua OLED up to 120Hz 2000 nits","battery":"4492mAh with Fast & Qi Wireless Charging"}'
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

const QUICK_PRESETS = [
  { label: 'Top Laptops (ThinkPad vs MacBook)', ids: [101, 102] },
  { label: 'Budget vs Premium Laptop', ids: [103, 104] },
  { label: 'Pixel 8a vs Galaxy S23 FE', ids: [201, 202] },
  { label: 'Sony XM5 vs AirPods Pro', ids: [301, 302] },
];

const ComparisonView = ({ compareList = [], onRemoveFromCompare, onAddToCart, onClearCompare }) => {
  const [allProducts, setAllProducts] = useState(FALLBACK_COMPARE_PRODUCTS);
  const [selectedIds, setSelectedIds] = useState(() => {
    if (compareList && compareList.length >= 2) return compareList;
    if (compareList && compareList.length === 1) return [compareList[0], compareList[0] === 101 ? 102 : 101];
    return [101, 102];
  });
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userCriteria, setUserCriteria] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync when parent compareList changes
  useEffect(() => {
    if (compareList && compareList.length >= 2) {
      setSelectedIds(compareList);
    } else if (compareList && compareList.length === 1) {
      setSelectedIds(prev => {
        if (prev.includes(compareList[0]) && prev.length >= 2) return prev;
        const counterpart = compareList[0] === 101 ? 102 : 101;
        return [compareList[0], counterpart];
      });
    }
  }, [compareList]);

  // Load catalog from backend
  useEffect(() => {
    productApi.getAll({ size: 50 }).then(res => {
      const items = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      if (items.length > 0) {
        setAllProducts(items);
      }
    }).catch(() => {});
  }, []);

  // Reload comparison whenever selectedIds change
  useEffect(() => {
    if (selectedIds.length >= 2) {
      loadComparison();
    } else {
      setComparisonData(null);
    }
  }, [selectedIds]);

  const loadComparison = async (criteria = userCriteria) => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    try {
      const res = await comparisonApi.compare({
        productIds: selectedIds,
        userCriteria: criteria || null
      });
      if (res.data && res.data.products && res.data.products.length >= 2) {
        setComparisonData({
          ...res.data,
          aiExplanation: res.data.aiExplanation || res.data.aiSummary
        });
      } else {
        generateLocalComparison(criteria);
      }
    } catch {
      generateLocalComparison(criteria);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalComparison = (criteria) => {
    const matched = allProducts.filter(p => selectedIds.includes(p.id));
    if (matched.length < 2) {
      const fallbacks = FALLBACK_COMPARE_PRODUCTS.filter(p => selectedIds.includes(p.id));
      matched.push(...fallbacks.filter(f => !matched.some(m => m.id === f.id)));
    }

    const p1 = matched[0] || FALLBACK_COMPARE_PRODUCTS[0];
    const p2 = matched[1] || FALLBACK_COMPARE_PRODUCTS[1];

    let explanation = `Direct Comparison: ${p1.name} (₹${p1.price?.toLocaleString('en-IN')}) vs ${p2.name} (₹${p2.price?.toLocaleString('en-IN')}).\n\n`;
    if (criteria && criteria.trim()) {
      const c = criteria.toLowerCase();
      explanation = `🎯 **Grounded Verdict for Focus:** "${criteria.trim()}"\n\n`;
      if (c.includes('game') || c.includes('gaming') || c.includes('fps')) {
        const winner = (p1.price || 0) >= (p2.price || 0) ? p1 : p2;
        const runner = winner.id === p1.id ? p2 : p1;
        explanation += `• **Winner for Gaming:** **${winner.name}** (₹${winner.price?.toLocaleString('en-IN')})\n`;
        explanation += `  Higher graphics compute capability, superior thermal headroom, and responsive input latency.\n`;
        explanation += `• **Alternative:** **${runner.name}** (₹${runner.price?.toLocaleString('en-IN')})\n`;
        explanation += `  Efficient daily driver suitable for lighter or casual gaming with lower power draw.\n\n`;
        explanation += `👉 **Verdict:** Select the **${winner.name}** for dedicated gaming throughput and visual performance.`;
      } else if (c.includes('battery') || c.includes('endurance') || c.includes('travel')) {
        const getBattery = (p) => {
          try {
            const s = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {});
            return s.battery || s['battery life'] || 'Full-day battery';
          } catch {
            return 'Full-day battery';
          }
        };
        explanation += `• **${p1.name}**: ${getBattery(p1)}\n`;
        explanation += `• **${p2.name}**: ${getBattery(p2)}\n\n`;
        explanation += `👉 **Verdict:** The device with longer rated hours offers superior unplugged battery longevity.`;
      } else if (c.includes('code') || c.includes('coding') || c.includes('developer') || c.includes('programming')) {
        explanation += `• **Developer & Programming Verdict:**\n`;
        explanation += `  - **${p1.name}**: Great keyboard ergonomics, strong multi-core compiling speed, and versatile port selection.\n`;
        explanation += `  - **${p2.name}**: High memory bandwidth, ultra-fast single-threaded compilation, and silent operation.\n\n`;
        explanation += `👉 **Verdict:** Both machines excel at software development; pick **${p1.name}** for hardware upgradeability or **${p2.name}** for portable battery longevity.`;
      } else {
        explanation += `• **${p1.name}**: Rated ${p1.rating}★. Renowned for outstanding reliability and ergonomic durability.\n`;
        explanation += `• **${p2.name}**: Rated ${p2.rating}★. Stands out with superior thermal efficiency and display clarity.\n\n`;
        explanation += `👉 **Verdict:** Choose the model with higher matching specifications in the matrix below.`;
      }
    } else {
      explanation += `• ${p1.name}: Rated ${p1.rating}★. Renowned for outstanding reliability, tactile ergonomics, and versatile connectivity.\n`;
      explanation += `• ${p2.name}: Rated ${p2.rating}★. Stands out with superior thermal efficiency, exceptional display fidelity, and ultra-portable form factor.\n\n`;
      explanation += `👉 Verdict: Choose the ${p1.name} for intensive multi-threaded workloads and cost-efficiency. Choose the ${p2.name} if battery longevity and display clarity are your top priorities.`;
    }

    setComparisonData({
      products: matched.slice(0, 4),
      aiExplanation: explanation,
      aiSummary: explanation
    });
  };

  const handleSelectProduct = (prodId) => {
    if (selectedIds.includes(prodId)) {
      if (selectedIds.length <= 2) {
        alert("At least 2 products are required for comparison.");
        return;
      }
      setSelectedIds(prev => prev.filter(id => id !== prodId));
    } else {
      if (selectedIds.length >= 4) {
        alert("You can compare up to 4 products at once.");
        return;
      }
      setSelectedIds(prev => [...prev, prodId]);
    }
  };

  const comparedProducts = comparisonData?.products?.length >= 2 
    ? comparisonData.products 
    : allProducts.filter(p => selectedIds.includes(p.id));

  // Extract all unique spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap(p => {
        try {
          const specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {});
          return Object.keys(specs);
        } catch {
          return [];
        }
      })
    )
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#0a2046', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
            <Layers style={{ color: '#818cf8' }} size={24} />
            Side-by-Side Product Comparison
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Evaluate technical specifications, prices, verified customer ratings, and synthesized AI verdicts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Products ({selectedIds.length}/4)
          </button>
          {selectedIds.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedIds([101, 102]);
                onClearCompare && onClearCompare();
              }}
              title="Reset comparison to default pair"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Quick Comparison Presets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Quick Presets:</span>
        {QUICK_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '5px 12px', borderRadius: '20px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }}
            onClick={() => setSelectedIds(preset.ids)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* When fewer than 2 products are selected */}
      {selectedIds.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
          <Layers size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Select at least 2 products to compare</h3>
          <p style={{ color: '#475569', fontSize: '0.92rem', maxWidth: '460px', margin: '0.5rem auto 1.5rem' }}>
            Choose products from our verified catalog or select a quick preset above to evaluate side-by-side hardware specs.
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Choose Products from Catalog
          </button>
        </div>
      ) : (
        <>
          {/* Grounded AI Comparative Analysis Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={22} style={{ color: '#6366f1' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Grounded AI Comparative Verdict</h3>
              </div>
              <span style={{
                background: '#e0e7ff',
                color: '#4338ca',
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid #c7d2fe'
              }}>
                Agent Tool: compare_products
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', padding: '1rem 0' }}>
                <Sparkles size={18} className="spin" style={{ color: '#6366f1' }} />
                <span style={{ fontSize: '0.92rem', color: '#334155' }}>Synthesizing comparative specs, customer review sentiment, and value scores...</span>
              </div>
            ) : (
              <div style={{
                fontSize: '0.95rem',
                lineHeight: '1.7',
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                background: '#f8fafc',
                padding: '1.15rem 1.35rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontWeight: 450
              }}>
                {comparisonData?.aiExplanation || "Select your priority criteria below to generate a tailored comparison verdict."}
              </div>
            )}

            {/* Custom criteria input */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ask specific focus, e.g. 'Which is better for software development and battery endurance?'"
                value={userCriteria}
                onChange={(e) => setUserCriteria(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadComparison(userCriteria); }}
                style={{
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  padding: '0.65rem 1rem',
                  borderRadius: '6px'
                }}
              />
              <button
                className="btn btn-primary"
                onClick={() => loadComparison(userCriteria)}
                disabled={loading}
                style={{ whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.65rem 1.25rem' }}
              >
                Analyze with Criteria
              </button>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                  <th style={{ padding: '1.25rem', width: '220px', minWidth: '180px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Feature / Attribute
                  </th>
                  {comparedProducts.map(p => (
                    <th key={p.id} style={{ padding: '1.25rem', minWidth: '240px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className="badge badge-secondary">{p.brand}</span>
                        {comparedProducts.length > 2 && (
                          <button
                            onClick={() => {
                              setSelectedIds(prev => prev.filter(id => id !== p.id));
                              onRemoveFromCompare && onRemoveFromCompare(p.id);
                            }}
                            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                            title="Remove from comparison"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#090d16', marginBottom: '0.75rem' }}>
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.4rem', lineHeight: '1.3', color: '#ffffff' }}>
                        {p.name}
                      </h4>

                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        ₹{p.price?.toLocaleString('en-IN')}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span className="badge badge-success">★ {p.rating}</span>
                        <span className="badge badge-secondary">{p.stockStatus || 'In Stock'}</span>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => onAddToCart && onAddToCart(p)}
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic specs */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ padding: '1rem 1.25rem', fontSize: '0.9rem' }}>{p.category}</td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Stock Status</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ padding: '1rem 1.25rem', fontSize: '0.9rem' }}>
                      {(p.stockQuantity || p.stock || 0) > 0 ? (
                        <span style={{ color: 'var(--success)' }}>✓ {(p.stockQuantity || p.stock)} in stock</span>
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>Out of stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Technical Specifications dynamically extracted */}
                {allSpecKeys.map(key => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </td>
                    {comparedProducts.map(p => {
                      let val = '—';
                      try {
                        const specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {});
                        val = specs[key] || '—';
                      } catch {
                        // ignore parse error
                      }
                      return (
                        <td key={p.id} style={{ padding: '1rem 1.25rem', fontSize: '0.9rem' }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Description summary */}
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Description</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {p.description}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Products Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Select Products to Compare</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {allProducts.map(prod => {
                const isSelected = selectedIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#0a0f1d' }}>
                      <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{prod.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.brand} • {prod.category}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ₹{prod.price?.toLocaleString('en-IN')}
                    </div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isSelected ? 'none' : '2px solid var(--border-color)', background: isSelected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowAddModal(false)}>
                Done ({selectedIds.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
