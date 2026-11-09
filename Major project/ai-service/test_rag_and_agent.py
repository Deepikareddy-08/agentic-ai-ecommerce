import json
import logging
import unittest
from agent_orchestrator import AgentOrchestrator
import agent_tools
from qdrant_manager import QdrantManager

logging.basicConfig(level=logging.INFO)

class TestRAGAndAgent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.orchestrator = AgentOrchestrator()
        cls.qdrant = QdrantManager()

    def test_qdrant_semantic_retrieval(self):
        """Verify Qdrant semantic search returns relevant product and review evidence"""
        query = "Which laptop has good battery life for programming?"
        results = self.qdrant.semantic_search(query=query, top_k=3, category="Laptops")
        
        self.assertTrue(len(results) > 0, "Expected at least 1 retrieval result")
        top_match = results[0]
        self.assertIn("product_name", top_match)
        self.assertIn("Laptops", top_match["category"])
        
        # Verify ThinkPad E14 or MacBook Air appears in top candidates
        matched_names = [r["product_name"] for r in results]
        self.assertTrue(
            any("ThinkPad" in name or "MacBook" in name for name in matched_names),
            f"Expected ThinkPad or MacBook in top matches, got: {matched_names}"
        )
        print(f"[PASS] RAG Retrieval: Query '{query}' -> Top Match: {top_match['product_name']} (score: {top_match['score']})")

    def test_requirement_extraction(self):
        """Verify natural language requirement extraction into structured JSON"""
        prompt = "I need a laptop under Rs. 70,000 for programming with good battery life and 16 GB RAM"
        reqs = self.orchestrator.extract_requirements(prompt, {})
        
        self.assertEqual(reqs["category"], "Laptops")
        self.assertEqual(reqs["budget_max"], 70000.0)
        self.assertEqual(reqs["purpose"], "programming")
        self.assertTrue(any("battery" in f.lower() for f in reqs["preferred_features"]))
        self.assertTrue(any("16gb" in f.lower() or "ram" in f.lower() for f in reqs["required_features"]))
        print("[PASS] Requirement Extraction: Accurately extracted category, budget, purpose, and priorities.")

    def test_agent_tools_execution(self):
        """Verify each of the 6 core agent tools returns valid structured outputs"""
        # 1. search_products
        search_res = agent_tools.search_products(category="Laptops", max_price=70000, limit=2)
        self.assertTrue(len(search_res) > 0)
        self.assertLessEqual(search_res[0]["price"], 70000)

        # 2. get_product_details
        details = agent_tools.get_product_details(search_res[0]["product_id"])
        self.assertIsNotNone(details)
        self.assertEqual(details["product_id"], search_res[0]["product_id"])

        # 3. get_reviews
        reviews = agent_tools.get_reviews(search_res[0]["product_id"])
        self.assertTrue(isinstance(reviews, list))

        # 4. get_recommendations
        recs = agent_tools.get_recommendations(category="Laptops", max_budget=70000)
        self.assertIn("recommendations", recs)
        self.assertTrue(len(recs["recommendations"]) > 0)

        # 5. compare_products
        comp = agent_tools.compare_products([101, 103])
        self.assertEqual(len(comp["products"]), 2)
        self.assertTrue(len(comp["key_differences"]) > 0)

        # 6. retrieve_product_knowledge
        rag_res = agent_tools.retrieve_product_knowledge("battery life", category="Laptops")
        self.assertTrue(len(rag_res) > 0)
        print("[PASS] Agent Tools: All 6 tools executed successfully with valid schema.")

    def test_conversational_memory_followup(self):
        """Verify agent handles follow-up questions referencing previous session memory"""
        conv_id = "test-session-mem-01"

        # Turn 1: State shopping requirement
        t1 = self.orchestrator.process_chat(
            conversation_id=conv_id,
            user_message="I need a laptop under 75000 for coding with 16GB RAM"
        )
        self.assertTrue(len(t1["product_ids"]) > 0)
        self.assertIn("extract_requirements", t1["tools_used"])

        # Turn 2: Follow-up without repeating budget or category
        t2 = self.orchestrator.process_chat(
            conversation_id=conv_id,
            user_message="Which one has better battery life?"
        )
        # Verify that relevant evidence-fetching tools were executed
        evidence_tools = {"retrieve_product_knowledge", "get_product_details", "get_reviews", "compare_products", "get_recommendations"}
        self.assertTrue(any(t in evidence_tools for t in t2["tools_used"]), f"Expected evidence tool in {t2['tools_used']}")
        self.assertEqual(t2["extracted_requirements"]["category"], "Laptops")
        self.assertEqual(t2["extracted_requirements"]["budget_max"], 75000.0)
        print(f"[PASS] Conversation Memory: Turn 2 autonomously executed {t2['tools_used']} using stored session context.")

if __name__ == "__main__":
    unittest.main()
