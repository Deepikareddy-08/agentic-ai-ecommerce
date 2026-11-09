import os

path = r'Major project/Major project/frontend/src/components/AIAdvisorChat.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update category detection in generateClientSideAgentResponse
c = c.replace(
    "lower.includes('phone') || lower.includes('smartphone') || lower.includes('mobile') || lower.includes('pixel')",
    "lower.includes('phone') || lower.includes('smartphone') || lower.includes('mobile') || lower.includes('mobiles') || lower.includes('handset') || lower.includes('pixel')"
)

# 2. Update AIAdvisorChat signature & add resolveFinalProducts
old_sig = "const AIAdvisorChat = ({ currentUser, products = [], onOpenProductDetails, onAddToCart, onBuyNow, initialQuery }) => {"
new_sig = """const AIAdvisorChat = ({ currentUser, products = [], allProducts = [], onOpenProductDetails, onAddToCart, onBuyNow, initialQuery }) => {
  const catalogLookup = (Array.isArray(allProducts) && allProducts.length > 0) ? allProducts : products;

  const resolveFinalProducts = (rawList, productIds) => {
    let resolved = [];
    if (Array.isArray(rawList) && rawList.length > 0) {
      resolved = rawList.map(p => {
        if (typeof p === 'number' || typeof p === 'string') {
          const found = catalogLookup.find(cp => Number(cp.id) === Number(p));
          return found || null;
        }
        return {
          ...p,
          id: p.id || p.product_id,
          name: p.name || 'Electronic Gadget',
          brand: p.brand || '',
          category: p.category || '',
          imageUrl: p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          image_url: p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          price: Number(p.price || 0),
          rating: Number(p.rating || 4.5)
        };
      }).filter(Boolean);
    }
    if (resolved.length === 0 && Array.isArray(productIds) && productIds.length > 0) {
      resolved = productIds.map(pid => {
        const found = catalogLookup.find(cp => Number(cp.id) === Number(pid));
        if (found) {
          return {
            ...found,
            imageUrl: found.imageUrl || found.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
            image_url: found.imageUrl || found.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
            price: Number(found.price || 0),
            rating: Number(found.rating || 4.5)
          };
        }
        return null;
      }).filter(Boolean);
    }
    return resolved;
  };"""
c = c.replace(old_sig, new_sig)

# 3. Handle primary response
old_primary = "chatData = response.data;"
new_primary = """chatData = response.data;
      if (chatData) {
        chatData.recommendedProducts = resolveFinalProducts(
          chatData.recommendedProducts || chatData.recommended_products || chatData.products,
          chatData.product_ids || chatData.productIds
        );
      }"""
c = c.replace(old_primary, new_primary)

# 4. Handle direct python response
old_direct = """          let matchedProducts = [];
          if (directJson.product_ids && directJson.product_ids.length > 0 && Array.isArray(products)) {
            matchedProducts = products.filter(p => directJson.product_ids.includes(p.id));
          }
          chatData = {
            conversationId: directJson.conversation_id,
            response: directJson.response,
            recommendedProducts: matchedProducts,
            toolsUsed: directJson.tools_used || []
          };"""

new_direct = """          const matchedProducts = resolveFinalProducts(
            directJson.recommended_products || directJson.recommendedProducts,
            directJson.product_ids
          );
          chatData = {
            conversationId: directJson.conversation_id,
            response: directJson.response,
            recommendedProducts: matchedProducts,
            toolsUsed: directJson.tools_used || []
          };"""
c = c.replace(old_direct, new_direct)

# 5. Handle fallback passing catalogLookup
old_fallback = "chatData = generateClientSideAgentResponse(query.trim(), products);"
new_fallback = "chatData = generateClientSideAgentResponse(query.trim(), catalogLookup);"
c = c.replace(old_fallback, new_fallback)

# 6. Fallback image handling on product card
old_img = "<img src={prod.imageUrl} alt={prod.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />"
new_img = """<img 
                          src={prod.imageUrl || prod.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'} 
                          alt={prod.name} 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'; 
                          }}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />"""
c = c.replace(old_img, new_img)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('SUCCESSFULLY PATCHED AIAdvisorChat.jsx')

