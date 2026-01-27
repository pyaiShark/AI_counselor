from django.test import TestCase

# Create your tests here.

import json
from django.test import SimpleTestCase
from unittest.mock import patch, MagicMock
from api.ai_service import evaluate_profile_strength, generate_tasks_for_user

class AIServiceTests(SimpleTestCase):
    def setUp(self):
        self.profile_data = {
            'academic_background': {
                'education_level': 'Bachelors',
                'degree_major': 'Computer Science',
                'gpa': '3.8',
                'graduation_year': 2024
            },
            'study_goal': {
                'intended_degree': 'Masters',
                'field_of_study': 'AI',
                'target_intake': 'Fall 2025',
                'preferred_countries': 'USA'
            },
            'exams_readiness': {
                'ielts_toefl_status': 'Completed',
                'gre_gmat_status': 'Not started',
                'sop_status': 'Draft'
            },
            'budget': {
                'budget_range': '30k-50k',
                'funding_plan': 'Self-funded'
            }
        }

    @patch('api.ai_service.client')
    def test_evaluate_profile_strength(self, mock_client):
        # Mock response
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = json.dumps({
            "academics": "Strong",
            "exams": "In Progress",
            "sop": "Draft"
        })
        mock_client.chat.completions.create.return_value = mock_completion

        # Call function
        result = evaluate_profile_strength(self.profile_data)

        # Verify result
        self.assertEqual(result['academics'], 'Strong')
        self.assertEqual(result['exams'], 'In Progress')
        self.assertEqual(result['sop'], 'Draft')
        
        # Verify API call structure implies correct data usage
        mock_client.chat.completions.create.assert_called_once()
        call_args = mock_client.chat.completions.create.call_args
        self.assertIn("USA", call_args[1]['messages'][1]['content']) # Check if country is passed

    @patch('api.ai_service.client')
    def test_generate_tasks_for_user(self, mock_client):
        # Mock response
        expected_tasks = ["Register for GRE", "Refine SOP", "Shortlist Universities"]
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = json.dumps(expected_tasks)
        mock_client.chat.completions.create.return_value = mock_completion

        # Call function
        result = generate_tasks_for_user(self.profile_data, "Building Profile", existing_tasks=[])

        # Verify result
        self.assertEqual(result, expected_tasks)
        
        # Verify prompt construction
        mock_client.chat.completions.create.assert_called_once()
        call_args = mock_client.chat.completions.create.call_args
        prompt_content = call_args[1]['messages'][1]['content']
        
        # Check if critical profile parts are in the prompt
        self.assertIn("Computer Science", prompt_content)
        self.assertIn("3.8", prompt_content)
        self.assertIn("USA", prompt_content)
        self.assertIn("Self-funded", prompt_content)
        self.assertIn("GOAL", prompt_content) # Verify new goal part is present
