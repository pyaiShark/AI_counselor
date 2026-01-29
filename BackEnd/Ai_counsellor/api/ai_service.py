import os
import json
from django.conf import settings
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Configure Groq
# Ensure GROQ_API_KEY is in your .env file
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)

def evaluate_profile_strength(profile_data):
    """
    Evaluates the strength of the user's profile based on available data.
    Returns a JSON object with strength ratings for Academics, Exams, and SOP.
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
            model="openai/gpt-oss-20b",
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
        print(f"AI Service Error (Strength): {str(e)}")
        # Fallback default
        return {
            "academics": "Average",
            "exams": "Not Started",
            "sop": "Not started"
        }

def generate_tasks_for_user(profile_data, current_stage, existing_tasks=None):
    """
    Generates a list of recommended tasks based on the user's profile and current stage.
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
        1. Academic Background:
           - Education: {academic.get('education_level', 'N/A')} in {academic.get('degree_major', 'N/A')}
           - GPA/Grade: {academic.get('gpa', 'N/A')}
           - Graduation Year: {academic.get('graduation_year', 'N/A')}

        2. Study Goals:
           - Target Degree: {study_goal.get('intended_degree', 'N/A')} in {study_goal.get('field_of_study', 'N/A')}
           - Target Intake: {study_goal.get('target_intake', 'N/A')}
           - Preferred Countries: {preferred_countries}

        3. Exam Status:
           - English Proficiency (IELTS/TOEFL): {exams.get('ielts_toefl_status', 'N/A')}
           - Aptitude Test (GRE/GMAT): {exams.get('gre_gmat_status', 'N/A')}
           - SOP Status: {exams.get('sop_status', 'Not started')}

        4. Financials:
           - Budget: {budget.get('budget_range', 'N/A')} ({budget.get('funding_plan', 'N/A')})

        Current System Stage: {current_stage}
        Allowed Tasks (Already generated/completed): {existing_tasks_str}

        GOAL: Suggest 3-5 specific, high-priority, actionable tasks to INCREASE the student's chance of acceptance into universities in {preferred_countries}.
        
        Rules:
        - Do NOT suggest tasks that are already in the 'Allowed Tasks' list.
        - Focus on the NEXT logical steps (e.g., if exams are done, move to University Shortlisting or SOP).
        - If profile is weak (low GPA), suggest strengthening profile (e.g., projects, internships).
        - Return ONLY a valid JSON array of strings.

        Example: ["Draft your SOP introduction", "Register for IELTS", "Research scholarships in Canada"]
        """
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
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
        print(f"AI Service Error (Tasks): {str(e)}")
        return ["Complete your profile information"]

def get_university_recommendations(profile_data, universities_list):
    """
    Classifies a list of universities into Dream, Target, and Safe based on the user's profile.
    Returns detailed insights for each university.
    """
    try:
        # safely get nested data
        academic = profile_data.get('academic_background') or {}
        exams = profile_data.get('exams_readiness') or {}
        study_goal = profile_data.get('study_goal') or {}
        budget = profile_data.get('budget', {})

        # Simplify university list found in prompt to save tokens (just sends names+ranks)
        simple_uni_list = [{"name": u.get('name'), "rank": u.get('rank', 999)} for u in universities_list]
        
        prompt = f"""
        Act as an University Admissions Expert. Classify the universities below into 'Dream', 'Target', and 'Safe' categories based on the student's profile.
        For each university, provided a detailed analysis.

        Student Profile:
        - GPA/Grades: {academic.get('gpa', 'N/A')}
        - Education: {academic.get('education_level', 'N/A')} in {academic.get('degree_major', 'N/A')}
        - Test Scores: IELTS/TOEFL: {exams.get('ielts_toefl_score', 'N/A')}, GRE/GMAT: {exams.get('gre_gmat_score', 'N/A')}
        - Target Degree: {study_goal.get('intended_degree', 'N/A')} in {study_goal.get('field_of_study', 'N/A')}
        - Budget: {budget.get('budget_range', 'N/A')} ({budget.get('funding_plan', 'N/A')})

        Universities to Classify (Rank provided):
        {json.dumps(simple_uni_list)}

        Rules:
        - Dream: Ambitious but possible, or rank is very high compared to profile.
        - Target: Good fit, profile matches average requirements.
        - Safe: High probability of acceptance.
        - Split reasonably evenly if possible, but prioritize realistic fit.
        - Provide 'cost' as 'Low', 'Medium', or 'High' relative to the country context.
        - Provide 'acceptance_chance' as 'Low', 'Medium', or 'High'.
        
        Return ONLY valid JSON in this format:
        {{
            "Dream": [
                {{
                    "name": "University Name", 
                    "reason": "Why it fits...", 
                    "risks": "Key risks...", 
                    "cost": "High/Medium/Low", 
                    "acceptance_chance": "Low/Medium/High"
                }}
            ],
            "Target": [
                {{
                    "name": "University Name", 
                    "reason": "Why it fits...", 
                    "risks": "Key risks...", 
                    "cost": "High/Medium/Low", 
                    "acceptance_chance": "Low/Medium/High"
                }}
            ],
            "Safe": [
                {{
                    "name": "University Name", 
                    "reason": "Why it fits...", 
                    "risks": "Key risks...", 
                    "cost": "High/Medium/Low", 
                    "acceptance_chance": "Low/Medium/High"
                }}
            ]
        }}
        """

        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b", # Using Groq supported model
            messages=[
                {"role": "system", "content": "You are an admissions expert that outputs only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        text = completion.choices[0].message.content
        print("Raw AI Response:", text)
        return json.loads(text)

    except Exception as e:
        print(f"AI Service Error (Recommendations): {str(e)}")
        # Fallback to empty structure
        return {"Dream": [], "Target": [], "Safe": []}
