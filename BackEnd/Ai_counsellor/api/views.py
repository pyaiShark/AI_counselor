from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.http.response import JsonResponse
from django.contrib.auth import authenticate, login, logout, get_user_model

from rest_framework_simplejwt.tokens import RefreshToken


from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse
from django.conf import settings
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.template.loader import render_to_string


from .models import User, AcademicBackground, StudyGoal, Budget, ExamsAndReadiness
from .serializers import (
    UserSerializer, 
    PasswordResetRequestSerializer, 
    ProfileSerializer,
    AcademicBackgroundSerializer,
    StudyGoalSerializer,
    BudgetSerializer,
    ExamsAndReadinessSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    serializer = ProfileSerializer(request.user)
    #print("Profile-Data------", serializer.data)
    return Response(serializer.data, status=status.HTTP_200_OK)


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

            # Prepare the reset link
            reset_link = f"{request.build_absolute_uri('/reset-password/')}?uid={uid}&token={token}"
            subject = "Password Reset Requested"
            html_message = render_to_string("password_reset_email.html", {"reset_link": reset_link})
            plain_message = strip_tags(html_message)

            # Send the email
            send_mail(subject, plain_message, settings.DEFAULT_FROM_EMAIL, [email], html_message=html_message)

            return Response({"detail": "Password reset email has been sent."}, status=status.HTTP_200_OK)
        except UserModel.DoesNotExist:
            return Response({"error": "No user with this email found."}, status=status.HTTP_404_NOT_FOUND)
    
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
