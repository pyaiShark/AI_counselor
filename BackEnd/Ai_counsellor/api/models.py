from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)  # Add unique email field
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    ONBOARDING_STEP_CHOICES = [
        ('AcademicBackground', 'AcademicBackground'),
        ('StudyGoal', 'StudyGoal'),
        ('Budget', 'Budget'),
        ('ExamsAndReadiness', 'ExamsAndReadiness'),
        ('Completed', 'Completed'),
    ]
    onboarding_step = models.CharField(
        max_length=50, 
        choices=ONBOARDING_STEP_CHOICES, 
        default='AcademicBackground'
    )

    USERNAME_FIELD = 'email'  # Set email as the unique identifier
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Specify other required fields

    objects = CustomUserManager()  # Link the custom user manager

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}" 


class Task(models.Model):
    TASK_TYPES = [
        ('PROFILE', 'Profile Building'),
        ('UNIVERSITY', 'University Shortlisting'),
        ('APPLICATION', 'Application Process'),
        ('PERSONAL', 'Personal'),
    ]

    user = models.ForeignKey(User, related_name="tasks", on_delete=models.CASCADE, verbose_name="Assigned User")
    title = models.CharField(max_length=255, null=True)
    is_completed = models.BooleanField(default=False)
    task_type = models.CharField(max_length=20, choices=TASK_TYPES, default='PERSONAL')
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"

class AcademicBackground(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='academic_background')
    education_level = models.CharField(max_length=100, blank=False, null=False)
    degree_major = models.CharField(max_length=255, blank=False, null=False)
    graduation_year = models.PositiveIntegerField(null=False, blank=False)
    gpa = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} - Academic"

class StudyGoal(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='study_goal')
    intended_degree = models.CharField(max_length=100, blank=False, null=False)
    field_of_study = models.CharField(max_length=255, blank=False, null=False)
    target_intake = models.CharField(max_length=50, blank=False, null=False)
    preferred_countries = models.CharField(max_length=255, blank=False, null=False)

    def __str__(self):
        return f"{self.user.email} - Study Goal"

class Budget(models.Model):
    FUNDING_CHOICES = [
        ('Self-funded', 'Self-funded'),
        ('Scholarship-dependent', 'Scholarship-dependent'),
        ('Loan-dependent', 'Loan-dependent'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='budget')
    budget_range = models.CharField(max_length=100, blank=False, null=False)
    funding_plan = models.CharField(max_length=100, choices=FUNDING_CHOICES, blank=False, null=False)

    def __str__(self):
        return f"{self.user.email} - Budget"

class ExamsAndReadiness(models.Model):
    SOP_CHOICES = [
        ('Not started', 'Not started'),
        ('Draft', 'Draft'),
        ('Ready', 'Ready'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='exams_readiness')
    ielts_toefl_status = models.CharField(max_length=100, blank=True, null=True)
    ielts_toefl_score = models.CharField(max_length=50, blank=True, null=True)
    gre_gmat_status = models.CharField(max_length=100, blank=True, null=True)
    gre_gmat_score = models.CharField(max_length=50, blank=True, null=True)
    sop_status = models.CharField(max_length=100, choices=SOP_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} - Exams & Readiness"

class ShortlistedUniversity(models.Model):
    CATEGORY_CHOICES = [
        ('Dream', 'Dream'),
        ('Target', 'Target'),
        ('Safe', 'Safe'),
    ]

    user = models.ForeignKey(User, related_name="shortlisted_universities", on_delete=models.CASCADE)
    university_name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    is_locked = models.BooleanField(default=False)
    data = models.JSONField(null=True, blank=True)  # Snapshot of university data
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.university_name} ({self.category})"