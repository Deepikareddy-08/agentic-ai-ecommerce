import sys, os
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.abspath("Major project/ai-service"))
from agent_orchestrator import AgentOrchestrator

ao = AgentOrchestrator()

# Test 1: Prior turn was phones, then user asks for headphones
conv_id = "test-conv-001"
# Turn 1
r1 = ao.process_chat(conv_id, "Which flagship phone has the best camera and battery?")
print("--- TURN 1 (Phone) ---")
print("Reqs:", r1.get("extracted_requirements"))
print("Tools:", r1.get("tools_used"))
print("Product IDs:", r1.get("product_ids"))

# Turn 2: User clicks or types "Show me wireless noise-cancelling headphones for travel"
r2 = ao.process_chat(conv_id, "Show me wireless noise-cancelling headphones for travel")
print("\n--- TURN 2 (Headphones) ---")
print("Reqs:", r2.get("extracted_requirements"))
print("Tools:", r2.get("tools_used"))
print("Product IDs:", r2.get("product_ids"))
print("Response:\n", r2.get("response")[:300])

# Test 2: User asks "bluetooth" or "bluetooth earphones"
conv_id2 = "test-conv-002"
r2_1 = ao.process_chat(conv_id2, "phone under 1lakh")
r2_2 = ao.process_chat(conv_id2, "bluetooth")
print("\n--- TURN 2_2 (Bluetooth after phone) ---")
print("Reqs:", r2_2.get("extracted_requirements"))
print("Response:\n", r2_2.get("response")[:300])

