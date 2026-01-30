import os
import json
from django.conf import settings
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Configure Groq for Recommendations
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)

def evaluate_profile_strength(profile_data):
    """
    Evaluates the strength of the user's profile based on available data.
    Returns a JSON object with strength ratings for Academics, Exams, and SOP.
    Uses Groq (OpenAI Client).
    """
    try:
        # safely get nested data
        academic = profile_data.get('academic_background', {})
        exams = profile_data.get('exams_readiness', {})
        study_goal = profile_data.get('study_goal', {})
        preferred_countries = study_goal.get('preferred_countries')
        
        prompt = f"""
        Analyze the following student profile for {preferred_countries} university admissions and provide a strength assessment.
        
        Profile Data:
        - Education: {academic.get('education_level', 'N/A')} in {academic.get('degree_major', 'N/A')}
        - GPA: {academic.get('gpa', 'N/A')}
        - Exams: IELTS/TOEFL: {exams.get('ielts_toefl_status', 'N/A')}, GRE/GMAT: {exams.get('gre_gmat_status', 'N/A')}
        - SOP Status: {exams.get('sop_status', 'Not started')}
        
        Rules:
        1. Academics: 'Strong' if GPA > 3.5 or equivalent, 'Average' if > 3.0, 'Weak' otherwise.
        2. Exams: 'Completed' if both taken, 'In Progress' if planning, 'Not Started' if neither.
        3. SOP: Directly use the status provided (Not started/Draft/Ready).
        
        Return ONLY valid JSON in this format, no code blocks:
        {{
            "academics": "Strong|Average|Weak",
            "exams": "Not Started|In Progress|Completed",
            "sop": "Not started|Draft|Ready"
        }}
        """
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b", # Using Groq supported model
            messages=[
                {"role": "system", "content": "You are a helpful education counselor assistant that outputs only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        text = completion.choices[0].message.content
        return json.loads(text)
        
    except Exception as e:
        # Fallback default
        return {
            "academics": "Average",
            "exams": "Not Started",
            "sop": "Not started"
        }

def generate_tasks_for_user(profile_data, current_stage, existing_tasks=None):
    """
    Generates a list of recommended tasks based on the user's profile and current stage.
    Uses Groq (OpenAI Client).
    """
    try:
        # safely get nested data
        academic = profile_data.get('academic_background', {})
        exams = profile_data.get('exams_readiness', {})
        study_goal = profile_data.get('study_goal', {})
        budget = profile_data.get('budget', {})
        preferred_countries = study_goal.get('preferred_countries', 'international')
        
        existing_tasks_str = ", ".join(existing_tasks) if existing_tasks else "None"

        prompt = f"""
        Act as an AI Education Counselor through a detailed analysis of the student's profile.
        
        Student Profile:
        - Education: {academic.get('education_level', 'N/A')} in {academic.get('degree_major', 'N/A')}
        - GPA: {academic.get('gpa', 'N/A')}
        - Target: {study_goal.get('intended_degree', 'N/A')} in {study_goal.get('field_of_study', 'N/A')}
        - Countries: {preferred_countries}
        - Exams: {exams.get('ielts_toefl_status', 'N/A')}, {exams.get('gre_gmat_status', 'N/A')}
        - SOP: {exams.get('sop_status', 'Not started')}
        - Budget: {budget.get('budget_range', 'N/A')}

        Current Stage: {current_stage}
        Allowed Tasks: {existing_tasks_str}

        GOAL: Suggest 3-5 specific, high-priority, actionable tasks to INCREASE acceptance chances.
        
        Rules:
        - Do NOT suggest tasks from 'Allowed Tasks'.
        - Focus on NEXT logical steps.
        - Return ONLY a valid JSON array of strings.
        Example: ["Draft SOP", "Register for IELTS"]
        """
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b", # Using Groq supported model
            messages=[
                {"role": "system", "content": "You are a helpful education counselor assistant that outputs only JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        text = completion.choices[0].message.content.strip()
        # Clean response string if it contains markdown
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        return json.loads(text)
        
    except Exception as e:
        return ["Complete your profile information"]

def get_university_recommendations(profile_data, universities_list):
    """
    Classifies a list of universities into Dream, Target, and Safe based on the user's profile.
    Uses LangGraph for robust handling (Logic inside ai_graph.py).
    """
    from .ai_graph import run_recommendation_graph
    return run_recommendation_graph(profile_data, universities_list)

def chat_with_counselor(profile_data, history, user_message, stage=None, locked_unis=None, shortlisted_unis=None, tasks=None):
    """
    Handles chat interaction with the AI Counsellor using the LangGraph workflow.
    Provides full context including application stage and shortlisted universities.
    """
    from .ai_graph import run_chat_graph
    return run_chat_graph(
        profile_data, 
        history, 
        user_message, 
        stage=stage, 
        locked_unis=locked_unis, 
        shortlisted_unis=shortlisted_unis,
        tasks=tasks
    )
