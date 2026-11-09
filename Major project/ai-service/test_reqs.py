import sys, os
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.abspath("Major project/ai-service"))
from agent_orchestrator import AgentOrchestrator

ao = AgentOrchestrator()
session = {'active_category': 'Smartphones'}
reqs = ao.extract_requirements('Show me wireless noise-cancelling headphones for travel', session)
print('Result with Smartphones in session:', reqs)
session2 = {}
reqs2 = ao.extract_requirements('Show me wireless noise-cancelling headphones for travel', session2)
print('Result with empty session:', reqs2)

reqs3 = ao.extract_requirements('bluetooth', session)
print('Result for bluetooth with Smartphones in session:', reqs3)

