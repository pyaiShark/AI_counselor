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


from .models import User
from .serializers import UserSerializer, PasswordResetRequestSerializer


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_view(request):
#     tasks = Task.objects.filter(user=request.user).order_by('-id')
#     if tasks:
#         serializer = TaskSerializers(tasks, many=True)
#         return Response(serializer.data)
#     else: return Response([], status=status.HTTP_204_NO_CONTENT)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add(request):
#     serializer = TaskSerializers(data=request.data)
#     if serializer.is_valid():
#         k = serializer.save(user=User.objects.get(username=request.user))
#         return Response(status=status.HTTP_201_CREATED)
#     return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def update(request, pk):
#     task = Task.objects.filter(user=request.user).get(id=pk)
#     if task.completed:
#         task.completed = False
#     else: task.completed = True
#     task.save()
#     return Response("success", status=status.HTTP_200_OK)

# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def delete(request, pk):
#     try:
#         task = Task.objects.filter(user=request.user).get(id=pk)
#         task.delete()
#         return Response("Task Deleted!", status=status.HTTP_204_NO_CONTENT)
#     except Exception:
#         return Response(status=status.HTTP_401_UNAUTHORIZED)


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
        user = authenticate(request, username=user.username, password=password)  # Use username for authentication

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

    except Exception:
        return JsonResponse({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)