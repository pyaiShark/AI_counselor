import json
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from openai import OpenAI
import os
from django.conf import settings

# Initialize Client (reusing config)
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)

# --- 1. Define State ---
class RecommendationState(TypedDict):
    profile_data: Dict[str, Any]
    universities_list: List[Dict[str, Any]]
    ai_response_text: str
    final_json: Dict[str, Any]
    attempt_count: int
    error_message: Optional[str]

# --- 2. Define Nodes ---

def generate_recommendations_node(state: RecommendationState):
    """
    Generates recommendations using Llama 3.
    """
    profile_data = state['profile_data']
    universities_list = state['universities_list']
    attempt = state.get('attempt_count', 0)
    error_msg = state.get('error_message')

    # Prepare Prompt data
    academic = profile_data.get('academic_background') or {}
    exams = profile_data.get('exams_readiness') or {}
    study_goal = profile_data.get('study_goal') or {}
    budget = profile_data.get('budget', {})
    
    # Simplify list for prompt
    simple_uni_list = [{"name": u.get('name'), "rank": u.get('rank', 999)} for u in universities_list]

    system_instruction = "You are an University Admissions Expert. Output ONLY valid JSON."
    
    base_prompt = f"""
    Classify these universities into 'Dream', 'Target', 'Safe' based on:
    Profile: GPA {academic.get('gpa')}, {academic.get('education_level')}, IELTS {exams.get('ielts_toefl_score')}, Budget {budget.get('budget_range')}
    Target: {study_goal.get('intended_degree')} in {study_goal.get('field_of_study')}

    Universities: {json.dumps(simple_uni_list)}

    Return JSON format:
    {{
        "Dream": [{{"name": "...", "reason": "...", "risks": "...", "cost": "High/Medium/Low", "acceptance_chance": "Low/Medium/High"}}],
        "Target": [...],
        "Safe": [...]
    }}
    """

    if error_msg:
        base_prompt += f"\n\nPREVIOUS ATTEMPT FAILED. Error: {error_msg}. \nFIX THE JSON FORMATting."

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": base_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        response_text = completion.choices[0].message.content
    except Exception as e:
        response_text = "{}" # Fail safe

    return {
        "ai_response_text": response_text,
        "attempt_count": attempt + 1,
        "error_message": None # Reset error
    }

def validate_json_node(state: RecommendationState):
    """
    Validates if the output is valid JSON and has the required keys.
    """
    text = state['ai_response_text']
    try:
        data = json.loads(text)
        
        # Basic Schema Check
        if not all(key in data for key in ["Dream", "Target", "Safe"]):
             raise ValueError("Missing required keys: Dream, Target, Safe")
        
        return {"final_json": data, "error_message": None}
    except Exception as e:
        return {"error_message": str(e), "final_json": None}

# --- 3. Define Conditional Logic ---

def should_continue(state: RecommendationState):
    """
    Decides whether to retry or end.
    """
    if state['final_json']:
        return "end" # Success
    
    if state['attempt_count'] >= 3:
        return "end" # Max retries reached, fail gracefully (will return empty/None)
    
    return "retry" # Generation failed, try again

# --- 4. Build Graph ---

workflow = StateGraph(RecommendationState)

workflow.add_node("generate", generate_recommendations_node)
workflow.add_node("validate", validate_json_node)

workflow.set_entry_point("generate")
workflow.add_edge("generate", "validate")

workflow.add_conditional_edges(
    "validate",
    should_continue,
    {
        "end": END,
        "retry": "generate"
    }
)

app = workflow.compile()

# --- 5. Initializer Wrapper ---
def run_recommendation_graph(profile_data, universities_list):
    inputs = {
        "profile_data": profile_data,
        "universities_list": universities_list,
        "attempt_count": 0,
        "ai_response_text": "",
        "final_json": None,
        "error_message": None
    }
    
    result = app.invoke(inputs)
    
    if result.get("final_json"):
        return result["final_json"]
    else:
        # Fallback if all retries failed
        # Return empty valid structure
        return {"Dream": [], "Target": [], "Safe": []}
