from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import User, AcademicBackground, StudyGoal, Budget, ExamsAndReadiness, Task


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "onboarding_step"]
        extra_kwargs = {
            "password": {
                "write_only": True,  # password is write-only
                "required": True,    # password required during creation
            }
        }

    def validate_email(self, value):
        UserModel = get_user_model()
        if UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already exist, try login")
        return value
    
    def create(self, validated_data):
        # Hash the password before saving it
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class AcademicBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicBackground
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class StudyGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGoal
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class ExamsAndReadinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamsAndReadiness
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        UserModel = get_user_model()
        if not UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email doesn't exist. Please try to sign up.")
        return value
        
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'is_completed', 'task_type']
        read_only_fields = ['id', 'task_type']
        
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'is_completed', 'task_type']
        read_only_fields = ['id', 'task_type']

class ProfileSerializer(serializers.ModelSerializer):
    academic_background = AcademicBackgroundSerializer(read_only=True)
    study_goal = StudyGoalSerializer(read_only=True)
    budget = BudgetSerializer(read_only=True)
    exams_readiness = ExamsAndReadinessSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "email", "first_name", "last_name", "date_joined", "onboarding_step",
            "academic_background", "study_goal", "budget", "exams_readiness"
        ]