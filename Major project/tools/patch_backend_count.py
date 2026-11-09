import os
import re

path = r'Major project/Major project/backend/backend/src/main/java/com/ecommerce/backend/service/AiAgentClientService.java'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update product list slicing in handleChat
old_prods = """                List<Product> products = (!productIds.isEmpty())
                        ? productRepository.findAllById(productIds)
                        : Collections.emptyList();"""

new_prods = """                List<Product> products = (!productIds.isEmpty())
                        ? productRepository.findAllById(productIds)
                        : Collections.emptyList();

                int targetLimit = (reqs != null && reqs.get("requested_count") != null)
                        ? ((Number) reqs.get("requested_count")).intValue()
                        : 3;
                if (targetLimit > 0 && products.size() > targetLimit) {
                    products = products.subList(0, targetLimit);
                }"""
c = c.replace(old_prods, new_prods)

# 2. Update limit in executeLocalAgentWorkflow
old_top_picks = "List<Product> topPicks = candidates.stream().limit(3).collect(Collectors.toList());"
new_top_picks = """int targetLimit = (extractedReqs.get("requested_count") != null) ? (Integer) extractedReqs.get("requested_count") : 3;
        List<Product> topPicks = candidates.stream().limit(targetLimit).collect(Collectors.toList());"""
c = c.replace(old_top_picks, new_top_picks)

# 3. Add requested_count extraction to extractRequirementsFromText
old_priorities = """        reqs.put("priorities", priorities);

        return reqs;"""

new_priorities = """        reqs.put("priorities", priorities);

        // 5. Quantity / Count Intent
        Integer requestedCount = null;
        if (lower.matches(".*\\\\b(one|1|single|a\\\\s+single|only\\\\s+one|just\\\\s+one|best\\\\s+one)\\\\b.*") || lower.matches(".*\\\\b(refer|suggest|give|show|recommend)\\\\s+(?:me\\\\s+)?a\\\\s+(phone|mobile|laptop|watch|headphone|product|gadget)\\\\b.*")) {
            requestedCount = 1;
        } else if (lower.matches(".*\\\\b(two|2|pair|couple|top\\\\s*2)\\\\b.*")) {
            requestedCount = 2;
        } else if (lower.matches(".*\\\\b(three|3|top\\\\s*3)\\\\b.*")) {
            requestedCount = 3;
        }
        reqs.put("requested_count", requestedCount);

        return reqs;"""
c = c.replace(old_priorities, new_priorities)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('SUCCESSFULLY PATCHED AiAgentClientService.java')

