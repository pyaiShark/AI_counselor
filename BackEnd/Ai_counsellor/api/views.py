from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import redirect
from django.http.response import JsonResponse
from django.contrib.auth import authenticate, login, logout, get_user_model

from rest_framework_simplejwt.tokens import RefreshToken


from django.core.mail import send_mail, EmailMultiAlternatives
from email.mime.image import MIMEImage
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from decouple import config
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
from .models import User, AcademicBackground, StudyGoal, Budget, ExamsAndReadiness, Task, ShortlistedUniversity
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
            frontend_url = config('FRONTEND_URL', default='http://127.0.0.1:5173')
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            subject = "Password Reset Requested"
            html_message = render_to_string("password_reset_email.html", {"reset_link": reset_link})
            plain_message = strip_tags(html_message)

            # Create the email with inline logo attachment
            msg = EmailMultiAlternatives(subject, plain_message, settings.DEFAULT_FROM_EMAIL, [email])
            msg.attach_alternative(html_message, "text/html")

            # Attach the logo as an inline image (CID)
            logo_path = os.path.join(settings.BASE_DIR, 'api', 'static', 'api', 'logo.png')
            if os.path.exists(logo_path):
                with open(logo_path, 'rb') as f:
                    img = MIMEImage(f.read())
                    img.add_header('Content-ID', '<logo>')
                    msg.attach(img)
            
            msg.send()

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


def get_current_stage_data(user):
    """
    Helper to determine the granular application stage.
    Used by both status view and task generation.
    """
    from .models import ShortlistedUniversity
    
    onboarding_step = user.onboarding_step
    application_stage = 1 # Building Profile
    
    if onboarding_step == 'Completed':
        application_stage = 2 # Discovering Universities
        
        # If user has locked any university, they are in Stage 3
        if ShortlistedUniversity.objects.filter(user=user, is_locked=True).exists():
            application_stage = 3 # Finalizing Universities
            
    return {
        'onboarding_step': onboarding_step,
        'application_stage': application_stage
    }

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_onboarding_status(request):
    try:
        stage_data = get_current_stage_data(request.user)
        return Response(
            {
                'status': 'success',
                'data': stage_data
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
    Enforces a 5-7 task limit as requested.
    """
    try:
        # 1. Check current active tasks count
        active_tasks_count = Task.objects.filter(user=user, is_completed=False).count()
        
        # If user already has 5 or more active tasks, don't overwhelm them with more AI tasks
        # unless they intentionally requested them (manual regeneration).
        if active_tasks_count >= 5:
            print(f"Skipping task generation for {user.email}: already has {active_tasks_count} active tasks.")
            return []

        # 2. Get user profile
        profile_data = ProfileSerializer(user).data
        
        # 3. Get all existing tasks (completed or not) for context and deduplication
        existing_tasks = Task.objects.filter(user=user).values_list('title', flat=True)
        
        # 4. Determine granular stage
        stage_data = get_current_stage_data(user)
        application_stage_num = stage_data['application_stage']
        
        stage_names = {
            1: "Building Profile (Onboarding)",
            2: "Discovering Universities (Shortlisting)",
            3: "Finalizing Universities (Application Selection)",
            4: "Preparing Applications"
        }
        
        current_stage = f"User is at Stage {application_stage_num}: {stage_names.get(application_stage_num, 'Unknown')}"
        
        # 5. Call AI service - restricted to 3-5 items to stay within 7 total limit
        # Get locked universities for context
        from .models import ShortlistedUniversity
        locked_unis = ShortlistedUniversity.objects.filter(user=user, is_locked=True).values_list('university_name', flat=True)
        locked_context = list(locked_unis) if locked_unis else None
        
        generated_titles = generate_tasks_for_user(profile_data, current_stage, list(existing_tasks))
        
        new_tasks = []
        # Final safety check: Don't exceed 7 total active tasks
        max_to_add = 7 - active_tasks_count
        
        for title in generated_titles[:max_to_add]:
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
        from django.core.cache import cache
        
        # Debounce: AI call frequency limit (5 seconds)
        lock_key = f"ai_gen_lock_{request.user.id}"
        if cache.get(lock_key):
             # Skipping generation due to cooldown
             return Response({'status': 'skipped', 'data': []}, status=status.HTTP_200_OK)

        # Set lock for 5 seconds
        cache.set(lock_key, "true", timeout=5)

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

        # Get User's Preferred Country
        user_study_goal = getattr(request.user, 'study_goal', None)
        preferred_country = "United States" # Default or fallback
        if user_study_goal:
             # Basic handling assuming single country or comma separated
             preferred_country = user_study_goal.preferred_countries.split(',')[0].strip()

        # Flatten list - FILTER BY COUNTRY
        all_universities = []
        
        # KEY: Map common abbreviations to full names matching JSON
        country_mapping = {
            "uk": "United Kingdom",
            "usa": "United States",
            "us": "United States",
            "uae": "United Arab Emirates",
            "korea": "South Korea",
            "south korea": "South Korea"
        }
        
        normalized_pref = country_mapping.get(preferred_country.lower(), preferred_country)
        print(f"Preferred Country: {preferred_country} -> Normalized: {normalized_pref}")

        # 1. Exact/Fuzzy Match
        for country_data in all_countries_data:
            c_name = country_data.get('country', '')
            # Check normalized name
            if normalized_pref.lower() in c_name.lower() or c_name.lower() in normalized_pref.lower():
                 all_universities.extend(country_data.get('universities', []))
        
        # 2. Fallback if empty
        if not all_universities:
            print(f"No universities found for preference '{preferred_country}'. Falling back to United States.")
            for country_data in all_countries_data:
                if "united states" in country_data.get('country', '').lower():
                    all_universities.extend(country_data.get('universities', []))
            
            # If still empty, take everything
            if not all_universities:
                 print("Still empty! taking all universities.")
                 for country_data in all_countries_data:
                     all_universities.extend(country_data.get('universities', []))
        
        print(f"Found {len(all_universities)} universities for analysis.")

        # Pagination params
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 12))
        
        total_pool_size = 25 # Check top 25 relevant ones (Reduced to prevent AI token overflow)
        top_60_unis = sorted(all_universities, key=lambda x: x.get('rank', 9999))[:total_pool_size]
        print(f"Sending {len(top_60_unis)} universities to AI.")

        # Check Cache
        from .models import ProfileAICache, ShortlistedUniversity
        cache_obj, created = ProfileAICache.objects.get_or_create(user=request.user)
        
        if not cache_obj.recommendations:
            # Prepare Profile Data
            profile_data = ProfileSerializer(request.user).data
            print("profile data", profile_data)
            # Call AI Service for THE ENTIRE TOP 60 to cache classifications
            ai_response = get_university_recommendations(profile_data, top_60_unis)
            print("ai_response", ai_response)
            cache_obj.recommendations = ai_response
            cache_obj.save()
            is_cached = False
            print("is_cached", is_cached)
        else:
            ai_response = cache_obj.recommendations
            print("ai_response", ai_response)
            is_cached = True

        # Slicing for current page from the classified pool is TRICKY now because ai_response is dict of lists.
        # We need to flatten the response to paginate, OR paginate per category?
        # The user PROBABLY wants to see categorized lists.
        # But if the lists are long, we need pagination.
        # Let's simple combine them for pagination or return all if small enough?
        # The previous logic was extracting from `current_batch` which was raw unis.
        
        # NEW STRATEGY: 
        # The AI response contains objects: { "Dream": [ {name, reason...}, ...], ... }
        # We should return this structure directly, but maybe paginate within it? 
        # Or given the pool is only 60 total, maybe just return ALL of them? 60 items is not too big for modern frontend.
        # Let's return ALL recommendations found by AI matching the top 60. 
        # Pagination might be handled by frontend or we just return the full set.
        
        # However, to respect the existing signature, let's return the full set of AI categorized items.
        
        # Get user's current locked universities
        locked_unis = ShortlistedUniversity.objects.filter(user=request.user, is_locked=True).values_list('university_name', flat=True)
        locked_set = set(locked_unis)

        # Enhance AI response with local data (logo, domains etc) if needed
        # Create lookup from the top_60_unis
        uni_lookup = {u.get('name'): u for u in top_60_unis}
        
        final_recommendations = {'Dream': [], 'Target': [], 'Safe': []}
        
        for category, items in ai_response.items():
            if category in final_recommendations:
                for item in items: # item is now a dict {name, reason, ...}
                    name = item.get('name')
                    # Merge with basic info
                    if name in uni_lookup:
                        base_info = uni_lookup[name]
                        # Merge dicts
                        merged = {**base_info, **item} # AI data overwrites base if conflict (shouldn't be)
                        merged['is_locked'] = name in locked_set
                        final_recommendations[category].append(merged)

        return Response({
            'status': 'success',
            'data': final_recommendations,
            'cached': is_cached,
            'locked_universities': list(locked_set),
            # Pagination intentionally removed/simplified as we return the classified 60 set.
            # If frontend relies on it, we can conform, but for now this is better.
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
            # Check if user has reached the locking limit (10)
            locked_count = ShortlistedUniversity.objects.filter(user=request.user, is_locked=True).exclude(university_name=uni_name).count()
            if locked_count >= 10:
                return Response({
                    'status': 'error', 
                    'message': f'You can only lock up to 10 universities. Please unlock one of your existing {locked_count} universities first.'
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
            
            # LOCK ACTION: This changes the application stage from 2 to 3
            # We trigger task generation to provide Stage 3 guidance
            #trigger_ai_task_generation(request.user)
            print(trigger_ai_task_generation(request.user))
            
            return Response({'status': 'success', 'message': f'Locked {uni_name}'})

        elif action == 'unlock':
             # Unlock logic
             try:
                 obj = ShortlistedUniversity.objects.get(user=request.user, university_name=uni_name)
                 obj.is_locked = False
                 obj.save()
                 
                 # UNLOCK ACTION: This might reset the stage from 3 back to 2
                 trigger_ai_task_generation(request.user)
                 
                 return Response({'status': 'success', 'message': f'Unlocked {uni_name}'})
             except ShortlistedUniversity.DoesNotExist:
                 return Response({'error': 'University not found in shortlist'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def locked_universities_view(request):
    try:
        from .models import ShortlistedUniversity
        locked_unis = ShortlistedUniversity.objects.filter(user=request.user, is_locked=True)
        
        data = []
        for uni in locked_unis:
            data.append({
                'university_name': uni.university_name,
                'category': uni.category,
                'country': uni.country,
                'locked_at': uni.created_at
            })
            
        return Response({'status': 'success', 'data': data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_universities_view(request):
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(base_dir, 'University_data', 'university_data_by_rank.json')

        if not os.path.exists(file_path):
             return Response({'error': 'University data file not found'}, status=status.HTTP_404_NOT_FOUND)

        with open(file_path, 'r', encoding='utf-8') as f:
            all_countries_data = json.load(f)

        # Filters
        country_filter = request.query_params.get('country')
        rank_min = int(request.query_params.get('rank_min', 0))
        rank_max = int(request.query_params.get('rank_max', 10000))
        search_query = request.query_params.get('search', '').lower()

        filtered_universities = []
        for country_data in all_countries_data:
            c_name = country_data.get('country')
            if country_filter and country_filter.lower() not in c_name.lower():
                continue
            
            for uni in country_data.get('universities', []):
                # Rank Filter
                rank = uni.get('rank', 9999)
                if rank < rank_min or rank > rank_max:
                    continue
                
                # Search Filter
                if search_query and search_query not in uni.get('name', '').lower():
                    continue

                # Inject country name for UI
                uni['country'] = c_name
                filtered_universities.append(uni)

        # Sort by rank
        filtered_universities.sort(key=lambda x: x.get('rank', 9999))

        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 12))
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit

        current_batch = filtered_universities[start_idx:end_idx]
        has_next = end_idx < len(filtered_universities)

        # Mark locked
        from .models import ShortlistedUniversity
        locked_set = set(ShortlistedUniversity.objects.filter(user=request.user, is_locked=True).values_list('university_name', flat=True))

        for uni in current_batch:
            uni['is_locked'] = uni['name'] in locked_set

        return Response({
            'status': 'success',
            'data': current_batch,
            'total_count': len(filtered_universities),
            'pagination': {
                'has_next': has_next,
                'page': page,
                'next_page': page + 1 if has_next else None,
                'total_pages': (len(filtered_universities) + limit - 1) // limit
            }
        }, status=status.HTTP_200_OK)

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
    frontend_url = config('FRONTEND_URL', default='http://127.0.0.1:5173')
    return redirect(f"{frontend_url}/login?access={access_token}&refresh={refresh_token}")

def error_404_view(request, exception):
    return render(request, 'error.html', {
        'status_code': 404,
        'title': 'Page Not Found',
        'message': "The page you are looking for doesn't exist. Our AI counselors are recalculating the path!"
    }, status=404)

def error_500_view(request):
    return render(request, 'error.html', {
        'status_code': 500,
        'title': 'Server Error',
        'message': "Something went wrong on our end. We've alerted our technical counselors to fix it."
    }, status=500)
