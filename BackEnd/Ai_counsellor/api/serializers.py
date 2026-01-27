from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import User

# # class TaskSerializers(serializers.ModelSerializer):
# #     class Meta:
# #         model = Task
# #         fields = ["id", "title", "completed", "created_at"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        UserModel = get_user_model()
        if not UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email found.")
        return value