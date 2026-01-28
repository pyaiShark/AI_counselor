from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("profile/", views.profile_view, name="profile"),

    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"), # Updated to login_view

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('forgot-password/', views.password_reset_request, name='password_reset_request'),
    path('reset-password/', views.password_reset, name='password_reset'),
    
    # Onboarding endpoints
    path('onboarding/academic/', views.academic_background_view, name='academic_background'),
    path('onboarding/study-goal/', views.study_goal_view, name='study_goal'),
    path('onboarding/budget/', views.budget_view, name='budget'),
    path('onboarding/exams/', views.exams_readiness_view, name='exams_readiness'),
    path('onboarding/status/', views.get_onboading_status, name='get_onboading_status'),
    
    # Dashboard / Task Routes
    path('tasks/', views.tasks_view, name='tasks'),
    path('tasks/generate/', views.generate_new_tasks_view, name='generate_tasks'),
    path('tasks/<int:task_id>/', views.task_detail_view, name='task_detail'),
    path('dashboard/strength/', views.profile_strength_view, name='profile_strength'),
    path('university/top-20/', views.top_20_universities_view, name='top_20_universities'),
    
    # University Shortlisting Flow
    path('universities/recommendations/', views.university_recommendations_view, name='university_recommendations'),
    path('universities/evaluate/', views.university_evaluation_view, name='university_evaluation'),
    path('universities/shortlist/', views.shortlist_action_view, name='shortlist_action'),
]