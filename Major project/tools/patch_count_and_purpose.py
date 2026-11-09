import os

path = r'Major project/ai-service/agent_orchestrator.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update extract_requirements header and initialization
old_init = """        text = message.lower()
        reqs: Dict[str, Any] = {
            "category": session.get("active_category"),
            "budget_max": session.get("budget_max"),
            "purpose": session.get("purpose"),
            "required_features": list(session.get("required_features", [])),
            "preferred_features": list(session.get("preferred_features", []))
        }"""

new_init = """        text = message.lower()"""
c = c.replace(old_init, new_init)

# 2. Update category detection block to initialize reqs based on category change
old_cat_end = """        if detected_category:
            reqs["category"] = detected_category
            session["active_category"] = detected_category"""

new_cat_end = """        is_category_change = detected_category is not None and detected_category != session.get("active_category")

        reqs: Dict[str, Any] = {
            "category": detected_category if detected_category else session.get("active_category"),
            "budget_max": None if is_category_change else session.get("budget_max"),
            "purpose": None if is_category_change else session.get("purpose"),
            "required_features": [] if is_category_change else list(session.get("required_features", [])),
            "preferred_features": [] if is_category_change else list(session.get("preferred_features", []))
        }

        if detected_category:
            session["active_category"] = detected_category"""
c = c.replace(old_cat_end, new_cat_end)

# 3. Update purpose extraction
old_purpose = """        # 3. Purpose
        if any(w in text for w in ["programming", "coding", "developer", "software", "development", "vs code", "intellij"]):
            reqs["purpose"] = "programming"
        elif any(w in text for w in ["gaming", "games", "gpu", "fps", "rtx"]):
            reqs["purpose"] = "gaming"
        elif any(w in text for w in ["camera", "photography", "photos", "video", "portrait"]):
            reqs["purpose"] = "photography"
        elif any(w in text for w in ["student", "study", "college", "school"]):
            reqs["purpose"] = "studies"
        elif any(w in text for w in ["fitness", "running", "sports", "workout", "swimming", "health", "gym"]):
            reqs["purpose"] = "fitness" """

# Let's find exact purpose block
old_purpose_exact = """        # 3. Purpose
        if any(w in text for w in ["programming", "coding", "developer", "software", "development", "vs code", "intellij"]):
            reqs["purpose"] = "programming"
        elif any(w in text for w in ["gaming", "games", "gpu", "fps", "rtx"]):
            reqs["purpose"] = "gaming"
        elif any(w in text for w in ["camera", "photography", "photos", "video", "portrait"]):
            reqs["purpose"] = "photography"
        elif any(w in text for w in ["student", "study", "college", "school"]):
            reqs["purpose"] = "studies"
        elif any(w in text for w in ["fitness", "running", "sports", "workout", "swimming", "health", "gym"]):
            reqs["purpose"] = "fitness" """

new_purpose = """        # 3. Purpose (Extracted strictly when mentioned in current query)
        current_purpose = None
        if any(w in text for w in ["programming", "coding", "developer", "software", "development", "vs code", "intellij"]):
            current_purpose = "programming"
        elif any(w in text for w in ["gaming", "games", "gpu", "fps", "rtx"]):
            current_purpose = "gaming"
        elif any(w in text for w in ["camera", "photography", "photos", "video", "portrait"]):
            current_purpose = "photography"
        elif any(w in text for w in ["student", "study", "studying", "college", "school"]):
            current_purpose = "studies"
        elif any(w in text for w in ["fitness", "running", "sports", "workout", "swimming", "health", "gym"]):
            current_purpose = "fitness"

        if current_purpose:
            reqs["purpose"] = current_purpose
            session["purpose"] = current_purpose
        elif is_category_change or detected_category:
            reqs["purpose"] = None
            session["purpose"] = None"""

# Try replacing purpose
if "elif any(w in text for w in [\"fitness\", \"running\", \"sports\", \"workout\", \"swimming\", \"health\", \"gym\"]):" in c:
    import re
    c = re.sub(
        r'        # 3\. Purpose.*?' + re.escape('reqs["purpose"] = "fitness"'),
        new_purpose,
        c,
        flags=re.DOTALL
    )

# 4. Add quantity / count extraction before return reqs
old_ret = "        return reqs"
new_ret = """        # 5. Quantity / Count Intent
        requested_count = None
        if re.search(r'\\b(one|1|single|a\\s+single|only\\s+one|just\\s+one|best\\s+one)\\b', text) or re.search(r'\\b(refer|suggest|give|show|recommend)\\s+(?:me\\s+)?a\\s+(phone|mobile|laptop|watch|headphone|product|gadget)\\b', text):
            requested_count = 1
        elif re.search(r'\\b(two|2|pair|couple|top\\s*2)\\b', text):
            requested_count = 2
        elif re.search(r'\\b(three|3|top\\s*3)\\b', text):
            requested_count = 3
        elif re.search(r'\\b(four|4|top\\s*4)\\b', text):
            requested_count = 4
        elif re.search(r'\\b(five|5|top\\s*5)\\b', text):
            requested_count = 5

        reqs["requested_count"] = requested_count
        return reqs"""
c = c.replace(old_ret, new_ret, 1)

# 5. Update prompt in _run_llm_agent with count instruction
old_prompt_rules = '            "RULES:\\n"\n            "1. Be direct, concise, and structured. Mention product names, prices in ₹, key specs, and customer insights.\\n"'
new_prompt_rules = '''            "RULES:\\n"
            "1. Be direct, concise, and structured. Mention product names, prices in ₹, key specs, and customer insights.\\n"
            f"{count_instruction}\\n"'''

c = c.replace(
    '        grounded_context_str = "\\n".join(grounded_data_lines)',
    '''        grounded_context_str = "\\n".join(grounded_data_lines)
        count_instruction = ""
        if reqs.get("requested_count") == 1:
            count_instruction = "CRITICAL REQUIREMENT: The user explicitly asked for ONE (1) product ('refer me one phone'). You MUST recommend ONLY THE SINGLE BEST MATCHING PRODUCT. Do NOT list 2, 3, 4, or 5 products. Do NOT output a comparison table. Give full details for that 1 product only."
        elif reqs.get("requested_count"):
            count_instruction = f"CRITICAL REQUIREMENT: Recommend exactly {reqs['requested_count']} products as requested."'''
)
c = c.replace(old_prompt_rules, new_prompt_rules)

# 6. Update valid_pids slicing in _run_llm_agent
old_valid = """        if is_apology or (not candidates and not tool_pids and not mentioned_pids):
            valid_pids = []
            session["discussed_product_ids"] = []
        else:
            if not selected_pids and candidate_pids:
                selected_pids = candidate_pids[:3]
            valid_pids = [int(p) for p in set(selected_pids) if p is not None]
            session["discussed_product_ids"] = valid_pids"""

new_valid = """        if is_apology or (not candidates and not tool_pids and not mentioned_pids):
            valid_pids = []
            session["discussed_product_ids"] = []
        else:
            if not selected_pids and candidate_pids:
                selected_pids = candidate_pids
            
            # Preserve original ranking order without duplicates
            seen_pids = set()
            ordered_pids = []
            for p in selected_pids:
                if p is not None and int(p) not in seen_pids:
                    seen_pids.add(int(p))
                    ordered_pids.append(int(p))

            target_limit = reqs.get("requested_count") or 3
            valid_pids = ordered_pids[:target_limit]
            session["discussed_product_ids"] = valid_pids"""

c = c.replace(old_valid, new_valid)

# 7. Update deterministic mode synthesis
old_synth = """        cat_desc = reqs.get("category") or "items"
        budget_desc = f" within ₹{reqs['budget_max']:,.0f}" if reqs.get("budget_max") else ""
        purpose_desc = f" for {reqs['purpose']}" if reqs.get("purpose") else ""

        lines = [
            f"Here are the top personalized {cat_desc}{budget_desc}{purpose_desc} recommended by our Multimodal Decision Engine:\\n"
        ]"""

new_synth = """        cat_desc = reqs.get("category") or "items"
        budget_desc = f" within ₹{reqs['budget_max']:,.0f}" if reqs.get("budget_max") else ""
        purpose_desc = f" for {reqs['purpose']}" if reqs.get("purpose") else ""

        if reqs.get("requested_count") == 1:
            recommendations = recommendations[:1]
            lines = [
                f"Here is our top verified {cat_desc}{budget_desc}{purpose_desc} recommendation:\\n"
            ]
        else:
            lines = [
                f"Here are the top personalized {cat_desc}{budget_desc}{purpose_desc} recommended by our Multimodal Decision Engine:\\n"
            ]"""

c = c.replace(old_synth, new_synth)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('SUCCESSFULLY PATCHED agent_orchestrator.py')

