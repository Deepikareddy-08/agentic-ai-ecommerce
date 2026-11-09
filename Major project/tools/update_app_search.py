import os

app_path = r'Major project/Major project/frontend/src/App.jsx'
with open(app_path, 'r', encoding='utf-8') as f:
    text = f.read()

marker_start = '    if (searchQuery && searchQuery.trim()) {'
marker_end = '        if ((cleanQ.includes(\'bud\') || cleanQ.includes(\'earbud\') || cleanQ.includes(\'headphone\') || cleanQ.includes(\'audio\') || cleanQ.includes(\'speaker\')) && catLower.includes(\'audio\')) {'

idx_start = text.find(marker_start)
idx_end = text.find(marker_end)

if idx_start == -1 or idx_end == -1:
    print(f'ERROR: markers not found. start={idx_start}, end={idx_end}')
    exit(1)

replacement = """    if (searchQuery && searchQuery.trim()) {
      const cleanQ = searchQuery.toLowerCase().trim();
      const isPhoneTarget = (cleanQ.includes('phone') || cleanQ.includes('mobile') || cleanQ.includes('smartphone')) && !cleanQ.includes('headphone') && !cleanQ.includes('earphone');
      const isLaptopTarget = (cleanQ.includes('laptop') || cleanQ.includes('macbook') || cleanQ.includes('notebook')) && !cleanQ.includes('charger') && !cleanQ.includes('bag');
      const isWatchTarget = (cleanQ.includes('smartwatch') || cleanQ.includes('watches') || cleanQ.includes('watch')) && !cleanQ.includes('strap');

      if (isPhoneTarget) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('smartphone'));
      } else if (isLaptopTarget) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('laptop'));
      } else if (isWatchTarget) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('smartwatch'));
      }

      const allTokens = cleanQ.split(/\\s+/).filter(t => t.length > 0);
      const stopWords = new Set(["with", "under", "below", "above", "for", "in", "the", "a", "an", "and", "or", "of", "to", "best", "good", "top"]);
      const significantTokens = allTokens.filter(t => !stopWords.has(t) && t.length > 1);
      const targetTokens = significantTokens.length > 0 ? significantTokens : allTokens;

      // Score each product based on token density and category intent
      const scored = filtered.map(product => {
        const nameLower = (product.name || '').toLowerCase();
        const brandLower = (product.brand || '').toLowerCase();
        const catLower = (product.category || '').toLowerCase();
        const descLower = (product.description || '').toLowerCase();
        const specLower = (product.specifications || '').toLowerCase();
        const combined = `${nameLower} ${brandLower} ${catLower} ${descLower} ${specLower}`;

        if (isPhoneTarget && (catLower.includes('audio') || nameLower.includes('headphone') || nameLower.includes('earphone'))) {
          return { product, score: 0 };
        }

        let searchName = nameLower;
        let searchCat = catLower;
        let searchDesc = descLower;
        let searchCombined = combined;
        if (cleanQ.includes('phone')) {
          searchName = searchName.replace(/\\b(head|ear)phones?\\b/gi, '');
          searchCat = searchCat.replace(/\\b(head|ear)phones?\\b/gi, '');
          searchDesc = searchDesc.replace(/\\b(head|ear)phones?\\b/gi, '');
          searchCombined = searchCombined.replace(/\\b(head|ear)phones?\\b/gi, '');
        }

        let score = 0;

        if (isPhoneTarget && catLower.includes('smartphone')) {
          score += 300;
        } else if (isLaptopTarget && catLower.includes('laptop')) {
          score += 300;
        } else if (isWatchTarget && catLower.includes('smartwatch')) {
          score += 300;
        }

        // Exact match bonuses
        if (searchName === cleanQ) score += 250;
        else if (searchName.startsWith(cleanQ)) score += 180;
        else if (searchName.includes(cleanQ)) score += 120;
        else if (searchCombined.includes(cleanQ)) score += 60;

        // Brand match
        if (brandLower === cleanQ) score += 100;
        else if (brandLower.includes(cleanQ)) score += 50;

        // Category match
        if (searchCat === cleanQ) score += 90;
        else if (searchCat.includes(cleanQ)) score += 45;

        // Token occurrences
        let primaryMatches = 0;
        let tokensMatched = 0;
        targetTokens.forEach(tok => {
          if (tok.length > 1) {
            let tokenName = nameLower;
            let tokenCat = catLower;
            let tokenDesc = descLower;
            if (tok === 'phone' || tok === 'phones' || tok === 'mobile' || tok === 'mobiles') {
              tokenName = tokenName.replace(/\\b(head|ear)phones?\\b/gi, '');
              tokenCat = tokenCat.replace(/\\b(head|ear)phones?\\b/gi, '');
              tokenDesc = tokenDesc.replace(/\\b(head|ear)phones?\\b/gi, '');
            }

            let matched = false;
            if (tokenName.includes(tok)) { score += 40; primaryMatches++; matched = true; }
            if (brandLower.includes(tok)) { score += 30; primaryMatches++; matched = true; }
            if (tokenCat.includes(tok)) { score += 25; primaryMatches++; matched = true; }
            if (specLower.includes(tok)) { score += 10; matched = true; }
            if (tokenDesc.includes(tok)) { score += 3; matched = true; }
            if (matched) tokensMatched++;
          }
        });

        // Multi-token completeness bonus
        if (targetTokens.length > 1 && tokensMatched === targetTokens.length) {
          score += 140;
        } else if (targetTokens.length > 1 && tokensMatched > 1) {
          score += 40;
        }

        // Secondary description noise penalty
        if (primaryMatches === 0) {
          score = Math.max(0, score - 30);
        }

"""

new_text = text[:idx_start] + replacement + text[idx_end:]
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('SUCCESS: Updated App.jsx search filter')

