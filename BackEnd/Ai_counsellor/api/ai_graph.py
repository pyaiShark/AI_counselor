import json
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
import os
from openai import OpenAI
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()

# Configure Groq (For Recommendations)
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)

# --- 1. Define State (Recommendations) ---
class RecommendationState(TypedDict):
    profile_data: Dict[str, Any]
    universities_list: List[Dict[str, Any]]
    ai_response_text: str
    final_json: Dict[str, Any]
    attempt_count: int
    error_message: Optional[str]

# --- 2. Define Nodes (Recommendations) ---

def generate_recommendations_node(state: RecommendationState):
    """
    Generates recommendations using Groq (OpenAI Client).
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

    base_prompt = f"""
    You are an University Admissions Expert.
    Classify these universities into 'Dream', 'Target', 'Safe' based on:
    Profile: GPA {academic.get('gpa')}, {academic.get('education_level')}, IELTS {exams.get('ielts_toefl_score')}, Budget {budget.get('budget_range')}
    Target: {study_goal.get('intended_degree')} in {study_goal.get('field_of_study')}

    Universities: {json.dumps(simple_uni_list)}

    Return ONLY a valid JSON object in this format:
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
                {"role": "system", "content": "You are a University Admissions Expert. Output ONLY valid JSON."},
                {"role": "user", "content": base_prompt}
            ],
            temperature=0.3, # Lower temperature for classification stability
            response_format={"type": "json_object"}
        )
        response_text = completion.choices[0].message.content
        # print("Accepted response, --------------------------------------", response_text)
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
        return "end" # Max retries reached
    return "retry" # Generation failed, try again

# --- 4. Build Graph (Recommendations) ---
workflow = StateGraph(RecommendationState)
workflow.add_node("generate", generate_recommendations_node)
workflow.add_node("validate", validate_json_node)
workflow.set_entry_point("generate")
workflow.add_edge("generate", "validate")
workflow.add_conditional_edges("validate", should_continue, {"end": END, "retry": "generate"})
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
        return {"Dream": [], "Target": [], "Safe": []}

# --- 6. Chat Workflow (Uses Groq) ---
class ChatState(TypedDict):
    profile_data: Dict[str, Any]
    history: List[Dict[str, str]]
    user_message: str
    ai_response_text: str
    suggested_actions: List[str]
    stage: Optional[int]
    locked_unis: Optional[List[Dict[str, Any]]]
    shortlisted_unis: Optional[List[Dict[str, Any]]]
    tasks: Optional[List[Dict[str, Any]]]
    error_message: Optional[str]
    task_action: Optional[Dict[str, Any]]

def chat_node(state: ChatState):
    profile_data = state['profile_data']
    history = state['history']
    user_msg = state['user_message']
    stage = state.get('stage', 1)
    locked_unis = state.get('locked_unis', [])
    shortlisted_unis = state.get('shortlisted_unis', [])
    tasks = state.get('tasks', [])
    
    # 1. Prepare Context
    academic = profile_data.get('academic_background') or {}
    study_goal = profile_data.get('study_goal') or {}
    budget = profile_data.get('budget') or {}
    exams = profile_data.get('exams_readiness') or {}

    stage_map = {
        1: "Building Profile (Onboarding)",
        2: "Discovering Universities (Recommendations)",
        3: "Finalizing Universities (Locked choices)"
    }
    
    system_prompt = f"""
    You are an AI Education Counsellor. Your goal is to guide the student to their dream university.
    
    Current Application Stage: Stage {stage} - {stage_map.get(stage, "Unknown")}
    
    Student Profile:
    - Degree: {study_goal.get('intended_degree')} in {study_goal.get('field_of_study')}
    - Target: {study_goal.get('preferred_countries')} ({study_goal.get('target_intake')})
    - Academic: {academic.get('education_level')}, GPA {academic.get('gpa')}
    - Budget: {budget.get('budget_range')} ({budget.get('funding_plan')})
    - Exams: IELTS/TOEFL: {exams.get('ielts_toefl_score')}, GRE/GMAT: {exams.get('gre_gmat_score')}
    
    Contextual Data:
    - Locked Universities: {json.dumps(locked_unis)}
    - Other Shortlisted: {json.dumps(shortlisted_unis)}
    - Current Active Tasks: {json.dumps(tasks)}
    
    Guidelines:
    - You have FULL ACCESS to the user's data. Use it to provide specific, data-driven answers.
    - If asked about budget/costs for "my locked university" and none are locked, politely tell the user to lock a university first so you can give an accurate estimate.
    - If universities ARE locked, use their country and general profile to estimate tuition and living costs (be realistic).
    - Explain profile strengths (e.g., high GPA) and gaps (e.g., missing GRE, low IELTS).
    - Recommend universities using categories: Dream (low match), Target (moderate), Safe (high).
    - For each recommendation, clearly explain: Why it fits AND Where the risks are.
    - Be encouraging, professional, and realistic.
    - Keep answers concise (max 3-4 sentences unless explaining complex topics).
    - Use Markdown for lists/bolding.
    - **Task Management**:
        - You can list, add, and mark tasks as complete.
        - If the user asks to "list my todos", use the 'Current Active Tasks' provided in context to list them clearly.
        - If the user asks to add/create a new to-do, check the number of 'Current Active Tasks'.
        - **LIMIT POLICY**: If there are 5 or more active tasks, you MUST decline the request. 
        - Respond with: "Please complete the previous to-do first."
        - THEN, explain in your own words why having a low number of active to-dos (under 5) actually increases the success rate of completion (e.g., focus, psychological momentum, Avoiding decision fatigue).
        - If they have < 5 active tasks, you can suggest adding it.
        - To mark a task as complete, use its "id" from the context.

    Output Format: JSON containing:
    - "response" (string)
    - "suggested_actions" (list of strings, EXACTLY 3 actions)
    - "action" (optional object): 
        - {{"type": "create_task", "title": "..."}}
        - {{"type": "complete_task", "task_id": ...}}
    """
    
    # 2. Convert history to OpenAI format
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-5:]: # Keep last 5 turns context
        messages.append({"role": msg.get('role', 'user'), "content": msg.get('content', '')})
    
    messages.append({"role": "user", "content": user_msg})
    
    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        response_text = completion.choices[0].message.content
        data = json.loads(response_text)
        return {
            "ai_response_text": data.get("response", "I'm sorry, I couldn't process that."),
            "suggested_actions": data.get("suggested_actions", []),
            "task_action": data.get("action")
        }
    except Exception as e:
        return {
            "ai_response_text": "I encountered an error. Please try again.",
            "suggested_actions": [],
            "error_message": str(e)
        }

chat_workflow = StateGraph(ChatState)
chat_workflow.add_node("chat", chat_node)
chat_workflow.set_entry_point("chat")
chat_workflow.add_edge("chat", END)
chat_app = chat_workflow.compile()

def run_chat_graph(profile_data, history, user_message, stage=None, locked_unis=None, shortlisted_unis=None, tasks=None):
    inputs = {
        "profile_data": profile_data,
        "history": history,
        "user_message": user_message,
        "stage": stage,
        "locked_unis": locked_unis,
        "shortlisted_unis": shortlisted_unis,
        "tasks": tasks or [],
        "ai_response_text": "",
        "suggested_actions": [],
        "task_action": None,
        "error_message": None
    }
    result = chat_app.invoke(inputs)
    return {
        "response": result["ai_response_text"],
        "suggested_actions": result["suggested_actions"],
        "task_action": result.get("task_action")
    }
