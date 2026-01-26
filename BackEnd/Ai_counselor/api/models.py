from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    REQUIRED_FIELDS = ["email", "first_name", "last_name"]

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self) -> str:
        return self.username

# class Task(models.Model):
#     user = models.ForeignKey(User, related_name="tasks", on_delete=models.CASCADE, verbose_name="Assigned User")
#     title = models.CharField(max_length=200, verbose_name="Task Title")
#     completed = models.BooleanField(default=False, verbose_name="Is Completed")
#     created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

#     class Meta:
#         verbose_name = 'Task'
#         verbose_name_plural = 'Tasks'
#         ordering = ['-created_at']  # Default ordering to show the latest tasks first

#     def __str__(self) -> str:
#         return self.title
