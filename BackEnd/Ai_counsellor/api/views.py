from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import redirect
from django.http.response import JsonResponse
from django.contrib.auth import authenticate, login, logout, get_user_model

from rest_framework_simplejwt.tokens import RefreshToken


from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse
from django.conf import settings
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
import os


from .models import User, AcademicBackground, StudyGoal, Budget, ExamsAndReadiness
from .serializers import (
    UserSerializer, 
    PasswordResetRequestSerializer, 
    ProfileSerializer,
    AcademicBackgroundSerializer,
    StudyGoalSerializer,
    BudgetSerializer,
    ExamsAndReadinessSerializer,
    TaskSerializer
)
from .models import User, AcademicBackground, StudyGoal, Budget, ExamsAndReadiness, Task
from .ai_service import evaluate_profile_strength, generate_tasks_for_user, get_university_recommendations


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Invalidate AI Cache
            from .models import ProfileAICache
            ProfileAICache.objects.filter(user=request.user).update(recommendations=None, strength_data=None)
            
            # Optionally trigger tasks
            if request.user.onboarding_step == 'Completed':
                trigger_ai_task_generation(request.user)
                
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name')  # Get first name
    last_name = request.data.get('last_name')    # Get last name

    # Validate input
    if not email or not password or not first_name or not last_name:
        return Response(
            {'error': "Email, password, first name, and last name are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Prepare user data for serializer
    user_data = {
        'email': email,
        'password': password,
        'first_name': first_name,
        'last_name': last_name,
    }
    print(user_data)

    # Pass data to serializer
    serializer = UserSerializer(data=user_data)
    if serializer.is_valid():
        user = serializer.save()

        # Ensure user is of type User
        UserModel = get_user_model()
        if not isinstance(user, UserModel):
            print("User creation failed.------------")
            return Response({'error': "User creation failed."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate JWT tokens for the newly registered user
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Registered successfully",
            "email": email,
            "first_name": user.first_name,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    else:
        if "email" in serializer.errors:
            return Response(
                serializer.error_messages,
                status=status.HTTP_409_CONFLICT
            )
    print("User creation failed end.------------")
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def login_view(request):  # Renamed to avoid conflict with django.contrib.auth.login
    email = request.data.get('email')  # Change to email
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    UserModel = get_user_model()
    try:
        user = UserModel.objects.get(email=email)
        user = authenticate(request, username=user.email, password=password)  # Use username for authentication

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'email': user.email,
                'first_name': user.first_name,
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid Credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except UserModel.DoesNotExist:
        return Response(
            {'error': 'Invalid Credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )



@api_view(['POST'])
def password_reset_request(request):
    email = request.data.get("email")
    # Initialize the serializer with the incoming request data
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    # Validate the data
    if serializer.is_valid():
        #email = serializer.validated_data.get('email')  # Use .get() for safety
        UserModel = get_user_model()
        
        try:
            # Retrieve the user associated with the email
            user = UserModel.objects.get(email=email)

            # Generate uid and token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # Prepare the reset link pointing to frontend
            frontend_url = "http://127.0.0.1:5173/reset-password"
            reset_link = f"{frontend_url}?uid={uid}&token={token}"
            subject = "Password Reset Requested"
            html_message = render_to_string("password_reset_email.html", {"reset_link": reset_link})
            plain_message = strip_tags(html_message)

            # Send the email
            send_mail(subject, plain_message, settings.DEFAULT_FROM_EMAIL, [email], html_message=html_message)

            return Response({"detail": "Password reset email has been sent."}, status=status.HTTP_200_OK)
        except UserModel.DoesNotExist:
            return Response({"error": "This email doesn't exist. Please try to sign up."}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def password_reset(request):
    uid = request.query_params.get('uid')
    token = request.query_params.get('token')

    if not uid or not token:
        return JsonResponse({"error": "Token and UID required"}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uid))
        UserModel = get_user_model()
        user = UserModel.objects.get(pk=uid)

        # Check token validity
        if not default_token_generator.check_token(user, token):
            return JsonResponse({"error": "Invalid token"}, status=400)

        # Set new password
        new_password = request.data.get('password')
        if new_password:
            user.set_password(new_password)
            user.save()
            return JsonResponse({"detail": "Password has been reset successfully."}, status=200)
        return JsonResponse({"error": "Password is required"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def academic_background_view(request):
    if request.method == 'GET':
        try:
            if hasattr(request.user, 'academic_background'):
                academic_bg = request.user.academic_background
                serializer = AcademicBackgroundSerializer(academic_bg)
                return Response(
                    {
                        'status': 'success',
                        'data': serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {
                        'status': 'success',
                        'data': {} # Return empty data if not found
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        serializer = AcademicBackgroundSerializer(data=request.data)
        if serializer.is_valid():
            # Save or update instance for current user
            obj, created = AcademicBackground.objects.update_or_create(
                user=request.user,
                defaults=serializer.validated_data
            )
            
            # Update onboarding step only if not already completed and if we are advancing
            # Logic: If user is at 'AcademicBackground', move to 'StudyGoal'.
            # If user is already at 'StudyGoal', 'Budget', 'ExamsAndReadiness', or 'Completed', do NOT change it back.
            if request.user.onboarding_step == 'AcademicBackground':
                request.user.onboarding_step = 'StudyGoal'
                request.user.save()
            
            # Invalidate AI Cache
            from .models import ProfileAICache
            ProfileAICache.objects.filter(user=request.user).update(recommendations=None, strength_data=None)

            # Only trigger AI if user is updating profile after already completing onboarding
            if request.user.onboarding_step == 'Completed':
                trigger_ai_task_generation(request.user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def study_goal_view(request):
    if request.method == 'GET':
        try:
            if hasattr(request.user, 'study_goal'):
                study_goal = request.user.study_goal
                serializer = StudyGoalSerializer(study_goal)
                return Response(
                    {
                        'status': 'success',
                        'data': serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response({'status': 'success', 'data': {}}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    try:
        serializer = StudyGoalSerializer(data=request.data)
        if serializer.is_valid():
            obj, created = StudyGoal.objects.update_or_create(
                user=request.user,
                defaults=serializer.validated_data
            )
            
            # Update onboarding step only if at the current step (StudyGoal)
            # If user is at 'Budget', 'ExamsAndReadiness', or 'Completed', preserve that progress.
            if request.user.onboarding_step == 'StudyGoal':
                request.user.onboarding_step = 'Budget'
                request.user.save()
            
            # Invalidate AI Cache
            from .models import ProfileAICache
            ProfileAICache.objects.filter(user=request.user).update(recommendations=None, strength_data=None)

            # Only trigger AI if user is updating profile after already completing onboarding
            if request.user.onboarding_step == 'Completed':
                trigger_ai_task_generation(request.user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def budget_view(request):
    if request.method == 'GET':
        try:
            if hasattr(request.user, 'budget'):
                budget = request.user.budget
                serializer = BudgetSerializer(budget)
                return Response(
                    {
                        'status': 'success',
                        'data': serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response({'status': 'success', 'data': {}}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    try:
        serializer = BudgetSerializer(data=request.data)
        if serializer.is_valid():
            obj, created = Budget.objects.update_or_create(
                user=request.user,
                defaults=serializer.validated_data
            )
            
            # Update onboarding step only if at the current step (Budget)
            if request.user.onboarding_step == 'Budget':
                request.user.onboarding_step = 'ExamsAndReadiness'
                request.user.save()
            
            # Invalidate AI Cache
            from .models import ProfileAICache
            ProfileAICache.objects.filter(user=request.user).update(recommendations=None, strength_data=None)

            # Only trigger AI if user is updating profile after already completing onboarding
            if request.user.onboarding_step == 'Completed':
                trigger_ai_task_generation(request.user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def exams_readiness_view(request):
    if request.method == 'GET':
        try:
            if hasattr(request.user, 'exams_readiness'):
                exams = request.user.exams_readiness
                serializer = ExamsAndReadinessSerializer(exams)
                return Response(
                    {
                        'status': 'success',
                        'data': serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response({'status': 'success', 'data': {}}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    try:
        serializer = ExamsAndReadinessSerializer(data=request.data)
        if serializer.is_valid():
            obj, created = ExamsAndReadiness.objects.update_or_create(
                user=request.user,
                defaults=serializer.validated_data
            )
            
            request.user.onboarding_step = 'Completed'
            request.user.save()
            
            # Invalidate AI Cache
            from .models import ProfileAICache
            ProfileAICache.objects.filter(user=request.user).update(recommendations=None, strength_data=None)

            # Use same logic: triggers because status IS now 'Completed'
            if request.user.onboarding_step == 'Completed':
                trigger_ai_task_generation(request.user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_onboading_status(request):
    try:
        return Response(
            {
                'status': 'success',
                'data': {
                    'onboarding_step': request.user.onboarding_step
                }
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tasks_view(request):
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user).order_by('is_completed', '-created_at')
        
        # Auto-generate tasks if none exist (Basic Logic)
        if not tasks.exists() and request.user.onboarding_step == 'Completed':
            # Create a basic profile dict for AI
            try:
                profile_data = ProfileSerializer(request.user).data
                generated_titles = generate_tasks_for_user(profile_data, "Building Profile")
                
                for title in generated_titles:
                    Task.objects.create(
                        user=request.user,
                        title=title,
                        task_type='PROFILE'
                    )
                # Re-fetch
                tasks = Task.objects.filter(user=request.user).order_by('is_completed', '-created_at')
            except Exception as e:
                print(f"Error generating tasks: {e}")

        serializer = TaskSerializer(tasks, many=True)
        return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Create a PERSONAL task
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, task_type='PERSONAL')
            return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail_view(request, task_id):
    try:
        task = Task.objects.get(id=task_id, user=request.user)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        # Toggle completion or update title
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Invalidate AI Cache
            from .models import ProfileAICache
            ProfileAICache.objects.filter(user=request.user).update(recommendations=None, strength_data=None)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        task.delete()
        return Response({'status': 'success', 'message': 'Task deleted'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_strength_view(request):
    try:
        from .models import ProfileAICache
        cache_obj, created = ProfileAICache.objects.get_or_create(user=request.user)
        
        if cache_obj.strength_data:
            return Response({'status': 'success', 'data': cache_obj.strength_data, 'cached': True})

        profile_data = ProfileSerializer(request.user).data
        strength_data = evaluate_profile_strength(profile_data)
        
        # Save to cache
        cache_obj.strength_data = strength_data
        cache_obj.save()
        
        return Response({'status': 'success', 'data': strength_data, 'cached': False})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def trigger_ai_task_generation(user):
    """
    Helper function to trigger AI task generation for a specific user.
    Can be called after profile updates or manually.
    """
    try:
        # Get user profile
        profile_data = ProfileSerializer(user).data
        
        # Get existing tasks to provide context to AI
        existing_tasks = Task.objects.filter(user=user).values_list('title', flat=True)
        
        # Determine stage
        current_stage = f"User is at {user.onboarding_step} stage"
        
        # Call AI service with acceptance-focused prompt
        generated_titles = generate_tasks_for_user(profile_data, current_stage, list(existing_tasks))
        
        new_tasks = []
        for title in generated_titles:
            # Avoid exact duplicates
            if not Task.objects.filter(user=user, title=title).exists():
                task = Task.objects.create(
                    user=user,
                    title=title,
                    task_type='PROFILE'
                )
                new_tasks.append(task)
        
        return new_tasks
    except Exception as e:
        print(f"Error in trigger_ai_task_generation: {str(e)}")
        return []

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_new_tasks_view(request):
    try:
        new_tasks = trigger_ai_task_generation(request.user)
        serializer = TaskSerializer(new_tasks, many=True)
        return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error generating new tasks: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def top_20_universities_view(request):
    try:
        # Construct path to the JSON file
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(base_dir, 'University_data', 'top_20_famous.json')
        
        if not os.path.exists(file_path):
             return Response({'error': 'Data file not found'}, status=status.HTTP_404_NOT_FOUND)

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Pagination
        page_num = request.GET.get('page', 1)
        paginator = Paginator(data, 5) # 5 items per page
        
        try:
            page_obj = paginator.page(page_num)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
            
        return Response({
            'status': 'success',
            'data': page_obj.object_list,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def university_recommendations_view(request):
    try:
        # 1. Provide recommendations based on profile using Groq AI
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(base_dir, 'University_data', 'university_data_by_rank.json')

        if not os.path.exists(file_path):
             return Response({'error': 'University data file not found'}, status=status.HTTP_404_NOT_FOUND)

        with open(file_path, 'r', encoding='utf-8') as f:
            all_countries_data = json.load(f)

        # Flatten list
        all_universities = []
        for country_data in all_countries_data:
            all_universities.extend(country_data.get('universities', []))
        
        # Pagination params
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 12))
        
        total_pool_size = 60 # Check top 60 relevant ones
        top_60_unis = sorted(all_universities, key=lambda x: x.get('rank', 9999))[:total_pool_size]

        # Check Cache
        from .models import ProfileAICache, ShortlistedUniversity
        cache_obj, created = ProfileAICache.objects.get_or_create(user=request.user)
        
        if not cache_obj.recommendations:
            # Prepare Profile Data
            profile_data = ProfileSerializer(request.user).data
            # Call AI Service for THE ENTIRE TOP 60 to cache classifications
            ai_response = get_university_recommendations(profile_data, top_60_unis)
            cache_obj.recommendations = ai_response
            cache_obj.save()
            is_cached = False
        else:
            ai_response = cache_obj.recommendations
            is_cached = True

        # Slicing for current page from the classified pool
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        current_batch = top_60_unis[start_idx:end_idx]
        has_next = end_idx < len(top_60_unis)

        if not current_batch:
             return Response({
                'status': 'success',
                'data': {'Dream': [], 'Target': [], 'Safe': []},
                'pagination': {'has_next': False, 'page': page}
            }, status=status.HTTP_200_OK)

        # Get user's current locked universities
        locked_unis = ShortlistedUniversity.objects.filter(user=request.user, is_locked=True).values_list('university_name', flat=True)
        locked_set = set(locked_unis)

        # Map classified indices back to objects for the current batch
        recommendations = {'Dream': [], 'Target': [], 'Safe': []}
        uni_lookup = {u.get('name'): u for u in current_batch}

        for category, uni_names in ai_response.items():
            if category in recommendations:
                for name in uni_names:
                    if name in uni_lookup:
                        uni_data = uni_lookup[name].copy()
                        uni_data['is_locked'] = name in locked_set
                        recommendations[category].append(uni_data)

        return Response({
            'status': 'success',
            'data': recommendations,
            'cached': is_cached,
            'locked_universities': list(locked_set),
            'pagination': {
                'has_next': has_next,
                'page': page,
                'next_page': page + 1 if has_next else None
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def university_evaluation_view(request):
    uni_name = request.query_params.get('name')
    if not uni_name:
        return Response({'error': 'University name parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Mock Evaluation Data
        # In real app, this would query a detailed DB or external API
        
        evaluation = {
            'university_name': uni_name,
            'fit_score': 'High',
            'why_it_fits': [
                "Strong program matches your study goal.",
                "Located in a prefered country."
            ],
            'key_risks': [
                "High cost of living area.",
                "Competitive acceptance rate."
            ],
            'cost_level': 'High', # Low, Medium, High
            'acceptance_chance': 'Medium', # Low, Medium, High
        }
        
        return Response({'status': 'success', 'data': evaluation}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shortlist_action_view(request):
    try:
        from .models import ShortlistedUniversity
        
        action = request.data.get('action') # 'lock', 'unlock'
        uni_name = request.data.get('university_name')
        category = request.data.get('category') # Dream, Target, Safe (needed for lock)
        country = request.data.get('country', 'Unknown')
        
        if not action or not uni_name:
             return Response({'error': 'Action and university_name are required'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'lock':
            # Check if another university is already locked
            existing_lock = ShortlistedUniversity.objects.filter(user=request.user, is_locked=True).exclude(university_name=uni_name).first()
            if existing_lock:
                return Response({
                    'status': 'error', 
                    'message': f'You can only lock one university at a time. Please unlock "{existing_lock.university_name}" first.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if already locked (same one)
            if ShortlistedUniversity.objects.filter(user=request.user, university_name=uni_name, is_locked=True).exists():
                return Response({'status': 'success', 'message': 'University already locked'})
            
            # Create or update
            ShortlistedUniversity.objects.update_or_create(
                user=request.user,
                university_name=uni_name,
                defaults={
                    'category': category,
                    'country': country,
                    'is_locked': True
                }
            )
            return Response({'status': 'success', 'message': f'Locked {uni_name}'})

        elif action == 'unlock':
             # Unlock logic
             try:
                 obj = ShortlistedUniversity.objects.get(user=request.user, university_name=uni_name)
                 obj.is_locked = False
                 obj.save()
                 # Optionally delete if we want "unlock" to mean "remove from shortlist"
                 # obj.delete() 
                 return Response({'status': 'success', 'message': f'Unlocked {uni_name}'})
             except ShortlistedUniversity.DoesNotExist:
                 return Response({'error': 'University not found in shortlist'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def google_login_callback(request):
    """
    Callback view that allauth redirects to after successful Google login.
    Generates JWT tokens for the authenticated user and redirects to frontend.
    """
    print(f"Callback reached. User: {request.user}")
    print(f"Is authenticated: {request.user.is_authenticated}")
    
    if not request.user.is_authenticated:
        print("User not authenticated in callback")
        return redirect('http://127.0.0.1:5173/login?error=Authentication failed')

    # Generate JWT tokens
    refresh = RefreshToken.for_user(request.user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    print(f"Tokens generated for {request.user.email}")

    # Redirect to frontend with tokens
    frontend_url = f"http://127.0.0.1:5173/login?access={access_token}&refresh={refresh_token}"
    return redirect(frontend_url)
