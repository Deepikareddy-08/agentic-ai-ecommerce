import os

path = r'Major project/Major project/frontend/src/components/AIAdvisorChat.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c_norm = c.replace('\r\n', '\n')

old_part = """    if (chatData?.conversationId) {
      setConversationId(chatData.conversationId);
    }

    const assistantMessage = {
      role: 'assistant',
      content: chatData?.response || chatData?.reply || "I processed your request, but could not produce a text summary.",
      toolsExecuted: chatData?.toolsUsed || chatData?.toolsExecuted || [],
      products: chatData?.recommendedProducts || []
    };"""

new_part = """    if (chatData?.conversationId) {
      setConversationId(chatData.conversationId);
    }

    let finalProducts = chatData?.recommendedProducts || [];
    const lowerQuery = query.toLowerCase();
    if (/\\b(one|1|single|a\\s+single|only\\s+one|just\\s+one|best\\s+one)\\b/i.test(lowerQuery) || /\\b(refer|suggest|give|show|recommend)\\s+(?:me\\s+)?a\\s+(phone|mobile|laptop|watch|headphone|product|gadget)\\b/i.test(lowerQuery)) {
      finalProducts = finalProducts.slice(0, 1);
    } else if (/\\b(two|2|pair|couple|top\\s*2)\\b/i.test(lowerQuery)) {
      finalProducts = finalProducts.slice(0, 2);
    }

    const assistantMessage = {
      role: 'assistant',
      content: chatData?.response || chatData?.reply || "I processed your request, but could not produce a text summary.",
      toolsExecuted: chatData?.toolsUsed || chatData?.toolsExecuted || [],
      products: finalProducts
    };"""

if old_part in c_norm:
    c_norm = c_norm.replace(old_part, new_part)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c_norm)
    print('SUCCESSFULLY PATCHED AIAdvisorChat.jsx')
else:
    print('COULD NOT MATCH TARGET')

